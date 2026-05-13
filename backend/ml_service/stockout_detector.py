import pickle
import os
import logging
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

def predict_stockout(medicine: str, platform: str):
    try:
        model_path = os.path.join(os.path.dirname(__file__), "models", "stockout_model.pkl")
        data_path = os.path.join(os.path.dirname(__file__), "data", "medicine_dataset.csv")
        
        if not os.path.exists(model_path) or not os.path.exists(data_path):
            return {"error": "Model or dataset not found"}
            
        with open(model_path, "rb") as f:
            model = pickle.load(f)
            
        df = pd.read_csv(data_path)
        platforms = ["Apollo Pharmacy", "Netmeds", "PharmEasy", "Tata 1mg"]
        if platform not in platforms: platform = "PharmEasy"
        platform_encoded = platforms.index(platform)
        
        search_key = medicine.lower().strip().split()[0]
        match = df[(df['medicine_name'].str.lower().str.contains(search_key, na=False)) & (df['platform'] == platform)]
        
        if match.empty:
            base_price = 100.0
        else:
            base_price = match.iloc[-1]['price']
            
        # Predict based on day 31, base_price, platform
        X_pred = np.array([[31, base_price, platform_encoded]])
        prob = model.predict_proba(X_pred)[0][1]
        
        risk_score = prob

        if risk_score > 0.4:
            risk_level = "High"
        elif risk_score > 0.2:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        return {
            "medicine": medicine,
            "platform": platform,
            "risk_percentage": round(risk_score * 100, 2),
            "risk_level": risk_level,
            "message": f"Based on live predictive modeling for {platform}"
        }

    except Exception as e:
        logger.error(f"Stockout prediction failed: {e}")
        return {"error": str(e)}