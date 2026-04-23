// ==========================================
// 1. 核心配置：请在此处填入你的 Supabase 信息
// ==========================================
const SUPABASE_URL = 'https://byzflvstxrovbpdrqjtb.supabase.co'; 
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
// 修改后的真心话投递函数
async function sendAnon() {
    const input = document.getElementById('anon-input');
    const content = input.value.trim();
    
    if (!content) {
        alert("空空的盒子可装不下真心话哦 📦");
        return;
    }

    // 将数据推送到 Supabase 的 secrets 表
    const { error } = await _supabase
        .from('secrets')
        .insert([{ content: content }]);

    if (error) {
        console.error("投递失败:", error);
        alert("由于网络波动，真心话没能飞过去...");
    } else {
        // 成功反馈
        alert("🔒 你的真心话已通过加密隧道送达小田！");
        input.value = "";
    }
}

async function updateVisitLog() {
    // 1. 获取当前数据库里的总数
    let { data } = await _supabase.from('stats').select('visit_count').eq('id', 1).single();
    let newCount = (data ? data.visit_count : 0) + 1;

    // 2. 更新数据库
    await _supabase.from('stats').update({ visit_count: newCount }).eq('id', 1);

    // 3. 显示在网页上
    const log = document.getElementById('visit-log');
    if(log) log.innerText = `你是第 ${newCount} 位踏入档案馆的火伴`;
}

// 启动入口
window.onload = init;