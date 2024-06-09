let tg = window.Telegram.WebApp;
tg.expand();
tg.MainButton.textColor = '#FFFFFF';
tg.MainButton.color = '#2cab37';

let xhr = new XMLHttpRequest();
let url = "http://HostCase.pythonanywhere.com:5000/data";
xhr.open("POST", url, true);
xhr.setRequestHeader("Content-Type", "application/json");

let data = JSON.stringify({
    "id": tg.initDataUnsafe.user.id,
    "username": tg.initDataUnsafe.user.username,
    "language_code": tg.initDataUnsafe.user.language_code,
});

xhr.send(data);

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
