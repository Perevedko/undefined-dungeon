const TILE_SIZE = 40;

const IMAGES = {
    player: './assets/player.png',
    wall: './assets/wall.png',
    floor: './assets/floor.png'
};

const IMAGES_PATHS = Object.values(IMAGES);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let LOADED_ASSETS = {};

function requireAsset(link) {
    new Promise(resolve => {
        if (LOADED_ASSETS.hasOwnProperty(link)) { // если изображение прогружено
            resolve(LOADED_ASSETS[link]); // отправляет изоюражение во внешний мир
        }

        else { // если изображение ещё не загружено
            const image = new Image();

            image.addEventListener('load', () => {
                LOADED_ASSETS[link] = image;
                resolve(image); // отправляет изображение во внешний мир
            });

            image.src = link;
        }
    });
}

function draw(imageUrl, tileX, tileY) {
    requireAsset(imageUrl).then(image =>
        ctx.drawImage(image, tileX * TILE_SIZE, tileY * TILE_SIZE, TILE_SIZE, TILE_SIZE));
}

function drawPlayer(coords) {
    const x = coords.x;
    const y = coords.y;
    draw(IMAGES.player, x, y);
}

const symbolToImageMapping = {
    'x': IMAGES.wall,
    '.': IMAGES.floor,
    'h': IMAGES.floor
};

function drawMap(tileMap) {
    tileMap.forEach((row, j), function () {
        row.forEach((tile, i), function () {
            draw(symbolToImageMapping[tile], i, j)
        });
    });
}

function request(url, data) {
    fetch(url, data).then(result => result.json());
}

function startGame() {
    Promise.all(IMAGES_PATHS.map(requireAsset)).then(() => {
        request('/api/game/new').then(gameState => {
            console.log(gameState);
            const id = gameState.id;
            drawMap(gameState.board);
            drawPlayer(gameState.hero_location);
        });
    });
    // 1. Загрузить все ассеты +
    // 2. Отправить GET на /api/game/new, сохранить id +
    // 3. Отрисовать поле +
    // 4. Повесить обработчики кнопок
}

document.addEventListener('DOMContentLoaded', () => {
    startGame();
});
