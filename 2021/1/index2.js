const fs = require('fs');

const readData = (path, callback) => {
    fs.readFile(path, 'utf-8', (err, data) => {
        callback(data);
    });
}

const handleData = (data) => {
    const depthstxt = data.split('\n');
    const depths = depthstxt.map(v => +v);
    const windows = depths.reduce((a, v, i) => {
        a.push(+v);
        !!a[i -1] && (a[i-1] += +v);
        !!a[i -2] && (a[i-2] += +v);
        return a;
    }, []);

    const incDepths = windows.filter((v, i, arr) => i !== 0 && v > arr[i-1]);
    console.log(incDepths.length);
}

readData('./input.txt', handleData);