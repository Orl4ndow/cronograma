import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBE7xBpq8NT1SD_jDT3aFHewh-htlp5msQ",
    authDomain: "cronograma-173c9.firebaseapp.com",
    projectId: "cronograma-173c9",
    storageBucket: "cronograma-173c9.firebasestorage.app",
    messagingSenderId: "819169022068",
    appId: "1:819169022068:web:b0e5a147b578c1af548121"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- NAVEGAÇÃO ---
window.switchTab = (tab) => {
    document.getElementById('section-agenda').style.display = tab === 'agenda' ? 'block' : 'none';
    document.getElementById('section-fixo').style.display = tab === 'fixo' ? 'block' : 'none';
    document.getElementById('tab-agenda').classList.toggle('active', tab === 'agenda');
    document.getElementById('tab-fixo').classList.toggle('active', tab === 'fixo');
}

// --- LÓGICA DO CALENDÁRIO MENSAL ---
let date = new Date();
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = "";
    
    const month = date.getMonth();
    const year = date.getFullYear();
    document.getElementById('current-month').innerText = `${date.toLocaleString('pt-br', { month: 'long' })} ${year}`;

    // Lógica para gerar os dias (simplificada)
    for (let i = 1; i <= 31; i++) {
        const day = document.createElement('div');
        day.className = 'day-card';
        day.innerHTML = `<strong>${i}</strong><div id="events-${i}"></div>`;
        day.onclick = () => openModal(i);
        grid.appendChild(day);
    }
}

// --- CRONOGRAMA FIXO UERJ ---
const horarios = ["M1", "M2", "M3", "M4", "M5", "M6", "T1", "T2", "T3", "T4", "T5", "T6", "N1", "N2", "N3"];
function renderFixo() {
    const body = document.getElementById('fixed-body');
    body.innerHTML = "";
    horarios.forEach(h => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${h}</td><td></td><td></td><td></td><td></td><td></td>`;
        body.appendChild(tr);
    });
}

// --- FUNÇÕES FIREBASE ---
window.saveEvent = async () => {
    const title = document.getElementById('event-title').value;
    if(!title) return;
    
    await addDoc(collection(db, "agenda"), {
        titulo: title,
        data: new Date(),
        usuario: "Orlando"
    });
    closeModal();
}

renderCalendar();
renderFixo();
