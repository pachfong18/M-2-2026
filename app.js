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
let questStatus = { unit1: false, unit2: false, unit3: false, boss_unit1: false, boss_unit2: false, boss_unit3: false };
let lessonsData = { unit1: [], unit2: [], unit3: [] };

// 🕵️‍♂️ คลังแฟ้มคดี 10 คดี (Murdle 4x4x4 Database)
const CASES_DB = [
    {
        title: "คดีที่ 1: ปริศนาขโมยซอร์สโค้ด",
        story: "เมื่อคืนเกิดเหตุคนร้ายขโมยซอร์สโค้ดระบบตัดเกรดของโรงเรียน! นักสืบต้องหาว่า ใคร ก่อเหตุที่ ไหน และใช้อะไร ขโมยข้อมูลไป!",
        suspects: ["นาย A", "นางสาว B", "เด็กชาย C", "นาง D"],
        locations: ["ห้องเซิร์ฟเวอร์", "ห้องพักครู", "สวน", "โรงอาหาร"],
        weapons: ["แฟลชไดรฟ์", "แล็ปท็อป", "มือถือ", "แท็บเล็ต"],
        clues: [
            "1. นาย A ถูกพบเห็นว่านั่งเล่นมือถืออยู่ตลอดเวลา", "2. เด็กชาย C หิวมาก จึงเดินไปที่โรงอาหาร", "3. มีคนลืมแท็บเล็ตทิ้งไว้ที่โรงอาหาร", "4. นาง D นั่งตรวจงานอยู่ที่ห้องพักครูตลอดเวลา",
            "5. คนที่อยู่ห้องพักครูใช้แล็ปท็อปทำงาน", "6. ผู้ที่ขโมยข้อมูลใช้แฟลชไดรฟ์", "7. นางสาว B ไม่มีมือถือและไม่ได้ใช้แท็บเล็ต", "8. นาย A ไม่เคยเดินไปที่ห้องพักครูหรือโรงอาหาร",
            "9. คนที่อยู่สวนไม่ได้ใช้แล็ปท็อปและแท็บเล็ต", "10. นางสาว B เป็นคนเดียวที่มีกุญแจเข้าห้องเซิร์ฟเวอร์"
        ],
        ansWho: "นางสาว B", ansWhere: "ห้องเซิร์ฟเวอร์", ansWhat: "แฟลชไดรฟ์"
    },
    {
        title: "คดีที่ 2: แฮกเกอร์ป่วนเว็บโรงเรียน",
        story: "หน้าเว็บโรงเรียนถูกมือดีเปลี่ยนรูปภาพเป็นรูปแมวเต้นแร้งเต้นกา! แฮกเกอร์คนนี้คือใคร แอบแฮกจากที่ไหน และใช้อุปกรณ์อะไร?",
        suspects: ["ประธานนักเรียน", "หัวหน้าห้อง", "ภารโรง", "ครูฝึกสอน"],
        locations: ["ห้องสมุด", "ห้องคอมฯ 1", "ดาดฟ้า", "สนามบาส"],
        weapons: ["สมาร์ทวอทช์", "มินิพีซี", "แว่นตาอัจฉริยะ", "โน้ตบุ๊ก"],
        clues: [
            "1. ครูฝึกสอนเดินตรวจแถวอยู่ที่สนามบาส", "2. ประธานนักเรียนไม่มีสมาร์ทวอทช์หรือมินิพีซี", "3. ภารโรงกำลังทำความสะอาดอยู่ที่ดาดฟ้า", "4. คนที่อยู่ห้องสมุดใช้โน้ตบุ๊กทำงาน",
            "5. ผู้ลงมือใช้มินิพีซีในการแฮก", "6. หัวหน้าห้องไม่ได้ขึ้นไปที่ดาดฟ้าและสนามบาส", "7. แว่นตาอัจฉริยะถูกพบอยู่ที่ดาดฟ้า", "8. ประธานนักเรียนนั่งอ่านหนังสืออยู่ในความเงียบ",
            "9. ครูฝึกสอนใช้สมาร์ทวอทช์ดูเวลา", "10. หัวหน้าห้องเก่งเรื่องประกอบมินิพีซีมากที่สุด"
        ],
        ansWho: "หัวหน้าห้อง", ansWhere: "ห้องคอมฯ 1", ansWhat: "มินิพีซี"
    },
    {
        title: "คดีที่ 3: ไวรัสลบการบ้าน",
        story: "การบ้านวิทยาการคำนวณของเด็ก ม.2 ถูกไวรัสลบเกลี้ยง! ใครเป็นคนปล่อยไวรัส ปล่อยจากตรงไหน และใช้เครื่องมืออะไร?",
        suspects: ["สมชาย", "สมหญิง", "สมศักดิ์", "สมปอง"],
        locations: ["โต๊ะหินอ่อน", "ใต้บันได", "ห้องพยาบาล", "ห้องดนตรี"],
        weapons: ["ทรัมบ์ไดรฟ์", "อีเมลสแปม", "โดรน", "บลูทูธ"],
        clues: [
            "1. สมหญิงนอนพักไข้ในห้องพยาบาล", "2. สมชายซ้อมเป่าขลุ่ยอยู่ที่ห้องดนตรี", "3. การปล่อยไวรัสครั้งนี้ต้องอาศัยเสียบทรัมบ์ไดรฟ์เข้าเครื่อง", "4. คนที่อยู่ห้องพยาบาลใช้อีเมลสแปมส่งข่าว",
            "5. สมศักดิ์กลัวความมืด จึงไม่เคยไปใต้บันได", "6. คนที่อยู่ใต้บันไดใช้โดรนบินสำรวจ", "7. สมชายใช้บลูทูธเปิดเพลงเล่น", "8. สมปองไม่ได้ใช้โดรนและอีเมล",
            "9. โต๊ะหินอ่อนเป็นจุดที่ใช้ทรัมบ์ไดรฟ์ได้สะดวกสุด", "10. สมศักดิ์ไม่ได้พกทรัมบ์ไดรฟ์มาโรงเรียน"
        ],
        ansWho: "สมปอง", ansWhere: "โต๊ะหินอ่อน", ansWhat: "ทรัมบ์ไดรฟ์"
    },
    // ครูเบียร์สามารถแก้เนื้อเรื่องคดีที่ 4-10 ได้ตามใจชอบเลยครับ
    { title: "คดีที่ 4: รหัสผ่าน Wi-Fi รั่วไหล", story: "รหัส Wi-Fi ลับของโรงเรียนถูกนำไปโพสต์ลงเน็ต! ใครคือหนอนบ่อนไส้?", suspects: ["ยามหน้าประตู", "แม่ค้า", "นร.แลกเปลี่ยน", "ดีเจ"], locations: ["ห้องปกครอง", "ห้องกระจายเสียง", "ซุ้มไม้เลื้อย", "โรงยิม"], weapons: ["เราเตอร์พกพา", "มือถือพับได้", "สาย LAN", "เครื่องดักสัญญาณ"], clues: ["1. คำใบ้ 1","2. คำใบ้ 2","3. คำใบ้ 3","4. คำใบ้ 4","5. คำใบ้ 5","6. คำใบ้ 6","7. คำใบ้ 7","8. คำใบ้ 8","9. คำใบ้ 9","10. คำใบ้ 10"], ansWho: "ดีเจ", ansWhere: "ห้องกระจายเสียง", ansWhat: "เครื่องดักสัญญาณ" },
    { title: "คดีที่ 5: รูปหลุดงานกีฬาสี", story: "มีคนแอบถ่ายรูปหลุดของสตาฟ! ใครแอบถ่ายจากมุมไหน?", suspects: ["ตากล้อง", "เชียร์ลีดเดอร์", "นักฟุตบอล", "สภานักเรียน"], locations: ["อัฒจันทร์", "ห้องเก็บของ", "หลังเวที", "สระว่ายน้ำ"], weapons: ["กล้อง DSLR", "โดรนจิ๋ว", "กล้องจิ๋ว", "มือถือซูม"], clues: ["1. คำใบ้ 1","2. คำใบ้ 2","3. คำใบ้ 3","4. คำใบ้ 4","5. คำใบ้ 5","6. คำใบ้ 6","7. คำใบ้ 7","8. คำใบ้ 8","9. คำใบ้ 9","10. คำใบ้ 10"], ansWho: "ตากล้อง", ansWhere: "หลังเวที", ansWhat: "โดรนจิ๋ว" },
    { title: "คดีที่ 6: แอบแก้เกรดคณิต", story: "เกรดวิชาคณิตศาสตร์ถูกแก้ในระบบกลางดึก!", suspects: ["เด็กเก่ง", "เด็กหลังห้อง", "นักกีฬา", "ประธานชมรม"], locations: ["ห้องแนะแนว", "ห้องพักครู", "ห้องน้ำชาย", "ห้องน้ำหญิง"], weapons: ["กระดาษจดรหัส", "คีย์ล็อกเกอร์", "โปรแกรมรีโมท", "สคริปต์"], clues: ["1. คำใบ้ 1","2. คำใบ้ 2","3. คำใบ้ 3","4. คำใบ้ 4","5. คำใบ้ 5","6. คำใบ้ 6","7. คำใบ้ 7","8. คำใบ้ 8","9. คำใบ้ 9","10. คำใบ้ 10"], ansWho: "เด็กหลังห้อง", ansWhere: "ห้องน้ำชาย", ansWhat: "โปรแกรมรีโมท" },
    { title: "คดีที่ 7: ขโมยข้อสอบกลางภาค", story: "กระดาษข้อสอบกลางภาคหายไปจากห้องวิชาการ!", suspects: ["ครูเวร", "ภารโรงกะดึก", "นร.มาเช้า", "คนส่งอาหาร"], locations: ["ห้องพิมพ์เอกสาร", "ห้องวิชาการ", "ป้อมยาม", "ประตูหลัง"], weapons: ["กุญแจผี", "สมาร์ทโฟน", "เครื่องถ่ายจิ๋ว", "กล้องปากกา"], clues: ["1. คำใบ้ 1","2. คำใบ้ 2","3. คำใบ้ 3","4. คำใบ้ 4","5. คำใบ้ 5","6. คำใบ้ 6","7. คำใบ้ 7","8. คำใบ้ 8","9. คำใบ้ 9","10. คำใบ้ 10"], ansWho: "นร.มาเช้า", ansWhere: "ห้องวิชาการ", ansWhat: "กล้องปากกา" },
    { title: "คดีที่ 8: ปิดระบบเสียงตามสาย", story: "เสียงตามสายโรงเรียนดับวูบ ใครตัดระบบ?", suspects: ["ดีเจ", "หัวหน้าวง", "สารวัตรนร.", "ภารโรงไฟ"], locations: ["ห้องควบคุม", "เสาธง", "ห้องสภา", "ห้องดนตรี"], weapons: ["คีมตัดสาย", "รีโมทแฮก", "โน้ตบุ๊ก", "แอปบล็อก"], clues: ["1. คำใบ้ 1","2. คำใบ้ 2","3. คำใบ้ 3","4. คำใบ้ 4","5. คำใบ้ 5","6. คำใบ้ 6","7. คำใบ้ 7","8. คำใบ้ 8","9. คำใบ้ 9","10. คำใบ้ 10"], ansWho: "หัวหน้าวง", ansWhere: "เสาธง", ansWhat: "คีมตัดสาย" },
    { title: "คดีที่ 9: ป่วนระบบสั่งอาหาร", story: "มีการสแปมสั่งข้าวมันไก่ 100 จานในระบบโรงอาหาร!", suspects: ["เชฟ", "นร.ชมรมคอม", "แม่บ้าน", "คนส่งของ"], locations: ["ครัว", "เคาน์เตอร์", "โต๊ะอาหาร", "ลานจอดรถ"], weapons: ["คีย์การ์ดปลอม", "เครื่องสแกน", "สคริปต์สแปม", "เครื่องตัดเน็ต"], clues: ["1. คำใบ้ 1","2. คำใบ้ 2","3. คำใบ้ 3","4. คำใบ้ 4","5. คำใบ้ 5","6. คำใบ้ 6","7. คำใบ้ 7","8. คำใบ้ 8","9. คำใบ้ 9","10. คำใบ้ 10"], ansWho: "นร.ชมรมคอม", ansWhere: "โต๊ะอาหาร", ansWhat: "สคริปต์สแปม" },
    { title: "คดีที่ 10: ขโมยโปรเจกต์ประกวด", story: "โค้ดโปรเจกต์หุ่นยนต์ส่งประกวดถูกขโมยไป!", suspects: ["ทีม A", "ทีม B", "ครูที่ปรึกษา", "กรรมการ"], locations: ["ห้องประชุม", "โถงนิทรรศการ", "ล็อบบี้", "ห้องเตรียมตัว"], weapons: ["ฮาร์ดดิสก์", "ฟิชชิ่ง", "โทรจัน", "โคลน NFC"], clues: ["1. คำใบ้ 1","2. คำใบ้ 2","3. คำใบ้ 3","4. คำใบ้ 4","5. คำใบ้ 5","6. คำใบ้ 6","7. คำใบ้ 7","8. คำใบ้ 8","9. คำใบ้ 9","10. คำใบ้ 10"], ansWho: "ทีม B", ansWhere: "ห้องเตรียมตัว", ansWhat: "โคลน NFC" }
];

