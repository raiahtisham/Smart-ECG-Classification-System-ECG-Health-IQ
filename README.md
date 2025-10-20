# ❤️ Deep Learning–Based Heart Disease (A-Fib) Classification

## 📘 Overview

This repository presents a comprehensive implementation of a **Deep Learning–Based Heart Disease Classification System** focused on **Atrial Fibrillation (A-Fib) detection** using ECG signals.
It combines **AI model development** and a **mobile application interface**, enabling real-time, accessible, and intelligent heart rhythm analysis.

The project is part of the **final year thesis** titled *“Deep Learning Based Heart Disease (A-Fib) Classification Using ECG Signals”*, conducted at the **Institute of Space Technology, Islamabad (2025)**.

---

## 🧩 Repository Structure

The repository is divided into two main branches, each serving a distinct purpose:

| Branch       | Description                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`main`**   | Contains all **AI models, preprocessing code, and deep learning experiments**. This branch focuses on signal analysis, model training, and evaluation. |
| **`master`** | Contains the **mobile application code**, which integrates the trained model to provide real-time ECG classification and user interaction.             |

---

## 🧠 Features

### 🧬 AI & Model Development (Main Branch)

* ECG signal preprocessing and filtering
* Feature extraction from raw ECG signals
* Deep learning architectures: **CNN**, **LSTM**, and **Hybrid CNN-LSTM**
* Multi-class classification (Normal, A-Fib, Noise, Others)
* Model evaluation using accuracy, precision, recall, and F1-score
* Lightweight architecture optimized for mobile deployment

### 📱 Mobile Application (Master Branch)

* Integration of trained AI model using TensorFlow Lite
* Real-time ECG classification via Bluetooth or digital stethoscope input
* Visualization of ECG waveforms and classification results
* User-friendly interface for continuous monitoring
* Local storage for session data and result history

---

## ⚙️ Technologies Used

| Category                     | Tools & Frameworks                     |
| ---------------------------- | -------------------------------------- |
| **Programming Languages**    | Python, JavaScript                     |
| **Deep Learning Frameworks** | TensorFlow, Keras                      |
| **Data Handling**            | NumPy, Pandas, SciPy                   |
| **Signal Processing**        | wfdb, NeuroKit2, Matplotlib            |
| **App Development**          | React Native, TensorFlow Lite, Node.js |
| **Backend & Storage**        | MongoDB, Flask API (optional)          |

---

## 🧪 Dataset

The project uses ECG signals from the **PhysioNet Challenge Dataset**, containing multiple arrhythmia classes.
Data was preprocessed, normalized, and labeled into four main categories:

* **Normal**
* **Atrial Fibrillation (A-Fib)**
* **Noise**
* **Others**

---

## 🧮 Model Architecture

* **CNN Module**: Extracts temporal-spatial patterns from ECG signals.
* **LSTM Module**: Captures sequential dependencies in time-series data.
* **Hybrid CNN-LSTM Model**: Combines spatial and temporal learning for robust classification.

The hybrid model achieved:

* **Accuracy:** > 95%
* **F1-Score:** > 0.94

---

## 📱 Mobile Application Integration

The trained model was converted to **TensorFlow Lite (.tflite)** format and integrated into a **React Native app**.
The app allows real-time signal input from a digital stethoscope and displays immediate diagnostic results.

---

## ⚠️ Notice

Due to **university and dataset licensing policies**, not all source code and data files are shared publicly.
This repository includes **selected non-confidential scripts, model definitions, and mobile components** for demonstration and educational purposes only.

---

## 👨‍💻 Authors

**Ahtisham Ali**
📧 [raiahtisham76@gmail.com](mailto:raiahtisham76@gmail.com)
🔗 [LinkedIn](https://linkedin.com/in/ahtisham-ali-0904b224b/)
🎓 *Institute of Space Technology, Islamabad*

**Zoraiz Saeed**
🎓 *Institute of Space Technology, Islamabad*

---

## 🏫 Supervision

**Supervisor:** Dr. Syed Ali Irtaza – Department of Electrical Engineering
**Institution:** Institute of Space Technology, Islamabad, Pakistan

---
