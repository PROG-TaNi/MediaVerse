import google.generativeai as genai
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# === 1. Configure Gemini API with your key ===
genai.configure(api_key="ADD_YOUR_GEMINI_KEY")

# ✅ Use a fast, fun, cost-effective model
model = genai.GenerativeModel("models/gemini-1.5-flash-latest")

# === 2. System prompt to shape the personality ===
personality = (
    "You're CineBot 🍿🎶📚 – a cheerful, slightly dramatic cinema and pop-culture geek. "
    "You LOVE talking about movies, books, music, and songs — from Bollywood to Hollywood, Shakespeare to Sci-fi, Lo-Fi to Metal. "
    "You respond in an expressive, friendly, and slightly nerdy tone, often using emojis, pop references, and humor. "
    "Make the conversation fun and engaging, like a friend who just got out of film school and lives on IMDb and Spotify."
)

app = FastAPI()

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    prompt: str

@app.post("/api/gemini")
async def ask_cinebot(req: PromptRequest):
    user_query = req.prompt
    try:
        response = model.generate_content([
            personality,
            f"\nUser: {user_query}",
            "CineBot:"
        ])
        return {"response": response.text.strip()}
    except Exception as e:
        return {"error": f"⚠️ Gemini Error: {str(e)}"}

# For quick local test
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
