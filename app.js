// CONFIGURATION
const GAS_URL = "https://script.google.com/macros/s/AKfycbyi81vO2m34G4tS7_6S9Ld6uNq7D5N4FqZ6g3VzNq4/exec";
const firebaseConfig = {
    apiKey: "AIzaSyB8TZrULjTqu7hWphMrkiQHPydGriZcnoc",
    authDomain: "cs-classroom-web.firebaseapp.com",
    projectId: "cs-classroom-web",
    storageBucket: "cs-classroom-web.firebasestorage.app",
    messagingSenderId: "40170436779",
    appId: "1:40170436779:web:50af85f18e398e045cdfee",
    measurementId: "G-W5V1MFXQHY"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let userData = null;
let quizData = {};
let caseStatus = { w1:false, w2:false, w3:false, w4:false, isRevealed:false };
window.murdleState = {}; 
const TEACHER_ID = "pchrkr007";

// AUTH FUNCTIONS
function toggleAuth(type) {
    document.getElementById('login-section').classList.toggle('hidden', type === 'reg');
    document.getElementById('reg-section').classList.toggle('hidden', type === 'login');
}

function login() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(user + "@srisuvit.com", pass).catch(e => alert("เข้าสู่ระบบไม่สำเร็จ!"));
}

function register() {
    const name = document.getElementById('regName').value.trim();
    const id = document.getElementById('regId').value.trim();
    const pass = document.getElementById('regPass').value;
    if(pass.length < 6) return alert("รหัสผ่านต้องมีอย่างน้อย 6 ตัว");
    auth.createUserWithEmailAndPassword(id + "@srisuvit.com", pass).then(res => {
        db.collection("students").doc(id).set({ name: name, studentId: id, level: 1, exp: 0, mana: 0, rank: "Novice Detective", caseAnswer: {who:"",where:"",what:""} });
    }).catch(e => alert(e.message));
}

auth.onAuthStateChanged(user => {
    if (user) {
        const userId = user.email.split('@')[0];
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('reg-section').classList.add('hidden');
        document.getElementById('menu-items').classList.remove('hidden');
        document.getElementById('game-content').classList.remove('hidden');
        
        db.collection("students").doc(userId).onSnapshot(doc => {
            userData = doc.data();
            document.getElementById('st-name').innerText = userData.name;
            document.getElementById('st-mp').innerText = userData.mana;
            document.getElementById('st-lv').innerText = userData.level;
            if(!document.getElementById('game-content').innerHTML) showPage('dashboard', document.querySelector('.nav-btn'));
        });

        if(userId === TEACHER_ID) document.getElementById('teacher-btn').classList.remove('hidden');
        db.collection("settings").doc("quizzes").onSnapshot(doc => { quizData = doc.data() || {}; });
        db.collection("settings").doc("monthly_case").onSnapshot(doc => { caseStatus = doc.data() || caseStatus; });
    }
});

function logout() { auth.signOut().then(() => window.location.reload()); }

