import pandas as pd
import uuid
from urllib.parse import unquote
import os

import numpy as np
import logging
import traceback



import numpy as np


from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from werkzeug.utils import secure_filename


from datetime import datetime as dt
from datetime import timezone
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from flask import send_file





from bson import ObjectId
from bson.errors import InvalidId
from model import (
    get_model, is_database_connected, insert_user, insert_doctor, find_user_by_email,
    users_collection, ecg_collection, consult_requests_collection
)

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Load pre-trained ECG model
model = get_model()
logger.info("Pre-trained model loaded successfully!")

# --- Database Connection Checking ---
print("Checking database connection from app.py...")
try:
    if ecg_collection is not None:
        print("Collections in ecg_data:", ecg_collection.database.list_collection_names())
        print("Total records in ecg_records:", ecg_collection.count_documents({}))
    else:
        print(" ecg_collection is None (MongoDB connection issue).")
except Exception as e:
    print(" MongoDB connection issue:", e)

# Constants
REQUIRED_LENGTH = 9000
TRAIN_MIN = -7735.0
TRAIN_MAX = 8257.0
LABELS = ["Normal", "Atrial Fibrillation", "Other", "Noisy"]
# === Utility: Prepare PyTorch Input Tensor ===

    
# --- Routes ---

@app.route('/')
def home():
    return "Welcome to the ECG Classification API. Use the /classify endpoint to classify ECG signals."

