const express = require('express');
const cookieParser = require('cookie-parser');
const sqlite3 = require('sqlite3').verbose();
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Read flags from environment variables (with default fallbacks)
const FLAG_1 = process.env.FLAG1 || "FLAG{1_E_R4NK_T0_S_R4NK_AWAKENED}";
const FLAG_2 = process.env.FLAG2 || "FLAG{2_SHADOW_MONARCH_SQLI_LEAKED}";
const FLAG_3 = process.env.FLAG3 || "FLAG{3_ARISE_COMMAND_INJECTION_ROOT}";

const fs = require('fs');
const path = require('path');

// Ensure the secret directory and flag file exist on server boot
const flagDir = '/tmp/shadow_realm';
if (!fs.existsSync(flagDir)) {
    fs.mkdirSync(flagDir, { recursive: true });
}
const flagPath = path.join(flagDir, 'monarch_shadow_core.txt');
fs.writeFileSync(flagPath, FLAG_3);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

// Initialize SQLite In-Memory Database for Level 2
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run("CREATE TABLE hunters (id INT, name TEXT, rank TEXT, secret_records TEXT)");
    const stmt = db.prepare("INSERT INTO hunters VALUES (?, ?, ?, ?)");
    stmt.run(1, 'Sung Jinwoo', 'S-Rank', FLAG_2);
    stmt.run(2, 'Cha Hae-In', 'S-Rank', 'Swordmaster of the Hunters Guild.');
    stmt.run(3, 'Go Gunhee', 'S-Rank', 'Chairman of the Korean Hunters Association.');
    stmt.finalize();
});

