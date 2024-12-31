const tg = window.Telegram.WebApp;

// Ensure the code runs after the Telegram web app is ready
tg.ready().then(() => {
    const SERVER_URL = 'https://vovasticcoinbot.tech';

    // Access DOM elements
    const userInfo = document.getElementById('user-info');
    const avatar = document.getElementById('avatar');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const closeBtn = document.getElementById('close-btn');

    let userId = null;
    let authToken = null;
    let score = 0;
    let level = 1;

    // Function to parse and process user data
    function getUserData() {
        const initData = tg.initData;
        console.log('Полученные initData из Telegram:', initData);

        if (!initData) {
            userInfo.innerText = 'Не удалось получить данные пользователя.';
            return;
        }

        try {
            const decodedData = decodeURIComponent(initData);
            const parsedData = JSON.parse(decodedData);
            console.log('Распарсенные данные initData:', parsedData);

            // Send data to /verify endpoint
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
                    authToken = data.token; // Save the token
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
        } catch (e) {
            console.error('Ошибка при парсинге initData:', e);
        }
    }

    // Function to load user progress
    function loadProgress() {
        if (!userId) {
            console.error('User ID не найден при загрузке прогресса.');
            return;
        }
        if (!authToken) {
            console.error('Токен авторизации отсутствует.');
            return;
        }

        console.log('Загрузка прогресса для userId:', userId);
        console.log('Отправка токена:', authToken);

        fetch(`${SERVER_URL}/progress/${userId}`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${authToken}` 
            }
        })
        .then(response => {
            console.log('HTTP-ответ от сервера:', response);

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
            } else {
                console.error('Ошибка в данных ответа:', data.message);
            }
        })
        .catch(error => {
            console.error('Ошибка при запросе /progress:', error);
        });
    }

    // Function to update UI with user data
    function updateUI() {
        scoreElement.innerText = score;
        levelElement.innerText = level;
    }

    // Event listener for closing the web app
    closeBtn.addEventListener('click', () => {
        tg.close();
    });

    // Start user data verification
    getUserData();
});