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
let questStatus = { unit1_m1: false, unit1_m2: false, unit2_m1: false, unit2_m2: false, unit3_m1: false, unit3_m2: false, boss_unit1: false, boss_unit2: false, boss_unit3: false, unit1: false, unit2: false, unit3: false };
let lessonsData = { unit1: [], unit2: [], unit3: [] };
let announcements = [];
let checkinActive = false;
let caseStatus = { activeCaseId: 0, cluesToggle: [false,false,false,false,false,false,false,false,false,false], isRevealed: false };
window.murdleState = {}; 

const TEACHER_ID = "pchrkr007";
const ROOMS_LIST = ["London", "Newyork", "Tokyo", "Paris", "Seoul"]; 
let currentTeacherRoom = "London"; 
let teacherChatUnsubscribe = null;

// ================= 🎲 MEGA DATABASE: ไอเทม สกิล และร้านค้า 🎲 =================

const DROP_ITEMS = [
    { id:"c1", name:"สาย LAN ขาดๆ", type:"common", price:5, icon:"fa-network-wired" }, { id:"c2", name:"คีย์แคปหลุด", type:"common", price:6, icon:"fa-keyboard" }, { id:"c3", name:"แผ่น Floppy Disk", type:"common", price:7, icon:"fa-floppy-disk" }, { id:"c4", name:"ซีดีรอมเป็นรอย", type:"common", price:8, icon:"fa-compact-disc" }, { id:"c5", name:"แฟลชไดรฟ์ติดไวรัส", type:"common", price:9, icon:"fa-usb" },
    { id:"c6", name:"เมาส์พัง", type:"common", price:10, icon:"fa-computer-mouse" }, { id:"c7", name:"น็อตเมนบอร์ด", type:"common", price:10, icon:"fa-screw" }, { id:"c8", name:"พัดลมเคสฝุ่นเกาะ", type:"common", price:11, icon:"fa-fan" }, { id:"c9", name:"สายชาร์จหักใน", type:"common", price:12, icon:"fa-plug" }, { id:"c10", name:"แบตเตอรี่บวม", type:"common", price:12, icon:"fa-battery-quarter" },
    { id:"c11", name:"แผ่นรองเมาส์เปื่อย", type:"common", price:13, icon:"fa-rug" }, { id:"c12", name:"ถ่าน BIOS หมด", type:"common", price:14, icon:"fa-battery-empty" }, { id:"c13", name:"โค้ดตกแท็กปิด", type:"common", price:15, icon:"fa-code" }, { id:"c14", name:"ซิลิโคนแห้ง", type:"common", price:15, icon:"fa-droplet" }, { id:"c15", name:"สาย VGA เข็มหัก", type:"common", price:8, icon:"fa-cable-car" },
    { id:"u1", name:"สาย LAN Cat6", type:"uncommon", price:25, icon:"fa-network-wired" }, { id:"u2", name:"แรม DDR3 4GB", type:"uncommon", price:28, icon:"fa-memory" }, { id:"u3", name:"สาย HDMI 4K", type:"uncommon", price:28, icon:"fa-plug" }, { id:"u4", name:"ฮาร์ดดิสก์ 500GB", type:"uncommon", price:30, icon:"fa-hard-drive" }, { id:"u5", name:"คีย์บอร์ด RGB", type:"uncommon", price:32, icon:"fa-keyboard" },
    { id:"u6", name:"ไมโครโฟน", type:"uncommon", price:33, icon:"fa-microphone" }, { id:"u7", name:"ซิลิโคนพรีเมียม", type:"uncommon", price:35, icon:"fa-droplet" }, { id:"u8", name:"เมาส์ไร้สาย", type:"uncommon", price:35, icon:"fa-computer-mouse" }, { id:"u9", name:"แฟลชไดรฟ์ 32GB", type:"uncommon", price:36, icon:"fa-usb" }, { id:"u10", name:"พัดลม LED", type:"uncommon", price:38, icon:"fa-fan" },
    { id:"u11", name:"เว็บแคม 720p", type:"uncommon", price:39, icon:"fa-camera" }, { id:"u12", name:"Arduino Uno", type:"uncommon", price:40, icon:"fa-microchip" }, { id:"u13", name:"จอ 60Hz", type:"uncommon", price:42, icon:"fa-desktop" }, { id:"u14", name:"Power Bank", type:"uncommon", price:44, icon:"fa-battery-full" }, { id:"u15", name:"โค้ดไร้บั๊ก", type:"uncommon", price:45, icon:"fa-check-double" },
    { id:"r1", name:"SSD M.2 1TB", type:"rare", price:80, icon:"fa-hard-drive" }, { id:"r2", name:"แรม DDR5 16GB", type:"rare", price:85, icon:"fa-memory" }, { id:"r3", name:"เมนบอร์ด Gaming", type:"rare", price:90, icon:"fa-chess-board" }, { id:"r4", name:"ชุดน้ำปิดระบายความร้อน", type:"rare", price:95, icon:"fa-snowflake" }, { id:"r5", name:"เราเตอร์ Wi-Fi 6", type:"rare", price:98, icon:"fa-wifi" },
    { id:"r6", name:"Core i7 / Ryzen 7", type:"rare", price:100, icon:"fa-microchip" }, { id:"r7", name:"เมาส์เซ็นเซอร์เทพ", type:"rare", price:105, icon:"fa-computer-mouse" }, { id:"r8", name:"Stream Deck", type:"rare", price:108, icon:"fa-table-cells" }, { id:"r9", name:"Mechanical Keyboard", type:"rare", price:110, icon:"fa-keyboard" }, { id:"r10", name:"จอ 144Hz 2K", type:"rare", price:115, icon:"fa-desktop" },
    { id:"r11", name:"การ์ดจอ RTX 40", type:"rare", price:120, icon:"fa-vr-cardboard" }, { id:"r12", name:"อัลกอริทึม AI", type:"rare", price:125, icon:"fa-brain" }, { id:"r13", name:"แว่น VR โฮโลกราฟิก", type:"rare", price:130, icon:"fa-glasses" }, { id:"r14", name:"โดรน 4K", type:"rare", price:140, icon:"fa-helicopter" }, { id:"r15", name:"เซิร์ฟเวอร์พกพา", type:"rare", price:150, icon:"fa-server" }
];

const SHOP_ITEMS = [
    { id:"t1", name:"[ฉายา] ผู้กล้าฝึกหัด", cost:50, type:"title", value:"ผู้กล้าฝึกหัด", icon:"fa-shield-halved" }, { id:"t2", name:"[ฉายา] มือใหม่หัดโค้ด", cost:80, type:"title", value:"มือใหม่หัดโค้ด", icon:"fa-code" }, { id:"t3", name:"[ฉายา] สายก๊อปวาง", cost:100, type:"title", value:"สายก๊อปวาง", icon:"fa-copy" }, { id:"t4", name:"[ฉายา] นักแก้บั๊ก", cost:150, type:"title", value:"นักแก้บั๊ก", icon:"fa-bug" }, { id:"t5", name:"[ฉายา] โปรแกรมเมอร์หน้าย่น", cost:200, type:"title", value:"โปรแกรมเมอร์หน้าย่น", icon:"fa-face-tired" },
    { id:"t6", name:"[ฉายา] แฮกเกอร์เงา", cost:250, type:"title", value:"แฮกเกอร์เงา", icon:"fa-user-secret" }, { id:"t7", name:"[ฉายา] จ้าวแห่งลูป", cost:250, type:"title", value:"จ้าวแห่งลูป", icon:"fa-rotate-right" }, { id:"t8", name:"[ฉายา] สายปั่นงานเที่ยงคืน", cost:300, type:"title", value:"สายปั่นงานเที่ยงคืน", icon:"fa-moon" }, { id:"t9", name:"[ฉายา] อัจฉริยะ AI", cost:350, type:"title", value:"อัจฉริยะ AI", icon:"fa-brain" }, { id:"t10", name:"[ฉายา] ปรมาจารย์งู", cost:400, type:"title", value:"ปรมาจารย์งู", icon:"fa-staff-snake" },
    { id:"t11", name:"[ฉายา] สลอธยอดนักพิมพ์", cost:400, type:"title", value:"สลอธยอดนักพิมพ์", icon:"fa-keyboard" }, { id:"t12", name:"[ฉายา] ผู้พิทักษ์เซิร์ฟเวอร์", cost:500, type:"title", value:"ผู้พิทักษ์เซิร์ฟเวอร์", icon:"fa-server" }, { id:"t13", name:"[ฉายา] พระเจ้าแห่งคีย์บอร์ด", cost:600, type:"title", value:"พระเจ้าแห่งคีย์บอร์ด", icon:"fa-crown" }, { id:"t14", name:"[ฉายา] เทพทรู", cost:1000, type:"title", value:"เทพทรู", icon:"fa-gem" }, { id:"t15", name:"[ฉายา] ลูกรักครูเบียร์", cost:1500, type:"title", value:"ลูกรักครูเบียร์", icon:"fa-heart" },
    { id:"i1", name:"[ไอคอน] จอคอม", cost:80, type:"icon", value:"fa-desktop", icon:"fa-desktop" }, { id:"i2", name:"[ไอคอน] คีย์บอร์ด", cost:100, type:"icon", value:"fa-keyboard", icon:"fa-keyboard" }, { id:"i3", name:"[ไอคอน] กาแฟร้อน", cost:120, type:"icon", value:"fa-mug-hot", icon:"fa-mug-hot" }, { id:"i4", name:"[ไอคอน] แมลงบั๊ก", cost:150, type:"icon", value:"fa-bug", icon:"fa-bug" }, { id:"i5", name:"[ไอคอน] จอยเกม", cost:180, type:"icon", value:"fa-gamepad", icon:"fa-gamepad" },
    { id:"i6", name:"[ไอคอน] หูฟัง", cost:200, type:"icon", value:"fa-headphones", icon:"fa-headphones" }, { id:"i7", name:"[ไอคอน] จรวด", cost:250, type:"icon", value:"fa-rocket", icon:"fa-rocket" }, { id:"i8", name:"[ไอคอน] แฮกเกอร์", cost:300, type:"icon", value:"fa-user-secret", icon:"fa-user-secret" }, { id:"i9", name:"[ไอคอน] ดาวทอง", cost:350, type:"icon", value:"fa-star", icon:"fa-star" }, { id:"i10", name:"[ไอคอน] สายฟ้า", cost:400, type:"icon", value:"fa-bolt", icon:"fa-bolt" }, { id:"i11", name:"[ไอคอน] ไฟนรก", cost:500, type:"icon", value:"fa-fire", icon:"fa-fire" }, { id:"i12", name:"[ไอคอน] เพชร", cost:800, type:"icon", value:"fa-gem", icon:"fa-gem" },
    { id:"g1", name:"[ออร่า] ขาวสว่าง", cost:200, type:"glow", value:"glow-white", icon:"fa-sun" }, { id:"g2", name:"[ออร่า] เขียว", cost:250, type:"glow", value:"glow-green", icon:"fa-code" }, { id:"g3", name:"[ออร่า] ฟ้า", cost:300, type:"glow", value:"glow-blue", icon:"fa-water" }, { id:"g4", name:"[ออร่า] ชมพู", cost:350, type:"glow", value:"glow-pink", icon:"fa-heart" }, { id:"g5", name:"[ออร่า] เหลือง", cost:400, type:"glow", value:"glow-yellow", icon:"fa-triangle-exclamation" },
    { id:"g6", name:"[ออร่า] ม่วง", cost:500, type:"glow", value:"glow-purple", icon:"fa-moon" }, { id:"g7", name:"[ออร่า] แดง", cost:600, type:"glow", value:"glow-red", icon:"fa-fire" }, { id:"g8", name:"[ออร่า] ทองคำ", cost:800, type:"glow", value:"glow-gold", icon:"fa-coins" }, { id:"g9", name:"[ออร่า] ดำ", cost:1000, type:"glow", value:"glow-dark", icon:"fa-meteor" }, { id:"g10", name:"[ออร่า] รุ้งเกมมิ่ง", cost:1200, type:"glow", value:"glow-rgb", icon:"fa-palette" },
    { id:"f1", name:"[กรอบ] เหล็กกล้า", cost:300, type:"frame", value:"frame-steel", icon:"fa-circle-notch" }, { id:"f2", name:"[กรอบ] 8-Bit พิกเซล", cost:350, type:"frame", value:"frame-pixel", icon:"fa-square" }, { id:"f3", name:"[กรอบ] นีออนบลู", cost:400, type:"frame", value:"frame-neon", icon:"fa-circle" }, { id:"f4", name:"[กรอบ] ไซเบอร์พังก์", cost:500, type:"frame", value:"frame-cyber", icon:"fa-microchip" }, { id:"f5", name:"[กรอบ] โฮโลแกรม", cost:600, type:"frame", value:"frame-holo", icon:"fa-compact-disc" },
    { id:"f6", name:"[กรอบ] ไฟนรก", cost:700, type:"frame", value:"frame-fire", icon:"fa-fire-flame-curved" }, { id:"f7", name:"[กรอบ] วงเวทย์", cost:800, type:"frame", value:"frame-magic", icon:"fa-star-of-david" }, { id:"f8", name:"[กรอบ] สายฟ้า", cost:1000, type:"frame", value:"frame-lightning", icon:"fa-bolt" }, { id:"f9", name:"[กรอบ] เพชร", cost:1200, type:"frame", value:"frame-diamond", icon:"fa-gem" }, { id:"f10", name:"[กรอบ] เกราะพระเจ้า", cost:1500, type:"frame", value:"frame-god", icon:"fa-shield-halved" }
];

