const tg = window.Telegram.WebApp;
tg.ready();

const avatar = document.getElementById('avatar');
const userInfo = document.getElementById('user-info');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const clickBtn = document.getElementById('click-btn');
const closeBtn = document.getElementById('close-btn');
const backgroundMusic = document.getElementById('background-music');

let score = 0;
let level = 1;
let userId = null;

const SERVER_URL = 'https://vovasticcoinbot.tech';

// Настройка фоновой музыки
backgroundMusic.volume = 0.1; // Громкость 30%
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

// Остальной код остается без изменений
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
            console.log('userId после верификации:', userId);
            userInfo.innerText = `Привет, ${tg.initDataUnsafe.user.first_name}! `;
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
        userInfo.innerText = 'Произошла ошибка при верификации. Версия 1.3';
    });
}

function loadProgress() {
    if (!userId) {
        console.error('User ID не найден при загрузке прогресса.');
        return;
    }
    console.log('Загрузка прогресса для userId:', userId);
    fetch(`${SERVER_URL}/progress/${userId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Прогресс пользователя получен:', data);
            if (data.status === 'success') {
                score = data.progress.score;
                level = data.progress.level;
                updateUI();
            }
        })
        .catch(error => {
            console.error('Ошибка при запросе /progress:', error);
        });
}

function saveProgress() {
    if (!userId) {
        console.error('User ID не найден при сохранении прогресса.');
        return;
    }
    console.log('Сохранение прогресса для userId:', userId, 'score:', score, 'level:', level);
    fetch(`${SERVER_URL}/progress/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: score, level: level })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status !== 'success') {
            console.error('Ошибка при сохранении прогресса:', data.message);
        }
    })
    .catch(error => {
        console.error('Ошибка при запросе /progress:', error);
    });
}

function updateUI() {
    scoreElement.innerText = score;
    levelElement.innerText = level;
}

clickBtn.addEventListener('click', () => {
    score += 1;
    if (score % 10 === 0) {
        level += 1;
    }
    updateUI();
    saveProgress();
});

closeBtn.addEventListener('click', () => {
    tg.close();
});

getUserData();