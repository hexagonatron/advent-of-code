const fs = require('fs');
const data = fs.readFile('./input.txt', 'utf-8' ,(err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const handleData = (data) => {
    const arr = data.split("");
    for(let i = 14; i <= arr.length; i++) {
        const chars = arr.slice(i - 14, i);
        const unique = [...new Set(chars)];
        if ([...new Set(chars)].length === 14) {
            console.log(chars);
            console.log(i);
            return;
        }
    }
}