const SKILLS_DB = [
    { id:"s1", name:"ส่งงานเลท 1 วัน", tree:"tank", costSP:1, costMP:40, desc:"ไม่ต้องโดนหักคะแนนหากส่งช้า 1 วัน" }, { id:"s2", name:"โล่ศักดิ์สิทธิ์", tree:"tank", costSP:1, costMP:30, desc:"ป้องกันครูเรียกสุ่มตอบ 1 คาบ" }, { id:"s3", name:"แว่นขยาย", tree:"tank", costSP:2, costMP:50, desc:"ขอคำใบ้จากครูในการเขียนโค้ด" }, { id:"s4", name:"ตาทิพย์", tree:"tank", costSP:2, costMP:60, desc:"เปิดดูสมุด 3 นาทีตอนทำควิซ" }, { id:"s5", name:"ลากิจทิพย์", tree:"tank", costSP:3, costMP:80, desc:"แก้ตัวกรณีมาสายไม่ให้โดนหักคะแนน" }, { id:"s6", name:"Bypass", tree:"tank", costSP:3, costMP:100, desc:"ข้ามเควสย่อย 1 ข้อ" }, { id:"s7", name:"ยืดเวลาส่ง", tree:"tank", costSP:4, costMP:150, desc:"ขอยืดเวลาส่งงานกลุ่มให้ทั้งกลุ่ม" }, { id:"s8", name:"ย้อนเวลา", tree:"tank", costSP:5, costMP:200, desc:"ขอรีเซ็ตบอสไฟต์ทำใหม่ 1 ครั้ง" },
    { id:"s9", name:"โอนพลัง", tree:"support", costSP:1, costMP:10, desc:"โอน MP ตัวเองให้เพื่อน (เสียค่าธรรมเนียม)" }, { id:"s10", name:"บัฟถามฟรี", tree:"support", costSP:1, costMP:20, desc:"ทำให้เพื่อนถามครูได้ฟรี 1 คำถาม" }, { id:"s11", name:"เดินสำรวจ", tree:"support", costSP:2, costMP:40, desc:"อนุญาตให้ลุกไปถามเพื่อนต่างกลุ่ม 5 นาที" }, { id:"s12", name:"EXP คูณสอง", tree:"support", costSP:2, costMP:50, desc:"โยนบัฟให้เพื่อนตอบคำถามได้ EXP สองเท่า" }, { id:"s13", name:"ติวเตอร์", tree:"support", costSP:3, costMP:60, desc:"แลก MP ตัวเองเป็น EXP ให้เพื่อน" }, { id:"s14", name:"ชุบชีวิตงาน", tree:"support", costSP:3, costMP:80, desc:"กู้คืนงานเพื่อนที่ลืมส่งให้กลับมาส่งได้" }, { id:"s15", name:"โล่หมู่", tree:"support", costSP:4, costMP:120, desc:"คุ้มครองทั้งกลุ่มไม่ให้โดนเรียกตอบ" }, { id:"s16", name:"ฮีลหมู่", tree:"support", costSP:5, costMP:200, desc:"เติม MP ให้ทุกคนในกลุ่ม" },
    { id:"s17", name:"วาร์ปด่วน", tree:"mage", costSP:1, costMP:15, desc:"ขอเข้าห้องน้ำ VIP โดยไม่ต้องขออนุญาต" }, { id:"s18", name:"ยืดเส้น", tree:"mage", costSP:1, costMP:20, desc:"ขอลุคเดินยืดเส้นยืดสาย 3 นาที" }, { id:"s19", name:"เปิดเพลง", tree:"mage", costSP:2, costMP:30, desc:"ขอเปิด BGM 1 เพลงให้ทั้งห้องฟัง" }, { id:"s20", name:"หูฟังส่วนตัว", tree:"mage", costSP:2, costMP:40, desc:"ขอใส่หูฟังตัวเองทำงาน 1 คาบ" }, { id:"s21", name:"เสบียง", tree:"mage", costSP:3, costMP:50, desc:"ขอกินขนมหน้าคอม 1 คาบ" }, { id:"s22", name:"สลับที่นั่ง", tree:"mage", costSP:3, costMP:60, desc:"ขอสลับคอมกับเพื่อน (เพื่อนต้องยอม)" }, { id:"s23", name:"ลบความจำ", tree:"mage", costSP:4, costMP:100, desc:"ลบประวัติมาสายของตัวเอง 1 ครั้ง" }, { id:"s24", name:"ปิดไมค์", tree:"mage", costSP:5, costMP:150, desc:"ระงับคำสั่งบ่นของครู 1 นาที" }
];

const GACHA_POOL = [
    { id:"g1", name:"EXP Boost (S)", type:"salt", prob:30, desc:"กินแล้วได้ 10 EXP" }, { id:"g2", name:"EXP Boost (M)", type:"salt", prob:25, desc:"กินแล้วได้ 25 EXP" }, { id:"g3", name:"EXP Boost (L)", type:"salt", prob:15, desc:"กินแล้วได้ 50 EXP" },
    { id:"g4", name:"[การ์ด] ป้องกันสุ่ม", type:"rare", prob:10, desc:"ใช้รอดตัวจากการเรียก 1 ครั้ง" }, { id:"g5", name:"[การ์ด] ขโมยเหรียญ", type:"rare", prob:10, desc:"สุ่มปล้น 50-100 Coins จากเพื่อน" }, { id:"g6", name:"[การ์ด] บัฟกลุ่ม x2", type:"rare", prob:5, desc:"ทั้งกลุ่มได้ EXP จากกิจกรรม x2 1 คาบ" },
    { id:"g7", name:"[Ultimate] เนตรพระเจ้า", type:"ultimate", prob:2, desc:"ขอดูเฉลยโค้ด/โจทย์ 1 จุดแบบเน้นๆ" }, { id:"g8", name:"[Ultimate] รีเซ็ตคะแนน", type:"ultimate", prob:1.5, desc:"ลบงานที่คะแนนน้อยเพื่อทำส่งใหม่ 1 งาน" }, { id:"g9", name:"[Ultimate] เผด็จการ", type:"ultimate", prob:1, desc:"สั่งให้เพื่อน 1 คนต้องพรีเซนต์งานแทน" }, { id:"g10", name:"[Ultimate] Domain Expansion", type:"ultimate", prob:0.5, desc:"ตั้งกฎห้องเรียน 1 คาบ" }
];

const CASES_DB = [
    { title: "คดีที่ 1: ขโมยซอร์สโค้ด", story: "ใครขโมยซอร์สโค้ด? ที่ไหน? ใช้อะไร?", suspects: ["นาย A", "นางสาว B", "เด็กชาย C", "นาง D"], locations: ["ห้องเซิร์ฟเวอร์", "ห้องพักครู", "สวน", "โรงอาหาร"], weapons: ["แฟลชไดรฟ์", "แล็ปท็อป", "มือถือ", "แท็บเล็ต"], clues: ["1. C ไปโรงอาหาร","2. มีแท็บเล็ตที่โรงอาหาร","3. D อยู่ห้องพักครู","4. ห้องพักครูใช้แล็ปท็อป","5. โจรเข้าเซิร์ฟเวอร์","6. โจรใช้แฟลชไดรฟ์","7. B ไม่มีมือถือ/แท็บเล็ต","8. A ไม่ไปห้องพักครู/โรงอาหาร","9. สวนไม่ใช้แล็ปท็อป/แท็บเล็ต","10. B แอบเข้าเซิร์ฟเวอร์"], ansWho: "นางสาว B", ansWhere: "ห้องเซิร์ฟเวอร์", ansWhat: "แฟลชไดรฟ์" },
    { title: "คดีที่ 2: แฮกเกอร์ป่วนเว็บ", story: "ใครแฮกเว็บ? ที่ไหน? ใช้อะไร?", suspects: ["ประธาน", "หัวหน้าห้อง", "ภารโรง", "ครูฝึกสอน"], locations: ["ห้องสมุด", "ห้องคอม", "ดาดฟ้า", "สนามบาส"], weapons: ["สมาร์ทวอทช์", "มินิพีซี", "แว่นตา", "โน้ตบุ๊ก"], clues: ["1. ครูไปสนามบาส","2. มีแว่นที่ดาดฟ้า","3. ภารโรงอยู่ดาดฟ้า","4. ห้องสมุดใช้โน้ตบุ๊ก","5. ประธานอยู่ห้องสมุด","6. แฮกเกอร์ใช้มินิพีซี","7. แฮกเกอร์อยู่ห้องคอม","8. สนามบาสใช้วอทช์","9. หัวหน้าห้องไม่ใช้วอทช์/โน้ตบุ๊ก","10. หัวหน้าอยู่ห้องคอม"], ansWho: "หัวหน้าห้อง", ansWhere: "ห้องคอม", ansWhat: "มินิพีซี" },
    { title: "คดีที่ 3: ไวรัสลบการบ้าน", story: "ใครปล่อยไวรัสลบงานเพื่อน?", suspects: ["สมชาย", "สมหญิง", "สมศักดิ์", "สมปอง"], locations: ["โต๊ะหินอ่อน", "ใต้บันได", "พยาบาล", "ดนตรี"], weapons: ["ทรัมบ์ไดรฟ์", "อีเมล", "โดรน", "บลูทูธ"], clues: ["1. สมหญิงไปพยาบาล","2. ห้องพยาบาลใช้อีเมล","3. สมชายไปดนตรี","4. ดนตรีใช้บลูทูธ","5. ใต้บันไดใช้โดรน","6. สมศักดิ์อยู่ใต้บันได","7. โจรอยู่โต๊ะหินอ่อน","8. โจรใช้ทรัมบ์ไดรฟ์","9. สมปองไม่ไปพยาบาล/ดนตรี/บันได","10. สมปองมีทรัมบ์ไดรฟ์"], ansWho: "สมปอง", ansWhere: "โต๊ะหินอ่อน", ansWhat: "ทรัมบ์ไดรฟ์" }
];


