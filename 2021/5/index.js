const fs = require('fs');
const { checkServerIdentity } = require('tls');

const readData = (path, callback) => {
    fs.readFile(path, 'utf-8', (err, data) => {
        callback(data);
    });
}

const handleData = (data) => {
    const lines = data.split('\n');
    const pairs = lines.map(line => line.split(' -> ').map(pair => pair.split(',').map(n => +n)));

    const field = new Array(1000).fill(new Array(1000).fill(0));
    console.log(field);
    for (pair of pairs) {
        if (pair[0][0] === pair[1][0]) {
            // x same horizontal line
            const 
        } else if (pair[0][1] === pair[1][1]) {
            // y same vertical line
        }
    }
}

readData('./input.txt', handleData);