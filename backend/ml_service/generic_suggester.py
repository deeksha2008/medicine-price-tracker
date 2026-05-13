import logging
import pandas as pd
import os

logger = logging.getLogger(__name__)

def suggest_generic(medicine: str):
    try:
        data_path = os.path.join(os.path.dirname(__file__), "data", "medicine_dataset.csv")
        if not os.path.exists(data_path):
            return {"error": "Dataset not found"}
        
        df = pd.read_csv(data_path)
        
        # Search dataset for medicine
        search_key = medicine.lower().strip().split()[0]
        match = df[df['medicine_name'].str.lower().str.contains(search_key, na=False)]
        
        if not match.empty:
            generic_name = match.iloc[0]['generic_name']
            # Find base generic price across all platforms
            generic_matches = df[df['generic_name'] == generic_name]
            avg_price = round(generic_matches['price'].mean() * 0.4, 2) # Generics are cheaper
            
            return {
                "medicine": medicine,
                "found": True,
                "generic_name": generic_name,
                "avg_price": avg_price,
                "message": f"Generic available at ~₹{avg_price}"
            }

        return {
            "medicine": medicine,
            "found": False,
            "message": "No generic alternative found"
        }

    except Exception as e:
        logger.error(f"Generic suggestion failed: {e}")
        return {"error": str(e)}