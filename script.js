/**
 * CYBERDEFENSE.IA - INTERATIVIDADE, ANIMAÇÕES & GAMIFICAÇÃO
 */

document.addEventListener('DOMContentLoaded', () => {
    initCanvasParticles();
    initAudioEffects();
    initCounters();
    initDuelTabs();
    initQuiz();
    initSchoolDataModal();
    initNavigation();
});

/* ==========================================================================
   1. CANVAS DE PARTÍCULAS E CONEXÕES NEURAIS HOLOGRÁFICAS
   ========================================================================== */
function initCanvasParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 16), 80);

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            radius: Math.random() * 2 + 1,
            color: Math.random() > 0.5 ? '#00f0ff' : '#a855f7'
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Desenhar e atualizar partículas
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fill();

            // Conectar partículas próximas com linhas
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${0.25 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.7;
                    ctx.shadowBlur = 0;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   2. EFEITOS SONOROS SCI-FI COM WEB AUDIO API NATIVA
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initAudioEffects() {
    const soundBtn = document.getElementById('sound-btn');
    const soundIcon = document.getElementById('sound-icon');

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    window.playSciFiSound = function(type = 'blip') {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;

            if (type === 'blip') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(580, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            } else if (type === 'correct') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(659.25, now + 0.1);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.25);
            } else if (type === 'wrong') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.linearRampToValueAtTime(140, now + 0.18);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            }
        } catch (e) {
            // Ignora falhas de áudio silenciosamente
        }
    };

    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
            if (soundEnabled) {
                window.playSciFiSound('blip');
            }
        });
    }

    // Adiciona som sutil a botões principais
    document.querySelectorAll('.btn, .nav-item, .duel-tab-btn, .edit-badge-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            if (soundEnabled) window.playSciFiSound('blip');
        });
    });
}

/* ==========================================================================
   3. CONTADOR DE NÚMEROS NAS ESTATÍSTICAS
   ========================================================================== */
function initCounters() {
    const statCards = document.querySelectorAll('.stat-number');
    let hasAnimated = false;

    function runCounters() {
        if (hasAnimated) return;
        hasAnimated = true;

        statCards.forEach(stat => {
            const target = parseFloat(stat.getAttribute('data-target'));
            let current = 0;
            const step = target / 35;

            const interval = setInterval(() => {
                current += step;
                if (current >= target) {
                    stat.textContent = target;
                    clearInterval(interval);
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, 30);
        });
    }

    // Dispara animação logo após carregamento
    setTimeout(runCounters, 500);
}

/* ==========================================================================
   4. FILTROS INTERATIVOS DO DUELO (PRÓS & CONTRAS)
   ========================================================================== */
function initDuelTabs() {
    const tabBtns = document.querySelectorAll('.duel-tab-btn');
    const colPros = document.getElementById('col-pros');
    const colCons = document.getElementById('col-cons');
    const duelGrid = document.querySelector('.duel-grid');

    if (!tabBtns.length || !colPros || !colCons) return;

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            if (filter === 'all') {
                colPros.style.display = 'block';
                colCons.style.display = 'block';
                duelGrid.style.gridTemplateColumns = window.innerWidth > 1024 ? '1fr 1fr' : '1fr';
            } else if (filter === 'pros') {
                colPros.style.display = 'block';
                colCons.style.display = 'none';
                duelGrid.style.gridTemplateColumns = '1fr';
            } else if (filter === 'cons') {
                colPros.style.display = 'none';
                colCons.style.display = 'block';
                duelGrid.style.gridTemplateColumns = '1fr';
            }

            if (window.playSciFiSound) window.playSciFiSound('blip');
        });
    });
}

/* ==========================================================================
   5. QUIZ INTERATIVO ESCOLAR COM GAMIFICAÇÃO
   ========================================================================== */
