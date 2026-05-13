import pandas as pd
import numpy as np
import pickle
import os
from sklearn.linear_model import LinearRegression, LogisticRegression

print("Starting model retraining...")

os.makedirs("models", exist_ok=True)
data_path = os.path.join(os.path.dirname(__file__), "data", "medicine_dataset.csv")

if not os.path.exists(data_path):
    print(f"Error: Dataset not found at {data_path}")
    exit(1)

df = pd.read_csv(data_path)

# 1. Price Trend Model (Predict next day price based on current day and base price)
print("Retraining price predictor...")
X_price = df[['day', 'price']].values
y_price = df['price'].values * (1 + (np.random.rand(len(df)) * 0.05 - 0.02)) # simulate slightly changing next day price
price_model = LinearRegression()
price_model.fit(X_price, y_price)

with open("models/price_model.pkl", "wb") as f:
    pickle.dump(price_model, f)
print("Price predictor saved")

# 2. Stockout Detector Model
print("Retraining stockout detector...")
# Features: day, price, platform_encoded
df['platform_encoded'] = df['platform'].astype('category').cat.codes
X_stock = df[['day', 'price', 'platform_encoded']].values
y_stock = df['is_stockout'].values

stockout_model = LogisticRegression(max_iter=1000)
stockout_model.fit(X_stock, y_stock)

with open("models/stockout_model.pkl", "wb") as f:
    pickle.dump(stockout_model, f)
print("Stockout detector saved")

print("All models retrained successfully!")