// ================= ระบบล็อคอินและการจัดการบัญชี (Auth) =================
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
    const n = document.getElementById('regName').value.trim(); 
    const id = document.getElementById('regId').value.trim(); 
    const r = document.getElementById('regRoom').value; 
    const num = document.getElementById('regNumber').value.trim(); 
    const p = document.getElementById('regPass').value;
    
    if(!n || !id || !r || !num) return alert("กรุณากรอกข้อมูลให้ครบถ้วน!"); 
    if(p.length < 6) return alert("รหัสผ่านต้องมีอย่างน้อย 6 ตัว");
    
    auth.createUserWithEmailAndPassword(id+"@srisuvit.com", p).then(res => {
        db.collection("students").doc(id).set({ 
            name: n, studentId: id, number: num, room: r, password: p, 
            level: 1, exp: 0, mana: 0, coins: 0, sp: 0, rank: "Novice", 
            caseAnswer: {who:"",where:"",what:""}, completedBosses: [], submittedMissions: [], returnedMissions: [], 
            scores: {s1:0,s2:0,s3:0,mid:0,s4:0,s5:0,s6:0,final:0}, 
            inventory: [], bag: [], cards: [], unlockedSkills: [], 
            equippedTitle: "", equippedIcon: "", equippedGlow: "", equippedFrame: "", 
            lastActive: firebase.firestore.FieldValue.serverTimestamp(), checkedInToday: false 
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
                document.getElementById('st-coin').innerText = userData.coins || 0; 
                document.getElementById('st-sp').innerText = userData.sp || 0; 
                document.getElementById('st-mp').innerText = userData.mana || 0; 
                document.getElementById('st-lv').innerText = userData.level || 1;
                if(userId !== TEACHER_ID && document.getElementById('chat-fab').classList.contains('hidden')){ 
                    document.getElementById('chat-fab').classList.remove('hidden'); 
                    initTeacherChatListener(); 
                }
            }
            if(!document.getElementById('game-content').innerHTML) showPage('dashboard', document.querySelector('.nav-btn'));
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
        
        db.collection("settings").doc("system").onSnapshot(doc => { 
            let d = doc.data()||{}; 
            checkinActive = d.checkinActive || false; 
            quizData = d.quizzes || {}; 
            questStatus = d.quest_board || questStatus; 
            lessonsData = d.lessons || {}; 
            caseStatus = d.monthly_case || caseStatus; 
            announcements = d.announcements || []; 
            if(document.getElementById('dash-announcements')) showPage('dashboard', document.querySelector('.nav-btn')); 
        });
    }
});

function applyUserCosmetics() {
    let titleStr = userData.equippedTitle ? `[${userData.equippedTitle}]` : ""; 
    let iconStr = userData.equippedIcon ? `<i class="fa-solid ${userData.equippedIcon}" style="margin-right:5px;"></i>` : ""; 
    let glowClass = userData.equippedGlow || "";
    
    document.getElementById('st-title').innerText = titleStr; 
    document.getElementById('st-name-wrapper').innerHTML = `${iconStr}<span class="${glowClass}">${userData.name}</span>`;
    
    let cd = document.getElementById('char-name-disp'); 
    if(cd) { 
        cd.innerHTML = `${iconStr}<span class="${glowClass}">${userData.name}</span>`; 
        let cb = document.getElementById('char-avatar-box'); 
        if(cb) cb.className = "avatar-box " + (userData.equippedFrame || ""); 
    }
}


// ================= โค้ดกลไกเศรษฐกิจ (Economy Functions) =================

function addExp(id, amt) {
    let nx = (userData.exp||0) + amt; 
    let nl = userData.level||1; 
    let nm = userData.mana||0; 
    let nsp = userData.sp||0;
    
    while(nx >= 100) { 
        nl++; 
        nx -= 100; 
        nm = nl * 10; // ฟื้นฟู MP เต็ม
        nsp += 1; 
        alert(`🎉 LEVEL UP! LV.${nl}\nฟื้นฟู MP เต็ม และรับ 1 SP!`); 
    }
    db.collection("students").doc(id).update({ exp: nx, level: nl, mana: nm, sp: nsp });
}

function rollDrops(source) {
    let count = source === 'mission' ? 3 : 5; 
    let drops = [];
    for(let i=0; i<count; i++) {
        let r = Math.random()*100; 
        let rarity = r<60 ? 'common' : (r<90 ? 'uncommon' : 'rare');
        if(source === 'boss' && i===0) rarity = 'rare'; 
        let pool = DROP_ITEMS.filter(it => it.type === rarity); 
        drops.push(pool[Math.floor(Math.random()*pool.length)]);
    }
    let bag = userData.bag || []; 
    drops.forEach(d => bag.push(d));
    db.collection("students").doc(userData.studentId).update({ bag: bag });
    alert("🎁 คุณได้รับไอเทมดรอป! เข้าไปกดขายในกระเป๋าเพื่อรับ Coins ได้เลย");
}

function sellItem(index) {
    let bag = userData.bag || []; 
    let item = bag[index]; 
    if(!item) return;
    
    let coins = (userData.coins||0) + item.price; 
    bag.splice(index, 1);
    db.collection("students").doc(userData.studentId).update({ bag: bag, coins: coins }).then(() => {
        showPage('inventory', document.querySelectorAll('.nav-btn')[4]);
    });
}

function sellAll() {
    let bag = userData.bag || []; 
    if(bag.length===0) return; 
    let earn = 0; 
    bag.forEach(i => earn += i.price);
    
    let coins = (userData.coins||0) + earn;
    db.collection("students").doc(userData.studentId).update({ bag: [], coins: coins }).then(() => { 
        alert(`ขายทั้งหมดได้ ${earn} Coins!`); 
        showPage('inventory', document.querySelectorAll('.nav-btn')[4]); 
    });
}

function rollGacha() {
    if((userData.coins||0) < 1000) return alert("Coins ไม่พอ! ต้องใช้ 1000 Coins");
    if(!confirm("แน่ใจนะว่าจะหมุนกาชา 1000 Coins?")) return;
    
    let r = Math.random()*100; 
    let item = null; 
    let pool = [];
    
    if(r < 70) pool = GACHA_POOL.filter(g=>g.type==='salt'); 
    else if(r < 95) pool = GACHA_POOL.filter(g=>g.type==='rare'); 
    else pool = GACHA_POOL.filter(g=>g.type==='ultimate');
    
    item = pool[Math.floor(Math.random()*pool.length)];
    let coins = userData.coins - 1000;
    
    if(item.type === 'salt') { 
        addExp(userData.studentId, parseInt(item.name.replace(/\D/g, ''))); 
        db.collection("students").doc(userData.studentId).update({coins:coins}).then(()=> {
            alert("เกลือ! "+item.desc); 
            showPage('inventory', document.querySelectorAll('.nav-btn')[4]);
        }); 
    } else { 
        let cards = userData.cards||[]; 
        cards.push(item); 
        db.collection("students").doc(userData.studentId).update({coins:coins, cards:cards}).then(()=> {
            alert(`🎉 OMG! ได้การ์ดระดับ ${item.type.toUpperCase()}:\n${item.name}\n${item.desc}`); 
            showPage('inventory', document.querySelectorAll('.nav-btn')[4]);
        }); 
    }
}

function useCard(index) {
    let cards = userData.cards||[]; 
    let c = cards[index]; 
    if(!c) return;
    if(confirm(`ใช้การ์ด ${c.name} ไหม? (ใช้แล้วหายไปเลย)`)) {
        cards.splice(index, 1); 
        db.collection("students").doc(userData.studentId).update({cards:cards});
        db.collection("skill_logs").add({ stu: userData.name, action: `ใช้การ์ดกาชา: ${c.name}`, time: firebase.firestore.FieldValue.serverTimestamp() });
        alert(`ใช้งาน ${c.name} แล้ว! ครูเบียร์รับทราบแล้ว รอการดำเนินการเลยครับ`); 
        showPage('inventory', document.querySelectorAll('.nav-btn')[4]);
    }
}

function unlockSkill(id, cost) {
    if((userData.sp||0) < cost) return alert("SP ไม่พอ!"); 
    let us = userData.unlockedSkills||[]; 
    if(us.includes(id)) return; 
    us.push(id);
    db.collection("students").doc(userData.studentId).update({sp: userData.sp - cost, unlockedSkills: us}).then(()=> {
        showPage('skills', document.querySelectorAll('.nav-btn')[5]);
    });
}

function castSkill(id) {
    let sk = SKILLS_DB.find(s=>s.id===id); 
    if(!sk) return;
    if((userData.mana||0) < sk.costMP) return alert("MP ไม่พอร่ายเวทย์!");
    if(confirm(`ร่ายเวทย์ ${sk.name} ใช้ ${sk.costMP} MP?`)) {
        db.collection("students").doc(userData.studentId).update({mana: userData.mana - sk.costMP});
        db.collection("skill_logs").add({ stu: userData.name, action: `ร่ายเวทย์: ${sk.name}`, time: firebase.firestore.FieldValue.serverTimestamp() });
        alert(`ร่ายเวทย์ ${sk.name} สำเร็จ! ครูเบียร์เห็นแล้ว!`); 
        showPage('skills', document.querySelectorAll('.nav-btn')[5]);
    }
}

function doCheckIn() {
    db.collection("students").doc(userData.studentId).update({ checkedInToday: true }).then(() => { 
        addExp(userData.studentId, 10); 
        alert("✅ เช็คชื่อทันเวลา รับ 10 EXP!"); 
        showPage('dashboard', document.querySelectorAll('.nav-btn')[0]); 
    });
}


// ================= ระบบแสดงผลหน้าจอ (Views & UI) =================

