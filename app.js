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
let questStatus = { unit1: false, unit2: false, unit3: false, boss_unit1: false, boss_unit2: false, boss_unit3: false };
let lessonsData = { unit1: [], unit2: [], unit3: [] };

const CASES_DB = [
    { title: "คดีที่ 1: ปริศนาขโมยซอร์สโค้ด", story: "เมื่อคืนเกิดเหตุคนร้ายขโมยซอร์สโค้ดระบบตัดเกรดของโรงเรียน!", suspects: ["นาย A", "นางสาว B", "เด็กชาย C", "นาง D"], locations: ["ห้องเซิร์ฟเวอร์", "ห้องพักครู", "สวน", "โรงอาหาร"], weapons: ["แฟลชไดรฟ์", "แล็ปท็อป", "มือถือ", "แท็บเล็ต"], clues: ["1. 'นาย A' ถูกพบเห็นว่านั่งเล่น 'มือถือ' อยู่ตลอดเวลา", "2. 'เด็กชาย C' หิวมาก จึงเดินไปที่ 'โรงอาหาร'", "3. มีคนลืม 'แท็บเล็ต' ทิ้งไว้ที่ 'โรงอาหาร'", "4. 'นาง D' นั่งตรวจงานอยู่ที่ 'ห้องพักครู' ตลอดเวลา", "5. คนที่อยู่ 'ห้องพักครู' ใช้ 'แล็ปท็อป' ทำงาน", "6. ผู้ที่ขโมยข้อมูลใช้ 'แฟลชไดรฟ์'", "7. 'นางสาว B' ไม่มี 'มือถือ' และไม่ได้ใช้ 'แท็บเล็ต'", "8. 'นาย A' ไม่เคยเดินไปที่ 'ห้องพักครู' หรือ 'โรงอาหาร'", "9. คนที่อยู่ 'สวน' ไม่ได้ใช้ 'แล็ปท็อป' และ 'แท็บเล็ต'", "10. รปภ. ยืนยันว่า 'นางสาว B' เป็นคนเดียวที่มีกุญแจเข้า 'ห้องเซิร์ฟเวอร์'"], ansWho: "นางสาว B", ansWhere: "ห้องเซิร์ฟเวอร์", ansWhat: "แฟลชไดรฟ์" },
    { title: "คดีที่ 2: แฮกเกอร์ป่วนเว็บโรงเรียน", story: "หน้าเว็บโรงเรียนถูกมือดีแฮกเปลี่ยนรูปภาพ!", suspects: ["ประธานนักเรียน", "หัวหน้าห้อง", "ภารโรง", "ครูฝึกสอน"], locations: ["ห้องสมุด", "ห้องคอมฯ 1", "ดาดฟ้า", "สนามบาส"], weapons: ["สมาร์ทวอทช์", "มินิพีซี", "แว่นตาอัจฉริยะ", "โน้ตบุ๊ก"], clues: ["1. คำใบ้ 1","2. คำใบ้ 2","3. คำใบ้ 3","4. คำใบ้ 4","5. คำใบ้ 5","6. คำใบ้ 6","7. คำใบ้ 7","8. คำใบ้ 8","9. คำใบ้ 9","10. คำใบ้ 10"], ansWho: "หัวหน้าห้อง", ansWhere: "ห้องคอมฯ 1", ansWhat: "มินิพีซี" },
    { title: "คดีที่ 3: ไวรัสลบการบ้าน", story: "การบ้านวิทยาการคำนวณของเด็ก ม.2 ถูกไวรัสลบเกลี้ยง!", suspects: ["สมชาย", "สมหญิง", "สมศักดิ์", "สมปอง"], locations: ["โต๊ะหินอ่อน", "ใต้บันได", "ห้องพยาบาล", "ห้องดนตรี"], weapons: ["ทรัมบ์ไดรฟ์", "อีเมลสแปม", "โดรน", "บลูทูธ"], clues: ["1. คำใบ้ 1","2. คำใบ้ 2","3. คำใบ้ 3","4. คำใบ้ 4","5. คำใบ้ 5","6. คำใบ้ 6","7. คำใบ้ 7","8. คำใบ้ 8","9. คำใบ้ 9","10. คำใบ้ 10"], ansWho: "สมปอง", ansWhere: "โต๊ะหินอ่อน", ansWhat: "ทรัมบ์ไดรฟ์" },
    { title: "คดีที่ 4: รหัสผ่าน Wi-Fi รั่วไหล", story: "รหัส Wi-Fi ลับของโรงเรียนถูกนำไปโพสต์ลงเน็ต!", suspects: ["ยามหน้าประตู", "แม่ค้า", "นร.แลกเปลี่ยน", "ดีเจ"], locations: ["ห้องปกครอง", "ห้องกระจายเสียง", "ซุ้มไม้เลื้อย", "โรงยิม"], weapons: ["เราเตอร์พกพา", "มือถือพับได้", "สาย LAN", "เครื่องดักสัญญาณ"], clues: ["1. คำใบ้ 1","2. คำใบ้ 2","3. คำใบ้ 3","4. คำใบ้ 4","5. คำใบ้ 5","6. คำใบ้ 6","7. คำใบ้ 7","8. คำใบ้ 8","9. คำใบ้ 9","10. คำใบ้ 10"], ansWho: "ดีเจ", ansWhere: "ห้องกระจายเสียง", ansWhat: "เครื่องดักสัญญาณ" },
    { title: "คดีที่ 5: รูปหลุดงานกีฬาสี", story: "มีคนแอบถ่ายรูปหลุดของสตาฟ! ใครแอบถ่ายจากมุมไหน?", suspects: ["ตากล้อง", "เชียร์ลีดเดอร์", "นักฟุตบอล", "สภานักเรียน"], locations: ["อัฒจันทร์", "ห้องเก็บของ", "หลังเวที", "สระว่ายน้ำ"], weapons: ["กล้อง DSLR", "โดรนจิ๋ว", "กล้องจิ๋ว", "มือถือซูม"], clues: ["1. คำใบ้ 1","2. คำใบ้ 2","3. คำใบ้ 3","4. คำใบ้ 4","5. คำใบ้ 5","6. คำใบ้ 6","7. คำใบ้ 7","8. คำใบ้ 8","9. คำใบ้ 9","10. คำใบ้ 10"], ansWho: "ตากล้อง", ansWhere: "หลังเวที", ansWhat: "โดรนจิ๋ว" }
];

