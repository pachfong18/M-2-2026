const GAS_URL = "https://script.google.com/macros/s/AKfycbx6GS7NxoTdFLU_4usonU8GTQ9rhvSBcLUcyrEkNZE9EhTZM32EL4s4_CHEoGvjeMal/exec";
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
let questStatus = { unit1_m1: false, unit1_m2: false, unit2_m1: false, unit2_m2: false, unit3_m1: false, unit3_m2: false, boss_unit1: false, boss_unit2: false, boss_unit3: false, unit1: false, unit2: false, unit3: false };
let lessonsData = { unit1: [], unit2: [], unit3: [] };
let announcements = [];

const CASES_DB = [
    { title: "คดีที่ 1: ปริศนาขโมยซอร์สโค้ด", story: "เมื่อคืนเกิดเหตุคนร้ายขโมยซอร์สโค้ดระบบตัดเกรดของโรงเรียน!", suspects: ["นาย A", "นางสาว B", "เด็กชาย C", "นาง D"], locations: ["ห้องเซิร์ฟเวอร์", "ห้องพักครู", "สวน", "โรงอาหาร"], weapons: ["แฟลชไดรฟ์", "แล็ปท็อป", "มือถือ", "แท็บเล็ต"], clues: ["1. 'นาย A' ถูกพบเห็นว่านั่งเล่น 'มือถือ' อยู่ตลอดเวลา", "2. 'เด็กชาย C' หิวมาก จึงเดินไปที่ 'โรงอาหาร'", "3. มีคนลืม 'แท็บเล็ต' ทิ้งไว้ที่ 'โรงอาหาร'", "4. 'นาง D' นั่งตรวจงานอยู่ที่ 'ห้องพักครู' ตลอดเวลา", "5. คนที่อยู่ 'ห้องพักครู' ใช้ 'แล็ปท็อป' ทำงาน", "6. ผู้ที่ขโมยข้อมูลใช้ 'แฟลชไดรฟ์'", "7. 'นางสาว B' ไม่มี 'มือถือ' และไม่ได้ใช้ 'แท็บเล็ต'", "8. 'นาย A' ไม่เคยเดินไปที่ 'ห้องพักครู' หรือ 'โรงอาหาร'", "9. คนที่อยู่ 'สวน' ไม่ได้ใช้ 'แล็ปท็อป' และ 'แท็บเล็ต'", "10. รปภ. ยืนยันว่า 'นางสาว B' เป็นคนเดียวที่มีกุญแจเข้า 'ห้องเซิร์ฟเวอร์'"], ansWho: "นางสาว B", ansWhere: "ห้องเซิร์ฟเวอร์", ansWhat: "แฟลชไดรฟ์" },
    { title: "คดีที่ 2: แฮกเกอร์ป่วนเว็บโรงเรียน", story: "หน้าเว็บโรงเรียนถูกแฮกเปลี่ยนรูปภาพ!", suspects: ["ประธานนักเรียน", "หัวหน้าห้อง", "ภารโรง", "ครูฝึกสอน"], locations: ["ห้องสมุด", "ห้องคอมฯ 1", "ดาดฟ้า", "สนามบาส"], weapons: ["สมาร์ทวอทช์", "มินิพีซี", "แว่นตาอัจฉริยะ", "โน้ตบุ๊ก"], clues: ["1. คำใบ้ 1","2. คำใบ้ 2","3. คำใบ้ 3","4. คำใบ้ 4","5. คำใบ้ 5","6. คำใบ้ 6","7. คำใบ้ 7","8. คำใบ้ 8","9. คำใบ้ 9","10. คำใบ้ 10"], ansWho: "หัวหน้าห้อง", ansWhere: "ห้องคอมฯ 1", ansWhat: "มินิพีซี" }
];
let caseStatus = { activeCaseId: 0, cluesToggle: [false,false,false,false,false,false,false,false,false,false], isRevealed: false };
window.murdleState = {}; 
const TEACHER_ID = "pchrkr007";
const ROOMS_LIST = ["London", "Newyork", "Tokyo", "Paris", "Seoul"]; 

let teacherChatUnsubscribe = null;
let currentTeacherChatId = null;

