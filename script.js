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

// --- RENDERIZAR CALENDÁRIO ---
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if(!grid) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    document.getElementById('current-month').innerText = 
        new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate);

    // Escuta eventos do Firebase em tempo real
    onSnapshot(collection(db, "eventos_agenda"), (snapshot) => {
        const eventos = [];
        snapshot.forEach(doc => eventos.push({ id: doc.id, ...doc.data() }));
        
        atualizarDashboard(eventos);

        grid.innerHTML = "";
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Dias vazios
        for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div class="day-card empty"></div>`;

        // Dias do mês
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month + 1}-${day}`;
            const evsDoDia = eventos.filter(e => e.data === dateStr);
            const isToday = day === new Date().getDate() && month === new Date().getMonth();

            const card = document.createElement('div');
            card.className = `day-card ${isToday ? 'today' : ''}`;
            card.innerHTML = `<strong>${day}</strong><div class="event-list"></div>`;
            
            evsDoDia.forEach(ev => {
                const evDiv = document.createElement('div');
                evDiv.className = 'event-item';
                evDiv.innerText = ev.titulo;
                evDiv.style.backgroundColor = ev.cor || '#38bdf8';
                evDiv.onclick = (e) => { e.stopPropagation(); removerEvento(ev.id); };
                card.querySelector('.event-list').appendChild(evDiv);
            });

            card.onclick = () => abrirModal(day);
            grid.appendChild(card);
        }
    });
}

function atualizarDashboard(eventos) {
    const hoje = new Date();
    const dataHoje = `${hoje.getFullYear()}-${hoje.getMonth() + 1}-${hoje.getDate()}`;
    const totalHoje = eventos.filter(e => e.data === dataHoje).length;
    
    document.getElementById('label-hoje').innerText = `Eventos para hoje: ${totalHoje}`;
    const progresso = Math.min(totalHoje * 25, 100); // 4 eventos para 100%
    document.getElementById('progress-fill').style.width = `${progresso}%`;
}

window.abrirModal = (day) => {
    selectedDay = day;
    document.getElementById('modal').style.display = 'grid';
};

window.closeModal = () => {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('event-title').value = "";
};

window.saveEvent = async () => {
    const titulo = document.getElementById('event-title').value;
    const cor = document.getElementById('event-category').value;
    if (!titulo) return;

    try {
        await addDoc(collection(db, "eventos_agenda"), {
            titulo, cor, data: `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${selectedDay}`, criadoEm: new Date()
        });
        window.closeModal();
    } catch (e) { console.error(e); }
};

async function removerEvento(id) {
    if (confirm("Remover este compromisso?")) await deleteDoc(doc(db, "eventos_agenda", id));
}

window.changeMonth = (diff) => { currentDate.setMonth(currentDate.getMonth() + diff); renderCalendar(); };

document.addEventListener('DOMContentLoaded', renderCalendar);
