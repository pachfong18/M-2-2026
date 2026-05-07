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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let userData = null;
let quizData = {};
// เพิ่มสถานะการเปิดปิด Boss
let questStatus = { unit1: false, unit2: false, unit3: false, boss_unit1: false, boss_unit2: false, boss_unit3: false };
let caseStatus = { w1:false, w2:false, w3:false, w4:false, isRevealed:false, ansWho:"นาย A", ansWhere:"ห้องเซิร์ฟเวอร์", ansWhat:"แฟลชไดรฟ์" };
window.murdleState = {}; 
const TEACHER_ID = "pchrkr007";

function toggleAuth(type) {
    document.getElementById('login-section').classList.toggle('hidden', type === 'reg');
    document.getElementById('reg-section').classList.toggle('hidden', type === 'login');
}

function login() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(user + "@srisuvit.com", pass).catch(e => alert("รหัสผ่านไม่ถูกต้อง!"));
}

function register() {
    const name = document.getElementById('regName').value.trim();
    const id = document.getElementById('regId').value.trim();
    const pass = document.getElementById('regPass').value;
    if(pass.length < 6) return alert("รหัสผ่านต้องมีอย่างน้อย 6 ตัว");
    auth.createUserWithEmailAndPassword(id + "@srisuvit.com", pass).then(res => {
        // เพิ่ม completedBosses เป็น Array ว่างสำหรับเด็กใหม่
        db.collection("students").doc(id).set({ 
            name: name, studentId: id, level: 1, exp: 0, mana: 0, rank: "Novice", 
            caseAnswer: {who:"",where:"",what:""},
            completedBosses: [] 
        });
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
        db.collection("settings").doc("quest_board").onSnapshot(doc => { questStatus = doc.data() || questStatus; });
        db.collection("settings").doc("monthly_case").onSnapshot(doc => { caseStatus = doc.data() || caseStatus; });
    }
});

function logout() { auth.signOut().then(() => window.location.reload()); }

