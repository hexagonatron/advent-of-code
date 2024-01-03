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
    const lines = data.split('\n');
    const packs = lines
    .map(line => [
        line.slice(0, (line.length/2)).split(""), 
        line.slice(line.length/2, line.size).split("")
    ]);
    const total = packs.map(([arr1, arr2]) => convertToPoint(arr1.filter(val => arr2.includes(val)).pop()))
    .reduce((a, num) => a + num ,0);
    console.log(total);

}