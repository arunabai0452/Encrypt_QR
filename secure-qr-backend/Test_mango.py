import os
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Read from environment variable
MONGO_URI = os.getenv("MONGO_URI")  # Set this in a .env file
DB_NAME = "UserDetails"
COLLECTION_NAME = "User_Info"

try:
    # Initialize client with TLS
    client = MongoClient(
        MONGO_URI,
        tls=True,
        tlsAllowInvalidCertificates=False,
        serverSelectionTimeoutMS=10000  # 10 seconds timeout
    )

    # Test connection
    client.admin.command("ping")

    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    print(collection.count_documents({}), "documents found in the collection.")
    document = collection.find_one({"email": "arunabai0452@gmail.com"})
    if document:
        print("Document found:", document)
    else:
        print("No document found with the given email.")

except PyMongoError as e:
    print("Error accessing MongoDB:", e)
