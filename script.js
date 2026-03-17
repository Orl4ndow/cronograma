import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Configurações do seu projeto (conforme seu print do Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyBE7xBpq8NT1SD_jDT3aFHewh-htlp5msQ",
    authDomain: "cronograma-173c9.firebaseapp.com",
    projectId: "cronograma-173c9",
    storageBucket: "cronograma-173c9.firebasestorage.app",
    messagingSenderId: "819169022068",
    appId: "1:819169022068:web:407ad2627d0250ee548121",
    measurementId: "G-71X9KYC4D2"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Definições de horários e dias da UERJ
const horarios = ["M1", "M2", "M3", "M4", "M5", "M6", "T1", "T2", "T3", "T4", "T5", "T6", "N1", "N2", "N3"];
const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

// --- FUNÇÃO DE NAVEGAÇÃO ENTRE ABAS ---
window.switchTab = (tab) => {
    const agendaSection = document.getElementById('section-agenda');
    const fixoSection = document.getElementById('section-fixo');
    
    if(tab === 'agenda') {
        agendaSection.style.display = 'block';
        fixoSection.style.display = 'none';
        document.getElementById('tab-agenda').classList.add('active');
        document.getElementById('tab-fixo').classList.remove('active');
    } else {
        agendaSection.style.display = 'none';
        fixoSection.style.display = 'block';
        document.getElementById('tab-agenda').classList.remove('active');
        document.getElementById('tab-fixo').classList.add('active');
    }
};

// --- LOGICA DO CRONOGRAMA FIXO ---

function carregarCronogramaFixo() {
    const colRef = collection(db, "cronograma_fixo");
    
    // Escuta em tempo real: qualquer mudança no Firebase reflete aqui na hora
    onSnapshot(colRef, (snapshot) => {
        const aulas = [];
        snapshot.forEach(doc => {
            aulas.push({ id: doc.id, ...doc.data() });
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
        
        // Coluna do Horário (Ex: M1)
        const tdHorario = document.createElement('td');
        tdHorario.className = 'time-slot';
        tdHorario.innerText = h;
        tr.appendChild(tdHorario);
        
        // Colunas dos Dias da Semana
        dias.forEach(d => {
            const td = document.createElement('td');
            const aula = aulas.find(a => a.dia === d && a.horario === h);
            
            if (aula) {
                // Se existe matéria, cria o card e define função de apagar
                td.innerHTML = `<div class="materia-card">${aula.materia}</div>`;
                td.onclick = () => gerenciarAula(aula.id, aula.materia, true);
            } else {
                // Se está vazio, define função de adicionar
                td.onclick = () => gerenciarAula(null, null, false, d, h);
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// --- FUNÇÃO PARA ADICIONAR OU APAGAR MATÉRIA ---
window.gerenciarAula = async (id, materiaNome, existe, dia, horario) => {
    if (existe) {
        // Fluxo de Apagar
        if (confirm(`Deseja remover a matéria "${materiaNome}"?`)) {
            try {
                await deleteDoc(doc(db, "cronograma_fixo", id));
            } catch (error) {
                console.error("Erro ao apagar:", error);
                alert("Erro ao remover matéria.");
            }
        }
    } else {
        // Fluxo de Adicionar
        const novaMateria = prompt(`Nova matéria para ${dia} às ${horario}:`);
        if (novaMateria && novaMateria.trim() !== "") {
            try {
                await addDoc(collection(db, "cronograma_fixo"), {
                    dia: dia,
                    horario: horario,
                    materia: novaMateria,
                    usuario: "Orlando",
                    timestamp: new Date()
                });
            } catch (error) {
                console.error("Erro ao adicionar:", error);
                alert("Erro ao salvar no Firebase. Verifique as Regras de Segurança.");
            }
        }
    }
};

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    carregarCronogramaFixo();
    // Aqui você pode inicializar a função do calendário mensal se desejar
});