let caseStatus = { activeCaseId: 0, cluesToggle: [false,false,false,false,false,false,false,false,false,false], isRevealed: false };
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
        db.collection("students").doc(id).set({ 
            name: name, studentId: id, number: "", room: "ม.2/", 
            level: 1, exp: 0, mana: 0, rank: "Novice", 
            caseAnswer: {who:"",where:"",what:""}, completedBosses: [],
            scores: {s1:0, s2:0, s3:0, mid:0, s4:0, s5:0, s6:0, final:0}
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
        db.collection("settings").doc("lessons").onSnapshot(doc => { lessonsData = doc.data() || { unit1:[], unit2:[], unit3:[] }; });
        
        db.collection("settings").doc("monthly_case").onSnapshot(doc => { 
            let data = doc.data();
            if(data) {
                if(data.activeCaseId === undefined) data.activeCaseId = 0;
                if(!data.cluesToggle) data.cluesToggle = [false,false,false,false,false,false,false,false,false,false];
                caseStatus = data;
            } else db.collection("settings").doc("monthly_case").set(caseStatus);
            if(document.getElementById('detective-main')) showPage('detective', document.querySelectorAll('.nav-btn')[3]); 
        });
    }
});

function logout() { auth.signOut().then(() => window.location.reload()); }

function showPage(id, btn) {
    const display = document.getElementById('game-content');
    display.innerHTML = "";
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    window.isDoingQuiz = false;

    if (id === 'dashboard') {
        // --- ระบบเช็คงานค้างรายบุคคล ---
        let pendingTasksHTML = "";
        
        // เช็คเควสและบอสที่ยังไม่ผ่าน
        if (questStatus.unit1 && !(userData.completedBosses || []).includes('unit1')) pendingTasksHTML += "<li>🔥 ภารกิจค้าง: Unit 1 แนวคิดเชิงคำนวณ (ยังไม่ล้มบอส)</li>";
        if (questStatus.unit2 && !(userData.completedBosses || []).includes('unit2')) pendingTasksHTML += "<li>🔥 ภารกิจค้าง: Unit 2 การออกแบบอัลกอริทึม (ยังไม่ล้มบอส)</li>";
        if (questStatus.unit3 && !(userData.completedBosses || []).includes('unit3')) pendingTasksHTML += "<li>🔥 ภารกิจค้าง: Unit 3 การเขียนโปรแกรม (ยังไม่ล้มบอส)</li>";
        
        // เช็คคดีรายเดือน
        const hasAns = userData.caseAnswer && userData.caseAnswer.who;
        if (!caseStatus.isRevealed && !hasAns) pendingTasksHTML += "<li>🕵️‍♂️ แฟ้มคดี: ยังไม่ได้ระบุตัวคนร้ายในเดือนนี้!</li>";

        if (pendingTasksHTML === "") pendingTasksHTML = "<li style='color:var(--aqua);'>ไม่มีงานค้าง! พักผ่อนได้เลยนักรบ</li>";

        display.innerHTML = `
            <h2 class="pixel-font aqua-glow">>>> Dashboard</h2>
            <div style="background:rgba(255,255,255,0.05); padding:30px; border-radius:15px; border:1px solid var(--glass-border); line-height:1.8;">
                <p style="font-size:20px;">ยินดีต้อนรับนักรบไซเบอร์ <span style="color:var(--aqua);">${userData.name}</span></p>
                <div style="background:rgba(0,0,0,0.5); padding:15px; border-left:4px solid var(--alert-red); margin-top:20px;">
                    <h3 class="pixel-font" style="font-size:12px; color:var(--alert-red); margin-top:0;">[ PENDING TASKS / งานค้างของคุณ ]</h3>
                    <ul style="color:#ddd; font-size:14px; line-height:2;">
                        ${pendingTasksHTML}
                    </ul>
                </div>
            </div>`;
    }

    else if (id === 'lessons') {
        let lessonHTML = `<h2 class="pixel-font aqua-glow">>>> Lessons (สื่อการสอน)</h2>`;
        ['unit1', 'unit2', 'unit3'].forEach((u, idx) => {
            lessonHTML += `<h3 class="pixel-font" style="color:var(--aqua); margin-top:30px;">Unit ${idx+1}</h3>`;
            const items = lessonsData[u] || [];
            if(items.length === 0) lessonHTML += `<p style="color:#aaa;">ยังไม่มีเนื้อหาในบทเรียนนี้</p>`;
            else {
                items.forEach(item => {
                    lessonHTML += `<div class="lesson-card"><h4><i class="fa-solid fa-bookmark" style="color:var(--aqua);"></i> ${item.title}</h4>`;
                    if(item.type === 'youtube') lessonHTML += `<div class="video-container"><iframe src="${item.url}" frameborder="0" allowfullscreen></iframe></div>`;
                    else if(item.type === 'image') lessonHTML += `<img src="${item.url}" style="max-width:100%; border-radius:8px; margin-bottom:10px;">`;
                    else lessonHTML += `<a href="${item.url}" target="_blank" style="color:var(--aqua); text-decoration:underline;">คลิกเพื่อเปิดลิงก์ / ดาวน์โหลดเอกสาร</a>`;
                    lessonHTML += `</div>`;
                });
            }
        });
        display.innerHTML = lessonHTML;
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
        const currentCase = CASES_DB[caseStatus.activeCaseId];
        const hasAns = userData.caseAnswer && userData.caseAnswer.who;
        
        let resultUI = "";
        if(caseStatus.isRevealed) {
            const isCorrect = (userData.caseAnswer.who === currentCase.ansWho && userData.caseAnswer.where === currentCase.ansWhere && userData.caseAnswer.what === currentCase.ansWhat);
            resultUI = `
                <div style="background:${isCorrect ? 'rgba(0,255,255,0.2)' : 'rgba(255,51,102,0.2)'}; border:2px solid ${isCorrect ? 'var(--aqua)' : 'var(--alert-red)'}; padding:20px; border-radius:10px; margin-bottom:20px; text-align:center;">
                    <h3 class="pixel-font">${isCorrect ? 'MISSION CLEARED! 🎉' : 'MISSION FAILED! 😭'}</h3>
                    <p>ความจริงคือ: ${currentCase.ansWho} ก่อเหตุที่ ${currentCase.ansWhere} โดยใช้ ${currentCase.ansWhat}</p>
                    <p style="color:#aaa;">คำตอบของคุณ: ${userData.caseAnswer.who} / ${userData.caseAnswer.where} / ${userData.caseAnswer.what}</p>
                </div>`;
        }

        let cluesHTML = "";
        caseStatus.cluesToggle.forEach((isOpen, idx) => {
            if(isOpen) cluesHTML += `<p style="font-size:12px; color:#fff; border-left:2px solid var(--aqua); padding-left:10px;">${currentCase.clues[idx]}</p>`;
        });
        if(cluesHTML === "") cluesHTML = `<p style="color:#555; font-size:12px;">🔒 ครูเบียร์ยังไม่เปิดเผยเบาะแสใดๆ ในขณะนี้</p>`;

        let optWho = `<option value="">-- ใคร? --</option>` + currentCase.suspects.map(s => `<option value="${s}">${s}</option>`).join('');
        let optWhere = `<option value="">-- ที่ไหน? --</option>` + currentCase.locations.map(l => `<option value="${l}">${l}</option>`).join('');
        let optWhat = `<option value="">-- ใช้อะไร? --</option>` + currentCase.weapons.map(w => `<option value="${w}">${w}</option>`).join('');

        display.innerHTML = `
            <div id="detective-main">
                <h2 class="pixel-font" style="color:var(--detective-purple); text-shadow:0 0 10px var(--detective-purple);">>>> ${currentCase.title}</h2>
                <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:10px; border-left:5px solid var(--detective-purple); margin-bottom:20px;">
                    <p style="font-size:14px; color:#ddd; margin:0;">${currentCase.story}</p>
                </div>
                ${resultUI}

                <h3 class="pixel-font" style="font-size:10px; color:var(--aqua);">[ ตารางไขว้ตัดช้อยส์ Murdle Grid 4x4x4 ]</h3>
                <div style="overflow-x:auto;">
                    <table class="murdle-grid">
                        <tr><th class="empty-cell"></th><th colspan="4" class="header-group" style="background:#222; border-right:3px solid #666;">สถานที่เกิดเหตุ (WHERE)</th><th colspan="4" class="header-group" style="background:#222;">อุปกรณ์ที่ใช้ (WHAT)</th></tr>
                        <tr><th style="background:#111;"></th><th>${currentCase.locations[0]}</th><th>${currentCase.locations[1]}</th><th>${currentCase.locations[2]}</th><th style="border-right:3px solid #666;">${currentCase.locations[3]}</th><th>${currentCase.weapons[0]}</th><th>${currentCase.weapons[1]}</th><th>${currentCase.weapons[2]}</th><th>${currentCase.weapons[3]}</th></tr>
                        <tr><th style="background:rgba(0,255,255,0.1);">${currentCase.suspects[0]}</th>${getCell(0,0)} ${getCell(0,1)} ${getCell(0,2)} ${getCell(0,3,true)} ${getCell(0,4)} ${getCell(0,5)} ${getCell(0,6)} ${getCell(0,7)}</tr>
                        <tr><th style="background:rgba(0,255,255,0.1);">${currentCase.suspects[1]}</th>${getCell(1,0)} ${getCell(1,1)} ${getCell(1,2)} ${getCell(1,3,true)} ${getCell(1,4)} ${getCell(1,5)} ${getCell(1,6)} ${getCell(1,7)}</tr>
                        <tr><th style="background:rgba(0,255,255,0.1);">${currentCase.suspects[2]}</th>${getCell(2,0)} ${getCell(2,1)} ${getCell(2,2)} ${getCell(2,3,true)} ${getCell(2,4)} ${getCell(2,5)} ${getCell(2,6)} ${getCell(2,7)}</tr>
                        <tr><th style="background:rgba(0,255,255,0.1);">${currentCase.suspects[3]}</th>${getCell(3,0)} ${getCell(3,1)} ${getCell(3,2)} ${getCell(3,3,true)} ${getCell(3,4)} ${getCell(3,5)} ${getCell(3,6)} ${getCell(3,7)}</tr>
                        <tr><td colspan="9" class="empty-cell" style="height:10px; border-bottom:3px solid #666; border-top:3px solid #666;"></td></tr>
                        <tr><th style="background:rgba(0,255,255,0.1);">${currentCase.weapons[0]}</th>${getCell(4,0)} ${getCell(4,1)} ${getCell(4,2)} ${getCell(4,3,true)}<td colspan="4" rowspan="4" class="empty-cell"></td></tr>
                        <tr><th style="background:rgba(0,255,255,0.1);">${currentCase.weapons[1]}</th>${getCell(5,0)} ${getCell(5,1)} ${getCell(5,2)} ${getCell(5,3,true)}</tr>
                        <tr><th style="background:rgba(0,255,255,0.1);">${currentCase.weapons[2]}</th>${getCell(6,0)} ${getCell(6,1)} ${getCell(6,2)} ${getCell(6,3,true)}</tr>
                        <tr><th style="background:rgba(0,255,255,0.1);">${currentCase.weapons[3]}</th>${getCell(7,0)} ${getCell(7,1)} ${getCell(7,2)} ${getCell(7,3,true)}</tr>
                    </table>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-top:20px;">
                    <div style="background:rgba(0,0,0,0.4); padding:20px; border-radius:10px; border:1px solid #444;">
                        <h3 class="pixel-font" style="font-size:10px; color:var(--accent-gold);">[ เบาะแสที่พบ ]</h3>
                        ${cluesHTML}
                    </div>
                    
                    <div style="background:rgba(0,0,0,0.4); padding:20px; border-radius:10px; border:1px solid var(--aqua);">
                        <h3 class="pixel-font" style="font-size:10px; color:var(--aqua);">[ พิพากษาคดี ]</h3>
                        <p style="font-size:10px; color:#aaa;">ส่งคำตอบล่าสุด: ${hasAns ? userData.caseAnswer.who + " / " + userData.caseAnswer.where + " / " + userData.caseAnswer.what : "ยังไม่ส่ง"}</p>
                        <select id="ansWho">${optWho}</select><select id="ansWhere">${optWhere}</select><select id="ansWhat">${optWhat}</select>
                        <button class="btn-p pixel-font" style="width:100%; font-size:10px; padding:12px;" onclick="saveCaseAnswer()" ${caseStatus.isRevealed ? 'disabled style="opacity:0.5;"' : ''}>${caseStatus.isRevealed ? 'ปิดรับคำตอบแล้ว' : 'ส่งคำพิพากษา'}</button>
                    </div>
                </div>
            </div>`;
    }

    else if (id === 'status') {
        const intStat = Math.floor(userData.level * 1.5) + 10;
        const agiStat = Math.floor(userData.level * 1.2) + 8;
        const lukStat = Math.floor(userData.level * 2.0) + 5;
        display.innerHTML = `
            <h2 class="pixel-font aqua-glow">>>> Character Profile</h2>
            <div style="display:flex; flex-wrap:wrap; gap:30px; margin-top:20px;">
                <div style="flex:1; min-width:250px; background:rgba(255,255,255,0.05); padding:30px; border-radius:20px; border:1px solid var(--glass-border); text-align:center;">
                    <div style="width:100px; height:100px; background:var(--aqua); border-radius:50%; margin:0 auto 20px auto; display:flex; align-items:center; justify-content:center; font-size:40px; color:#000; box-shadow:0 0 20px var(--aqua);"><i class="fa-solid fa-user-astronaut"></i></div>
                    <h3 style="margin:0; font-size:22px;">${userData.name}</h3>
                    <p style="color:#aaa; font-size:14px; margin-top:10px;">ID: ${userData.studentId} | ห้อง: ${userData.room||'-'} | เลขที่: ${userData.number||'-'}</p>
                </div>
                <div style="flex:2; min-width:300px;">
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap:15px; margin-bottom:20px;">
                        <div class="stats-box">INT (ปัญญา)<span class="stats-val">${intStat}</span></div><div class="stats-box">AGI (ความไว)<span class="stats-val">${agiStat}</span></div><div class="stats-box">LUK (โชค)<span class="stats-val">${lukStat}</span></div>
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
                <button class="btn-p pixel-font" style="background:#ffcc00; color:#000; font-size:9px;" onclick="viewTeacher('students')">โปรไฟล์นักเรียน</button>
                <button class="btn-p pixel-font" style="background:#00ff41; color:#000; font-size:9px;" onclick="viewTeacher('grading')">ระบบคะแนน</button>
                <button class="btn-p pixel-font" style="background:var(--aqua); color:#000; font-size:9px;" onclick="viewTeacher('lessons')">บทเรียน</button>
                <button class="btn-p pixel-font" style="background:var(--aqua); color:#000; font-size:9px;" onclick="viewTeacher('quizzes')">ข้อสอบบอส</button>
                <button class="btn-p pixel-font" style="background:var(--detective-purple); color:#fff; font-size:9px;" onclick="viewTeacher('detective')">คดีสืบสวน</button>
                <button class="btn-p pixel-font" style="background:var(--alert-red); color:#fff; font-size:9px; border-color:var(--alert-red);" onclick="viewTeacher('quests')">เปิด/ปิดระบบ</button>
            </div>
            <div id="teacher-view"></div>`;
        viewTeacher('students');
    }
}

