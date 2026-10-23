from flask import Flask, jsonify, render_template, request


app = Flask(__name__)

CAREERS = [
    {
        "title": "Atendimento ao cliente",
        "description": "Ajude pessoas a resolver dúvidas e tenha contato direto com clientes.",
        "strengths": {"comunicacao", "empatia", "organizacao", "paciencia"},
        "skills": {"atendimento", "comunicacao", "vendas", "organizacao"},
        "interests": {"pessoas", "comunicacao", "negocios"},
    },
    {
        "title": "Assistente administrativo",
        "description": "Apoie rotinas, documentos e processos para o dia a dia funcionar melhor.",
        "strengths": {"organizacao", "atencao", "responsabilidade", "planejamento"},
        "skills": {"organizacao", "excel", "administracao", "atendimento"},
        "interests": {"organizacao", "negocios", "tecnologia"},
    },
    {
        "title": "Vendas e desenvolvimento comercial",
        "description": "Construa relacionamentos, entenda necessidades e apresente soluções.",
        "strengths": {"comunicacao", "persuasao", "iniciativa", "resiliencia"},
        "skills": {"vendas", "comunicacao", "negociacao", "atendimento"},
        "interests": {"negocios", "comunicacao", "pessoas"},
    },
    {
        "title": "Marketing de conteúdo",
        "description": "Transforme ideias em conteúdos que informam e aproximam marcas e pessoas.",
        "strengths": {"criatividade", "comunicacao", "curiosidade", "planejamento"},
        "skills": {"redacao", "design", "marketing", "comunicacao"},
        "interests": {"criatividade", "comunicacao", "tecnologia"},
    },
    {
        "title": "Análise de dados júnior",
        "description": "Organize informações e encontre padrões para apoiar decisões melhores.",
        "strengths": {"atencao", "curiosidade", "logica", "organizacao"},
        "skills": {"excel", "dados", "logica", "tecnologia"},
        "interests": {"tecnologia", "organizacao", "negocios"},
    },
    {
        "title": "Suporte de tecnologia",
        "description": "Investigue problemas técnicos e ajude pessoas a usar ferramentas digitais.",
        "strengths": {"paciencia", "curiosidade", "logica", "comunicacao"},
        "skills": {"tecnologia", "suporte", "comunicacao", "logica"},
        "interests": {"tecnologia", "pessoas", "organizacao"},
    },
    {
        "title": "Recursos humanos",
        "description": "Colabore com seleção, integração e desenvolvimento de pessoas nas equipes.",
        "strengths": {"empatia", "organizacao", "comunicacao", "escuta"},
        "skills": {"atendimento", "comunicacao", "administracao", "organizacao"},
        "interests": {"pessoas", "comunicacao", "organizacao"},
    },
]


def recommend_careers(profile):
    strengths = set(profile.get("strengths", []))
    skills = set(profile.get("skills", []))
    interests = set(profile.get("interests", []))
    results = []

    for career in CAREERS:
        matched_strengths = strengths & career["strengths"]
        matched_skills = skills & career["skills"]
        matched_interests = interests & career["interests"]
        score = len(matched_strengths) * 2 + len(matched_skills) * 2 + len(matched_interests)
        if score:
            results.append(
                {
                    "title": career["title"],
                    "description": career["description"],
                    "score": score,
                    "matches": sorted(matched_strengths | matched_skills | matched_interests),
                }
            )

    return sorted(results, key=lambda item: item["score"], reverse=True)[:3]


@app.get("/")
def home():
    return render_template("index.html")


@app.post("/api/recommendations")
def recommendations():
    profile = request.get_json(silent=True) or {}
    careers = recommend_careers(profile)
    return jsonify({"careers": careers})


if __name__ == "__main__":
    app.run(debug=True)