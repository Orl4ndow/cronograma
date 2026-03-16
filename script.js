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