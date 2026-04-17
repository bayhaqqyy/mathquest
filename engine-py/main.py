import os
import random
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
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

# Initialize OpenRouter (OpenAI compatible)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
client = None

if OPENROUTER_API_KEY:
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY,
    )

# Use OpenRouter's free router by default. Override with OPENROUTER_MODEL for paid models.
MODEL_NAME = os.getenv("OPENROUTER_MODEL", "openrouter/free")

class GenerateRequest(BaseModel):
    topic: str
    difficulty: int = 1

TOPIC_SKILLS = {
    "aljabar": {
        "name": "Aljabar",
        "skills": {
            "penjumlahan": "Penjumlahan & Pengurangan Aljabar",
            "perkalian": "Perkalian & Pembagian Aljabar",
            "pecahan": "Pecahan Aljabar",
            "variabel": "Variabel & Ekspresi",
            "linear": "Persamaan Linear",
            "kuadrat": "Persamaan Kuadrat",
            "sistem": "Sistem Persamaan",
        },
        "answer_label": "x",
    },
    "probabilitas": {
        "name": "Probabilitas",
        "skills": {
            "counting": "Prinsip Pencacahan",
            "permutasi": "Permutasi",
            "kombinasi": "Kombinasi",
            "peluang": "Peluang Dasar",
        },
        "answer_label": "Jawaban",
    },
    "aritmatika": {
        "name": "Aritmatika",
        "skills": {
            "bilangan": "Bilangan Bulat",
            "operasi": "Operasi Dasar",
            "fpb-kpk": "FPB & KPK",
            "pola": "Pola Bilangan",
            "barisan": "Barisan & Deret",
        },
        "answer_label": "Jawaban",
    },
}

def split_topic(topic):
    parts = [part.strip().lower() for part in topic.split("/") if part.strip()]
    topic_id = parts[0] if parts else ""
    skill_id = parts[1] if len(parts) > 1 else ""
    return topic_id, skill_id

def make_payload(question, expression, answer, hints, steps, graph=None, answer_label="Jawaban", accepted_answers=None):
    accepted = [str(answer)]
    if accepted_answers:
        accepted.extend(str(item) for item in accepted_answers)

    return {
        "id": f"dyn_{random.randint(1000, 9999)}",
        "question": question,
        "expression": expression,
        "answer": str(answer),
        "acceptedAnswers": list(dict.fromkeys(accepted)),
        "answerLabel": answer_label,
        "hints": hints,
        "steps": steps,
        "graph": graph
    }

def extract_json_object(content):
    text = content.strip()
    if "```" in text:
        blocks = text.split("```")
        text = blocks[1] if len(blocks) > 1 else text
        if text.strip().lower().startswith("json"):
            text = text.strip()[4:]

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("AI response does not contain a JSON object")

    return json.loads(text[start:end + 1])

def validate_ai_problem(data, topic_id, skill_id):
    required_strings = ["question", "expression", "answer"]
    for key in required_strings:
        if not isinstance(data.get(key), str) or not data[key].strip():
            raise ValueError(f"AI response missing {key}")

    hints = data.get("hints")
    if not isinstance(hints, list) or len(hints) < 2 or not all(isinstance(item, str) and item.strip() for item in hints):
        raise ValueError("AI response must include at least two hints")

    steps = data.get("steps")
    if not isinstance(steps, list) or len(steps) < 2:
        raise ValueError("AI response must include at least two steps")

    clean_steps = []
    for step in steps:
        if not isinstance(step, dict):
            raise ValueError("AI step must be an object")
        title = str(step.get("title", "")).strip()
        explanation = str(step.get("explanation", "")).strip()
        math_text = str(step.get("math", "")).strip()
        if not title or not explanation or not math_text:
            raise ValueError("AI step must include title, explanation, and math")
        clean_steps.append({"title": title, "explanation": explanation, "math": math_text})

    if topic_id == "probabilitas":
        combined = f"{data['question']} {data['expression']}".lower()
        probability_terms = [
            "peluang", "kemungkinan", "acak", "kombinasi", "permutasi",
            "susunan", "pilihan", "cara", "pencacahan", "dadu", "kartu", "bola"
        ]
        arithmetic_only_terms = ["hitung penjumlahan", "hitung pengurangan", "hitung perkalian"]
        if not any(term in combined for term in probability_terms):
            raise ValueError("AI problem does not match probabilitas")
        if any(term in combined for term in arithmetic_only_terms):
            raise ValueError("AI problem looks like plain arithmetic")

    accepted = data.get("acceptedAnswers", [])
    if accepted is not None and not isinstance(accepted, list):
        accepted = []

    return make_payload(
        data["question"].strip(),
        data["expression"].strip(),
        data["answer"].strip(),
        [item.strip() for item in hints if item.strip()],
        clean_steps,
        graph=None,
        answer_label=str(data.get("answerLabel") or TOPIC_SKILLS[topic_id]["answer_label"]).strip(),
        accepted_answers=[str(item).strip() for item in accepted if str(item).strip()]
    )

