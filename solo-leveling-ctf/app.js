const express = require('express');
const cookieParser = require('cookie-parser');
const sqlite3 = require('sqlite3').verbose();
const { exec } = require('child_process');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Read secret tokens and final flag from environment variables (with default fallbacks)
const RANK_TOKEN = process.env.RANK_TOKEN || "FLAG{1_E_R4NK_T0_S_R4NK_AWAKENED}";
const ARCHIVE_TOKEN = process.env.ARCHIVE_TOKEN || "FLAG{2_SHADOW_MONARCH_SQLI_LEAKED}";
const FINAL_FLAG = process.env.FLAG || "FLAG{3_ARISE_COMMAND_INJECTION_ROOT}";

const fs = require('fs');
const path = require('path');

const encodeQuestState = (state) => Buffer.from(`hunter_rank=${state.hunter_rank};progress=${state.progress}`).toString('base64');
const parseQuestState = (value) => {
    const defaultState = { hunter_rank: 'E_RANK', progress: 0 };
    if (!value) return defaultState;

    let decoded = '';
    try {
        decoded = Buffer.from(value, 'base64').toString('utf-8');
    } catch (e) {
        return defaultState;
    }

    const parts = decoded.split(';').reduce((acc, pair) => {
        const [key, val] = pair.split('=');
        if (key && val) acc[key] = val;
        return acc;
    }, {});

    return {
        hunter_rank: parts.hunter_rank || 'E_RANK',
        progress: Number(parts.progress) || 0,
    };
};

// Ensure the secret directory and flag file exist on server boot
const flagDir = '/tmp/shadow_realm';
if (!fs.existsSync(flagDir)) {
    fs.mkdirSync(flagDir, { recursive: true });
}
const flagPath = path.join(flagDir, 'monarch_shadow_core.txt');
fs.writeFileSync(flagPath, FINAL_FLAG);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware: regenerate on full page GET to reset on hard refresh
// Lightweight in-memory session store (avoids external dependency)
const _sessions = {};
function createSession(){
    return { progress: 0, levels: {1:false,2:false,3:false} };
}

app.use((req, res, next) => {
    const sid = req.cookies && req.cookies.__sid;
    if (!sid || !_sessions[sid]) {
        const newSid = crypto.randomBytes(16).toString('hex');
        res.cookie('__sid', newSid, { httpOnly: true });
        _sessions[newSid] = createSession();
        req.session = _sessions[newSid];
        req._sid = newSid;
    } else {
        req.session = _sessions[sid];
        req._sid = sid;
    }
    next();
});

// Serve static SPA assets from /public
app.use(express.static(path.join(__dirname, 'public')));

// parse JSON bodies for API
app.use(express.json());

// Initialize SQLite In-Memory Database for Level 2
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run("CREATE TABLE hunters (id INT, name TEXT, rank TEXT, secret_records TEXT)");
    const stmt = db.prepare("INSERT INTO hunters VALUES (?, ?, ?, ?)");
    stmt.run(1, 'Sung Jinwoo', 'S-Rank', ARCHIVE_TOKEN);
    stmt.run(2, 'Cha Hae-In', 'S-Rank', 'Swordmaster of the Hunters Guild.');
    stmt.run(3, 'Go Gunhee', 'S-Rank', 'Chairman of the Korean Hunters Association.');
    stmt.finalize();
});