const SHOP_ITEMS = [
    { id: "title_1", name: "[ฉายา] ผู้กล้าฝึกหัด", cost: 50, type: "title", value: "ผู้กล้าฝึกหัด", icon: "fa-shield-halved" },
    { id: "title_2", name: "[ฉายา] จ้าวแห่งบั๊ก", cost: 150, type: "title", value: "จ้าวแห่งบั๊ก", icon: "fa-bug" },
    { id: "title_3", name: "[ฉายา] แฮกเกอร์เงา", cost: 300, type: "title", value: "แฮกเกอร์เงา", icon: "fa-user-secret" },
    { id: "title_4", name: "[ฉายา] เทพทรู", cost: 1000, type: "title", value: "เทพทรู", icon: "fa-crown" },
    { id: "icon_1", name: "[ไอคอน] ดาวทอง", cost: 100, type: "icon", value: "fa-star", icon: "fa-star" },
    { id: "icon_2", name: "[ไอคอน] สายฟ้า", cost: 200, type: "icon", value: "fa-bolt", icon: "fa-bolt" },
    { id: "icon_3", name: "[ไอคอน] มังกร", cost: 500, type: "icon", value: "fa-dragon", icon: "fa-dragon" },
    { id: "icon_4", name: "[ไอคอน] หัวกะโหลก", cost: 600, type: "icon", value: "fa-skull", icon: "fa-skull" },
    { id: "glow_1", name: "[ออร่า] สีแดงเพลิง", cost: 250, type: "glow", value: "glow-red", icon: "fa-fire" },
    { id: "glow_2", name: "[ออร่า] สีฟ้าน้ำแข็ง", cost: 250, type: "glow", value: "glow-blue", icon: "fa-water" },
    { id: "glow_3", name: "[ออร่า] สีม่วงลี้ลับ", cost: 350, type: "glow", value: "glow-purple", icon: "fa-moon" },
    { id: "glow_4", name: "[ออร่า] สีทองคำ", cost: 800, type: "glow", value: "glow-gold", icon: "fa-sun" },
    { id: "frame_1", name: "[กรอบ] นีออน", cost: 400, type: "frame", value: "frame-neon", icon: "fa-square" },
    { id: "frame_2", name: "[กรอบ] ไฟนรก", cost: 800, type: "frame", value: "frame-fire", icon: "fa-fire-flame-curved" },
    { id: "frame_3", name: "[กรอบ] ไไซเบอร์", cost: 1200, type: "frame", value: "frame-cyber", icon: "fa-microchip" }
];

// --- Authentication ---
function handleLoginEnter(e) { if (e.key === 'Enter') login(); }
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
    const room = document.getElementById('regRoom').value;
    const num = document.getElementById('regNumber').value.trim();
    const pass = document.getElementById('regPass').value;
    if(!name || !id || !room || !num) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    if(pass.length < 6) return alert("รหัสผ่านต้องมีอย่างน้อย 6 ตัว");
    auth.createUserWithEmailAndPassword(id + "@srisuvit.com", pass).then(res => {
        db.collection("students").doc(id).set({ 
            name: name, studentId: id, number: num, room: room, level: 1, exp: 0, mana: 0, rank: "Novice", 
            caseAnswer: {who:"",where:"",what:""}, completedBosses: [], submittedMissions: [], returnedMissions: [],
            scores: {s1:0, s2:0, s3:0, mid:0, s4:0, s5:0, s6:0, final:0}, inventory: [], equippedTitle: "", equippedIcon: "", equippedGlow: "", equippedFrame: "", lastActive: firebase.firestore.FieldValue.serverTimestamp()
        });
    }).catch(e => alert(e.message));
}
function logout() { auth.signOut().then(() => window.location.reload()); }