def generate_ai_problem(topic_id, skill_id, difficulty):
    if not client:
        return None

    topic = TOPIC_SKILLS.get(topic_id)
    if not topic:
        raise ValueError(f"Topik belum didukung: {topic_id}")

    skill_name = topic["skills"].get(skill_id, "Dasar")
    topic_name = topic["name"]
    seed = random.randint(100000, 999999)

    prompt = f"""
Kamu adalah generator soal matematika adaptif untuk aplikasi belajar.
Buat SATU soal baru yang benar-benar sesuai topik dan subtopik berikut.

Topik: {topic_name}
Subtopik: {skill_name}
Difficulty: {difficulty}
Seed variasi: {seed}

Aturan wajib:
- Soal harus sesuai subtopik, bukan operasi hitung umum kecuali subtopiknya memang aritmatika.
- Untuk topik Probabilitas, soal harus tentang pencacahan, permutasi, kombinasi, atau peluang. Jangan buat soal penjumlahan/pengurangan/perkalian biasa.
- Gunakan angka kecil dan jawaban yang mudah diverifikasi.
- Jawaban akhir harus berupa string singkat, misalnya "12", "3/5", "40%", atau "x = 4" jangan dipakai; cukup "4".
- acceptedAnswers boleh memuat format jawaban lain yang setara.
- Balas hanya JSON valid, tanpa markdown.

Format JSON:
{{
  "question": "instruksi soal dalam Bahasa Indonesia",
  "expression": "isi soal atau ekspresi yang ditampilkan",
  "answer": "jawaban akhir",
  "acceptedAnswers": ["format jawaban lain yang juga benar"],
  "answerLabel": "label pendek input jawaban",
  "hints": ["hint 1", "hint 2", "hint 3"],
  "steps": [
    {{"title": "judul", "explanation": "penjelasan singkat", "math": "langkah matematika"}}
  ]
}}
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": "Balas hanya JSON valid untuk soal matematika. Jangan menambahkan teks lain."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.9,
    )

    content = response.choices[0].message.content
    data = extract_json_object(content)
    payload = validate_ai_problem(data, topic_id, skill_id)
    payload["source"] = "ai"
    return payload

@app.post("/api/engine/generate")
async def generate_problem(req: GenerateRequest):
    topic_id, skill_id = split_topic(req.topic)

    if topic_id in TOPIC_SKILLS:
        try:
            ai_payload = generate_ai_problem(topic_id, skill_id, req.difficulty)
            if ai_payload:
                return ai_payload
            raise HTTPException(status_code=503, detail="AI generator belum aktif. Periksa OPENROUTER_API_KEY.")
        except HTTPException:
            raise
        except Exception as ai_err:
            print(f"AI problem generation failed: {ai_err}")
            if "402" in str(ai_err) or "Insufficient credits" in str(ai_err):
                raise HTTPException(
                    status_code=402,
                    detail="OpenRouter menolak request karena credit tidak cukup. Pakai OPENROUTER_MODEL=openrouter/free atau tambah credit."
                )
            raise HTTPException(status_code=502, detail="AI gagal generate soal yang valid. Coba lagi.")
    raise HTTPException(status_code=400, detail=f"Topik belum didukung: {req.topic}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
