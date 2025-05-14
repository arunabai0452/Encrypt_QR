# lambda_handler.py
from app.app import app
from mangum import Mangum

# Lambda handler (entry point for AWS Lambda)
handler = Mangum(app)