function showPage(id, btn) {
    const display = document.getElementById('game-content'); 
    display.innerHTML = "";
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active')); 
    if(btn) btn.classList.add('active'); 
    window.isDoingQuiz = false;

    if (id === 'dashboard') {
        let pTask = ""; 
        const sm = userData.submittedMissions || []; 
        const rm = userData.returnedMissions || [];
        
        ['unit1_m1','unit1_m2','unit2_m1','unit2_m2','unit3_m1','unit3_m2'].forEach(m => { 
            if(questStatus[m] && !sm.includes(m) && !rm.includes(m)) pTask += `<li>📄 ค้าง: ${m.toUpperCase()}</li>`; 
        });
        
        if(questStatus.boss_unit1 && !(userData.completedBosses||[]).includes('unit1')) pTask += "<li>🔥 บอส Unit 1</li>"; 
        if(questStatus.boss_unit2 && !(userData.completedBosses||[]).includes('unit2')) pTask += "<li>🔥 บอส Unit 2</li>"; 
        if(questStatus.boss_unit3 && !(userData.completedBosses||[]).includes('unit3')) pTask += "<li>🔥 บอส Unit 3</li>";
        if(!caseStatus.isRevealed && !(userData.caseAnswer && userData.caseAnswer.who)) pTask += "<li>🕵️‍♂️ ยังไม่พิพากษาคดี!</li>"; 
        if(pTask === "") pTask = "<li style='color:var(--p-green);'>ว่างจัด! ไม่มีงานค้าง</li>";
        
        let annHTML = ""; 
        announcements.forEach(a => { 
            annHTML += `<div style="background:rgba(255,204,0,0.1); border-left:4px solid #ffcc00; padding:10px; margin-bottom:10px;"><i class="fa-solid fa-bullhorn" style="color:#ffcc00;"></i> ${a}</div>`; 
        });
        
        let chkHTML = (checkinActive && !userData.checkedInToday && userData.studentId !== TEACHER_ID) 
            ? `<div style="background:rgba(0,255,65,0.1); border:1px solid #00ff41; padding:20px; text-align:center; border-radius:10px; margin-bottom:20px;"><h3 style="color:#00ff41; margin-top:0;">⚡ ประตูมิติเปิดแล้ว! ⚡</h3><button class="btn-p" style="background:#00ff41; color:#000;" onclick="doCheckIn()">กดเช็คชื่อรับ 10 EXP</button></div>` 
            : "";
            
        display.innerHTML = `<h2 class="pixel-font aqua-glow">>>> Dashboard</h2>${chkHTML}<div style="background:rgba(255,255,255,0.05); padding:30px; border-radius:15px; border:1px solid var(--glass-border);"><p style="font-size:20px;">ยินดีต้อนรับ <span class="${userData.equippedGlow||''}">${userData.name}</span></p><div id="dash-announcements">${annHTML}</div><div style="background:rgba(0,0,0,0.5); padding:15px; border-left:4px solid var(--alert-red); margin-top:20px;"><h3 class="pixel-font" style="font-size:12px; color:var(--alert-red);">[ PENDING TASKS ]</h3><ul>${pTask}</ul></div></div>`;
    }
    else if(id === 'inventory') {
        let bHTML = ""; 
        (userData.bag||[]).forEach((item, i) => { 
            bHTML += `<div class="item-card ${item.type}"><i class="fa-solid ${item.icon}" style="font-size:24px; margin-bottom:10px;"></i><div>${item.name}</div><div style="color:#ffcc00; margin:5px 0;">${item.price} Coins</div><button class="btn-p" style="padding:5px; font-size:10px; width:100%;" onclick="sellItem(${i})">ขาย</button></div>`; 
        });
        if(bHTML === "") bHTML = "<p style='grid-column:1/-1; color:#555; text-align:center;'>กระเป๋าว่างเปล่า ไปส่งงานหรือตีบอสเพื่อหาของสิ!</p>";
        
        let cHTML = ""; 
        (userData.cards||[]).forEach((c, i) => { 
            cHTML += `<div class="item-card ${c.type}" style="border-color:${c.type==='ultimate'?'#ff3366':'#ffcc00'}"><i class="fa-solid fa-scroll" style="font-size:24px; margin-bottom:10px;"></i><div style="font-weight:bold;">${c.name}</div><div style="font-size:10px; color:#aaa; margin:5px 0; height:30px;">${c.desc}</div><button class="btn-p" style="padding:5px; font-size:10px; width:100%; background:var(--detective-purple);" onclick="useCard(${i})">ใช้งาน</button></div>`; 
        });
        
        display.innerHTML = `<h2 class="pixel-font" style="color:#00ff41;">>>> Bag & Gacha</h2><div class="gacha-box"><h3 style="color:#ffcc00; margin-top:0;">ตู้กาชามรณะ 🎰</h3><p style="font-size:12px; color:#ddd;">สุ่มการ์ดสกิลอัลติเมทและไอเทมแรร์ (โอกาสออก 5%)</p><button class="btn-p pixel-font" style="background:#ffcc00; color:#000; font-size:14px; padding:15px 30px;" onclick="rollGacha()">หมุน (1000 Coins)</button></div><hr style="border-color:#444; margin:30px 0;"><h3 class="pixel-font" style="font-size:12px;">🎒 การ์ดสกิลใช้งาน</h3><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:10px; margin-bottom:30px;">${cHTML||'<p style="color:#555;">ยังไม่มีการ์ด</p>'}</div><div style="display:flex; justify-content:space-between; align-items:center;"><h3 class="pixel-font" style="font-size:12px;">📦 ไอเทมขยะ (กดขายรับ Coins)</h3><button class="btn-p btn-danger" style="font-size:10px; padding:10px;" onclick="sellAll()">💰 ขายทั้งหมด</button></div><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap:10px; margin-top:10px;">${bHTML}</div>`;
    }
    else if(id === 'skills') {
        let sHTML = ""; 
        SKILLS_DB.forEach(sk => {
            let ul = (userData.unlockedSkills||[]).includes(sk.id);
            let b = ul 
                ? `<button class="btn-p" style="width:100%; font-size:10px; background:var(--aqua); color:#000;" onclick="castSkill('${sk.id}')">⚡ ร่ายเวทย์ (${sk.costMP} MP)</button>` 
                : `<button class="btn-p" style="width:100%; font-size:10px; background:#b366ff;" onclick="unlockSkill('${sk.id}', ${sk.costSP})">🔓 ปลดล็อค (${sk.costSP} SP)</button>`;
            sHTML += `<div style="background:rgba(0,0,0,0.5); border:1px solid ${ul?'var(--aqua)':'#444'}; padding:15px; border-radius:10px; text-align:center;"><h4 style="margin-top:0; color:${ul?'var(--aqua)':'#888'};">${sk.name}</h4><p style="font-size:10px; color:#aaa; height:30px;">${sk.desc}</p>${b}</div>`;
        });
        display.innerHTML = `<h2 class="pixel-font" style="color:#b366ff;">>>> Skill Tree</h2><p style="color:#aaa;">ใช้แต้ม SP ปลดล็อคสกิลถาวร (มี SP: ${userData.sp})</p><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-top:20px;">${sHTML}</div>`;
    }
    else if (id === 'shop') {
        let shopHTML = `<h2 class="pixel-font" style="color:#ffcc00; text-shadow:0 0 10px #ffcc00;">>>> Coin Shop</h2><p style="color:#aaa;">(มี Coins: <span style="color:#ffcc00; font-weight:bold;">${userData.coins||0}</span>)</p><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-top:20px;">`;
        SHOP_ITEMS.forEach(item => {
            const isBought = (userData.inventory || []).includes(item.id);
            let isEq = (item.type==='title'&&userData.equippedTitle===item.value)||(item.type==='icon'&&userData.equippedIcon===item.value)||(item.type==='glow'&&userData.equippedGlow===item.value)||(item.type==='frame'&&userData.equippedFrame===item.value);
            let btnHTML = isEq 
                ? `<button class="btn-p pixel-font" style="background:#444; width:100%; font-size:10px;" disabled>ใช้อยู่</button>` 
                : (isBought 
                    ? `<button class="btn-p pixel-font" style="background:var(--p-green); width:100%; font-size:10px;" onclick="equipItem('${item.id}', '${item.type}', '${item.value}')">สวมใส่</button>` 
                    : `<button class="btn-p pixel-font" style="background:${(userData.coins||0)>=item.cost?'#ffcc00':'#444'}; color:#000; width:100%; font-size:10px;" ${(userData.coins||0)>=item.cost?'':'disabled'} onclick="buyItem('${item.id}', ${item.cost})">ซื้อ (${item.cost})</button>`);
            shopHTML += `<div class="shop-card ${item.type==='frame'?item.value:''}"><i class="fa-solid ${item.icon} ${item.type==='glow'?item.value:''}"></i><h3 class="${item.type==='glow'?item.value:''}" style="font-size:14px; margin:0;">${item.name}</h3>${btnHTML}</div>`;
        });
        display.innerHTML = shopHTML + "</div>";
    }
    else if (id === 'quests') {
        const rCard = (u, t, ok) => ok ? `<div class="content-card"><h3>Unit ${u}: ${t}</h3><button class="btn-p" onclick="openQuestDetail('unit${u}')">ENTER</button></div>` : `<div class="content-card" style="opacity:0.5;"><h3>Unit ${u}: ${t} 🔒</h3></div>`;
        display.innerHTML = `<h2 class="pixel-font aqua-glow">>>> Quest Board</h2><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px;">${rCard(1,"แนวคิดเชิงคำนวณ",questStatus.unit1)}${rCard(2,"การออกแบบอัลกอริทึม",questStatus.unit2)}${rCard(3,"Python",questStatus.unit3)}</div>`;
    }
    else if (id === 'lessons') {
        let html = `<h2 class="pixel-font aqua-glow">>>> Lessons</h2>`;
        ['unit1', 'unit2', 'unit3'].forEach((u, i) => { 
            html += `<h3 style="color:var(--aqua);">Unit ${i+1}</h3>`; 
            let it = lessonsData[u]||[]; 
            if(!it.length) html += `<p style="color:#aaa;">ไม่มีเนื้อหา</p>`; 
            else it.forEach(x => { html += `<div class="lesson-card"><h4>${x.title}</h4>${x.type==='youtube'?`<div class="video-container"><iframe src="${x.url}"></iframe></div>`:`<a href="${x.url}" target="_blank" style="color:var(--aqua);">เปิดลิงก์</a>`}</div>`; }); 
        });
        display.innerHTML = html;
    }
    else if (id === 'detective') {
        window.isDoingQuiz = true; 
        const cc = CASES_DB[caseStatus.activeCaseId] || CASES_DB[0];
        let clues = ""; 
        caseStatus.cluesToggle.forEach((o, i) => { if(o&&cc.clues[i]) clues += `<p style="font-size:12px; border-left:2px solid var(--aqua); padding-left:10px;">${cc.clues[i]}</p>`; });
        
        display.innerHTML = `<h2 class="pixel-font" style="color:var(--detective-purple);">>>> ${cc.title}</h2><div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:10px; margin-bottom:20px;"><p>${cc.story}</p></div><h3 class="pixel-font" style="font-size:10px; color:var(--aqua);">[ Murdle Grid ]</h3><div style="overflow-x:auto;"><table class="murdle-grid"><tr><th class="empty-cell"></th><th colspan="4" class="header-group">WHERE</th><th colspan="4" class="header-group">WHAT</th></tr><tr><th style="background:#111;"></th><th>${cc.locations[0]}</th><th>${cc.locations[1]}</th><th>${cc.locations[2]}</th><th>${cc.locations[3]}</th><th>${cc.weapons[0]}</th><th>${cc.weapons[1]}</th><th>${cc.weapons[2]}</th><th>${cc.weapons[3]}</th></tr>${[0,1,2,3].map(r=>`<tr><th style="background:rgba(0,255,255,0.1);">${cc.suspects[r]}</th>${[0,1,2,3,4,5,6,7].map(c=>getCell(r,c,c===3)).join('')}</tr>`).join('')}<tr><td colspan="9" class="empty-cell" style="height:10px;"></td></tr>${[0,1,2,3].map(r=>`<tr><th style="background:rgba(0,255,255,0.1);">${cc.weapons[r]}</th>${[0,1,2,3].map(c=>getCell(r+4,c,c===3)).join('')}<td colspan="4" class="empty-cell"></td></tr>`).join('')}</table></div><div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-top:20px;"><div style="background:rgba(0,0,0,0.4); padding:20px; border-radius:10px;"><h3>[ Clues ]</h3>${clues||'🔒 No clues'}</div><div style="background:rgba(0,0,0,0.4); padding:20px; border-radius:10px; border:1px solid var(--aqua);"><h3>[ Judge ]</h3><select id="ansWho"><option value="">-- Who? --</option>${cc.suspects.map(s=>`<option value="${s}">${s}</option>`).join('')}</select><select id="ansWhere"><option value="">-- Where? --</option>${cc.locations.map(l=>`<option value="${l}">${l}</option>`).join('')}</select><select id="ansWhat"><option value="">-- What? --</option>${cc.weapons.map(w=>`<option value="${w}">${w}</option>`).join('')}</select><button class="btn-p" style="width:100%; margin-top:10px;" onclick="saveCaseAnswer()">ส่งคำพิพากษา</button></div></div>`;
    }
    else if (id === 'status') {
        const intStat = Math.floor(userData.level * 1.5) + 10; const agiStat = Math.floor(userData.level * 1.2) + 8; const lukStat = Math.floor(userData.level * 2.0) + 5; let ic = userData.equippedIcon?`<i class="fa-solid ${userData.equippedIcon}" style="margin-right:5px; color:var(--aqua);"></i>`:"";
        display.innerHTML = `<h2 class="pixel-font aqua-glow">>>> Character Profile</h2><div style="display:flex; flex-wrap:wrap; gap:30px;"><div style="flex:1; background:rgba(255,255,255,0.05); padding:30px; border-radius:20px; text-align:center;"><div class="avatar-box ${userData.equippedFrame||''}" style="width:100px; height:100px; background:var(--aqua); margin:0 auto 20px auto; display:flex; align-items:center; justify-content:center; font-size:40px; color:#000; border-radius:${userData.equippedFrame==='frame-cyber'?'10%':'50%'};"><i class="fa-solid fa-user-astronaut"></i></div><h3 style="margin:0;">${ic}<span class="${userData.equippedGlow||''}">${userData.name}</span></h3><p style="color:#ffcc00; font-size:12px;">${userData.equippedTitle||userData.rank}</p><p style="color:#aaa;">ID: ${userData.studentId} | ${userData.room} | เลขที่ ${userData.number}</p></div><div style="flex:2;"><div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;"><div class="stats-box">INT<span class="stats-val">${intStat}</span></div><div class="stats-box">AGI<span class="stats-val">${agiStat}</span></div><div class="stats-box">LUK<span class="stats-val">${lukStat}</span></div></div><div style="background:rgba(0,0,0,0.3); padding:20px; border-radius:12px; margin-top:20px;"><p>EXP Progress</p><div class="bar-outer"><div class="bar-fill" style="width:${userData.exp}%; background:var(--aqua);"></div></div><p style="text-align:right;">${userData.exp} / 100</p></div></div></div>`;
    }
    else if (id === 'teacher') {
        display.innerHTML = `
            <h2 class="pixel-font" style="color:#ffcc00;">>>> Kru Beer Admin</h2>
            <div style="display:flex; flex-wrap:wrap; gap:10px; margin:20px 0;">
                <button class="btn-p" onclick="viewTeacher('students')">โปรไฟล์เด็ก</button>
                <button class="btn-p" style="background:#00ccff; color:#000;" onclick="viewTeacher('attendance')">เช็คชื่อ</button>
                <button class="btn-p" onclick="viewTeacher('grading')">สมุดคะแนน</button>
                <button class="btn-p" onclick="viewTeacher('assignments')">ตรวจงาน</button>
                <button class="btn-p" onclick="viewTeacher('online')">เช็คออนไลน์</button>
                <button class="btn-p" onclick="viewTeacher('skills')">Skill Logs</button>
                <button class="btn-p" onclick="viewTeacher('chat')">แชท</button>
                <button class="btn-p" onclick="viewTeacher('announcements')">ประกาศ</button>
                <button class="btn-p" onclick="viewTeacher('lessons')">สื่อสอน</button>
                <button class="btn-p" onclick="viewTeacher('quizzes')">ข้อสอบ</button>
                <button class="btn-p" onclick="viewTeacher('quests')">ระบบ/เควส</button>
                <button class="btn-p" onclick="viewTeacher('detective')">คดี</button>
            </div>
            <div id="teacher-view"></div>`;
        viewTeacher('students');
    }
}


