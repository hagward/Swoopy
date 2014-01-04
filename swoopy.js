/**
 * Represents a minefield and supports flagging, numbering and revealing of
 * cells. Contains no game logic.
 */
function Minefield(width, height) {

    var _width = width;
    var _height = height;
    var _grid = new Array(width * height);
    for (var i = 0; i < _grid.length; i++)
        _grid[i] = 0;

    // Used for debugging purposes only. To be removed.
    this.getGrid = function() { return _grid; }

    this.getWidth = function() {
        return _width;
    }

    this.getHeight = function() {
        return _height;
    }

    this.getState = function(x, y) {
        var i = this._coordToIndex(x, y);
        return _grid[i];
    }

    this.isMined = function(x, y) {
        var i = this._coordToIndex(x, y);
        return (_grid[i] & 16) != 0;
    }

    this.isFlagged = function(x, y) {
        var i = this._coordToIndex(x, y);
        return (_grid[i] & 32) != 0;
    }

    this.isRevealed = function(x, y) {
        var i = this._coordToIndex(x, y);
        return (_grid[i] & 128) != 0;
    }

    /**
     * Returns the number (as in number of adjacent mines) at the specified
     * location, or -1 if it contains not a number.
     */
    this.getNumber = function(x, y) {
        var i = this._coordToIndex(x, y);
        if ((_grid[i] & 64) == 0) return -1;
        return (_grid[i] & 15);
    }

    this.setMined = function(x, y, mined) {
        var i = this._coordToIndex(x, y);
        _grid[i] = (mined) ? _grid[i] | 16 : _grid[i] & ~16;
    }

    this.setFlagged = function(x, y, flagged) {
        var i = this._coordToIndex(x, y);
        _grid[i] = (flagged) ? _grid[i] | 32 : _grid[i] & ~32;
    }

    this.setRevealed = function(x, y, revealed) {
        var i = this._coordToIndex(x, y);
        _grid[i] = (revealed) ? _grid[i] | 128 : _grid[i] & ~128;
    }

    this.setNumber = function(x, y, number) {
        var i = this._coordToIndex(x, y);
        _grid[i] &= 240; // Clear the four rightmost bits
        _grid[i] |= ((number & 15) | 64);
    }

    this._coordToIndex = function(x, y) {
        return y * width + x;
    }

}

/**
 * Represents the visual minefield.
 */
function GameCanvas(canvas, minefield, cellSize) {
 
    var _canvas = canvas;
    var _context = canvas.getContext("2d");
    var _minefield = minefield;
    var _cellSize = cellSize;

    _canvas.width = _minefield.getWidth() * cellSize;
    _canvas.height = _minefield.getHeight() * cellSize;
    _context.font = 'bold 20px Arial';

    /**
     * Fills a cell with a color.
     */
    this._fillColor = function(x, y, color) {
        _context.fillStyle = color;
        _context.fillRect(x * cellSize, y * cellSize,
                cellSize, cellSize);
    }

    /**
     * Writes text to the center of a cell.
     */
    this._fillText = function(x, y, text, color) {
        _context.fillStyle = color;
        _context.fillText(text,
                x * cellSize + 10,
                y * cellSize + 20);
        console.log('just filled some text bro: ' + text);
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
                if (number != -1)
                    this._fillText(x, y, number, 'green');
            }
        } else if (_minefield.isFlagged(x, y)) {
            this._fillColor(x, y, 'blue');
        } else {
            this._fillColor(x, y, 'grey');
        }
    }

    this.draw = function() {
        // Clear the canvas
        // _canvas.width = _canvas.width;

        _context.fillStyle = 'grey';
        _context.fillRect(0, 0, _canvas.width, _canvas.height);

        for (var i = 0; i < _minefield.getHeight(); i++)
            for (var j = 0; j < _minefield.getWidth(); j++)
                this.drawCell(j, i);

        // Vertical lines
        for (var i = 1; i < _minefield.getWidth(); i++) {
            var x = i * cellSize;
            _context.beginPath();
            _context.moveTo(x, 0);
            _context.lineTo(x, _canvas.height);
            _context.stroke();
        }

        // Horizontal lines
        for (var i = 1; i < _minefield.getHeight(); i++) {
            var y = i * cellSize;
            _context.beginPath();
            _context.moveTo(0, y);
            _context.lineTo(_canvas.width, y);
            _context.stroke();
        }
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

    this.initBoard = function(numMines) {
        _minesLeft = numMines;

        // TODO: randomly distribute the mines across the board
    }

    this.reveal = function(x, y) {
        if (_minefield.isRevealed(x, y) || _minefield.isFlagged(x, y))
            return;

        if (_minefield.isMined(x, y)) {
            _minefield.setRevealed(x, y, true);
            _gameState = -1;
            _gameCanvas.drawCell(x, y);
            return;
        }

        if (_minefield.getNumber(x, y) == -1) {
            this._bfsReveal(x, y);
        } else {
            _minefield.setRevealed(x, y, true);
            _gameCanvas.drawCell(x, y);
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

            if (!_minefield.isMined(x, y) && !_minefield.isRevealed(x, y)) {
                // Reveal if not mined and not already revealed
                _minefield.setRevealed(x, y, true);
                _gameCanvas.drawCell(x, y);
                // console.log('bfs revealing: ' + x + ' ' + y);

                // Add adjacent cells to the end of the queue if current cell
                // is blank
                if (_minefield.getNumber(x, y) == -1) {
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

        console.log('bfs complete!');
    }

    this.flag = function(x, y) {
        if (_minefield.isRevealed(x, y))
            return;

        var flagged = _minefield.isFlagged(x, y);
        _minefield.setFlagged(x, y, !flagged);
        _gameCanvas.drawCell(x, y);
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
    cellSize: 30
};

var canvas = document.getElementById('gameCanvas');

var minefield = new Minefield(config.width, config.height);
var gameCanvas = new GameCanvas(canvas, minefield, config.cellSize);
var swoopy = new Swoopy(minefield, gameCanvas);

gameCanvas.draw();

canvas.onmousedown = function(event) {
    console.log('mouse down at: ' + x + ' ' + y);

    var cell = getCellFromEvent(event);
    var x = cell[0];
    var y = cell[1];

    swoopy.reveal(x, y);
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
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    // Find block number
    x = Math.floor(x / config.cellSize);
    y = Math.floor(y / config.cellSize);

    return [x, y];
}

