# Crop Health AI Service (Local)

This is a minimal local AI service used by the Smart Farming backend.

## Endpoints
- `GET /health`
- `POST /predict` (multipart form, field name: `image`)

## Run
1. Create a Python environment
2. Install requirements
3. Start the service:

`uvicorn main:app --host 0.0.0.0 --port 8001`

## Backend Integration
Set this in backend `.env`:

`AI_SERVICE_URL=http://localhost:8001/predict`

The backend will forward images from `/api/crop-health/analyze` to this service.