let caseStatus = { 
    activeCaseId: 0, // ค่าเริ่มต้นคือคดีที่ 1 (Index 0)
    cluesToggle: [false,false,false,false,false,false,false,false,false,false], 
    isRevealed: false 
};

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
            name: name, studentId: id, level: 1, exp: 0, mana: 0, rank: "Novice", 
            caseAnswer: {who:"",where:"",what:""}, completedBosses: [] 
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
            } else {
                db.collection("settings").doc("monthly_case").set(caseStatus);
            }
            if(document.getElementById('detective-main')) showPage('detective', document.querySelectorAll('.nav-btn')[3]); 
        });
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
                <p>เป้าหมาย: ทบทวนเนื้อหาใน Lessons, สะสม EXP จาก Quest Board และเข้าร่วมไขคดีสืบสวน!</p>
            </div>`;
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
                    if(item.type === 'youtube') {
                        lessonHTML += `<div class="video-container"><iframe src="${item.url}" frameborder="0" allowfullscreen></iframe></div>`;
                    } else if(item.type === 'image') {
                        lessonHTML += `<img src="${item.url}" style="max-width:100%; border-radius:8px; margin-bottom:10px;">`;
                    } else {
                        lessonHTML += `<a href="${item.url}" target="_blank" style="color:var(--aqua); text-decoration:underline;">คลิกเพื่อเปิดลิงก์ / ดาวน์โหลดเอกสาร</a>`;
                    }
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
            if(isOpen) {
                cluesHTML += `<p style="font-size:12px; color:#fff; border-left:2px solid var(--aqua); padding-left:10px;">${currentCase.clues[idx]}</p>`;
            }
        });
        if(cluesHTML === "") cluesHTML = `<p style="color:#555; font-size:12px;">🔒 ครูเบียร์ยังไม่เปิดเผยเบาะแสใดๆ ในขณะนี้</p>`;

        // สร้าง Dropdown ให้ตรงกับคดีปัจจุบัน
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
                        <tr>
                            <th style="background:rgba(0,255,255,0.1);">${currentCase.suspects[0]}</th>
                            ${getCell(0,0)} ${getCell(0,1)} ${getCell(0,2)} ${getCell(0,3,true)}
                            ${getCell(0,4)} ${getCell(0,5)} ${getCell(0,6)} ${getCell(0,7)}
                        </tr>
                        <tr>
                            <th style="background:rgba(0,255,255,0.1);">${currentCase.suspects[1]}</th>
                            ${getCell(1,0)} ${getCell(1,1)} ${getCell(1,2)} ${getCell(1,3,true)}
                            ${getCell(1,4)} ${getCell(1,5)} ${getCell(1,6)} ${getCell(1,7)}
                        </tr>
                        <tr>
                            <th style="background:rgba(0,255,255,0.1);">${currentCase.suspects[2]}</th>
                            ${getCell(2,0)} ${getCell(2,1)} ${getCell(2,2)} ${getCell(2,3,true)}
                            ${getCell(2,4)} ${getCell(2,5)} ${getCell(2,6)} ${getCell(2,7)}
                        </tr>
                        <tr>
                            <th style="background:rgba(0,255,255,0.1);">${currentCase.suspects[3]}</th>
                            ${getCell(3,0)} ${getCell(3,1)} ${getCell(3,2)} ${getCell(3,3,true)}
                            ${getCell(3,4)} ${getCell(3,5)} ${getCell(3,6)} ${getCell(3,7)}
                        </tr>
                        <tr><td colspan="9" class="empty-cell" style="height:10px; border-bottom:3px solid #666; border-top:3px solid #666;"></td></tr>
                        <tr>
                            <th style="background:rgba(0,255,255,0.1);">${currentCase.weapons[0]}</th>
                            ${getCell(4,0)} ${getCell(4,1)} ${getCell(4,2)} ${getCell(4,3,true)}
                            <td colspan="4" rowspan="4" class="empty-cell"></td>
                        </tr>
                        <tr>
                            <th style="background:rgba(0,255,255,0.1);">${currentCase.weapons[1]}</th>
                            ${getCell(5,0)} ${getCell(5,1)} ${getCell(5,2)} ${getCell(5,3,true)}
                        </tr>
                        <tr>
                            <th style="background:rgba(0,255,255,0.1);">${currentCase.weapons[2]}</th>
                            ${getCell(6,0)} ${getCell(6,1)} ${getCell(6,2)} ${getCell(6,3,true)}
                        </tr>
                        <tr>
                            <th style="background:rgba(0,255,255,0.1);">${currentCase.weapons[3]}</th>
                            ${getCell(7,0)} ${getCell(7,1)} ${getCell(7,2)} ${getCell(7,3,true)}
                        </tr>
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
                    <div style="width:100px; height:100px; background:var(--aqua); border-radius:50%; margin:0 auto 20px auto; display:flex; align-items:center; justify-content:center; font-size:40px; color:#000; box-shadow:0 0 20px var(--aqua);">
                        <i class="fa-solid fa-user-astronaut"></i>
                    </div>
                    <h3 style="margin:0; font-size:22px;">${userData.name}</h3>
                    <p class="pixel-font" style="color:var(--aqua); font-size:10px; margin-top:10px;">${userData.rank}</p>
                    <p style="color:#aaa; font-size:14px;">ID: ${userData.studentId}</p>
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
                <button class="btn-p pixel-font" style="background:#ffcc00; color:#000; font-size:9px;" onclick="viewTeacher('students')">นักเรียน</button>
                <button class="btn-p pixel-font" style="background:var(--aqua); color:#000; font-size:9px;" onclick="viewTeacher('lessons')">บทเรียน</button>
                <button class="btn-p pixel-font" style="background:var(--aqua); color:#000; font-size:9px;" onclick="viewTeacher('quizzes')">ข้อสอบ</button>
                <button class="btn-p pixel-font" style="background:var(--detective-purple); color:#fff; font-size:9px;" onclick="viewTeacher('detective')">คดีสืบสวน</button>
                <button class="btn-p pixel-font" style="background:var(--alert-red); color:#fff; font-size:9px; border-color:var(--alert-red);" onclick="viewTeacher('quests')">เปิด/ปิดระบบ</button>
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

    if (isBossCompleted) {
        window.isDoingQuiz = false;
        bossSectionHTML = `
            <div style="background:rgba(0,255,65,0.1); border:2px solid #00ff41; padding:20px; border-radius:10px; text-align:center; box-shadow:0 0 15px rgba(0,255,65,0.2);">
                <h3 class="pixel-font" style="color:#00ff41; margin-top:0;">🎉 BOSS CLEARED!</h3>
                <p style="color:#ddd; margin-bottom:0;">คุณได้กำจัดบอสประจำหน่วยนี้ไปแล้ว (ไม่สามารถโจมตีซ้ำได้)</p>
            </div>`;
    } else if (!isBossOpen) {
        window.isDoingQuiz = false;
        bossSectionHTML = `
            <div style="background:rgba(255,255,255,0.05); border:2px dashed #666; padding:20px; border-radius:10px; text-align:center;">
                <h3 class="pixel-font" style="color:#aaa; margin-top:0;"><i class="fa-solid fa-lock"></i> BOSS LOCKED</h3>
                <p style="color:#888; margin-bottom:0;">ครูเบียร์ยังไม่เปิดให้เข้าสู้บอสในขณะนี้ เตรียมตัวให้พร้อม!</p>
            </div>`;
    } else {
        window.isDoingQuiz = true;
        bossSectionHTML = `
            <div style="background:rgba(255,51,102,0.1); border:1px solid var(--alert-red); padding:20px; border-radius:10px;">
                <h3 class="pixel-font" style="font-size:12px; color:var(--alert-red);">>>> BOSS FIGHT</h3>
                <p style="font-size:12px; color:#ccc;">ตอบให้ถูกมากที่สุดเพื่อรับโบนัส MP! (คำเตือน: ห้ามพับจอ!)</p>
                <div id="quiz-container_${u}"></div>
            </div>`;
    }

    let html = `
        <button class="btn-p pixel-font" style="background:transparent; color:#fff; border-color:#fff; padding:10px; font-size:10px; margin-bottom:20px;" onclick="showPage('quests', document.querySelectorAll('.nav-btn')[2])"><< BACK</button>
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
        db.collection("students").get().then(snap => {
            let html = `<table class="admin-table"><tr><th>รหัส</th><th>ชื่อ</th><th>LV</th><th>MP</th><th>EXP</th><th>Action</th></tr>`;
            snap.forEach(doc => {
                const s = doc.data();
                html += `<tr><td>${s.studentId}</td><td>${s.name}</td><td>${s.level}</td><td>${s.mana}</td><td>${s.exp}</td><td><button class="btn-p" style="padding:8px 15px; font-size:10px;" onclick="addExp('${s.studentId}', 50)">+50 EXP</button></td></tr>`;
            });
            box.innerHTML = html + "</table>";
        });
    } 
    else if(v === 'lessons') {
        box.innerHTML = `
            <div style="background:rgba(0,0,0,0.5); padding:20px; border-radius:10px;">
                <h3 class="pixel-font" style="font-size:12px; color:var(--aqua);">จัดการสื่อการสอน (Lessons)</h3>
                <select id="t-lesson-unit" onchange="loadLessonEditor(this.value)">
                    <option value="">-- เลือก Unit ที่จะจัดการสื่อ --</option><option value="unit1">Unit 1</option><option value="unit2">Unit 2</option><option value="unit3">Unit 3</option>
                </select>
                <div id="lesson-editor-area"></div>
            </div>`;
    }
    else if(v === 'quizzes') {
        box.innerHTML = `
            <div style="background:rgba(0,0,0,0.5); padding:20px; border-radius:10px;">
                <h3 class="pixel-font" style="font-size:12px; color:var(--aqua);">จัดการข้อสอบ Boss Fight</h3>
                <select id="t-quiz-unit" onchange="loadEditor(this.value)">
                    <option value="">-- เลือก Unit --</option><option value="unit1">Unit 1</option><option value="unit2">Unit 2</option><option value="unit3">Unit 3</option>
                </select>
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
                
                <label style="font-size:12px;">เลือกคดีที่ต้องการให้เล่นเดือนนี้ (การเปลี่ยนคดีจะล้างคำใบ้ที่เปิดไว้)</label>
                <select onchange="changeActiveCase(this.value)" style="background:#000;">
                    ${caseOptions}
                </select>
                <hr style="border-color:#444; margin:20px 0;">

                <p style="font-size:12px;">กดปุ่มเพื่อโชว์/ซ่อนคำใบ้ 10 ข้อ</p>
                <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:20px;">
                    ${toggleBtns}
                </div>
                <hr style="border-color:#444;">
                <button class="btn-p" style="width:100%; background:${caseStatus.isRevealed?'var(--alert-red)':'var(--detective-purple)'};" onclick="toggleSetting('monthly_case', 'isRevealed')">${caseStatus.isRevealed ? 'ปิดการเฉลย' : '📢 กดปุ่มประกาศเฉลยให้เด็กเห็น'}</button>
            </div>`;
    }
    else if(v === 'quests') {
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
                <p style="font-size:12px; color:#ccc;">เมื่อเด็กทำบอสผ่านแล้ว จะไม่สามารถทำซ้ำได้อีก</p>
                <div style="display:flex; gap:10px;">
                    <button class="btn-p" style="flex:1; border-color:var(--alert-red); background:${questStatus.boss_unit1?'var(--alert-red)':'#444'}; color:${questStatus.boss_unit1?'#fff':'#aaa'};" onclick="toggleSetting('quest_board', 'boss_unit1')">Boss 1</button>
                    <button class="btn-p" style="flex:1; border-color:var(--alert-red); background:${questStatus.boss_unit2?'var(--alert-red)':'#444'}; color:${questStatus.boss_unit2?'#fff':'#aaa'};" onclick="toggleSetting('quest_board', 'boss_unit2')">Boss 2</button>
                    <button class="btn-p" style="flex:1; border-color:var(--alert-red); background:${questStatus.boss_unit3?'var(--alert-red)':'#444'}; color:${questStatus.boss_unit3?'#fff':'#aaa'};" onclick="toggleSetting('quest_board', 'boss_unit3')">Boss 3</button>
                </div>
            </div>`;
    }
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

// TOGGLE SETTINGS
function toggleSetting(col, key) {
    let target = col === 'quest_board' ? questStatus : caseStatus;
    db.collection("settings").doc(col).update({ [key]: !target[key] }).then(() => viewTeacher(col==='quest_board'?'quests':'detective'));
}

// TOGGLE CLUES
function toggleClue(index) {
    let newToggles = [...caseStatus.cluesToggle];
    newToggles[index] = !newToggles[index];
    db.collection("settings").doc("monthly_case").update({ cluesToggle: newToggles }).then(() => viewTeacher('detective'));
}

// CHANGE ACTIVE CASE
function changeActiveCase(caseIdx) {
    if(!confirm("การเปลี่ยนคดีจะรีเซ็ตคำใบ้และปิดการเฉลย ยืนยันไหม?")) return viewTeacher('detective');
    db.collection("settings").doc("monthly_case").update({
        activeCaseId: parseInt(caseIdx),
        cluesToggle: [false,false,false,false,false,false,false,false,false,false],
        isRevealed: false
    }).then(() => viewTeacher('detective'));
}

// ANTI CHEAT
document.addEventListener("visibilitychange", () => {
    if (document.hidden && window.isDoingQuiz && userData && userData.studentId !== TEACHER_ID) {
        db.collection("anti_cheat_alerts").add({ studentName: userData.name, action: "สลับจอ", timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        alert("🚨 [SYSTEM ALERT] ครูเบียร์เห็นนะ! ตรวจพบการพับหน้าจอระหว่างทำภารกิจ!");
    }
});
