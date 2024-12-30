const tg = window.Telegram.WebApp;
tg.ready();

const avatar = document.getElementById('avatar');
const userInfo = document.getElementById('user-info');
const scoreElement = document.getElementById('score');
const clickImage = document.getElementById('click-image');
const closeBtn = document.getElementById('close-btn');
const backgroundMusic = document.getElementById('background-music');
const clickSound = document.getElementById('click-sound');

let score = 0;
let level = 1;
let userId = null;
const SERVER_URL = 'https://vovasticcoinbot.tech';

// Настройка фоновой музыки
backgroundMusic.volume = 0.3; // Громкость 30%
backgroundMusic.controls = false; // Скрываем элементы управления

// Воспроизводим музыку после первого взаимодействия пользователя
function startMusic() {
    backgroundMusic.play().catch(error => {
        console.error('Ошибка при воспроизведении музыки:', error);
    });
}

// Запуск музыки после первого клика
document.addEventListener('click', () => {
    startMusic();
}, { once: true });

// Обработчик клика по картинке
clickImage.addEventListener('click', () => {
    score += 1;
    updateUI();
    saveProgress();

    clickSound.play();

    clickImage.style.transform = 'scale(0.9)';
    setTimeout(() => {
        clickImage.style.transform = 'scale(1)';
    }, 100);
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
            const token = data.token;
            localStorage.setItem('token', token);
            userInfo.innerText = `Привет, ${tg.initDataUnsafe.user.first_name}!`;
            if (tg.initDataUnsafe.user.photo_url) {
                avatar.src = tg.initDataUnsafe.user.photo_url;
            }
            loadProgress();
        } else {
            userInfo.innerText = 'Ошибка верификации: ' + data.message;
        }
    })
    .catch(error => {
        console.error('Ошибка при запросе /verify:', error);
        userInfo.innerText = 'Произошла ошибка при верификации.';
    });
}

function loadProgress() {
    if (!userId) {
        console.error('User ID not found during progress load.');
        return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token not found during progress load.');
        return;
    }
    fetch(`${SERVER_URL}/progress/${userId}`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            score = data.progress.score;
            level = data.progress.level;
            updateUI();
        } else {
            console.error('Error loading progress:', data.message);
        }
    })
    .catch(error => {
        console.error('Error during progress load:', error);
    });
}

function saveProgress() {
    if (!userId) {
        console.error('User ID not found during progress save.');
        return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token not found during progress save.');
        return;
    }
    fetch(`${SERVER_URL}/progress/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ score: score, level: level })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status !== 'success') {
            console.error('Error saving progress:', data.message);
        }
    })
    .catch(error => {
        console.error('Error during progress save:', error);
    });
}

function updateUI() {
    scoreElement.innerText = score;
}

closeBtn.addEventListener('click', () => {
    tg.close();
});

getUserData();