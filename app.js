// ==========================================
// 🚨 ตั้งค่า URL จาก Google Apps Script ที่นี่ 🚨
// ==========================================
const GAS_URL = "https://script.google.com/macros/s/AKfycbyi81vO2m34G4tS7_6S9Ld6uNq7D5N4FqZ6g3VzNq4/exec";

// ==========================================
// 🚨 ตั้งค่า Firebase Config ของครูเบียร์ 🚨
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyB8TZrULjTqu7hWphMrkiQHPydGriZcnoc",
    authDomain: "cs-classroom-web.firebaseapp.com",
    projectId: "cs-classroom-web",
    storageBucket: "cs-classroom-web.firebasestorage.app",
    messagingSenderId: "40170436779",
    appId: "1:40170436779:web:50af85f18e398e045cdfee",
    measurementId: "G-W5V1MFXQHY"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let userData = null;
let quizData = {}; 
const TEACHER_ID = "pchrkr007";
window.isDoingQuiz = false; // ตัวแปรดักจับ Anti-Cheat

// --- ระบบ Authentication ---
function toggleAuth(type) {
    document.getElementById('login-section').classList.toggle('hidden', type === 'reg');
    document.getElementById('reg-section').classList.toggle('hidden', type === 'login');
}

function login() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    if(!user || !pass) return alert("ระบุข้อมูลให้ครบถ้วน!");
    auth.signInWithEmailAndPassword(user + "@srisuvit.com", pass).catch(e => alert("รหัสผ่านไม่ถูกต้อง!"));
}

function register() {
    const name = document.getElementById('regName').value.trim();
    const id = document.getElementById('regId').value.trim();
    const pass = document.getElementById('regPass').value;
    if(!name || !id || pass.length < 6) return alert("ข้อมูลไม่ถูกต้อง!");

    auth.createUserWithEmailAndPassword(id + "@srisuvit.com", pass).then((res) => {
        db.collection("students").doc(id).set({
            name: name, studentId: id, level: 1, exp: 0, mana: 0, rank: "Novice"
        }).then(() => window.location.reload());
    });
}

auth.onAuthStateChanged(user => {
    if (user) {
        const userId = user.email.split('@')[0];
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('menu-items').classList.remove('hidden');
        document.getElementById('game-content').classList.remove('hidden');
        
        db.collection("students").doc(userId).onSnapshot(doc => {
            userData = doc.data();
            updateUI();
            if(document.getElementById('game-content').innerHTML === "") showPage('dashboard');
        });

        if(userId === TEACHER_ID) document.getElementById('teacher-btn').classList.remove('hidden');
        
        // โหลดข้อมูลข้อสอบจากระบบ
        db.collection("settings").doc("quizzes").onSnapshot(doc => {
            quizData = doc.data() || {};
        });
    }
});

function updateUI() {
    if(!userData) return;
    document.getElementById('st-name').innerText = userData.name;
    document.getElementById('st-mp').innerText = userData.mana;
    document.getElementById('st-lv').innerText = userData.level;
}

function logout() { auth.signOut().then(() => window.location.reload()); }

// --- ระบบแจก EXP & Level UP ---
function addExp(studentId, amount) {
    let newExp = (userData.exp || 0) + amount;
    let newLevel = userData.level;
    let newMana = userData.mana;

    if (newExp >= 100) {
        newLevel++;
        newExp -= 100;
        newMana += 30; // เลเวลอัปได้ 30 MP
        alert("🎉 LEVEL UP! ได้รับโบนัส 30 MP!");
    }

    db.collection("students").doc(studentId).update({
        exp: newExp, level: newLevel, mana: newMana
    });
}

