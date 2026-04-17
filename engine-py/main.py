import os
import random
import json
import math
from fractions import Fraction
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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

# AI generation is disabled for now; local generators provide fast deterministic problems.
client = None
OPENROUTER_MAX_TOKENS = int(os.getenv("OPENROUTER_MAX_TOKENS", "520"))
OPENROUTER_PROVIDER_SORT = os.getenv("OPENROUTER_PROVIDER_SORT", "latency")
MODEL_NAME = os.getenv("OPENROUTER_MODEL", "arcee-ai/trinity-large-preview:free")

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
    "geometri": {
        "name": "Geometri",
        "skills": {
            "titik-garis": "Titik, Garis & Bidang",
            "sudut": "Sudut",
            "segitiga": "Segitiga",
            "segiempat": "Segiempat",
            "lingkaran": "Lingkaran",
        },
        "answer_label": "Jawaban",
    },
    "trigonometri": {
        "name": "Trigonometri",
        "skills": {
            "sudut-tri": "Sudut & Pengukuran",
            "rasio": "Rasio Trigonometri",
            "identitas": "Identitas Trigonometri",
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

def fraction_answer(numerator, denominator):
    frac = Fraction(numerator, denominator)
    answer = f"{frac.numerator}/{frac.denominator}" if frac.denominator != 1 else str(frac.numerator)
    accepted = [str(float(frac))]
    if frac.denominator != 1:
        accepted.append(f"{frac.numerator * 100 / frac.denominator:g}%")
    return answer, accepted

def clamp_difficulty(difficulty):
    return max(1, min(int(difficulty or 1), 5))

def generate_algebra_problem(skill_id, difficulty=1):
    difficulty = clamp_difficulty(difficulty)
    if skill_id == "penjumlahan":
        a, b, c = random.randint(4, 12), random.randint(3, 11), random.randint(2, 9)
        if difficulty >= 3:
            ans = a + b - c
            expression = f"{a}x + {b}x - {c}x"
            step_math = f"({a} + {b} - {c})x = {ans}x"
        else:
            ans = a + b
            expression = f"{a}x + {b}x"
            step_math = f"({a} + {b})x = {ans}x"
        return make_payload(
            "Sederhanakan bentuk aljabar berikut dengan menggabungkan semua suku sejenis:",
            expression,
            f"{ans}x",
            ["Gabungkan suku yang sama-sama memiliki x.", "Jumlahkan koefisiennya saja."],
            [
                {"title": "Suku Sejenis", "explanation": "Semua suku memuat variabel x.", "math": expression},
                {"title": "Jumlahkan Koefisien", "explanation": "Operasikan angka di depan x.", "math": step_math},
            ],
            answer_label="Bentuk sederhana",
            accepted_answers=[f"{ans}*x", f"{ans} x"]
        )

    if skill_id == "perkalian":
        a, b, c = random.randint(2, 5), random.randint(2, 6), random.randint(1, 8)
        coef, const = a * b, a * c
        return make_payload(
            "Gunakan sifat distributif untuk mengembangkan bentuk berikut:",
            f"{a}({b}x + {c})",
            f"{coef}x + {const}",
            ["Kalikan angka di luar kurung ke setiap suku.", f"Kalikan {a} dengan {b}x dan {a} dengan {c}."],
            [
                {"title": "Distribusi", "explanation": "Kalikan faktor luar ke semua suku di dalam kurung.", "math": f"{a} x {b}x + {a} x {c}"},
                {"title": "Sederhanakan", "explanation": "Hitung hasil masing-masing perkalian.", "math": f"{coef}x + {const}"},
            ],
            answer_label="Hasil",
            accepted_answers=[f"{coef}x+{const}"]
        )

    if skill_id == "pecahan":
        a, b = random.choice([(1, 2), (1, 3), (2, 3), (3, 4)])
        c, d = random.choice([(1, 4), (1, 6), (1, 3), (2, 5)])
        frac = Fraction(a, b) + Fraction(c, d)
        answer = f"{frac.numerator}/{frac.denominator}" if frac.denominator != 1 else str(frac.numerator)
        return make_payload(
            "Hitung hasil penjumlahan pecahan berikut:",
            f"{a}/{b} + {c}/{d}",
            answer,
            ["Samakan penyebut terlebih dahulu.", "Jumlahkan pembilang setelah penyebut sama."],
            [
                {"title": "Samakan Penyebut", "explanation": "Ubah pecahan agar memiliki penyebut yang sama.", "math": f"{a}/{b} + {c}/{d}"},
                {"title": "Jumlahkan", "explanation": "Jumlahkan lalu sederhanakan.", "math": f"= {answer}"},
            ],
            accepted_answers=[str(float(frac))]
        )

    if skill_id == "variabel":
        x_val, a, b = random.randint(2, 9), random.randint(2, 6), random.randint(1, 12)
        ans = a * x_val + b
        return make_payload(
            f"Jika x = {x_val}, tentukan nilai ekspresi berikut:",
            f"{a}x + {b}",
            ans,
            ["Ganti x dengan nilai yang diberikan.", "Kerjakan perkalian sebelum penjumlahan."],
            [
                {"title": "Substitusi", "explanation": f"Ganti x dengan {x_val}.", "math": f"{a}({x_val}) + {b}"},
                {"title": "Hitung", "explanation": "Kalikan lalu jumlahkan.", "math": f"{a * x_val} + {b} = {ans}"},
            ]
        )

    if skill_id == "kuadrat":
        ans = random.randint(2, 10)
        c = ans * ans
        return make_payload(
            "Tentukan nilai x positif dari persamaan kuadrat sederhana berikut:",
            f"x^2 = {c}",
            ans,
            ["Cari bilangan yang jika dikuadratkan menghasilkan angka tersebut.", "Gunakan akar kuadrat positif."],
            [
                {"title": "Akar Kuadrat", "explanation": "Ambil akar kuadrat kedua ruas.", "math": f"x = sqrt({c})"},
                {"title": "Hasil", "explanation": "Gunakan nilai positif sesuai soal.", "math": f"x = {ans}"},
            ],
            answer_label="x"
        )

    if skill_id == "sistem":
        x, y = random.randint(2, 8), random.randint(1, 7)
        s, d = x + y, x - y
        return make_payload(
            "Tentukan nilai x dan y dari sistem berikut:",
            f"x + y = {s}; x - y = {d}",
            f"x={x}, y={y}",
            ["Jumlahkan kedua persamaan untuk menghilangkan y.", "Setelah x ditemukan, substitusi ke salah satu persamaan."],
            [
                {"title": "Eliminasi y", "explanation": "Jumlahkan kedua persamaan.", "math": f"2x = {s + d}"},
                {"title": "Cari x dan y", "explanation": "Bagi dua lalu substitusi.", "math": f"x = {x}, y = {y}"},
            ],
            accepted_answers=[f"{x},{y}", f"x={x},y={y}"]
        )

    ans = random.randint(3, 14)
    a, b, d = random.randint(2, 7), random.randint(4, 18), random.randint(1, 5)
    if difficulty >= 3:
        c = (a + d) * ans + b
        expression = f"{a}x + {b} = {c} - {d}x"
        steps = [
            {"title": "Kumpulkan Suku x", "explanation": "Pindahkan -dx ke ruas kiri.", "math": f"{a}x + {d}x = {c} - {b}"},
            {"title": "Sederhanakan", "explanation": "Gabungkan suku x dan hitung ruas kanan.", "math": f"{a + d}x = {c - b}"},
            {"title": "Cari x", "explanation": f"Bagi kedua ruas dengan {a + d}.", "math": f"x = {(c - b)} / {a + d} = {ans}"},
        ]
        hints = ["Pindahkan semua suku x ke satu ruas.", "Pindahkan konstanta ke ruas lain.", f"Bagi dengan koefisien akhir x."]
    else:
        c = a * ans + b
        expression = f"{a}x + {b} = {c}"
        steps = [
            {"title": "Pindahkan Konstanta", "explanation": f"Kurangi kedua ruas dengan {b}.", "math": f"{a}x = {c} - {b}"},
            {"title": "Cari x", "explanation": f"Bagi kedua ruas dengan {a}.", "math": f"x = {(c - b)} / {a} = {ans}"},
        ]
        hints = ["Pindahkan konstanta ke ruas kanan.", f"Bagi kedua ruas dengan {a}."]
    return make_payload("Selesaikan persamaan linear berikut untuk mencari nilai x:", expression, ans, hints, steps, answer_label="x")

def generate_probability_problem(skill_id, difficulty=1):
    difficulty = clamp_difficulty(difficulty)
    if skill_id == "permutasi":
        n, r = random.randint(5, 8), random.randint(2, 4)
        ans = math.factorial(n) // math.factorial(n - r)
        return make_payload(
            "Berapa banyak susunan berbeda yang dapat dibuat?",
            f"Pilih dan susun {r} orang dari {n} orang",
            ans,
            ["Karena urutan diperhatikan, gunakan permutasi.", f"Gunakan P({n},{r})."],
            [
                {"title": "Rumus", "explanation": "Permutasi memperhatikan urutan.", "math": f"P({n},{r}) = {n}! / ({n-r})!"},
                {"title": "Hitung", "explanation": "Kalikan faktor menurun.", "math": f"P({n},{r}) = {ans}"},
            ],
            answer_label="Jumlah susunan"
        )

    if skill_id == "kombinasi":
        n, r = random.randint(6, 10), random.randint(2, 4)
        ans = math.comb(n, r)
        return make_payload(
            "Berapa banyak kelompok berbeda yang dapat dibuat?",
            f"Pilih {r} orang dari {n} orang",
            ans,
            ["Karena urutan tidak diperhatikan, gunakan kombinasi.", f"Gunakan C({n},{r})."],
            [
                {"title": "Rumus", "explanation": "Kombinasi tidak memperhatikan urutan.", "math": f"C({n},{r}) = {n}! / ({r}!({n-r})!)"},
                {"title": "Hitung", "explanation": "Sederhanakan faktorialnya.", "math": f"C({n},{r}) = {ans}"},
            ],
            answer_label="Jumlah kelompok"
        )

    if skill_id == "peluang":
        target, other = random.randint(3, 9), random.randint(4, 10)
        extra = random.randint(2, 8) if difficulty >= 3 else 0
        total = target + other + extra
        answer, accepted = fraction_answer(target, total)
        expression = f"{target} bola merah, {other} bola biru"
        if extra:
            expression += f", dan {extra} bola hijau"
        return make_payload(
            "Dalam sebuah kotak terdapat beberapa bola berwarna. Jika satu bola diambil secara acak, tentukan peluang terambil bola merah:",
            expression,
            answer,
            ["Peluang = kejadian yang diinginkan / semua kemungkinan.", "Jumlahkan semua bola sebagai penyebut.", "Sederhanakan pecahan jika memungkinkan."],
            [
                {"title": "Kejadian", "explanation": "Kejadian yang diminta adalah bola merah.", "math": f"merah = {target}"},
                {"title": "Total Kemungkinan", "explanation": "Jumlahkan semua bola di kotak.", "math": f"total = {total}"},
                {"title": "Peluang", "explanation": "Bagi jumlah bola merah dengan total bola.", "math": f"{target}/{total} = {answer}"},
            ],
            answer_label="Peluang",
            accepted_answers=accepted
        )

    food, drink = random.randint(3, 6), random.randint(2, 5)
    ans = food * drink
    return make_payload(
        "Gunakan prinsip pencacahan untuk menentukan banyak pilihan paket:",
        f"{food} pilihan makanan dan {drink} pilihan minuman",
        ans,
        ["Pilih satu makanan dan satu minuman.", "Gunakan aturan perkalian."],
        [
            {"title": "Tahap Pilihan", "explanation": "Ada dua tahap: makanan lalu minuman.", "math": f"{food} dan {drink}"},
            {"title": "Kalikan", "explanation": "Kalikan banyak pilihan tiap tahap.", "math": f"{food} x {drink} = {ans}"},
        ],
        answer_label="Jumlah paket"
    )

def generate_arithmetic_problem(skill_id, difficulty=1):
    difficulty = clamp_difficulty(difficulty)
    if skill_id == "fpb-kpk":
        a, b = random.randint(12, 48), random.randint(12, 48)
        use_fpb = random.choice([True, False])
        fpb = math.gcd(a, b)
        if use_fpb:
            return make_payload(
                "Tentukan FPB dari dua bilangan berikut:",
                f"FPB({a}, {b})",
                fpb,
                ["Cari faktor kedua bilangan.", "Ambil faktor persekutuan terbesar."],
                [
                    {"title": "Faktor", "explanation": "Bandingkan faktor kedua bilangan.", "math": f"{a} dan {b}"},
                    {"title": "FPB", "explanation": "Faktor persekutuan terbesar adalah jawabannya.", "math": f"FPB = {fpb}"},
                ]
            )
        kpk = abs(a * b) // fpb
        return make_payload(
            "Tentukan KPK dari dua bilangan berikut:",
            f"KPK({a}, {b})",
            kpk,
            ["Gunakan hubungan KPK dan FPB.", "KPK = a x b / FPB."],
            [
                {"title": "Cari FPB", "explanation": "Tentukan pembagi terbesar.", "math": f"FPB = {fpb}"},
                {"title": "KPK", "explanation": "Kalikan lalu bagi FPB.", "math": f"{a} x {b} / {fpb} = {kpk}"},
            ]
        )

    if skill_id in ["pola", "barisan"]:
        start, diff = random.randint(2, 10), random.randint(2, 8)
        seq = [start + diff * i for i in range(4)]
        ans = start + diff * 4
        return make_payload(
            "Tentukan bilangan berikutnya dari pola berikut:",
            ", ".join(str(item) for item in seq) + ", ...",
            ans,
            ["Cari selisih antarbilangan.", "Tambahkan selisih ke suku terakhir."],
            [
                {"title": "Selisih", "explanation": "Bandingkan dua suku berurutan.", "math": f"{seq[1]} - {seq[0]} = {diff}"},
                {"title": "Suku Berikutnya", "explanation": "Tambahkan selisih ke suku terakhir.", "math": f"{seq[-1]} + {diff} = {ans}"},
            ]
        )

    a, b = random.randint(20, 90), random.randint(12, 60)
    c = random.randint(3, 12)
    op = random.choice(["+", "-", "*"])
    if op == "+":
        ans, expr, question = a + b + (c if difficulty >= 3 else 0), f"{a} + {b}" + (f" + {c}" if difficulty >= 3 else ""), "Selesaikan operasi penjumlahan berikut:"
    elif op == "-":
        a, b = max(a, b), min(a, b)
        ans, expr, question = a - b - (c if difficulty >= 3 and a - b > c else 0), f"{a} - {b}" + (f" - {c}" if difficulty >= 3 and a - b > c else ""), "Selesaikan operasi pengurangan berikut:"
    else:
        b = random.randint(6, 18)
        ans, expr, question = a * b, f"{a} x {b}", "Selesaikan operasi perkalian berikut:"
    return make_payload(
        question,
        expr,
        ans,
        ["Perhatikan operasi yang diminta.", "Hitung dengan teliti."],
        [
            {"title": "Identifikasi", "explanation": "Tentukan operasinya.", "math": expr},
            {"title": "Hitung", "explanation": "Kerjakan operasi tersebut.", "math": f"= {ans}"},
        ]
    )

def generate_geometry_problem(skill_id, difficulty=1):
    difficulty = clamp_difficulty(difficulty)
    if skill_id == "titik-garis":
        x1, y1 = random.randint(-6, 6), random.randint(-6, 6)
        dx, dy = random.choice([(6, 8), (8, 6), (5, 12), (9, 12), (12, 5)])
        x2, y2 = x1 + dx, y1 + dy
        if difficulty >= 3:
            mx, my = (x1 + x2) / 2, (y1 + y2) / 2
            answer = f"({mx:g},{my:g})"
            return make_payload(
                "Diketahui dua titik pada bidang koordinat. Tentukan titik tengah ruas garis AB:",
                f"A({x1},{y1}) dan B({x2},{y2})",
                answer,
                ["Gunakan rumus titik tengah.", "Rata-ratakan koordinat x dan koordinat y secara terpisah."],
                [
                    {"title": "Rumus", "explanation": "Titik tengah adalah rata-rata koordinat kedua titik.", "math": "M = ((x1+x2)/2, (y1+y2)/2)"},
                    {"title": "Substitusi", "explanation": "Masukkan koordinat A dan B.", "math": f"M = (({x1}+{x2})/2, ({y1}+{y2})/2) = {answer}"},
                ],
                answer_label="M",
                accepted_answers=[f"{mx:g}.{my:g}", f"{mx:g},{my:g}", answer.replace(" ", "")]
            )
        ans = int(math.sqrt(dx * dx + dy * dy))
        return make_payload(
            "Diketahui dua titik pada bidang koordinat. Tentukan panjang ruas garis AB:",
            f"A({x1},{y1}) dan B({x2},{y2})",
            ans,
            ["Gunakan rumus jarak dua titik.", "Hitung selisih x dan selisih y terlebih dahulu."],
            [
                {"title": "Selisih Koordinat", "explanation": "Cari perubahan x dan y dari A ke B.", "math": f"dx = {dx}, dy = {dy}"},
                {"title": "Rumus Jarak", "explanation": "Gunakan teorema Pythagoras.", "math": f"AB = sqrt({dx}^2 + {dy}^2) = {ans}"},
            ],
            answer_label="AB"
        )

    if skill_id == "segiempat":
        length, width = random.randint(16, 35), random.randint(9, 24)
        if difficulty >= 3:
            perimeter = 2 * (length + width)
            return make_payload(
                "Sebuah taman berbentuk persegi panjang akan dipagari di sekelilingnya. Tentukan panjang pagar yang dibutuhkan:",
                f"panjang = {length} m, lebar = {width} m",
                perimeter,
                ["Yang ditanya adalah keliling, bukan luas.", "Keliling persegi panjang = 2(panjang + lebar)."],
                [
                    {"title": "Rumus Keliling", "explanation": "Pagar mengelilingi taman.", "math": "K = 2(p + l)"},
                    {"title": "Hitung", "explanation": "Masukkan panjang dan lebar.", "math": f"K = 2({length} + {width}) = {perimeter}"},
                ],
                answer_label="Keliling"
            )
        ans = length * width
        return make_payload(
            "Hitung luas persegi panjang berikut:",
            f"panjang = {length} m, lebar = {width} m",
            ans,
            ["Rumus luas persegi panjang adalah panjang x lebar.", "Kalikan kedua ukurannya."],
            [
                {"title": "Rumus", "explanation": "Gunakan rumus luas persegi panjang.", "math": "L = p x l"},
                {"title": "Hitung", "explanation": "Substitusi panjang dan lebar.", "math": f"L = {length} x {width} = {ans}"},
            ],
            answer_label="Luas"
        )

    if skill_id == "lingkaran":
        r = random.choice([7, 14, 21])
        ans = (2 * 22 * r) // 7
        return make_payload(
            "Hitung keliling lingkaran berikut dengan pi = 22/7:",
            f"jari-jari = {r}",
            ans,
            ["Rumus keliling lingkaran adalah 2 x pi x r.", "Substitusi nilai jari-jari."],
            [
                {"title": "Rumus", "explanation": "Gunakan rumus keliling.", "math": "K = 2 x pi x r"},
                {"title": "Hitung", "explanation": "Masukkan nilai r.", "math": f"K = 2 x 22/7 x {r} = {ans}"},
            ],
            answer_label="Keliling"
        )

    if skill_id == "segitiga":
        base, height = random.randint(4, 12), random.randint(3, 10)
        ans = base * height // 2
        return make_payload(
            "Hitung luas segitiga berikut:",
            f"alas = {base}, tinggi = {height}",
            ans,
            ["Rumus luas segitiga adalah alas x tinggi / 2.", "Kalikan alas dan tinggi lalu bagi 2."],
            [
                {"title": "Rumus", "explanation": "Gunakan rumus luas segitiga.", "math": "L = a x t / 2"},
                {"title": "Hitung", "explanation": "Substitusi nilai alas dan tinggi.", "math": f"L = {base} x {height} / 2 = {ans}"},
            ],
            answer_label="Luas"
        )

    if skill_id == "sudut":
        a = random.randint(25, 130)
        ans = 180 - a
        return make_payload(
            "Dua sudut saling berpelurus. Tentukan besar sudut pasangannya:",
            f"sudut pertama = {a} derajat",
            ans,
            ["Sudut berpelurus jumlahnya 180 derajat.", "Kurangi 180 dengan sudut yang diketahui."],
            [
                {"title": "Hubungan Sudut", "explanation": "Sudut berpelurus berjumlah 180 derajat.", "math": f"{a} + x = 180"},
                {"title": "Cari x", "explanation": "Kurangi 180 dengan sudut pertama.", "math": f"x = 180 - {a} = {ans}"},
            ],
            answer_label="Sudut"
        )

    return generate_geometry_problem("titik-garis", difficulty)

def generate_trigonometry_problem(skill_id, difficulty=1):
    values = {
        "sin 30": "1/2",
        "cos 60": "1/2",
        "tan 45": "1",
        "sin 90": "1",
        "cos 0": "1",
    }
    expression, answer = random.choice(list(values.items()))
    return make_payload(
        "Tentukan nilai rasio trigonometri berikut:",
        expression,
        answer,
        ["Gunakan nilai sudut istimewa.", "Ingat tabel dasar sin, cos, dan tan."],
        [
            {"title": "Sudut Istimewa", "explanation": "Cocokkan dengan tabel nilai trigonometri dasar.", "math": expression},
            {"title": "Nilai", "explanation": "Ambil nilai dari tabel sudut istimewa.", "math": f"{expression} = {answer}"},
        ],
        answer_label="Nilai",
        accepted_answers=[str(float(Fraction(answer))) if "/" in answer else answer]
    )

def generate_local_problem(topic_id, skill_id, difficulty=1):
    if topic_id == "aljabar":
        return generate_algebra_problem(skill_id, difficulty)
    if topic_id == "probabilitas":
        return generate_probability_problem(skill_id, difficulty)
    if topic_id == "aritmatika":
        return generate_arithmetic_problem(skill_id, difficulty)
    if topic_id == "geometri":
        return generate_geometry_problem(skill_id, difficulty)
    if topic_id == "trigonometri":
        return generate_trigonometry_problem(skill_id, difficulty)
    raise ValueError(f"Topik belum didukung: {topic_id}")

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

    prompt = (
        "Buat 1 soal matematika baru dalam Bahasa Indonesia. "
        f"Topik={topic_name}; Subtopik={skill_name}; Difficulty={difficulty}; Seed={seed}. "
        "Wajib sesuai subtopik. Jika Probabilitas, soal harus pencacahan/permutasi/kombinasi/peluang, bukan hitung tambah/kurang/perkalian biasa. "
        "Angka kecil, jawaban mudah dicek. answer singkat saja, contoh 12 atau 3/5, bukan 'x = 4'. "
        'Balas JSON valid saja: {"question":"","expression":"","answer":"","acceptedAnswers":[],"answerLabel":"","hints":["",""],"steps":[{"title":"","explanation":"","math":""},{"title":"","explanation":"","math":""}]}'
    )

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": "Balas hanya JSON valid. Singkat. Jangan markdown."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=OPENROUTER_MAX_TOKENS,
        response_format={"type": "json_object"},
        extra_body={
            "provider": {
                "sort": OPENROUTER_PROVIDER_SORT,
                "preferred_max_latency": 5,
            }
        },
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
            payload = generate_local_problem(topic_id, skill_id, req.difficulty)
            payload["source"] = "local"
            return payload
        except Exception as err:
            print(f"Local problem generation failed: {err}")
            raise HTTPException(status_code=500, detail="Generator lokal gagal membuat soal.")
    raise HTTPException(status_code=400, detail=f"Topik belum didukung: {req.topic}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
