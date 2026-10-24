import asyncio
import json
import os
import re

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="Dreamscape API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hardcoded Sugar Rush mockup world (with patrol ranges + lava hazard)
SUGAR_RUSH_MOCK = {
    "theme": {
        "title": "Sugar Rush Nebula",
        "premise": "A whimsical candy planet where ferocious gummy bears roam sugary hills, boiling chocolate rivers carve through the valleys, and steaming espresso geysers provide lightning-fast boosts.",
        "art_style": "Vibrant pastel 16-bit pixel art with candy-cane striping, neon gummy translucency, and rich chocolate gloss",
        "assets": {
            "character": "sprites/hero.png",
            "enemy_1": "sprites/enemy.png",
            "platform": "sprites/platform.png",
            "npc": "sprites/npc.png"
        }
    },
    "level": {
        "level_id": "level_000",
        "chapter": "The Gumdrop Foothills",
        "chapter_number": 1,
        "narration": "Tread lightly on the frosted crust; the gummy prowlers are hungry, and the chocolate rapids below are scalding hot.",
        "background": "backgrounds/ch00_bg.png",
        "world": { "width": 3200, "height": 1080 },
        "platforms": [
            { "x": 0, "y": 850, "w": 3200, "h": 230, "role": "ground" },
            { "x": 420, "y": 700, "w": 192, "h": 48, "role": "platform" },
            { "x": 780, "y": 580, "w": 220, "h": 48, "role": "platform" },
            { "x": 1250, "y": 660, "w": 180, "h": 48, "role": "platform" },
            { "x": 1700, "y": 540, "w": 240, "h": 48, "role": "platform" },
            { "x": 2200, "y": 680, "w": 200, "h": 48, "role": "platform" },
            { "x": 2600, "y": 560, "w": 220, "h": 48, "role": "platform" }
        ],
        "pickups": [
            { "role": "coin", "x": 460, "y": 650 },
            { "role": "coin", "x": 820, "y": 530 },
            { "role": "health", "x": 1300, "y": 610 },
            { "role": "key", "x": 1780, "y": 490 },
            { "role": "coin", "x": 2250, "y": 630 }
        ],
        "enemies": [
            {
                "role": "enemy_1",
                "x": 1000,
                "y": 806,
                "patrol": [850, 1150],
                "behavior": "chase",
                "detect_range": 350,
                "chase_speed": 220
            },
            {
                "role": "enemy_1",
                "x": 2050,
                "y": 806,
                "patrol": [1900, 2200],
                "behavior": "chase",
                "detect_range": 400,
                "chase_speed": 240
            }
        ],
        "blocks": [],
        "hazards": [
            {
                "type": "lava",
                "x": 1400,
                "y": 830,
                "w": 300,
                "h": 50
            }
        ],
        "bounce_pads": [],
        "teleporters": [],
        "npcs": [
            {
                "role": "npc",
                "name": "Barista Bonbon",
                "x": 220,
                "y": 786,
                "dialogue": [
                    { "speaker": "Barista Bonbon", "text": "Drink up that espresso essence to outrun the gummy beasts!" },
                    { "speaker": "Barista Bonbon", "text": "Mind the molten chocolate flow ahead, and retrieve the sugar key to escape." }
                ]
            }
        ],
        "exit": {
            "role": "exit_door",
            "x": 3000,
            "y": 658,
            "w": 128,
            "h": 192,
            "unlock_condition": "has_key",
            "locked_dialogue": "Find the sugar key to unseal the candy vault.",
            "target_level": "level_001"
        },
        "player_spawn": { "x": 60, "y": 780 },
        "physics": {
            "gravity": 1200,
            "jump_force": -520,
            "move_speed": 420,
            "max_fall_speed": 600,
            "friction": 800,
            "coyote_time_ms": 80,
            "jump_buffer_ms": 100
        },
        "mechanics": {
            "double_jump": True,
            "gravity_scale": 1.0,
            "player_action": "none",
            "weather": "none"
        }
    }
}


class CreateStoryBody(BaseModel):
    prompt: str


@app.get("/health")
def health():
    return {"ok": True, "mode": "mock"}


@app.post("/api/create-story")
async def create_story(body: CreateStoryBody):
    # Simulated ~1s delay in mock mode, no Gemini API key required
    await asyncio.sleep(1.0)
    return SUGAR_RUSH_MOCK
