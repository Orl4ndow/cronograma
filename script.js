import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// --- NAVEGAÇÃO ---
window.switchTab = (tab) => {
    document.getElementById('section-agenda').style.display = tab === 'agenda' ? 'block' : 'none';
    document.getElementById('section-fixo').style.display = tab === 'fixo' ? 'block' : 'none';
    document.getElementById('tab-agenda').classList.toggle('active', tab === 'agenda');
    document.getElementById('tab-fixo').classList.toggle('active', tab === 'fixo');
};

// --- AGENDA MENSAL E DASHBOARD ---
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if(!grid) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('current-month').innerText = 
        new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate);

    onSnapshot(collection(db, "eventos_agenda"), (snapshot) => {
        const eventos = [];
        snapshot.forEach(doc => eventos.push({ id: doc.id, ...doc.data() }));
        
        // Atualizar Dashboard de hoje
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
                item.style.backgroundColor = ev.cor || '#38bdf8';
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
    const hojeStr = `${hoje.getFullYear()}-${hoje.getMonth() + 1}-${hoje.getDate()}`;
    const eventosHoje = eventos.filter(e => e.data === hojeStr).length;
    
    document.getElementById('label-hoje').innerText = `Eventos para hoje: ${eventosHoje}`;
    
    // Lógica da Barra: 1 evento = 33%, 2 = 66%, 3+ = 100% (ajuste como preferir)
    const progresso = Math.min(eventosHoje * 33.3, 100);
    document.getElementById('progress-fill').style.width = `${progresso}%`;
}

// --- SALVAR/REMOVER ---
window.saveEvent = async () => {
    const titulo = document.getElementById('event-title').value;
    const cor = document.getElementById('event-category').value;
    if (!titulo) return;

    await addDoc(collection(db, "eventos_agenda"), {
        titulo, cor, data: `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${selectedDay}`
    });
    window.closeModal();
};

window.closeModal = () => {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('event-title').value = "";
};

async function removerEvento(id) {
    if (confirm("Remover compromisso?")) await deleteDoc(doc(db, "eventos_agenda", id));
}

window.changeMonth = (diff) => { currentDate.setMonth(currentDate.getMonth() + diff); renderCalendar(); };

// Iniciar
document.addEventListener('DOMContentLoaded', () => { renderCalendar(); /* carregarFixo(); */ });
