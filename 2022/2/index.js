const fs = require('fs');
const data = fs.readFile('./input.txt', 'utf-8' ,(err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const LOSE_ME = 'X';
const WIN_ME = 'Z';
const DRAW_ME = 'Y';
const ROCK_OP = 'A';
const PAPER_OP = 'B';
const SCISSORS_OP = 'C';

const symbolScore = {
    ROCK: 1,
    PAPER: 2,
    SCISSORS: 3,
};

const scores = {
    [WIN_ME]: 6,
    [LOSE_ME]: 0,
    [DRAW_ME]: 3,
}


const winMat = {
    [ROCK_OP]: {
        [WIN_ME]: symbolScore.PAPER,
        [LOSE_ME]: symbolScore.SCISSORS,
        [DRAW_ME]: symbolScore.ROCK,
    },
    [PAPER_OP]: {
        [WIN_ME]: symbolScore.SCISSORS,
        [LOSE_ME]: symbolScore.ROCK,
        [DRAW_ME]: symbolScore.PAPER,
    },
    [SCISSORS_OP]: {
        [WIN_ME]: symbolScore.ROCK,
        [LOSE_ME]: symbolScore.PAPER,
        [DRAW_ME]: symbolScore.SCISSORS,
    },
}

const calcScore = (pair) => {
    const symbolScoreRes = winMat[pair[0]][pair[1]];
    const winLossScore = scores[pair[1]];
    return winLossScore + symbolScoreRes;
}

const handleData = (data) => {
    const pairs = data.split('\n').map(pair => pair.split(' '));
    const score = pairs.reduce((a, pair) =>  a + calcScore(pair) ,0)
    console.log(score);
}