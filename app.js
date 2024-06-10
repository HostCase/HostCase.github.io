let socket = io.connect('http://localhost:5000');

let tg = window.Telegram.WebApp;
tg.expand();
tg.MainButton.textColor = '#FFFFFF';
tg.MainButton.color = '#2cab37';

let data = {
    "id": tg.initDataUnsafe.user.id,
    "username": tg.initDataUnsafe.user.username,
    "language_code": tg.initDataUnsafe.user.language_code,
    "work": "codetest"
};

socket.emit('data', data);

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

socket.on('response', function(msg){
    console.log(msg);
});

let usercard = document.getElementById("usercard");
let p = document.createElement("p");
p.innerText = `${tg.initDataUnsafe.user.id}
${tg.initDataUnsafe.user.username};
${tg.initDataUnsafe.user.language_code}`;
usercard.appendChild(p);
