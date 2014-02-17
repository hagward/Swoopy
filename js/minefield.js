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
    this.getGrid = function() { return _grid; };

    this.getWidth = function() {
        return _width;
    };

    this.getHeight = function() {
        return _height;
    };

    this.getState = function(x, y) {
        return _grid[y][x];
    };

    this.isMined = function(x, y) {
        return (_grid[y][x] & 16) !== 0;
    };

    this.isFlagged = function(x, y) {
        return (_grid[y][x] & 32) !== 0;
    };

    this.isRevealed = function(x, y) {
        return (_grid[y][x] & 128) !== 0;
    };

    /**
     * Returns the number (as in number of adjacent mines) at the specified
     * location.
     */
    this.getNumber = function(x, y) {
        if ((_grid[y][x] & 64) === 0) return 0;
        return (_grid[y][x] & 15);
    };

    this.setMined = function(x, y, mined) {
        _grid[y][x] = (mined) ? _grid[y][x] | 16 : _grid[y][x] & ~16;
    };

    this.setFlagged = function(x, y, flagged) {
        if (flagged !== this.isFlagged(x, y))
            _numFlags += (flagged) ? 1 : -1;
        _grid[y][x] = (flagged) ? _grid[y][x] | 32 : _grid[y][x] & ~32;
    };

    this.setRevealed = function(x, y, revealed) {
        _grid[y][x] = (revealed) ? _grid[y][x] | 128 : _grid[y][x] & ~128;
    };

    this.setNumber = function(x, y, number) {
        _grid[y][x] &= 240; // Clear the four rightmost bits
        _grid[y][x] |= ((number & 15) | 64);
    };

}

