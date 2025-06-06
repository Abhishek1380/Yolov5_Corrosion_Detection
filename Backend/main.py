from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import torch
import io
import os

app = FastAPI()

# Allow frontend requests (e.g., from React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Absolute path to yolov5 directory
yolov5_path = os.path.join(os.path.dirname(__file__), '..', 'yolov5')
# Absolute path to best.pt model
model_path = os.path.join(os.path.dirname(__file__), 'best.pt')

# Load YOLOv5 model from local folder
model = torch.hub.load('C:/Users/DELL/Desktop/Yolo_Corrosion_Detection/yolov5', 'custom', path='best.pt', source='local')

@app.get("/")
def root():
    return {"message": "Corrosion detection backend is running"}

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    width, height = image.size
    image_area = width * height

    results = model(image)  # just pass image

    boxes = results.pandas().xyxy[0]
    boxes = boxes[boxes['confidence'] >= 0.16]  # filter by confidence threshold

    total_area = 0
    for _, row in boxes.iterrows():
        area = (row.xmax - row.xmin) * (row.ymax - row.ymin)
        total_area += area

    corrosion_percent = (total_area / image_area) * 100

    return JSONResponse({
        "corrosion_percent": round(corrosion_percent, 2),
        "detections": boxes.to_dict(orient="records")
    })
