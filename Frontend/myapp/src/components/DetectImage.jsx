import React, { useState, useRef, useEffect } from "react";

const DetectImage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [showJson, setShowJson] = useState(false);
    const canvasRef = useRef(null);
    const imageRef = useRef(null);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (imageSrc) URL.revokeObjectURL(imageSrc);

        setSelectedFile(file);
        setResult(null);
        setError(null);
        setShowJson(false);
        setImageSrc(URL.createObjectURL(file));
        clearCanvas();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert("Please select an image file first!");
            return;
        }
        setLoading(true);
        setResult(null);
        setError(null);
        setShowJson(false);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch("http://127.0.0.1:8000/detect", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (imageSrc) URL.revokeObjectURL(imageSrc);

        setSelectedFile(null);
        setResult(null);
        setError(null);
        setImageSrc(null);
        setShowJson(false);
        clearCanvas();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const img = imageRef.current;

        if (!ctx || !img || !result) {
            clearCanvas();
            return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.font = "18px Arial";
        ctx.textBaseline = "top";

        const scaleX = img.width / img.naturalWidth;
        const scaleY = img.height / img.naturalHeight;

        result.detections.forEach(({ xmin, ymin, xmax, ymax, confidence, name }) => {
            const x = xmin * scaleX;
            const y = ymin * scaleY;
            const width = (xmax - xmin) * scaleX;
            const height = (ymax - ymin) * scaleY;

            ctx.strokeStyle = "red";
            ctx.strokeRect(x, y, width, height);

            const label = `${name} ${(confidence * 100).toFixed(1)}%`;
            const textWidth = ctx.measureText(label).width;
            const textHeight = 20;

            ctx.fillStyle = "red";
            ctx.fillRect(x, y, textWidth + 6, textHeight);

            ctx.fillStyle = "white";
            ctx.fillText(label, x + 3, y);
        });
    }, [result, imageSrc]);

    useEffect(() => {
        return () => {
            if (imageSrc) URL.revokeObjectURL(imageSrc);
        };
    }, [imageSrc]);

    return (
        <div
            style={{
                maxWidth: 700,
                margin: "40px auto",
                padding: 20,
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                backgroundColor: "#f7f7f7",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
        >
            <h2 style={{ textAlign: "center", marginBottom: 20, color: "#333" }}>
                Corrosion Detection
            </h2>

            <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}
            >
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ flexGrow: 1, minWidth: 200 }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Detecting..." : "Detect"}
                </button>
                <button
                    type="button"
                    onClick={handleReset}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                    }}
                >
                    Reset
                </button>
            </form>

            {error && (
                <p
                    style={{
                        color: "red",
                        marginTop: 15,
                        textAlign: "center",
                        fontWeight: "bold",
                    }}
                >
                    Error: {error}
                </p>
            )}

            {result && (
                <div
                    style={{
                        marginTop: 20,
                        textAlign: "center",
                        backgroundColor: "#e9f5ff",
                        padding: 15,
                        borderRadius: 6,
                        boxShadow: "inset 0 0 8px #a2d1ff",
                    }}
                >
                    <p>
                        <b>Corrosion Coverage:</b> {result.corrosion_percent}%
                    </p>

                    {result.detections.length > 0 ? (
                        <table
                            style={{
                                margin: "10px auto",
                                borderCollapse: "collapse",
                                width: "90%",
                            }}
                        >
                            <thead>
                                <tr style={{ backgroundColor: "#d0eaff" }}>
                                    <th style={{ padding: 8, border: "1px solid #ccc" }}>#</th>
                                    <th style={{ padding: 8, border: "1px solid #ccc" }}>Corrosion Name</th>
                                    <th style={{ padding: 8, border: "1px solid #ccc" }}>Severity (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.detections.map((det, index) => (
                                    <tr key={index}>
                                        <td style={{ padding: 8, border: "1px solid #ccc" }}>{index + 1}</td>
                                        <td style={{ padding: 8, border: "1px solid #ccc" }}>{det.name}</td>
                                        <td style={{ padding: 8, border: "1px solid #ccc" }}>
                                            {(det.confidence * 100).toFixed(2)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No corrosion detected.</p>
                    )}

                    <button
                        onClick={() => setShowJson((prev) => !prev)}
                        style={{
                            marginTop: 10,
                            padding: "6px 12px",
                            backgroundColor: showJson ? "#dc3545" : "#28a745",
                            border: "none",
                            borderRadius: 4,
                            color: "white",
                            cursor: "pointer",
                        }}
                        aria-expanded={showJson}
                        aria-controls="json-response"
                    >
                        {showJson ? "Hide JSON Response" : "Show JSON Response"}
                    </button>

                    {showJson && (
                        <pre
                            id="json-response"
                            style={{
                                marginTop: 15,
                                maxHeight: 300,
                                overflowY: "auto",
                                backgroundColor: "#f0f0f0",
                                padding: 10,
                                borderRadius: 4,
                                textAlign: "left",
                                fontSize: 12,
                                whiteSpace: "pre-wrap",
                                wordWrap: "break-word",
                                boxShadow: "inset 0 0 5px #ccc",
                            }}
                        >
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    )}
                </div>
            )}

            {imageSrc && (
                <div
                    style={{
                        position: "relative",
                        marginTop: 20,
                        width: "fit-content",
                        marginLeft: "auto",
                        marginRight: "auto",
                        border: "1px solid #ccc",
                    }}
                >
                    <img
                        src={imageSrc}
                        alt="Uploaded"
                        ref={imageRef}
                        style={{ display: "block", maxWidth: "600px", width: "100%", height: "auto" }}
                    />
                    <canvas
                        ref={canvasRef}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            pointerEvents: "none",
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default DetectImage;
