// ==========================================
// 🚨 ตั้งค่า URL จาก Google Apps Script ที่นี่ 🚨
// ==========================================
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

// --- ตัวแปรระบบ ---
let userData = null;
let quizData = {};
let questStatus = { 
    unit1_m1: false, unit1_m2: false, unit2_m1: false, unit2_m2: false, unit3_m1: false, unit3_m2: false, 
    boss_unit1: false, boss_unit2: false, boss_unit3: false, 
    unit1: false, unit2: false, unit3: false 
};
let lessonsData = { unit1: [], unit2: [], unit3: [] };
let announcements = [];

const CASES_DB = [
    { 
        title: "คดีที่ 1: ปริศนาขโมยซอร์สโค้ด", 
        story: "เมื่อคืนเกิดเหตุคนร้ายขโมยซอร์สโค้ดระบบตัดเกรดของโรงเรียน! ใคร ก่อเหตุที่ ไหน และใช้อะไร?", 
        suspects: ["นาย A", "นางสาว B", "เด็กชาย C", "นาง D"], 
        locations: ["ห้องเซิร์ฟเวอร์", "ห้องพักครู", "สวน", "โรงอาหาร"], 
        weapons: ["แฟลชไดรฟ์", "แล็ปท็อป", "มือถือ", "แท็บเล็ต"], 
        clues: [
            "1. 'เด็กชาย C' หิวมาก จึงเดินไปที่ 'โรงอาหาร'", 
            "2. มีคนลืม 'แท็บเล็ต' ทิ้งไว้ที่ 'โรงอาหาร'", 
            "3. 'นาง D' นั่งตรวจงานอยู่ที่ 'ห้องพักครู' ตลอดเวลา", 
            "4. คนที่อยู่ 'ห้องพักครู' ใช้ 'แล็ปท็อป' ทำงาน", 
            "5. ผู้ที่ขโมยข้อมูลแอบเข้าไปใน 'ห้องเซิร์ฟเวอร์'", 
            "6. ผู้ที่ขโมยข้อมูลใช้ 'แฟลชไดรฟ์' เซฟไฟล์หนีไป", 
            "7. 'นางสาว B' ไม่มี 'มือถือ' และไม่ได้ใช้ 'แท็บเล็ต'", 
            "8. 'นาย A' ไม่เคยเดินไปที่ 'ห้องพักครู' หรือ 'โรงอาหาร'", 
            "9. คนที่อยู่ 'สวน' ไม่ได้ใช้ 'แล็ปท็อป' และ 'แท็บเล็ต'", 
            "10. รปภ. ยืนยันว่า 'นางสาว B' แอบเข้าไปใน 'ห้องเซิร์ฟเวอร์'"
        ], 
        ansWho: "นางสาว B", ansWhere: "ห้องเซิร์ฟเวอร์", ansWhat: "แฟลชไดรฟ์" 
    },
    { 
        title: "คดีที่ 2: แฮกเกอร์ป่วนเว็บโรงเรียน", 
        story: "หน้าเว็บโรงเรียนถูกแฮกเปลี่ยนรูปภาพเป็นมีมตลก! ใครคือแฮกเกอร์ตัวจริง?", 
        suspects: ["ประธานสภา", "หัวหน้าห้อง", "ภารโรง", "ครูฝึกสอน"], 
        locations: ["ห้องสมุด", "ห้องคอมฯ", "ดาดฟ้า", "สนามบาส"], 
        weapons: ["สมาร์ทวอทช์", "มินิพีซี", "แว่นตาอัจฉริยะ", "โน้ตบุ๊ก"], 
        clues: [
            "1. 'ครูฝึกสอน' ไปคุมเด็กเล่นกีฬาที่ 'สนามบาส'", 
            "2. มีคนลืม 'แว่นตาอัจฉริยะ' ไว้ที่ 'ดาดฟ้า'", 
            "3. 'ภารโรง' กำลังทำความสะอาดอยู่ที่ 'ดาดฟ้า'", 
            "4. คนที่นั่งใน 'ห้องสมุด' ใช้ 'โน้ตบุ๊ก' พิมพ์รายงาน", 
            "5. 'ประธานสภา' นั่งเงียบๆ อยู่ใน 'ห้องสมุด'", 
            "6. แฮกเกอร์ใช้ 'มินิพีซี' ในการแฮกระบบ", 
            "7. แฮกเกอร์แอบต่อเน็ตจาก 'ห้องคอมฯ'", 
            "8. คนที่อยู่ 'สนามบาส' ใช้ 'สมาร์ทวอทช์' จับเวลา", 
            "9. 'หัวหน้าห้อง' ไม่ได้ใช้สมาร์ทวอทช์และโน้ตบุ๊ก", 
            "10. 'หัวหน้าห้อง' แอบอยู่ในห้องคอมฯคนเดียว"
        ], 
        ansWho: "หัวหน้าห้อง", ansWhere: "ห้องคอมฯ", ansWhat: "มินิพีซี" 
    },
    { 
        title: "คดีที่ 3: ไวรัสลบการบ้าน", 
        story: "การบ้านวิทยาการคำนวณของเด็ก ม.2 ถูกไวรัสลบเกลี้ยง! ใครเป็นคนทำ?", 
        suspects: ["สมชาย", "สมหญิง", "สมศักดิ์", "สมปอง"], 
        locations: ["โต๊ะหินอ่อน", "ใต้บันได", "ห้องพยาบาล", "ห้องดนตรี"], 
        weapons: ["ทรัมบ์ไดรฟ์", "อีเมลสแปม", "โดรน", "บลูทูธ"], 
        clues: [
            "1. 'สมหญิง' นอนพักไข้ใน 'ห้องพยาบาล'", 
            "2. คนที่อยู่ 'ห้องพยาบาล' ใช้ 'อีเมลสแปม' ส่งจดหมาย", 
            "3. 'สมชาย' ซ้อมเป่าขลุ่ยอยู่ที่ 'ห้องดนตรี'", 
            "4. คนที่อยู่ 'ห้องดนตรี' กำลังต่อ 'บลูทูธ' ลำโพง", 
            "5. คนที่แอบอยู่ 'ใต้บันได' บังคับ 'โดรน' บินเล่น", 
            "6. 'สมศักดิ์' แอบเล่นอยู่ 'ใต้บันได'", 
            "7. ผู้กระทำผิด นั่งเสียบอุปกรณ์อยู่ที่ 'โต๊ะหินอ่อน'", 
            "8. ไวรัสตัวนี้ถูกปล่อยผ่าน 'ทรัมบ์ไดรฟ์'", 
            "9. 'สมปอง' ไม่ได้ไปห้องพยาบาล ดนตรี หรือใต้บันได", 
            "10. 'สมปอง' เป็นคนเอาทรัมบ์ไดรฟ์มาโรงเรียน"
        ], 
        ansWho: "สมปอง", ansWhere: "โต๊ะหินอ่อน", ansWhat: "ทรัมบ์ไดรฟ์" 
    }
];

let caseStatus = { activeCaseId: 0, cluesToggle: [false,false,false,false,false,false,false,false,false,false], isRevealed: false };
window.murdleState = {}; 

const TEACHER_ID = "pchrkr007";
const ROOMS_LIST = ["London", "Newyork", "Tokyo", "Paris", "Seoul"]; 
let currentTeacherRoom = "London"; 
let teacherChatUnsubscribe = null;

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
    { id: "frame_3", name: "[กรอบ] ไซเบอร์", cost: 1200, type: "frame", value: "frame-cyber", icon: "fa-microchip" }
];

