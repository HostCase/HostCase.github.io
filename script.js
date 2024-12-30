const tg = window.Telegram.WebApp;

// Инициализация Telegram Web App
tg.ready();

// Элементы DOM
const avatar = document.getElementById('avatar');
const userInfo = document.getElementById('user-info');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const clickBtn = document.getElementById('click-btn');
const closeBtn = document.getElementById('close-btn');

// Переменные игры
let score = 0;
let level = 1;
let userId = null;

// URL вашего бэкенда
const SERVER_URL = 'http://127.0.0.1:8000'; // Замените на ваш реальный URL или IP

// Функция для парсинга строки запроса
function parseQueryString(queryString) {
    const params = {};
    const pairs = queryString.split('&');
    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) { // Проверка на наличие ключа
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
    });
    return params;
}

// Функция для получения данных пользователя из Telegram
function getUserData() {
    const initData = tg.initData;
    console.log('Полученные initData из Telegram:', initData);

    if (!initData) {
        userInfo.innerText = 'Не удалось получить данные пользователя.';
        return;
    }

    const parsedData = parseQueryString(initData);
    console.log('Распарсенные данные initData:', parsedData);

    // Отправка данных на бэкенд для верификации
    fetch(`${SERVER_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Ответ от сервера /verify:', data);
        if (data.status === 'success') {
            userId = tg.initDataUnsafe.user.id;
            userInfo.innerText = `Привет, ${tg.initDataUnsafe.user.first_name}!`;
            if (tg.initDataUnsafe.user.photo_url) {
                avatar.src = tg.initDataUnsafe.user.photo_url;
            }

            // Загрузка прогресса пользователя
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

// Функция для загрузки прогресса пользователя
function loadProgress() {
    if (!userId) {
        console.error('User ID не найден.');
        return;
    }

    fetch(`${SERVER_URL}/get_progress/${userId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Прогресс пользователя получен:', data);
            if (data.status === 'success') {
                score = data.data.score;
                level = data.data.level;
                updateUI();
            }
        })
        .catch(error => {
            console.error('Ошибка при запросе /get_progress:', error);
        });
}

// Функция для сохранения прогресса пользователя
function saveProgress() {
    if (!userId) {
        console.error('User ID не найден.');
        return;
    }

    fetch(`${SERVER_URL}/save_progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, score, level })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status !== 'success') {
            console.error('Ошибка при сохранении прогресса:', data.message);
        }
    })
    .catch(error => {
        console.error('Ошибка при запросе /save_progress:', error);
    });
}

// Обновление интерфейса
function updateUI() {
    scoreElement.innerText = score;
    levelElement.innerText = level;
}

// Обработчик клика
clickBtn.addEventListener('click', () => {
    score += 1;
    if (score % 10 === 0) {
        level += 1;
    }
    updateUI();
    saveProgress();
});

// Обработчик закрытия Web App
closeBtn.addEventListener('click', () => {
    tg.close();
});

// Инициализация
getUserData();