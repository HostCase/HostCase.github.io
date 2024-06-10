let tg = window.Telegram.WebApp;
tg.expand();
tg.MainButton.textColor = '#FFFFFF';
tg.MainButton.color = '#2cab37';

let socket = io.connect('http://localhost:5000'); // Замените на IP-адрес и порт вашего сервера Python

socket.on('connect', function() {
    console.log('Connected to server');
});

socket.on('disconnect', function() {
    console.log('Disconnected from server');
});

let data = JSON.stringify({
    "id": tg.initDataUnsafe.user.id,
    "username": tg.initDataUnsafe.user.username,
    "language_code": tg.initDataUnsafe.user.language_code,
    "work": "codetest"
});

socket.emit('message', data);

let item = "";
let btn1 = document.getElementById("btn1");
btn1.addEventListener("click", function(){
    if (tg.MainButton.isVisible) {
        tg.MainButton.hide();
    }
    else {
        tg.MainButton.setText("Удар!!!");
        item = "1";
        tg.MainButton.show();
    }
});

Telegram.WebApp.onEvent("mainButtonClicked", function(){
    tg.sendData(item);
});

let usercard = document.getElementById("usercard");
let p = document.createElement("p");
p.innerText = `${tg.initDataUnsafe.user.id}
${tg.initDataUnsafe.user.username};
${tg.initDataUnsafe.user.language_code}`;
usercard.appendChild(p);
