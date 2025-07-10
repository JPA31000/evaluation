const ateliers = [
    { nom: "Électricité - Tir à la gaine", hasTime: true, isEMNB: false },
    { nom: "Plomberie - Mikado du plombier", hasTime: true, isEMNB: false },
    { nom: "Plomberie - CAPLA du plombier", hasTime: true, isEMNB: false },
    { nom: "Peinture - Pas de pot", hasTime: false, isEMNB: false },
    { nom: "Peinture - Transvasement coloré", hasTime: true, isEMNB: false },
    { nom: "Finition et Arts appliqués", hasTime: false, isEMNB: false },
    { nom: "Gros Œuvre - Ça passe ou ça casse", hasTime: true, isEMNB: false },
    { nom: "Gros Œuvre - Mannequin béton", hasTime: true, isEMNB: false },
    { nom: "Charpente 1 - Tour de Fröbel", hasTime: true, isEMNB: false },
    { nom: "Charpente 2 - Casse-tête bois", hasTime: true, isEMNB: false },
    { nom: "Menuiserie Alu - Attaque des vitres", hasTime: true, isEMNB: false },
    { nom: "Menuiserie Alu - Passe-vitre", hasTime: true, isEMNB: false },
    { nom: "EMNB Memory numérique", hasTime: true, isEMNB: true },
    { nom: "EMNB Mots mêlés : Architecture & BTP", hasTime: true, isEMNB: true },
    { nom: "EMNB Snake Quiz – Construction BTP", hasTime: true, isEMNB: true },
    { nom: "EMNB Puzzle Sliding BTP", hasTime: true, isEMNB: true },
    { nom: "EMNB Jeu du Pendu – Thème BTP", hasTime: true, isEMNB: true }
];

// --- NOUVELLE FONCTION POUR SAUVEGARDER ---
function saveData(groupId) {
    const dataToSave = {};
    for (let i = 0; i < ateliers.length; i++) {
        const etat = document.getElementById(`${groupId}_etat_${i}`).value;
        const timeEl = document.getElementById(`${groupId}_time_${i}`);
        const time = timeEl ? timeEl.value : "";
        const esprit = document.getElementById(`${groupId}_esprit_${i}`).value;

        if (etat || (timeEl && time) || esprit) {
            dataToSave[`atelier_${i}`] = { etat, time, esprit };
        }
    }
    localStorage.setItem(groupId, JSON.stringify(dataToSave));
}

// --- NOUVELLE FONCTION POUR CHARGER ---
function loadData(groupId) {
    const savedData = localStorage.getItem(groupId);
    if (savedData) {
        const data = JSON.parse(savedData);
        for (const key in data) {
            const index = key.split('_')[1];
            const item = data[key];

            document.getElementById(`${groupId}_etat_${index}`).value = item.etat || "";
            const timeEl = document.getElementById(`${groupId}_time_${index}`);
            if (timeEl) {
                timeEl.value = item.time || "";
            }
            document.getElementById(`${groupId}_esprit_${index}`).value = item.esprit || "";
        }
    }
}

const groupScores = {};
for (let i = 1; i <= 11; i++) {
    groupScores[`groupe${i}`] = {};
}