auth.onAuthStateChanged(user => {
    if (user) {
        const userId = user.email.split('@')[0];
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('reg-section').classList.add('hidden');
        document.getElementById('menu-items').classList.remove('hidden');
        document.getElementById('game-content').classList.remove('hidden');
        db.collection("students").doc(userId).onSnapshot(doc => {
            userData = doc.data();
            if(userData) {
                applyUserCosmetics(); 
                document.getElementById('st-mp').innerText = userData.mana || 0;
                document.getElementById('st-lv').innerText = userData.level || 1;
                if(userId !== TEACHER_ID && document.getElementById('chat-fab').classList.contains('hidden')){
                    document.getElementById('chat-fab').classList.remove('hidden');
                    initTeacherChatListener();
                }
            }
            if(!document.getElementById('game-content').innerHTML) showPage('dashboard', document.querySelector('.nav-btn'));
        });
        if(userId === TEACHER_ID) document.getElementById('teacher-btn').classList.remove('hidden');
        setInterval(() => { if(!document.hidden && userData && userId !== TEACHER_ID) db.collection("students").doc(userId).update({ lastActive: firebase.firestore.FieldValue.serverTimestamp() }); }, 60000);
        db.collection("settings").doc("quizzes").onSnapshot(doc => { quizData = doc.data() || {}; });
        db.collection("settings").doc("quest_board").onSnapshot(doc => { questStatus = doc.data() || questStatus; });
        db.collection("settings").doc("lessons").onSnapshot(doc => { lessonsData = doc.data() || { unit1:[], unit2:[], unit3:[] }; });
        db.collection("settings").doc("monthly_case").onSnapshot(doc => { let d = doc.data(); if(d) caseStatus = d; });
        db.collection("settings").doc("announcements").onSnapshot(doc => { announcements = (doc.data() || {}).list || []; if(document.getElementById('dash-announcements')) showPage('dashboard', document.querySelectorAll('.nav-btn')[0]); });
    }
});

function applyUserCosmetics() {
    let titleStr = userData.equippedTitle ? `[${userData.equippedTitle}]` : "";
    let iconStr = userData.equippedIcon ? `<i class="fa-solid ${userData.equippedIcon}" style="margin-right:5px;"></i>` : "";
    let glowClass = userData.equippedGlow || "";
    document.getElementById('st-title').innerText = titleStr;
    document.getElementById('st-name-wrapper').innerHTML = `${iconStr}<span class="${glowClass}">${userData.name}</span>`;
}

