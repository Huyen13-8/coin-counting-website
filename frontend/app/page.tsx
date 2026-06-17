"use client";

import { useState } from "react";

type Detection = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  confidence: number;
};

type Result = {
  totalCoins: number;
  detections: Detection[];
};

type ImageSize = {
  naturalWidth: number;
  naturalHeight: number;
  displayWidth: number;
  displayHeight: number;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setResult(null);
    setImageSize(null);
  }

  async function handleUpload() {
    if (!file) {
      alert("Please select an image first.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/detect-coins", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Failed to detect coins. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.container}>
      <section style={styles.card}>
        <img
            src="/images/oomomo_logo.avif"
            alt="Logo"
            style={{ width: "200px", marginBottom: "20px" }}
        />
        <h1 style={styles.title}>Oomomo Coin Counter</h1>

        <p style={styles.description}>
          Upload an image of Canadian coins. This model will detect and
          count the number of coins.
        </p>

        <div style={{ textAlign: "center" }}>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{alignContent:"center"}} />

            {previewUrl && (
            <div style={styles.previewSection}>
                <h3>Image Preview</h3>

                <div style={styles.imageWrapper}>
                <img
                    src={previewUrl}
                    alt="Preview"
                    style={styles.image}
                    onLoad={(event) => {
                    const img = event.currentTarget;

                    setImageSize({
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight,
                        displayWidth: img.clientWidth,
                        displayHeight: img.clientHeight,
                    });
                    }}
                />

                {result && imageSize && (
                    <svg
                    style={styles.overlay}
                    width={imageSize.displayWidth}
                    height={imageSize.displayHeight}
                    >
                    {result.detections.map((detection, index) => {
                        const scaleX =
                        imageSize.displayWidth / imageSize.naturalWidth;
                        const scaleY =
                        imageSize.displayHeight / imageSize.naturalHeight;

                        const x1 = detection.x1 * scaleX;
                        const y1 = detection.y1 * scaleY;
                        const x2 = detection.x2 * scaleX;
                        const y2 = detection.y2 * scaleY;

                        const cx = (x1 + x2) / 2;
                        const cy = (y1 + y2) / 2;
                        const radius = Math.max(x2 - x1, y2 - y1) / 2;

                        return (
                        <g key={index}>
                            <circle
                            cx={cx}
                            cy={cy}
                            r={radius}
                            fill="none"
                            stroke="lime"
                            strokeWidth="3"
                            />

                            <text
                            x={cx}
                            y={cy - radius - 6}
                            textAnchor="middle"
                            fill="lime"
                            fontSize="14"
                            fontWeight="bold"
                            >
                            {index + 1}
                            </text>
                        </g>
                        );
                    })}
                    </svg>
                )}
                </div>
            </div>
            )}

            <button onClick={handleUpload} disabled={loading} style={styles.button}>
            {loading ? "Detecting..." : "Detect Coins"}
            </button>
        </div>

        {result && (
          <div style={styles.resultBox}>
            <h2>Result</h2>

            <p style={styles.count}>
              Total Coins Detected: <strong>{result.totalCoins}</strong>
            </p>

            <h3>Detections</h3>

            {result.detections.length === 0 ? (
              <p>No coins detected.</p>
            ) : (
              <ul>
                {result.detections.map((detection, index) => (
                  <li key={index}>
                    Coin {index + 1}: Confidence{" "}
                    {(detection.confidence * 100).toFixed(1)}%
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    padding: "40px",
    backgroundColor: "#f4f4f5",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    maxWidth: "800px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "32px",
    marginBottom: "10px",
    textAlign: "center",
  },
  description: {
    color: "#555",
    marginBottom: "20px",
    textAlign: "center",
  },
  previewSection: {
    marginTop: "25px",
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    display: "inline-block",
  },
  image: {
    width: "100%",
    height: "auto",
    display: "block",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    pointerEvents: "none",
  },
  button: {
    marginTop: "25px",
    padding: "12px 24px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
  },
  resultBox: {
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
  },
  count: {
    fontSize: "22px",
  },
};