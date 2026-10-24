import json
import os
import re

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("Set GEMINI_API_KEY in backend/.env")

client = genai.Client(api_key=API_KEY)

app = FastAPI(title="Dreamscape API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM = """
You are the world-generation engine for "Dreamscape", a 2D sprite platformer.
Output ONLY raw valid JSON with "theme" and "level". No markdown, no prose.

Physics (pixels): gravity 800-2000 (std 1200), jump_force -350 to -800 (std -500),
move_speed 150-600 (std 300). Also include max_fall_speed 600, friction 800,
coyote_time_ms 80, jump_buffer_ms 100.

mechanics is an OBJECT not an array:
{"double_jump": false, "gravity_scale": 1.0, "player_action": "none", "weather": "none"}

theme.assets keys exactly: character, enemy_1, platform, npc
Use paths like: sprites/hero.png, sprites/enemy.png, sprites/platform.png, sprites/npc.png

level must include:
level_id, chapter, chapter_number, narration, background,
world {width, height}, platforms[], pickups[], enemies[], blocks[], hazards[],
bounce_pads[], teleporters[], npcs[], exit, player_spawn, physics, mechanics.

platforms: {x,y,w,h,role} role is "ground" or "platform". One full-width ground around y=850.
enemies: {role:"enemy_1", x,y, patrol:[minX,maxX], behavior:"patrol"|"chase"}
  chase may include detect_range, chase_speed. Always include patrol.
pickups: {role:"coin"|"key"|"health", x,y}
hazards: {type:"lava"|"spikes"|"acid", x,y,w,h}
npcs: {role:"npc", name, x,y, dialogue:[{speaker,text}]} text only, no audio.
exit: {role:"exit_door", x,y,w,h, unlock_condition, locked_dialogue, target_level}
Use w/h not width/height. world e.g. width 3200 height 1080.
background path e.g. backgrounds/ch00_bg.png
""".strip()


class CreateStoryBody(BaseModel):
    prompt: str


def extract_json(text: str) -> dict:
    text = (text or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return json.loads(text)


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/api/create-story")
def create_story(body: CreateStoryBody):
    prompt = body.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="prompt is required")

    try:
        resp = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"{SYSTEM}\n\nStory idea:\n{prompt}",
            config={"response_mime_type": "application/json"},
        )
        data = extract_json(resp.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini failed: {e}") from e

    if "theme" not in data or "level" not in data:
        raise HTTPException(status_code=500, detail="Response missing theme or level")

    return data
