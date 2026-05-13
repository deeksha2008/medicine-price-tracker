import pandas as pd
import os
import random

def scrape_onemg(query):
    try:
        data_path = os.path.join(os.path.dirname(__file__), "..", "ml_service", "data", "medicine_dataset.csv")
        if not os.path.exists(data_path): return []
        
        df = pd.read_csv(data_path)
        search_key = query.lower().strip().split()[0]
        match = df[(df['medicine_name'].str.lower().str.contains(search_key, na=False)) & (df['platform'] == 'Tata 1mg')]
        
        if match.empty: return []
        
        # Get the latest simulated price (day 30)
        base_price = match.iloc[-1]['price']
        
        # Add slight live fluctuation
        live_price = round(base_price * random.uniform(0.98, 1.02), 2)
        
        return [
            {"name": match.iloc[0]['medicine_name'], "price": live_price, "platform": "Tata 1mg"}
        ]
    except Exception as e:
        print(f"Tata 1mg scrape failed: {e}")
        return []
