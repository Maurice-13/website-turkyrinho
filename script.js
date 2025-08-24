// Deine Tabellen-ID und der Name des Tabellenblatts
const spreadsheetId = '13IO47uNEypzlOu20hTJ68c-h2r2RiAsiFwsOiwQVC1Q';
const sheetName = 'Turkyrinho bsp liste für website';
const range = 'A2:A50';

// Die URL, um die Daten als JSON zu erhalten
const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}&range=${range}`;

// Funktion, um die Daten von Google Sheets zu holen
async function fetchData() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        // Verarbeite und gib die Daten als Array von Objekten zurück
        const data = json.table.rows.map(row => {
            if (row.c[0] && row.c[0].v) {
                const fullText = row.c[0].v;
                const match = fullText.match(/(.+?) (\d+) wins? \((.+?)\)/i);
                
                if (match) {
                    const playerName = match[1];
                    const winCount = parseInt(match[2]);
                    const playerRank = match[3];
                    return {
                        name: playerName,
                        wins: winCount,
                        rank: playerRank
                    };
                }
            }
            return null;
        }).filter(item => item !== null); // Entferne alle fehlerhaften Einträge
        
        return data;
    } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
        return [];
    }
}

// Funktion, um die Daten zu sortieren und anzuzeigen
async function main() {
    const players = await fetchData();

    // Sortiere die Spieler nach der Anzahl der Siege, absteigend
    players.sort((a, b) => b.wins - a.wins);

    const playerListDiv = document.getElementById('player-list');
    playerListDiv.innerHTML = ''; // Vorherige Inhalte löschen

    if (players.length === 0) {
        playerListDiv.innerHTML = '<p>Keine Spielerdaten gefunden.</p>';
        return;
    }

    players.forEach((player, index) => {
        let emoji = '';
        if (index === 0) {
            emoji = '👑'; // Platz 1
        } else if (index === 1) {
            emoji = '🥈'; // Platz 2
        } else if (index === 2) {
            emoji = '🥉'; // Platz 3
        }

        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'player-name player-info';
        nameSpan.textContent = `${emoji} ${player.name}`.trim();

        const rankSpan = document.createElement('span');
        rankSpan.className = 'player-rank';
        rankSpan.textContent = player.rank;

        const winsSpan = document.createElement('span');
        winsSpan.className = 'player-wins';
        winsSpan.textContent = `${player.wins} Siege`;

        playerItem.appendChild(nameSpan);
        playerItem.appendChild(rankSpan);
        playerItem.appendChild(winsSpan);
        playerListDiv.appendChild(playerItem);
    });

    // Aktualisiert die Daten alle 17 Sekunden
    setInterval(async () => {
        const newPlayers = await fetchData();
        newPlayers.sort((a, b) => b.wins - a.wins);
        displayData(newPlayers);
    }, 17000);
}

// Startet die Anwendung, wenn die Seite geladen ist
main();