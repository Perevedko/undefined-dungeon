const TILE_SIZE = 40; // px

const IMAGES = {
    player: './assets/player.png',
    wall: './assets/wall.png',
    floor: './assets/floor.png'
};

const IMAGES_PATHS = Object.values(IMAGES);

function requireAsset(link) { // функция прогрузки изображений
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.src = link;
    });
}


class Canvas {
    static get el() {
        return document.getElementById('canvas');
    }
    static get ctx() {
        return this.el.getContext('2d');
    }
    static get tile_size() {
        return TILE_SIZE;
    }

    static clear() {
        this.ctx.clearRect(0, 0, this.el.width, this.el.height);
    }

    static drawAsset(imageUrl, tileOffsetX, tileOffsetY) {
        requireAsset(imageUrl).then(image => {
            const offsetX = tileOffsetX * this.tile_size;
            const offsetY = tileOffsetY * this.tile_size;
            const width = this.tile_size;
            const height = this.tile_size;
            this.ctx.drawImage(image, offsetX, offsetY, width, height);
        });
    }

    static drawCharacter(coords) {
        const tileX = coords.x;
        const tileY = coords.y;
        this.drawAsset(IMAGES.player, tileX, tileY);
    }


    static get charToImageUrl() { // символы массива в изображения
        return {
            'x': IMAGES.wall,
            '.': IMAGES.floor,
            'h': IMAGES.floor
        }
    }

    static drawGameBoard(gameBoardMatrix) {
        gameBoardMatrix.forEach((row, jIndex) => {
            row.forEach((cellValue, iIndex) => {
                if (this.charToImageUrl.hasOwnProperty(cellValue)) {
                    this.drawAsset(this.charToImageUrl[cellValue], iIndex, jIndex);
                }
            })
        })
    }

    static drawTheGame(gameState) {
        this.drawGameBoard(gameState.board);
        this.drawCharacter(gameState.hero_location);
    }
}

const fetchJson = (url, data) => fetch(url, data).then(result => result.json());

let currentGameSessionId;

const keyDownHandler = event => {
    let direction;

    switch (event.key) {
        case 'ArrowUp':    direction = 'north'; break;
        case 'ArrowDown':  direction = 'south'; break;
        case 'ArrowLeft':  direction = 'west';  break;
        case 'ArrowRight': direction = 'east';  break;
        default: break;
    }

    if (direction !== undefined) {
        event.preventDefault();
        fetchJson(`/api/game/${currentGameSessionId}/move/${direction}`).then(answer => {
            if (answer.moved) {
                Canvas.drawTheGame(answer.game);
            }
        });
    }
}

const startGame = initialGameState => {
    currentGameSessionId = initialGameState.id;
    Canvas.drawTheGame(initialGameState);
    document.addEventListener('keydown', keyDownHandler);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchJson('/api/game/new/level/1').then(startGame);    

    const levelButtons = document.querySelectorAll('ul#levels-list li button');

    levelButtons.forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();

            const button = event.target;
            const selectedLevelId = button.getAttribute('data-level-id');

            Canvas.clear();
            document.removeEventListener('keydown', keyDownHandler);
            fetchJson(`/api/game/new/level/${selectedLevelId}`).then(startGame);
        });
    });
});
