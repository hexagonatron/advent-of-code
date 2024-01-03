const fs = require('fs');

const readData = (path, callback) => {
    fs.readFile(path, 'utf-8', (err, data) => {
        callback(data);
    });
}

const handleData = (data) => {
    const rows = data.split('\n');
    const rowCols = rows.map(v => v.split(''));
    let res = 0b0;
    let comp = 0b0;
    for (let j = 0; j < rowCols[0].length; j++) {
        let ones = 0;
        let zeros = 0;
        res <<= 1;
        comp <<= 1;
        for(let i = 0; i < rowCols.length; i++) {
            rowCols[i][j] === '1' 
                ? ones++
                : zeros++;
        }
        if (ones > zeros) res++;
        if (zeros > ones) comp++;
        console.log(res.toString(2));
        console.log(comp.toString(2));
    }
    console.log(comp * res);
}

readData('./input.txt', handleData);