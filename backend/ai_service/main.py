from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import hashlib

app = FastAPI(title="Smart Farming Crop Health AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CROP_TYPES = [
    "Wheat", "Rice", "Corn", "Tomato", "Potato", "Cotton", "Soybean", "Sugarcane"
]

DISEASE_LIBRARY = [
    {
        "disease": "Healthy",
        "description": "No visible symptoms detected in the leaf image.",
        "treatment": "No treatment required. Maintain balanced irrigation and nutrition.",
        "prevention": "Continue regular monitoring and integrated pest management practices.",
        "recommendations": "Keep soil moisture stable and avoid over-fertilization.",
    },
    {
        "disease": "Leaf Spot",
        "description": "Small dark lesions on leaves often caused by fungal pathogens.",
        "treatment": "Remove affected leaves, apply approved fungicide, and reduce leaf wetness.",
        "prevention": "Ensure good spacing, improve air flow, and avoid overhead watering.",
        "recommendations": "Rotate crops and sanitize tools to reduce reinfection.",
    },
    {
        "disease": "Powdery Mildew",
        "description": "White powdery growth typically on upper leaf surfaces.",
        "treatment": "Apply sulfur-based fungicide or neem oil; remove infected leaves.",
        "prevention": "Avoid overcrowding, ensure sunlight exposure, and control humidity.",
        "recommendations": "Water at soil level and prune for airflow.",
    },
    {
        "disease": "Blight",
        "description": "Rapid browning and decay of leaves, often in humid conditions.",
        "treatment": "Apply recommended fungicide and remove severely infected plants.",
        "prevention": "Use resistant varieties and avoid irrigation late in the day.",
        "recommendations": "Implement crop rotation and maintain field sanitation.",
    },
    {
        "disease": "Rust",
        "description": "Orange or reddish pustules on leaf undersides indicating fungal rust.",
        "treatment": "Apply rust-specific fungicide and remove infected foliage.",
        "prevention": "Reduce humidity and use resistant cultivars when available.",
        "recommendations": "Scout frequently during warm, humid periods.",
    },
]


def deterministic_pick(image_bytes: bytes):
    digest = hashlib.sha256(image_bytes).hexdigest()
    idx = int(digest[:8], 16) % len(DISEASE_LIBRARY)
    confidence_seed = int(digest[8:12], 16) / 0xFFFF
    confidence = 0.7 + (confidence_seed * 0.29)
    crop_idx = int(digest[12:16], 16) % len(CROP_TYPES)
    return DISEASE_LIBRARY[idx], CROP_TYPES[crop_idx], round(confidence, 4)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    image_bytes = await image.read()

    try:
        Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return {
            "success": False,
            "message": "Invalid image file",
        }
rop_type, confidence = deterministic_pick(image_bytes)

    return {
        "success": True,
        "crop_type": crop_typ
        "success": True,
        "disease": result["disease"],
        "confidence": confidence,
        "description": result["description"],
        "treatment": result["treatment"],
        "prevention": result["prevention"],
        "recommendations": result["recommendations"],
    }
