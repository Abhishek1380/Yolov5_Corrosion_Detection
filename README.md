# 🚀 YOLOv5s Object Detection

This project implements real-time object detection using **YOLOv5s** (developed by Ultralytics) on a custom dataset. It uses **PyTorch**, **OpenCV**, and **NumPy** to train, evaluate, and deploy the model.

---

## 📌 Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Training](#training)
- [Inference](#inference)
- [Results](#results)
- [Performance Metrics](#performance-metrics)
- [Examples](#examples)
- [Improvements](#improvements)
- [Credits](#credits)

---

## 📁 Project Overview

This project detects objects in real-time from images and videos using the YOLOv5s model. It achieves balanced performance with fast inference and moderate accuracy — ideal for low-resource environments.

---

## 🛠️ Tech Stack

- **Python 3.8+**
- **[PyTorch](https://pytorch.org/)** – for model training & inference
- **[OpenCV](https://opencv.org/)** – for image I/O and visualization
- **[NumPy](https://numpy.org/)** – for numerical operations
- **[YOLOv5 (Ultralytics)](https://github.com/ultralytics/yolov5)** – pre-trained object detection models

---

## ✅ Installation

1. **Clone the YOLOv5 repository:**
```bash
git clone https://github.com/ultralytics/yolov5.git
cd yolov5
