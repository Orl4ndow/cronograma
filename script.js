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
const horarios = ["M0 - (05:00 - 06:00)", "M1 - (06:00 - 07:00)", "M2 - (07:00 - 08:00)", "M3 - (08:00 - 09:00)", "M4 - (09:00 - 10:00)", "M5 - (10:00 - 11:00)", "M6 - (11:00 - 12:00)", "T1 - (12:00 - 13:00)", "T2 - (13:00 - 14:00)", "T3 - (14:00 - 15:00)", "T4 - (15:00 - 16:00)", "T5 - (16:00 - 17:00)", "T6 - (17:00 - 18:00)", "N1 - (18:00 - 19:00)", "N2 - (19:00 - 20:00)", "N3 - (20:00 - 21:00)", "N4 - (21:00 - 22:00)", "N5 - (22:00 - 23:00)"];
const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

// FUNÇÃO DE COR AUTOMÁTICA
function getMateriaColor(name) {
    const colors = ['#f87171', '#38bdf8', '#4ade80', '#facc15', '#a78bfa', '#fb923c', '#f472b6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

// NAVEGAÇÃO
window.switchTab = (tab) => {
    ['agenda', 'fixo', 'tasks'].forEach(s => {
        document.getElementById(`section-${s}`).style.display = (s === tab) ? 'block' : 'none';
        document.getElementById(`tab-${s}`).classList.toggle('active', s === tab);
    });
};

// CRONOGRAMA FIXO
function carregarCronograma() {
    onSnapshot(collection(db, "cronograma_fixo"), (snapshot) => {
        const aulas = [];
        snapshot.forEach(doc => aulas.push({ id: doc.id, ...doc.data() }));
        const tbody = document.getElementById('fixed-body');
        if (!tbody) return;
        tbody.innerHTML = "";
        horarios.forEach(h => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="sticky-col">${h}</td>`;
            diasSemana.forEach(d => {
                const td = document.createElement('td');
                const aula = aulas.find(a => a.dia === d && a.horario === h);
                if (aula) {
                    td.innerHTML = `<div class="materia-card" style="background:${getMateriaColor(aula.materia)}">${aula.materia}</div>`;
                    td.onclick = () => { if(confirm(`Remover ${aula.materia}?`)) deleteDoc(doc(db, "cronograma_fixo", aula.id)); };
                } else {
                    td.onclick = async () => {
                        const m = prompt(`Matéria para ${d} às ${h}:`);
                        if(m) await addDoc(collection(db, "cronograma_fixo"), { dia: d, horario: h, materia: m });
                    };
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    });
}

// AGENDA MENSAL
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if(!grid) return;
    document.getElementById('current-month').innerText = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate);

    onSnapshot(collection(db, "eventos_agenda"), (snapshot) => {
        const eventos = [];
        snapshot.forEach(doc => eventos.push({ id: doc.id, ...doc.data() }));
        
        const hojeStr = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
        const totalHoje = eventos.filter(e => e.data === hojeStr).length;
        document.getElementById('label-hoje').innerText = `Eventos para hoje: ${totalHoje}`;
        document.getElementById('progress-fill').style.width = `${Math.min(totalHoje * 25, 100)}%`;

        grid.innerHTML = "";
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div class="day-card empty"></div>`;
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
            const evs = eventos.filter(e => e.data === dateStr);
            const card = document.createElement('div');
            card.className = `day-card ${day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? 'today' : ''}`;
            card.innerHTML = `<strong>${day}</strong><div class="event-list"></div>`;
            evs.forEach(ev => {
                const item = document.createElement('div');
                item.className = 'event-item';
                item.style.backgroundColor = ev.cor;
                item.innerText = ev.titulo;
                item.onclick = (e) => { e.stopPropagation(); if(confirm("Remover?")) deleteDoc(doc(db, "eventos_agenda", ev.id)); };
                card.querySelector('.event-list').appendChild(item);
            });
            card.onclick = () => { selectedDay = day; document.getElementById('modal').style.display = 'grid'; };
            grid.appendChild(card);
        }
    });
}

// CHECKLIST
window.addTask = async () => {
    const input = document.getElementById('new-task-input');
    if (input.value) {
        await addDoc(collection(db, "tasks"), { texto: input.value, concluida: false });
        input.value = "";
    }
};

function carregarTasks() {
    onSnapshot(collection(db, "tasks"), (snapshot) => {
        const list = document.getElementById('task-list');
        list.innerHTML = "";
        let done = 0, pending = 0;
        snapshot.forEach(d => {
            const task = d.data();
            task.concluida ? done++ : pending++;
            const li = document.createElement('li');
            li.className = `task-item ${task.concluida ? 'done' : ''}`;
            li.innerHTML = `<span onclick="toggleTask('${d.id}', ${task.concluida})">${task.texto}</span>
                            <i class="fa-solid fa-trash" onclick="deleteDoc(doc(db, 'tasks', '${d.id}'))"></i>`;
            list.appendChild(li);
        });
        document.getElementById('tasks-done').innerText = done;
        document.getElementById('tasks-pending').innerText = pending;
    });
}
window.toggleTask = async (id, status) => await updateDoc(doc(db, "tasks", id), { concluida: !status });

// MODAL SETUP
window.saveEvent = async () => {
    const t = document.getElementById('event-title').value;
    const c = document.getElementById('event-category').value;
    if (t) await addDoc(collection(db, "eventos_agenda"), { titulo: t, cor: c, data: `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${selectedDay}` });
    window.closeModal();
};
window.closeModal = () => { document.getElementById('modal').style.display = 'none'; document.getElementById('event-title').value = ""; };
window.changeMonth = (d) => { currentDate.setMonth(currentDate.getMonth() + d); renderCalendar(); };

document.addEventListener('DOMContentLoaded', () => { renderCalendar(); carregarCronograma(); carregarTasks(); });