// Reusable System Layout HTML Template
const renderSystemUI = (title, levelNum, contentHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>[SYSTEM] - ${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@500;600;700&display=swap');
        
        body {
            background-color: #060913;
            background-image: radial-gradient(circle at 50% 50%, #0d1b3e 0%, #04070f 100%);
            color: #d1f0ff;
            font-family: 'Rajdhani', sans-serif;
            margin: 0;
            min-height: 100vh;
            overflow: hidden;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .bg-container {
            position: fixed;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
            z-index: 0;
            background: #000;
        }

        .bg-video {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.65;
            filter: brightness(0.45) contrast(1.1);
            z-index: 0;
        }

        .bg-layer {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at top left, rgba(0, 210, 255, 0.12), transparent 28%),
                        radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.08), transparent 20%),
                        linear-gradient(180deg, rgba(0, 0, 0, 0.1), transparent 40%, rgba(0, 0, 0, 0.22));
            mix-blend-mode: screen;
            animation: drift 30s linear infinite;
            z-index: 1;
        }

        .bg-grid {
            position: absolute;
            inset: 0;
            background-image: linear-gradient(rgba(0,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.08) 1px, transparent 1px);
            background-size: 120px 120px;
            opacity: 0.18;
            filter: blur(1px);
            transform: translateZ(0);
            animation: floatGrid 45s linear infinite;
        }

        .bg-pulse {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 24rem;
            height: 24rem;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle, rgba(0, 210, 255, 0.12), transparent 55%);
            filter: blur(4px);
            opacity: 0.85;
            animation: pulse 8s ease-in-out infinite;
        }

        .bg-star {
            position: absolute;
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.85);
            box-shadow: 0 0 12px rgba(0, 210, 255, 0.35);
            opacity: 0;
            animation: twinkle 6s ease-in-out infinite;
        }

        .system-window {
            background: rgba(8, 18, 38, 0.88);
            border: 2px solid #00d2ff;
            box-shadow: 0 0 25px rgba(0, 210, 255, 0.35), inset 0 0 18px rgba(0, 210, 255, 0.18);
            border-radius: 5px;
            width: 650px;
            padding: 34px;
            box-sizing: border-box;
            position: relative;
            z-index: 1;
            overflow: hidden;
        }

        .system-window::before {
            content: '';
            position: absolute;
            inset: -10%;
            background: radial-gradient(circle at 20% 20%, rgba(76, 207, 255, 0.18), transparent 25%),
                        radial-gradient(circle at 80% 30%, rgba(0, 255, 200, 0.12), transparent 25%);
            pointer-events: none;
        }

        @keyframes drift {
            from { transform: translate(0, 0) scale(1); }
            to { transform: translate(-80px, -120px) scale(1.05); }
        }

        @keyframes floatGrid {
            from { transform: translate(0, 0); }
            to { transform: translate(-60px, 60px); }
        }

        @keyframes pulse {
            0%, 100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.45; transform: translate(-50%, -50%) scale(1.14); }
        }

        @keyframes twinkle {
            0%, 10%, 90%, 100% { opacity: 0; transform: scale(0.9); }
            30%, 70% { opacity: 1; transform: scale(1.4); }
        }

        .system-header {
            font-family: 'Orbitron', sans-serif;
            font-size: 20px;
            color: #00d2ff;
            text-transform: uppercase;
            letter-spacing: 2px;
            border-bottom: 1px solid rgba(0, 210, 255, 0.4);
            padding-bottom: 12px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
        }

        .level-badge {
            background: #00d2ff;
            color: #04070f;
            padding: 2px 8px;
            border-radius: 2px;
            font-weight: 900;
        }

        .quest-box {
            background: rgba(0, 210, 255, 0.05);
            border-left: 3px solid #00d2ff;
            padding: 15px;
            margin-bottom: 20px;
            font-size: 16px;
        }

        input[type="text"] {
            background: #040b18;
            border: 1px solid #00d2ff;
            color: #00f0ff;
            padding: 10px;
            width: 70%;
            font-family: 'Rajdhani', sans-serif;
            font-size: 16px;
            box-shadow: inset 0 0 5px rgba(0,210,255,0.2);
        }

        button {
            background: #00d2ff;
            color: #04070f;
            border: none;
            padding: 10px 20px;
            font-family: 'Orbitron', sans-serif;
            font-weight: 700;
            cursor: pointer;
            text-transform: uppercase;
            transition: all 0.2s;
        }

        button:hover {
            background: #70e4ff;
            box-shadow: 0 0 15px #00d2ff;
        }

        .flag-display {
            background: rgba(0, 255, 128, 0.1);
            border: 1px solid #00ff80;
            color: #00ff80;
            padding: 12px;
            font-family: monospace;
            font-size: 18px;
            margin-top: 15px;
            word-break: break-all;
        }

        a { color: #00d2ff; text-decoration: none; font-weight: bold; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="bg-container">
        <video class="bg-video" autoplay muted loop playsinline>
            <source src="https://apl48ejlh3k0jqyb.public.blob.vercel-storage.com/solo.mp4" type="video/mp4">
        </video>
        <div class="bg-layer"></div>
        <div class="bg-grid"></div>
        <div class="bg-pulse"></div>
        <div class="bg-star" style="top:12%; left:18%; animation-delay:0s"></div>
        <div class="bg-star" style="top:22%; left:79%; animation-delay:1.4s"></div>
        <div class="bg-star" style="top:54%; left:34%; animation-delay:2.2s"></div>
        <div class="bg-star" style="top:68%; left:65%; animation-delay:1.0s"></div>
        <div class="bg-star" style="top:85%; left:46%; animation-delay:2.8s"></div>
    </div>
    <div class="system-window">
        <div class="system-header">
            <span>[ SYSTEM NOTIFICATION ]</span>
            <span class="level-badge">QUEST ${levelNum}</span>
        </div>
        <h2>${title}</h2>
        ${contentHtml}
    </div>
</body>
</html>
`;

// --- LEVEL 1: Cookie Manipulation (Daily Quest Privilege) ---
app.get('/', (req, res) => {
    let authSession = req.cookies.system_quest;

    if (!authSession) {
        // Base64 for "hunter_rank=E_RANK"
        const defaultCookie = Buffer.from('hunter_rank=E_RANK').toString('base64');
        res.cookie('system_quest', defaultCookie);
        return res.redirect('/');
    }

    let decodedRank = '';
    try {
        decodedRank = Buffer.from(authSession, 'base64').toString('utf-8');
    } catch (e) {
        decodedRank = 'INVALID_MANA';
    }

    if (decodedRank.includes('hunter_rank=S_RANK')) {
        const body = `
            <div class="quest-box">
                <p><strong>NOTIFICATION:</strong> Quest Requirements Satisfied. Your rank has been upgraded to <b>S-RANK</b>.</p>
            </div>
            <div class="flag-display">[REWARD CLAIMED]: ${FLAG_1}</div>
            <p style="margin-top:20px;"><a href="/level2">>> PROCEED TO QUEST 2: GUILD VAULT ARCHIVES</a></p>
        `;
        return res.send(renderSystemUI("DAILY QUEST: PRIVILEGE ESCALATION", 1, body));
    }

    const body = `
        <div class="quest-box">
            <p><strong>QUEST STATUS:</strong> LOCKED</p>
            <p>Current Mana Profile: <code>${decodedRank}</code></p>
            <p><i>Warning: You possess insufficient rank (E-RANK). Upgrade your soul signature to S-RANK to unlock high-level quests.</i></p>
        </div>
    `;
    res.send(renderSystemUI("DAILY QUEST: SURVIVAL", 1, body));
});

// --- LEVEL 2: SQL Injection (Hunter Registry Lookup) ---
app.get('/level2', (req, res) => {
    const body = `
        <div class="quest-box">
            <p><strong>MISSION:</strong> Extract confidential Monarch data from the Korean Hunters Association Archive.</p>
        </div>
        <form action="/level2" method="POST">
            <input type="text" name="hunter_name" placeholder="Search Hunter Name..." required />
            <button type="submit">SEARCH</button>
        </form>
    `;
    res.send(renderSystemUI("HUNTER REGISTRY ARCHIVE", 2, body));
});

app.post('/level2', (req, res) => {
    const searchTerm = req.body.hunter_name || '';
    
    // VULNERABLE SQL QUERY
    const sqlQuery = `SELECT name, rank FROM hunters WHERE name = '${searchTerm}'`;

    db.all(sqlQuery, [], (err, rows) => {
        let output = '';
        let hasFlag = false;

        if (err) {
            output = `<div style="color:#ff4d4d; margin-top:15px;">System Failure: ${err.message}</div>`;
        } else if (rows.length === 0) {
            output = `<div style="margin-top:15px;">No Hunter Records Found.</div>`;
        } else {
            const rawOutput = JSON.stringify(rows);
            output = `<pre style="background:#02060d; padding:10px; color:#00ff80; border:1px solid #00d2ff; margin-top:15px;">${JSON.stringify(rows, null, 2)}</pre>`;
            
            // Check if the output contains the flag string
            if (rawOutput.includes('FLAG{') || rawOutput.includes(FLAG_2)) {
                hasFlag = true;
            }
        }

        // Only show the proceed link IF the player successfully extracted the flag!
        const proceedLink = hasFlag 
            ? `<div class="flag-display">[QUEST CLEAR]: Flag Extracted!</div>
               <p style="margin-top:20px;"><a href="/level3">>> PROCEED TO QUEST 3: SHADOW EXTRACTION</a></p>`
            : `<p style="color:#ff9900; margin-top:15px;"><i>[SYSTEM]: Quest Incomplete. Extract the Monarch's secret records to proceed.</i></p>`;

        const body = `
            <div class="quest-box">
                <p><strong>SEARCH TERMINAL</strong></p>
            </div>
            <form action="/level2" method="POST">
                <input type="text" name="hunter_name" value="${searchTerm}" required />
                <button type="submit">SEARCH</button>
            </form>
            ${output}
            ${proceedLink}
        `;
        res.send(renderSystemUI("HUNTER REGISTRY ARCHIVE", 2, body));
    });
});

