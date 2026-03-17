import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBE7xBpq8NT1SD_jDT3aFHewh-htlp5msQ",
    authDomain: "cronograma-173c9.firebaseapp.com",
    projectId: "cronograma-173c9",
    storageBucket: "cronograma-173c9.firebasestorage.app",
    messagingSenderId: "819169022068",
    appId: "1:819169022068:web:407ad2627d0250ee548121"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentDate = new Date();
let selectedDay = null;
const horarios = ["M1", "M2", "M3", "M4", "M5", "M6", "T1", "T2", "T3", "T4", "T5", "T6", "N1", "N2", "N3"];
const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

// --- NAVEGAÇÃO ---
window.switchTab = (tab) => {
    const sections = ['agenda', 'fixo', 'tasks'];
    sections.forEach(s => {
        document.getElementById(`section-${s}`).style.display = (s === tab) ? 'block' : 'none';
        document.getElementById(`tab-${s}`).classList.toggle('active', s === tab);
    });
};

// --- CRONOGRAMA FIXO (CORRIGIDO) ---
function carregarCronogramaFixo() {
    onSnapshot(collection(db, "cronograma_fixo"), (snapshot) => {
        const aulas = [];
        snapshot.forEach(doc => aulas.push({ id: doc.id, ...doc.data() }));
        renderizarTabelaFixo(aulas);
    });
}

function renderizarTabelaFixo(aulas) {
    const tbody = document.getElementById('fixed-body');
    if (!tbody) return;
    tbody.innerHTML = "";
    horarios.forEach(h => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="time-slot">${h}</td>`;
        diasSemana.forEach(d => {
            const td = document.createElement('td');
            const aula = aulas.find(a => a.dia === d && a.horario === h);
            if (aula) {
                td.innerHTML = `<div class="materia-card">${aula.materia}</div>`;
                td.onclick = () => removerMateriaFixo(aula.id, aula.materia);
            } else {
                td.onclick = () => adicionarMateriaFixo(d, h);
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

async function adicionarMateriaFixo(dia, horario) {
    const materia = prompt(`Matéria para ${dia} às ${horario}:`);
    if (materia) await addDoc(collection(db, "cronograma_fixo"), { dia, horario, materia });
}

async function removerMateriaFixo(id, nome) {
    if (confirm(`Remover ${nome}?`)) await deleteDoc(doc(db, "cronograma_fixo", id));
}

// --- AGENDA MENSAL ---
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if(!grid) return;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    document.getElementById('current-month').innerText = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate);

    onSnapshot(collection(db, "eventos_agenda"), (snapshot) => {
        const eventos = [];
        snapshot.forEach(doc => eventos.push({ id: doc.id, ...doc.data() }));
        atualizarDashboard(eventos);
        grid.innerHTML = "";
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div class="day-card empty"></div>`;
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month + 1}-${day}`;
            const evs = eventos.filter(e => e.data === dateStr);
            const isToday = day === new Date().getDate() && month === new Date().getMonth();
            const card = document.createElement('div');
            card.className = `day-card ${isToday ? 'today' : ''}`;
            card.innerHTML = `<strong>${day}</strong><div class="event-list"></div>`;
            evs.forEach(ev => {
                const item = document.createElement('div');
                item.className = 'event-item';
                item.style.backgroundColor = ev.cor;
                item.innerText = ev.titulo;
                item.onclick = (e) => { e.stopPropagation(); removerEvento(ev.id); };
                card.querySelector('.event-list').appendChild(item);
            });
            card.onclick = () => { selectedDay = day; document.getElementById('modal').style.display = 'grid'; };
            grid.appendChild(card);
        }
    });
}

function atualizarDashboard(eventos) {
    const hoje = new Date();
    const dataHoje = `${hoje.getFullYear()}-${hoje.getMonth() + 1}-${hoje.getDate()}`;
    const totalHoje = eventos.filter(e => e.data === dataHoje).length;
    document.getElementById('label-hoje').innerText = `Eventos para hoje: ${totalHoje}`;
    const progresso = Math.min(totalHoje * 25, 100);
    document.getElementById('progress-fill').style.width = `${progresso}%`;
}

// --- CHECKLIST DE TAREFAS ---
window.addTask = async () => {
    const input = document.getElementById('new-task-input');
    if (!input.value) return;
    await addDoc(collection(db, "tasks"), { texto: input.value, concluida: false, data: new Date() });
    input.value = "";
};

function carregarTasks() {
    onSnapshot(collection(db, "tasks"), (snapshot) => {
        const list = document.getElementById('task-list');
        list.innerHTML = "";
        snapshot.forEach(d => {
            const task = d.data();
            const li = document.createElement('li');
            li.className = `task-item ${task.concluida ? 'done' : ''}`;
            li.innerHTML = `
                <span onclick="toggleTask('${d.id}', ${task.concluida})">${task.texto}</span>
                <i class="fa-solid fa-trash" onclick="deleteTask('${d.id}')"></i>
            `;
            list.appendChild(li);
        });
    });
}

window.toggleTask = async (id, status) => await updateDoc(doc(db, "tasks", id), { concluida: !status });
window.deleteTask = async (id) => await deleteDoc(doc(db, "tasks", id));

// --- MODAL & SETUP ---
window.saveEvent = async () => {
    const t = document.getElementById('event-title').value;
    const c = document.getElementById('event-category').value;
    if (t) await addDoc(collection(db, "eventos_agenda"), { titulo: t, cor: c, data: `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${selectedDay}` });
    window.closeModal();
};
window.closeModal = () => { document.getElementById('modal').style.display = 'none'; document.getElementById('event-title').value = ""; };
async function removerEvento(id) { if (confirm("Remover?")) await deleteDoc(doc(db, "eventos_agenda", id)); }
window.changeMonth = (d) => { currentDate.setMonth(currentDate.getMonth() + d); renderCalendar(); };

document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    carregarCronogramaFixo();
    carregarTasks();
});
