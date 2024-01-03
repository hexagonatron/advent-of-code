const fs = require('fs');

const readData = (path, callback) => {
    fs.readFile(path, 'utf-8', (err, data) => {
        callback(data);
    });
}

const handleData = (data) => {
    const depthstxt = data.split('\n');
    const depths = depthstxt.map(v => +v);
    console.log(depths[0], depths.pop());
    const incDepths = depths.filter((v, i, arr) => i !== 0 && v > arr[i-1]);
    console.log(incDepths.length);
}

readData('./input.txt', handleData);