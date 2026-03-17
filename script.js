import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// --- AGENDA MENSAL ---
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

    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div class="day-card empty"></div>`;
    }

    // Buscar eventos do mês atual no Firebase
    onSnapshot(collection(db, "eventos_agenda"), (snapshot) => {
        const todosEventos = [];
        snapshot.forEach(doc => todosEventos.push({ id: doc.id, ...doc.data() }));
        
        // Limpar apenas os dias para não duplicar na renderização real-time
        const dayCards = document.querySelectorAll('.day-card:not(.empty)');
        dayCards.forEach(card => card.remove());

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month + 1}-${day}`;
            const eventosDoDia = todosEventos.filter(e => e.data === dateStr);

            const card = document.createElement('div');
            card.className = 'day-card';
            card.innerHTML = `<strong>${day}</strong><div class="event-list"></div>`;
            
            eventosDoDia.forEach(ev => {
                const evDiv = document.createElement('div');
                evDiv.className = 'event-item';
                evDiv.innerText = ev.titulo;
                evDiv.onclick = (e) => {
                    e.stopPropagation();
                    removerEvento(ev.id);
                };
                card.querySelector('.event-list').appendChild(evDiv);
            });

            card.onclick = () => abrirModal(day);
            grid.appendChild(card);
        }
    });
}

// --- MODAL E EVENTOS ---
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
    if (!titulo) return;

    const dateStr = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${selectedDay}`;

    await addDoc(collection(db, "eventos_agenda"), {
        titulo: titulo,
        data: dateStr,
        criadoEm: new Date()
    });

    closeModal();
};

async function removerEvento(id) {
    if (confirm("Remover este compromisso?")) {
        await deleteDoc(doc(db, "eventos_agenda", id));
    }
}

window.changeMonth = (diff) => {
    currentDate.setMonth(currentDate.getMonth() + diff);
    renderCalendar();
};

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    // Chame aqui sua função carregarCronograma() se ela já existir
});