function addExp(studentId, amount) {
    let newExp = (userData.exp || 0) + amount;
    let newLevel = userData.level;
    let newMana = userData.mana;

    if (newExp >= 100) {
        newLevel++; newExp -= 100; newMana += 30;
        alert("🎉 LEVEL UP! ได้รับโบนัส 30 MP!");
    }
    db.collection("students").doc(studentId).update({ exp: newExp, level: newLevel, mana: newMana });
}

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
                <p style="font-size:20px;">ยินดีต้อนรับนักรบไซเบอร์ ${userData.name}</p>
                <p>เป้าหมาย: สะสม EXP จาก Quest Board และเข้าร่วมไขคดีสืบสวน!</p>
            </div>`;
    }

    else if (id === 'quests') {
        display.innerHTML = `
            <h2 class="pixel-font aqua-glow">>>> Quest Board</h2>
            <p style="color:var(--text-grey);">ปลดล็อคภารกิจและส่งงานเพื่อรับรางวัล (ต้องรอครูเบียร์เปิดระบบ)</p>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-top:20px;">
                ${renderQuestCard(1, "แนวคิดเชิงคำนวณ", questStatus.unit1)}
                ${renderQuestCard(2, "การออกแบบอัลกอริทึม", questStatus.unit2)}
                ${renderQuestCard(3, "การเขียนโปรแกรม Python", questStatus.unit3)}
            </div>`;
    }

    else if (id === 'detective') {
        window.isDoingQuiz = true;
        const hasAns = userData.caseAnswer && userData.caseAnswer.who;
        
        let resultUI = "";
        if(caseStatus.isRevealed) {
            const isCorrect = (userData.caseAnswer.who === caseStatus.ansWho && userData.caseAnswer.where === caseStatus.ansWhere && userData.caseAnswer.what === caseStatus.ansWhat);
            resultUI = `
                <div style="background:${isCorrect ? 'rgba(0,255,255,0.2)' : 'rgba(255,51,102,0.2)'}; border:2px solid ${isCorrect ? 'var(--aqua)' : 'var(--alert-red)'}; padding:20px; border-radius:10px; margin-bottom:20px; text-align:center;">
                    <h3 class="pixel-font">${isCorrect ? 'MISSION CLEARED! 🎉' : 'MISSION FAILED! 😭'}</h3>
                    <p>ความจริงคือ: ${caseStatus.ansWho} ก่อเหตุที่ ${caseStatus.ansWhere} โดยใช้ ${caseStatus.ansWhat}</p>
                    <p style="color:#aaa;">คำตอบของคุณ: ${userData.caseAnswer.who} / ${userData.caseAnswer.where} / ${userData.caseAnswer.what}</p>
                </div>`;
        }

        display.innerHTML = `
            <h2 class="pixel-font" style="color:var(--detective-purple); text-shadow:0 0 10px var(--detective-purple);">>>> Case File #001</h2>
            
            <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:10px; border-left:5px solid var(--detective-purple); margin-bottom:20px;">
                <h3 class="pixel-font" style="font-size:12px; margin-top:0;">📝 ปริศนาขโมยซอร์สโค้ด</h3>
                <p style="font-size:14px; color:#ddd;">เมื่อคืนเกิดเหตุคนร้ายขโมยซอร์สโค้ดระบบตัดเกรดของโรงเรียน! ผู้ต้องสงสัยมี 3 คน พวกเขาอยู่ในสถานที่ต่างกัน และใช้อุปกรณ์ไอทีต่างกัน นักสืบต้องหาว่า <strong>ใคร</strong> ก่อเหตุที่ <strong>ไหน</strong> และใช้ <strong>อะไร</strong> ขโมยข้อมูลไป!</p>
            </div>

            ${resultUI}

            <h3 class="pixel-font" style="font-size:10px; color:var(--aqua);">[ ตารางตัดช้อยส์ Murdle Grid ]</h3>
            <div style="overflow-x:auto;">
                <table class="murdle-grid">
                    <tr><th class="empty-cell"></th><th colspan="3" class="header-group">สถานที่เกิดเหตุ (WHERE)</th><th colspan="3" class="header-group">อุปกรณ์ที่ใช้ (WHAT)</th></tr>
                    <tr><th style="background:#111;"></th><th>เซิร์ฟเวอร์</th><th>ห้องครู</th><th>สวน</th><th>แฟลชไดรฟ์</th><th>แล็ปท็อป</th><th>มือถือ</th></tr>
                    <tr><th style="background:rgba(0,255,255,0.1);">นาย A</th>${getCell(0,0)} ${getCell(0,1)} ${getCell(0,2)} ${getCell(0,3)} ${getCell(0,4)} ${getCell(0,5)}</tr>
                    <tr><th style="background:rgba(0,255,255,0.1);">นางสาว B</th>${getCell(1,0)} ${getCell(1,1)} ${getCell(1,2)} ${getCell(1,3)} ${getCell(1,4)} ${getCell(1,5)}</tr>
                    <tr><th style="background:rgba(0,255,255,0.1);">เด็กชาย C</th>${getCell(2,0)} ${getCell(2,1)} ${getCell(2,2)} ${getCell(2,3)} ${getCell(2,4)} ${getCell(2,5)}</tr>
                    <tr><td colspan="7" class="empty-cell" style="height:10px;"></td></tr>
                    <tr><th style="background:rgba(0,255,255,0.1);">แฟลชไดรฟ์</th>${getCell(3,0)} ${getCell(3,1)} ${getCell(3,2)}<td colspan="3" rowspan="3" class="empty-cell"></td></tr>
                    <tr><th style="background:rgba(0,255,255,0.1);">แล็ปท็อป</th>${getCell(4,0)} ${getCell(4,1)} ${getCell(4,2)}</tr>
                    <tr><th style="background:rgba(0,255,255,0.1);">มือถือ</th>${getCell(5,0)} ${getCell(5,1)} ${getCell(5,2)}</tr>
                </table>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-top:20px;">
                <div style="background:rgba(0,0,0,0.4); padding:20px; border-radius:10px; border:1px solid #444;">
                    <h3 class="pixel-font" style="font-size:10px; color:var(--accent-gold);">[ เบาะแสที่พบ ]</h3>
                    <p style="font-size:12px; color:${caseStatus.w1 ? '#fff' : '#555'};">${caseStatus.w1 ? 'W1: พบรอยเท้าตรงสวน แต่ไม่พบหลักฐานไอที' : '🔒 ล็อค'}</p>
                    <p style="font-size:12px; color:${caseStatus.w2 ? '#fff' : '#555'};">${caseStatus.w2 ? 'W2: นาย A อ้างว่าอยู่ในห้องพักครูตลอด' : '🔒 ล็อค'}</p>
                    <p style="font-size:12px; color:${caseStatus.w3 ? '#fff' : '#555'};">${caseStatus.w3 ? 'W3: คนขโมยในห้องเซิร์ฟเวอร์ ใช้แล็ปท็อป' : '🔒 ล็อค'}</p>
                    <p style="font-size:12px; color:${caseStatus.w4 ? '#fff' : '#555'};">${caseStatus.w4 ? 'W4: เด็กชาย C ไม่เคยใช้แฟลชไดรฟ์และเกลียดสวน' : '🔒 ล็อค'}</p>
                </div>
                
                <div style="background:rgba(0,0,0,0.4); padding:20px; border-radius:10px; border:1px solid var(--aqua);">
                    <h3 class="pixel-font" style="font-size:10px; color:var(--aqua);">[ พิพากษาคดี ]</h3>
                    <p style="font-size:10px; color:#aaa;">ส่งคำตอบล่าสุด: ${hasAns ? userData.caseAnswer.who + " / " + userData.caseAnswer.where + " / " + userData.caseAnswer.what : "ยังไม่ส่ง"}</p>
                    <select id="ansWho"><option value="">-- ใคร? --</option><option value="นาย A">นาย A</option><option value="นางสาว B">นางสาว B</option><option value="เด็กชาย C">เด็กชาย C</option></select>
                    <select id="ansWhere"><option value="">-- ที่ไหน? --</option><option value="ห้องเซิร์ฟเวอร์">ห้องเซิร์ฟเวอร์</option><option value="ห้องพักครู">ห้องพักครู</option><option value="สวน">สวน</option></select>
                    <select id="ansWhat"><option value="">-- ใช้อะไร? --</option><option value="แฟลชไดรฟ์">แฟลชไดรฟ์</option><option value="แล็ปท็อป">แล็ปท็อป</option><option value="มือถือ">มือถือ</option></select>
                    <button class="btn-p pixel-font" style="width:100%; font-size:10px; padding:12px;" onclick="saveCaseAnswer()" ${caseStatus.isRevealed ? 'disabled style="opacity:0.5;"' : ''}>${caseStatus.isRevealed ? 'ปิดรับคำตอบแล้ว' : 'ส่งคำพิพากษา'}</button>
                </div>
            </div>`;
    }

    else if (id === 'status') {
        const intStat = Math.floor(userData.level * 1.5) + 10;
        const agiStat = Math.floor(userData.level * 1.2) + 8;
        const lukStat = Math.floor(userData.level * 2.0) + 5;
        
        display.innerHTML = `
            <h2 class="pixel-font aqua-glow">>>> Character Profile</h2>
            <div style="display:flex; gap:30px; margin-top:20px;">
                <div style="flex:1; background:rgba(255,255,255,0.05); padding:30px; border-radius:20px; border:1px solid var(--glass-border); text-align:center;">
                    <div style="width:100px; height:100px; background:var(--aqua); border-radius:50%; margin:0 auto 20px auto; display:flex; align-items:center; justify-content:center; font-size:40px; color:#000;">
                        <i class="fa-solid fa-user-astronaut"></i>
                    </div>
                    <h3 style="margin:0; font-size:22px;">${userData.name}</h3>
                    <p class="pixel-font" style="color:var(--aqua); font-size:12px; margin-top:10px;">${userData.rank}</p>
                    <p style="color:#aaa; font-size:14px;">ID: ${userData.studentId}</p>
                </div>
                
                <div style="flex:2;">
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px; margin-bottom:20px;">
                        <div class="stats-box">INT (ปัญญา)<span class="stats-val">${intStat}</span></div>
                        <div class="stats-box">AGI (ความไว)<span class="stats-val">${agiStat}</span></div>
                        <div class="stats-box">LUK (โชค)<span class="stats-val">${lukStat}</span></div>
                    </div>
                    <div style="background:rgba(0,0,0,0.3); padding:20px; border-radius:12px; border:1px solid #444;">
                        <p style="margin:0 0 10px 0; font-weight:bold;">Progress to Next Level</p>
                        <div class="bar-outer"><div class="bar-fill" style="width:${userData.exp}%; background:var(--aqua); box-shadow:0 0 10px var(--aqua);"></div></div>
                        <p style="text-align:right; margin:5px 0 0 0; font-size:12px;">${userData.exp} / 100 EXP</p>
                    </div>
                </div>
            </div>`;
    }

    else if (id === 'teacher') {
        display.innerHTML = `
            <h2 class="pixel-font" style="color:#ffcc00; text-shadow:0 0 10px #ffcc00;">>>> Kru Beer Admin Panel</h2>
            <div style="display:flex; flex-wrap:wrap; gap:10px; margin:20px 0;">
                <button class="btn-p pixel-font" style="background:#ffcc00; color:#000; font-size:9px;" onclick="viewTeacher('students')">นักเรียน</button>
                <button class="btn-p pixel-font" style="background:var(--aqua); color:#000; font-size:9px;" onclick="viewTeacher('quizzes')">ข้อสอบ</button>
                <button class="btn-p pixel-font" style="background:var(--detective-purple); color:#fff; font-size:9px;" onclick="viewTeacher('detective')">สืบสวน</button>
                <button class="btn-p pixel-font" style="background:var(--alert-red); color:#fff; font-size:9px; border-color:var(--alert-red);" onclick="viewTeacher('quests')">ระบบเนื้อหาและบอส</button>
            </div>
            <div id="teacher-view"></div>`;
        viewTeacher('students');
    }
}

// --- QUEST BOARD HELPER ---
function renderQuestCard(unitNum, title, isUnlocked) {
    if(!isUnlocked) {
        return `<div class="content-card" style="min-height:auto; padding:30px; opacity:0.5; border-color:#555;">
            <div style="font-size:30px; text-align:right; color:#555;"><i class="fa-solid fa-lock"></i></div>
            <h3 class="pixel-font" style="font-size:12px; color:#888;">Unit ${unitNum}: ${title}</h3>
            <p style="font-size:12px; color:#888;">ยังไม่ถึงเวลาเปิดภารกิจ</p>
        </div>`;
    }
    return `<div class="content-card" style="min-height:auto; padding:30px; border-color:var(--aqua);">
        <h3 class="pixel-font" style="font-size:12px; color:var(--aqua);">Unit ${unitNum}: ${title}</h3>
        <p style="font-size:12px; color:#ddd;">ส่งงาน 2 ชิ้น และเตรียมตัวสู้บอส</p>
        <button class="btn-p pixel-font" style="width:100%; margin-top:10px; font-size:10px;" onclick="openQuestDetail('unit${unitNum}')">ENTER QUEST</button>
    </div>`;
}

function openQuestDetail(u) {
    const isBossCompleted = userData.completedBosses && userData.completedBosses.includes(u);
    const isBossOpen = questStatus['boss_' + u];

    let bossSectionHTML = "";

    // ระบบจัดการด่าน Boss Fight (ปิด/เปิด และ ห้ามทำซ้ำ)
    if (isBossCompleted) {
        window.isDoingQuiz = false;
        bossSectionHTML = `
            <div style="background:rgba(0,255,65,0.1); border:2px solid #00ff41; padding:20px; border-radius:10px; text-align:center; box-shadow:0 0 15px rgba(0,255,65,0.2);">
                <h3 class="pixel-font" style="color:#00ff41; margin-top:0;">🎉 BOSS CLEARED!</h3>
                <p style="color:#ddd; margin-bottom:0;">คุณได้กำจัดบอสประจำหน่วยนี้ไปแล้ว (ภารกิจสำเร็จ ไม่สามารถโจมตีซ้ำได้)</p>
            </div>`;
    } else if (!isBossOpen) {
        window.isDoingQuiz = false;
        bossSectionHTML = `
            <div style="background:rgba(255,255,255,0.05); border:2px dashed #666; padding:20px; border-radius:10px; text-align:center;">
                <h3 class="pixel-font" style="color:#aaa; margin-top:0;"><i class="fa-solid fa-lock"></i> BOSS LOCKED</h3>
                <p style="color:#888; margin-bottom:0;">ครูเบียร์ยังไม่เปิดให้เข้าสู้บอสในขณะนี้ เตรียมตัวให้พร้อม!</p>
            </div>`;
    } else {
        window.isDoingQuiz = true; // เปิด Anti-cheat
        bossSectionHTML = `
            <div style="background:rgba(255,51,102,0.1); border:1px solid var(--alert-red); padding:20px; border-radius:10px;">
                <h3 class="pixel-font" style="font-size:12px; color:var(--alert-red);">>>> BOSS FIGHT</h3>
                <p style="font-size:12px; color:#ccc;">ตอบให้ถูกมากที่สุดเพื่อรับโบนัส MP! (คำเตือน: ห้ามพับจอ!)</p>
                <div id="quiz-container_${u}"></div>
            </div>`;
    }

    let html = `
        <button class="btn-p pixel-font" style="background:transparent; color:#fff; border-color:#fff; padding:10px; font-size:10px; margin-bottom:20px;" onclick="showPage('quests', document.querySelectorAll('.nav-btn')[1])"><< BACK</button>
        <h2 class="pixel-font aqua-glow">>>> ${u.toUpperCase()} MISSIONS</h2>
        
        <div style="background:rgba(0,255,255,0.05); border:1px solid var(--aqua); padding:20px; border-radius:10px; margin-bottom:20px;">
            <h3 class="pixel-font" style="font-size:10px; color:var(--aqua);">[MISSION 1] อัปโหลดงานชิ้นที่ 1</h3>
            <input type="file" id="file_${u}_m1" style="background:#000;">
            <button class="btn-p pixel-font" style="font-size:9px; padding:10px;" onclick="uploadDrive('file_${u}_m1', '${u}_M1')">UPLOAD TO DRIVE</button>
        </div>

        <div style="background:rgba(0,255,255,0.05); border:1px solid var(--aqua); padding:20px; border-radius:10px; margin-bottom:20px;">
            <h3 class="pixel-font" style="font-size:10px; color:var(--aqua);">[MISSION 2] อัปโหลดงานชิ้นที่ 2</h3>
            <input type="file" id="file_${u}_m2" style="background:#000;">
            <button class="btn-p pixel-font" style="font-size:9px; padding:10px;" onclick="uploadDrive('file_${u}_m2', '${u}_M2')">UPLOAD TO DRIVE</button>
        </div>

        ${bossSectionHTML}
    `;
    
    document.getElementById('game-content').innerHTML = html;
    
    // ถ้าบอสเปิดอยู่ และยังไม่เคลียร์ ให้เรนเดอร์คำถาม
    if (!isBossCompleted && isBossOpen) {
        renderBossQuestions(u);
    }
}

function uploadDrive(inputId, taskName) {
    const file = document.getElementById(inputId).files[0];
    if(!file) return alert("เลือกไฟล์ก่อนครับ!");
    alert(`กำลังอัปโหลด ${taskName} ไปยัง Google Drive...\n(รอเชื่อมต่อ GAS_URL)`);
}

function renderBossQuestions(u) {
    const container = document.getElementById(`quiz-container_${u}`);
    const qs = quizData[u] || [];
    if(!qs.length) return container.innerHTML = "<p style='color:#aaa;'>ครูเบียร์ยังไม่ได้ลงข้อสอบครับ รออัปเดต...</p>";
    
    let qHTML = "";
    qs.forEach((q, i) => {
        qHTML += `<div style="background:#111; padding:15px; margin:15px 0; border-left:4px solid var(--alert-red); border-radius:5px;">
            <p style="margin-top:0;"><strong>ข้อ ${i+1}:</strong> ${q.q}</p>
            <label style="display:block; margin:5px 0; cursor:pointer;"><input type="radio" name="q_${u}_${i}" value="A"> ก. ${q.a}</label>
            <label style="display:block; margin:5px 0; cursor:pointer;"><input type="radio" name="q_${u}_${i}" value="B"> ข. ${q.b}</label>
            <label style="display:block; margin:5px 0; cursor:pointer;"><input type="radio" name="q_${u}_${i}" value="C"> ค. ${q.c}</label>
            <label style="display:block; margin:5px 0; cursor:pointer;"><input type="radio" name="q_${u}_${i}" value="D"> ง. ${q.d}</label>
        </div>`;
    });
    qHTML += `<button class="btn-p btn-danger pixel-font" style="width:100%; margin-top:10px;" onclick="submitBoss('${u}')">SUBMIT ATTACK</button>`;
    container.innerHTML = qHTML;
}

function submitBoss(u) {
    if(!confirm("ส่งคำตอบแล้วไม่สามารถแก้ไขหรือทำซ้ำได้ ยืนยันโจมตี?")) return;
    window.isDoingQuiz = false;
    
    const qs = quizData[u] || [];
    let score = 0;
    qs.forEach((q, i) => {
        const sel = document.querySelector(`input[name="q_${u}_${i}"]:checked`);
        if(sel && sel.value === q.key) score++;
    });
    
    const mpGain = score * 5;
    alert(`การต่อสู้จบลง! ตอบถูก ${score}/${qs.length} ข้อ ได้รับ ${mpGain} MP`);
    
    // บันทึกว่าผ่านด่านบอสแล้ว (ป้องกันการทำซ้ำ)
    let completedArr = userData.completedBosses || [];
    if (!completedArr.includes(u)) completedArr.push(u);

    db.collection("students").doc(userData.studentId).update({ 
        mana: userData.mana + mpGain,
        completedBosses: completedArr
    }).then(() => {
        showPage('quests', document.querySelectorAll('.nav-btn')[1]);
    });
}

// --- MURDLE HELPER ---
function getCell(r, c) {
    let val = window.murdleState[`r${r}c${c}`] || "";
    let cls = val === 'O' ? 'yes' : (val === 'X' ? 'no' : '');
    return `<td id="cell_${r}_${c}" class="clickable ${cls}" onclick="clickGrid(${r},${c})">${val}</td>`;
}
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
    const where = document.getElementById('ansWhere').value;
    const what = document.getElementById('ansWhat').value;
    if(!who || !where || !what) return alert("ข้อมูลไม่ครบ!");
    db.collection("students").doc(userData.studentId).update({ caseAnswer: {who:who, where:where, what:what} }).then(() => alert("บันทึกสำเร็จ!"));
}

// --- TEACHER VIEWS ---
function viewTeacher(v) {
    const box = document.getElementById('teacher-view');
    box.innerHTML = "Loading...";

    if(v === 'students') {
        db.collection("students").get().then(snap => {
            let html = `<table class="admin-table"><tr><th>รหัส</th><th>ชื่อ</th><th>LV</th><th>MP</th><th>EXP</th><th>Action</th></tr>`;
            snap.forEach(doc => {
                const s = doc.data();
                html += `<tr><td>${s.studentId}</td><td>${s.name}</td><td>${s.level}</td><td>${s.mana}</td><td>${s.exp}</td><td><button class="btn-p" style="padding:8px 15px; font-size:10px;" onclick="addExp('${s.studentId}', 50)">+50 EXP</button></td></tr>`;
            });
            box.innerHTML = html + "</table>";
        });
    } 
    else if(v === 'quizzes') {
        box.innerHTML = `
            <div style="background:rgba(0,0,0,0.5); padding:20px; border-radius:10px;">
                <h3 class="pixel-font" style="font-size:12px; color:var(--aqua);">จัดการข้อสอบ Boss Fight</h3>
                <select onchange="loadEditor(this.value)"><option value="">-- เลือก Unit --</option><option value="unit1">Unit 1</option><option value="unit2">Unit 2</option><option value="unit3">Unit 3</option></select>
                <div id="editor-area"></div>
            </div>`;
    }
    else if(v === 'detective') {
        box.innerHTML = `
            <div style="background:rgba(179,102,255,0.1); border:1px solid var(--detective-purple); padding:20px; border-radius:10px;">
                <h3 class="pixel-font" style="font-size:12px; color:var(--detective-purple);">ควบคุมแฟ้มคดีสืบสวน</h3>
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <button class="btn-p" style="font-size:9px; background:${caseStatus.w1?'#fff':'#444'}; color:#000;" onclick="toggleSetting('monthly_case', 'w1')">Week 1 Clue</button>
                    <button class="btn-p" style="font-size:9px; background:${caseStatus.w2?'#fff':'#444'}; color:#000;" onclick="toggleSetting('monthly_case', 'w2')">Week 2 Clue</button>
                    <button class="btn-p" style="font-size:9px; background:${caseStatus.w3?'#fff':'#444'}; color:#000;" onclick="toggleSetting('monthly_case', 'w3')">Week 3 Clue</button>
                    <button class="btn-p" style="font-size:9px; background:${caseStatus.w4?'#fff':'#444'}; color:#000;" onclick="toggleSetting('monthly_case', 'w4')">Week 4 Clue</button>
                </div>
                <hr style="border-color:#444;">
                <button class="btn-p" style="width:100%; background:${caseStatus.isRevealed?'var(--alert-red)':'var(--detective-purple)'};" onclick="toggleSetting('monthly_case', 'isRevealed')">${caseStatus.isRevealed ? 'ปิดการเฉลย' : '📢 กดปุ่มเฉลยให้เด็กเห็น'}</button>
            </div>`;
    }
    else if(v === 'quests') {
        // ส่วนควบคุมแยกกันระหว่าง การส่งงาน (Quest) และ ข้อสอบ (Boss Fight)
        box.innerHTML = `
            <div style="background:rgba(0,255,255,0.1); border:1px solid var(--aqua); padding:20px; border-radius:10px; margin-bottom:20px;">
                <h3 class="pixel-font" style="font-size:12px; color:var(--aqua);">เปิด/ปิด ระบบให้เข้าส่งงาน (Quest Board)</h3>
                <div style="display:flex; gap:10px;">
                    <button class="btn-p" style="flex:1; background:${questStatus.unit1?'var(--aqua)':'#444'}; color:${questStatus.unit1?'#000':'#fff'};" onclick="toggleSetting('quest_board', 'unit1')">Unit 1</button>
                    <button class="btn-p" style="flex:1; background:${questStatus.unit2?'var(--aqua)':'#444'}; color:${questStatus.unit2?'#000':'#fff'};" onclick="toggleSetting('quest_board', 'unit2')">Unit 2</button>
                    <button class="btn-p" style="flex:1; background:${questStatus.unit3?'var(--aqua)':'#444'}; color:${questStatus.unit3?'#000':'#fff'};" onclick="toggleSetting('quest_board', 'unit3')">Unit 3</button>
                </div>
            </div>
            
            <div style="background:rgba(255,51,102,0.1); border:1px solid var(--alert-red); padding:20px; border-radius:10px;">
                <h3 class="pixel-font" style="font-size:12px; color:var(--alert-red);">เปิด/ปิด ระบบให้ทำข้อสอบ (Boss Fight)</h3>
                <p style="font-size:12px; color:#ccc;">ใช้สำหรับให้เด็กส่งงานไปก่อน แล้วค่อยเปิดให้ทำข้อสอบพร้อมกัน</p>
                <div style="display:flex; gap:10px;">
                    <button class="btn-p" style="flex:1; border-color:var(--alert-red); background:${questStatus.boss_unit1?'var(--alert-red)':'#444'}; color:${questStatus.boss_unit1?'#fff':'#aaa'};" onclick="toggleSetting('quest_board', 'boss_unit1')">Boss 1</button>
                    <button class="btn-p" style="flex:1; border-color:var(--alert-red); background:${questStatus.boss_unit2?'var(--alert-red)':'#444'}; color:${questStatus.boss_unit2?'#fff':'#aaa'};" onclick="toggleSetting('quest_board', 'boss_unit2')">Boss 2</button>
                    <button class="btn-p" style="flex:1; border-color:var(--alert-red); background:${questStatus.boss_unit3?'var(--alert-red)':'#444'}; color:${questStatus.boss_unit3?'#fff':'#aaa'};" onclick="toggleSetting('quest_board', 'boss_unit3')">Boss 3</button>
                </div>
            </div>`;
    }
}

function toggleSetting(col, key) {
    let target = col === 'quest_board' ? questStatus : caseStatus;
    db.collection("settings").doc(col).update({ [key]: !target[key] }).then(() => viewTeacher(col==='quest_board'?'quests':'detective'));
}

// QUIZ EDITOR
function loadEditor(u) {
    const area = document.getElementById('editor-area');
    if(!u) return area.innerHTML = "";
    const qs = quizData[u] || [];
    let html = ``;
    qs.forEach((q, i) => {
        html += `<div style="border:1px solid #555; padding:15px; margin:15px 0; border-radius:8px; background:rgba(255,255,255,0.02);">
            <strong style="color:var(--accent-gold);">ข้อ ${i+1}</strong>
            <input type="text" value="${q.q}" placeholder="โจทย์" onchange="updateQ('${u}',${i},'q',this.value)">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <input type="text" value="${q.a}" placeholder="A" onchange="updateQ('${u}',${i},'a',this.value)">
                <input type="text" value="${q.b}" placeholder="B" onchange="updateQ('${u}',${i},'b',this.value)">
                <input type="text" value="${q.c}" placeholder="C" onchange="updateQ('${u}',${i},'c',this.value)">
                <input type="text" value="${q.d}" placeholder="D" onchange="updateQ('${u}',${i},'d',this.value)">
            </div>
            เฉลย: <select style="width:100px; padding:10px;" onchange="updateQ('${u}',${i},'key',this.value)">
                <option value="A" ${q.key==='A'?'selected':''}>A</option><option value="B" ${q.key==='B'?'selected':''}>B</option>
                <option value="C" ${q.key==='C'?'selected':''}>C</option><option value="D" ${q.key==='D'?'selected':''}>D</option>
            </select>
            <button class="btn-p btn-danger" style="padding:10px; font-size:10px; margin-left:10px;" onclick="quizData['${u}'].splice(${i},1); loadEditor('${u}');">ลบข้อนี้</button>
        </div>`;
    });
    html += `<div style="display:flex; gap:10px; margin-top:20px;">
        <button class="btn-p" style="font-size:10px; background:transparent; border:2px solid var(--aqua); color:var(--aqua);" onclick="addQ('${u}')">+ เพิ่มข้อใหม่</button>
        <button class="btn-p" style="font-size:10px;" onclick="db.collection('settings').doc('quizzes').set(quizData).then(()=>alert('บันทึกข้อสอบสำเร็จ!'))">💾 บันทึกลงระบบ</button>
    </div>`;
    area.innerHTML = html;
}
function updateQ(u, i, f, v) { quizData[u][i][f] = v; }
function addQ(u) { if(!quizData[u]) quizData[u]=[]; quizData[u].push({q:'',a:'',b:'',c:'',d:'',key:'A'}); loadEditor(u); }

// ANTI CHEAT
document.addEventListener("visibilitychange", () => {
    if (document.hidden && window.isDoingQuiz && userData && userData.studentId !== TEACHER_ID) {
        db.collection("anti_cheat_alerts").add({ studentName: userData.name, action: "สลับจอ", timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        alert("🚨 [SYSTEM ALERT] ครูเบียร์เห็นนะ! ตรวจพบการพับหน้าจอระหว่างทำภารกิจ!");
    }
});