// --- การจัดการหน้าเว็บ (Navigation) ---
function showPage(id) {
    const display = document.getElementById('game-content');
    display.innerHTML = "";
    window.isDoingQuiz = false; // ปิดระบบ Anti-Cheat เมื่อเปลี่ยนหน้า

    // อัปเดตสไตล์ของปุ่มเมนูให้เรืองแสงค้างไว้
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    if (id === 'dashboard') {
        display.innerHTML = `
            <h2 class="pixel-font title-glow">>>> Dashboard</h2>
            <div style="background:rgba(0,255,65,0.05); padding:20px; border-radius:8px; border:1px solid var(--p-green); margin-top:20px;">
                <p style="font-size:18px;">ยินดีต้อนรับ ผู้กล้า ${userData.name}</p>
                <hr style="border-color:var(--glass-border); margin:15px 0;">
                <p><strong>[ประกาศจากระบบ]</strong></p>
                <p>- ระบบบอสไฟต์: ตอบถูก 1 ข้อ ได้รับข้อละ 5 MP</p>
                <p>- ระวัง! ระบบ Anti-Cheat ดักจับการสลับจอระหว่างทำข้อสอบทำงานอยู่!</p>
            </div>
        `;
    }

    else if (id === 'quests') {
        display.innerHTML = `
            <h2 class="pixel-font title-glow">>>> Quest Board</h2>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px; margin-top:20px;">
                <div style="background:rgba(0,210,255,0.1); border:1px solid var(--mana-blue); padding:20px; border-radius:8px;">
                    <h3 class="pixel-font" style="font-size:12px; color:var(--mana-blue); text-shadow:0 0 10px var(--mana-blue);">Unit 1: แนวคิดเชิงคำนวณ</h3>
                    <p style="font-size:12px; color:#aaa;">ล้มบอสเพื่อรับ EXP และ MP!</p>
                    <button class="btn-p pixel-font" style="width:100%; border-color:var(--mana-blue); color:var(--mana-blue);" onclick="openBossFight('unit1')">ENTER BOSS FIGHT</button>
                </div>
                <div style="background:rgba(0,210,255,0.1); border:1px solid var(--mana-blue); padding:20px; border-radius:8px;">
                    <h3 class="pixel-font" style="font-size:12px; color:var(--mana-blue); text-shadow:0 0 10px var(--mana-blue);">Unit 2: อัลกอริทึม</h3>
                    <p style="font-size:12px; color:#aaa;">ล้มบอสเพื่อรับ EXP และ MP!</p>
                    <button class="btn-p pixel-font" style="width:100%; border-color:var(--mana-blue); color:var(--mana-blue);" onclick="openBossFight('unit2')">ENTER BOSS FIGHT</button>
                </div>
            </div>
        `;
    }

    else if (id === 'teacher') {
        display.innerHTML = `
            <h2 class="pixel-font" style="color:var(--accent-gold); text-shadow:0 0 15px var(--accent-gold);">>>> Kru Beer Panel</h2>
            <div style="display:flex; gap:10px; margin-bottom:20px; margin-top:20px;">
                <button class="btn-p pixel-font" style="border-color:var(--accent-gold); color:var(--accent-gold);" onclick="teacherView('students')">นักเรียน</button>
                <button class="btn-p pixel-font" style="border-color:var(--mana-blue); color:var(--mana-blue);" onclick="teacherView('quizzes')">จัดการข้อสอบ</button>
            </div>
            <div id="teacher-sub-view"></div>
        `;
        teacherView('students');
    }
}

