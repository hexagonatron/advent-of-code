const { verify } = require('crypto');
const fs = require('fs');
const path = require('path');
const data = fs.readFile('./input.txt', 'utf-8', (err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const printArr = (arr) => {
    const printable = arr.map(l => l.join('')).join('\n');
    console.log(printable);
}

const handleData = (data) => {
    const strLines = data.split('\n');
    const lines = strLines.map(l => l.split(' -> ').map(pair => pair.split(',').map(n => +n)));
    console.log(lines);

    const max = lines.flatMap((v) => v).reduce((a, [x, y]) => ({x: Math.max(x, a.x), y: Math.max(y, a.y)}), {x: 0, y: 0});

    const array = new Array(max.y).fill(new Array(max.x).fill('.'));

    const directions = {
        UP: ([x, y]) => ([x-1, y]),
        DOWN: ([x, y]) => ([x+1, y]),
        LEFT: ([x, y]) => ([x, y-1]),
        RIGHT: ([x, y]) => ([x, y+1]),
        DOWNRIGHT: (point) => this.DOWN(this.RIGHT(point)),
        DOWNLEFT: (point) => this.DOWN(this.RIGHT(point))
    }

    const getDiff = ([x1, y1], [x2, y2]) => ([x1 - x2, y1 - y2]);

    for(line of lines) {
        for(let i = 1; i < line.length; i++) {
            const point1 = line[i-1];
            const point2 = line[i-1];
            const [diffX, diffY] = getDiff(point1, point2);
            if (diffX === 0 && diffY > 0) {
            } else if (diffX === 0 && diffY < 0) {
            } else if (diffY === 0 && diffX > 0) {
            } else if (diffY === 0 && diffX < 0) {
            }
        }
    }
    printArr(array);
    
}