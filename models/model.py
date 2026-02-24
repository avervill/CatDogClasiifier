import sys
import pathlib
from pathlib import Path, WindowsPath
from fastai.vision.all import *
from fastai.learner import load_learner

# Suppress the deprecation warning
import warnings
warnings.filterwarnings('ignore', category=UserWarning)

# Patch pathlib.PosixPath to WindowsPath for cross-platform compatibility
if sys.platform == 'win32':
    pathlib.PosixPath = WindowsPath

# Load the trained model from the same directory
model_path = Path(__file__).parent / 'model.pkl'

categories = ['dog', 'cat']

def is_cat(x): return x[0].isupper()  

learner = load_learner(model_path)



def predict_image(image):
    """
    Predict whether an image contains a cat or dog.

    Args:
        image: PIL Image object

    Returns:
        tuple: (predicted_class, probability)
    """
    # Ensure image is in RGB mode
    if image.mode != 'RGB':
        image = image.convert('RGB')

    img = image.resize((192, 192))
    pred_class, pred_idx, probs = learner.predict(img)
    return categories[pred_idx], float(probs[pred_idx])