// --- Navigation ---
function showPage(id, btn) {
    const display = document.getElementById('game-content');
    display.innerHTML = "";
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    window.isDoingQuiz = false;

    if (id === 'dashboard') {
        let pendingTasksHTML = "";
        const sm = userData.submittedMissions || []; const rm = userData.returnedMissions || [];
        missions_list = ['unit1_m1', 'unit1_m2', 'unit2_m1', 'unit2_m2', 'unit3_m1', 'unit3_m2'];
        missions_list.forEach(m => { if(questStatus[m] && !sm.includes(m) && !rm.includes(m)) pendingTasksHTML += `<li>📄 ${m.toUpperCase().replace('_',' ')}</li>`; });
        if (pendingTasksHTML === "") pendingTasksHTML = "<li style='color:var(--p-green);'>ไม่มีงานค้าง!</li>";
        let annHTML = ""; announcements.forEach(a => { annHTML += `<div style="background:rgba(255,204,0,0.1); border-left:4px solid #ffcc00; padding:10px; margin-bottom:10px; font-size:14px;"><i class="fa-solid fa-bullhorn" style="color:#ffcc00;"></i> <b>ประกาศ:</b> ${a}</div>`; });
        display.innerHTML = `<h2 class="pixel-font aqua-glow">>>> Dashboard</h2><div style="background:rgba(255,255,255,0.05); padding:30px; border-radius:15px; border:1px solid var(--glass-border);"><p style="font-size:20px;">ยินดีต้อนรับคุณ <span class="${userData.equippedGlow||''}">${userData.name}</span></p><div id="dash-announcements">${annHTML}</div><div style="background:rgba(0,0,0,0.5); padding:15px; border-left:4px solid var(--alert-red); margin-top:20px;"><h3 class="pixel-font" style="font-size:12px; color:var(--alert-red);">[ PENDING TASKS ]</h3><ul>${pendingTasksHTML}</ul></div></div>`;
    }
    else if (id === 'shop') {
        let shopHTML = `<h2 class="pixel-font" style="color:#ffcc00; text-shadow:0 0 10px #ffcc00;">>>> Mana Shop</h2><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-top:20px;">`;
        SHOP_ITEMS.forEach(item => {
            const isBought = (userData.inventory || []).includes(item.id);
            let btnHTML = isBought ? `<button class="btn-p" onclick="equipItem('${item.id}', '${item.type}', '${item.value}')">สวมใส่</button>` : `<button class="btn-p" onclick="buyItem('${item.id}', ${item.cost})">ซื้อเลย (${item.cost} MP)</button>`;
            shopHTML += `<div class="shop-card ${item.type==='frame'?item.value:''}"><i class="fa-solid ${item.icon} ${item.type==='glow'?item.value:''}"></i><h3>${item.name}</h3>${btnHTML}</div>`;
        });
        display.innerHTML = shopHTML + "</div>";
    }
    else if (id === 'detective') {
        window.isDoingQuiz = true; const currentCase = CASES_DB[caseStatus.activeCaseId] || CASES_DB[0];
        let cluesHTML = ""; caseStatus.cluesToggle.forEach((isOpen, idx) => { if(isOpen && currentCase.clues[idx]) cluesHTML += `<p style="font-size:12px; color:#fff; border-left:2px solid var(--aqua); padding-left:10px;">${currentCase.clues[idx]}</p>`; });
        display.innerHTML = `<h2 class="pixel-font" style="color:var(--detective-purple);">>>> ${currentCase.title}</h2><div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:10px; margin-bottom:20px;"><p>${currentCase.story}</p></div><h3 class="pixel-font" style="font-size:10px; color:var(--aqua);">[ Murdle Grid 4x4x4 ]</h3><div style="overflow-x:auto;"><table class="murdle-grid"><tr><th class="empty-cell"></th><th colspan="4" class="header-group">WHERE</th><th colspan="4" class="header-group">WHAT</th></tr><tr><th style="background:#111;"></th><th>${currentCase.locations[0]}</th><th>${currentCase.locations[1]}</th><th>${currentCase.locations[2]}</th><th>${currentCase.locations[3]}</th><th>${currentCase.weapons[0]}</th><th>${currentCase.weapons[1]}</th><th>${currentCase.weapons[2]}</th><th>${currentCase.weapons[3]}</th></tr>${[0,1,2,3].map(r => `<tr><th style="background:rgba(0,255,255,0.1);">${currentCase.suspects[r]}</th>${[0,1,2,3,4,5,6,7].map(c => getCell(r,c)).join('')}</tr>`).join('')}</table></div><div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-top:20px;"><div style="background:rgba(0,0,0,0.4); padding:20px; border-radius:10px; border:1px solid #444;"><h3>[ Clues ]</h3>${cluesHTML||'🔒 No clues revealed'}</div><div style="background:rgba(0,0,0,0.4); padding:20px; border-radius:10px; border:1px solid var(--aqua);"><h3>[ Judge ]</h3><select id="ansWho"><option value="">-- Who? --</option>${currentCase.suspects.map(s=>`<option value="${s}">${s}</option>`).join('')}</select><button class="btn-p" onclick="saveCaseAnswer()">พิพากษา</button></div></div>`;
    }
    else if (id === 'quests') {
        display.innerHTML = `<h2 class="pixel-font aqua-glow">>>> Quest Board</h2><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px;">${renderQuestCard(1, "แนวคิดเชิงคำนวณ", questStatus.unit1)}${renderQuestCard(2, "การออกแบบอัลกอริทึม", questStatus.unit2)}${renderQuestCard(3, "การเขียนโปรแกรม Python", questStatus.unit3)}</div>`;
    }
    else if (id === 'lessons') {
        let lessonHTML = `<h2 class="pixel-font aqua-glow">>>> Lessons</h2>`;
        ['unit1', 'unit2', 'unit3'].forEach((u, idx) => {
            lessonHTML += `<h3 class="pixel-font" style="color:var(--aqua); margin-top:20px;">Unit ${idx+1}</h3>`;
            const items = lessonsData[u] || [];
            if(items.length === 0) lessonHTML += `<p style="color:#aaa;">ยังไม่มีเนื้อหา</p>`;
            else items.forEach(item => { lessonHTML += `<div class="lesson-card"><h4>${item.title}</h4>${item.type === 'youtube' ? `<div class="video-container"><iframe src="${item.url}"></iframe></div>` : `<a href="${item.url}" target="_blank">ลิงก์สื่อการสอน</a>`}</div>`; });
        });
        display.innerHTML = lessonHTML;
    }
    else if (id === 'status') {
        const intStat = Math.floor(userData.level * 1.5) + 10;
        display.innerHTML = `<h2 class="pixel-font aqua-glow">>>> Character Profile</h2><div style="display:flex; flex-wrap:wrap; gap:30px;"><div style="flex:1; background:rgba(255,255,255,0.05); padding:30px; border-radius:20px; text-align:center;"><div class="avatar-box ${userData.equippedFrame||''}" style="width:100px; height:100px; background:var(--aqua); margin:0 auto 20px auto; display:flex; align-items:center; justify-content:center; font-size:40px; color:#000;"><i class="fa-solid fa-user-astronaut"></i></div><h3><span class="${userData.equippedGlow||''}">${userData.name}</span></h3><p>${userData.equippedTitle||userData.rank}</p></div><div style="flex:2;"><div class="stats-box">INT <span class="stats-val">${intStat}</span></div><div style="background:rgba(0,0,0,0.3); padding:20px; border-radius:12px; margin-top:20px;"><p>EXP Progress</p><div class="bar-outer"><div class="bar-fill" style="width:${userData.exp}%; background:var(--aqua);"></div></div></div></div></div>`;
    }
    else if (id === 'teacher') {
        display.innerHTML = `<h2 class="pixel-font" style="color:#ffcc00;">>>> Kru Beer Panel</h2><div style="display:flex; flex-wrap:wrap; gap:10px; margin:20px 0;"><button class="btn-p" onclick="viewTeacher('students')">โปรไฟล์เด็ก</button><button class="btn-p" onclick="viewTeacher('grading')">สมุดคะแนน</button><button class="btn-p" onclick="viewTeacher('assignments')">ตรวจงาน</button><button class="btn-p" onclick="viewTeacher('online')">เช็คออนไลน์</button><button class="btn-p" onclick="viewTeacher('chat')">แชท</button><button class="btn-p" onclick="viewTeacher('announcements')">ประกาศ</button><button class="btn-p" onclick="viewTeacher('lessons')">สื่อ</button><button class="btn-p" onclick="viewTeacher('detective')">คดี</button><button class="btn-p" onclick="viewTeacher('quests')">เปิดปิดระบบ</button></div><div id="teacher-view"></div>`;
        viewTeacher('students');
    }
}

