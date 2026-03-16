import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBE7xBpq8NT1SD_jDT3aFHewh-htlp5msQ",
    authDomain: "cronograma-173c9.firebaseapp.com",
    projectId: "cronograma-173c9",
    storageBucket: "cronograma-173c9.firebasestorage.app",
    messagingSenderId: "819169022068",
    appId: "1:819169022068:web:b0e5a147b578c1af548121",
    measurementId: "G-QDYJHBV6FL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const horarios = ["M1", "M2", "M3", "M4", "M5", "M6", "T1", "T2", "T3", "T4", "T5", "T6", "N1", "N2", "N3"];
const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

// Escuta o banco de dados em tempo real
function carregarDados() {
    onSnapshot(collection(db, "atividades"), (snapshot) => {
        const aulas = [];
        snapshot.forEach(doc => aulas.push(doc.data()));
        renderizarTabela(aulas);
        document.getElementById('status-firebase').innerText = "Sincronizado com Firebase";
    });
}

function renderizarTabela(aulas) {
    const tbody = document.getElementById('schedule-body');
    tbody.innerHTML = "";

    horarios.forEach(h => {
        const tr = document.createElement('tr');
        
        // Coluna do Horário
        const tdHorario = document.createElement('td');
        tdHorario.classList.add('time-slot');
        tdHorario.innerText = h;
        tr.appendChild(tdHorario);

        // Colunas dos Dias
        dias.forEach(d => {
            const td = document.createElement('td');
            const aula = aulas.find(a => a.dia === d && a.horario === h);
            
            if (aula) {
                td.innerHTML = `<div class="materia-card">${aula.materia}</div>`;
            }
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

carregarDados();