const fs = require('fs');
const { checkServerIdentity } = require('tls');

const readData = (path, callback) => {
    fs.readFile(path, 'utf-8', (err, data) => {
        callback(data);
    });
}

const handleData = (data) => {
    const [numberOrdertxt, ...boards] = data.split('\n\n');
    const numberOrder = numberOrdertxt.split(',').map(v => +v);

    const boardsFormatted = boards.map(v => {
        const b = v.split('\n').map(v => v.trim());
        const bformatted = b.map(v => v.replace('  ', ' ').split(' ').map(v => ({ value: +v, revealed: false })));
        return bformatted;
    });
    console.log(boardsFormatted[0])

    const reveal = (num) => {
        for (board of boardsFormatted) {
            for (row of board) {
                for (rowItem of row) {
                    if (num === rowItem.value) {
                        rowItem.revealed = true;
                    }
                }
            }
        }
    }

    const checkWinners = (num) => {
        const checkDiag = (board) => {
            for (let i = 0; i < board.length; i++){
                if (!board[i][i].revealed) return;
            }
            return true
        }

        const checkOtherDiag = (board) => {
            for (let i = board.length -1; i >= 0; i--){
                if (!board[i][i].revealed) return;
            }
            return true
        }

        const checkHorizontals = (board) => {
            boardItr: 
            for (boardRow of board) {
                for (boardItem of boardRow) {
                    if (!boardItem.revealed) continue boardItr;
                }
                return true;
            }
        }

        const checkVer = (board) => {
            boardItr:
            for (let i = 0; i < board.length; i++){
                for (let j = 0; j < board.length; j++){
                    if (!board[j][i].revealed) continue boardItr;
                }
                return true;
            };
        }

        const calculateScore = (board) => {
            let score = 0;
            for (boardRow of board) {
                for (boardItem of boardRow) {
                    if (!boardItem.revealed) score += boardItem.value;
                }
            }
            console.log({score: score * num});
        }

        for (board of boardsFormatted) {
            if (
                checkHorizontals(board)
                || checkVer(board)
            ) {
                console.log('WON')
                console.log(board)
                calculateScore(board)
                return true;
            }
        }
    }


    for (num of numberOrder) {
        reveal(num);
        if (checkWinners(num)) {
            break;
        }
    }
}

readData('./input.txt', handleData);