import bcrypt
import jwt
import os
from models import users_collection
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")

async def verify_user(email: str, password: str):
    user = await users_collection.find_one({"email": email})
    if not user:
        return None
    if bcrypt.checkpw(password.encode(), user["passwordHash"].encode()):
        token = jwt.encode({"email": user["email"]}, JWT_SECRET, algorithm="HS256")
        return {"token": token, "email": user["email"]}
    return None
