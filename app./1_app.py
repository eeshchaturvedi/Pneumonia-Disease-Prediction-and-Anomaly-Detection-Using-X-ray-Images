# --- Imports ---
import os
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

# --- ML/Image Processing Imports ---
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.losses import MeanSquaredError # Correct import for the custom_objects fix

# --- Generative AI Imports ---
import google.generativeai as genai

# --- Configuration ---
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
ANOMALY_THRESHOLD = 0.002 

# --- Flask App Initialization ---
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app, origins="http://127.0.0.1:5500", supports_credentials=True) 

# --- Load Your Models ---
try:
    classifier_model = load_model('pneumonia_resnet_best_model_1.h5')
    print("--- Classification Model loaded successfully ---")
except Exception as e:
    print(f"--- Error loading classification model: {e} ---")
    classifier_model = None

try:
    anomaly_model = load_model(
        'anomaly_detector_1.h5',
        custom_objects={'mse': MeanSquaredError()},
        compile=False
    )
    print("--- Anomaly Detection Model loaded successfully ---")
except Exception as e:
    print(f"--- Error loading anomaly model: {e} ---")
    anomaly_model = None

# --- Configure Generative AI ---
try:
    API_KEY = os.getenv('GOOGLE_API_KEY', 'AIzaSyDSTTkSOCGJLhtpFbcTkgomKvdtDnJndho') # Fallback
    if 'YOUR_API_KEY' in API_KEY:
        print("--- WARNING: GOOGLE_API_KEY not found. Guidance will be disabled. ---")
        genai_model = None
    else:
        genai.configure(api_key=API_KEY)
        genai_model = genai.GenerativeModel('gemini-1.5-flash-latest')
        print("--- Generative AI Model configured successfully ---")
except Exception as e:
    print(f"--- Error configuring Generative AI: {e} ---")
    genai_model = None

# --- Helper Functions ---
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_health_guidance(prediction_text, is_anomaly):
    if not genai_model:
        return "Guidance feature is currently unavailable."
    
    if is_anomaly and prediction_text == "Normal":
        finding_text = "The model did not find signs of pneumonia but did flag some unusual areas in the image that may warrant a closer look."
    else:
        finding_text = f"The model's primary finding is: {prediction_text}."

    prompt = f"You are an AI health assistant. Based on the finding: '{finding_text}', provide empathetic guidance. Focus on next steps like consulting a professional. Do not diagnose. Start with 'Based on the findings:'"
    try:
        response = genai_model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"--- Gemini API call failed: {e} ---")
        return "Could not generate guidance at this time."

# --- MODIFIED: Real Anomaly Detection Function ---
def get_anomaly_details(image_path):
    if not anomaly_model:
        return False, []

    print("--- Running Real Anomaly Detection ---")
    img_height, img_width = 224, 224
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Image not found at path: {image_path}")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (img_height, img_width))
    img_normalized = img / 255.0
    img_reshaped = np.expand_dims(img_normalized, axis=0)

    reconstructed_img = anomaly_model.predict(img_reshaped)[0]
    
    mse = np.mean(np.square(img_normalized - reconstructed_img))
    is_anomaly = mse > ANOMALY_THRESHOLD
    print(f"--- Anomaly MSE: {mse:.4f} (Threshold: {ANOMALY_THRESHOLD}) -> Is Anomaly: {is_anomaly} ---")

    anomalies = []
    if is_anomaly:
        diff_map = np.abs(img_normalized - reconstructed_img)
        diff_map = np.mean(diff_map, axis=-1)
        diff_map_norm = (diff_map - np.min(diff_map)) / (np.max(diff_map) - np.min(diff_map) + 1e-8)
        diff_map_uint8 = (diff_map_norm * 255).astype("uint8")
        _, thresh = cv2.threshold(diff_map_uint8, 50, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            (x, y), radius = cv2.minEnclosingCircle(contour)
            if radius > 10:
                # --- FIX APPLIED HERE: Normalize coordinates to be between 0 and 1 ---
                anomalies.append({
                    "x": x / img_width,
                    "y": y / img_height,
                    "r": radius / img_width
                })
    return bool(is_anomaly), anomalies

def run_full_analysis(image_path):
    if not classifier_model: raise RuntimeError("Classification model not loaded.")

    print(f"--- Running Classification on {image_path} ---")
    img_cls = cv2.imread(image_path)
    if img_cls is None:
        raise ValueError(f"Image not found at path: {image_path}")
    img_cls = cv2.cvtColor(img_cls, cv2.COLOR_BGR2RGB)
    img_cls = cv2.resize(img_cls, (224, 224))
    img_cls = img_cls / 255.0
    img_cls = np.expand_dims(img_cls, axis=0)
    
    prediction_raw = classifier_model.predict(img_cls)
    prediction_flat = prediction_raw.flatten()

    if len(prediction_flat) > 1:
        prediction_score = float(prediction_flat[1])
    else:
        prediction_score = float(prediction_flat[0])
    
    if prediction_score > 0.5:
        prediction = "Pneumonia Detected"
    else:
        prediction = "Normal"
    
    confidence = prediction_score if prediction == "Pneumonia Detected" else 1 - prediction_score
    
    is_anomaly, anomaly_coords = get_anomaly_details(image_path)
    guidance_text = generate_health_guidance(prediction, is_anomaly)

    result = {
        "prediction": prediction, "confidence": round(confidence, 2),
        "anomalies": anomaly_coords, "is_anomaly": is_anomaly,
        "guidance": guidance_text
    }
    
    print(f"--- Final Analysis Result: {result} ---")
    return result

# --- API Endpoint ---
@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        try:
            prediction_data = run_full_analysis(filepath)
            return jsonify(prediction_data)
        except Exception as e:
            print(f"An error occurred during inference: {e}")
            return jsonify({"error": "Failed to process the image"}), 500
        finally:
            if os.path.exists(filepath):
                os.remove(filepath)
    else:
        return jsonify({"error": "File type not allowed"}), 400

# --- Main Execution Block ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
