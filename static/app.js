const form = document.querySelector("#profile-form");
const formError = document.querySelector("#form-error");
const emptyState = document.querySelector("#empty-state");
const resultsContent = document.querySelector("#results-content");
const loadingState = document.querySelector("#loading-state");
const careerList = document.querySelector("#career-list");
const coachNotes = document.querySelector("#coach-notes");
const coachList = document.querySelector("#coach-list");

const labels = {
  comunicacao: "Comunicação",
  empatia: "Empatia",
  organizacao: "Organização",
  criatividade: "Criatividade",
  atencao: "Atenção aos detalhes",
  curiosidade: "Curiosidade",
  iniciativa: "Iniciativa",
  paciencia: "Paciência",
  responsabilidade: "Responsabilidade",
  logica: "Raciocínio lógico",
  planejamento: "Planejamento",
  escuta: "Escuta ativa",
  persuasao: "Persuasão",
  resiliencia: "Resiliência",
  atendimento: "Atendimento",
  excel: "Planilhas",
  vendas: "Vendas",
  redacao: "Escrita",
  design: "Design",
  marketing: "Marketing",
  dados: "Análise de dados",
  tecnologia: "Tecnologia",
  suporte: "Suporte técnico",
  negociacao: "Negociação",
  administracao: "Rotinas administrativas",
  pessoas: "Pessoas",
  negocios: "Negócios",
  timidez: "Timidez",
  foco: "Manter o foco",
  procrastinacao: "Procrastinação",
  experiencia: "Pouca experiência",
  confianca: "Confiança para entrevistas",
};

const coachingTips = {
  timidez: "Para ganhar confiança, prepare uma apresentação de 30 segundos sobre você e pratique com alguém de confiança.",
  organizacao: "Experimente planejar a semana com três prioridades por dia; consistência vale mais que uma rotina perfeita.",
  foco: "Divida tarefas grandes em blocos de 25 minutos e faça uma pausa curta entre eles.",
  procrastinacao: "Comece pela menor ação possível: abrir o currículo, pesquisar uma vaga ou enviar uma mensagem.",
  experiencia: "Projetos pessoais, voluntariado e cursos também mostram iniciativa. Registre o que você fez e o resultado.",
  confianca: "Antes de uma entrevista, anote três situações em que você resolveu um problema ou ajudou alguém.",
};

document.querySelectorAll(".choices[data-limit]").forEach((group) => {
  group.addEventListener("change", (event) => {
    if (!event.target.checked) return;
    const checked = group.querySelectorAll("input:checked");
    if (checked.length > Number(group.dataset.limit)) {
      event.target.checked = false;
      event.target.closest(".choice").classList.add("limit-flash");
      window.setTimeout(() => event.target.closest(".choice").classList.remove("limit-flash"), 500);
    }
  });
});

function readGroup(name) {
  return [...document.querySelectorAll(`[data-group="${name}"] input:checked`)].map((input) => input.value);
}

function makeCareerCard(career, location) {
  const card = document.createElement("article");
  card.className = "career-card";

  const header = document.createElement("div");
  header.className = "career-card-header";
  const title = document.createElement("h3");
  title.textContent = career.title;
  const index = document.createElement("span");
  index.className = "career-index";
  index.textContent = String(career.rank).padStart(2, "0");
  header.append(title, index);

  const description = document.createElement("p");
  description.className = "career-description";
  description.textContent = career.description;

  const matchLabel = document.createElement("span");
  matchLabel.className = "match-label";
  matchLabel.textContent = "COMBINA COM";
  const tags = document.createElement("div");
  tags.className = "match-tags";
  career.matches.slice(0, 3).forEach((match) => {
    const tag = document.createElement("span");
    tag.textContent = labels[match] || match;
    tags.append(tag);
  });

  const searchLink = document.createElement("a");
  searchLink.className = "job-link";
  searchLink.target = "_blank";
  searchLink.rel = "noopener noreferrer";
  searchLink.href = `https://www.google.com/search?q=${encodeURIComponent(`${career.title} vagas ${location}`)}&ibp=htl;jobs`;
  searchLink.textContent = "Buscar vagas";
  searchLink.setAttribute("aria-label", `Buscar vagas de ${career.title}`);

  card.append(header, description, matchLabel, tags, searchLink);
  return card;
}

function showCoachTips(challenges) {
  coachList.replaceChildren();
  const tips = challenges.map((challenge) => coachingTips[challenge]).filter(Boolean).slice(0, 2);
  coachNotes.hidden = tips.length === 0;
  tips.forEach((tip) => {
    const item = document.createElement("li");
    item.textContent = tip;
    coachList.append(item);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const interests = readGroup("interests");
  if (!interests.length) {
    formError.hidden = false;
    document.querySelector("[data-group='interests']").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  formError.hidden = true;
  emptyState.hidden = true;
  resultsContent.hidden = true;
  loadingState.hidden = false;

  const challenges = readGroup("challenges");
  const profile = {
    strengths: readGroup("strengths"),
    skills: readGroup("skills"),
    interests,
    challenges,
  };

  try {
    const response = await fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!response.ok) throw new Error("Não foi possível gerar as sugestões.");
    const data = await response.json();
    careerList.replaceChildren();
    const location = document.querySelector("#location").value.trim() || "Brasil";
    data.careers.forEach((career, index) => {
      career.rank = index + 1;
      careerList.append(makeCareerCard(career, location));
    });

    if (!data.careers.length) {
      const message = document.createElement("p");
      message.className = "no-match-message";
      message.textContent = "Ainda não encontramos uma combinação clara. Tente marcar mais qualidades ou habilidades para ampliar as possibilidades.";
      careerList.append(message);
    }
    showCoachTips(challenges);
    loadingState.hidden = true;
    resultsContent.hidden = false;
  } catch (error) {
    loadingState.hidden = true;
    emptyState.hidden = false;
    formError.textContent = "Não conseguimos carregar suas sugestões agora. Tente novamente.";
    formError.hidden = false;
  }
});