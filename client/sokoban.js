const TILE_SIZE = 40;

const ASSETS = Object.freeze([
    './assets/player.png',
    './assets/wall.png',
    './assets/floor.png'
]);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function drawPlayer() {
    //player.y = canvas.height / 2 - 40;    //player position - middle of canvas - 40
    //player.x = canvas.width / 2 - 40;    //player position - middle of canvas - 40

    loadImage("./assets/player.png").then(playerImage => {
        ctx.drawImage(playerImage, 0, 0, 40, 40);
    })
}

function loadImage(url) {
    return new Promise(resolve => {
        const image = new Image();

        image.addEventListener('load', () => {
            resolve(image);
        });

        image.src = url;
    });
}

function drawMap() {
    var mapArray = [
        ['3', '3', '3', '3', '3'],
        ['3', '0', '0', '0', '3'],
        ['3', '0', '0', '0', '3'],
        ['3', '0', '0', '0', '3'],
        ['3', '3', '3', '3', '3']
    ];

    for (let i = 0; i < mapArray.length; i++) {
        for (let j = 0; j < mapArray[i].length; j++) {
            if (mapArray[i][j] == 3) {
                loadImage("./assets/wall.png").then(wallImage => {
                    ctx.drawImage(wallImage, i * 40, j * 40, 40, 40); // последние 2 цифры - размер изображения в пикселях
                })
            }

            if (mapArray[i][j] == 0) {
                loadImage("./assets/floor.png").then(floorImage => {
                    ctx.drawImage(floorImage, i * 40, j * 40, 40, 40); // последние 2 цифры - размер изображения в пикселях
                })
            }
        }
    }
}

drawMap();
drawPlayer();


const startGame = () => {
    // 1. Загрузить все ассеты
    // 2. Отправить GET на /api/game/new, сохранить id
    // 3. Отрисовать поле
    // 4. Повесить обработчики кнопок
};