const TILE_SIZE = 40;

const IMAGES = {
    player: './assets/player.png',
    wall: './assets/wall.png',
    floor: './assets/floor.png'
};
const IMAGES_PATHS = Object.values(IMAGES);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const draw = (imageUrl, tileX, tileY) =>
    requireAsset(imageUrl).then(image =>
        ctx.drawImage(image, tileX * TILE_SIZE, tileY * TILE_SIZE, TILE_SIZE, TILE_SIZE));

const drawPlayer = ({x, y}) => draw(IMAGES.player, x, y);

let LOADED_ASSETS = {};
const requireAsset = link => new Promise(resolve => {
    if (LOADED_ASSETS.hasOwnProperty(link)) {
        resolve(LOADED_ASSETS[link])
    } else {
        const image = new Image();
        image.addEventListener('load', () => {
            LOADED_ASSETS[link] = image;
            resolve(image);
        });
        image.src = link;
    }
});

const symbolToImageMapping = {
    'x': IMAGES.wall,
    '.': IMAGES.floor,
    'h': IMAGES.floor
};

const drawMap = tileMap =>
    tileMap.forEach((row, j) => row.forEach((tile, i) => draw(symbolToImageMapping[tile], i, j)));

const request = (url, data) => fetch(url, data).then(result => result.json());

const startGame = () => {
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
};

document.addEventListener('DOMContentLoaded', () => {
    startGame();
});
