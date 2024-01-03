const fs = require('fs');
const path = require('path');
const data = fs.readFile(path.resolve(__dirname, 'input.txt'), 'utf-8' ,(err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const handleData = (data) => {
    const tally = {};
    const lines = data.split('\n');
    const games = lines.map((line) => {
        const [cardStr, numbers] = line.split(':')
        const cardNum = +cardStr.match(/Card\s+(\d+)$/)[1];
        tally[cardNum] = tally[cardNum] === undefined ? 1 : tally[cardNum] + 1;
        const [winningNumStr, myNumStr] = numbers.split('|');
        const myNums = myNumStr.split(/\s/).filter(n => n!='').map(n => +n).sort((a, b) => a - b);
        const winningNums = winningNumStr.split(/\s/).filter(n => n != '').map(n => +n).sort((a, b) => a-b);
        const numberWinning = winningNums.filter(winNum => myNums.includes(winNum)).length;

        return {cardNum: cardNum, numberWinning: numberWinning};
    });

    const getWinningCards = (game) => {
        const cards = games.slice(game.cardNum, game.cardNum + game.numberWinning);
        console.log({cards, num: game.cardNum, wins: game.numberWinning});
        return cards;
    }

    const getPrizeCards = (game) => {
        if (game.numberWinning > 0) {
            const winningCards = getWinningCards(game);
            const recurseWinningCards = winningCards.map(card => {
                return getPrizeCards(card);
            }).flat();
            console.log(recurseWinningCards);
            return recurseWinningCards;
        }
        return [];
    }

    const tallyCardCounts = (game) => {
        console.log(game);
        const cards = getPrizeCards(game);
        cards.forEach(c => {
            tally[c.cardNum] = tally[c.cardNum] + 1;
        })
    }

    // games.forEach(game => {
    //     tallyCardCounts(game);
    // });
    // console.log(tally);

    const counts = {};

    for (let i = games.length -1; i >= 0; i--) {
        const game = games[i];

        const cards = games.slice(game.cardNum, game.cardNum + game.numberWinning);
        const total = cards.reduce((acc, card) => {
            const memCount = counts[card.cardNum] || 0;
            return acc + memCount;
        },0);
        counts[game.cardNum] = total + 1;
    }
    console.log(counts);
    const total = Object.values(counts).reduce((acc, v) => acc + v,0);
    console.log(total);

}