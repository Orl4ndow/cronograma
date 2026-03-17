import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Credenciais atualizadas conforme seu print
const firebaseConfig = {
  apiKey: "AIzaSyBE7xBpq8NT1SD_jDT3aFHewh-htlp5msQ",
  authDomain: "cronograma-173c9.firebaseapp.com",
  projectId: "cronograma-173c9",
  storageBucket: "cronograma-173c9.firebasestorage.app",
  messagingSenderId: "819169022068",
  appId: "1:819169022068:web:407ad2627d0250ee548121", // ID Atualizado do seu print
  measurementId: "G-71X9KYC4D2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const horarios = ["M1", "M2", "M3", "M4", "M5", "M6", "T1", "T2", "T3", "T4", "T5", "T6", "N1", "N2", "N3"];
const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

// Alternar Abas
window.switchTab = (tab) => {
    document.getElementById('section-agenda').style.display = tab === 'agenda' ? 'block' : 'none';
    document.getElementById('section-fixo').style.display = tab === 'fixo' ? 'block' : 'none';
    document.getElementById('tab-agenda').classList.toggle('active', tab === 'agenda');
    document.getElementById('tab-fixo').classList.toggle('active', tab === 'fixo');
};

// Carregar Cronograma Fixo da UERJ
function carregarCronogramaFixo() {
    const colRef = collection(db, "cronograma_fixo");
    
    // Escuta em tempo real
    onSnapshot(colRef, (snapshot) => {
        const aulas = [];
        snapshot.forEach(doc => aulas.push(doc.data()));
        renderizarTabelaFixo(aulas);
    });
}

function renderizarTabelaFixo(aulas) {
    const tbody = document.getElementById('fixed-body');
    if(!tbody) return;
    tbody.innerHTML = "";

    horarios.forEach(h => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="time-slot">${h}</td>`;
        
        dias.forEach(d => {
            const aula = aulas.find(a => a.dia === d && a.horario === h);
            const conteudo = aula ? `<div class="materia-card">${aula.materia}</div>` : "";
            tr.innerHTML += `<td onclick="promptNovaMateria('${d}', '${h}')">${conteudo}</td>`;
        });
        tbody.appendChild(tr);
    });
}

// Função para adicionar matéria clicando na célula
window.promptNovaMateria = async (dia, horario) => {
    const materia = prompt(`Adicionar matéria para ${dia} às ${horario}:`);
    if (materia) {
        try {
            await addDoc(collection(db, "cronograma_fixo"), {
                dia: dia,
                horario: horario,
                materia: materia,
                usuario: "Orlando"
            });
        } catch (e) {
            console.error("Erro ao salvar: ", e);
            alert("Erro ao salvar! Verifique as regras do Firebase.");
        }
    }
};

// Inicialização
carregarCronogramaFixo();
// Se tiver a função de calendário, chame-a aqui também

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Suas credenciais (Mantenha as mesmas do print anterior)
const firebaseConfig = {
  apiKey: "AIzaSyBE7xBpq8NT1SD_jDT3aFHewh-htlp5msQ",
  authDomain: "cronograma-173c9.firebaseapp.com",
  projectId: "cronograma-173c9",
  appId: "1:819169022068:web:407ad2627d0250ee548121"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const horarios = ["M1", "M2", "M3", "M4", "M5", "M6", "T1", "T2", "T3", "T4", "T5", "T6", "N1", "N2", "N3"];
const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

function carregarCronogramaFixo() {
    onSnapshot(collection(db, "cronograma_fixo"), (snapshot) => {
        const aulas = [];
        snapshot.forEach(doc => {
            aulas.push({ id: doc.id, ...doc.data() }); // Guardamos o ID aqui
        });
        renderizarTabelaFixo(aulas);
    });
}

function renderizarTabelaFixo(aulas) {
    const tbody = document.getElementById('fixed-body');
    if(!tbody) return;
    tbody.innerHTML = "";

    horarios.forEach(h => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="time-slot">${h}</td>`;
        
        dias.forEach(d => {
            const aula = aulas.find(a => a.dia === d && a.horario === h);
            const td = document.createElement('td');
            
            if (aula) {
                td.innerHTML = `<div class="materia-card">${aula.materia}</div>`;
                // Se já tem aula, o clique é para deletar
                td.onclick = () => gerenciarAula(aula.id, aula.materia, true);
            } else {
                // Se está vazio, o clique é para adicionar
                td.onclick = () => gerenciarAula(null, null, false, d, h);
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// Função Única para Adicionar ou Deletar
window.gerenciarAula = async (id, materiaNome, existe, dia, horario) => {
    if (existe) {
        if (confirm(`Deseja remover a matéria "${materiaNome}"?`)) {
            await deleteDoc(doc(db, "cronograma_fixo", id));
        }
    } else {
        const novaMateria = prompt(`Nova matéria para ${dia} às ${horario}:`);
        if (novaMateria) {
            await addDoc(collection(db, "cronograma_fixo"), {
                dia: dia,
                horario: horario,
                materia: novaMateria,
                usuario: "Orlando"
            });
        }
    }
};

carregarCronogramaFixo();
