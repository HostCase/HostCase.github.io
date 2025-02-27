const tg = window.Telegram.WebApp;
tg.ready();

const avatar = document.getElementById('avatar');
const userInfo = document.getElementById('user-info');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const clickImage = document.getElementById('click-image');
const closeBtn = document.getElementById('close-btn');
const backgroundMusic = document.getElementById('background-music');
const clickSound = document.getElementById('click-sound');
const upgradeBtn = document.getElementById('upgrade-btn');
const upgradeCostElement = document.getElementById('upgrade-cost');

let authToken = null;
let userId = null;
let score = 0;
let level = 1;
let currentImageIndex = 1;
let upgradeCost = 0;
const SERVER_URL = 'https://vovasticcoinbot.tech';

backgroundMusic.volume = 0.3;
backgroundMusic.controls = false;

function startMusic() {
    backgroundMusic.play().catch(error => {
        console.error('Ошибка при воспроизведении музыки:', error);
    });
}

document.addEventListener('click', () => {
    startMusic();
}, { once: true });

clickImage.addEventListener('click', () => {
    saveProgress();
    clickSound.play();
    clickImage.style.transform = 'scale(0.9)';
    setTimeout(() => {
        clickImage.style.transform = 'scale(1)';
    }, 100);

    currentImageIndex = currentImageIndex < 3 ? currentImageIndex + 1 : 1;
    clickImage.src = `image${currentImageIndex}.png`;
});

function parseQueryString(queryString) {
    const params = {};
    const pairs = queryString.split('&');
    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
    });
    return params;
}

function getUserData() {
    const initData = tg.initData;
    if (!initData) {
        userInfo.innerText = 'Не удалось получить данные пользователя.';
        return;
    }
    const parsedData = parseQueryString(initData);
    fetch(`${SERVER_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            userId = data.userId;
            authToken = data.token;
            userInfo.innerText = `Привет, ${tg.initDataUnsafe.user.first_name}!`;
            if (tg.initDataUnsafe.user.photo_url) {
                avatar.src = tg.initDataUnsafe.user.photo_url;
            }
            loadProgress();
            fetchUpgradeCost();
        } else {
            userInfo.innerText = 'Ошибка верификации: ' + data.message;
        }
    })
    .catch(error => {
        userInfo.innerText = 'Произошла ошибка при верификации.';
    });
}

function loadProgress() {
    if (!userId || !authToken) return;

    fetch(`${SERVER_URL}/progress/${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            score = data.progress.score;
            level = Math.floor(score / 10) + 1;
            updateUI();
        }
    })
    .catch(error => {
        console.error('Ошибка при запросе прогресса:', error);
    });
}

function fetchUpgradeCost() {
    if (!userId || !authToken) return;

    fetch(`${SERVER_URL}/progress/${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            upgradeCost = data.progress.next_upgrade_cost || 0;
            upgradeCostElement.innerText = upgradeCost;
        }
    })
    .catch(error => {
        console.error('Ошибка при запросе стоимости улучшения:', error);
    });
}

function applyUpgrade() {
    if (!userId || !authToken) return;

    fetch(`${SERVER_URL}/upgrade/apply`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            loadProgress();
            fetchUpgradeCost();
            alert('Улучшение успешно применено!');
        }
    })
    .catch(error => {
        console.error('Ошибка при применении улучшения:', error);
    });
}

function saveProgress() {
    if (!userId) return;

    fetch(`${SERVER_URL}/progress/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: score + 1 })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            loadProgress();
        }
    })
    .catch(error => {
        console.error('Ошибка при сохранении прогресса:', error);
    });
}

function updateUI() {
    scoreElement.innerText = score;
    levelElement.innerText = level;
}

upgradeBtn.addEventListener('click', () => {
    applyUpgrade();
});

closeBtn.addEventListener('click', () => {
    tg.close();
});

getUserData();