// 🌟 ตัวช่วยจัดกลุ่มตาราง 🌟
function generateGroupedTables(studentsList, renderRowFunc, headerHTML) {
    let finalHTML = "";
    grouped = { "London":[], "Newyork":[], "Tokyo":[], "Paris":[], "Seoul":[], "อื่นๆ":[] };
    studentsList.forEach(s => { if(ROOMS_LIST.includes(s.room)) grouped[s.room].push(s); else grouped["อื่นๆ"].push(s); });
    Object.keys(grouped).forEach(room => {
        if (room === "อื่นๆ" && grouped[room].length === 0) return;
        finalHTML += `<h4 style="color:var(--aqua); margin-top:30px; border-bottom: 1px solid #444;">🏠 ห้อง ${room} (${grouped[room].length} คน)</h4>`;
        if (grouped[room].length === 0) finalHTML += `<p style="color:#555;">ยังไม่มีนักเรียน</p>`;
        else finalHTML += `<div style="overflow-x:auto;"><table class="admin-table">${headerHTML}${grouped[room].map(s => renderRowFunc(s)).join('')}</table></div>`;
    });
    return finalHTML;
}

// --- Teacher Logic ---
function viewTeacher(v) {
    const box = document.getElementById('teacher-view'); box.innerHTML = "Loading...";
    if (v === 'students') {
        db.collection("students").where("studentId", "!=", TEACHER_ID).get().then(snap => {
            let list = []; snap.forEach(doc => list.push(doc.data()));
            list.sort((a,b) => (parseInt(a.number)||0) - (parseInt(b.number)||0));
            const addForm = `<div style="background:rgba(255,204,0,0.1); border:1px solid #ffcc00; padding:20px; border-radius:15px; margin-bottom:30px;"><h4>➕ เพิ่มนักเรียนใหม่เข้าระบบ</h4><div style="display:grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap:10px;"><input id="tAddName" placeholder="ชื่อ-สกุล"><input id="tAddId" placeholder="รหัส 5 หลัก"><select id="tAddRoom"><option value="London">London</option><option value="Newyork">Newyork</option><option value="Tokyo">Tokyo</option><option value="Paris">Paris</option><option value="Seoul">Seoul</option></select><input id="tAddNum" type="number" placeholder="เลขที่"><button class="btn-p" onclick="teacherCreateStudent()">เพิ่มเลย</button></div></div>`;
            const header = `<tr><th>ห้อง</th><th>เลขที่</th><th>รหัส</th><th>ชื่อ-สกุล</th><th>LV/EXP</th><th>MP</th><th>Action</th></tr>`;
            const render = (s) => `<tr><td>${s.room}</td><td>${s.number}</td><td>${s.studentId}</td><td>${s.name}</td><td>LV ${s.level} (${s.exp}%)</td><td>${s.mana}</td><td><button onclick="saveStudentProfile('${s.studentId}')">บันทึก</button><button class="btn-danger" onclick="deleteStudent('${s.studentId}','${s.name}')">ลบ</button></td></tr>`;
            box.innerHTML = addForm + generateGroupedTables(list, render, header);
        });
    }
    else if (v === 'grading') {
        db.collection("students").where("studentId", "!=", TEACHER_ID).get().then(snap => {
            let list = []; snap.forEach(doc => list.push(doc.data()));
            list.sort((a,b) => (parseInt(a.number)||0) - (parseInt(b.number)||0));
            const header = `<tr><th>เลขที่</th><th>ชื่อ</th><th>ช1(10)</th><th>ช2(10)</th><th>ช3(10)</th><th>Mid(20)</th><th>ช4(10)</th><th>ช5(10)</th><th>ช6(10)</th><th>Fin(20)</th><th>รวม(100)</th></tr>`;
            const render = (s) => {
                let sc = s.scores || {s1:0,s2:0,s3:0,mid:0,s4:0,s5:0,s6:0,final:0};
                let tot = (parseFloat(sc.s1)||0)+(parseFloat(sc.s2)||0)+(parseFloat(sc.s3)||0)+(parseFloat(sc.mid)||0)+(parseFloat(sc.s4)||0)+(parseFloat(sc.s5)||0)+(parseFloat(sc.s6)||0)+(parseFloat(sc.final)||0);
                return `<tr><td>${s.number}</td><td>${s.name}</td><td><input class="grade-input" id="s1_${s.studentId}" value="${sc.s1}" onchange="updateGrade('${s.studentId}')"></td><td><input class="grade-input" id="s2_${s.studentId}" value="${sc.s2}" onchange="updateGrade('${s.studentId}')"></td><td><input class="grade-input" id="s3_${s.studentId}" value="${sc.s3}" onchange="updateGrade('${s.studentId}')"></td><td><input class="grade-input" id="mid_${s.studentId}" value="${sc.mid}" onchange="updateGrade('${s.studentId}')"></td><td><input class="grade-input" id="s4_${s.studentId}" value="${sc.s4}" onchange="updateGrade('${s.studentId}')"></td><td><input class="grade-input" id="s5_${s.studentId}" value="${sc.s5}" onchange="updateGrade('${s.studentId}')"></td><td><input class="grade-input" id="s6_${s.studentId}" value="${sc.s6}" onchange="updateGrade('${s.studentId}')"></td><td><input class="grade-input" id="fin_${s.studentId}" value="${sc.final}" onchange="updateGrade('${s.studentId}')"></td><td style="color:#00ff41;">${tot}</td></tr>`;
            };
            box.innerHTML = generateGroupedTables(list, render, header);
        });
    }
    // ... Assignments และ Online มีหลักการเดียวกัน (ใช้ generateGroupedTables)
    else if (v === 'assignments') {
        db.collection("students").where("studentId", "!=", TEACHER_ID).get().then(snap => {
            let list = []; snap.forEach(doc => list.push(doc.data()));
            list.sort((a,b) => (parseInt(a.number)||0) - (parseInt(b.number)||0));
            const header = `<tr><th>เลขที่</th><th>ชื่อ</th><th>U1-M1</th><th>U1-M2</th><th>U2-M1</th><th>U2-M2</th><th>U3-M1</th><th>U3-M2</th></tr>`;
            const render = (s) => {
                let sm = s.submittedMissions || []; let rm = s.returnedMissions || [];
                return `<tr><td>${s.number}</td><td>${s.name}</td>${['unit1_m1','unit1_m2','unit2_m1','unit2_m2','unit3_m1','unit3_m2'].map(m => `<td>${rm.includes(m)?'🔵 คืนงาน':(sm.includes(m)?`<button class="btn-p" style="background:#00ff41; color:#000;" onclick="returnWork('${s.studentId}','${m}','${s.name}')">✅ ส่งแล้ว</button>`:'❌')}</td>`).join('')}</tr>`;
            };
            box.innerHTML = generateGroupedTables(list, render, header);
        });
    }
}

