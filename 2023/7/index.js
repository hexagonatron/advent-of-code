const fs = require('fs');
const path = require('path');
const data = fs.readFile(path.resolve(__dirname, 'input.txt'), 'utf-8', (err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const cardOrder = ['A', 'K', 'Q', 'T', '9', '8', '7', '6', '5', '4', '3', '2', 'J'];
const cardOrderNoJ = cardOrder.slice(0, -1);
const handTypeRank = ['5Kind', '4Kind', 'Full', '3Kind', '2Pair', '1Pair', 'High']

const is1Pair = (hand) => {
    return cardOrderNoJ.map(card => [...hand.matchAll(new RegExp(`[${card}J]`, "g"))].length).filter(len => len === 2).length >= 1;
}
const is2Pair = (hand) => {
    for (const card of cardOrderNoJ) {
        const matches = [...hand.matchAll(new RegExp(`[${card}J]`, "g"))];
        if (matches.length === 2) {
            const remaining = hand.split('').filter((c, i) => !matches.some(m => m.index === i)).join('');
            for (const card2 of cardOrderNoJ) {
                const matches2ndP = [...remaining.matchAll(new RegExp(`[${card2}]`, "g"))];
                if (matches2ndP.length === 2) {
                    return true;
                }
            }
        }
    }
    return false;
}

const is5Kind = (hand) => {
    return cardOrderNoJ.map(card => [...hand.matchAll(new RegExp(`[${card}J]`, "g"))].length).filter(len => len === 5).length >= 1;
}

const is4Kind = (hand) => {
    return cardOrderNoJ.map(card => [...hand.matchAll(new RegExp(`[${card}J]`, "g"))].length).filter(len => len === 4).length >= 1;
}

const is3Kind = (hand) => {
    return cardOrderNoJ.map(card => [...hand.matchAll(new RegExp(`[${card}J]`, "g"))].length).filter(len => len === 3).length >= 1;
}
const isFull = (hand) => {
    for (const card of cardOrderNoJ) {
        const matches = [...hand.matchAll(new RegExp(`[${card}J]`, "g"))]
        if (matches.length === 3) {
            const remaining = hand.split('').filter((c, i) => !matches.some(m => m.index === i)).join('');
            return cardOrderNoJ.map(card => [...remaining.matchAll(new RegExp(`[${card}]`, "g"))].length).filter(len => len === 2).length === 1;
        }
    }
}


const getType = (hand) => {
    if (is5Kind(hand)) {
        return '5Kind';
    } else if (is4Kind(hand)) {
        return '4Kind';
    } else if (isFull(hand)) {
        return 'Full';
    } else if (is3Kind(hand)) {
        return '3Kind';
    } else if (is2Pair(hand)) {
        return '2Pair';
    } else if (is1Pair(hand)) {
        return '1Pair';
    } else {
        return 'High';
    }
}

class Hand {
    constructor(hand, bet) {
        this.hand = hand;
        this.bet = +bet;
        this.type = getType(hand);
    }

    compare(other) {
        const diff = handTypeRank.indexOf(other.type) - handTypeRank.indexOf(this.type);
        if (diff === 0) {
            for (let i = 0; i <= 5; i++) {
                const cardDiff = cardOrder.indexOf(other.hand[i]) - cardOrder.indexOf(this.hand[i]);
                if (cardDiff != 0) {
                    return cardDiff;
                }
            }
            return 0;
        }
        return diff;
    }
}

const handleData = (data) => {
    const winning = data
        .split('\n')
        .map(line => {
            const [hand, bet] = line.split(' ');
            return {
                hand: new Hand(hand),
                bet: +bet,
            }
        })
        .sort((a, b) => a.hand.compare(b.hand))
        .map((line, i) => {
            line.winning = line.bet * (i + 1);
            console.log(`${line.hand.hand}\t${line.hand.type}\t${line.winning}\t${line.bet}`)
            return line;
        })
        .reduce((total, line) => {
            return total + line.winning;
        }, 0);
    console.log(winning);
}