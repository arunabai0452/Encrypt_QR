import React, { useState, useEffect, use } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAmbassadorStore } from "../../stores/useAmbassadorStore";
import PrintingAnimation from "./PrintingAnimation";

const Dashboard = () => {
  const { user } = useAmbassadorStore();
  const location = useLocation();
  const { decrypted_text } = location.state || {};
  console.log(decrypted_text);
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/"); // Redirect to login if user is not authenticated
    }
  }, [user]);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleGenerateQR = async () => {
    if (!inputText) {
      alert("Please enter some text!");
      return;
    }

    // Assuming you want to pass a URL along with the text
    const url = "https://example.com"; // You can replace this with the actual URL you want to pass

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/qrcode",
        { text: inputText, url: url }, // Include the URL field here
        { responseType: "blob" }
      );

      // Create a URL for the image blob returned by the API
      const qrImageURL = URL.createObjectURL(response.data);
      setQrCode(qrImageURL);
    } catch (error) {
      console.error("Error generating QR code:", error);
      alert("Failed to generate QR code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 style={{ alignContent: "center" }}>Welcome, {user}!</h1>
      {decrypted_text ? (
        <PrintingAnimation decryptedData={decrypted_text} />
      ) : (
        <div style={styles.container}>
          <div style={styles.inputContainer}>
            <textarea
              style={styles.textArea}
              value={inputText}
              onChange={handleInputChange}
              placeholder="Enter text to generate QR code"
            />
            <button
              style={styles.button}
              onClick={handleGenerateQR}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate QR Code"}
            </button>
          </div>
          <div style={styles.qrWrapper}>
            {qrCode && (
              <div style={styles.qrContainer}>
                <h3>Generated QR Code:</h3>
                <img src={qrCode} alt="QR Code" style={styles.qrCode} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    flexDirection: "row", // Change to row to display elements side by side
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginRight: "20px", // Added margin to give space between the textarea and QR code
  },
  textArea: {
    width: "600px",
    height: "400px",
    padding: "15px", // Increase padding for better spacing
    fontSize: "16px",
    lineHeight: "1.5", // Add line-height for better text spacing
    border: "2px solid #007BFF", // Add a blue border
    borderRadius: "8px", // Rounded corners
    backgroundColor: "#f9f9f9", // Light background color for the textarea
    boxShadow: "0 4px 8px rgba(0, 123, 255, 0.2)", // Subtle shadow effect
    fontFamily: "Verdana, Geneva, sans-serif", // Different font for a modern feel
    transition: "all 0.3s ease-in-out", // Smooth transition for hover effects
  },
  textAreaFocus: {
    borderColor: "#0056b3", // Change border color on focus
    boxShadow: "0 4px 10px rgba(0, 123, 255, 0.3)", // Enhance shadow on focus
  },
  button: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  qrWrapper: {
    display: "flex",
    justifyContent: "center", // Center the QR code
    alignItems: "center", // Align vertically
    width: "100%",
  },
  qrContainer: {
    textAlign: "center",
  },
  qrCode: {
    maxWidth: "300px",
    maxHeight: "300px",
    marginTop: "20px",
  },
};

export default Dashboard;