@app.route('/test', methods=['GET'])
def test():
    try:
        db_status = is_database_connected()
        return jsonify({'message': 'API is working!', 'database_connected': db_status})
    except Exception as e:
        logger.error(f"Error during test endpoint: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/load_csv', methods=['POST'])
def load_csv():
    try:
        csv_file_path = "Formatted_New_ECG_Data.csv"
        df = pd.read_csv(csv_file_path)
        df["ecg_signal"] = df["ecg_signal"].apply(lambda x: list(map(float, x.split(","))))
        df["_id"] = df.apply(lambda _: str(uuid.uuid4()), axis=1)
        data = df.to_dict(orient="records")

        if data:
            insert_result = ecg_collection.insert_many(data)
            return jsonify({'message': f'Successfully inserted {len(insert_result.inserted_ids)} records into MongoDB.'}), 201
        else:
            return jsonify({'error': 'No data found to insert.'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_ecg_data', methods=['GET'])
def get_ecg_data():
    try:
        email = request.args.get("email")
        if not email:
            return jsonify({"error": "Missing email"}), 400

        records = ecg_collection.find({"email": email}).sort("timestamp", -1)
        ecg_data = []

        for record in records:
            record["_id"] = str(record["_id"])  # Convert ObjectId to string
            record["timestamp"] = str(record.get("timestamp", ""))  # Ensure timestamp is serializable
            ecg_data.append(record)

        return jsonify({"ecg_data": ecg_data}), 200

    except Exception as e:
        return jsonify({"error": "Server error", "details": str(e)}), 500


@app.route('/store_ecg_signal', methods=['POST'])
def store_ecg_signal():
    try:
        # Parse incoming request data
        data = request.get_json()
        email = data.get("email")
        ecg_signal = data.get("ecg_signal")

        # Validate the data
        if not email or not ecg_signal:
            return jsonify({"error": "Email and ECG signal are required."}), 400

        # Store ECG signal in the MongoDB collection
        ecg_record = {
            "email": email,
            "ecg_signal": ecg_signal,
            "timestamp": dt.utcnow().isoformat(),
        }

        result = ecg_collection.insert_one(ecg_record)  # Insert ECG data into MongoDB

        return jsonify({
            "message": "ECG signal stored successfully.",
            "record_id": str(result.inserted_id),
        }), 200

    except Exception as e:
        logging.error(f"Error storing ECG signal: {e}")
        return jsonify({"error": "Internal server error"}), 500

# @app.route('/upload_csv_text', methods=['POST'])
# def upload_csv_text():
#     try:
#         data = request.get_json()
#         csv_text = data.get('csv_text')
#         email = data.get('email')

#         if not csv_text:
#             return jsonify({'error': 'No CSV content received'}), 400

#         from io import StringIO
#         df = pd.read_csv(StringIO(csv_text), header=None)
#         ecg_signal = df.values.flatten().tolist()

#         ecg_signal = ecg_signal[:REQUIRED_LENGTH] + [0] * (REQUIRED_LENGTH - len(ecg_signal))
#         ecg_signal = np.array(ecg_signal, dtype=np.float32)

#         if np.min(ecg_signal) < -1 or np.max(ecg_signal) > 1:
#             ecg_scaled = (ecg_signal - TRAIN_MIN) / (TRAIN_MAX - TRAIN_MIN)
#             ecg_scaled = 2 * ecg_scaled - 1
#         else:
#             ecg_scaled = ecg_signal

#         ecg_scaled = ecg_scaled.reshape(1, REQUIRED_LENGTH, 1)
#         probs = model.predict(ecg_scaled)[0]
#         predicted_index = int(np.argmax(probs))
#         classification = LABELS[predicted_index]
#         confidence = float(np.max(probs))

#         print(f" Softmax probs: {probs}")
#         print(f" Predicted class: {classification} with confidence {confidence:.4f}")

#         if email:
#             ecg_collection.insert_one({
#                 'email': email,
#                 'timestamp': dt.now(),
#                 'ecg_signal': ecg_signal.tolist(),
#                 'source': 'uploaded_csv_text',
#                 'test_result': classification,
#                 'confidence': confidence
#             })

#             users_collection.update_one(
#                 {'email': email},
#                 {
#                     '$set': {'latest_ecg_result': classification},
#                     '$push': {'ecg_results': {'result': classification, 'timestamp': dt.now()}}
#                 },
#                 upsert=True
#             )

#         return jsonify({
#             'classification': classification,
#             'confidence': confidence,
#             'message': 'CSV processed successfully.'
#         })

#     except Exception as e:
#         logger.error(f" Error in upload_csv_text: {traceback.format_exc()}")
#         return jsonify({'error': str(e)}), 500
   
@app.route('/upload_csv_text', methods=['POST'])
def upload_csv_text():
    try:
        data = request.get_json()
        csv_text = data.get('csv_text')
        email = data.get('email')

        if not csv_text:
            return jsonify({'error': 'No CSV content received'}), 400

        from io import StringIO
        df = pd.read_csv(StringIO(csv_text), header=None)
        ecg_signal = df.values.flatten().tolist()

        # Trim or pad to exactly 9000
        ecg_signal = ecg_signal[:REQUIRED_LENGTH] + [0] * (REQUIRED_LENGTH - len(ecg_signal))
        ecg_signal = np.array(ecg_signal, dtype=np.float32)

        #  Normalize only if outside [-1, 1]
        if np.min(ecg_signal) < -1 or np.max(ecg_signal) > 1:
            ecg_scaled = (ecg_signal - TRAIN_MIN) / (TRAIN_MAX - TRAIN_MIN)
            ecg_scaled = 2 * ecg_scaled - 1
        else:
            ecg_scaled = ecg_signal

        #  Reshape directly to [1, 9000, 1] for Keras Conv1D

        ecg_scaled = ecg_scaled.reshape(1, REQUIRED_LENGTH, 1)
        probs = model.predict(ecg_scaled)[0]


        predicted_index = int(np.argmax(probs))
        classification = LABELS[predicted_index]
        confidence = float(np.max(probs))

        print(f" Softmax probs: {probs}")
        print(f" Predicted class: {classification} with confidence {confidence:.4f}")

        if email:
            ecg_collection.insert_one({
                'email': email,
                'timestamp': dt.now(),
                'ecg_signal': ecg_signal.tolist(),
                'source': 'uploaded_csv_text',
                'classification': classification
            })

            users_collection.update_one(
                {'email': email},
                {
                    '$set': {'latest_ecg_result': classification},
                    '$push': {'ecg_results': {'result': classification, 'timestamp': dt.now()}}
                },
                upsert=True
            )

        return jsonify({
            'classification': classification,
            'confidence': confidence,
            'message': 'CSV processed successfully.'
        })

    except Exception as e:
        logger.error(f" Error in upload_csv_text: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500
# @app.route('/classify', methods=['POST'])
# def classify_ecg():
#     try:
#         print(" Received /classify request")
#         data = request.json
#         email = data.get('email')
#         ecg_signal = data.get('ecg_signal')
#         record_id = data.get("record_id")

#         if not email or not ecg_signal:
#             print(" Missing email or ECG signal")
#             return jsonify({'error': 'Email and ECG signal are required.'}), 400

#         ecg_signal = list(ecg_signal)
#         signal_len = len(ecg_signal)
#         print(f" Email: {email}")
#         print(f" ECG signal length: {signal_len}")

#         # Pad or trim the signal to REQUIRED_LENGTH
#         if signal_len < REQUIRED_LENGTH:
#             print(f" Signal too short ({signal_len}), padding with zeros")
#             ecg_signal += [0] * (REQUIRED_LENGTH - signal_len)
#         elif signal_len > REQUIRED_LENGTH:
#             print(f" Signal too long ({signal_len}), trimming to {REQUIRED_LENGTH}")
#             ecg_signal = ecg_signal[:REQUIRED_LENGTH]

#         ecg_signal = np.array(ecg_signal, dtype=np.float32)

#         # Normalize only if outside [-1, 1]
#         if np.min(ecg_signal) < -1 or np.max(ecg_signal) > 1:
#             print("Signal not scaled. Applying MinMax normalization.")
#             ecg_signal = (ecg_signal - TRAIN_MIN) / (TRAIN_MAX - TRAIN_MIN)
#             ecg_signal = 2 * ecg_signal - 1
#         else:
#             print(" Signal already scaled to [-1, 1].")

#         ecg_signal = ecg_signal.reshape(1, REQUIRED_LENGTH, 1)
#         print(f" Reshaped signal to: {ecg_signal.shape}")

#         # Predict
#         probs = model.predict(ecg_signal)[0]
#         predicted_index = int(np.argmax(probs))
#         classification = LABELS[predicted_index]
#         confidence = float(np.max(probs))

#         print(f" Softmax probs: {probs}")
#         print(f" Predicted: {classification} ({confidence:.4f})")

#         # Save to user profile
#         result_record = {
#             'result': classification,
#             'confidence': confidence,
#             'timestamp': dt.now().isoformat()
#         }
        
#         update_result = users_collection.update_one(
#             {'email': email},
#             {
#                 '$set': {'latest_ecg_result': classification},
#                 '$push': {'ecg_results': result_record}
#             },
#             upsert=True
#         )
#         print(f" User update: modified_count = {update_result.modified_count}")

#         # Optional: Update ECG record if record_id provided
#         if record_id:
#             try:
#                 # Try using ObjectId
#                 try:
#                     object_id = ObjectId(record_id)
#                     filter_query = {"_id": object_id, "email": email}
#                     print(" record_id is a valid ObjectId")
#                 except (InvalidId, TypeError):
#                     filter_query = {"record_id": record_id, "email": email}
#                     print(" record_id is treated as UUID")
#                 print(f" Trying to update record with ID: {record_id}")
#                 updated = ecg_collection.update_one(
#                     filter_query,
#                     {
#                         "$set": {
#                             "test_result": classification,
#                             "confidence": confidence,
#                             "classified_at": dt.now(timezone.utc).isoformat()
#                         }
#                     }
#                 )

#                 if updated.modified_count == 0:
#                     print(f" No matching ECG record found for update.")
#                 else:
#                     print(f" Updated ECG record with classification result.")

#             except Exception as e:
#                 print(f" Failed to update ecg_collection: {e}")

#         return jsonify({
#             'classification': classification,
#             'confidence': confidence
#         }), 200

#     except Exception as e:
#         print(" Exception during classification:")
#         traceback.print_exc()
#         return jsonify({'error': f'Classification failed: {str(e)}'}), 500

@app.route('/classify', methods=['POST'])
def classify_ecg():
    try:
        print(" Received /classify request")
        data = request.json
        email = data.get('email')
        ecg_signal = data.get('ecg_signal')
        record_id = data.get("record_id")

        if not email or not ecg_signal:
            print(" Missing email or ECG signal")
            return jsonify({'error': 'Email and ECG signal are required.'}), 400

        ecg_signal = list(ecg_signal)
        signal_len = len(ecg_signal)
        print(f" Email: {email}")
        print(f" Received ECG signal of length: {signal_len}")

        if signal_len < REQUIRED_LENGTH:
            print(f" Signal too short ({signal_len}), padding with zeros")
            ecg_signal += [0] * (REQUIRED_LENGTH - signal_len)
        elif signal_len > REQUIRED_LENGTH:
            print(f" Signal too long ({signal_len}), trimming to {REQUIRED_LENGTH}")
            ecg_signal = ecg_signal[:REQUIRED_LENGTH]

        ecg_signal = np.array(ecg_signal, dtype=np.float32)

        # Step 2: Normalize if needed
        if np.min(ecg_signal) < -1 or np.max(ecg_signal) > 1:
            print(" Signal not scaled. Applying MinMax normalization.")
            ecg_signal = (ecg_signal - TRAIN_MIN) / (TRAIN_MAX - TRAIN_MIN)
            ecg_signal = 2 * ecg_signal - 1
        else:
            print(" Signal already scaled to [-1, 1]. Skipping normalization.")

        # Step 3: Reshape
        ecg_signal = ecg_signal.reshape(1, REQUIRED_LENGTH, 1)
        print(f" Reshaped signal to: {ecg_signal.shape}")

        # Step 4: Predict
        probs = model.predict(ecg_signal)[0]
        predicted_index = int(np.argmax(probs))
        classification = LABELS[predicted_index]
        confidence = float(np.max(probs))
        print(f" Softmax probs: {probs}")
        print(f" Predicted class: {classification} with confidence {confidence:.4f}")

        # Step 5: Save result to DB
        result_record = {
            'result': classification,
            'confidence': confidence,
            'timestamp': dt.now().isoformat()
        }

        update_result = users_collection.update_one(
            {'email': email},
            {
                '$set': {'latest_ecg_result': classification},
                '$push': {'ecg_results': result_record}
            },
            upsert=True
        )

        print(f" MongoDB user update: modified_count = {update_result.modified_count}")

        if record_id:
            try:
                updated = ecg_collection.update_one(
                    {"_id": ObjectId(record_id), "email": email},
                    {
                        "$set": {
                            "test_result": classification,
                            "confidence": confidence,
                            "classified_at": dt.now(timezone.utc).isoformat()
                        }
                    }
                )
                if updated.modified_count == 0:
                    print(f" No matching ECG record found for update.")
                else:
                    print(f" Updated ECG record {record_id} with classification result.")
            except Exception as e:
                print(f" Failed to update ecg_collection: {e}")

        return jsonify({
            'classification': classification,
            'confidence': confidence
        }), 200

    except Exception as e:
        print(" Exception during classification:")
        traceback.print_exc()
        return jsonify({'error': f'Classification failed: {str(e)}'}), 500




@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email').strip().lower()
        password = data.get('password')
        age = data.get('age')
        gender = data.get('gender')
        medical_history = data.get('medical_history', [])

        if not all([name, email, password, age, gender]):
            return jsonify({'error': 'All required fields must be filled'}), 400

        if find_user_by_email(email):
            return jsonify({'error': 'User with this email already exists'}), 409

        hashed_password = generate_password_hash(password)

        insert_user(
            name=name,
            email=email,
            hashed_password=hashed_password,
            age=age,
            gender=gender,
            medical_history=medical_history
        )

        return jsonify({'message': 'User registered successfully'}), 201

    except Exception as e:
        print(f" Error in /register: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/upload_profile_image', methods=['POST'])
def upload_profile_image():
    try:
        data = request.get_json()
        email = data.get('email')
        image_base64 = data.get('image_base64')

        if not email or not image_base64:
            return jsonify({'error': 'Missing email or image data'}), 400

        result = users_collection.update_one(
            {'email': email.lower()},
            {'$set': {'profile_image': image_base64}},
            upsert=False
        )

        if result.modified_count == 0:
            return jsonify({'error': 'User not found or image not updated'}), 404

        return jsonify({'message': 'Profile image updated successfully'}), 200

    except Exception as e:
        print(" Error in upload_profile_image:", e)
        return jsonify({'error': str(e)}), 500


@app.route("/login", methods=["POST"])
def login():
    try:
        # Extract email and password from the request body
        data = request.get_json()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        # Check if email and password are provided
        if not email or not password:
            return jsonify({"error": "Email and password are required."}), 400

        # Fetch user from the database by email
        user = find_user_by_email(email)
        print("Found user:", user)  # Log user info (for debugging)

        # Check if the user exists and has the correct role
        if not user:
            return jsonify({"error": "User not found."}), 404
        if user.get("role") != "patient":
            return jsonify({"error": "Access denied: Not a patient."}), 403

        # Verify the password
        if not check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid password."}), 401

        # Return success message with user data
        return jsonify({
            "message": "Login successful",
            "user": user["name"],
            "email": user["email"],
            "role": user["role"]
        }), 200

    except Exception as e:
        print(f"Error during login: {e}")  # Log the error message for debugging
        return jsonify({"error": f"Login failed: {str(e)}"}), 500




@app.route('/user/<email>', methods=['GET'])
def get_user_details(email):
    try:
        email = unquote(email).strip().lower()
        print(f" Fetching user for email: {email}")

        if not email:
            return jsonify({'error': 'Invalid email'}), 400

        user = users_collection.find_one({'email': email}, {'_id': 0})
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify(user), 200

    except Exception as e:
        print(f" Exception in get_user_details: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/user/<email>/ecg-history', methods=['GET'])
def get_ecg_history(email):
    try:
        email = unquote(email).strip().lower()
        user = users_collection.find_one({'email': email})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'history': user.get('ecg_results', [])}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Consult Doctor feature
# @app.route('/consult_doctor', methods=['POST'])
# def consult_doctor():
#     try:
#         data = request.json
#         name = data.get('name')
#         age = data.get('age')
#         phone = data.get('phone')
#         email = data.get('email')
#         doctor_email = data.get('doctor_email')
#         message = data.get('message')
#         ecg_signal = data.get('ecg_signal', [])
#         timestamp = dt.now()

#         if not all([name, age, phone, email]):
#             return jsonify({'error': 'Missing required fields'}), 400

#         # Save consultation
#         consult_requests_collection.insert_one({
#             'name': name,
#             'age': age,
#             'phone': phone,
#             'email': email,
#             'doctor_email': doctor_email,
#             'message': message,
#             'ecg_signal': ecg_signal,
#             'timestamp': timestamp,
#             'doctor_reply': ""
#         })

#         # Save to ECG records
#         ecg_collection.update_one({
#             'email': email,
#             'timestamp': timestamp,
#             'ecg_signal': ecg_signal
#         })

#         return jsonify({'message': 'Consultation request submitted successfully.'}), 200

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
@app.route('/consult_doctor', methods=['POST'])
def consult_doctor():
    try:
        data = request.json
        name = data.get('name')
        age = data.get('age')
        phone = data.get('phone')
        email = data.get('email')
        doctor_email = data.get('doctor_email')
        message = data.get('message')
        ecg_signal = data.get('ecg_signal', [])
        timestamp = dt.now()

        if not all([name, age, phone, email]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Save consultation request
        consult_requests_collection.insert_one({
            'name': name,
            'age': age,
            'phone': phone,
            'email': email,
            'doctor_email': doctor_email,
            'message': message,
            'ecg_signal': ecg_signal,
            'timestamp': timestamp,
            'doctor_reply': ""
        })

        # Only save ECG if this exact signal is not already saved
        existing = ecg_collection.find_one({'email': email, 'ecg_signal': ecg_signal})
        if not existing:
            ecg_collection.insert_one({
                'email': email,
                'timestamp': timestamp,
                'ecg_signal': ecg_signal
            })

        return jsonify({'message': 'Consultation request submitted successfully.'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/get_consultations', methods=['GET'])
def get_consultations():
    try:
        doctor_email = request.args.get('doctor_email')

        query = {}
        if doctor_email:
            query['doctor_email'] = doctor_email.lower()

        consultations = list(consult_requests_collection.find(query, {'_id': 0}).sort('timestamp', -1))

        return jsonify({'consultations': consultations}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/doctor_register', methods=['POST'])
def doctor_register():
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email').strip().lower()
        password = data.get('password')
        specialization = data.get('specialization')
        contact = data.get('contact')
        age = data.get('age')
        gender = data.get('gender')

        if not all([name, email, password, specialization, contact, age, gender]):
            return jsonify({'error': 'All fields are required'}), 400

        # Check if doctor already exists
        if find_user_by_email(email):
            return jsonify({'error': 'Doctor with this email already exists'}), 409

        # Hash the password before storing it
        hashed_password = generate_password_hash(password)

        # Insert doctor into the database
        insert_doctor(name, email, hashed_password, age, gender, specialization, contact)

        # After saving, fetch the user details and return them
        new_user = find_user_by_email(email)
        if not new_user:
            return jsonify({'error': 'Failed to retrieve user data after registration'}), 500

        return jsonify({
            'message': 'Doctor registered successfully',
            'user': {
                'name': new_user['name'],
                'email': new_user['email'],
                'specialization': new_user['specialization'],
            }
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/get_doctors', methods=['GET'])
def get_doctors():
    try:
        doctors = list(users_collection.find(
            {"specialization": {"$exists": True}},
            {"_id": 0, "name": 1, "email": 1, "specialization": 1, "contact": 1}
        ))
        return jsonify({"doctors": doctors}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/doctor_login", methods=["POST"])
def doctor_login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    doctor = find_user_by_email(email)

    if not doctor or doctor.get("role") != "doctor":
        return jsonify({"error": "Access denied: Not a doctor"}), 403

    if not check_password_hash(doctor["password"], password):
        return jsonify({"error": "Invalid password"}), 401

    return jsonify({
        "message": "Doctor login successful",
        "doctor": doctor["name"],
        "specialization": doctor.get("specialization", "General")
    })

@app.route('/doctor/patients', methods=['GET'])
def get_all_patients():
    try:
        patients = list(ecg_collection.find({}, {'_id': 0}))  # Fetch all patients
        return jsonify({'patients': patients}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/reply_consultation', methods=['POST'])
def reply_consultation():
    try:
        data = request.json
        email = data.get('email')
        reply = data.get('reply')

        if not email:
            return jsonify({'error': 'Email is required'}), 400

        # Update consult request (optional if you still use it)
        consult_requests_collection.update_one(
            {'email': email},
            {'$set': {'doctor_reply': reply}}
        )

        # Update latest ECG record using email
        latest_ecg = ecg_collection.find_one(
            {'email': email},
            sort=[('timestamp', -1)]
        )

        if latest_ecg:
            ecg_collection.update_one(
                {'_id': latest_ecg['_id']},
                {'$set': {'doctor_response': reply}}
            )
            return jsonify({'message': 'Reply submitted successfully.'}), 200
        else:
            return jsonify({'error': 'No ECG record found for this email'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500
# @app.route('/upload_csv', methods=['POST'])
# def upload_csv():
#     try:
#         if 'file' not in request.files:
#             return jsonify({'error': 'No file part in the request'}), 400

#         file = request.files['file']
#         email = request.form.get('email')

#         if file.filename == '':
#             return jsonify({'error': 'No file selected'}), 400
#         if not file.filename.endswith('.csv'):
#             return jsonify({'error': 'Only CSV files are allowed'}), 400

#         filename = secure_filename(file.filename)
#         filepath = os.path.join('uploads', filename)
#         os.makedirs('uploads', exist_ok=True)
#         file.save(filepath)

#         df = pd.read_csv(filepath, header=None)
#         ecg_signal = df.values.flatten().tolist()

#         ecg_signal = ecg_signal[:REQUIRED_LENGTH] + [0] * (REQUIRED_LENGTH - len(ecg_signal))
#         ecg_signal = np.array(ecg_signal, dtype=np.float32)

#         if np.min(ecg_signal) < -1 or np.max(ecg_signal) > 1:
#             ecg_scaled = (ecg_signal - TRAIN_MIN) / (TRAIN_MAX - TRAIN_MIN)
#             ecg_scaled = 2 * ecg_scaled - 1
#         else:
#             ecg_scaled = ecg_signal

#         ecg_scaled = ecg_scaled.reshape(1, REQUIRED_LENGTH, 1)
#         probs = model.predict(ecg_scaled)[0]
#         predicted_index = int(np.argmax(probs))
#         classification = LABELS[predicted_index]
#         confidence = float(np.max(probs))

#         print(f" Softmax probs: {probs}")
#         print(f" Predicted class: {classification} with confidence {confidence:.4f}")

#         if email:
#             ecg_collection.insert_one({
#                 'email': email,
#                 'timestamp': dt.now(),
#                 'ecg_signal': ecg_signal.tolist(),
#                 'source': 'uploaded_csv',
#                 'test_result': classification,
#                 'confidence': confidence
#             })

#             users_collection.update_one(
#                 {'email': email},
#                 {
#                     '$set': {'latest_ecg_result': classification},
#                     '$push': {'ecg_results': {'result': classification, 'timestamp': dt.now()}}
#                 },
#                 upsert=True
#             )

#         return jsonify({
#             'classification': classification,
#             'confidence': confidence,
#             'message': 'ECG prediction successful from uploaded CSV.'
#         })

#     except Exception as e:
#         logger.error(f" Error during CSV classification: {traceback.format_exc()}")
#         return jsonify({'error': str(e)}), 500

@app.route('/upload_csv', methods=['POST'])
def upload_csv():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400

        file = request.files['file']
        email = request.form.get('email')

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'Only CSV files are allowed'}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join('uploads', filename)
        os.makedirs('uploads', exist_ok=True)
        file.save(filepath)

        df = pd.read_csv(filepath, header=None)
        ecg_signal = df.values.flatten().tolist()

        ecg_signal = ecg_signal[:REQUIRED_LENGTH] + [0] * (REQUIRED_LENGTH - len(ecg_signal))
        ecg_signal = np.array(ecg_signal, dtype=np.float32)

        #  Conditional normalization
        if np.min(ecg_signal) < -1 or np.max(ecg_signal) > 1:
            ecg_scaled = (ecg_signal - TRAIN_MIN) / (TRAIN_MAX - TRAIN_MIN)
            ecg_scaled = 2 * ecg_scaled - 1
        else:
            ecg_scaled = ecg_signal

        #  Reshape for PyTorch model: [1, 1, 9000]
        ecg_scaled = ecg_scaled.reshape(1, REQUIRED_LENGTH, 1)
        probs = model.predict(ecg_scaled)[0]


        predicted_index = int(np.argmax(probs))
        classification = LABELS[predicted_index]
        confidence = float(np.max(probs))

        print(f" Softmax probs: {probs}")
        print(f" Predicted class: {classification} with confidence {confidence:.4f}")

        if email:
            ecg_collection.insert_one({
                'email': email,
                'timestamp': dt.now(),
                'ecg_signal': ecg_signal.tolist(),
                'source': 'uploaded_csv',
                'classification': classification
            })

            users_collection.update_one(
                {'email': email},
                {
                    '$set': {'latest_ecg_result': classification},
                    '$push': {'ecg_results': {'result': classification, 'timestamp': dt.now()}}
                },
                upsert=True
            )

        return jsonify({
            'classification': classification,
            'confidence': confidence,
            'message': 'ECG prediction successful from uploaded CSV.'
        })

    except Exception as e:
        logger.error(f" Error during CSV classification: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500






@app.route('/simulate_ecg', methods=['POST'])
def simulate_ecg():
    try:
        data = request.get_json()
        email = data.get("email", "").strip().lower()
        ecg_signal = data.get("ecg_signal")

        if not email or not ecg_signal:
            return jsonify({"error": "Email and ECG signal are required"}), 400

        user = find_user_by_email(email)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Save without prediction
        ecg_record = {
            "email": email,
            "ecg_signal": ecg_signal,
            "timestamp": dt.utcnow().isoformat(),
            "doctor_response": "",
            "classification": ""  # Leave empty if no prediction
        }

        result = ecg_collection.insert_one(ecg_record)

        return jsonify({
            "message": "ECG saved successfully",
            "record_id": str(result.inserted_id)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




@app.route('/delete_ecg', methods=['POST'])
def delete_ecg():
    data = request.get_json()
    record_id = data.get("record_id")
    print("🗑 Incoming delete request data:", data)

    if not record_id:
        return jsonify({"error": "Missing record_id"}), 400

    try:
        deleted_total = 0

        # Try matching _id as a string
        result = ecg_collection.delete_one({"_id": record_id})
        deleted_total += result.deleted_count

        # Try matching ObjectId
        try:
            object_id = ObjectId(record_id)
            result = ecg_collection.delete_one({"_id": object_id})
            deleted_total += result.deleted_count
        except (InvalidId, TypeError):
            pass

        # Try record_id if field exists
        result = ecg_collection.delete_one({"record_id": record_id})
        deleted_total += result.deleted_count

        if deleted_total > 0:
            print(f" Deleted {deleted_total} record(s)")
            return jsonify({"message": f"Deleted {deleted_total} ECG record(s)."}), 200

        print(" No record found for any ID match")
        return jsonify({"error": "Record not found"}), 404

    except Exception as e:
        print(" Exception during deletion:", str(e))
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route('/delete_consultation', methods=['POST'])
def delete_consultation():
    try:
        data = request.get_json(force=True)
    except Exception as e:
        return jsonify({"error": f"Invalid JSON: {str(e)}"}), 400

    print(" Incoming delete consultation request:", data)

    record_id = data.get("record_id")
    if not record_id:
        return jsonify({"error": "Missing record_id"}), 400

    try:
        # Try using ObjectId
        try:
            object_id = ObjectId(record_id)
            result = consult_requests_collection.delete_one({"_id": object_id})
            if result.deleted_count == 1:
                print(" Deleted using _id")
                return jsonify({"message": "Consultation deleted using _id"}), 200
        except (InvalidId, TypeError):
            print(" Not a valid ObjectId")

        # Try using custom record_id field
        result = consult_requests_collection.delete_one({"record_id": record_id})
        if result.deleted_count == 1:
            print(" Deleted using record_id")
            return jsonify({"message": "Consultation deleted using record_id"}), 200

        print(" Consultation not found")
        return jsonify({"error": "Consultation not found"}), 404

    except Exception as e:
        print(" Server error:", str(e))
        return jsonify({"error": f"Server error: {str(e)}"}), 500



@app.route('/generate_ecg_image', methods=['POST'])
def generate_ecg_image():
    try:
        data = request.get_json()
        ecg_signal = data.get("ecg_signal")

        if not ecg_signal or not isinstance(ecg_signal, list):
            return jsonify({"error": "Invalid or missing ECG signal."}), 400

        ecg_signal = np.array(ecg_signal, dtype=np.float32)

        
        fig, ax = plt.subplots(figsize=(10, 3))

        ax.plot(ecg_signal, linewidth=0.7, color="black")

        #  Add axis labels
        ax.set_xlabel("Time (samples)")
        ax.set_ylabel("Amplitude (mV or scaled unit)")

        # Optional: show grid
        ax.grid(True, linestyle="--", linewidth=0.3)

        plt.tight_layout()
        img_path = "ecg_latest.png"
        fig.savefig(img_path, bbox_inches='tight', pad_inches=0)
        plt.close(fig)

        return send_file(img_path, mimetype="image/png")

    except Exception as e:
        print(f" Error generating ECG image: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
