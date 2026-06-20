from ultralytics import YOLO
import gc

model = YOLO("models/best.pt")


def detect_coins(image_path):
    results = model.predict(
        source=image_path,
        conf=0.25,
        imgsz=416,      # lower memory than 640
        verbose=False,
        device="cpu"
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

    total = len(detections)

    del results
    gc.collect()

    return {
        "totalCoins": total,
        "detections": detections
    }