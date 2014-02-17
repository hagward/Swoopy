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

        _gameCanvas.draw();
    };

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
    };

    /**
     * Increments the number of a cell by one.
     * TODO: Should this be handled by Minefield instead?
     */
    this._incrementMineNumber = function(x, y) {
        if (x < 0 || x >= _minefield.getWidth() ||
                y < 0 || y >= _minefield.getHeight())
            return;

        var n = _minefield.getNumber(x, y);
        _minefield.setNumber(x, y, n + 1);
    };

    this.reveal = function(x, y) {
        if (_gameState !== 0 || _minefield.isRevealed(x, y) ||
                _minefield.isFlagged(x, y))
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
    };

    this.revealAll = function() {
        for (var i = 0; i < _minefield.getHeight(); i++) {
            for (var j = 0; j < _minefield.getWidth(); j++) {
                _minefield.setRevealed(j, i, true);
                _gameCanvas.drawCell(j, i);
            }
        }
    };

    this._bfsReveal = function(x, y, animate) {
        // Push and pop two elements at the time
        var queue = [x, y];

        while (queue.length > 0) {
            // Remove the first two elements from the queue
            x = queue.shift();
            y = queue.shift();

            // Check that x and y is within boundaries
            if (x < 0 || x >= _minefield.getWidth() ||
                    y < 0 || y >= _minefield.getHeight())
                continue;

            if (!_minefield.isMined(x, y) &&
                    !_minefield.isFlagged(x, y) &&
                    !_minefield.isRevealed(x, y)) {
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
    };

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
    };

    this.getGameState = function() {
        return this._gameState;
    };

    this.getMinesLeft = function() {
        return this._minesLeft;
    };

}