// --- Action Support ---
function teacherCreateStudent() {
    const n = document.getElementById('tAddName').value; const id = document.getElementById('tAddId').value;
    const r = document.getElementById('tAddRoom').value; const num = document.getElementById('tAddNum').value;
    if(!n || !id) return alert("กรอกชื่อและรหัสด้วย!");
    db.collection("students").doc(id).set({ name:n, studentId:id, room:r, number:num, level:1, exp:0, mana:0, rank:"Novice", scores:{s1:0,s2:0,s3:0,mid:0,s4:0,s5:0,s6:0,final:0}, inventory:[], completedBosses:[], submittedMissions:[], returnedMissions:[] })
    .then(() => { alert("เพิ่มนักเรียนสำเร็จ!"); viewTeacher('students'); });
}

function updateGrade(id) {
    let scores = { s1: document.getElementById(`s1_${id}`).value, s2: document.getElementById(`s2_${id}`).value, s3: document.getElementById(`s3_${id}`).value, mid: document.getElementById(`mid_${id}`).value, s4: document.getElementById(`s4_${id}`).value, s5: document.getElementById(`s5_${id}`).value, s6: document.getElementById(`s6_${id}`).value, final: document.getElementById(`fin_${id}`).value };
    db.collection("students").doc(id).update({ scores: scores }).then(() => viewTeacher('grading'));
}

