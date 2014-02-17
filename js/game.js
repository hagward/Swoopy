var config = {
    cellSize: 20,

    modeEasy: {
        width: 10,
        height: 10,
        numMines: 10
    },

    modeMedium: {
        width: 20,
        height: 10,
        numMines: 50
    },

    modeExpert: {
        width: 30,
        height: 20,
        numMines: 100
    }
};

var buttons = {
    easy: document.getElementById('buttonEasy'),
    medium: document.getElementById('buttonMedium'),
    expert: document.getElementById('buttonExpert')
};

var gameCanvas = document.getElementById('gameCanvas');
var gridCanvas = document.getElementById('gridCanvas');

var swoopy = initSwoopy(config.modeEasy.width, config.modeEasy.height,
        config.modeEasy.numMines, gameCanvas, gridCanvas, config.cellSize);

function initSwoopy(width, height, numMines, gameCanvas, gridCanvas,
        cellSize) {
    var minefield = new Minefield(width, height);
    var canvas = new GameCanvas(gameCanvas, gridCanvas, minefield, cellSize);
    var swoopy = new Swoopy(minefield, canvas);
    swoopy.resetBoard(numMines);
    return swoopy;
}

// Left click for revealing
gridCanvas.onclick = function(event) {
    var cell = getCellFromEvent(event);
    var x = cell[0];
    var y = cell[1];
    swoopy.reveal(x, y);
};

// Right click for flagging/unflagging
gridCanvas.oncontextmenu = function(event) {
    event.preventDefault();
    var cell = getCellFromEvent(event);
    var x = cell[0];
    var y = cell[1];
    swoopy.flag(x, y);
};

buttons.easy.onclick = function(event) {
    swoopy = initSwoopy(config.modeEasy.width, config.modeEasy.height,
            config.modeEasy.numMines, gameCanvas, gridCanvas, config.cellSize);
};

buttons.medium.onclick = function(event) {
    swoopy = initSwoopy(config.modeMedium.width, config.modeMedium.height,
            config.modeMedium.numMines, gameCanvas, gridCanvas,
            config.cellSize);
};

buttons.expert.onclick = function(event) {
    swoopy = initSwoopy(config.modeExpert.width, config.modeExpert.height,
            config.modeExpert.numMines, gameCanvas, gridCanvas,
            config.cellSize);
};

/**
 * Returns the x and y values for the clicked block, based on a canvas.onclick
 * event.
 */
function getCellFromEvent(event) {
    // Find click position
    var x, y;
    if (event.pageX || event.pageY) {
        x = event.pageX;
        y = event.pageY;
    } else {
        x = event.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
    }
    x -= gridCanvas.offsetLeft;
    y -= gridCanvas.offsetTop;

    // Find block number
    x = Math.floor(x / config.cellSize);
    y = Math.floor(y / config.cellSize);

    return [x, y];
}

/**
 * Helper function taken from MDN.
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

