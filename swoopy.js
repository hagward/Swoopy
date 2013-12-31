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
        return (_grid[i] & 1) == 1;
    }

    this.isFlagged = function(x, y) {
        var i = this._coordToIndex(x, y);
        return (_grid[i] & 2) == 2;
    }

    this.isRevealed = function(x, y) {
        var i = this._coordToIndex(x, y);
        return (_grid[i] & 4) == 4;
    }

    this.setMined = function(x, y, mined) {
        var i = this._coordToIndex(x, y);
        _grid[i] = (mined) ? _grid[i] | 1 : _grid[i] & ~1;
    }

    this.setFlagged = function(x, y, flagged) {
        var i = this._coordToIndex(x, y);
        _grid[i] = (flagged) ? _grid[i] | 2 : _grid[i] & ~2;
    }

    this.setRevealed = function(x, y, revealed) {
        var i = this._coordToIndex(x, y);
        _grid[i] = (revealed) ? _grid[i] | 4 : _grid[i] & ~4;
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

    this._fillBox = function(x, y, color) {
        _context.fillStyle = color;
        _context.fillRect(x * blockSize, y * blockSize,
                blockSize, blockSize);
    }

    this.draw = function() {
        for (var i = 0; i < _minefield.getHeight(); i++) {
            for (var j = 0; j < _minefield.getWidth(); j++) {
                if (_minefield.isFlagged(j, i) && !_minefield.isRevealed(j, i))
                    this._fillBox(j, i, 'blue');
/*
                var state = _minefield.getState(j, i);
                switch (state) {
                    // Not revealed, no mine, no flag
                    case 0:

                        break;

                    // Not revealed, mine, no flag
                    case 1:

                        break;

                    // Not revealed, no mine, flag
                    case 2:

                        break;

                    // Not revealed, mine, flag
                    case 3:

                        break;

                    // Revealed, no mine, no flag
                    case 4:

                        break;

                    // Revealed, mine, no flag
                    case 6:

                        break;
                }
*/
            }
        }

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
canvas.draw();

