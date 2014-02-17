var config = {
    width: 10,
    height: 10,
    cellSize: 30,
    numMines: 10
};

var inputFields = {
    width: document.getElementById('inputWidth'),
    height: document.getElementById('inputHeight'),
    numMines: document.getElementById('inputNumMines')
};

inputFields.width.value = config.width;
inputFields.height.value = config.height;
inputFields.numMines.value = config.numMines;

var gameCanvas = document.getElementById('gameCanvas');
var gridCanvas = document.getElementById('gridCanvas');

var minefield = new Minefield(config.width, config.height);
var gameCanvas = new GameCanvas(gameCanvas, gridCanvas, minefield,
        config.cellSize);
var swoopy = new Swoopy(minefield, gameCanvas);

swoopy.resetBoard(config.numMines);
gameCanvas.draw();

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