// --- TEACHER PANEL: Sub Views ---
function teacherView(view) {
    const container = document.getElementById('teacher-sub-view');
    container.innerHTML = "กำลังดึงข้อมูลจาก Matrix...";

    if (view === 'students') {
        db.collection("students").get().then(snap => {
            let html = `<table><tr><th>รหัส</th><th>ชื่อ</th><th>LV</th><th>EXP</th><th>MP</th><th>Action</th></tr>`;
            snap.forEach(doc => {
                const s = doc.data();
                html += `<tr>
                    <td>${s.studentId}</td>
                    <td>${s.name}</td>
                    <td style="color:var(--p-green); font-weight:bold;">${s.level}</td>
                    <td>${s.exp}/100</td>
                    <td style="color:var(--mana-blue);">${s.mana}</td>
                    <td><button class="btn-p" style="padding:8px 15px; font-size:10px;" onclick="addExp('${s.studentId}', 50)">+50 EXP</button></td>
                </tr>`;
            });
            container.innerHTML = html + "</table>";
        });
    }

    else if (view === 'quizzes') {
        container.innerHTML = `
            <div style="background:rgba(0,0,0,0.5); padding:20px; border-radius:8px; border:1px solid #444;">
                <h3 class="pixel-font" style="font-size:12px; color:var(--mana-blue);">เครื่องมือจัดการข้อสอบบอสไฟต์</h3>
                <select id="edit-unit-select" onchange="loadQuizEditor(this.value)">
                    <option value="">-- เลือก Unit ที่จะสร้าง/แก้ไขข้อสอบ --</option>
                    <option value="unit1">Unit 1: แนวคิดเชิงคำนวณ</option>
                    <option value="unit2">Unit 2: อัลกอริทึม</option>
                </select>
                <div id="quiz-editor-area"></div>
            </div>
        `;
    }
}

// --- TEACHER PANEL: Quiz Editor ---
function loadQuizEditor(unitId) {
    const area = document.getElementById('quiz-editor-area');
    if(!unitId) return area.innerHTML = "";
    
    const currentQuestions = quizData[unitId] || [];
    let html = `<div style="margin-top:20px;">`;
    
    currentQuestions.forEach((q, i) => {
        html += `
            <div style="border:1px solid var(--glass-border); background:rgba(255,255,255,0.02); padding:20px; margin-bottom:15px; border-radius:8px;">
                <strong style="color:var(--accent-gold);">ข้อที่ ${i+1}</strong> 
                <input type="text" value="${q.q}" onchange="updateQData('${unitId}', ${i}, 'q', this.value)" placeholder="โจทย์คำถาม">
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <input type="text" value="${q.a}" onchange="updateQData('${unitId}', ${i}, 'a', this.value)" placeholder="ก.">
                    <input type="text" value="${q.b}" onchange="updateQData('${unitId}', ${i}, 'b', this.value)" placeholder="ข.">
                    <input type="text" value="${q.c}" onchange="updateQData('${unitId}', ${i}, 'c', this.value)" placeholder="ค.">
                    <input type="text" value="${q.d}" onchange="updateQData('${unitId}', ${i}, 'd', this.value)" placeholder="ง.">
                </div>
                <div style="margin-top:10px; display:flex; align-items:center; gap:10px;">
                    เฉลย: <select style="width:100px; padding:8px;" onchange="updateQData('${unitId}', ${i}, 'key', this.value)">
                        <option value="A" ${q.key === 'A'?'selected':''}>ก.</option>
                        <option value="B" ${q.key === 'B'?'selected':''}>ข.</option>
                        <option value="C" ${q.key === 'C'?'selected':''}>ค.</option>
                        <option value="D" ${q.key === 'D'?'selected':''}>ง.</option>
                    </select>
                    <button class="btn-p" style="border-color:var(--alert-red); color:var(--alert-red); padding:8px 15px;" onclick="removeQuestion('${unitId}', ${i})"><i class="fa-solid fa-trash"></i> ลบข้อนี้</button>
                </div>
            </div>
        `;
    });

    html += `
        <div style="display:flex; gap:10px;">
            <button class="btn-p pixel-font" style="border-color:var(--mana-blue); color:var(--mana-blue);" onclick="addQuestion('${unitId}')">+ สร้างข้อใหม่</button>
            <button class="btn-p pixel-font" style="background:var(--p-green); color:#000;" onclick="saveQuizData()">💾 เซฟลงระบบฐานข้อมูล</button>
        </div>
    </div>`;
    area.innerHTML = html;
}

function updateQData(unit, idx, field, val) { quizData[unit][idx][field] = val; }

function addQuestion(unit) {
    if(!quizData[unit]) quizData[unit] = [];
    quizData[unit].push({q: "", a: "", b: "", c: "", d: "", key: "A"});
    loadQuizEditor(unit);
}

