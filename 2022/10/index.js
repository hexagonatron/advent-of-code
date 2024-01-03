const { verify } = require('crypto');
const fs = require('fs');
const data = fs.readFile('./input.txt', 'utf-8', (err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const handleData = (data) => {
    const lines = data.split('\n');
    let cycle = 0;
    let printI = 0;
    let x = 1;
    const intA = [];
    let printy = 0;
    const pixelArr = [[]];

    const checkP = () => {
        if (pixelArr[printy].length >= 40) {
            printy ++;
            pixelArr.push([]);
        }
        console.log({cycle: cycle%40, x});
        let cyclef = cycle%40
        if (x === cyclef || x === (cyclef -1) || x === (cyclef + 1)) {
            pixelArr[printy].push('#')
        } else {
            pixelArr[printy].push('.')
        }
    }

    for (line of lines) {
        if (line.startsWith('noop')) {
            cycle += 1;
            checkP();
        } else if (line.startsWith('addx')) {
            const [_, magT]= line.split(' ')
            const mag = +magT;
            cycle += 1;
            checkP();
            x += mag;
            cycle+=1;
            checkP();
        } else {
            throw "=(";
        }

    }
    console.log(pixelArr.map(x => x.join('')).join('\n'));
}