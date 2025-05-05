from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from pymongo import MongoClient
import qrcode
from io import BytesIO
import os
from dotenv import load_dotenv
from typing import Optional
import jwt
from datetime import datetime, timedelta
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import base64

# -----------------------------
# Load Environment Variables
# -----------------------------
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
key = os.getenv("AES_SECRET_KEY")
if key is None or len(key) != 32:
    raise ValueError("AES_SECRET_KEY must be exactly 32 characters")
key = key.encode()  # convert to bytes
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# -----------------------------
# Initialize FastAPI App
# -----------------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Content-Type", "Authorization"],
)

# -----------------------------
# Database Setup
# -----------------------------
client = MongoClient(MONGO_URI)
db = client["UserDetails"]
users_collection = db["User_Info"]

# -----------------------------
# Models
# -----------------------------
class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str
    data: Optional[str] = None

class QRRequest(BaseModel):
    text: str
    url: str

# -----------------------------
# AES Encryption/Decryption
# -----------------------------
def encrypt_text(text: str, key: bytes) -> str:
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    padding_length = 16 - len(text) % 16
    padded_text = text + chr(padding_length) * padding_length
    encrypted = encryptor.update(padded_text.encode()) + encryptor.finalize()
    return base64.urlsafe_b64encode(iv + encrypted).decode('utf-8')

def decrypt_text(encrypted_text: str, key: bytes) -> str:
    try:
        encrypted_data = base64.urlsafe_b64decode(encrypted_text + '==')  # fix padding
        iv = encrypted_data[:16]
        encrypted = encrypted_data[16:]
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        decrypted_padded = decryptor.update(encrypted) + decryptor.finalize()
        padding_length = decrypted_padded[-1]
        return decrypted_padded[:-padding_length].decode('utf-8')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Decryption failed: {str(e)}")

# -----------------------------
# JWT Utilities
# -----------------------------
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=403, detail="Invalid or expired token")

# -----------------------------
# Helper
# -----------------------------
def find_user_by_email(email: str):
    return users_collection.find_one({"email": email})

# -----------------------------
# Auth Endpoints
# -----------------------------
@app.post("/api/auth/register")
async def register(user: UserRegister):
    if find_user_by_email(user.email):
        raise HTTPException(status_code=400, detail="User already exists")
    users_collection.insert_one({"email": user.email, "password": user.password})
    return {"message": "User created successfully"}

@app.post("/api/auth/login")
async def login(user: UserLogin):
    user_in_db = find_user_by_email(user.email)
    if not user_in_db or user.password != user_in_db.get("password"):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.email})
    response = {"access_token": token, "token_type": "bearer"}

    if user.data:
        decrypted = decrypt_text(user.data, key)
        response["decrypted_data"] = decrypted

    return response

@app.get("/api/auth/me")
async def get_current_user(authorization: str = Header(...)):
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    return {"user": {"email": payload["sub"]}}

# -----------------------------
# QR Code Generator
# -----------------------------
@app.post("/api/qrcode")
async def generate_qr(qr_request: QRRequest):
    text = qr_request.text
    if not text:
        raise HTTPException(status_code=400, detail="Missing text in request")

    encrypted_text = encrypt_text(text, key)
    redirect_url = f"http://localhost:3000/Login?data={encrypted_text}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(redirect_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return StreamingResponse(buffer, media_type="image/png")

# -----------------------------
# Run Server
# -----------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