// --- Authentication ---
function handleLoginEnter(e) {
    if (e.key === 'Enter') login();
}

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
            name: name, studentId: id, number: num, room: room, password: pass, 
            level: 1, exp: 0, mana: 0, rank: "Novice", 
            caseAnswer: {who:"",where:"",what:""}, completedBosses: [], submittedMissions: [], returnedMissions: [],
            scores: {s1:0, s2:0, s3:0, mid:0, s4:0, s5:0, s6:0, final:0}, 
            inventory: [], equippedTitle: "", equippedIcon: "", equippedGlow: "", equippedFrame: "", 
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
        });
    }).catch(e => alert(e.message));
}

function logout() { 
    auth.signOut().then(() => window.location.reload()); 
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
            if(userData) {
                applyUserCosmetics(); 
                document.getElementById('st-mp').innerText = userData.mana || 0;
                document.getElementById('st-lv').innerText = userData.level || 1;
                
                if(userId !== TEACHER_ID && document.getElementById('chat-fab').classList.contains('hidden')){
                    document.getElementById('chat-fab').classList.remove('hidden');
                    initTeacherChatListener();
                }
            }
            if(!document.getElementById('game-content').innerHTML) {
                showPage('dashboard', document.querySelector('.nav-btn'));
            }
        });

        if(userId === TEACHER_ID) {
            document.getElementById('teacher-btn').classList.remove('hidden');
            document.getElementById('chat-fab').classList.add('hidden'); 
        }

        setInterval(() => {
            if(!document.hidden && userData && userId !== TEACHER_ID) {
                db.collection("students").doc(userId).update({ lastActive: firebase.firestore.FieldValue.serverTimestamp() });
            }
        }, 60000);
        
        db.collection("settings").doc("quizzes").onSnapshot(doc => { quizData = doc.data() || {}; });
        db.collection("settings").doc("quest_board").onSnapshot(doc => { questStatus = doc.data() || questStatus; });
        db.collection("settings").doc("lessons").onSnapshot(doc => { lessonsData = doc.data() || { unit1:[], unit2:[], unit3:[] }; });
        db.collection("settings").doc("monthly_case").onSnapshot(doc => { 
            let data = doc.data();
            if(data) {
                if(data.activeCaseId === undefined) data.activeCaseId = 0;
                if(!data.cluesToggle) data.cluesToggle = [false,false,false,false,false,false,false,false,false,false];
                caseStatus = data;
            } else {
                db.collection("settings").doc("monthly_case").set(caseStatus);
            }
        });
        db.collection("settings").doc("announcements").onSnapshot(doc => { 
            announcements = (doc.data() || {}).list || []; 
            const annContainer = document.getElementById('dash-announcements');
            if(annContainer) {
                let annHTML = ""; 
                announcements.forEach(a => { 
                    annHTML += `<div style="background:rgba(255,204,0,0.1); border-left:4px solid #ffcc00; padding:10px; margin-bottom:10px; font-size:14px; border-radius:5px;"><i class="fa-solid fa-bullhorn" style="color:#ffcc00;"></i> <b>ประกาศ:</b> ${a}</div>`; 
                });
                annContainer.innerHTML = annHTML;
            }
        });
    }
});

function applyUserCosmetics() {
    let titleStr = userData.equippedTitle ? `[${userData.equippedTitle}]` : "";
    let iconStr = userData.equippedIcon ? `<i class="fa-solid ${userData.equippedIcon}" style="margin-right:5px;"></i>` : "";
    let glowClass = userData.equippedGlow || "";
    
    document.getElementById('st-title').innerText = titleStr;
    document.getElementById('st-name-wrapper').innerHTML = `${iconStr}<span class="${glowClass}">${userData.name}</span>`;
    
    let charNameDisp = document.getElementById('char-name-disp');
    if(charNameDisp) {
        charNameDisp.innerHTML = `${iconStr}<span class="${glowClass}">${userData.name}</span>`;
        let charBox = document.getElementById('char-avatar-box');
        if(charBox) {
            charBox.className = "avatar-box " + (userData.equippedFrame || "");
            charBox.style.width = "100px"; charBox.style.height = "100px"; charBox.style.background = "var(--aqua)";
            charBox.style.margin = "0 auto 20px auto"; charBox.style.display = "flex"; charBox.style.alignItems = "center";
            charBox.style.justifyContent = "center"; charBox.style.fontSize = "40px"; charBox.style.color = "#000";
        }
    }
}

// --- Chat System ---
function toggleChatWidget() {
    const widget = document.getElementById('chat-widget');
    widget.classList.toggle('hidden');
    if(!widget.classList.contains('hidden')) scrollToBottom();
}

function renderChatHistory() {
    const box = document.getElementById('chat-history');
    box.innerHTML = "";
    if(!window.teacherMessages || window.teacherMessages.length === 0) {
        box.innerHTML = `<div style="text-align:center; color:#888; font-size:10px; margin-top:50px;">พิมพ์ข้อความเพื่อแชทกับครูเบียร์</div>`;
    } else {
        window.teacherMessages.forEach(m => {
            let sClass = m.sender === 'teacher' ? 'teacher' : 'me';
            let sName = m.sender === 'teacher' ? '👨‍🏫 ครูเบียร์: ' : '';
            box.innerHTML += `<div class="msg ${sClass}"><b>${sName}</b>${m.text}</div>`;
        });
    }
    scrollToBottom();
}

function scrollToBottom() { 
    const box = document.getElementById('chat-history'); 
    box.scrollTop = box.scrollHeight; 
}

function handleChatEnter(e) { 
    if(e.key === 'Enter') sendChatMessage(); 
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if(!text) return;
    
    db.collection("chats").doc(userData.studentId).collection("messages").add({ 
        sender: 'student', 
        text: text, 
        timestamp: firebase.firestore.FieldValue.serverTimestamp() 
    });
    db.collection("chats").doc(userData.studentId).set({ 
        studentName: userData.name, 
        lastUpdate: firebase.firestore.FieldValue.serverTimestamp() 
    }, {merge: true});
    
    input.value = "";
}

function initTeacherChatListener() {
    db.collection("chats").doc(userData.studentId).collection("messages").orderBy("timestamp", "asc").onSnapshot(snap => {
        window.teacherMessages = [];
        snap.forEach(doc => window.teacherMessages.push(doc.data()));
        if(!document.getElementById('chat-widget').classList.contains('hidden')) {
            renderChatHistory();
        }
    });
}