// MAIN NAVIGATION
function showPage(id, btn) {
    const display = document.getElementById('game-content');
    display.innerHTML = "";
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    window.isDoingQuiz = false;

    if (id === 'dashboard') {
        display.innerHTML = `
            <h2 class="pixel-font aqua-glow">>>> Dashboard</h2>
            <div style="background:rgba(255,255,255,0.05); padding:30px; border-radius:15px; border:1px solid var(--glass-border); line-height:1.8;">
                <p style="font-size:20px;">ยินดีต้อนรับนักสืบ ${userData.name}</p>
                <p>เลเวลปัจจุบันของคุณ: <span class="aqua-glow">${userData.level}</span></p>
                <p>ภารกิจวันนี้: เข้าไปทำแบบทดสอบ Unit 1 ใน Quest Board เพื่อสะสม EXP</p>
            </div>`;
    }

    else if (id === 'quests') {
        display.innerHTML = `
            <h2 class="pixel-font aqua-glow">>>> Quest Board</h2>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:25px;">
                <div class="content-card" style="min-height:auto; padding:30px;">
                    <h3 class="pixel-font" style="font-size:12px; color:var(--aqua);">Unit 1: แนวคิดเชิงคำนวณ</h3>
                    <button class="btn-p pixel-font" style="width:100%;" onclick="openBoss('unit1')">BOSS FIGHT</button>
                </div>
                <div class="content-card" style="min-height:auto; padding:30px;">
                    <h3 class="pixel-font" style="font-size:12px; color:var(--aqua);">Unit 2: อัลกอริทึม</h3>
                    <button class="btn-p pixel-font" style="width:100%;" onclick="openBoss('unit2')">BOSS FIGHT</button>
                </div>
            </div>`;
    }

    else if (id === 'detective') {
        window.isDoingQuiz = true;
        let gridHTML = `<table class="murdle-grid"><tr><th></th><th>เซิร์ฟเวอร์</th><th>ห้องครู</th><th>สวน</th><th>แฟลชไดรฟ์</th><th>แล็ปท็อป</th></tr>`;
        const names = ["นาย A", "นางสาว B", "เด็กชาย C"];
        names.forEach((name, r) => {
            gridHTML += `<tr><th style="background:#000;">${name}</th>`;
            for(let c=0; c<5; c++) {
                let val = window.murdleState[`r${r}c${c}`] || "";
                gridHTML += `<td id="cell_${r}_${c}" class="clickable ${val==='O'?'yes':(val==='X'?'no':'')}" onclick="clickGrid(${r},${c})">${val}</td>`;
            }
            gridHTML += `</tr>`;
        });
        gridHTML += `</table>`;

        display.innerHTML = `
            <h2 class="pixel-font" style="color:var(--detective-purple); text-shadow:0 0 10px var(--detective-purple);">>>> Case Board</h2>
            <div style="background:rgba(255,255,255,0.02); padding:20px; border-left:4px solid var(--aqua); margin-bottom:20px;">
                ตารางไขว้ตรรกะ (Murdle): คลิกเพื่อทำเครื่องหมาย (X / O) เพื่อตัดช้อยส์
            </div>
            <div style="overflow-x:auto;">${gridHTML}</div>
            <div style="margin-top:30px;">
                <h3 class="pixel-font" style="font-size:10px; color:var(--aqua);">ระบุตัวคนร้าย (ส่งได้ทุกอาทิตย์)</h3>
                <div style="display:flex; gap:10px;">
                    <select id="ansWho" style="flex:1; padding:12px; background:#000; color:#fff; border:1px solid #444;">
                        <option value="">-- ใคร? --</option><option value="นาย A">นาย A</option><option value="นางสาว B">นางสาว B</option><option value="เด็กชาย C">เด็กชาย C</option>
                    </select>
                    <button class="btn-p pixel-font" style="font-size:10px;" onclick="saveCaseAnswer()">พิพากษาคดี</button>
                </div>
            </div>`;
    }

    else if (id === 'status') {
        const expPerc = userData.exp;
        display.innerHTML = `
            <h2 class="pixel-font aqua-glow">>>> Character Info</h2>
            <div style="background:rgba(0,0,0,0.3); padding:30px; border-radius:20px; border:1px solid var(--glass-border);">
                <p class="pixel-font" style="font-size:12px; color:var(--aqua);">${userData.rank}</p>
                <p><strong>ชื่อ:</strong> ${userData.name}</p>
                <p><strong>EXP:</strong> ${userData.exp} / 100</p>
                <div class="bar-outer"><div class="bar-fill" style="width:${expPerc}%; background:var(--aqua);"></div></div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:30px;">
                    <div style="background:rgba(0,255,255,0.05); padding:15px; border:1px solid var(--aqua); border-radius:10px; text-align:center;">
                        <i class="fa-solid fa-bed"></i><br><small>พัก 5 นาที (20 MP)</small>
                    </div>
                    <div style="background:rgba(0,255,255,0.05); padding:15px; border:1px solid var(--aqua); border-radius:10px; text-align:center;">
                        <i class="fa-solid fa-users"></i><br><small>เรียกพวก (30 MP)</small>
                    </div>
                </div>
            </div>`;
    }

    else if (id === 'teacher') {
        display.innerHTML = `
            <h2 class="pixel-font" style="color:#ffcc00; text-shadow:0 0 10px #ffcc00;">>>> Teacher Panel</h2>
            <div style="display:flex; gap:10px; margin-bottom:20px;">
                <button class="btn-p" style="background:#ffcc00; color:#000;" onclick="viewTeacher('students')">นักเรียน</button>
                <button class="btn-p" style="background:var(--aqua); color:#000;" onclick="viewTeacher('quizzes')">จัดการข้อสอบ</button>
            </div>
            <div id="teacher-view"></div>`;
        viewTeacher('students');
    }
}

