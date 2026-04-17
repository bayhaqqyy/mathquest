import os
import random
import io
import base64
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sympy as sp
import matplotlib.pyplot as plt
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Initialize FastAPI
app = FastAPI(title="MathQuest Engine")

# Add CORS fallback (though Go API will call this internally, good for testing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    
# Use gemini-1.5-flash for speed and efficiency
generation_config = {
    "temperature": 0.3,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

class GenerateRequest(BaseModel):
    topic: str
    difficulty: int = 1

def generate_linear_equation():
    """Generates a random linear equation ax + b = c"""
    x = sp.Symbol('x')
    
    # Random coefficients (ensure nice integer answers for level 1)
    ans = random.randint(2, 9)
    a = random.randint(2, 5)
    b = random.randint(2, 12)
    c = a * ans + b
    
    expr_left = a * x + b
    eq = sp.Eq(expr_left, c)
    
    # Format for display: "2x + 6 = 14"
    str_expr = f"{a}x + {b} = {c}"
    
    return eq, str_expr, ans, a, b, c

def generate_plot(a, b, c):
    """Generates a plot showing the intersection of y1=ax+b and y2=c"""
    plt.figure(figsize=(5, 3))
    x_vals = range(-5, 15)
    y1_vals = [a * x + b for x in x_vals]
    y2_vals = [c for _ in x_vals]
    
    plt.plot(x_vals, y1_vals, label=f'y = {a}x + {b}', color='#e8913a')
    plt.plot(x_vals, y2_vals, label=f'y = {c}', color='#006c44', linestyle='--')
    
    ans = (c - b) / a
    plt.plot(ans, c, 'ro', label=f'Solusi (x={ans})')
    
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.legend()
    plt.title("Visualisasi Persamaan")
    
    # Save to base64 buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=100)
    plt.close()
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"

@app.post("/api/engine/generate")
async def generate_problem(req: GenerateRequest):
    topic_lower = req.topic.lower()
    
    # Accept any algebra-related topic
    if topic_lower.startswith("aljabar"):
        try:
            # 1. Math Generation (SymPy)
            eq, str_expr, ans, a, b, c = generate_linear_equation()
            
            # 2. Plot Generation (Matplotlib)
            plot_b64 = generate_plot(a, b, c)
            
            # 3. AI Generation for Hints and Steps (Gemini)
            prompt = f"""Kamu adalah guru matematika yang ramah. Berikan panduan untuk soal persamaan linear berikut:
Persamaan: {str_expr}
Jawaban akhir: x = {ans}

Buatkan JSON eksklusif dengan struktur persis seperti ini:
{{
  "hints": [
    "string: Hint level 1 (ringan, pemanasan, apa yang harus dipindah)",
    "string: Hint level 2 (spesifik cara hitung)",
    "string: Hint level 3 (hampir bocoran)"
  ],
  "steps": [
    {{
      "title": "string: Judul pendek langkah (misal: 'Pindahkan Konstanta')",
      "explanation": "string: Penjelasan santai dan suportif",
      "math": "string: Eksekusi matematika murni dengan padding spasi contoh: '{a}x = {c} - {b}'"
    }}
  ]
}}
Gunakan bahasa Indonesia yang santai tapi baku (Pakai 'kamu').
"""
            
            # Fallback if Gemini fails/API key not set
            if not GEMINI_API_KEY:
                hints = ["Coba pindahkan konstanta", "Satukan semua angka tanpa x", f"Bagi kedua ruas dengan {a}"]
                steps = [
                    {"title": "Pindahkan Konstanta", "explanation": f"Kurangi kedua ruas dengan {b}", "math": f"{a}x = {c} - {b}"},
                    {"title": "Hitung Pengurangan", "explanation": "Operasikan sisi kanan", "math": f"{a}x = {c - b}"},
                    {"title": "Temukan x", "explanation": f"Bagi kedua ruas dengan {a}", "math": f"x = {ans}"}
                ]
            else:
                response = model.generate_content(prompt)
                data = json.loads(response.text)
                hints = data.get("hints", [])
                steps = data.get("steps", [])

            # Final Payload Assembly
            payload = {
                "id": f"dyn_{random.randint(1000, 9999)}",
                "question": "Selesaikan persamaan linear berikut untuk mencari nilai x:",
                "expression": str_expr,
                "answer": str(ans),
                "hints": hints,
                "steps": steps,
                "graph": plot_b64
            }
            
            return payload

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    # Fallback for other topics — generate a simple arithmetic problem
    else:
        try:
            a_val = random.randint(2, 20)
            b_val = random.randint(2, 20)
            op = random.choice(["+", "-", "*"])
            if op == "+":
                ans_val = a_val + b_val
                expr = f"{a_val} + {b_val}"
                q = "Hitung penjumlahan berikut:"
            elif op == "-":
                a_val, b_val = max(a_val, b_val), min(a_val, b_val)
                ans_val = a_val - b_val
                expr = f"{a_val} - {b_val}"
                q = "Hitung pengurangan berikut:"
            else:
                ans_val = a_val * b_val
                expr = f"{a_val} × {b_val}"
                q = "Hitung perkalian berikut:"

            return {
                "id": f"dyn_{random.randint(1000, 9999)}",
                "question": q,
                "expression": expr,
                "answer": str(ans_val),
                "hints": [
                    "Coba hitung perlahan langkah demi langkah",
                    f"Operasinya adalah: {expr}",
                    f"Jawabannya mendekati {ans_val - random.randint(1,3)} atau {ans_val + random.randint(1,3)}"
                ],
                "steps": [
                    {"title": "Identifikasi", "explanation": f"Soalnya adalah {expr}", "math": expr},
                    {"title": "Hitung", "explanation": "Lakukan operasinya", "math": f"= {ans_val}"}
                ],
                "graph": None
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
