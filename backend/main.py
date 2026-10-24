# Dreamscape Backend
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Dreamscape Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StoryRequest(BaseModel):
    prompt: str

@app.get("/")
def read_root():
    return {"message": "Dreamscape API running"}

@app.post("/create-story")
def create_story(request: StoryRequest):
    # World generation logic to be populated
    return {
        "status": "received",
        "prompt": request.prompt
    }
