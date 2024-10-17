//game logic will be handled here

export const CELL_STATUS = {
    HIDDEN: "hidden",
    MINE: "mine",
    NUMBER: "number",
    FLAGGED: "flagged",
}

export function checkWin(board) {
    return board.every(row => {
        return row.every(cell => {
            return cell.status === CELL_STATUS.NUMBER || (cell.mine && (cell.status === CELL_STATUS.HIDDEN || cell.mine === CELL_STATUS.FLAGGED))
        })
    })
}

export function checkLoss(board) {
    return board.some(row => {
        return row.some(cell => {
            return cell.status === CELL_STATUS.MINE;
        })
    });
}

export function revealCell(board, cell){
    if(cell.status !== CELL_STATUS.HIDDEN){ //reading properties of undefined. type error. why is this new.
        return; 
    }

    if(cell.mine){
        cell.status = CELL_STATUS.MINE;
        return;
    }

    cell.status = CELL_STATUS.NUMBER;
    
    const neighbourCells = closeCells(board, cell); // board is undefined?
   
    const mines = neighbourCells.filter(c => c.mine);
    if(mines.length === 0) {
        //recursively calls the revealCell method. 
        neighbourCells.forEach(revealCell.bind(null, board));
    } else {
        cell.element.textContent = mines.length;
    }
}

export function createBoard(boardSize, numberOfMines) {
    const board = [];
    const minePlacement = getMinePlacement(boardSize, numberOfMines);

    //this will build the game baord. X axis is our rows, Y axis is our columns
    for (let r = 0; r < boardSize; r++) { 
        const row = [];
        for (let c = 0; c < boardSize; c++) {
            const element = document.createElement("div");
            element.dataset.status = CELL_STATUS.HIDDEN;
            const cell = { 
                element,
                r, 
                c, 
                mine: minePlacement.some(positionDuplicate.bind(null,{ r, c })), //returns true if there are mines placed at the r and c coordinates passed in above. 
                //this lets us get and set the status of our cell with out having to type out the line above where cell is created. 
                get status() {
                    return this.element.dataset.status;
                },
                set status(value) {
                    this.element.dataset.status = value;
                }
            };

            row.push(cell);
        }
        board.push(row);
    }
    return board
}

export function flagCell(cell) {
    //first check prevents us from flagging revealed or mined tiles that have been revealed as a mine. (you lost)
    if(cell.status !== CELL_STATUS.HIDDEN && cell.status !== CELL_STATUS.FLAGGED) {
        return;
    }

    if(cell.status === CELL_STATUS.FLAGGED) {
        cell.status = CELL_STATUS.HIDDEN;
    } else {
        cell.status = CELL_STATUS.FLAGGED;
    }
}

function getMinePlacement(boardSize, numberOfMines) {
    const positions = [];

    while(positions.length < numberOfMines) {
        const position = {
            r: randomCoordinate(boardSize),
            c: randomCoordinate(boardSize)
        } 
        
        //returns true if positions already exists in the array
        //idk how it knows how to assign p to something but i know it compares the row and column of 2 positions and only works if they are different.
        if(!positions.some(positionDuplicate.bind(null, position))) { 
            positions.push(position);
        }
    }

    return positions;
}

function positionDuplicate(a, b) {
    //returns true if the coordinates are the same
    return a.r === b.r && a.c === b.c; 
}

function randomCoordinate(size) {
    //floor converts this to an integer, forcing a round down.
    return Math.floor(Math.random() * size);
}

//destructured cell to its row and column aspect
function closeCells(board, { r, c }) {
    const cells = [];
    //makes an offset for Rows and Columns so that you can test the 8 spaces surrounded the revealed tile.
    for(let rOffset = -1; rOffset < 2; rOffset++){
        for(let cOffset = -1; cOffset < 2; cOffset++){
            const cell = board[r + rOffset]?.[c + cOffset]; //uses optional chaining syntax ?. if you have an element in this row then get element in the column direction
            if(cell) {cells.push(cell)} 
        }
    }
    return cells;
}