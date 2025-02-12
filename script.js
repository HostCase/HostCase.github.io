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
let currentImageIndex = 1; // Текущий индекс картинки
let upgradeCost = 0; // Стоимость улучшения
const SERVER_URL = 'https://vovasticcoinbot.tech';

// Настройка фоновой музыки
backgroundMusic.volume = 0.3; // Громкость 30%
backgroundMusic.controls = false; // Скрываем элементы управления

function startMusic() {
    backgroundMusic.play().catch(error => {
        console.error('Ошибка при воспроизведении музыки:', error);
    });
}

document.addEventListener('click', () => {
    startMusic();
}, { once: true });

clickImage.addEventListener('click', () => {
    saveProgress(); // Сохраняем прогресс
    clickSound.play(); // Воспроизводим звук клика
    clickImage.style.transform = 'scale(0.9)'; // Эффект уменьшения картинки
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
            fetchUpgradeCost(); // Получаем стоимость улучшения
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
    if (!authToken) {
        console.error('Токен авторизации отсутствует.');
        return;
    }

    fetch(`${SERVER_URL}/progress/${userId}`, {
        method: 'GET',
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
        if (data.status === 'success') {
            score = data.progress.score;
            level = Math.floor(score / 10) + 1;
            updateUI();
        } else {
            console.error('Ошибка в данных ответа:', data.message);
        }
    })
    .catch(error => {
        console.error('Ошибка при запросе прогресса:', error);
    });
}

function fetchUpgradeCost() {
    if (!userId) {
        console.error('User ID не найден при получении стоимости улучшения.');
        return;
    }
    if (!authToken) {
        console.error('Токен авторизации отсутствует.');
        return;
    }

    fetch(`${SERVER_URL}/progress/${userId}`, {
        method: 'GET',
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
        if (data.status === 'success') {
            const userProgress = data.progress;
            upgradeCost = userProgress.next_upgrade_cost || 0; // Получаем стоимость улучшения с сервера
            upgradeCostElement.innerText = upgradeCost;
        } else {
            console.error('Ошибка в данных ответа:', data.message);
        }
    })
    .catch(error => {
        console.error('Ошибка при запросе стоимости улучшения:', error);
    });
}

function applyUpgrade() {
    if (!userId) {
        console.error('User ID не найден при применении улучшения.');
        return;
    }
    if (!authToken) {
        console.error('Токен авторизации отсутствует.');
        return;
    }

    fetch(`${SERVER_URL}/upgrade/apply`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${authToken}`, 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ userId: userId }) // Отправляем запрос на улучшение
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            loadProgress(); // Обновляем прогресс после улучшения
            fetchUpgradeCost(); // Обновляем стоимость следующего улучшения
            alert('Улучшение успешно применено!');
        } else {
            alert('Ошибка при применении улучшения: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Ошибка при применении улучшения:', error);
    });
}

function saveProgress() {
    if (!userId) {
        console.error('User ID не найден при сохранении прогресса.');
        return;
    }
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

// Запуск верификации пользователя
getUserData();