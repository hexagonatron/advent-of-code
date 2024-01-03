const fs = require('fs');
const data = fs.readFile('./input.txt', 'utf-8' ,(err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const handleData = (data) => {
    const tally = {};
    const lines = data.split('\n');
    const total = lines.reduce((total, line) => {
        const [cardStr, numbers] = line.split(':')
        const cardNum = +cardStr.match(/Card\s+(\d+)$/)[1];
        tally[cardNum] = tally[cardNum] === undefined ? 1 : tally[cardNum] + 1;

        console.log(numbers);
        const [winningNumStr, myNumStr] = numbers.split('|');
        const myNums = myNumStr.split(/\s/).filter(n => n!='').map(n => +n).sort((a, b) => a - b);
        const winningNums = winningNumStr.split(/\s/).filter(n => n != '').map(n => +n).sort((a, b) => a-b);
        const numberWinning = winningNums.filter(winNum => myNums.includes(winNum)).length;

        return numberWinning > 0 ? total + (2**(numberWinning -1)): total;

    }, 0);
    console.log(total);
}