// --- HARDENED LEVEL 3: Filtered Command Injection ---
app.get('/level3', (req, res) => {
    const body = `
        <div class="quest-box">
            <p><strong>FINAL BOSS TRIAL:</strong> Invoke the spell <code>ARISE</code> to summon Commander Igris.</p>
            <p style="color:#ff9900;"><i>[SYSTEM WARNING]: Architect Security Protocol Active. Hazardous Mana Characters (; & | \` space cat env flag) are strictly suppressed!</i></p>
        </div>
        <form action="/level3" method="POST">
            <input type="text" name="spell_target" placeholder="Target Subject (e.g. igris)" required />
            <button type="submit">ARISE</button>
        </form>
    `;
    res.send(renderSystemUI("COMMANDMENT: SHADOW EXTRACTION", 3, body));
});

app.post('/level3', (req, res) => {
    let target = req.body.spell_target || '';

    // --- WAF FILTERING LOGIC ---
    // 1. Block spaces
    if (/\s/.test(target)) {
        const body = `
            <div class="quest-box"><p style="color:#ff4d4d;"><strong>[SYSTEM DEFENSE]:</strong> Mana Instability Detected! Direct spaces are forbidden by the System Firewall.</p></div>
            <form action="/level3" method="POST"><input type="text" name="spell_target" value="${target}" required /><button type="submit">ARISE</button></form>
        `;
        return res.send(renderSystemUI("COMMANDMENT: SHADOW EXTRACTION", 3, body));
    }

    // 2. Blacklist forbidden characters and words
    const forbiddenPatterns = [';', '&&', '||', '|', '`', 'cat', 'env', 'flag', 'ls'];
    let detectedBadWord = false;
    
    for (let bad of forbiddenPatterns) {
        if (target.toLowerCase().includes(bad)) {
            detectedBadWord = true;
            break;
        }
    }

    if (detectedBadWord) {
        const body = `
            <div class="quest-box"><p style="color:#ff4d4d;"><strong>[SYSTEM DEFENSE]:</strong> Malicious Mana Signal Intercepted! Restricted command pattern detected.</p></div>
            <form action="/level3" method="POST"><input type="text" name="spell_target" value="${target}" required /><button type="submit">ARISE</button></form>
        `;
        return res.send(renderSystemUI("COMMANDMENT: SHADOW EXTRACTION", 3, body));
    }

    // VULNERABLE COMMAND EXECUTION (using newlines %0a or subshell substitution)
    const command = `echo Extraction Status for Subject: ${target}`;

    exec(command, (error, stdout, stderr) => {
        let outputHtml = '';
        let hasFlag = false;

        if (error || stderr) {
            outputHtml = `<div style="color:#ff4d4d; margin-top:15px;">Mana Backfire: ${error ? error.message : stderr}</div>`;
        } else {
            outputHtml = `<pre style="background:#02060d; padding:10px; color:#00ff80; border:1px solid #00d2ff; margin-top:15px;">${stdout}</pre>`;
            if (stdout.includes('FLAG{') || stdout.includes(FLAG_3)) {
                hasFlag = true;
            }
        }

        const completionStatus = hasFlag
            ? `<div class="flag-display">[VICTORY CLEARED]: Shadow Monarch Awakened! All Quests Complete!</div>`
            : `<p style="color:#ff9900; margin-top:15px;"><i>[SYSTEM]: Spell executed, but Shadow Core remains unextracted. Read the flag file from /tmp/shadow_realm/ to awaken the Monarch.</i></p>`;

        const body = `
            <div class="quest-box"><p><strong>EXTRACTION TERMINAL</strong></p></div>
            <form action="/level3" method="POST">
                <input type="text" name="spell_target" value="${target}" required />
                <button type="submit">ARISE</button>
            </form>
            ${outputHtml}
            ${completionStatus}
        `;
        res.send(renderSystemUI("COMMANDMENT: SHADOW EXTRACTION", 3, body));
    });
});

app.listen(PORT, () => {
    console.log(`[+] System Online: Listening on http://localhost:${PORT}`);
});