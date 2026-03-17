import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBE7xBpq8NT1SD_jDT3aFHewh-htlp5msQ",
    authDomain: "cronograma-173c9.firebaseapp.com",
    projectId: "cronograma-173c9",
    storageBucket: "cronograma-173c9.firebasestorage.app",
    messagingSenderId: "819169022068",
    appId: "1:819169022068:web:407ad2627d0250ee548121",
    measurementId: "G-71X9KYC4D2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Globais
let currentDate = new Date();
const horarios = ["M1", "M2", "M3", "M4", "M5", "M6", "T1", "T2", "T3", "T4", "T5", "T6", "N1", "N2", "N3"];
const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

// --- NAVEGAÇÃO ---
window.switchTab = (tab) => {
    document.getElementById('section-agenda').style.display = tab === 'agenda' ? 'block' : 'none';
    document.getElementById('section-fixo').style.display = tab === 'fixo' ? 'block' : 'none';
    document.getElementById('tab-agenda').classList.toggle('active', tab === 'agenda');
    document.getElementById('tab-fixo').classList.toggle('active', tab === 'fixo');
    if(tab === 'agenda') renderCalendar();
};

// --- CALENDÁRIO MENSAL ---
window.changeMonth = (diff) => {
    currentDate.setMonth(currentDate.getMonth() + diff);
    renderCalendar();
};

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if(!grid) return;
    grid.innerHTML = "";
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('current-month').innerText = 
        new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Espaços vazios do início do mês
    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div class="day-card empty"></div>`;
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
        const card = document.createElement('div');
        card.className = `day-card ${isToday ? 'today' : ''}`;
        card.innerHTML = `<strong>${day}</strong><div id="day-events-${day}" class="day-events"></div>`;
        card.onclick = () => alert(`Você clicou no dia ${day}. Aqui você pode abrir um modal no futuro!`);
        grid.appendChild(card);
    }
}

// --- CRONOGRAMA FIXO ---
function carregarCronograma() {
    onSnapshot(collection(db, "cronograma_fixo"), (snapshot) => {
        const aulas = [];
        snapshot.forEach(doc => aulas.push({ id: doc.id, ...doc.data() }));
        renderizarTabela(aulas);
    });
}

function renderizarTabela(aulas) {
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
                td.onclick = () => removerMateria(aula.id, aula.materia);
            } else {
                td.onclick = () => adicionarMateria(d, h);
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

async function adicionarMateria(dia, horario) {
    const materia = prompt(`Matéria para ${dia} às ${horario}:`);
    if (materia) {
        await addDoc(collection(db, "cronograma_fixo"), { dia, horario, materia });
    }
}

async function removerMateria(id, nome) {
    if (confirm(`Remover ${nome}?`)) {
        await deleteDoc(doc(db, "cronograma_fixo", id));
    }
}

// Iniciar tudo
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    carregarCronograma();
});
