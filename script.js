// ==========================================
// 1. 核心配置：请在此处填入你的 Supabase 信息
// ==========================================
const SUPABASE_URL = 'https://byzflvstxrovbpdrqjtb.supabase.co/rest/v1/'; 
const SUPABASE_KEY = 'sb_publishable_Tj-w8Y8v2JFSsJqVS4uw9g_EYOeQXNM';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let clicks = 0;
const quotes = [
    "毕设虽好，不能贪杯 🍷", 
    "今天的 BUG，留给明天的自己 🐛", 
    "网格未收敛，我也要恰饭 🍚",
    "生活就像非线性迭代，总能收敛 ✨"
];

// ==========================================
// 2. 初始化加载 (从云端抓取数据)
// ==========================================
async function init() {
    // 启动时钟
    setInterval(() => {
        const clock = document.getElementById('digital-clock');
        if(clock) clock.innerText = new Date().toLocaleTimeString('zh-CN', {hour12:false});
    }, 1000);

    // 语录切换
    setInterval(() => {
        const status = document.getElementById('live-status');
        if(status) status.innerText = quotes[Math.floor(Math.random()*quotes.length)];
    }, 10000);

    // 从云端加载：任务列表和印象标签
    await loadMissions();
    await loadTags();
    updateVisitLog();
}

// ==========================================
// 3. 能量激发模块
// ==========================================
function chargeEnergy() {
    clicks++;
    const counter = document.getElementById('click-counter');
    counter.innerText = clicks;
    counter.style.transform = `scale(${1 + (clicks % 10) / 20})`;
    
    if (clicks % 10 === 0) {
        document.getElementById('live-status').innerText = "⚡ 能量正在爆表！";
    }
}

// ==========================================
// 4. 场景切换逻辑
// ==========================================
function enterMode(mode) {
    document.getElementById('welcome-screen').style.display = 'none';
    const pageId = mode === 'archive' ? 'archive-page' : 'interaction-page';
    document.getElementById(pageId).style.display = 'block';
    document.body.style.background = mode === 'archive' ? "#0d1b2a" : "#1a0f0f";
}

function goHome() {
    document.querySelectorAll('.mode-page').forEach(p => p.style.display = 'none');
    document.getElementById('welcome-screen').style.display = 'flex';
    document.body.style.background = "#111";
}

// ==========================================
// 5. 任务派发功能 (云同步)
// ==========================================
async function postMission() {
    const input = document.getElementById('mission-input');
    const text = input.value.trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

    // 推送到 Supabase 表: missions
    const { error } = await _supabase
        .from('missions')
        .insert([{ text: text, time: time }]);

    if (error) {
        console.error("同步失败:", error);
        alert("由于网络波动，任务投递失败了...");
    } else {
        renderMission(text, time);
        input.value = "";
    }
}

function renderMission(text, time) {
    const div = document.createElement('div');
    div.className = 'mission-item';
    div.innerHTML = `<strong>[${time}]</strong> ${text}`;
    const list = document.getElementById('mission-list');
    list.insertBefore(div, list.firstChild);
}

async function loadMissions() {
    const { data, error } = await _supabase
        .from('missions')
        .select('*')
        .order('id', { ascending: false });

    if (data) {
        document.getElementById('mission-list').innerHTML = "";
        data.forEach(m => renderMission(m.text, m.time));
    }
}

// ==========================================
// 6. 朋友印象功能 (云同步)
// ==========================================
async function submitTag() {
    const input = document.getElementById('tag-input');
    const content = input.value.trim();
    if (!content) return;

    const { error } = await _supabase
        .from('tags')
        .insert([{ content: content }]);

    if (!error) {
        renderTag(content);
        input.value = "";
    }
}

function addTag(e) {
    if (e.key === 'Enter') submitTag();
}

function renderTag(content) {
    const span = document.createElement('span');
    span.className = 'tag';
    span.innerText = content;
    document.getElementById('labels').appendChild(span);
}

async function loadTags() {
    const { data } = await _supabase.from('tags').select('*');
    if (data) {
        const labels = document.getElementById('labels');
        labels.innerHTML = ""; // 先清空默认标签
        data.forEach(t => renderTag(t.content));
    }
}

// ==========================================
// 7. 辅助功能
// ==========================================
function sendAnon() {
    alert("🔒 投递成功！虽然目前是模拟投递，但心意领到了。");
    document.getElementById('anon-input').value = "";
}

function updateVisitLog() {
    let count = localStorage.getItem('tcz_visits') || 0;
    count++;
    localStorage.setItem('tcz_visits', count);
    const log = document.getElementById('visit-log');
    if(log) log.innerText = `你是第 ${count} 位来到这里的火伴`;
}

// 启动入口
window.onload = init;