// ================= ระบบต่างๆ สำหรับนักเรียน =================

// ระบบแชทนักเรียน
function toggleChatWidget() { const widget = document.getElementById('chat-widget'); widget.classList.toggle('hidden'); if(!widget.classList.contains('hidden')) scrollToBottom(); }
function renderChatHistory() {
    const box = document.getElementById('chat-history'); box.innerHTML = "";
    if(!window.teacherMessages || window.teacherMessages.length === 0) box.innerHTML = `<div style="text-align:center; color:#888; font-size:10px; margin-top:50px;">พิมพ์เพื่อแชทกับครู</div>`;
    else { window.teacherMessages.forEach(m => { let sClass = m.sender === 'teacher' ? 'teacher' : 'me'; let sName = m.sender === 'teacher' ? '👨‍🏫 ครูเบียร์: ' : ''; box.innerHTML += `<div class="msg ${sClass}"><b>${sName}</b>${m.text}</div>`; }); } 
    scrollToBottom();
}
function scrollToBottom() { const box = document.getElementById('chat-history'); box.scrollTop = box.scrollHeight; }
function handleChatEnter(e) { if(e.key === 'Enter') sendChatMessage(); }
function sendChatMessage() {
    const input = document.getElementById('chat-input'); const text = input.value.trim(); if(!text) return;
    db.collection("chats").doc(userData.studentId).collection("messages").add({ sender: 'student', text: text, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    db.collection("chats").doc(userData.studentId).set({ studentName: userData.name, lastUpdate: firebase.firestore.FieldValue.serverTimestamp() }, {merge: true}); input.value = "";
}
function initTeacherChatListener() { 
    db.collection("chats").doc(userData.studentId).collection("messages").orderBy("timestamp", "asc").onSnapshot(snap => { 
        window.teacherMessages = []; snap.forEach(doc => window.teacherMessages.push(doc.data())); 
        if(!document.getElementById('chat-widget').classList.contains('hidden')) renderChatHistory(); 
    }); 
}

// Quest Board
function openQuestDetail(u) {
    const sm = userData.submittedMissions || []; const rm = userData.returnedMissions || [];
    const isBoss = (userData.completedBosses || []).includes(u); const isOpen = questStatus['boss_' + u]; let m1 = "", m2 = "";
    
    if(questStatus[`${u}_m1`]) { if(rm.includes(`${u}_m1`)) m1 = `<div style="color:#33ccff; padding:10px; text-align:center;">🔄 ตรวจและส่งคืนแล้ว</div>`; else if(sm.includes(`${u}_m1`)) m1 = `<div style="color:#00ff41; padding:10px; text-align:center;">✅ ส่งแล้ว</div>`; else m1 = `<input type="file" id="f_${u}_1" style="background:#000;"><button class="btn-p" onclick="uploadDrive('f_${u}_1', '${u}_m1')">ส่งงาน (ดรอปไอเทม)</button>`; } else m1 = `<div style="color:#888;">🔒 ล็อค</div>`;
    if(questStatus[`${u}_m2`]) { if(rm.includes(`${u}_m2`)) m2 = `<div style="color:#33ccff; padding:10px; text-align:center;">🔄 ตรวจและส่งคืนแล้ว</div>`; else if(sm.includes(`${u}_m2`)) m2 = `<div style="color:#00ff41; padding:10px; text-align:center;">✅ ส่งแล้ว</div>`; else m2 = `<input type="file" id="f_${u}_2" style="background:#000;"><button class="btn-p" onclick="uploadDrive('f_${u}_2', '${u}_m2')">ส่งงาน (ดรอปไอเทม)</button>`; } else m2 = `<div style="color:#888;">🔒 ล็อค</div>`;
    
    let bossHTML = isBoss ? `<div style="color:#00ff41;">🎉 BOSS CLEARED!</div>` : (!isOpen ? `<div style="color:#888;">🔒 BOSS LOCKED</div>` : `<div id="quiz-container_${u}"></div>`);
    
    document.getElementById('game-content').innerHTML = `<button class="btn-p" style="background:transparent; border:1px solid #fff; color:#fff; padding:10px; font-size:10px; margin-bottom:20px;" onclick="showPage('quests', document.querySelectorAll('.nav-btn')[2])"><< กลับ</button><h2 class="pixel-font aqua-glow">>>> ${u.toUpperCase()}</h2><div style="background:rgba(0,255,255,0.05); border:1px solid var(--aqua); padding:20px; border-radius:10px; margin-bottom:20px;"><h3>[M 1]</h3>${m1}</div><div style="background:rgba(0,255,255,0.05); border:1px solid var(--aqua); padding:20px; border-radius:10px; margin-bottom:20px;"><h3>[M 2]</h3>${m2}</div><div style="background:rgba(255,51,102,0.1); border:1px solid var(--alert-red); padding:20px; border-radius:10px;"><h3 style="color:var(--alert-red);">>>> BOSS FIGHT</h3>${bossHTML}</div>`;
    
    if(!isBoss && isOpen) {
        window.isDoingQuiz = true; let qHTML = ""; const qs = quizData[u] || [];
        if(!qs.length) document.getElementById(`quiz-container_${u}`).innerHTML = "<p>รอครูลงข้อสอบ...</p>";
        else { qs.forEach((q,i) => { qHTML += `<div style="background:#111; padding:15px; margin:15px 0; border-left:4px solid var(--alert-red);"><strong>ข้อ ${i+1}:</strong> ${q.q}<br><label><input type="radio" name="q_${u}_${i}" value="A"> ${q.a}</label><br><label><input type="radio" name="q_${u}_${i}" value="B"> ${q.b}</label><br><label><input type="radio" name="q_${u}_${i}" value="C"> ${q.c}</label><br><label><input type="radio" name="q_${u}_${i}" value="D"> ${q.d}</label></div>`; }); document.getElementById(`quiz-container_${u}`).innerHTML = qHTML + `<button class="btn-p btn-danger" style="width:100%;" onclick="submitBoss('${u}')">โจมตี!</button>`; }
    }
}

function uploadDrive(inputId, missionId) {
    const file = document.getElementById(inputId).files[0]; if(!file) return alert("เลือกไฟล์!");
    const btn = event.target; btn.innerText = "กำลังอัปโหลด..."; btn.disabled = true;
    const reader = new FileReader(); reader.readAsDataURL(file);
    reader.onload = function() {
        const payload = { file: reader.result, filename: file.name, missionId: missionId, studentName: userData.name };
        fetch(GAS_URL, { method: "POST", body: JSON.stringify(payload) }).then(res => res.text()).then(resp => {
            if(resp === "Success") { let sm = userData.submittedMissions || []; sm.push(missionId); db.collection("students").doc(userData.studentId).update({ submittedMissions: sm }).then(() => { rollDrops('mission'); openQuestDetail(missionId.split('_')[0]); }); } else { alert("Error: "+resp); btn.innerText = "UPLOAD"; btn.disabled = false; }
        });
    };
}

function submitBoss(u) {
    if(!confirm("ส่งแล้วแก้ไม่ได้ ยืนยัน?")) return; window.isDoingQuiz = false; const qs = quizData[u] || []; let score = 0;
    qs.forEach((q, i) => { const sel = document.querySelector(`input[name="q_${u}_${i}"]:checked`); if(sel && sel.value === q.key) score++; });
    let cb = userData.completedBosses || []; cb.push(u);
    db.collection("students").doc(userData.studentId).update({ completedBosses: cb }).then(() => { addExp(userData.studentId, score*10); rollDrops('boss'); showPage('quests', document.querySelectorAll('.nav-btn')[2]); });
}

// Detective
function getCell(r, c, isBorder=false) { let val = window.murdleState[`r${r}c${c}`] || ""; return `<td class="clickable ${val==='O'?'yes':(val==='X'?'no':'')}" style="${isBorder?'border-right:3px solid #666;':''}" onclick="clickGrid(${r},${c})">${val}</td>`; }
function clickGrid(r, c) { let k = `r${r}c${c}`; let curr = window.murdleState[k] || ""; window.murdleState[k] = curr === "" ? "X" : (curr === "X" ? "O" : ""); showPage('detective', document.querySelector('.detective-btn')); }
function saveCaseAnswer() { const who = document.getElementById('ansWho').value; const where = document.getElementById('ansWhere').value; const what = document.getElementById('ansWhat').value; if(!who||!where||!what) return alert("ข้อมูลไม่ครบ!"); db.collection("students").doc(userData.studentId).update({ caseAnswer: {who:who, where:where, what:what} }).then(() => alert("บันทึกสำเร็จ!")); }

// Shop / Equip
function buyItem(id, cost) { if((userData.coins||0) >= cost) { let inv = userData.inventory || []; inv.push(id); db.collection("students").doc(userData.studentId).update({ coins: userData.coins - cost, inventory: inv }).then(() => {alert("ซื้อสำเร็จ!"); showPage('shop', document.querySelectorAll('.nav-btn')[6]);}); } else { alert("Coins ไม่พอ!");} }
function equipItem(id, type, val) { let upd = {}; if(type==='title') upd.equippedTitle = val; if(type==='icon') upd.equippedIcon = val; if(type==='glow') upd.equippedGlow = val; if(type==='frame') upd.equippedFrame = val; db.collection("students").doc(userData.studentId).update(upd).then(() => {alert("สวมใส่แล้ว!"); showPage('shop', document.querySelectorAll('.nav-btn')[6]);}); }


// ================= ระบบแผงควบคุมครูเบียร์ (Teacher Admin) =================

function generateRoomTabs(v) {
    let html = `<div style="display:flex; gap:5px; margin-bottom:15px; overflow-x:auto;">`;
    [...ROOMS_LIST, "อื่นๆ"].forEach(r => { html += `<button class="btn-p" style="padding:8px 15px; font-size:10px; background:${r===currentTeacherRoom?'var(--aqua)':'#444'}; color:${r===currentTeacherRoom?'#000':'#fff'};" onclick="currentTeacherRoom='${r}'; viewTeacher('${v}');">🏠 ${r}</button>`; });
    return html + `</div>`;
}

function generateGroupedTables(list, rFunc, hHTML) {
    let fList = currentTeacherRoom === 'อื่นๆ' ? list.filter(s => !ROOMS_LIST.includes(s.room)) : list.filter(s => s.room === currentTeacherRoom);
    return `<div style="overflow-x:auto;"><table class="admin-table" style="min-width:800px;">${hHTML}${fList.map(s=>rFunc(s)).join('')}</table></div>`;
}

// ฟังก์ชันเช็คชื่อ
function toggleAtt(id) {
    let card = document.getElementById(`att_card_${id}`); let stat = document.getElementById(`att_status_${id}`);
    if(!window.absentList) window.absentList = [];
    if(window.absentList.includes(id)) { window.absentList.splice(window.absentList.indexOf(id), 1); card.style.borderColor = "#444"; stat.innerHTML = "✅ มาเรียน"; stat.style.color = "#00ff41"; } 
    else { window.absentList.push(id); card.style.borderColor = "var(--alert-red)"; stat.innerHTML = "❌ ขาดเรียน"; stat.style.color = "var(--alert-red)"; }
}
function saveAttendance(date) {
    if(!confirm("ยืนยันการบันทึกข้อมูลเช็คชื่อ?")) return;
    db.collection("attendance").doc(date + "_" + currentTeacherRoom).set({ date: date, room: currentTeacherRoom, absentIds: window.absentList || [], timestamp: firebase.firestore.FieldValue.serverTimestamp() }).then(() => alert("บันทึกการเช็คชื่อห้อง " + currentTeacherRoom + " สำเร็จ!"));
}
function loadHistory() {
    let date = document.getElementById('history-date').value; let resBox = document.getElementById('history-result');
    if(!date) return alert("กรุณาเลือกวันที่"); resBox.innerHTML = "กำลังค้นหาข้อมูล...";
    db.collection("attendance").doc(date + "_" + currentTeacherRoom).get().then(doc => {
        if(doc.exists) {
            let absentIds = doc.data().absentIds || [];
            if(absentIds.length === 0) resBox.innerHTML = `<div style="color:#00ff41; padding:15px; border:1px dashed #00ff41; border-radius:8px; text-align:center;">🎉 วันที่ ${date} ห้อง ${currentTeacherRoom} <b>มาครบทุกคน!</b></div>`;
            else {
                db.collection("students").where("room", "==", currentTeacherRoom).get().then(snap => {
                    let absentNames = []; snap.forEach(sDoc => { let s = sDoc.data(); if(absentIds.includes(s.studentId)) absentNames.push(`เลขที่ ${s.number||'-'} : ${s.name}`); });
                    resBox.innerHTML = `<div style="background:rgba(255,51,102,0.1); padding:15px; border:1px solid var(--alert-red); border-radius:8px;"><h4 style="color:var(--alert-red); margin-top:0;">❌ ขาดเรียน (${absentNames.length} คน)</h4><ul style="color:#ddd; margin-bottom:0;">` + absentNames.map(n => `<li>${n}</li>`).join('') + `</ul></div>`;
                });
            }
        } else resBox.innerHTML = `<div style="color:#aaa; text-align:center; padding:15px; border:1px dashed #555; border-radius:8px;">ไม่พบข้อมูลของห้อง ${currentTeacherRoom} ในวันที่ ${date}</div>`;
    });
}

// Teacher Main Navigation
function viewTeacher(v) {
    const box = document.getElementById('teacher-view'); box.innerHTML = "Loading...";
    
    if (v === 'students') {
        db.collection("students").where("studentId", "!=", TEACHER_ID).get().then(snap => {
            let list = []; snap.forEach(doc => list.push(doc.data())); list.sort((a,b) => (parseInt(a.number)||0) - (parseInt(b.number)||0));
            const addForm = `<div style="background:rgba(255,204,0,0.1); border:1px dashed #ffcc00; padding:15px; border-radius:10px; margin-bottom:20px;"><h4>➕ เพิ่มเด็ก</h4><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap:5px;"><input id="tAddName" placeholder="ชื่อ"><input id="tAddId" placeholder="User"><input id="tAddPass" placeholder="Pass"><select id="tAddRoom"><option value="London">London</option><option value="Newyork">Newyork</option><option value="Tokyo">Tokyo</option><option value="Paris">Paris</option><option value="Seoul">Seoul</option></select><input id="tAddNum" type="number" placeholder="เลข"><button class="btn-p" onclick="teacherCreateStudent()">สร้าง</button></div></div>`;
            const header = `<tr><th>ห้อง</th><th>เลข</th><th>User</th><th>Pass</th><th>ชื่อ</th><th>LV/EXP</th><th>MP</th><th>Coins</th><th>SP</th><th>Action</th></tr>`;
            const render = (s) => `<tr><td><select class="edit-input" style="width:70px;" id="r_${s.studentId}"><option value="London" ${s.room==='London'?'selected':''}>London</option><option value="Newyork" ${s.room==='Newyork'?'selected':''}>Newyork</option><option value="Tokyo" ${s.room==='Tokyo'?'selected':''}>Tokyo</option><option value="Paris" ${s.room==='Paris'?'selected':''}>Paris</option><option value="Seoul" ${s.room==='Seoul'?'selected':''}>Seoul</option><option value="${s.room}" ${!ROOMS_LIST.includes(s.room)?'selected':''} style="display:${!ROOMS_LIST.includes(s.room)?'block':'none'}">${s.room}</option></select></td><td><input type="number" class="edit-input" style="width:40px;" id="n_${s.studentId}" value="${s.number||''}"></td><td>${s.studentId}</td><td><input type="text" class="edit-input" style="width:60px;" id="p_${s.studentId}" value="${s.password||''}"></td><td><input type="text" class="name-input" id="name_${s.studentId}" value="${s.name}"></td><td><input type="number" class="edit-input" style="width:40px;" id="lv_${s.studentId}" value="${s.level||1}">/<input type="number" class="edit-input" style="width:40px;" id="exp_${s.studentId}" value="${s.exp||0}"></td><td><input type="number" class="edit-input" style="width:40px;" id="mp_${s.studentId}" value="${s.mana||0}"></td><td><input type="number" class="edit-input" style="width:50px;" id="coin_${s.studentId}" value="${s.coins||0}"></td><td><input type="number" class="edit-input" style="width:40px;" id="sp_${s.studentId}" value="${s.sp||0}"></td><td><button class="btn-p" style="padding:5px;" onclick="saveStudentProfile('${s.studentId}')">Save</button><button class="btn-p btn-danger" style="padding:5px;" onclick="deleteStudent('${s.studentId}')">ลบ</button></td></tr>`;
            box.innerHTML = addForm + generateRoomTabs('students') + generateGroupedTables(list, render, header);
        });
    }
    else if (v === 'attendance') {
        window.absentList = []; 
        db.collection("students").where("studentId", "!=", TEACHER_ID).get().then(snap => {
            let list = []; snap.forEach(doc => list.push(doc.data()));
            let fList = currentTeacherRoom === 'อื่นๆ' ? list.filter(s => !ROOMS_LIST.includes(s.room)) : list.filter(s => s.room === currentTeacherRoom);
            fList.sort((a,b) => (parseInt(a.number)||0) - (parseInt(b.number)||0));

            let tzOffset = (new Date()).getTimezoneOffset() * 60000;
            let today = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];

            let html = `<div style="background:rgba(0,204,255,0.05); padding:20px; border-radius:10px; margin-bottom:20px; border:1px solid #00ccff;"><h3 style="color:#00ccff; margin-top:0;">📝 เช็คชื่อประจำวัน (${today})</h3><p style="font-size:12px; color:#aaa;">คลิกที่ชื่อนักเรียนเพื่อเปลี่ยนสถานะเป็น "ขาดเรียน"</p><div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:10px; margin-bottom:20px;">`;
            fList.forEach(s => { html += `<div id="att_card_${s.studentId}" style="background:rgba(0,0,0,0.5); border:2px solid #444; padding:15px; border-radius:10px; text-align:center; cursor:pointer;" onclick="toggleAtt('${s.studentId}')"><div style="font-size:12px; color:#aaa; margin-bottom:5px;">เลขที่ ${s.number||'-'}</div><div style="font-size:14px; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.name}</div><div id="att_status_${s.studentId}" style="color:#00ff41; margin-top:10px; font-size:12px;">✅ มาเรียน</div></div>`; });
            if(fList.length === 0) html += `<div style="grid-column:1/-1; color:#888;">ไม่พบนักเรียนในห้องนี้</div>`;
            html += `</div><button class="btn-p" style="width:100%; background:#00ccff; color:#000;" onclick="saveAttendance('${today}')">💾 บันทึกการเช็คชื่อวันนี้</button></div>`;
            html += `<div style="background:rgba(255,153,0,0.1); padding:20px; border-radius:10px; border:1px solid #ff9900;"><h3 style="color:#ff9900; margin-top:0;">📅 ดูประวัติการขาดเรียน</h3><div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;"><input type="date" id="history-date" value="${today}" style="max-width:200px; margin:0;"><button class="btn-p" style="background:#ff9900; color:#000; margin:0; padding:12px;" onclick="loadHistory()">🔍 ดูข้อมูล</button></div><div id="history-result" style="margin-top:20px; font-size:14px;"></div></div>`;
            box.innerHTML = generateRoomTabs('attendance') + html;
        });
    }
    else if (v === 'grading') {
        db.collection("students").where("studentId", "!=", TEACHER_ID).get().then(snap => {
            let list = []; snap.forEach(doc => list.push(doc.data())); list.sort((a,b) => (parseInt(a.number)||0) - (parseInt(b.number)||0));
            const header = `<tr><th>เลข</th><th>ชื่อ</th><th>ช1</th><th>ช2</th><th>ช3</th><th>Pre</th><th>Mid</th><th>ช4</th><th>ช5</th><th>ช6</th><th>Post</th><th>Fin</th><th>รวม</th></tr>`;
            const render = (s) => { let sc = s.scores || {s1:0,s2:0,s3:0,mid:0,s4:0,s5:0,s6:0,final:0}; let pre = (parseFloat(sc.s1)||0)+(parseFloat(sc.s2)||0)+(parseFloat(sc.s3)||0); let post = (parseFloat(sc.s4)||0)+(parseFloat(sc.s5)||0)+(parseFloat(sc.s6)||0); let tot = pre+post+(parseFloat(sc.mid)||0)+(parseFloat(sc.final)||0); return `<tr><td>${s.number}</td><td style="white-space:nowrap;">${s.name}</td><td><input class="grade-input" id="s1_${s.studentId}" value="${sc.s1}" onchange="updateGrade('${s.studentId}')"></td><td><input class="grade-input" id="s2_${s.studentId}" value="${sc.s2}" onchange="updateGrade('${s.studentId}')"></td><td><input class="grade-input" id="s3_${s.studentId}" value="${sc.s3}" onchange="updateGrade('${s.studentId}')"></td><td id="pre_${s.studentId}" style="color:var(--aqua);">${pre}</td><td><input class="grade-input" id="mid_${s.studentId}" value="${sc.mid}" onchange="updateGrade('${s.studentId}')"></td><td><input class="grade-input" id="s4_${s.studentId}" value="${sc.s4}" onchange="updateGrade('${s.studentId}')"></td><td><input class="grade-input" id="s5_${s.studentId}" value="${sc.s5}" onchange="updateGrade('${s.studentId}')"></td><td><input class="grade-input" id="s6_${s.studentId}" value="${sc.s6}" onchange="updateGrade('${s.studentId}')"></td><td id="post_${s.studentId}" style="color:#ffcc00;">${post}</td><td><input class="grade-input" id="fin_${s.studentId}" value="${sc.final}" onchange="updateGrade('${s.studentId}')"></td><td id="tot_${s.studentId}" style="color:#00ff41;">${tot}</td></tr>`; };
            box.innerHTML = generateRoomTabs('grading') + generateGroupedTables(list, render, header);
        });
    }
    else if (v === 'assignments') {
        db.collection("students").where("studentId", "!=", TEACHER_ID).get().then(snap => {
            let list = []; snap.forEach(doc => list.push(doc.data())); list.sort((a,b) => (parseInt(a.number)||0) - (parseInt(b.number)||0));
            const header = `<tr><th>เลข</th><th>ชื่อ</th><th>U1-M1</th><th>U1-M2</th><th>U2-M1</th><th>U2-M2</th><th>U3-M1</th><th>U3-M2</th></tr>`;
            const render = (s) => { let sm = s.submittedMissions || []; let rm = s.returnedMissions || []; return `<tr><td>${s.number}</td><td style="white-space:nowrap;">${s.name}</td>${['unit1_m1','unit1_m2','unit2_m1','unit2_m2','unit3_m1','unit3_m2'].map(m => `<td>${rm.includes(m)?'🔵 คืนงาน':(sm.includes(m)?`<button class="btn-p" style="background:#00ff41; color:#000; padding:5px; font-size:10px;" onclick="returnWork('${s.studentId}','${m}')">✅ ตรวจ</button>`:'❌')}</td>`).join('')}</tr>`; };
            box.innerHTML = generateRoomTabs('assignments') + generateGroupedTables(list, render, header);
        });
    }
    else if (v === 'online') {
        db.collection("students").where("studentId", "!=", TEACHER_ID).get().then(snap => {
            let list = []; let now = new Date(); snap.forEach(doc => { let s = doc.data(); s.isOnline = s.lastActive && ((now - s.lastActive.toDate()) / 60000 <= 2); list.push(s); }); list.sort((a,b) => { if(a.isOnline===b.isOnline) return (parseInt(a.number)||0)-(parseInt(b.number)||0); return a.isOnline?-1:1; });
            const header = `<tr><th>Status</th><th>เลข</th><th>ชื่อ</th><th>เวลา</th></tr>`;
            const render = (s) => `<tr><td>${s.isOnline ? `<i class="fa-solid fa-circle" style="color:#00ff41;"></i> เล่นอยู่` : `ออฟไลน์`}</td><td>${s.number}</td><td>${s.name}</td><td>${s.lastActive?s.lastActive.toDate().toLocaleTimeString('th-TH'):'-'}</td></tr>`;
            box.innerHTML = generateRoomTabs('online') + generateGroupedTables(list, render, header);
        });
    }
    else if (v === 'skills') {
        db.collection("skill_logs").orderBy("time", "desc").limit(50).get().then(snap => {
            let html = ""; snap.forEach(doc => { let d=doc.data(); html += `<p>[${d.time?d.time.toDate().toLocaleTimeString():''}] <b>${d.stu}</b>: ${d.action}</p>`; });
            box.innerHTML = `<div style="background:#111; padding:20px; border-radius:10px; height:400px; overflow-y:auto; font-size:12px;">${html||'ไม่มีข้อมูล'}</div>`;
        });
    }
    else if (v === 'chat') {
        db.collection("chats").orderBy("lastUpdate", "desc").get().then(snap => {
            let listHTML = ""; snap.forEach(doc => { let d = doc.data(); listHTML += `<div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; margin-bottom:10px; cursor:pointer;" onclick="openTeacherChat('${doc.id}', '${d.studentName}')"><i class="fa-solid fa-user"></i> ${d.studentName}</div>`; });
            box.innerHTML = `<div style="display:flex; gap:20px;"><div style="flex:1; max-height:400px; overflow-y:auto;">${listHTML||'<p>ไม่มีข้อความ</p>'}</div><div style="flex:2; background:#000; border-radius:10px; padding:20px; display:flex; flex-direction:column; height:400px;" id="t-chat-window">คลิกชื่อนักเรียนเพื่อแชท</div></div>`;
        });
    }
    else if (v === 'announcements') {
        let annHTML = announcements.map((a, i) => `<div style="display:flex; gap:10px; margin-bottom:5px;"><input type="text" id="ann_edit_${i}" value="${a}" style="flex:1;"><button class="btn-p" onclick="editAnnounce(${i})">Save</button><button class="btn-p btn-danger" onclick="delAnnounce(${i})">Del</button></div>`).join('');
        box.innerHTML = `<div style="background:rgba(255,153,0,0.1); padding:20px;"><div style="display:flex; gap:10px; margin-bottom:20px;"><input type="text" id="new-announce" placeholder="พิมพ์ประกาศ..."><button class="btn-p" onclick="addAnnounce()">เพิ่ม</button></div>${annHTML}</div>`;
    }
    else if(v === 'lessons') {
        box.innerHTML = `<div style="background:rgba(0,0,0,0.5); padding:20px; border-radius:10px;"><h3>จัดการสื่อการสอน</h3><select onchange="loadLessonEditor(this.value)"><option value="">-- เลือก Unit --</option><option value="unit1">Unit 1</option><option value="unit2">Unit 2</option><option value="unit3">Unit 3</option></select><div id="lesson-editor-area"></div></div>`;
    }
    else if(v === 'quizzes') {
        box.innerHTML = `<div style="background:rgba(0,0,0,0.5); padding:20px; border-radius:10px;"><h3>จัดการข้อสอบ Boss</h3><select onchange="loadEditor(this.value)"><option value="">-- เลือก Unit --</option><option value="unit1">Unit 1</option><option value="unit2">Unit 2</option><option value="unit3">Unit 3</option></select><div id="editor-area"></div></div>`;
    }
    else if(v === 'quests') {
        box.innerHTML = `<div style="background:rgba(0,255,65,0.1); padding:20px; border-radius:10px; margin-bottom:20px;"><h3>เปิดประตูมิติ (Check-in รับโบนัส EXP)</h3><button class="btn-p" style="background:${checkinActive?'var(--alert-red)':'#00ff41'};" onclick="toggleSystemCheckin()">${checkinActive?'ปิดประตู (หมดเวลา)':'เปิดประตู (แจกโบนัส)'}</button></div><div style="background:rgba(0,255,255,0.1); padding:20px; border-radius:10px; margin-bottom:20px;"><h3>เปิด/ปิด ภารกิจ (ปลดล็อคเพื่อส่งงาน)</h3>${[1,2,3].map(u=>`<p>Unit ${u}</p><div style="display:flex; gap:10px;"><button class="btn-p" style="background:${questStatus[`unit${u}`]?'var(--p-green)':'#444'}" onclick="toggleSetting('quest_board','unit${u}')">ปลดล็อค Unit</button><button class="btn-p" style="background:${questStatus[`unit${u}_m1`]?'var(--aqua)':'#444'}" onclick="toggleSetting('quest_board','unit${u}_m1')">ภารกิจ 1</button><button class="btn-p" style="background:${questStatus[`unit${u}_m2`]?'var(--aqua)':'#444'}" onclick="toggleSetting('quest_board','unit${u}_m2')">ภารกิจ 2</button></div>`).join('')}</div><div style="background:rgba(255,51,102,0.1); padding:20px; border-radius:10px;"><h3>เปิด/ปิด Boss Fight</h3><div style="display:flex; gap:10px;">${[1,2,3].map(u=>`<button class="btn-p" style="background:${questStatus[`boss_unit${u}`]?'var(--alert-red)':'#444'}" onclick="toggleSetting('quest_board','boss_unit${u}')">Boss ${u}</button>`).join('')}</div></div>`;
    }
    else if(v === 'detective') {
        let tB = ""; [0,1,2,3,4,5,6,7,8,9].forEach(i => { tB += `<button class="btn-p" style="background:${caseStatus.cluesToggle[i]?'var(--aqua)':'#444'}" onclick="toggleClue(${i})">คำใบ้ ${i+1}</button>`; });
        box.innerHTML = `<div style="background:rgba(179,102,255,0.1); padding:20px; border-radius:10px;"><h3>ควบคุมคดีสืบสวน</h3><select onchange="changeActiveCase(this.value)">${CASES_DB.map((c,i)=>`<option value="${i}" ${caseStatus.activeCaseId===i?'selected':''}>${c.title}</option>`).join('')}</select><div style="display:flex; flex-wrap:wrap; gap:5px; margin:20px 0;">${tB}</div><button class="btn-p" style="width:100%; background:${caseStatus.isRevealed?'var(--alert-red)':'var(--detective-purple)'}" onclick="toggleSetting('monthly_case', 'isRevealed')">${caseStatus.isRevealed?'ปิดเฉลย':'ประกาศเฉลย'}</button></div>`;
    }
}

// --- Teacher Admin Actions & Helpers ---
function teacherCreateStudent() { const n = document.getElementById('tAddName').value; const id = document.getElementById('tAddId').value; const p = document.getElementById('tAddPass').value||"123456"; const r = document.getElementById('tAddRoom').value; const num = document.getElementById('tAddNum').value; if(!n||!id) return alert("กรอกข้อมูลให้ครบ!"); db.collection("students").doc(id).set({ name:n, studentId:id, room:r, number:num, password:p, level:1, exp:0, mana:0, coins:0, sp:0, rank:"Novice", scores:{s1:0,s2:0,s3:0,mid:0,s4:0,s5:0,s6:0,final:0}, inventory:[], bag:[], cards:[], unlockedSkills:[], completedBosses:[], submittedMissions:[], returnedMissions:[], equippedTitle:"", equippedIcon:"", equippedGlow:"", equippedFrame:"" }).then(()=>viewTeacher('students')); }
function deleteStudent(id) { if(confirm("ลบนักเรียน?")) db.collection("students").doc(id).delete().then(()=>viewTeacher('students')); }
function saveStudentProfile(id) { db.collection("students").doc(id).set({ room: document.getElementById(`r_${id}`).value, number: document.getElementById(`n_${id}`).value, name: document.getElementById(`name_${id}`).value, password: document.getElementById(`p_${id}`).value, level: parseInt(document.getElementById(`lv_${id}`).value)||1, exp: parseInt(document.getElementById(`exp_${id}`).value)||0, mana: parseInt(document.getElementById(`mp_${id}`).value)||0, coins: parseInt(document.getElementById(`coin_${id}`).value)||0, sp: parseInt(document.getElementById(`sp_${id}`).value)||0 }, {merge:true}).then(() => alert("Save Success!")); }
function updateGrade(id) { let s={s1:document.getElementById(`s1_${id}`).value,s2:document.getElementById(`s2_${id}`).value,s3:document.getElementById(`s3_${id}`).value,mid:document.getElementById(`mid_${id}`).value,s4:document.getElementById(`s4_${id}`).value,s5:document.getElementById(`s5_${id}`).value,s6:document.getElementById(`s6_${id}`).value,final:document.getElementById(`fin_${id}`).value}; db.collection("students").doc(id).set({scores:s},{merge:true}).then(()=>{ let pre=(parseFloat(s.s1)||0)+(parseFloat(s.s2)||0)+(parseFloat(s.s3)||0); let post=(parseFloat(s.s4)||0)+(parseFloat(s.s5)||0)+(parseFloat(s.s6)||0); document.getElementById(`pre_${id}`).innerText=pre; document.getElementById(`post_${id}`).innerText=post; document.getElementById(`tot_${id}`).innerText=pre+post+(parseFloat(s.mid)||0)+(parseFloat(s.final)||0); }); }
function returnWork(id, mission) { if(confirm("คืนงาน?")) db.collection("students").doc(id).get().then(doc => { let sm=doc.data().submittedMissions||[]; let rm=doc.data().returnedMissions||[]; if(sm.includes(mission)){ sm.splice(sm.indexOf(mission),1); rm.push(mission); db.collection("students").doc(id).update({submittedMissions:sm, returnedMissions:rm}).then(()=>viewTeacher('assignments')); }}); }
function toggleSetting(col, key) { let target = col==='quest_board'?questStatus:caseStatus; db.collection("settings").doc(col).set({ [key]: !target[key] }, {merge:true}); }
function toggleClue(idx) { let nt = [...caseStatus.cluesToggle]; nt[idx] = !nt[idx]; db.collection("settings").doc("monthly_case").set({ cluesToggle: nt }, {merge:true}); }
function changeActiveCase(id) { db.collection("settings").doc("monthly_case").set({ activeCaseId: parseInt(id), cluesToggle: [false,false,false,false,false,false,false,false,false,false], isRevealed: false }, {merge:true}); }
function addAnnounce() { let t = document.getElementById('new-announce').value; if(t) { let n = [...announcements, t]; db.collection("settings").doc("announcements").set({list:n}); document.getElementById('new-announce').value=''; } }
function editAnnounce(i) { let t = document.getElementById(`ann_edit_${i}`).value; let n = [...announcements]; n[i]=t; db.collection("settings").doc("announcements").set({list:n}); }
function delAnnounce(i) { let n = [...announcements]; n.splice(i,1); db.collection("settings").doc("announcements").set({list:n}); }
function toggleSystemCheckin() { db.collection("settings").doc("system").set({ checkinActive: !checkinActive }, {merge:true}).then(()=>viewTeacher('quests')); }

// แชทครู
function openTeacherChat(stuId, stuName) {
    const win = document.getElementById('t-chat-window'); win.innerHTML = `<h4 style="color:var(--aqua);">แชท: ${stuName}</h4><div id="t-chat-msgs" style="flex-grow:1; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:10px;"></div><div style="display:flex; gap:5px;"><input id="t-chat-input" placeholder="พิมพ์..."><button class="btn-p" onclick="sendTeacherMsg('${stuId}')">ส่ง</button></div>`;
    if(teacherChatUnsubscribe) teacherChatUnsubscribe();
    teacherChatUnsubscribe = db.collection("chats").doc(stuId).collection("messages").orderBy("timestamp", "asc").onSnapshot(snap => {
        const box = document.getElementById('t-chat-msgs'); if(!box) return; box.innerHTML = "";
        snap.forEach(doc => { let m = doc.data(); let bg = m.sender === 'teacher' ? 'var(--p-green)' : '#333'; let align = m.sender === 'teacher' ? 'self-end' : 'self-start'; box.innerHTML += `<div style="background:${bg}; padding:10px; border-radius:10px; max-width:80%; align-self:${align}; color:${m.sender === 'teacher' ? '#000' : '#fff'};">${m.text}</div>`; });
        box.scrollTop = box.scrollHeight;
    });
}
function sendTeacherMsg(stuId) {
    let input = document.getElementById('t-chat-input'); let text = input.value.trim(); if(!text) return;
    db.collection("chats").doc(stuId).collection("messages").add({ sender: 'teacher', text: text, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    db.collection("chats").doc(stuId).set({ lastUpdate: firebase.firestore.FieldValue.serverTimestamp() }, {merge:true}); input.value = "";
}

// ระบบสร้างสื่อและข้อสอบ
function loadLessonEditor(u) {
    const area = document.getElementById('lesson-editor-area'); if(!u) return area.innerHTML = ""; const items = lessonsData[u] || []; let html = ``;
    items.forEach((item, i) => { html += `<div style="border:1px solid #555; padding:15px; margin:15px 0; border-radius:8px;"><input type="text" value="${item.title}" placeholder="ชื่อสื่อ" onchange="lessonsData['${u}'][${i}].title=this.value"><select onchange="lessonsData['${u}'][${i}].type=this.value"><option value="youtube" ${item.type==='youtube'?'selected':''}>YouTube</option><option value="link" ${item.type==='link'?'selected':''}>Link Web</option></select><input type="text" value="${item.url}" placeholder="URL" onchange="lessonsData['${u}'][${i}].url=this.value"><button class="btn-p btn-danger" onclick="lessonsData['${u}'].splice(${i},1); loadLessonEditor('${u}');">ลบ</button></div>`; });
    html += `<div style="display:flex; gap:10px; margin-top:20px;"><button class="btn-p" onclick="if(!lessonsData['${u}']) lessonsData['${u}']=[]; lessonsData['${u}'].push({title:'',type:'youtube',url:''}); loadLessonEditor('${u}');">+ เพิ่มสื่อ</button><button class="btn-p" onclick="db.collection('settings').doc('lessons').set(lessonsData, {merge:true}).then(()=>alert('บันทึกสำเร็จ!'))">💾 เซฟ</button></div>`; area.innerHTML = html;
}
function loadEditor(u) {
    const area = document.getElementById('editor-area'); if(!u) return area.innerHTML = ""; const qs = quizData[u] || []; let html = ``;
    qs.forEach((q, i) => { html += `<div style="border:1px solid #555; padding:15px; margin:15px 0; border-radius:8px;"><strong>ข้อ ${i+1}</strong><input type="text" value="${q.q}" placeholder="โจทย์" onchange="updateQ('${u}',${i},'q',this.value)"><div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;"><input type="text" value="${q.a}" placeholder="A" onchange="updateQ('${u}',${i},'a',this.value)"><input type="text" value="${q.b}" placeholder="B" onchange="updateQ('${u}',${i},'b',this.value)"><input type="text" value="${q.c}" placeholder="C" onchange="updateQ('${u}',${i},'c',this.value)"><input type="text" value="${q.d}" placeholder="D" onchange="updateQ('${u}',${i},'d',this.value)"></div>เฉลย: <select onchange="updateQ('${u}',${i},'key',this.value)"><option value="A" ${q.key==='A'?'selected':''}>A</option><option value="B" ${q.key==='B'?'selected':''}>B</option><option value="C" ${q.key==='C'?'selected':''}>C</option><option value="D" ${q.key==='D'?'selected':''}>D</option></select><button class="btn-p btn-danger" onclick="quizData['${u}'].splice(${i},1); loadEditor('${u}');">ลบ</button></div>`; });
    html += `<div style="display:flex; gap:10px; margin-top:20px;"><button class="btn-p" onclick="addQ('${u}')">+ เพิ่มข้อ</button><button class="btn-p" onclick="db.collection('settings').doc('quizzes').set(quizData, {merge:true}).then(()=>alert('บันทึกสำเร็จ!'))">💾 เซฟ</button></div>`; area.innerHTML = html;
}
function updateQ(u, i, f, v) { quizData[u][i][f] = v; }
function addQ(u) { if(!quizData[u]) quizData[u]=[]; quizData[u].push({q:'',a:'',b:'',c:'',d:'',key:'A'}); loadEditor(u); }

document.addEventListener("visibilitychange", () => { if (document.hidden && window.isDoingQuiz && userData && userData.studentId !== TEACHER_ID) { db.collection("anti_cheat_alerts").add({ studentName: userData.name, action: "สลับจอ", timestamp: firebase.firestore.FieldValue.serverTimestamp() }); alert("🚨 [SYSTEM ALERT] ครูเบียร์เห็นนะ!"); } });
