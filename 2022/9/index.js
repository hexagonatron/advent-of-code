const { verify } = require('crypto');
const fs = require('fs');
const data = fs.readFile('./input.txt', 'utf-8', (err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const handleData = (data) => {
    const moves = data.split('\n').map(l => l.split(' ')).map(([dir, count]) => ({direction: dir, count: +count}));
    const visits = new Set();

    const rope = []
    for(let i = 1; i<=10; i++) {
        rope.push({x: 0, y: 0});
    }
    console.log(rope);
    const printPoint = (point) => {
        return point.x + ','+ point.y;
    }

    const fixTail = (front, behind) => {
        const xDif = behind.x - front.x;
        const yDif = behind.y - front.y;
        if (
            (xDif <= 1) &&
            (xDif >= -1) &&
            (yDif <= 1) &&
            (yDif >= -1)
        ) {
            return;
        }

        const fixX = () => {
            if (xDif > 0) {
                behind.x--;
            } else if (xDif < 0) {
                behind.x++;
            }
        }

        const fixY = () => {
            if (yDif > 0) {
                behind.y--;
            } else if (yDif < 0) {
                behind.y++;
            }
        }

        if (xDif === 2) {
            behind.x--;
            fixY();
        }else if (xDif === -2) {
            behind.x++;
            fixY();
        }else if (yDif === 2) {
            behind.y--;
            fixX();
        }else if (yDif === -2) {
            behind.y++;
            fixX();
        }
    }
    
    const moveHead = (moveFn, amount) => {
        for (let i = 0; i < amount; i++) {
            moveFn(rope[0]);
            for(let i=1; i<=9; i++) {
                fixTail(rope[i-1], rope[i]);
                if(i === 9) {
                    console.log("tailadd")
                    visits.add(printPoint(rope[9]));
                }
            }
            console.log(rope);
        }
    }

    visits.add(printPoint(rope[9]));
    let i = 0;
    for (move of moves) {
        if(i>5) {
            // break;
        }
        if (move.direction === 'U') {
            moveHead(() => rope[0].y++, move.count)
        } else if (move.direction === 'D') {
            moveHead(() => rope[0].y--, move.count)
        } else if (move.direction === 'L') {
            moveHead(() => rope[0].x--, move.count)
        } else if (move.direction === 'R'){
            moveHead(() => rope[0].x++, move.count)
        }
        i++;
    }
    console.log(visits.size);
}