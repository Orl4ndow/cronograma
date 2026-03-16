import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

// Função para renderizar a tabela baseada na sua foto
async function carregarCronograma() {
    const querySnapshot = await getDocs(collection(db, "atividades"));
    // Lógica para preencher as células da tabela (M1, T4, etc.)
}
const horarios = ["M1", "M2", "M3", "M4", "M5", "M6", "T1", "T2", "T3", "T4", "T5", "T6", "N1", "N2", "N3"];
const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

async function renderizarTabela() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = ""; // Limpa a tabela

    // 1. Puxa os dados do Firebase
    const querySnapshot = await getDocs(collection(db, "atividades"));
    const aulas = [];
    querySnapshot.forEach(doc => aulas.push(doc.data()));

    // 2. Cria as linhas para cada horário (M1, M2...)
    horarios.forEach(horario => {
        const tr = document.createElement('tr');
        
        // Coluna do Tempo
        tr.innerHTML = `<td class="time-slot">${horario}</td>`;
        
        // Colunas dos Dias
        dias.forEach(dia => {
            // Procura se tem aula cadastrada para esse dia e horário
            const aulaEncontrada = aulas.find(a => a.dia === dia && a.horario === horario);
            const materia = aulaEncontrada ? aulaEncontrada.materia : "";
            
            tr.innerHTML += `<td>${materia}</td>`;
        });
        
        tbody.appendChild(tr);
    });
}

renderizarTabela();
