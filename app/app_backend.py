# app.py
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

# --- NEW: Generative AI Imports ---
import google.generativeai as genai

# --- Configuration ---
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# --- Flask App Initialization ---
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app) 

# --- Load Your Classification Model ---
try:
    model = load_model('pneumonia_resnet_best_model.h5')
    print("--- Classification Model loaded successfully ---")
except Exception as e:
    print(f"--- Error loading classification model: {e} ---")
    model = None

# --- NEW: Configure Generative AI ---
# It's safer to load the API key from an environment variable.
# Before running `python app.py`, set the variable in your terminal:
# For Windows: set GOOGLE_API_KEY="YOUR_API_KEY"
# For macOS/Linux: export GOOGLE_API_KEY="YOUR_API_KEY"
try:
    API_KEY = 'AIzaSyDSTTkSOCGJLhtpFbcTkgomKvdtDnJndho'
    if not API_KEY:
        print("--- WARNING: GOOGLE_API_KEY environment variable not found. Guidance feature will be disabled. ---")
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
    """Checks if the uploaded file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- NEW: Generative AI Guidance Function ---
def generate_health_guidance(prediction_text):
    """Generates health guidance using the Gemini model."""
    if not genai_model:
        return "Guidance feature is currently unavailable."

    prompt = f"""
    You are a helpful AI health assistant. Based on the following finding from a chest X-ray analysis,
    provide general, empathetic, and helpful guidance.
    
    Finding: {prediction_text}
    
    Your guidance should be focused on general well-being, suggesting next steps like consulting a
    healthcare professional, and preventive measures. Do NOT provide a specific medical diagnosis or
    treatment plan. Keep the response concise and easy to understand.
    Start the message with 'Based on the findings:'
    """
    try:
        response = genai_model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"--- Gemini API call failed: {e} ---")
        return "Could not generate guidance at this time. Please consult a healthcare professional for advice."

def run_model_inference(image_path):
    """Runs the classification model and then generates health guidance."""
    if model is None:
        raise RuntimeError("Classification model could not be loaded.")

    print(f"--- Running REAL inference on {image_path} ---")
    
    img_height, img_width = 224, 224
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (img_height, img_width))
    img = img / 255.0
    img = np.expand_dims(img, axis=0)
    
    prediction_score = model.predict(img)[0][0]
    
    threshold = 0.5 
    anomalies = []
    if prediction_score > threshold:
        prediction = "Pneumonia Detected"
        confidence = float(prediction_score)
        # Generate fake anomalies for the frontend highlight
        for _ in range(random.randint(2, 4)):
            anomalies.append({"x": random.uniform(0.2, 0.8), "y": random.uniform(0.2, 0.8), "r": random.uniform(0.05, 0.1)})
    else:
        prediction = "Normal"
        confidence = 1 - float(prediction_score)

    # --- MODIFIED: Call the guidance function ---
    guidance_text = generate_health_guidance(prediction)

    result = {
        "prediction": prediction,
        "confidence": round(confidence, 2),
        "anomalies": anomalies,
        "guidance": guidance_text # Add the new guidance to the result
    }
    
    print(f"--- Inference result: {result} ---")
    return result

# --- API Endpoint (No changes needed) ---
@app.route('/predict', methods=['POST'])
def predict():
    # ... (This function remains unchanged) ...
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
            prediction_data = run_model_inference(filepath)
            return jsonify(prediction_data)
        except Exception as e:
            print(f"An error occurred during inference: {e}")
            return jsonify({"error": "Failed to process the image"}), 500
        finally:
            if os.path.exists(filepath):
                os.remove(filepath)
    else:
        return jsonify({"error": "File type not allowed"}), 400


# --- Main Execution Block (No changes needed) ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

