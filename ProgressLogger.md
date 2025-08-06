# Project Progress Logger

## 29 July 2025 🤝

- First meeting with mentor Jinesha Kothari  
  - Discussed project expectations, deliverables, and timelines  
  - Reviewed and validated our approach to the problem statement  

---

## 30 July 2025 🧠

- Team deep-dive into convolutional neural networks  
  - Studied CNN architecture, layers, and feature-extraction concepts  
- First build of the pneumonia-detection model  
  - Encountered longer training times due to high epoch counts  

---

## 31 July 2025 🖥️

- Frontend development alongside model training  
  - Set up file upload, preview, and analysis UI scaffold  
- Monitored training progress and outlined next integration steps  

---

## 1 August 2025 📈

Model performance analysis and debugging

Discovered that the initial low accuracy was due to a class imbalance issue, leading to a "lazy" classifier.

Implemented class weighting to correct the model's bias towards the majority class.

Switched to a combined training approach, fine-tuning the top layers of the ResNet50 model from the start.

Achieved a significant jump in validation accuracy from 56% to 81.25%. This is a major breakthrough, and the model is now performing as expected.

---

## 2 August 2025 💻

Backend development on the Flask server

Successfully integrated the model into the backend. The server can now load the saved .h5 model file.

Developed API endpoints to handle file uploads and return real-time predictions.

Frontend development for seamless user experience

Connected the file upload and preview UI to the Flask backend.

Designed and implemented a results dashboard to display the model's prediction, confidence score, and other key metrics.

The project is now a fully functional, end-to-end application.

---

## 3 August 2025 🛠️

Defined a new roadmap for further model improvement

The goal is to push the validation accuracy beyond 81.25%.

Outlined a plan to systematically tune hyperparameters, including learning rate and unfreezing more layers in the base model.

Decided to explore alternative pre-trained models, such as DenseNet121 or EfficientNetB0, to potentially achieve higher performance.

Began integrating explainable AI (Grad-CAM) to visualize model decisions, which will be a key feature for transparency.