function removeQuestion(unit, idx) {
    quizData[unit].splice(idx, 1);
    loadQuizEditor(unit);
}

function saveQuizData() {
    db.collection("settings").doc("quizzes").set(quizData).then(() => alert("อัปเดตข้อสอบสำเร็จ! เด็กๆ พร้อมลุยบอสแล้ว"));
}

// --- STUDENT: BOSS FIGHT ---
function openBossFight(unitId) {
    const display = document.getElementById('game-content');
    const questions = quizData[unitId] || [];
    
    if(questions.length === 0) return alert("พื้นที่นี้ปลอดภัย ครูเบียร์ยังไม่ได้ปล่อยบอสออกมาครับ!");

    window.isDoingQuiz = true; // เปิดระบบดักจับการสลับจอ
    let html = `
        <div style="background:rgba(255,0,60,0.2); border:1px solid var(--alert-red); padding:15px; border-radius:8px; margin-bottom:20px; text-align:center;">
            <h3 class="pixel-font" style="color:var(--alert-red); margin:0; text-shadow:0 0 10px var(--alert-red);">⚠️ WARNING: BOSS FIGHT ENGAGED ⚠️</h3>
            <p style="font-size:12px; margin-top:5px;">ระบบ ANTI-CHEAT เปิดทำงาน ห้ามสลับหน้าจอหรือพับหน้าต่างเด็ดขาด!</p>
        </div>
    `;
    
    questions.forEach((q, i) => {
        html += `
            <div class="quiz-item">
                <p><strong>ข้อที่ ${i+1}:</strong> ${q.q}</p>
                <label class="quiz-option"><input type="radio" name="q${i}" value="A"> ก. ${q.a}</label>
                <label class="quiz-option"><input type="radio" name="q${i}" value="B"> ข. ${q.b}</label>
                <label class="quiz-option"><input type="radio" name="q${i}" value="C"> ค. ${q.c}</label>
                <label class="quiz-option"><input type="radio" name="q${i}" value="D"> ง. ${q.d}</label>
            </div>
        `;
    });

    html += `<button class="btn-p pixel-font" style="width:100%; height:60px; font-size:18px; border-color:var(--alert-red); color:var(--alert-red);" onclick="submitBossFight('${unitId}')">ATTACK BOSS! (ส่งคำตอบ)</button>`;
    display.innerHTML = html;
}

function submitBossFight(unitId) {
    if(!confirm("ยืนยันการโจมตีบอสด้วยคำตอบนี้?")) return;

    window.isDoingQuiz = false; // ส่งแล้ว ปิดระบบจับผิดได้
    const questions = quizData[unitId];
    let score = 0;
    
    questions.forEach((q, i) => {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if(selected && selected.value === q.key) score++;
    });

    const mpReward = score * 5; 
    const expReward = score * 10;

    alert(`⚔️ สู้บอสเสร็จสิ้น!\nเป้าหมายถูกทำลาย: ${score}/${questions.length} ข้อ\nได้รับ: ${mpReward} MP | ${expReward} EXP!`);
    
    // อัปเดตรางวัลเข้าตัวนักเรียน
    const newMana = userData.mana + mpReward;
    db.collection("students").doc(userData.studentId).update({
        mana: newMana
    }).then(() => {
        addExp(userData.studentId, expReward);
        showPage('quests');
    });
}

// --- ANTI CHEAT SYSTEM ---
document.addEventListener("visibilitychange", () => {
    if (document.hidden && window.isDoingQuiz && userData && userData.studentId !== TEACHER_ID) {
        db.collection("anti_cheat_alerts").add({
            studentName: userData.name,
            studentId: userData.studentId,
            action: "แอบสลับจอตอนสู้บอส",
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: "unread"
        });
        alert("🚨 [SYSTEM ALERT] 🚨\nตรวจพบการละสายตาจากสนามรบ!\nระบบได้รายงานพฤติกรรมนี้ไปยังครูเบียร์เรียบร้อยแล้ว!");
    }
});
