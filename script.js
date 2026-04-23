let clicks = 0;
const relaxQuotes = [
    "毕设虽好，不能贪杯 🍷",
    "今天的 BUG，留给明天的自己 🐛",
    "网格未收敛，我也要恰饭 🍚",
    "应力集中不可怕，可怕的是找不到卸载路径"
];

// 1. 时钟与状态
function init() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('digital-clock').innerText = now.toLocaleTimeString('zh-CN', { hour12: false });
    }, 1000);
    
    // 自动切换状态语录
    setInterval(() => {
        document.getElementById('live-status').innerText = relaxQuotes[Math.floor(Math.random() * relaxQuotes.length)];
    }, 8000);
}

// 2. 激发能量逻辑
function chargeEnergy() {
    clicks++;
    const counter = document.getElementById('click-counter');
    const btn = document.getElementById('energy-btn');
    
    counter.innerText = clicks;
    
    // 视觉反馈：文字抖动缩放
    counter.style.transform = `scale(${1 + (clicks % 20) / 20})`;
    
    // 随机改变状态栏文案
    if (clicks % 5 === 0) {
        document.getElementById('live-status').innerText = "能量激发中：⚡" + "!".repeat(clicks/5 % 5);
    }
}

// 3. 场景切换
function enterMode(mode) {
    document.getElementById('welcome-screen').style.display = 'none';
    if (mode === 'archive') {
        document.getElementById('archive-page').style.display = 'block';
        document.body.style.background = "#0d1b2a";
    } else {
        document.getElementById('interaction-page').style.display = 'block';
        document.body.style.background = "#1a0f0f";
    }
}

function goHome() {
    document.getElementById('archive-page').style.display = 'none';
    document.getElementById('interaction-page').style.display = 'none';
    document.getElementById('welcome-screen').style.display = 'flex';
    document.body.style.background = "#111";
}

// 4. 互动功能（模拟）
function sendAnon() {
    alert("🔒 真心话已投递！");
    document.getElementById('anon-input').value = "";
}

function addTag(e) {
    if (e.key === 'Enter') {
        const input = document.getElementById('tag-input');
        const span = document.createElement('span');
        span.className = 'tag';
        span.innerText = input.value;
        document.getElementById('labels').appendChild(span);
        input.value = "";
    }
}

function postMission() {
    const input = document.getElementById('mission-input');
    const missionText = input.value.trim();
    
    if (missionText) {
        // 创建任务条目
        const container = document.getElementById('mission-list');
        const newItem = document.createElement('div');
        newItem.className = 'mission-item';
        
        // 获取当前时间戳，增加一点“档案感”
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        newItem.innerHTML = `<strong>[${time}]</strong> ${missionText}`;
        
        // 插入到列表最前面
        container.insertBefore(newItem, container.firstChild);
        
        // 模拟反馈
        alert("🎯 任务已送达！阿臻会在休息间隙查看的。");
        input.value = "";
        
        // 如果想让任务持久化，可以存入 LocalStorage
        saveMission(missionText, time);
    }
}

// 模拟读取已有的任务（如果之前存过）
function loadMissions() {
    const saved = JSON.parse(localStorage.getItem('tcz_missions') || "[]");
    const container = document.getElementById('mission-list');
    saved.forEach(m => {
        const div = document.createElement('div');
        div.className = 'mission-item';
        div.innerHTML = `<strong>[${m.time}]</strong> ${m.text}`;
        container.appendChild(div);
    });
}

function saveMission(text, time) {
    const saved = JSON.parse(localStorage.getItem('tcz_missions') || "[]");
    saved.unshift({text, time});
    localStorage.setItem('tcz_missions', JSON.stringify(saved.slice(0, 10))); // 只保留最近10条
}

// 修改 init 函数，在页面加载时读取任务
const originalInit = init;
init = function() {
    originalInit();
    loadMissions();
};

init(); // 启动