// MURDLE GRID LOGIC
function clickGrid(r, c) {
    let key = `r${r}c${c}`;
    let curr = window.murdleState[key] || "";
    let next = curr === "" ? "X" : (curr === "X" ? "O" : "");
    window.murdleState[key] = next;
    let cell = document.getElementById(`cell_${r}_${c}`);
    cell.innerText = next;
    cell.className = "clickable " + (next==='O'?'yes':(next==='X'?'no':''));
}

function saveCaseAnswer() {
    const who = document.getElementById('ansWho').value;
    if(!who) return alert("เลือกคนร้ายก่อนครับ!");
    db.collection("students").doc(userData.studentId).update({ "caseAnswer.who": who }).then(() => alert("บันทึกการพิพากษาคดีสำเร็จ!"));
}

// TEACHER VIEW LOGIC
function viewTeacher(v) {
    const box = document.getElementById('teacher-view');
    box.innerHTML = "Loading...";
    if(v === 'students') {
        db.collection("students").get().then(snap => {
            let html = `<table><tr><th>รหัส</th><th>ชื่อ</th><th>LV</th><th>MP</th><th>EXP</th><th>Action</th></tr>`;
            snap.forEach(doc => {
                const s = doc.data();
                html += `<tr><td>${s.studentId}</td><td>${s.name}</td><td>${s.level}</td><td>${s.mana}</td><td>${s.exp}</td><td><button onclick="giveExp('${s.studentId}', ${s.exp}, ${s.level})">+50 EXP</button></td></tr>`;
            });
            box.innerHTML = html + "</table>";
        });
    } else if(v === 'quizzes') {
        box.innerHTML = `<select onchange="loadQuizEditor(this.value)"><option value="">-- เลือก Unit --</option><option value="unit1">Unit 1</option><option value="unit2">Unit 2</option></select><div id="editor"></div>`;
    }
}

function giveExp(id, exp, lv) {
    let nExp = exp + 50; let nLv = lv; let nMa = userData.mana;
    if(nExp >= 100) { nLv++; nExp -= 100; nMa += 30; alert("Level Up!"); }
    db.collection("students").doc(id).update({ exp: nExp, level: nLv, mana: nMa });
}

// BOSS FIGHT & QUIZ EDITOR
function openBoss(u) {
    window.isDoingQuiz = true;
    const questions = quizData[u] || [];
    if(!questions.length) return alert("ยังไม่มีข้อสอบ!");
    let html = `<h2 class="pixel-font aqua-glow">BOSS FIGHT: ${u}</h2>`;
    questions.forEach((q, i) => {
        html += `<div style="background:#111; padding:15px; margin:10px 0; border-left:4px solid var(--aqua);">
            <p>${i+1}. ${q.q}</p>
            <input type="radio" name="q${i}" value="A"> ${q.a} <br>
            <input type="radio" name="q${i}" value="B"> ${q.b} <br>
        </div>`;
    });
    html += `<button class="btn-p" onclick="submitQuiz('${u}')">ส่งคำตอบ</button>`;
    document.getElementById('game-content').innerHTML = html;
}

function submitQuiz(u) {
    window.isDoingQuiz = false;
    alert("ส่งคำตอบสำเร็จ! ได้รับ EXP และ Mana");
    showPage('quests');
}

function loadQuizEditor(u) {
    const editor = document.getElementById('editor');
    const qs = quizData[u] || [];
    let html = `<h3>จัดการข้อสอบ ${u}</h3>`;
    qs.forEach((q, i) => {
        html += `<div style="border:1px solid #444; padding:10px; margin:10px 0;">
            <input type="text" value="${q.q}" placeholder="โจทย์" onchange="quizData['${u}'][${i}].q=this.value">
            <input type="text" value="${q.a}" placeholder="ก." onchange="quizData['${u}'][${i}].a=this.value">
            <input type="text" value="${q.b}" placeholder="ข." onchange="quizData['${u}'][${i}].b=this.value">
        </div>`;
    });
    html += `<button onclick="quizData['${u}'].push({q:'',a:'',b:'',key:'A'}); loadQuizEditor('${u}')">+ เพิ่มข้อ</button>`;
    html += `<button onclick="db.collection('settings').doc('quizzes').set(quizData).then(()=>alert('Saved!'))">บันทึกข้อสอบ</button>`;
    editor.innerHTML = html;
}

// ANTI CHEAT
document.addEventListener("visibilitychange", () => {
    if (document.hidden && window.isDoingQuiz && userData.studentId !== TEACHER_ID) {
        db.collection("anti_cheat_alerts").add({ studentName: userData.name, action: "สลับจอ", timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        alert("🚨 อย่าแอบสลับจอระหว่างทำภารกิจ!");
    }
});
