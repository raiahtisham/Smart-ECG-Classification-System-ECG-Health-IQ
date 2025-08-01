import os

from tensorflow.keras.models import load_model
from dotenv import load_dotenv
from pymongo import MongoClient
from bson.objectid import ObjectId

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
print(" Loaded Mongo URI:", MONGO_URI)

# === MongoDB Connection ===
try:
    client = MongoClient(MONGO_URI)
    client.admin.command('ping')
    print(" MongoDB Connection Established")
except Exception as e:
    print(f" MongoDB connection failed: {e}")
    client = None

# === Load Keras ECG Model ===
def get_model():
    model_path = os.path.join(os.path.dirname(__file__), "saved_model", "CNN_LSTM.keras")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f" Model not found at {model_path}")

    print(f" Loading Keras model from: {model_path}")
    model = load_model(model_path, compile=False)
    print(" Keras model loaded successfully")
    model.summary()
    return model

# === MongoDB Collections ===
if client is not None:
    user_db = client["user_auth"]
    users_collection = user_db["users"]
    consult_requests_collection = user_db["consult_requests"]

    ecg_db = client["ecg_data"]
    ecg_collection = ecg_db["ecg_records"]

    # === Indexes for performance ===
    try:
        ecg_collection.create_index("email")
        ecg_collection.create_index([("email", 1), ("timestamp", -1)])
        users_collection.create_index("email", unique=True)
        print(" Indexes created successfully")
    except Exception as e:
        print(f" Failed to create indexes: {e}")
else:
    users_collection = None
    consult_requests_collection = None
    ecg_collection = None

# === Helper Functions ===
def find_user_by_email(email):
    try:
        return users_collection.find_one({'email': email.lower()}) if users_collection is not None else None
    except Exception as e:
        print(f" Error finding user by email: {e}")
        return None

def find_user_by_name(name):
    try:
        return users_collection.find_one({'name': name}) if users_collection else None
    except Exception as e:
        print(f" Error finding user by name: {e}")
        return None

def insert_user(name, email, hashed_password, age=None, gender=None, medical_history=None, latest_ecg_result=None):
    try:
        if users_collection is not None:
            users_collection.insert_one({
                '_id': (ObjectId()),
                'name': name,
                'email': email.lower(),
                'password': hashed_password,
                'age': age,
                'gender': gender,
                "role":"patient",
                'medical_history': medical_history or [],
                'latest_ecg_result': latest_ecg_result
            })
            print(f" User {name} inserted successfully.")
    except Exception as e:
        print(f" Error inserting user: {e}")

def insert_doctor(name, email, hashed_password, age, gender, specialization, contact):
    try:
        if users_collection is not None:
            users_collection.insert_one({
                '_id': str(ObjectId()),
                'name': name,
                'email': email.lower(),
                'password': hashed_password,
                'age': age,
                'gender': gender,
                'specialization': specialization,
                'contact': contact,
            })
            print(f" Doctor {name} inserted successfully.")
    except Exception as e:
        print(f" Error inserting doctor: {e}")

def is_database_connected():
    try:
        if client:
            client.admin.command('ping')
            return True
        return False
    except Exception as e:
        print(f" Ping failed: {e}")
        return False