const quizQuestions = [
    {
        question: "O que caracteriza uma arma autônoma do nível 'Human-out-of-the-loop' (Nível 3)?",
        options: [
            "Um operador humano pilota o drone remotamente com joystick.",
            "O sistema ataca alvos sem qualquer confirmação ou intervenção humana direta.",
            "O computador apenas dá conselhos meteorológicos para o soldado.",
            "A arma é ativada apenas se o presidente assinar um papel oficial."
        ],
        answer: 1,
        explanation: "Correto! No nível 'Human-out-of-the-loop', a máquina toma decisões autônomas de alvejar e disparar com base apenas em seus algoritmos, sem aprovação humana direta."
    },
    {
        question: "Qual é um dos principais argumentos a favor do uso de IA em sistemas de defesa aérea (ex: contra mísseis hipersônicos)?",
        options: [
            "Mísseis hipersônicos são lentos demais para serem detectados por humanos.",
            "A velocidade de reação algorítmica (milissegundos) supera os reflexos biológicos humanos.",
            "A IA permite desligar as armas quando chove.",
            "Os algoritmos diminuem o custo da energia elétrica dos quartéis."
        ],
        answer: 1,
        explanation: "Exato! Mísseis modernos viajam a mais de 5 vezes a velocidade do som. Um operador humano não tem reflexos biológicos suficientes para calcular a trajetória e interceptá-los a tempo sem auxílio de IA."
    },
    {
        question: "Qual é a principal preocupação ética apontada pela coalizão mundial 'Stop Killer Robots' e pela ONU?",
        options: [
            "As máquinas gastam muita memória RAM no campo de batalha.",
            "Algoritmos não possuem empatia, moral e não distinguem rendição ou compaixão humana.",
            "Os robôs podem enferrujar caso peguem chuva durante o combate.",
            "A conexão Wi-Fi do exército pode cair com frequência."
        ],
        answer: 1,
        explanation: "Perfeito! A campanha defende que decisões sobre tirar uma vida humana não podem ser delegadas a cálculos de software frios, pois máquinas não têm senso moral, consciência ou piedade."
    },
    {
        question: "Por que o surgimento das armas com IA é chamado por historiadores de '3ª Revolução da Guerra'?",
        options: [
            "Porque é a terceira vez que o ser humano usa pólvora.",
            "Porque sucede historicamente a invenção da Pólvora (1ª) e das Armas Nucleares (2ª).",
            "Porque apenas três países no mundo possuem computadores modernos.",
            "Porque os drones só conseguem voar em três direções diferentes."
        ],
        answer: 1,
        explanation: "Muito bem! A Pólvora mudou o alcance da força humana; a Arma Nuclear trouxe a aniquilação em massa; e a Inteligência Artificial transfere a tomada de decisão da batalha da mente humana para as máquinas."
    }
];

function initQuiz() {
    let currentIdx = 0;
    let score = 0;

    const quizBox = document.getElementById('quiz-box');
    const quizResult = document.getElementById('quiz-result');
    const countEl = document.getElementById('question-count');
    const scoreEl = document.getElementById('score-tracker');
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    const feedbackEl = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('next-q-btn');
    const progressFill = document.getElementById('quiz-progress');
    const restartBtn = document.getElementById('restart-quiz-btn');
    const finalScoreText = document.getElementById('final-score-text');
    const resultEvaluation = document.getElementById('result-evaluation');

    if (!quizBox || !optionsEl) return;

    function renderQuestion() {
        const q = quizQuestions[currentIdx];
        countEl.textContent = `Pergunta ${currentIdx + 1} de ${quizQuestions.length}`;
        scoreEl.textContent = `Pontos: ${score}`;
        questionEl.textContent = q.question;
        feedbackEl.classList.add('hidden');
        feedbackEl.className = 'quiz-feedback hidden';
        nextBtn.classList.add('hidden');

        const progressPercent = ((currentIdx + 1) / quizQuestions.length) * 100;
        progressFill.style.width = `${progressPercent}%`;

        optionsEl.innerHTML = '';

        q.options.forEach((optText, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-opt-btn';
            btn.innerHTML = `
                <span class="opt-prefix">${String.fromCharCode(65 + i)})</span>
                <span>${optText}</span>
            `;

            btn.addEventListener('click', () => handleAnswer(i, btn));
            optionsEl.appendChild(btn);
        });
    }

    function handleAnswer(selectedIdx, clickedBtn) {
        const q = quizQuestions[currentIdx];
        const allBtns = optionsEl.querySelectorAll('.quiz-opt-btn');
        allBtns.forEach(b => (b.disabled = true));

        if (selectedIdx === q.answer) {
            score++;
            scoreEl.textContent = `Pontos: ${score}`;
            clickedBtn.classList.add('correct');
            feedbackEl.innerHTML = `<strong>✨ Resposta Correta!</strong> ${q.explanation}`;
            feedbackEl.className = 'quiz-feedback correct-feedback';
            if (window.playSciFiSound) window.playSciFiSound('correct');
        } else {
            clickedBtn.classList.add('wrong');
            allBtns[q.answer].classList.add('correct');
            feedbackEl.innerHTML = `<strong>❌ Incorreta.</strong> ${q.explanation}`;
            feedbackEl.className = 'quiz-feedback wrong-feedback';
            if (window.playSciFiSound) window.playSciFiSound('wrong');
        }

        feedbackEl.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
    }

    nextBtn.addEventListener('click', () => {
        currentIdx++;
        if (currentIdx < quizQuestions.length) {
            renderQuestion();
        } else {
            showResult();
        }
        if (window.playSciFiSound) window.playSciFiSound('blip');
    });

    function showResult() {
        quizBox.classList.add('hidden');
        quizResult.classList.remove('hidden');
        finalScoreText.textContent = `Você acertou ${score} de ${quizQuestions.length} perguntas (${Math.round((score / quizQuestions.length) * 100)}%).`;

        if (score === quizQuestions.length) {
            resultEvaluation.textContent = "🏆 Desempenho Impecável! Você está pronto para apresentar este trabalho escolar como um especialista!";
        } else if (score >= 2) {
            resultEvaluation.textContent = "👍 Muito bom! Você absorveu os conceitos essenciais sobre LAWS, ética e tecnologia bélica.";
        } else {
            resultEvaluation.textContent = "💡 Vale a pena dar uma revisada nos tópicos do site para dominar a apresentação na frente da turma!";
        }
    }

    restartBtn.addEventListener('click', () => {
        currentIdx = 0;
        score = 0;
        quizResult.classList.add('hidden');
        quizBox.classList.remove('hidden');
        renderQuestion();
        if (window.playSciFiSound) window.playSciFiSound('blip');
    });

    renderQuestion();
}

