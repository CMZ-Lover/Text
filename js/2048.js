class Game2048 {
    constructor() {
        this.size = 4;
        this.board = [];
        this.score = 0;
        this.init();
        this.updateDisplay();
    }

    init() {
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.addNewTile();
        this.addNewTile();
    }

    addNewTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) emptyCells.push({x: i, y: j});
            }
        }
        if (emptyCells.length === 0) return;
        
        const {x, y} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.board[x][y] = Math.random() < 0.9 ? 2 : 4;
    }

    move(direction) {
        let moved = false;
        const oldBoard = JSON.stringify(this.board);
        
        switch(direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }
        
        if (moved) {
            this.addNewTile();
            this.updateDisplay();
            this.checkGameState();
        }
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            let row = this.board[i].filter(x => x !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                    moved = true;
                }
            }
            const newRow = row.concat(Array(this.size - row.length).fill(0));
            if (this.board[i].toString() !== newRow.toString()) moved = true;
            this.board[i] = newRow;
        }
        return moved;
    }

    moveRight() {
        this.reverseRows();
        const moved = this.moveLeft();
        this.reverseRows();
        return moved;
    }

    moveUp() {
        this.transpose();
        const moved = this.moveLeft();
        this.transpose();
        return moved;
    }

    moveDown() {
        this.transpose();
        const moved = this.moveRight();
        this.transpose();
        return moved;
    }

    transpose() {
        this.board = this.board[0].map((_, i) => 
            this.board.map(row => row[i])
        );
    }

    reverseRows() {
        this.board = this.board.map(row => [...row].reverse());
    }

    checkGameState() {
        if (this.board.flat().includes(2048)) {
            setTimeout(() => alert('恭喜达成2048！'), 100);
            return;
        }
        
        if (!this.hasMovesLeft()) {
            setTimeout(() => {
                alert(`游戏结束！得分：${this.score}`);
                this.init();
            }, 100);
        }
    }

    hasMovesLeft() {
        if (this.board.flat().includes(0)) return true;
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (j < this.size - 1 && this.board[i][j] === this.board[i][j + 1]) return true;
                if (i < this.size - 1 && this.board[i][j] === this.board[i + 1][j]) return true;
            }
        }
        return false;
    }

    updateDisplay() {
        const container = document.getElementById('board');
        container.innerHTML = '';
        
        this.board.forEach((row, i) => {
            row.forEach((cell, j) => {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.textContent = cell || '';
                tile.style.backgroundColor = this.getTileColor(cell);
                tile.style.color = cell > 4 ? '#f9f6f2' : '#776e65';
                tile.style.fontSize = cell < 100 ? '24px' : '20px';
                container.appendChild(tile);
            });
        });
        
        document.getElementById('score').textContent = this.score;
    }

    getTileColor(value) {
        const colors = {
            0: '#cdc1b4',
            2: '#eee4da',
            4: '#ede0c8',
            8: '#f2b179',
            16: '#f59563',
            32: '#f67c5f',
            64: '#f65e3b',
            128: '#edcf72',
            256: '#edcc61',
            512: '#edc850',
            1024: '#edc53f',
            2048: '#edc22e'
        };
        return colors[value] || '#3c3a32';
    }
}

const game = new Game2048();

function move(direction) {
    game.move(direction);
}
