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

let authToken = null;
let userId = null;
let score = 0;
let level = 1;

const SERVER_URL = 'https://vovasticcoinbot.tech';

// Настройка фоновой музыки
backgroundMusic.volume = 0.3;
backgroundMusic.controls = false;

document.addEventListener('click', () => {
    backgroundMusic.play().catch(error => {
        console.error('Ошибка при воспроизведении музыки:', error);
    });
}, { once: true });

clickImage.addEventListener('click', () => {
    saveProgress();
    clickSound.play();
    clickImage.style.transform = 'scale(0.9)';
    setTimeout(() => {
        clickImage.style.transform = 'scale(1)';
    }, 100);
});

function parseQueryString(queryString) {
    const params = {};
    queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    return params;
}

function getUserData() {
    const initData = tg.initData;
    console.log('Полученные initData из Telegram:', initData);

    if (!initData) {
        userInfo.innerText = 'Не удалось получить данные пользователя.';
        return;
    }

    const parsedData = parseQueryString(initData);
    console.log('Распарсенные данные initData:', parsedData);

    fetch(`${SERVER_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Ответ от сервера /verify:', data);
        if (data.status === 'success') {
            userId = data.userId;
            authToken = data.token;
            localStorage.setItem('authToken', authToken); // Сохраняем токен
            console.log('userId после верификации:', userId);
            userInfo.innerText = `Привет, ${tg.initDataUnsafe.user.first_name}! `;
            avatar.src = tg.initDataUnsafe.user.photo_url || '';
            loadProgress();
        } else {
            userInfo.innerText = 'Ошибка верификации: ' + data.message;
        }
    })
    .catch(error => {
        console.error('Ошибка при запросе /verify:', error);
    });
}

function loadProgress() {
    authToken = authToken || localStorage.getItem('authToken');
    console.log('Отправка токена:', authToken);
    console.log('Запрос к серверу:', `${SERVER_URL}/progress/${userId}`);

    fetch(`${SERVER_URL}/progress/${userId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Прогресс пользователя:', data);
        if (data.status === 'success') {
            score = data.progress.score;
            level = data.progress.level;
            updateUI();
        }
    })
    .catch(error => {
        console.error('Ошибка при запросе /progress:', error.message);
    });
}

function saveProgress() {
    authToken = authToken || localStorage.getItem('authToken');
    console.log('Отправка токена:', authToken);
    console.log('Запрос к серверу:', `${SERVER_URL}/progress/${userId}`);

    fetch(`${SERVER_URL}/progress/${userId}`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${authToken}`, 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ score: score + 1 })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            loadProgress();
        }
    })
    .catch(error => {
        console.error('Ошибка при запросе /progress:', error.message);
    });
}

function updateUI() {
    scoreElement.innerText = score;
    levelElement.innerText = level;
}

closeBtn.addEventListener('click', () => {
    tg.close();
});

getUserData();
