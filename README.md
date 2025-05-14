# 🔐 Safe Data Sharing using Encrypted QR Code Generator

A secure and user-friendly platform that enables safe transmission of sensitive information using AES-256 encryption and QR code technology. Built with FastAPI, React.js, MongoDB, and optionally deployable on AWS Lambda.

---

## 🚀 Features

- 🔒 AES-256 Encryption for strong data confidentiality
- 📲 QR Code generation for encrypted data sharing
- 👥 JWT-based user authentication system
- 🌐 React-based frontend for usability and responsiveness
- ☁️ Cloud-ready backend with Docker and AWS Lambda support
- 🗃️ MongoDB for lightweight credential storage

---

## 🧱 System Architecture

User --> React.js (Frontend)
--> Zustand (State)
--> Zod (Validation)

React.js --> HTTPS --> FastAPI (Backend)
--> PyJWT (Authentication)
--> Cryptography (AES-256)
--> qrcode (QR generation)
--> MongoDB (Storage)

FastAPI --> Docker or --> Mangum --> AWS Lambda
React.js --> Vercel / Netlify / S3


---

## 🖥️ Tech Stack

| Layer       | Technology                   |
|-------------|------------------------------|
| Frontend    | React.js, Zustand, Zod       |
| Backend     | FastAPI, PyJWT, Cryptography |
| QR Encoding | `qrcode` Python package      |
| Database    | MongoDB                      |
| Deployment  | Docker, AWS Lambda, Vercel   |

---

# 🛠️ Setup Instructions

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/encrypted-qr-share.git
cd encrypted-qr-share

---

**## 2. Backend Setup (FastAPI)**
cd backend
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload

---

**## 3. Frontend Setup (React)**
cd frontend
npm install
npm start