// --- QUEST BOARD HELPER ---
function renderQuestCard(unitNum, title, isUnlocked) {
    if(!isUnlocked) return `<div class="content-card" style="min-height:auto; padding:30px; opacity:0.5; border-color:#555;"><div style="font-size:30px; text-align:right; color:#555;"><i class="fa-solid fa-lock"></i></div><h3 class="pixel-font" style="font-size:12px; color:#888;">Unit ${unitNum}: ${title}</h3><p style="font-size:12px; color:#888;">ยังไม่ถึงเวลาเปิดภารกิจ</p></div>`;
    return `<div class="content-card" style="min-height:auto; padding:30px; border-color:var(--aqua);"><h3 class="pixel-font" style="font-size:12px; color:var(--aqua);">Unit ${unitNum}: ${title}</h3><p style="font-size:12px; color:#ddd;">ส่งงาน 2 ชิ้น และเตรียมตัวสู้บอส</p><button class="btn-p pixel-font" style="width:100%; margin-top:10px; font-size:10px;" onclick="openQuestDetail('unit${unitNum}')">ENTER QUEST</button></div>`;
}

function openQuestDetail(u) {
    const isBossCompleted = (userData.completedBosses || []).includes(u);
    const isBossOpen = questStatus['boss_' + u];
    let bossSectionHTML = "";

    if (isBossCompleted) {
        window.isDoingQuiz = false;
        bossSectionHTML = `<div style="background:rgba(0,255,65,0.1); border:2px solid #00ff41; padding:20px; border-radius:10px; text-align:center;"><h3 class="pixel-font" style="color:#00ff41; margin-top:0;">🎉 BOSS CLEARED!</h3><p style="color:#ddd; margin-bottom:0;">คุณได้กำจัดบอสประจำหน่วยนี้ไปแล้ว (ไม่สามารถโจมตีซ้ำได้)</p></div>`;
    } else if (!isBossOpen) {
        window.isDoingQuiz = false;
        bossSectionHTML = `<div style="background:rgba(255,255,255,0.05); border:2px dashed #666; padding:20px; border-radius:10px; text-align:center;"><h3 class="pixel-font" style="color:#aaa; margin-top:0;"><i class="fa-solid fa-lock"></i> BOSS LOCKED</h3><p style="color:#888; margin-bottom:0;">ครูเบียร์ยังไม่เปิดให้เข้าสู้บอสในขณะนี้ เตรียมตัวให้พร้อม!</p></div>`;
    } else {
        window.isDoingQuiz = true;
        bossSectionHTML = `<div style="background:rgba(255,51,102,0.1); border:1px solid var(--alert-red); padding:20px; border-radius:10px;"><h3 class="pixel-font" style="font-size:12px; color:var(--alert-red);">>>> BOSS FIGHT</h3><p style="font-size:12px; color:#ccc;">ตอบให้ถูกมากที่สุดเพื่อรับโบนัส MP! (คำเตือน: ห้ามพับจอ!)</p><div id="quiz-container_${u}"></div></div>`;
    }

    document.getElementById('game-content').innerHTML = `
        <button class="btn-p pixel-font" style="background:transparent; color:#fff; border-color:#fff; padding:10px; font-size:10px; margin-bottom:20px;" onclick="showPage('quests', document.querySelectorAll('.nav-btn')[2])"><< BACK</button>
        <h2 class="pixel-font aqua-glow">>>> ${u.toUpperCase()} MISSIONS</h2>
        <div style="background:rgba(0,255,255,0.05); border:1px solid var(--aqua); padding:20px; border-radius:10px; margin-bottom:20px;">
            <h3 class="pixel-font" style="font-size:10px; color:var(--aqua);">[MISSION 1] อัปโหลดงานชิ้นที่ 1</h3><input type="file" id="file_${u}_m1" style="background:#000;"><button class="btn-p pixel-font" style="font-size:9px; padding:10px;" onclick="uploadDrive('file_${u}_m1', '${u}_M1')">UPLOAD TO DRIVE</button>
        </div>
        <div style="background:rgba(0,255,255,0.05); border:1px solid var(--aqua); padding:20px; border-radius:10px; margin-bottom:20px;">
            <h3 class="pixel-font" style="font-size:10px; color:var(--aqua);">[MISSION 2] อัปโหลดงานชิ้นที่ 2</h3><input type="file" id="file_${u}_m2" style="background:#000;"><button class="btn-p pixel-font" style="font-size:9px; padding:10px;" onclick="uploadDrive('file_${u}_m2', '${u}_M2')">UPLOAD TO DRIVE</button>
        </div>
        ${bossSectionHTML}
    `;
    if (!isBossCompleted && isBossOpen) renderBossQuestions(u);
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
    
    let completedArr = userData.completedBosses || [];
    if (!completedArr.includes(u)) completedArr.push(u);

    db.collection("students").doc(userData.studentId).update({ 
        mana: userData.mana + mpGain, completedBosses: completedArr
    }).then(() => showPage('quests', document.querySelectorAll('.nav-btn')[2]));
}