function showTab(tabId) {
    // Masquer tous les contenus
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    // Désactiver tous les onglets
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Activer l'onglet sélectionné
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

function createTimeOptions(isEMNB = false) {
    let options = '';
    const maxMinutes = isEMNB ? 3 : 10;
    
    for (let minutes = 0; minutes <= maxMinutes; minutes++) {
        for (let seconds = 0; seconds < 60; seconds += 30) {
            if (minutes === 0 && seconds === 0) continue;
            if (minutes === maxMinutes && seconds > 0) break;
            
            const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            options += `<option value="${timeStr}">${timeStr}</option>`;
        }
    }
    return options;
}

function createEvaluationTable(groupId) {
    let tableHTML = `
        <table class="evaluation-table">
            <thead>
                <tr>
                    <th>Atelier</th>
                    <th>État</th>
                    <th>Temps</th>
                    <th>Esprit d'équipe /20</th>
                </tr>
            </thead>
            <tbody>
    `;

    ateliers.forEach((atelier, index) => {
        const timeInput = atelier.hasTime ? 
            `<select onchange="updateScore('${groupId}', ${index})" id="${groupId}_time_${index}">
                <option value="">--:--</option>
                ${createTimeOptions(atelier.isEMNB)}
            </select>` : 
            'N/A';

        tableHTML += `
            <tr>
                <td class="atelier-name">${atelier.nom}</td>
                <td>
                    <select onchange="updateScore('${groupId}', ${index})" id="${groupId}_etat_${index}">
                        <option value="">--</option>
                        <option value="✅">✅</option>
                        <option value="⚠️">⚠️</option>
                        <option value="❌">❌</option>
                    </select>
                </td>
                <td>${timeInput}</td>
                <td>
                    <select onchange="updateScore('${groupId}', ${index})" id="${groupId}_esprit_${index}">
                        <option value="">--</option>
                        <option value="0">0</option>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                    </select>
                </td>
            </tr>
        `;
    });

    tableHTML += `
        </tbody>
    </table>`;

    return tableHTML;
}

function timeToSeconds(timeStr) {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
}

function calculateTimeScore(timeInSeconds, isEMNB = false) {
    if (isEMNB) {
        // Jeux EMNB BTP : tranches spéciales (3 min max)
        if (timeInSeconds <= 60) return 20;           // 0-1 min
        if (timeInSeconds <= 120) return 10;          // 1m30-2 min
        if (timeInSeconds <= 180) return 5;           // 2m30-3 min
        return 0;
    } else {
        // Autres ateliers : système par tranches de 5 minutes
        const minutes = timeInSeconds / 60;
        if (minutes <= 5) return 20;         // 0-5 min
        if (minutes <= 10) return 10;        // 6-10 min
        if (minutes <= 15) return 5;         // 11-15 min
        return 0;
    }
}

function getEffectiveTime(groupId, atelierIndex) {
    const etat = document.getElementById(`${groupId}_etat_${atelierIndex}`).value;
    const atelier = ateliers[atelierIndex];
    
    if (etat === '⚠️') {
        return null; // Pas fait
    }
    
    if (etat === '❌') {
        // Temps maximum : 15 min pour ateliers normaux, 3 min pour EMNB
        return atelier.isEMNB ? 180 : 900; // en secondes
    }
    
    if (etat === '✅') {
        const timeElement = document.getElementById(`${groupId}_time_${atelierIndex}`);
        if (timeElement && timeElement.value) {
            return timeToSeconds(timeElement.value);
        }
        return null;
    }
    
    return null;
}

// --- FONCTION MODIFIÉE ---
function updateScore(groupId, atelierIndex) {
    // Sauvegarder les données pour le groupe actuel à chaque modification
    saveData(groupId);
    // Mettre à jour le classement global à chaque modification
    updateClassement();
}

function updateClassement() {
    const classementDiv = document.getElementById('classement-general');
    const groupsArray = [];
    
    for (let i = 1; i <= 11; i++) {
        const groupId = `groupe${i}`;
        let totalScore = 0;
        
        // Calculer le score total pour ce groupe
        for (let atelierIndex = 0; atelierIndex < ateliers.length; atelierIndex++) {
            const etat = document.getElementById(`${groupId}_etat_${atelierIndex}`).value;
            const esprit = parseFloat(document.getElementById(`${groupId}_esprit_${atelierIndex}`).value) || 0;
            const atelier = ateliers[atelierIndex];
            
            if (etat === '⚠️') {
                // Pas fait : 0 points
                continue;
            }
            
            if (etat === '✅') {
                // Réussi : 20 points + points temps + esprit d'équipe
                totalScore += 20 + esprit;
                
                // Ajouter les points temps si applicable
                if (atelier.hasTime) {
                    const effectiveTime = getEffectiveTime(groupId, atelierIndex);
                    if (effectiveTime !== null) {
                        totalScore += calculateTimeScore(effectiveTime, atelier.isEMNB);
                    }
                }
            } else if (etat === '❌') {
                // Échec : 10 points + esprit d'équipe (pas de points temps)
                totalScore += 10 + esprit;
            }
        }
        
        groupsArray.push({ 
            nom: `Groupe ${i}`, 
            totalScore: totalScore,
            groupId: groupId
        });
    }
    
    // Trier par score décroissant
    groupsArray.sort((a, b) => b.totalScore - a.totalScore);
    
    let tableHTML = `
        <table class="classement-table">
            <thead>
                <tr>
                    <th>Rang</th>
                    <th>Groupe</th>
                    <th>Score Total</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    groupsArray.forEach((group, index) => {
        const rank = index + 1;
        let rowClass = '';
        if (rank === 1) rowClass = 'rank-1';
        else if (rank === 2) rowClass = 'rank-2';
        else if (rank === 3) rowClass = 'rank-3';
        
        tableHTML += `
            <tr class="${rowClass}">
                <td>${rank}</td>
                <td>${group.nom}</td>
                <td>${group.totalScore}</td>
            </tr>
        `;
    });
    
    tableHTML += `
        </tbody>
    </table>`;
    
    classementDiv.innerHTML = tableHTML;
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(16);
    doc.text('Évaluation des Ateliers - Journée d\'Intégration', 20, 20);
    doc.setFontSize(12);
    doc.text('Lycée Professionnel du Bâtiment', 20, 30);
    
    let yPosition = 50;
    
    // Classement général
    doc.setFontSize(14);
    doc.text('Classement Général', 20, yPosition);
    yPosition += 10;
    
    const groupsArray = [];
    for (let i = 1; i <= 11; i++) {
        const groupId = `groupe${i}`;
        let totalScore = 0;
        
        for (let atelierIndex = 0; atelierIndex < ateliers.length; atelierIndex++) {
            const etat = document.getElementById(`${groupId}_etat_${atelierIndex}`).value;
            const esprit = parseFloat(document.getElementById(`${groupId}_esprit_${atelierIndex}`).value) || 0;
            const atelier = ateliers[atelierIndex];
            
            if (etat === '⚠️') continue;
            
            if (etat === '✅') {
                totalScore += 20 + esprit;
                if (atelier.hasTime) {
                    const effectiveTime = getEffectiveTime(groupId, atelierIndex);
                    if (effectiveTime !== null) {
                        totalScore += calculateTimeScore(effectiveTime, atelier.isEMNB);
                    }
                }
            } else if (etat === '❌') {
                totalScore += 10 + esprit;
            }
        }
        
        groupsArray.push({ 
            nom: `Groupe ${i}`, 
            totalScore: totalScore
        });
    }
    
    groupsArray.sort((a, b) => b.totalScore - a.totalScore);
    
    doc.setFontSize(10);
    groupsArray.forEach((group, index) => {
        doc.text(`${index + 1}. ${group.nom}: ${group.totalScore} points`, 20, yPosition);
        yPosition += 8;
    });
    
    doc.save('evaluation_ateliers.pdf');
}

// Fonction pour réinitialiser les données d'un groupe
function resetGroupData(groupId) {
    const password = prompt("Veuillez entrer le code de réinitialisation (123) :");
    if (password === '123') {
        localStorage.removeItem(groupId);
        const evaluationDiv = document.getElementById(`evaluation-${groupId}`);
        evaluationDiv.innerHTML = createEvaluationTable(groupId); // Re-créer la table pour vider les sélections
        updateClassement(); // Mettre à jour le classement après réinitialisation
        alert(`Les données pour ${groupId} ont été réinitialisées.`);
    } else {
        alert("Code incorrect. La réinitialisation a été annulée.");
    }
}

// --- INITIALISATION MODIFIÉE ---
document.addEventListener('DOMContentLoaded', function() {
    for (let i = 1; i <= 11; i++) {
        const groupId = `groupe${i}`;
        const evaluationDiv = document.getElementById(`evaluation-${groupId}`);
        evaluationDiv.innerHTML = createEvaluationTable(groupId);
        // Charger les données sauvegardées pour chaque groupe
        loadData(groupId);
    }
    updateClassement();
});