function deleteStudent(id, name) { if(confirm(`ลบ ${name}?`)) db.collection("students").doc(id).delete().then(()=>viewTeacher('students')); }
function returnWork(id, mission, name) { if(confirm(`คืนงาน ${mission} ให้ ${name}?`)) db.collection("students").doc(id).get().then(doc => { let sm = doc.data().submittedMissions; let rm = doc.data().returnedMissions || []; sm.splice(sm.indexOf(mission), 1); rm.push(mission); db.collection("students").doc(id).update({ submittedMissions: sm, returnedMissions: rm }).then(()=>viewTeacher('assignments')); }); }

// --- Helpers ---
function getCell(r, c) { let val = window.murdleState[`r${r}c${c}`] || ""; return `<td class="clickable ${val==='O'?'yes':(val==='X'?'no':'')}" onclick="clickGrid(${r},${c})">${val}</td>`; }
function clickGrid(r, c) { let k = `r${r}c${c}`; let curr = window.murdleState[k] || ""; let nxt = curr === "" ? "X" : (curr === "X" ? "O" : ""); window.murdleState[k] = nxt; showPage('detective', document.querySelector('.detective-btn')); }
function renderQuestCard(u, t, ok) { if(!ok) return `<div class="content-card" style="opacity:0.5;"><h3>Unit ${u}: ${t} 🔒</h3></div>`; return `<div class="content-card"><h3>Unit ${u}: ${t}</h3><button class="btn-p" onclick="openQuestDetail('unit${u}')">ENTER</button></div>`; }

function uploadDrive(inputId, missionId) {
    const file = document.getElementById(inputId).files[0]; if(!file) return alert("เลือกไฟล์!");
    const reader = new FileReader(); reader.readAsDataURL(file);
    reader.onload = function() {
        const payload = { file: reader.result, filename: file.name, missionId: missionId, studentName: userData.name };
        fetch(GAS_URL, { method: "POST", body: JSON.stringify(payload) }).then(res => res.text()).then(resp => {
            if(resp === "Success") { let sm = userData.submittedMissions || []; sm.push(missionId); db.collection("students").doc(userData.studentId).update({ submittedMissions: sm }).then(() => showPage('quests', document.querySelectorAll('.nav-btn')[2])); }
        });
    };
}
function buyItem(id, cost) { if(userData.mana >= cost) { let inv = userData.inventory || []; inv.push(id); db.collection("students").doc(userData.studentId).update({ mana: userData.mana - cost, inventory: inv }); } }
function equipItem(id, type, val) { let upd = {}; if(type==='title') upd.equippedTitle = val; if(type==='glow') upd.equippedGlow = val; if(type==='frame') upd.equippedFrame = val; db.collection("students").doc(userData.studentId).update(upd); }
