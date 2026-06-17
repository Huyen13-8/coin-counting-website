from ultralytics import YOLO

model = YOLO("models/best.pt")


def detect_coins(image_path):
    results = model.predict(
        image_path,
        conf=0.25,
        imgsz=640,
        verbose=False
    )

    boxes = results[0].boxes

    detections = []

    for box in boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        confidence = float(box.conf[0])

        detections.append({
            "x1": round(x1, 2),
            "y1": round(y1, 2),
            "x2": round(x2, 2),
            "y2": round(y2, 2),
            "confidence": round(confidence, 3)
        })

    return {
        "totalCoins": len(detections),
        "detections": detections
    }