/* ==========================================================================
   6. MODAL PARA PERSONALIZAR DADOS DO GRUPO ESCOLAR
   ========================================================================== */
function initSchoolDataModal() {
    const editBtn = document.getElementById('edit-team-btn');
    const modal = document.getElementById('team-modal');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const saveBtn = document.getElementById('modal-save-btn');

    const valIntegrantes = document.getElementById('val-integrantes');
    const valProf = document.getElementById('val-prof');
    const valTurma = document.getElementById('val-turma');
    const valMateria = document.getElementById('val-materia');

    const inputIntegrantes = document.getElementById('input-integrantes');
    const inputProf = document.getElementById('input-prof');
    const inputTurma = document.getElementById('input-turma');
    const inputMateria = document.getElementById('input-materia');

    // Carregar dados salvos se houver
    const savedData = localStorage.getItem('school_project_team');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            if (data.prof) valProf.textContent = data.prof;
            if (data.turma) valTurma.textContent = data.turma;
            if (data.materia) valMateria.textContent = data.materia;
            if (data.integrantes && data.integrantes.length) {
                valIntegrantes.innerHTML = data.integrantes
                    .map(name => `<span class="student-pill">👤 ${name.trim()}</span>`)
                    .join('');
            }
        } catch (e) {}
    }

    if (editBtn && modal) {
        editBtn.addEventListener('click', () => {
            // Preenche os campos do modal com os valores atuais
            inputProf.value = valProf.textContent.replace('Prof. ', '');
            inputTurma.value = valTurma.textContent;
            inputMateria.value = valMateria.textContent;
            
            const currentNames = Array.from(valIntegrantes.querySelectorAll('.student-pill'))
                .map(el => el.textContent.replace('👤 ', '').trim());
            inputIntegrantes.value = currentNames.join(', ');

            modal.classList.remove('hidden');
            if (window.playSciFiSound) window.playSciFiSound('blip');
        });

        cancelBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        saveBtn.addEventListener('click', () => {
            const names = inputIntegrantes.value.split(',').filter(n => n.trim() !== '');
            if (names.length > 0) {
                valIntegrantes.innerHTML = names
                    .map(n => `<span class="student-pill">👤 ${n.trim()}</span>`)
                    .join('');
            }

            if (inputProf.value.trim()) valProf.textContent = inputProf.value.trim();
            if (inputTurma.value.trim()) valTurma.textContent = inputTurma.value.trim();
            if (inputMateria.value.trim()) valMateria.textContent = inputMateria.value.trim();

            // Salva no LocalStorage
            const toSave = {
                integrantes: names,
                prof: valProf.textContent,
                turma: valTurma.textContent,
                materia: valMateria.textContent
            };
            localStorage.setItem('school_project_team', JSON.stringify(toSave));

            modal.classList.add('hidden');
            if (window.playSciFiSound) window.playSciFiSound('correct');
        });
    }
}

/* ==========================================================================
   7. NAVEGAÇÃO SUAVE, MENU MOBILE E SCROLL HIGHLIGHT
   ========================================================================== */
function initNavigation() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');
    const links = document.querySelectorAll('.nav-item');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });

        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
            });
        });
    }

    // Highlight no scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(sec => {
            const secHeight = sec.offsetHeight;
            const secTop = sec.offsetTop - 120;
            const secId = sec.getAttribute('id');
            const targetLink = document.querySelector(`.nav-links a[href="#${secId}"]`);

            if (scrollY > secTop && scrollY <= secTop + secHeight) {
                if (targetLink) targetLink.classList.add('active');
            } else {
                if (targetLink) targetLink.classList.remove('active');
            }
        });
    });
}