// --- MURDLE HELPER ---
function getCell(r, c, isBorder=false) {
    let val = window.murdleState[`r${r}c${c}`] || "";
    let cls = val === 'O' ? 'yes' : (val === 'X' ? 'no' : '');
    let borderStyle = isBorder ? 'border-right:3px solid #666;' : '';
    return `<td id="cell_${r}_${c}" class="clickable ${cls}" style="${borderStyle}" onclick="clickGrid(${r},${c})">${val}</td>`;
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
        db.collection("students").where("studentId", "!=", TEACHER_ID).get().then(snap => {
            let studentsList = [];
            snap.forEach(doc => studentsList.push(doc.data()));
            // เรียงตามห้อง แล้วตามเลขที่
            studentsList.sort((a,b) => {
                if(a.room === b.room) return (parseInt(a.number)||0) - (parseInt(b.number)||0);
                return (a.room||"").localeCompare(b.room||"");
            });

            let html = `<table class="admin-table"><tr><th>ห้อง</th><th>เลขที่</th><th>รหัส</th><th>ชื่อ-สกุล</th><th>Action</th></tr>`;
            studentsList.forEach(s => {
                html += `<tr>
                    <td><input type="text" class="edit-input" id="r_${s.studentId}" value="${s.room||''}" placeholder="ม.2/1"></td>
                    <td><input type="number" class="edit-input" id="n_${s.studentId}" value="${s.number||''}" placeholder="เลขที่"></td>
                    <td>${s.studentId}</td>
                    <td><input type="text" class="name-input" id="name_${s.studentId}" value="${s.name}"></td>
                    <td><button class="btn-p" style="padding:8px 15px; font-size:10px;" onclick="saveStudentProfile('${s.studentId}')">Save</button></td>
                </tr>`;
            });
            box.innerHTML = `<h3 class="pixel-font" style="font-size:12px; color:#ffcc00;">แก้ไขโปรไฟล์นักเรียน</h3>` + html + "</table>";
        });
    }
    else if(v === 'grading') {
        db.collection("students").where("studentId", "!=", TEACHER_ID).get().then(snap => {
            let studentsList = [];
            snap.forEach(doc => studentsList.push(doc.data()));
            studentsList.sort((a,b) => {
                if(a.room === b.room) return (parseInt(a.number)||0) - (parseInt(b.number)||0);
                return (a.room||"").localeCompare(b.room||"");
            });

            let html = `<div style="overflow-x:auto;"><table class="admin-table" style="min-width:1000px;">
                <tr><th rowspan="2">ห้อง</th><th rowspan="2">เลขที่</th><th rowspan="2">ชื่อ-สกุล</th>
                <th colspan="4" style="text-align:center; background:rgba(0,255,255,0.1);">ก่อนกลางภาค</th><th rowspan="2">กลางภาค(20)</th>
                <th colspan="4" style="text-align:center; background:rgba(255,204,0,0.1);">หลังกลางภาค</th><th rowspan="2">ปลายภาค(20)</th><th rowspan="2" style="background:var(--p-green); color:#000;">รวม(100)</th></tr>
                <tr>
                    <th>ช.1(10)</th><th>ช.2(10)</th><th>ช.3(10)</th><th style="color:var(--aqua);">รวม(30)</th>
                    <th>ช.4(10)</th><th>ช.5(10)</th><th>ช.6(10)</th><th style="color:#ffcc00;">รวม(30)</th>
                </tr>`;
            
            studentsList.forEach(s => {
                let sc = s.scores || {s1:0,s2:0,s3:0,mid:0,s4:0,s5:0,s6:0,final:0};
                let preMid = (parseFloat(sc.s1)||0) + (parseFloat(sc.s2)||0) + (parseFloat(sc.s3)||0);
                let postMid = (parseFloat(sc.s4)||0) + (parseFloat(sc.s5)||0) + (parseFloat(sc.s6)||0);
                let total = preMid + postMid + (parseFloat(sc.mid)||0) + (parseFloat(sc.final)||0);

                html += `<tr>
                    <td>${s.room||'-'}</td><td>${s.number||'-'}</td><td style="white-space:nowrap;">${s.name}</td>
                    <td><input type="number" class="grade-input" id="s1_${s.studentId}" value="${sc.s1||0}" onchange="updateGrade('${s.studentId}')" max="10"></td>
                    <td><input type="number" class="grade-input" id="s2_${s.studentId}" value="${sc.s2||0}" onchange="updateGrade('${s.studentId}')" max="10"></td>
                    <td><input type="number" class="grade-input" id="s3_${s.studentId}" value="${sc.s3||0}" onchange="updateGrade('${s.studentId}')" max="10"></td>
                    <td id="pre_${s.studentId}" class="grade-total" style="color:var(--aqua);">${preMid}</td>
                    <td><input type="number" class="grade-input" id="mid_${s.studentId}" value="${sc.mid||0}" onchange="updateGrade('${s.studentId}')" max="20"></td>
                    <td><input type="number" class="grade-input" id="s4_${s.studentId}" value="${sc.s4||0}" onchange="updateGrade('${s.studentId}')" max="10"></td>
                    <td><input type="number" class="grade-input" id="s5_${s.studentId}" value="${sc.s5||0}" onchange="updateGrade('${s.studentId}')" max="10"></td>
                    <td><input type="number" class="grade-input" id="s6_${s.studentId}" value="${sc.s6||0}" onchange="updateGrade('${s.studentId}')" max="10"></td>
                    <td id="post_${s.studentId}" class="grade-total" style="color:#ffcc00;">${postMid}</td>
                    <td><input type="number" class="grade-input" id="fin_${s.studentId}" value="${sc.final||0}" onchange="updateGrade('${s.studentId}')" max="20"></td>
                    <td id="tot_${s.studentId}" class="grade-total" style="color:#00ff41; font-size:16px;">${total}</td>
                </tr>`;
            });
            box.innerHTML = `<h3 class="pixel-font" style="font-size:12px; color:#00ff41;">ระบบบันทึกคะแนน (พิมพ์ตัวเลขแล้วระบบจะเซฟอัตโนมัติ)</h3>` + html + "</table></div>";
        });
    }
    else if(v === 'lessons') {
        box.innerHTML = `
            <div style="background:rgba(0,0,0,0.5); padding:20px; border-radius:10px;">
                <h3 class="pixel-font" style="font-size:12px; color:var(--aqua);">จัดการสื่อการสอน (Lessons)</h3>
                <select id="t-lesson-unit" onchange="loadLessonEditor(this.value)"><option value="">-- เลือก Unit --</option><option value="unit1">Unit 1</option><option value="unit2">Unit 2</option><option value="unit3">Unit 3</option></select>
                <div id="lesson-editor-area"></div>
            </div>`;
    }
    else if(v === 'quizzes') {
        box.innerHTML = `
            <div style="background:rgba(0,0,0,0.5); padding:20px; border-radius:10px;">
                <h3 class="pixel-font" style="font-size:12px; color:var(--aqua);">จัดการข้อสอบ Boss Fight</h3>
                <select id="t-quiz-unit" onchange="loadEditor(this.value)"><option value="">-- เลือก Unit --</option><option value="unit1">Unit 1</option><option value="unit2">Unit 2</option><option value="unit3">Unit 3</option></select>
                <div id="editor-area"></div>
            </div>`;
    }
    else if(v === 'detective') {
        let toggleBtns = "";
        for(let i=0; i<10; i++) {
            let isOpen = caseStatus.cluesToggle[i];
            toggleBtns += `<button class="btn-p" style="font-size:9px; background:${isOpen?'var(--aqua)':'#444'}; color:${isOpen?'#000':'#fff'};" onclick="toggleClue(${i})">คำใบ้ ${i+1}</button>`;
        }
        let caseOptions = CASES_DB.map((c, i) => `<option value="${i}" ${caseStatus.activeCaseId === i ? 'selected' : ''}>${c.title}</option>`).join('');

        box.innerHTML = `
            <div style="background:rgba(179,102,255,0.1); border:1px solid var(--detective-purple); padding:20px; border-radius:10px;">
                <h3 class="pixel-font" style="font-size:12px; color:var(--detective-purple);">ควบคุมแฟ้มคดีสืบสวน</h3>
                <label style="font-size:12px;">เลือกคดีให้เด็กเล่น</label><select onchange="changeActiveCase(this.value)" style="background:#000;">${caseOptions}</select>
                <hr style="border-color:#444; margin:20px 0;">
                <p style="font-size:12px;">กดปุ่มเพื่อโชว์/ซ่อนคำใบ้</p><div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:20px;">${toggleBtns}</div>
                <button class="btn-p" style="width:100%; background:${caseStatus.isRevealed?'var(--alert-red)':'var(--detective-purple)'};" onclick="toggleSetting('monthly_case', 'isRevealed')">${caseStatus.isRevealed ? 'ปิดการเฉลย' : '📢 กดปุ่มประกาศเฉลยให้เด็กเห็น'}</button>
            </div>`;
    }
    else if(v === 'quests') {
        box.innerHTML = `
            <div style="background:rgba(0,255,255,0.1); border:1px solid var(--aqua); padding:20px; border-radius:10px; margin-bottom:20px;">
                <h3 class="pixel-font" style="font-size:12px; color:var(--aqua);">เปิด/ปิด ระบบส่งงาน (Quest Board)</h3>
                <div style="display:flex; gap:10px;">
                    <button class="btn-p" style="flex:1; background:${questStatus.unit1?'var(--aqua)':'#444'}; color:${questStatus.unit1?'#000':'#fff'};" onclick="toggleSetting('quest_board', 'unit1')">Unit 1</button>
                    <button class="btn-p" style="flex:1; background:${questStatus.unit2?'var(--aqua)':'#444'}; color:${questStatus.unit2?'#000':'#fff'};" onclick="toggleSetting('quest_board', 'unit2')">Unit 2</button>
                    <button class="btn-p" style="flex:1; background:${questStatus.unit3?'var(--aqua)':'#444'}; color:${questStatus.unit3?'#000':'#fff'};" onclick="toggleSetting('quest_board', 'unit3')">Unit 3</button>
                </div>
            </div>
            <div style="background:rgba(255,51,102,0.1); border:1px solid var(--alert-red); padding:20px; border-radius:10px;">
                <h3 class="pixel-font" style="font-size:12px; color:var(--alert-red);">เปิด/ปิด สอบบอสไฟต์ (Boss Fight)</h3>
                <div style="display:flex; gap:10px;">
                    <button class="btn-p" style="flex:1; border-color:var(--alert-red); background:${questStatus.boss_unit1?'var(--alert-red)':'#444'}; color:${questStatus.boss_unit1?'#fff':'#aaa'};" onclick="toggleSetting('quest_board', 'boss_unit1')">Boss 1</button>
                    <button class="btn-p" style="flex:1; border-color:var(--alert-red); background:${questStatus.boss_unit2?'var(--alert-red)':'#444'}; color:${questStatus.boss_unit2?'#fff':'#aaa'};" onclick="toggleSetting('quest_board', 'boss_unit2')">Boss 2</button>
                    <button class="btn-p" style="flex:1; border-color:var(--alert-red); background:${questStatus.boss_unit3?'var(--alert-red)':'#444'}; color:${questStatus.boss_unit3?'#fff':'#aaa'};" onclick="toggleSetting('quest_board', 'boss_unit3')">Boss 3</button>
                </div>
            </div>`;
    }
}

