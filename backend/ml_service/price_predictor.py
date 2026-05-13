import numpy as np
import pickle
import os
import logging
import pandas as pd

logger = logging.getLogger(__name__)

def predict_price(medicine: str, platform: str):
    try:
        model_path = os.path.join(os.path.dirname(__file__), "models", "price_model.pkl")
        data_path = os.path.join(os.path.dirname(__file__), "data", "medicine_dataset.csv")
        
        if not os.path.exists(model_path) or not os.path.exists(data_path):
            return {"error": "Model or dataset not found"}
            
        with open(model_path, "rb") as f:
            model = pickle.load(f)
            
        df = pd.read_csv(data_path)
        search_key = medicine.lower().strip().split()[0]
        match = df[(df['medicine_name'].str.lower().str.contains(search_key, na=False)) & (df['platform'] == platform)]
        
        if match.empty:
            base_price = 100.0 # Default
        else:
            base_price = match.iloc[-1]['price']

        next_days = np.array([31, 32, 33, 34, 35, 36, 37]).reshape(-1, 1)
        # Using the base_price as feature 2 instead of just days
        X_pred = np.column_stack((next_days, np.full(7, base_price)))
        predictions = model.predict(X_pred)

        trend = "rising" if predictions[-1] > predictions[0] else "stable"

        return {
            "medicine": medicine,
            "platform": platform,
            "next_7_days_prices": [round(p, 2) for p in predictions.tolist()],
            "trend": trend,
            "confidence": "high"
        }

    except Exception as e:
        logger.error(f"Price prediction failed: {e}")
        return {"error": str(e)}