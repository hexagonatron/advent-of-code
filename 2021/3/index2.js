const fs = require('fs');

const readData = (path, callback) => {
    fs.readFile(path, 'utf-8', (err, data) => {
        callback(data);
    });
}

const recurse = (arr, pos, ox) => {
    if (arr.length <= 1) return arr.pop();

    const counts = arr.reduce((a, v) => {
        v[pos] ? a[1]++ : a[0]++;
        return a;
    }, [0, 0]);
    console.log({counts, arrL: arr.length});
    const mostCommon = counts[0] > counts[1] ? 0 : 1;
    const leastCommon = counts[1] >= counts[0] ? 0 : 1;
    console.log({counts, mostCommon, leastCommon ,arrL: arr.length});

    const bitToRemove = ox ? mostCommon : leastCommon;

    const filtered = arr.filter(v => v[pos] != bitToRemove);

    return recurse(filtered, (pos + 1)%arr[0].length , ox );

}

const handleData = (data) => {
    const rows = data.split('\n');
    const rowCols = rows.map(v => v.split('').map(v => +v));

    const ox = parseInt(recurse(rowCols, 0, true).join(''), 2);
    const co2 = parseInt(recurse(rowCols, 0, false).join(''), 2);
    console.log({ox, co2, prod: ox*co2});

}

readData('./input.txt', handleData);