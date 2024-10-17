//Rendering and ui will be handled here. 

import {
    CELL_STATUS,
    createBoard, 
    flagCell, 
    revealCell,
    checkWin,
    checkLoss
} from "./MineSweeper.js";

const boardSize = 10;
const numberOfMines = 15;
//causes crash if more mines than board

//Creates board element using 2 variables. then targets the board tag in html to get its id. 
const board = createBoard(boardSize, numberOfMines);
const boardElement = document.querySelector('.board');
const minesLeftText = document.querySelector('[data-mine-count]');
const gameStateText = document.querySelector('.subtext');

//changes the variable size input in Css to board size.
boardElement.style.setProperty("--size", boardSize);
//changes mine count text
minesLeftText.textContent = numberOfMines;

board.forEach(row =>{
    row.forEach(cell =>{
        boardElement.append(cell.element);
        cell.element.addEventListener('click', () => {
            revealCell(board, cell);
            checkWinLoss();
        });
        cell.element.addEventListener('contextmenu', e => {
            e.preventDefault();
            flagCell(cell);
            editMinesLeft();
        })
    })
})

function editMinesLeft(){
    const flaggedCellsCount = board.reduce((count, row) => {
        return count + row.filter(cell => cell.status === CELL_STATUS.FLAGGED).length;
    }, 0)

    minesLeftText.textContent = numberOfMines - flaggedCellsCount;
}

function checkWinLoss() {
    const win = checkWin(board);
    const loss = checkLoss(board);

    if(win || loss) {
        //this click event happens before the bubble phase allowing us to call it before the next onclick events can be called. giving end game priority
        boardElement.addEventListener('click', stopPropagation, {capture: true});
        boardElement.addEventListener('contextmenu', stopPropagation, {capture: true});
    }

    if(win) {
        gameStateText.textContent = 'YOU WIN. FANTASTICO!!!!!!'
    }

    if(loss) {
        gameStateText.textContent = 'Everyone around you exploded and you are all dead :(';
        board.forEach(row => {
            row.forEach(cell => {
                if(cell.status === CELL_STATUS.FLAGGED) { flagCell(cell) }; //removes flags at end of game
                if (cell.mine) { revealCell(board, cell); }
            })
        })
    }
}

function stopPropagation(e) {
    //stops the event from going further down
    e.stopImmediatePropagation();
}
//check for win and loss scenario.