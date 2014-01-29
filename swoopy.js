/**
 * Datastructure for storing and accessing a minefield.
 */
function Minefield(width, height) {

    var _width = width;
    var _height = height;
    var _numFlags = 0; // This might be redundant
    var _grid = new Array(height);
    for (var i = 0; i < _grid.length; i++)
        _grid[i] = new Array(width);

    // Used for debugging purposes only. To be removed.
    this.getGrid = function() { return _grid; }

    this.getWidth = function() {
        return _width;
    }

    this.getHeight = function() {
        return _height;
    }

    this.getState = function(x, y) {
        return _grid[y][x];
    }

    this.isMined = function(x, y) {
        return (_grid[y][x] & 16) !== 0;
    }

    this.isFlagged = function(x, y) {
        return (_grid[y][x] & 32) !== 0;
    }

    this.isRevealed = function(x, y) {
        return (_grid[y][x] & 128) !== 0;
    }

    /**
     * Returns the number (as in number of adjacent mines) at the specified
     * location.
     */
    this.getNumber = function(x, y) {
        if ((_grid[y][x] & 64) === 0) return 0;
        return (_grid[y][x] & 15);
    }

    this.setMined = function(x, y, mined) {
        _grid[y][x] = (mined) ? _grid[y][x] | 16 : _grid[y][x] & ~16;
    }

    this.setFlagged = function(x, y, flagged) {
        if (flagged !== this.isFlagged(x, y))
            _numFlags += (flagged) ? 1 : -1;
        _grid[y][x] = (flagged) ? _grid[y][x] | 32 : _grid[y][x] & ~32;
    }

    this.setRevealed = function(x, y, revealed) {
        _grid[y][x] = (revealed) ? _grid[y][x] | 128 : _grid[y][x] & ~128;
    }

    this.setNumber = function(x, y, number) {
        _grid[y][x] &= 240; // Clear the four rightmost bits
        _grid[y][x] |= ((number & 15) | 64);
    }

}

/**
 * Represents the visual minefield.
 */
function GameCanvas(gameCanvas, gridCanvas, minefield, cellSize) {
 
    var _gameCanvas = gameCanvas;
    var _gridCanvas = gridCanvas;
    var _gameContext = gameCanvas.getContext('2d');
    var _gridContext = gridCanvas.getContext('2d');
    var _minefield = minefield;
    var _cellSize = cellSize;

    _gameCanvas.width = _minefield.getWidth() * cellSize;
    _gameCanvas.height = _minefield.getHeight() * cellSize;
    _gameCanvas.style.marginLeft = (-_gameCanvas.width / 2) + 'px';
    _gameContext.font = '20px sans-serif';
    _gameCanvas.style.border = '2px solid black';

    _gridCanvas.width = _gameCanvas.width;
    _gridCanvas.height = _gameCanvas.height;
    _gridCanvas.style.marginLeft = _gameCanvas.style.marginLeft;
    _gridCanvas.style.border = '2px solid black';

    // Vertical lines
    for (var i = 1; i < _minefield.getWidth(); i++) {
        var x = i * cellSize;
        _gridContext.beginPath();
        _gridContext.moveTo(x, 0);
        _gridContext.lineTo(x, _gameCanvas.height);
        _gridContext.stroke();
    }

    // Horizontal lines
    for (var i = 1; i < _minefield.getHeight(); i++) {
        var y = i * cellSize;
        _gridContext.beginPath();
        _gridContext.moveTo(0, y);
        _gridContext.lineTo(_gameCanvas.width, y);
        _gridContext.stroke();
    }

    /**
     * Fills a cell with a color.
     */
    this._fillColor = function(x, y, color) {
        _gameContext.fillStyle = color;
        _gameContext.fillRect(x * cellSize, y * cellSize,
                cellSize, cellSize);
    }

    /**
     * Writes text to the center of a cell.
     */
    this._fillText = function(x, y, text, color) {
        _gameContext.fillStyle = color;
        _gameContext.fillText(text,
                x * cellSize + 9,
                y * cellSize + 22);
    }

    /**
     * Draws to a cell according to the contents of the respective cell in the
     * Minefield class.
     */
    this.drawCell = function(x, y) {
        if (_minefield.isRevealed(x, y)) {
            if (_minefield.isMined(x, y)) {
                this._fillColor(x, y, 'red');
            } else {
                this._fillColor(x, y, 'white');
                var number = _minefield.getNumber(x, y);
                if (number !== 0)
                    this._fillText(x, y, number, 'green');
            }
        } else if (_minefield.isFlagged(x, y)) {
            this._fillColor(x, y, 'blue');
        } else {
            this._fillColor(x, y, 'grey');
        }
    }

    this.draw = function() {
        _gameContext.fillStyle = 'grey';
        _gameContext.fillRect(0, 0, _gameCanvas.width, _gameCanvas.height);
    }

}

