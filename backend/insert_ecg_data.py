import pandas as pd
import uuid
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

print(" Starting ECG Data Insertion...")

try:
    MONGO_URI = os.getenv("MONGO_URI")
    client = MongoClient(MONGO_URI)

    ecg_db = client["ecg_data"]
    ecg_collection = ecg_db["ecg_records"]

    print(" MongoDB Connection Established.")

    csv_file_path = "Formatted_ECG_CSV_Data.csv"
    print(f" Attempting to load CSV: {csv_file_path}")

    df = pd.read_csv(csv_file_path)
    print(f" CSV Loaded: {len(df)} rows found.")

    df["ecg_signal"] = df["ecg_signal"].apply(lambda x: list(map(float, x.split(","))))
    df["_id"] = df.apply(lambda _: str(uuid.uuid4()), axis=1)

    data = df.to_dict(orient="records")

    if data:
        result = ecg_collection.insert_many(data)
        print(f" Inserted {len(result.inserted_ids)} records.")
    else:
        print("No data to insert.")

except Exception as e:
    print(f" Unexpected Error: {e}")