// --- STUDENT PROFILE & GRADING LOGIC ---
function saveStudentProfile(id) {
    const room = document.getElementById(`r_${id}`).value;
    const num = document.getElementById(`n_${id}`).value;
    const name = document.getElementById(`name_${id}`).value;
    db.collection("students").doc(id).update({ room: room, number: num, name: name }).then(() => alert("อัปเดตข้อมูลสำเร็จ!"));
}

function updateGrade(id) {
    let s1 = parseFloat(document.getElementById(`s1_${id}`).value) || 0;
    let s2 = parseFloat(document.getElementById(`s2_${id}`).value) || 0;
    let s3 = parseFloat(document.getElementById(`s3_${id}`).value) || 0;
    let mid = parseFloat(document.getElementById(`mid_${id}`).value) || 0;
    let s4 = parseFloat(document.getElementById(`s4_${id}`).value) || 0;
    let s5 = parseFloat(document.getElementById(`s5_${id}`).value) || 0;
    let s6 = parseFloat(document.getElementById(`s6_${id}`).value) || 0;
    let fin = parseFloat(document.getElementById(`fin_${id}`).value) || 0;

    let pre = s1+s2+s3; let post = s4+s5+s6; let total = pre+post+mid+fin;

    // อัปเดต UI ทันทีไม่ต้องรอโหลด
    document.getElementById(`pre_${id}`).innerText = pre;
    document.getElementById(`post_${id}`).innerText = post;
    document.getElementById(`tot_${id}`).innerText = total;

    db.collection("students").doc(id).update({
        scores: { s1:s1, s2:s2, s3:s3, mid:mid, s4:s4, s5:s5, s6:s6, final:fin }
    });
}