/**
 * Contains all the game logic.
 */
function Swoopy(minefield, gameCanvas) {

    var _minefield = minefield;
    var _gameCanvas = gameCanvas;
    var _minesLeft = 0;

    // -1 = lost, 0 = playing, 1 = won
    var _gameState = 0;

    /**
     * Resets the board and redistributes the mines randomly.
     */
    this.resetBoard = function(numMines) {
        if (numMines > _minefield.getWidth() * _minefield.getHeight())
            return;

        _minesLeft = numMines;
        _gameState = 0;

        var leftToDistribute = numMines;
        while (leftToDistribute > 0) {
            var x = getRandomInt(0, _minefield.getWidth() - 1);
            var y = getRandomInt(0, _minefield.getHeight() - 1);

            if (_minefield.isMined(x, y))
                continue;

            _minefield.setMined(x, y, true);
            this._mapToAdjacentCells(x, y, this._incrementMineNumber);
            leftToDistribute--;
        }
    }

    /**
     * Applies the function f to the adjacent cells of (x, y).
     */
    this._mapToAdjacentCells = function(x, y, f) {
        f(x - 1, y - 1);
        f(x - 1, y);
        f(x - 1, y + 1);
        f(x, y - 1);
        f(x, y + 1);
        f(x + 1, y - 1);
        f(x + 1, y);
        f(x + 1, y + 1);
    }

    /**
     * Increments the number of a cell by one.
     * TODO: Should this be handled by Minefield instead?
     */
    this._incrementMineNumber = function(x, y) {
        if (x < 0 || x >= _minefield.getWidth()
                || y < 0 || y >= _minefield.getHeight())
            return;

        var n = _minefield.getNumber(x, y);
        _minefield.setNumber(x, y, n + 1);
    }

    this.reveal = function(x, y) {
        if (_gameState !== 0 || _minefield.isRevealed(x, y)
                || _minefield.isFlagged(x, y))
            return;

        if (_minefield.isMined(x, y)) {
            this.revealAll();
            _gameState = -1;
            _gameCanvas.drawCell(x, y);
            return;
        }

        if (_minefield.getNumber(x, y) === 0) {
            this._bfsReveal(x, y);
        } else {
            _minefield.setRevealed(x, y, true);
            _gameCanvas.drawCell(x, y);
        }
    }

    this.revealAll = function() {
        for (var i = 0; i < _minefield.getHeight(); i++) {
            for (var j = 0; j < _minefield.getWidth(); j++) {
                _minefield.setRevealed(j, i, true);
                _gameCanvas.drawCell(j, i);
            }
        }
    }

    this._bfsReveal = function(x, y) {
        // Push and pop two elements at the time
        var queue = [x, y];

        while (queue.length > 0) {
            // Remove the first two elements from the queue
            var x = queue.shift();
            var y = queue.shift();

            // Check that x and y is within boundaries
            if (x < 0 || x >= _minefield.getWidth()
                    || y < 0 || y >= _minefield.getHeight())
                continue;

            if (!_minefield.isMined(x, y)
                    && !_minefield.isFlagged(x, y)
                    && !_minefield.isRevealed(x, y)) {
                // Reveal if not mined and not already revealed
                _minefield.setRevealed(x, y, true);
                _gameCanvas.drawCell(x, y);

                // Add adjacent cells to the end of the queue if current cell
                // is blank
                if (_minefield.getNumber(x, y) === 0) {
                    queue.push(x - 1, y - 1,
                               x - 1, y,
                               x - 1, y + 1,
                               x, y - 1,
                               x, y + 1,
                               x + 1, y - 1,
                               x + 1, y,
                               x + 1, y + 1
                    );
                }
            }
        }
    }

    this.flag = function(x, y) {
        if (_minefield.isRevealed(x, y))
            return;

        var flagged = _minefield.isFlagged(x, y);

        if (!flagged && _minesLeft === 0) {
            console.log('No mines left!');
            return;
        }

        _minefield.setFlagged(x, y, !flagged);
        _gameCanvas.drawCell(x, y);
        _minesLeft += (flagged) ? 1 : -1;

        console.log('Mines left: ' + _minesLeft);
    }

    this.getGameState = function() {
        return this._gameState;
    }

    this.getMinesLeft = function() {
        return this._minesLeft;
    }

}

var config = {
    width: 10,
    height: 10,
    cellSize: 30,
    numMines: 10
};

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
}

// Right click for flagging/unflagging
gridCanvas.oncontextmenu = function(event) {
    event.preventDefault();
    var cell = getCellFromEvent(event);
    var x = cell[0];
    var y = cell[1];
    swoopy.flag(x, y);
}

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
        x = event.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop
            + document.documentElement.scrollTop;
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

