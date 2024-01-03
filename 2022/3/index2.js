
const fs = require('fs');
const data = fs.readFile('./input.txt', 'utf-8' ,(err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const convertToPoint = (letter) => {
    const code = letter.charCodeAt(0);
    const point = code >= 97 ? code - 96 : code - 38;
    return point;
}

const handleData = (data) => {
    const groups = data
    .split('\n')
    .reduce((a, val, i) => {
        const pack = val.split('');
        if (i%3 === 0) {
            a.push([pack]);
            return a;
        }
        a[a.length -1].push(pack);
        return a;
    },[]);
    const points = groups.map(packs => {
        const letter = packs[0].filter(val => packs[1].includes(val) && packs[2].includes(val)).pop();
        return convertToPoint(letter);
    });
    const total = points.reduce((a, val) => a + val , 0);
    console.log(total);
}