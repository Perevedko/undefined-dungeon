const TILE_SIZE = 40;

const IMAGES = {
    player: './assets/player.png',
    wall: './assets/wall.png',
    floor: './assets/floor.png'
};

const IMAGES_PATHS = Object.values(IMAGES);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function requireAsset(link) { // функция прогрузки изображений
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.src = link;
    });
}

function draw(imageUrl, tileX, tileY) {
    console.log(imageUrl, tileX, tileY);
    requireAsset(imageUrl).then(image => // запрашивает изображение из функции requireAsset
        ctx.drawImage(image, tileX * TILE_SIZE, tileY * TILE_SIZE, TILE_SIZE, TILE_SIZE));
}

function drawPlayer(coords) {
    console.log(IMAGES);
    const x = coords.x;
    const y = coords.y;
    draw(IMAGES.player, x, y); // рисует персонажа из шаблона draw
}

const charToImageUrl = { // символы массива в изображения
    'x': IMAGES.wall,
    '.': IMAGES.floor,
    'h': IMAGES.floor
};

function drawMap(tileMap) { // нихрена не понимаю, почему столько foreach
    tileMap.forEach(function(row, j) {
        row.forEach(function(tile, i) {
            const imageUrl = charToImageUrl[tile];
            if (imageUrl !== undefined) {
                draw(imageUrl, i, j)
            }
        })
    });
}

function request(url, data) { // функция запроса к апишке 
    return fetch(url, data).then(result => result.json());
}



function startGame() {
    request('/api/game/new').then(gameState => { // запрос к новой игре
        drawMap(gameState.board);
        drawPlayer(gameState.hero_location);
        return gameState.id;
    }).then(id => {
        document.addEventListener('keydown', event => {
            let direction;
            switch(event.key) {
                case 'ArrowUp':    direction = 'north'; break;
                case 'ArrowDown':  direction = 'south'; break;
                case 'ArrowLeft':  direction = 'west';  break;
                case 'ArrowRight': direction = 'east';  break;
                default: break;
            }
            if (direction !== undefined) {
                request(`/api/game/${id}/move/${direction}`).then(result => {
                    if (result.moved === true) {
                        drawMap(result.game.board);
                        drawPlayer(result.game.hero_location);
                    }
                });
            }
        });
    });
    // 2. Отправить GET на /api/game/new, сохранить id +
    // 3. Отрисовать поле +
    // 4. Повесить обработчики кнопок
}

document.addEventListener('DOMContentLoaded', () => {
    startGame();
});
