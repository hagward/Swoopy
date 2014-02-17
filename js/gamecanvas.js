/**
 * Represents the visual minefield.
 */
function GameCanvas(gameCanvas, gridCanvas, minefield, cellSize) {
 
    var _gameCanvas = gameCanvas;
    var _gridCanvas = gridCanvas;
    var _gameContext = gameCanvas.getContext('2d');
    var _gridContext = gridCanvas.getContext('2d');
    var _minefield = minefield;

    _gameCanvas.width = _minefield.getWidth() * cellSize;
    _gameCanvas.height = _minefield.getHeight() * cellSize;
    _gameCanvas.style.marginLeft = (-_gameCanvas.width / 2) + 'px';
    _gameContext.font = '20px sans-serif';
    _gameCanvas.style.border = '2px solid black';

    _gridCanvas.width = _gameCanvas.width;
    _gridCanvas.height = _gameCanvas.height;
    _gridCanvas.style.marginLeft = _gameCanvas.style.marginLeft;
    _gridCanvas.style.border = '2px solid black';

    var i;

    // Vertical lines
    for (i = 1; i < _minefield.getWidth(); i++) {
        var x = i * cellSize;
        _gridContext.beginPath();
        _gridContext.moveTo(x, 0);
        _gridContext.lineTo(x, _gameCanvas.height);
        _gridContext.stroke();
    }

    // Horizontal lines
    for (i = 1; i < _minefield.getHeight(); i++) {
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
    };

    /**
     * Writes text to the center of a cell.
     */
    this._fillText = function(x, y, text, color) {
        _gameContext.fillStyle = color;
        _gameContext.fillText(text,
                x * cellSize + 9,
                y * cellSize + 22);
    };

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
    };

    this.draw = function() {
        _gameContext.fillStyle = 'grey';
        _gameContext.fillRect(0, 0, _gameCanvas.width, _gameCanvas.height);
    };

}

