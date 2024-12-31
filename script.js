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
let currentImageIndex = 1; // Текущий индекс картинки

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
    saveProgress(); // Сохраняем прогресс
    clickSound.play(); // Воспроизводим звук клика
    clickImage.style.transform = 'scale(0.9)'; // Эффект уменьшения картинки
    setTimeout(() => {
        clickImage.style.transform = 'scale(1)';
    }, 100);
    // Меняем картинку (цикл из 3-х картинок)
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
            authToken = data.token; // Сохраняем токен
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
    fetch(`${SERVER_URL}/progress/${userId}`, {
        headers: { 
            'Authorization': `Bearer ${authToken}` 
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
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
    console.log('Инкремент кликов для userId:', userId);
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
        if (data.status !== 'success') {
            console.error('Ошибка при сохранении прогресса:', data.message);
        } else {
            loadProgress(); // Перезагружаем прогресс после инкремента
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

closeBtn.addEventListener('click', () => {
    tg.close();
});

// Запуск верификации пользователя
getUserData();