// --- Main Views ---
function showPage(id, btn) {
    const display = document.getElementById('game-content');
    display.innerHTML = "";
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    window.isDoingQuiz = false;

    let iconStr = userData.equippedIcon ? `<i class="fa-solid ${userData.equippedIcon}" style="margin-right:8px; color:var(--aqua);"></i>` : "";
    let glowClass = userData.equippedGlow || "";
    let frameClass = userData.equippedFrame || "";
    let displayTitle = userData.equippedTitle || userData.rank;
    let borderRadius = frameClass === 'frame-cyber' ? '10%' : '50%';

    if (id === 'dashboard') {
        let pendingTasksHTML = "";
        const sm = userData.submittedMissions || []; 
        const rm = userData.returnedMissions || [];
        const missionsList = ['unit1_m1', 'unit1_m2', 'unit2_m1', 'unit2_m2', 'unit3_m1', 'unit3_m2'];
        
        missionsList.forEach(m => { 
            if(questStatus[m] && !sm.includes(m) && !rm.includes(m)) {
                pendingTasksHTML += `<li>📄 ภารกิจค้างส่ง: ${m.toUpperCase().replace('_',' ')}</li>`; 
            }
        });
        
        if (questStatus.boss_unit1 && !(userData.completedBosses || []).includes('unit1')) pendingTasksHTML += "<li>🔥 บอสค้าง: Unit 1</li>";
        if (questStatus.boss_unit2 && !(userData.completedBosses || []).includes('unit2')) pendingTasksHTML += "<li>🔥 บอสค้าง: Unit 2</li>";
        if (questStatus.boss_unit3 && !(userData.completedBosses || []).includes('unit3')) pendingTasksHTML += "<li>🔥 บอสค้าง: Unit 3</li>";
        
        const hasAns = userData.caseAnswer && userData.caseAnswer.who;
        if (!caseStatus.isRevealed && !hasAns) pendingTasksHTML += "<li>🕵️‍♂️ แฟ้มคดี: ยังไม่ได้ระบุตัวคนร้ายในเดือนนี้!</li>";
        
        if (pendingTasksHTML === "") pendingTasksHTML = "<li style='color:var(--p-green);'>เยี่ยมมาก! ไม่มีงานค้างเลย</li>";

        let annHTML = "";
        if (announcements.length > 0) {
            announcements.forEach(a => { 
                annHTML += `<div style="background:rgba(255,204,0,0.1); border-left:4px solid #ffcc00; padding:10px; margin-bottom:10px; font-size:14px; border-radius:5px;"><i class="fa-solid fa-bullhorn" style="color:#ffcc00;"></i> <b>ประกาศ:</b> ${a}</div>`; 
            });
        }

        display.innerHTML = `
            <h2 class="pixel-font aqua-glow">>>> Dashboard</h2>
            <div style="background:rgba(255,255,255,0.05); padding:30px; border-radius:15px; border:1px solid var(--glass-border); line-height:1.8;">
                <p style="font-size:20px;">ยินดีต้อนรับนักรบ ${iconStr}<span class="${glowClass}">${userData.name}</span></p>
                <div id="dash-announcements" style="margin-top:20px;">${annHTML}</div>
                <div style="background:rgba(0,0,0,0.5); padding:15px; border-left:4px solid var(--alert-red); margin-top:20px;">
                    <h3 class="pixel-font" style="font-size:12px; color:var(--alert-red); margin-top:0;">[ PENDING TASKS / งานค้างของคุณ ]</h3>
                    <ul style="color:#ddd; font-size:14px; line-height:2;">${pendingTasksHTML}</ul>
                </div>
            </div>`;
    }

    else if (id === 'shop') {
        let shopHTML = `<h2 class="pixel-font" style="color:#ffcc00; text-shadow:0 0 10px #ffcc00;">>>> Mana Shop</h2>
                        <p style="color:#aaa;">ซื้อของตกแต่งโปรไฟล์! (MP ปัจจุบัน: <span style="color:var(--aqua); font-weight:bold;">${userData.mana}</span>)</p>
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-top:20px;">`;
        
        SHOP_ITEMS.forEach(item => {
            const isBought = (userData.inventory || []).includes(item.id);
            let isEquipped = false;
            if(item.type === 'title') isEquipped = userData.equippedTitle === item.value;
            if(item.type === 'icon') isEquipped = userData.equippedIcon === item.value;
            if(item.type === 'glow') isEquipped = userData.equippedGlow === item.value;
            if(item.type === 'frame') isEquipped = userData.equippedFrame === item.value;

            let btnHTML = "";
            if(isEquipped) {
                btnHTML = `<button class="btn-p pixel-font" style="background:#444; color:#fff; width:100%; font-size:10px; cursor:default;" disabled>กำลังใช้งาน</button>`;
            } else if (isBought) {
                btnHTML = `<button class="btn-p pixel-font" style="background:var(--p-green); width:100%; font-size:10px;" onclick="equipItem('${item.id}', '${item.type}', '${item.value}')">สวมใส่</button>`;
            } else {
                const canAfford = userData.mana >= item.cost;
                btnHTML = `<button class="btn-p pixel-font" style="background:${canAfford?'#ffcc00':'#444'}; color:#000; width:100%; font-size:10px;" ${canAfford?'':'disabled'} onclick="buyItem('${item.id}', ${item.cost})">ซื้อเลย</button>`;
            }
            let previewClass = item.type === 'glow' ? item.value : '';
            let framePrClass = item.type === 'frame' ? item.value : '';
            
            shopHTML += `
                <div class="shop-card ${framePrClass}" style="margin-bottom:10px;">
                    <i class="fa-solid ${item.icon} ${previewClass}"></i>
                    <h3 class="${previewClass}" style="font-size:14px; margin:0;">${item.name}</h3>
                    <div class="shop-price">${item.cost} MP</div>
                    ${btnHTML}
                </div>`;
        });
        display.innerHTML = shopHTML + "</div>";
    }

    else if (id === 'lessons') {
        let lessonHTML = `<h2 class="pixel-font aqua-glow">>>> Lessons (สื่อการสอน)</h2>`;
        ['unit1', 'unit2', 'unit3'].forEach((u, idx) => {
            lessonHTML += `<h3 class="pixel-font" style="color:var(--aqua); margin-top:30px;">Unit ${idx+1}</h3>`;
            const items = lessonsData[u] || [];
            if(items.length === 0) {
                lessonHTML += `<p style="color:#aaa;">ยังไม่มีเนื้อหาในบทเรียนนี้</p>`;
            } else {
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
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-top:20px;">
                ${renderQuestCard(1, "แนวคิดเชิงคำนวณ", questStatus.unit1)}
                ${renderQuestCard(2, "การออกแบบอัลกอริทึม", questStatus.unit2)}
                ${renderQuestCard(3, "การเขียนโปรแกรม Python", questStatus.unit3)}
            </div>`;
    }

    else if (id === 'detective') {
        window.isDoingQuiz = true;
        const currentCase = CASES_DB[caseStatus.activeCaseId] || CASES_DB[0];
        const hasAns = userData.caseAnswer && userData.caseAnswer.who;
        
        let resultUI = "";
        if(caseStatus.isRevealed) {
            const isCorrect = (userData.caseAnswer.who === currentCase.ansWho && userData.caseAnswer.where === currentCase.ansWhere && userData.caseAnswer.what === currentCase.ansWhat);
            resultUI = `
                <div style="background:${isCorrect ? 'rgba(0,255,65,0.1)' : 'rgba(255,51,102,0.1)'}; border:2px solid ${isCorrect ? '#00ff41' : 'var(--alert-red)'}; padding:20px; border-radius:10px; margin-bottom:20px; text-align:center;">
                    <h3 class="pixel-font" style="color:${isCorrect ? '#00ff41':'var(--alert-red)'};">${isCorrect ? 'MISSION CLEARED! 🎉' : 'MISSION FAILED! 😭'}</h3>
                    <p>ความจริงคือ: ${currentCase.ansWho} ก่อเหตุที่ ${currentCase.ansWhere} โดยใช้ ${currentCase.ansWhat}</p>
                    <p style="color:#aaa;">คำตอบของคุณ: ${userData.caseAnswer.who} / ${userData.caseAnswer.where} / ${userData.caseAnswer.what}</p>
                </div>`;
        }

        let cluesHTML = "";
        caseStatus.cluesToggle.forEach((isOpen, idx) => {
            if(isOpen && currentCase.clues[idx]) {
                cluesHTML += `<p style="font-size:12px; color:#fff; border-left:2px solid var(--aqua); padding-left:10px;">${currentCase.clues[idx]}</p>`;
            }
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
                        <tr>
                            <th class="empty-cell"></th>
                            <th colspan="4" class="header-group" style="background:#222; border-right:3px solid #666;">สถานที่เกิดเหตุ (WHERE)</th>
                            <th colspan="4" class="header-group" style="background:#222;">อุปกรณ์ที่ใช้ (WHAT)</th>
                        </tr>
                        <tr>
                            <th style="background:#111;"></th>
                            <th>${currentCase.locations[0]}</th><th>${currentCase.locations[1]}</th><th>${currentCase.locations[2]}</th><th style="border-right:3px solid #666;">${currentCase.locations[3]}</th>
                            <th>${currentCase.weapons[0]}</th><th>${currentCase.weapons[1]}</th><th>${currentCase.weapons[2]}</th><th>${currentCase.weapons[3]}</th>
                        </tr>
                        ${[0,1,2,3].map(r => `<tr><th style="background:rgba(0,255,255,0.1);">${currentCase.suspects[r]}</th>${[0,1,2,3,4,5,6,7].map(c => getCell(r,c,c===3)).join('')}</tr>`).join('')}
                        <tr><td colspan="9" class="empty-cell" style="height:10px; border-bottom:3px solid #666; border-top:3px solid #666;"></td></tr>
                        ${[0,1,2,3].map(r => `<tr><th style="background:rgba(0,255,255,0.1);">${currentCase.weapons[r]}</th>${[0,1,2,3].map(c => getCell(r+4,c,c===3)).join('')}<td colspan="4" class="empty-cell"></td></tr>`).join('')}
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
                        <select id="ansWho">${optWho}</select>
                        <select id="ansWhere">${optWhere}</select>
                        <select id="ansWhat">${optWhat}</select>
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
                    <div id="char-avatar-box" class="avatar-box ${frameClass}" style="width:100px; height:100px; background:var(--aqua); margin:0 auto 20px auto; display:flex; align-items:center; justify-content:center; font-size:40px; color:#000; border-radius:${borderRadius};">
                        <i class="fa-solid fa-user-astronaut"></i>
                    </div>
                    <h3 id="char-name-disp" style="margin:0; font-size:22px;">${iconStr}<span class="${glowClass}">${userData.name}</span></h3>
                    <p class="pixel-font" style="color:#ffcc00; font-size:10px; margin-top:10px; text-shadow:0 0 5px #ffcc00;">${displayTitle}</p>
                    <p style="color:#aaa; font-size:14px;">ID: ${userData.studentId} | ห้อง: ${userData.room||'-'} | เลขที่: ${userData.number||'-'}</p>
                </div>
                <div style="flex:2; min-width:300px;">
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap:15px; margin-bottom:20px;">
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
                <button class="btn-p pixel-font" style="background:#ffcc00; color:#000; font-size:9px;" onclick="viewTeacher('students')">โปรไฟล์เด็ก</button>
                <button class="btn-p pixel-font" style="background:#00ff41; color:#000; font-size:9px;" onclick="viewTeacher('online')">เช็คออนไลน์</button>
                <button class="btn-p pixel-font" style="background:var(--aqua); color:#000; font-size:9px;" onclick="viewTeacher('grading')">สมุดคะแนน</button>
                <button class="btn-p pixel-font" style="background:#ff33cc; color:#fff; font-size:9px;" onclick="viewTeacher('assignments')">ตรวจงาน</button>
                <button class="btn-p pixel-font" style="background:#fff; color:#000; font-size:9px;" onclick="viewTeacher('chat')">แชท 1-on-1</button>
                <button class="btn-p pixel-font" style="background:#ff9900; color:#000; font-size:9px;" onclick="viewTeacher('announcements')">ประกาศ</button>
                <button class="btn-p pixel-font" style="background:var(--aqua); color:#000; font-size:9px;" onclick="viewTeacher('lessons')">สื่อการสอน</button>
                <button class="btn-p pixel-font" style="background:var(--aqua); color:#000; font-size:9px;" onclick="viewTeacher('quizzes')">ข้อสอบบอส</button>
                <button class="btn-p pixel-font" style="background:var(--detective-purple); color:#fff; font-size:9px;" onclick="viewTeacher('detective')">คดีสืบสวน</button>
                <button class="btn-p pixel-font" style="background:var(--alert-red); color:#fff; font-size:9px; border-color:var(--alert-red);" onclick="viewTeacher('quests')">เปิด/ปิดระบบ</button>
            </div>
            <div id="teacher-view"></div>`;
        viewTeacher('students');
    }
}

// 🌟 ระบบจัดกลุ่มแท็บห้องเรียนสำหรับแผงควบคุม 🌟
function generateRoomTabs(activeView) {
    let html = `<div style="display:flex; gap:5px; margin-bottom:15px; overflow-x:auto; padding-bottom:5px;">`;
    const allRooms = [...ROOMS_LIST, "อื่นๆ"];
    allRooms.forEach(r => {
        let bg = r === currentTeacherRoom ? 'var(--aqua)' : '#444';
        let color = r === currentTeacherRoom ? '#000' : '#fff';
        html += `<button class="btn-p" style="padding:8px 15px; font-size:10px; border-radius:5px; background:${bg}; color:${color}; white-space:nowrap;" onclick="switchTeacherRoom('${activeView}', '${r}')">🏠 ${r}</button>`;
    });
    html += `</div>`;
    return html;
}

function switchTeacherRoom(activeView, roomName) { 
    currentTeacherRoom = roomName; 
    viewTeacher(activeView); 
}

function generateGroupedTables(studentsList, renderRowFunc, headerHTML, emptyText = "ยังไม่มีข้อมูล") {
    let fList = currentTeacherRoom === 'อื่นๆ' ? studentsList.filter(s => !ROOMS_LIST.includes(s.room)) : studentsList.filter(s => s.room === currentTeacherRoom);
    
    let html = `<h4 style="color:var(--aqua); border-bottom:1px solid #444; padding-bottom:5px; margin-top:20px;">รายชื่อนักเรียนห้อง ${currentTeacherRoom}</h4>`;
    
    if (fList.length === 0) {
        html += `<p style="color:#555; font-size:12px;">${emptyText}</p>`;
    } else {
        html += `<div style="overflow-x:auto;"><table class="admin-table" style="min-width:800px;">${headerHTML}`;
        fList.forEach(s => { html += renderRowFunc(s); });
        html += `</table></div>`;
    }
    return html;
}

// --- Teacher Views Logic ---
function viewTeacher(v) {
    const box = document.getElementById('teacher-view'); 
    box.innerHTML = "Loading...";

    if (v === 'students') {
        db.collection("students").where("studentId", "!=", TEACHER_ID).get().then(snap => {
            let studentsList = [];
            snap.forEach(doc => studentsList.push(doc.data()));
            studentsList.sort((a,b) => (parseInt(a.number)||0) - (parseInt(b.number)||0));

            const addForm = `<div style="background:rgba(255,204,0,0.1); border:1px dashed #ffcc00; padding:15px; border-radius:10px; margin-bottom:20px;">
                <h4 style="margin-top:0; color:#ffcc00;">➕ เพิ่มนักเรียนเข้าฐานข้อมูลด้วยตัวเอง</h4>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap:10px;">
                    <input id="tAddName" placeholder="ชื่อ-สกุล"><input id="tAddId" placeholder="User(รหัส)"><input id="tAddPass" placeholder="Password">
                    <select id="tAddRoom"><option value="London">London</option><option value="Newyork">Newyork</option><option value="Tokyo">Tokyo</option><option value="Paris">Paris</option><option value="Seoul">Seoul</option></select>
                    <input id="tAddNum" type="number" placeholder="เลขที่"><button class="btn-p" style="background:#ffcc00; color:#000;" onclick="teacherCreateStudent()">สร้างข้อมูล</button>
                </div>
            </div>`;
            
            const header = `<tr><th>ห้อง</th><th>เลขที่</th><th>รหัส(User)</th><th>รหัสผ่าน</th><th>ชื่อ-สกุล</th><th>LV/EXP</th><th>MP</th><th>Action</th></tr>`;
            const renderRow = (s) => `<tr>
                <td>
                    <select class="edit-input" style="width:75px;" id="r_${s.studentId}">
                        <option value="London" ${s.room==='London'?'selected':''}>London</option><option value="Newyork" ${s.room==='Newyork'?'selected':''}>Newyork</option><option value="Tokyo" ${s.room==='Tokyo'?'selected':''}>Tokyo</option><option value="Paris" ${s.room==='Paris'?'selected':''}>Paris</option><option value="Seoul" ${s.room==='Seoul'?'selected':''}>Seoul</option>
                        <option value="${s.room}" ${!ROOMS_LIST.includes(s.room)?'selected':''} style="display:${!ROOMS_LIST.includes(s.room)?'block':'none'}">${s.room}</option>
                    </select>
                </td>
                <td><input type="number" class="edit-input" style="width:50px;" id="n_${s.studentId}" value="${s.number||''}"></td>
                <td>${s.studentId}</td>
                <td><input type="text" class="edit-input" style="width:70px;" id="pass_${s.studentId}" value="${s.password||''}"></td>
                <td><input type="text" class="name-input" style="width:120px;" id="name_${s.studentId}" value="${s.name}"></td>
                <td><div style="display:flex; gap:5px;"><input type="number" class="edit-input" style="width:40px;" id="lv_${s.studentId}" value="${s.level||1}"><input type="number" class="edit-input" style="width:50px;" id="exp_${s.studentId}" value="${s.exp||0}"></div></td>
                <td><input type="number" class="edit-input" style="width:50px;" id="mp_${s.studentId}" value="${s.mana||0}"></td>
                <td>
                    <button class="btn-p" style="padding:8px; font-size:10px;" onclick="saveStudentProfile('${s.studentId}')">Save</button> 
                    <button class="btn-p btn-danger" style="padding:8px; font-size:10px;" onclick="deleteStudent('${s.studentId}','${s.name}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
            
            box.innerHTML = addForm + `<h3 class="pixel-font" style="font-size:12px; color:#ffcc00;">แก้ไขโปรไฟล์ & จัดการนักเรียน</h3>` + generateRoomTabs('students') + generateGroupedTables(studentsList, renderRow, header);
        });
    }
    else if (v === 'online') {
        db.collection("students").where("studentId", "!=", TEACHER_ID).get().then(snap => {
            let studentsList = [];
            let now = new Date();
            snap.forEach(doc => {
                let s = doc.data(); 
                s.isOnline = s.lastActive && ((now - s.lastActive.toDate()) / 60000 <= 2); 
                studentsList.push(s);
            });
            studentsList.sort((a,b) => {
                if(a.isOnline === b.isOnline) return (parseInt(a.number)||0) - (parseInt(b.number)||0);
                return a.isOnline ? -1 : 1;
            });

            const header = `<tr><th>Status</th><th>เลขที่</th><th>รหัส</th><th>ชื่อ-สกุล</th><th>ใช้งานล่าสุด</th></tr>`;
            const renderRow = (s) => {
                let statusIcon = s.isOnline ? `<i class="fa-solid fa-circle" style="color:#00ff41;"></i> (กำลังเล่น)` : `<i class="fa-regular fa-circle" style="color:#555;"></i> (ออฟไลน์)`;
                let timeStr = s.lastActive ? s.lastActive.toDate().toLocaleTimeString('th-TH') : 'ไม่มีข้อมูล';
                return `<tr><td>${statusIcon}</td><td>${s.number||'-'}</td><td>${s.studentId}</td><td>${s.name}</td><td>${timeStr}</td></tr>`;
            };

            box.innerHTML = `<div style="background:rgba(0,255,65,0.1); padding:20px; border-radius:10px; border:1px solid #00ff41;"><h3 class="pixel-font" style="font-size:12px; color:#00ff41;">เรดาร์ตรวจสอบการออนไลน์ (อัปเดตทุก 1 นาที)</h3>${generateRoomTabs('online')}${generateGroupedTables(studentsList, renderRow, header)}</div>`;
        });
    }
    else if(v === 'grading') {
        db.collection("students").where("studentId", "!=", TEACHER_ID).get().then(snap => {
            let studentsList = [];
            snap.forEach(doc => studentsList.push(doc.data()));
            studentsList.sort((a,b) => (parseInt(a.number)||0) - (parseInt(b.number)||0));

            const header = `<tr><th rowspan="2">เลขที่</th><th rowspan="2">ชื่อ-สกุล</th>
                <th colspan="4" style="text-align:center; background:rgba(0,255,255,0.1);">ก่อนกลางภาค</th><th rowspan="2">กลางภาค(20)</th>
                <th colspan="4" style="text-align:center; background:rgba(255,204,0,0.1);">หลังกลางภาค</th><th rowspan="2">ปลายภาค(20)</th><th rowspan="2" style="background:var(--p-green); color:#000;">รวม(100)</th></tr>
                <tr><th>ช.1(10)</th><th>ช.2(10)</th><th>ช.3(10)</th><th style="color:var(--aqua);">รวม(30)</th><th>ช.4(10)</th><th>ช.5(10)</th><th>ช.6(10)</th><th style="color:#ffcc00;">รวม(30)</th></tr>`;
            
            const renderRow = (s) => {
                let sc = s.scores || {s1:0,s2:0,s3:0,mid:0,s4:0,s5:0,s6:0,final:0};
                let preMid = (parseFloat(sc.s1)||0) + (parseFloat(sc.s2)||0) + (parseFloat(sc.s3)||0);
                let postMid = (parseFloat(sc.s4)||0) + (parseFloat(sc.s5)||0) + (parseFloat(sc.s6)||0);
                let total = preMid + postMid + (parseFloat(sc.mid)||0) + (parseFloat(sc.final)||0);
                return `<tr>
                    <td>${s.number||'-'}</td><td style="white-space:nowrap;">${s.name}</td>
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
            };
            box.innerHTML = `<h3 class="pixel-font" style="font-size:12px; color:#00ff41;">ระบบบันทึกคะแนน</h3>${generateRoomTabs('grading')}${generateGroupedTables(studentsList, renderRow, header)}`;
        });
    }
    else if (v === 'assignments') {
        db.collection("students").where("studentId", "!=", TEACHER_ID).get().then(snap => {
            let studentsList = [];
            snap.forEach(doc => studentsList.push(doc.data()));
            studentsList.sort((a,b) => (parseInt(a.number)||0) - (parseInt(b.number)||0));

            const header = `<tr><th>เลขที่</th><th>ชื่อ-สกุล</th><th>U1-M1</th><th>U1-M2</th><th>U2-M1</th><th>U2-M2</th><th>U3-M1</th><th>U3-M2</th></tr>`;
            const missions = ['unit1_m1', 'unit1_m2', 'unit2_m1', 'unit2_m2', 'unit3_m1', 'unit3_m2'];

            const renderRow = (s) => {
                let sm = s.submittedMissions || []; 
                let rm = s.returnedMissions || [];
                let row = `<tr><td>${s.number||'-'}</td><td style="white-space:nowrap;">${s.name}</td>`;
                
                missions.forEach(m => {
                    if (rm.includes(m)) {
                        row += `<td style="color:#33ccff; text-align:center; font-size:10px;">🔄 ส่งคืนแล้ว</td>`;
                    } else if (sm.includes(m)) {
                        row += `<td><button class="btn-p" style="background:#00ff41; color:#000; padding:5px 10px; font-size:10px; white-space:nowrap;" onclick="returnWork('${s.studentId}', '${m}', '${s.name}')">✅ ส่งแล้ว</button></td>`;
                    } else {
                        row += `<td style="color:#555; text-align:center; font-size:10px;">❌ ยังไม่ส่ง</td>`;
                    }
                });
                return row + `</tr>`;
            };
            box.innerHTML = `<h3 class="pixel-font" style="font-size:12px; color:#ff33cc;">สถานะการส่งงาน & คืนงาน</h3>${generateRoomTabs('assignments')}${generateGroupedTables(studentsList, renderRow, header)}`;
        });
    }
    else if (v === 'announcements') {
        let annHTML = "";
        announcements.forEach((a, i) => {
            annHTML += `
            <div style="background:rgba(255,255,255,0.05); border:1px solid #444; padding:15px; margin-bottom:10px; display:flex; gap:10px; align-items:center;">
                <input type="text" id="ann_edit_${i}" value="${a}" style="flex:1; margin:0; background:rgba(0,0,0,0.5); border:1px solid var(--glass-border); color:#fff; padding:10px;">
                <button class="btn-p" style="padding:10px; font-size:12px;" onclick="editAnnounce(${i})"><i class="fa-solid fa-save"></i> บันทึก</button>
                <button class="btn-p btn-danger" style="padding:10px;" onclick="delAnnounce(${i})"><i class="fa-solid fa-trash"></i></button>
            </div>`;
        });
        box.innerHTML = `
            <div style="background:rgba(255,153,0,0.1); border:1px solid #ff9900; padding:20px; border-radius:10px;">
                <h3 class="pixel-font" style="font-size:12px; color:#ff9900;">จัดการประกาศหน้า Dashboard</h3>
                <div style="display:flex; gap:10px; margin-bottom:20px;">
                    <input type="text" id="new-announce" placeholder="พิมพ์ประกาศใหม่ที่นี่..." style="margin:0; padding:10px;" onkeypress="if(event.key==='Enter') addAnnounce();">
                    <button class="btn-p pixel-font" style="background:#ff9900; color:#000; font-size:10px; margin:0; padding:10px 20px;" onclick="addAnnounce()">เพิ่มประกาศ</button>
                </div>
                ${annHTML}
            </div>`;
    }
    else if (v === 'chat') {
        db.collection("chats").orderBy("lastUpdate", "desc").get().then(snap => {
            let listHTML = "";
            snap.forEach(doc => {
                let d = doc.data();
                listHTML += `<div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; margin-bottom:10px; cursor:pointer; border:1px solid var(--glass-border);" onclick="openTeacherChat('${doc.id}', '${d.studentName}')"><i class="fa-solid fa-user"></i> ${d.studentName} (รหัส: ${doc.id})</div>`;
            });
            box.innerHTML = `<h3 class="pixel-font" style="font-size:12px;">กล่องข้อความจากนักเรียน</h3><div style="display:flex; gap:20px;"><div style="flex:1; max-height:400px; overflow-y:auto;">${listHTML||'<p>ยังไม่มีข้อความ</p>'}</div><div style="flex:2; background:#000; border-radius:10px; padding:20px; display:flex; flex-direction:column; height:400px;" id="t-chat-window">คลิกที่ชื่อนักเรียนเพื่อเริ่มแชท</div></div>`;
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
            toggleBtns += `<button class="btn-p" style="font-size:9px; padding:10px; background:${isOpen?'var(--aqua)':'#444'}; color:${isOpen?'#000':'#fff'};" onclick="toggleClue(${i})">คำใบ้ ${i+1}</button>`;
        }
        let caseOptions = CASES_DB.map((c, i) => `<option value="${i}" ${caseStatus.activeCaseId === i ? 'selected' : ''}>${c.title}</option>`).join('');
        
        box.innerHTML = `
            <div style="background:rgba(179,102,255,0.1); border:1px solid var(--detective-purple); padding:20px; border-radius:10px;">
                <h3 class="pixel-font" style="font-size:12px; color:var(--detective-purple);">ควบคุมแฟ้มคดีสืบสวน</h3>
                <label style="font-size:12px;">เลือกคดีให้เด็กเล่น (เปลี่ยนคดีจะรีเซ็ตคำใบ้และปิดเฉลย)</label>
                <select onchange="changeActiveCase(this.value)" style="background:#000; margin-bottom:20px;">${caseOptions}</select>
                <p style="font-size:12px;">โชว์/ซ่อนคำใบ้ให้นักเรียนเห็น</p>
                <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:20px;">${toggleBtns}</div>
                <hr style="border-color:#444;">
                <button class="btn-p" style="width:100%; background:${caseStatus.isRevealed?'var(--alert-red)':'var(--detective-purple)'};" onclick="toggleSetting('monthly_case', 'isRevealed')">${caseStatus.isRevealed ? 'ปิดการเฉลย' : '📢 กดปุ่มประกาศเฉลยให้เด็กเห็น'}</button>
            </div>`;
    }
    else if(v === 'quests') {
        box.innerHTML = `
            <div style="background:rgba(0,255,255,0.1); border:1px solid var(--aqua); padding:20px; border-radius:10px; margin-bottom:20px;">
                <h3 class="pixel-font" style="font-size:12px; color:var(--aqua);">เปิด/ปิด การส่งงาน (ภารกิจย่อย)</h3>
                
                <p style="font-size:12px; color:#aaa; margin-top:15px;">UNIT 1: แนวคิดเชิงคำนวณ</p>
                <div style="display:flex; gap:10px;">
                    <button class="btn-p" style="flex:1; background:${questStatus.unit1_m1?'var(--aqua)':'#444'}; color:${questStatus.unit1_m1?'#000':'#fff'}; font-size:10px;" onclick="toggleSetting('quest_board', 'unit1_m1')">ภารกิจที่ 1</button>
                    <button class="btn-p" style="flex:1; background:${questStatus.unit1_m2?'var(--aqua)':'#444'}; color:${questStatus.unit1_m2?'#000':'#fff'}; font-size:10px;" onclick="toggleSetting('quest_board', 'unit1_m2')">ภารกิจที่ 2</button>
                </div>
                
                <p style="font-size:12px; color:#aaa; margin-top:15px;">UNIT 2: การออกแบบอัลกอริทึม</p>
                <div style="display:flex; gap:10px;">
                    <button class="btn-p" style="flex:1; background:${questStatus.unit2_m1?'var(--aqua)':'#444'}; color:${questStatus.unit2_m1?'#000':'#fff'}; font-size:10px;" onclick="toggleSetting('quest_board', 'unit2_m1')">ภารกิจที่ 1</button>
                    <button class="btn-p" style="flex:1; background:${questStatus.unit2_m2?'var(--aqua)':'#444'}; color:${questStatus.unit2_m2?'#000':'#fff'}; font-size:10px;" onclick="toggleSetting('quest_board', 'unit2_m2')">ภารกิจที่ 2</button>
                </div>

                <p style="font-size:12px; color:#aaa; margin-top:15px;">UNIT 3: Python</p>
                <div style="display:flex; gap:10px;">
                    <button class="btn-p" style="flex:1; background:${questStatus.unit3_m1?'var(--aqua)':'#444'}; color:${questStatus.unit3_m1?'#000':'#fff'}; font-size:10px;" onclick="toggleSetting('quest_board', 'unit3_m1')">ภารกิจที่ 1</button>
                    <button class="btn-p" style="flex:1; background:${questStatus.unit3_m2?'var(--aqua)':'#444'}; color:${questStatus.unit3_m2?'#000':'#fff'}; font-size:10px;" onclick="toggleSetting('quest_board', 'unit3_m2')">ภารกิจที่ 2</button>
                </div>
                
                <hr style="border-color:#444; margin:20px 0;">
                <p style="font-size:12px; color:#aaa;">การเปิดล็อคประตูใหญ่ (ให้เด็กเข้าดูรายละเอียดใน Unit นั้นได้)</p>
                <div style="display:flex; gap:10px;">
                    <button class="btn-p" style="flex:1; background:${questStatus.unit1?'var(--p-green)':'#444'}; color:${questStatus.unit1?'#000':'#fff'}; font-size:10px;" onclick="toggleSetting('quest_board', 'unit1')">ปลดล็อค Unit 1</button>
                    <button class="btn-p" style="flex:1; background:${questStatus.unit2?'var(--p-green)':'#444'}; color:${questStatus.unit2?'#000':'#fff'}; font-size:10px;" onclick="toggleSetting('quest_board', 'unit2')">ปลดล็อค Unit 2</button>
                    <button class="btn-p" style="flex:1; background:${questStatus.unit3?'var(--p-green)':'#444'}; color:${questStatus.unit3?'#000':'#fff'}; font-size:10px;" onclick="toggleSetting('quest_board', 'unit3')">ปลดล็อค Unit 3</button>
                </div>
            </div>
            
            <div style="background:rgba(255,51,102,0.1); border:1px solid var(--alert-red); padding:20px; border-radius:10px;">
                <h3 class="pixel-font" style="font-size:12px; color:var(--alert-red);">เปิด/ปิด สอบบอสไฟต์ (Boss Fight)</h3>
                <p style="font-size:12px; color:#ccc;">เมื่อเด็กตอบถูกจะได้ MP และป้องกันการทำซ้ำอัตโนมัติ</p>
                <div style="display:flex; gap:10px;">
                    <button class="btn-p" style="flex:1; border-color:var(--alert-red); background:${questStatus.boss_unit1?'var(--alert-red)':'#444'}; color:${questStatus.boss_unit1?'#fff':'#aaa'};" onclick="toggleSetting('quest_board', 'boss_unit1')">Boss 1</button>
                    <button class="btn-p" style="flex:1; border-color:var(--alert-red); background:${questStatus.boss_unit2?'var(--alert-red)':'#444'}; color:${questStatus.boss_unit2?'#fff':'#aaa'};" onclick="toggleSetting('quest_board', 'boss_unit2')">Boss 2</button>
                    <button class="btn-p" style="flex:1; border-color:var(--alert-red); background:${questStatus.boss_unit3?'var(--alert-red)':'#444'}; color:${questStatus.boss_unit3?'#fff':'#aaa'};" onclick="toggleSetting('quest_board', 'boss_unit3')">Boss 3</button>
                </div>
            </div>`;
    }
}

// --- Action Support ---
function teacherCreateStudent() {
    const n = document.getElementById('tAddName').value.trim(); 
    const id = document.getElementById('tAddId').value.trim();
    const p = document.getElementById('tAddPass').value.trim() || "123456"; 
    const r = document.getElementById('tAddRoom').value; 
    const num = document.getElementById('tAddNum').value.trim();
    
    if(!n || !id || !r || !num) return alert("กรอกข้อมูลให้ครบถ้วน!");
    
    db.collection("students").doc(id).set({ 
        name:n, studentId:id, room:r, number:num, password:p, level:1, exp:0, mana:0, rank:"Novice", 
        scores:{s1:0,s2:0,s3:0,mid:0,s4:0,s5:0,s6:0,final:0}, inventory:[], completedBosses:[], submittedMissions:[], returnedMissions:[], equippedTitle:"", equippedIcon:"", equippedGlow:"", equippedFrame:"" 
    }).then(() => { 
        alert("เพิ่มข้อมูลสำเร็จ! (กรุณาให้นักเรียนนำรหัสไปกด 'สร้างตัวละครใหม่' หน้าเว็บเพื่อล็อคอินเข้าสู่ระบบอีกครั้ง)"); 
        viewTeacher('students'); 
    }).catch(e => alert(e.message));
}

function deleteStudent(id, name) { 
    if(confirm(`⚠️ คำเตือน: ลบข้อมูล ${name} ใช่ไหม? ข้อมูลทุกอย่างจะหายไปเลยนะ!`)) {
        db.collection("students").doc(id).delete().then(()=>viewTeacher('students')); 
    }
}

function saveStudentProfile(id) { 
    const room = document.getElementById(`r_${id}`).value; 
    const num = document.getElementById(`n_${id}`).value; 
    const name = document.getElementById(`name_${id}`).value; 
    const pass = document.getElementById(`pass_${id}`).value;
    const lv = parseInt(document.getElementById(`lv_${id}`).value)||1; 
    const exp = parseInt(document.getElementById(`exp_${id}`).value)||0; 
    const mp = parseInt(document.getElementById(`mp_${id}`).value)||0; 
    
    db.collection("students").doc(id).set({ 
        room: room, number: num, name: name, password: pass, level: lv, exp: exp, mana: mp 
    }, {merge:true}).then(() => alert("บันทึกสำเร็จ!")); 
}

function returnWork(id, mission, name) { 
    if(confirm(`ต้องการคืนงาน ${mission} ให้ ${name} ใช่หรือไม่?`)) {
        db.collection("students").doc(id).get().then(doc => { 
            let sm = doc.data().submittedMissions || []; 
            let rm = doc.data().returnedMissions || []; 
            if(sm.includes(mission)){ 
                sm.splice(sm.indexOf(mission), 1); 
                rm.push(mission); 
                db.collection("students").doc(id).update({ submittedMissions: sm, returnedMissions: rm }).then(()=>viewTeacher('assignments')); 
            }
        }); 
    }
}

// --- Toggle Settings ---
function toggleSetting(col, key) { 
    let target = col === 'quest_board' ? questStatus : caseStatus; 
    db.collection("settings").doc(col).set({ [key]: !target[key] }, {merge:true}).then(() => {
        viewTeacher(col === 'quest_board' ? 'quests' : 'detective');
    }); 
}

function toggleClue(index) { 
    let newToggles = [...caseStatus.cluesToggle]; 
    newToggles[index] = !newToggles[index]; 
    db.collection("settings").doc("monthly_case").set({ cluesToggle: newToggles }, {merge:true}).then(() => {
        viewTeacher('detective');
    }); 
}

function changeActiveCase(caseIdx) { 
    if(!confirm("เปลี่ยนคดีจะรีเซ็ตคำใบ้และปิดการเฉลย ยืนยันไหม?")) return viewTeacher('detective'); 
    db.collection("settings").doc("monthly_case").set({ 
        activeCaseId: parseInt(caseIdx), 
        cluesToggle: [false,false,false,false,false,false,false,false,false,false], 
        isRevealed: false 
    }, {merge:true}).then(() => viewTeacher('detective')); 
}

// --- Announcements ---
function addAnnounce() {
    const text = document.getElementById('new-announce').value.trim(); 
    if(!text) return;
    let newAnn = [...announcements, text]; 
    db.collection("settings").doc("announcements").set({list: newAnn}).then(() => {
        alert("เพิ่มประกาศแล้ว!");
        viewTeacher('announcements');
    });
}
function editAnnounce(idx) {
    const newText = document.getElementById(`ann_edit_${idx}`).value.trim(); 
    if (!newText) return;
    let newAnn = [...announcements]; 
    newAnn[idx] = newText; 
    db.collection("settings").doc("announcements").set({list: newAnn}).then(() => {
        alert("อัปเดตประกาศสำเร็จ!");
        viewTeacher('announcements');
    });
}
function delAnnounce(idx) {
    if(!confirm("ต้องการลบประกาศนี้ใช่หรือไม่?")) return;
    let newAnn = [...announcements]; 
    newAnn.splice(idx, 1); 
    db.collection("settings").doc("announcements").set({list: newAnn}).then(() => {
        viewTeacher('announcements');
    });
}

// --- Quizzes & Lessons Editors ---
function loadLessonEditor(u) {
    const area = document.getElementById('lesson-editor-area'); 
    if(!u) return area.innerHTML = ""; 
    const items = lessonsData[u] || []; 
    let html = ``;
    items.forEach((item, i) => { 
        html += `<div style="border:1px solid #555; padding:15px; margin:15px 0; border-radius:8px; background:rgba(255,255,255,0.02);">
            <input type="text" value="${item.title}" placeholder="ชื่อสื่อ" onchange="lessonsData['${u}'][${i}].title=this.value">
            <select onchange="lessonsData['${u}'][${i}].type=this.value"><option value="youtube" ${item.type==='youtube'?'selected':''}>YouTube URL</option><option value="image" ${item.type==='image'?'selected':''}>Image URL</option><option value="link" ${item.type==='link'?'selected':''}>Link Web</option></select>
            <input type="text" value="${item.url}" placeholder="URL" onchange="lessonsData['${u}'][${i}].url=this.value">
            <button class="btn-p btn-danger" style="padding:10px; font-size:10px;" onclick="lessonsData['${u}'].splice(${i},1); loadLessonEditor('${u}');">ลบ</button>
        </div>`; 
    });
    html += `<div style="display:flex; gap:10px; margin-top:20px;"><button class="btn-p" style="font-size:10px; background:transparent; border:2px solid var(--aqua); color:var(--aqua);" onclick="if(!lessonsData['${u}']) lessonsData['${u}']=[]; lessonsData['${u}'].push({title:'',type:'youtube',url:''}); loadLessonEditor('${u}');">+ เพิ่มสื่อ</button><button class="btn-p" style="font-size:10px;" onclick="db.collection('settings').doc('lessons').set(lessonsData, {merge:true}).then(()=>alert('บันทึกสำเร็จ!'))">💾 เซฟ</button></div>`;
    area.innerHTML = html;
}

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
                <input type="text" value="${q.a}" placeholder="A" onchange="updateQ('${u}',${i},'a',this.value)"><input type="text" value="${q.b}" placeholder="B" onchange="updateQ('${u}',${i},'b',this.value)"><input type="text" value="${q.c}" placeholder="C" onchange="updateQ('${u}',${i},'c',this.value)"><input type="text" value="${q.d}" placeholder="D" onchange="updateQ('${u}',${i},'d',this.value)">
            </div>
            เฉลย: <select style="width:100px; padding:10px;" onchange="updateQ('${u}',${i},'key',this.value)"><option value="A" ${q.key==='A'?'selected':''}>A</option><option value="B" ${q.key==='B'?'selected':''}>B</option><option value="C" ${q.key==='C'?'selected':''}>C</option><option value="D" ${q.key==='D'?'selected':''}>D</option></select>
            <button class="btn-p btn-danger" style="padding:10px; font-size:10px; margin-left:10px;" onclick="quizData['${u}'].splice(${i},1); loadEditor('${u}');">ลบข้อนี้</button>
        </div>`; 
    });
    html += `<div style="display:flex; gap:10px; margin-top:20px;"><button class="btn-p" style="font-size:10px; background:transparent; border:2px solid var(--aqua); color:var(--aqua);" onclick="addQ('${u}')">+ เพิ่มข้อใหม่</button><button class="btn-p" style="font-size:10px;" onclick="db.collection('settings').doc('quizzes').set(quizData, {merge:true}).then(()=>alert('บันทึกสำเร็จ!'))">💾 เซฟ</button></div>`;
    area.innerHTML = html;
}
function updateQ(u, i, f, v) { quizData[u][i][f] = v; }
function addQ(u) { if(!quizData[u]) quizData[u]=[]; quizData[u].push({q:'',a:'',b:'',c:'',d:'',key:'A'}); loadEditor(u); }

// --- Helpers ---
function getCell(r, c, isBorder=false) { 
    let val = window.murdleState[`r${r}c${c}`] || ""; 
    let cls = val === 'O' ? 'yes' : (val === 'X' ? 'no' : '');
    let borderStyle = isBorder ? 'border-right:3px solid #666;' : '';
    return `<td class="clickable ${cls}" style="${borderStyle}" onclick="clickGrid(${r},${c})">${val}</td>`; 
}
function clickGrid(r, c) { 
    let k = `r${r}c${c}`; 
    let curr = window.murdleState[k] || ""; 
    let nxt = curr === "" ? "X" : (curr === "X" ? "O" : ""); 
    window.murdleState[k] = nxt; 
    showPage('detective', document.querySelector('.detective-btn')); 
}
function renderQuestCard(u, t, ok) { 
    if(!ok) return `<div class="content-card" style="opacity:0.5;"><h3>Unit ${u}: ${t} 🔒</h3></div>`; 
    return `<div class="content-card"><h3>Unit ${u}: ${t}</h3><button class="btn-p" onclick="openQuestDetail('unit${u}')">ENTER</button></div>`; 
}

function uploadDrive(inputId, missionId) {
    const file = document.getElementById(inputId).files[0]; 
    if(!file) return alert("เลือกไฟล์!");
    const btn = event.target; btn.innerText = "กำลังอัปโหลด..."; btn.disabled = true;
    const reader = new FileReader(); reader.readAsDataURL(file);
    reader.onload = function() {
        const payload = { file: reader.result, filename: file.name, missionId: missionId, studentName: userData.name };
        fetch(GAS_URL, { method: "POST", body: JSON.stringify(payload) }).then(res => res.text()).then(resp => {
            if(resp === "Success") { 
                let sm = userData.submittedMissions || []; sm.push(missionId); 
                db.collection("students").doc(userData.studentId).update({ submittedMissions: sm }).then(() => openQuestDetail(missionId.split('_')[0])); 
            } else { 
                alert("Error: "+resp); btn.innerText = "UPLOAD"; btn.disabled = false; 
            }
        });
    };
}
function buyItem(id, cost) { 
    if(userData.mana >= cost) { 
        let inv = userData.inventory || []; inv.push(id); 
        db.collection("students").doc(userData.studentId).update({ mana: userData.mana - cost, inventory: inv }).then(() => {
            alert("ซื้อสำเร็จ!"); showPage('shop', document.querySelectorAll('.nav-btn')[4]);
        }); 
    } else { 
        alert("MP ไม่พอ!");
    } 
}
function equipItem(id, type, val) { 
    let upd = {}; 
    if(type==='title') upd.equippedTitle = val; 
    if(type==='glow') upd.equippedGlow = val; 
    if(type==='frame') upd.equippedFrame = val; 
    if(type==='icon') upd.equippedIcon = val;
    db.collection("students").doc(userData.studentId).update(upd).then(() => {
        alert("สวมใส่แล้ว!"); showPage('shop', document.querySelectorAll('.nav-btn')[4]);
    }); 
}

// Anti Cheat
document.addEventListener("visibilitychange", () => {
    if (document.hidden && window.isDoingQuiz && userData && userData.studentId !== TEACHER_ID) {
        db.collection("anti_cheat_alerts").add({ studentName: userData.name, action: "สลับจอ", timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        alert("🚨 [SYSTEM ALERT] ครูเบียร์เห็นนะ! ตรวจพบการพับหน้าจอระหว่างทำภารกิจ!");
    }
});
