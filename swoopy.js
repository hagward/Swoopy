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

function GameCanvas(canvas, width, height, blockSize) {
 
    var _canvas = canvas;
    var _context = canvas.getContext("2d");
    var _blockSize = blockSize;
    var _minefield = new Minefield(width, height);

    _canvas.width = width * blockSize;
    _canvas.height = height * blockSize;
    _context.font = 'bold 20px Arial';

    this.getStupidMf = function() {
        return _minefield;
    }

    this.getStupidGrid = function() {
        return _minefield.getGrid();
    }

    this._fillColor = function(x, y, color) {
        _context.fillStyle = color;
        _context.fillRect(x * blockSize, y * blockSize,
                blockSize, blockSize);
    }

    this._fillText = function(x, y, text, color) {
        _context.fillStyle = color;
        _context.fillText(text,
                x * blockSize + 10,
                y * blockSize + 20);
        console.log('just filled some text bro: ' + text);
    }

    this._drawBlock = function(x, y) {
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
        }
    }

    this.draw = function() {
        // Clear the canvas
        // _canvas.width = _canvas.width;
        _context.fillStyle = 'grey';
        _context.fillRect(0, 0, _canvas.width, _canvas.height);

        for (var i = 0; i < _minefield.getHeight(); i++)
            for (var j = 0; j < _minefield.getWidth(); j++)
                this._drawBlock(j, i);

        // Vertical lines
        for (var i = 1; i < _minefield.getWidth(); i++) {
            var x = i * blockSize;
            _context.beginPath();
            _context.moveTo(x, 0);
            _context.lineTo(x, _canvas.height);
            _context.stroke();
        }

        // Horizontal lines
        for (var i = 1; i < _minefield.getHeight(); i++) {
            var y = i * blockSize;
            _context.beginPath();
            _context.moveTo(0, y);
            _context.lineTo(_canvas.width, y);
            _context.stroke();
        }
    }

}

var canvas = new GameCanvas(document.getElementById('gameCanvas'),
        10, 10, 30);
var g = canvas.getStupidGrid();
var mf = canvas.getStupidMf();
canvas.draw();

