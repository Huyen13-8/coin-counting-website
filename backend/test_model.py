from ultralytics import YOLO

model = YOLO(
    "runs/detect/coin_counter_yolo11/weights/best.pt"
)

results = model.predict(
    "test_coin.jpeg",
    conf=0.25,
    save=True
)

print(
    "Coins detected:",
    len(results[0].boxes)
)