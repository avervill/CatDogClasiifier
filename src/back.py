from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import numpy as np
from PIL import Image
import io
import sys
from pathlib import Path
from pydantic import BaseModel

# Add parent directory to path to import models
sys.path.insert(0, str(Path(__file__).parent.parent))

from models.model import predict_image

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Mount static files
app.mount("/static", StaticFiles(directory=str(Path(__file__).parent / "front")), name="static")

@app.get("/")
async def root():
    return FileResponse(Path(__file__).parent / "front" / "index.html")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Endpoint to predict whether an image contains a cat or dog.

    Args:
        file: Uploaded image file

    Returns:
        JSON response with predicted class and probability
    """
    try:
        # Check if file is an image
        if not file.content_type.startswith('image/'):
            raise ValueError("Uploaded file is not an image")
        
        # Read the uploaded file contents
        contents = await file.read()
        
        if not contents:
            raise ValueError("Uploaded file is empty")
        
        # Verify the image is valid
        try:
            temp_image = Image.open(io.BytesIO(contents))
            temp_image.verify()
        except Exception as e:
            raise ValueError(f"Invalid or corrupted image file: {e}")
        
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(contents))
        
        # Ensure image is in RGB mode
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        print(f"Image mode: {image.mode}, size: {image.size}")  # Debug info
        
        # Call the predict_image function
        predicted_class, probability = predict_image(image)
        
        return JSONResponse(
            status_code=200,
            content={
                "prediction": predicted_class,
                "probability": float(probability)
            }
        )
    except Exception as e:
        import traceback
        error_details = {
            "error": str(e),
            "error_type": type(e).__name__,
            "traceback": traceback.format_exc()
        }
        print(f"Error in prediction: {error_details}")  # For debugging
        return JSONResponse(
            status_code=400,
            content={
                "error": error_details["error"],
                "error_type": error_details["error_type"],
                "traceback": error_details["traceback"]
            })