// LESSON EDITOR
function loadLessonEditor(u) {
    const area = document.getElementById('lesson-editor-area');
    if(!u) return area.innerHTML = "";
    const items = lessonsData[u] || [];
    let html = ``;
    items.forEach((item, i) => {
        html += `<div style="border:1px solid #555; padding:15px; margin:15px 0; border-radius:8px; background:rgba(255,255,255,0.02);">
            <input type="text" value="${item.title}" placeholder="ชื่อสื่อการสอน" onchange="lessonsData['${u}'][${i}].title=this.value">
            <select onchange="lessonsData['${u}'][${i}].type=this.value">
                <option value="youtube" ${item.type==='youtube'?'selected':''}>YouTube Embed URL</option>
                <option value="image" ${item.type==='image'?'selected':''}>Image URL (รูปภาพ)</option>
                <option value="link" ${item.type==='link'?'selected':''}>Link (เว็บไซต์/เอกสาร)</option>
            </select>
            <input type="text" value="${item.url}" placeholder="URL ลิงก์สื่อ" onchange="lessonsData['${u}'][${i}].url=this.value">
            <button class="btn-p btn-danger" style="padding:10px; font-size:10px;" onclick="lessonsData['${u}'].splice(${i},1); loadLessonEditor('${u}');">ลบสื่อนี้</button>
        </div>`;
    });
    html += `<div style="display:flex; gap:10px; margin-top:20px;">
        <button class="btn-p" style="font-size:10px; background:transparent; border:2px solid var(--aqua); color:var(--aqua);" onclick="if(!lessonsData['${u}']) lessonsData['${u}']=[]; lessonsData['${u}'].push({title:'',type:'youtube',url:''}); loadLessonEditor('${u}');">+ เพิ่มสื่อการสอน</button>
        <button class="btn-p" style="font-size:10px;" onclick="db.collection('settings').doc('lessons').set(lessonsData).then(()=>alert('บันทึกสื่อการสอนสำเร็จ!'))">💾 บันทึกลงระบบ</button>
    </div>`;
    area.innerHTML = html;
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

// TOGGLES
function toggleSetting(col, key) {
    let target = col === 'quest_board' ? questStatus : caseStatus;
    db.collection("settings").doc(col).update({ [key]: !target[key] }).then(() => viewTeacher(col==='quest_board'?'quests':'detective'));
}
function toggleClue(index) {
    let newToggles = [...caseStatus.cluesToggle];
    newToggles[index] = !newToggles[index];
    db.collection("settings").doc("monthly_case").update({ cluesToggle: newToggles }).then(() => viewTeacher('detective'));
}
function changeActiveCase(caseIdx) {
    if(!confirm("การเปลี่ยนคดีจะรีเซ็ตคำใบ้และปิดการเฉลย ยืนยันไหม?")) return viewTeacher('detective');
    db.collection("settings").doc("monthly_case").update({
        activeCaseId: parseInt(caseIdx), cluesToggle: [false,false,false,false,false,false,false,false,false,false], isRevealed: false
    }).then(() => viewTeacher('detective'));
}

// ANTI CHEAT
document.addEventListener("visibilitychange", () => {
    if (document.hidden && window.isDoingQuiz && userData && userData.studentId !== TEACHER_ID) {
        db.collection("anti_cheat_alerts").add({ studentName: userData.name, action: "สลับจอ", timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        alert("🚨 [SYSTEM ALERT] ครูเบียร์เห็นนะ! ตรวจพบการพับหน้าจอระหว่างทำภารกิจ!");
    }
});