// Serve SPA root and reset session on full page load
app.get('/', (req, res) => {
    // Hard page load: regenerate session to reset progress
    const newSid = crypto.randomBytes(16).toString('hex');
    res.cookie('__sid', newSid, { httpOnly: true });
    _sessions[newSid] = createSession();
    req.session = _sessions[newSid];
    req._sid = newSid;
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: status
app.get('/api/status', (req, res) => {
    res.json({ progress: req.session.progress || 0, levels: req.session.levels || { 1: false, 2: false, 3: false } });
});

// API: complete level1 by submitting base64 quest state
app.post('/api/level1', (req, res) => {
    const state = req.body.state || '';
    const parsed = parseQuestState(state);
    if (parsed.hunter_rank === 'S_RANK') {
        req.session.levels[1] = true;
        req.session.progress = Math.max(req.session.progress || 0, 1);
        return res.json({ ok: true, message: 'Level 1 complete' });
    }
    return res.status(400).json({ ok: false, message: 'Invalid state: hunter_rank must be S_RANK' });
});

// API: level2 search (vulnerable SQL) - requires level1 completed
app.post('/api/level2', (req, res) => {
    if (!req.session.levels || !req.session.levels[1]) {
        return res.status(403).json({ ok: false, message: 'Complete level 1 first' });
    }
    const searchTerm = req.body.hunter_name || '';
    const sqlQuery = `SELECT name, rank, secret_records FROM hunters WHERE name = '${searchTerm}'`;
    db.all(sqlQuery, [], (err, rows) => {
        if (err) return res.status(500).json({ ok: false, error: err.message });
        if (rows.length === 0) return res.json({ ok: true, rows: [] });

        // Indicate completion if archive token appears anywhere in the returned rows
        try {
            const rowsText = JSON.stringify(rows);
            if (rowsText.includes(ARCHIVE_TOKEN)) {
                req.session.levels[2] = true;
                req.session.progress = Math.max(req.session.progress || 0, 2);
            }
        } catch (e) {
            // fallback: conservative check per-row
            if (rows.some(r => Object.values(r).some(v => typeof v === 'string' && v.includes(ARCHIVE_TOKEN)))) {
                req.session.levels[2] = true;
                req.session.progress = Math.max(req.session.progress || 0, 2);
            }
        }
        return res.json({ ok: true, rows });
    });
});

// API: level3 command execution - requires level2 completed
app.post('/api/level3', (req, res) => {
    if (!req.session.levels || !req.session.levels[2]) {
        return res.status(403).json({ ok: false, message: 'Complete level 2 first' });
    }
    let target = req.body.spell_target || '';

    // WAF
    if (/\s/.test(target)) return res.status(400).json({ ok: false, message: 'Spaces are forbidden' });
    const forbiddenPatterns = [';', '&&', '||', '|', '`', 'cat', 'env', 'flag', 'ls'];
    for (let bad of forbiddenPatterns) if (target.toLowerCase().includes(bad)) return res.status(400).json({ ok: false, message: 'Forbidden pattern detected' });

    const command = `echo Extraction Status for Subject: ${target}`;
    exec(command, (error, stdout, stderr) => {
        if (error || stderr) return res.status(500).json({ ok: false, error: (error ? error.message : stderr) });
        let finalFound = false;
        // Check stdout for final flag
        if (stdout.includes(FINAL_FLAG)) finalFound = true;

        // If exploitation succeeded and final flag is reachable, mark level3
        if (finalFound) {
            req.session.levels[3] = true;
            req.session.progress = Math.max(req.session.progress || 0, 3);
        }

        return res.json({ ok: true, stdout, final: finalFound });
    });
});

// API: get final flag if all levels completed
app.get('/api/final', (req, res) => {
    if (req.session.levels && req.session.levels[1] && req.session.levels[2] && req.session.levels[3]) {
        return res.json({ ok: true, flag: FINAL_FLAG });
    }
    return res.status(403).json({ ok: false, message: 'Complete all levels first' });
});

// API: reset session explicitly
app.post('/api/reset', (req, res) => {
    const newSid = crypto.randomBytes(16).toString('hex');
    res.cookie('__sid', newSid, { httpOnly: true });
    _sessions[newSid] = createSession();
    req.session = _sessions[newSid];
    req._sid = newSid;
    return res.json({ ok: true });
});

app.listen(PORT, () => {
    console.log(`[+] System Online: Listening on http://localhost:${PORT}`);
});