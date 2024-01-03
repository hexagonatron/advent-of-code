const fs = require('fs');

const readData = (path, callback) => {
    fs.readFile(path, 'utf-8', (err, data) => {
        callback(data);
    });
}

const handleData = (data) => {
    let d = 0;
    let p = 0;
    const commands = data.split('\n');
    for (command of commands) {
        const [dir, magtxt] = command.split(' ');
        const magNum = +magtxt;
        if (dir === "up") d -= magNum;
        if (dir === "down") d += magNum;
        if (dir === "forward") p += magNum;
    }
    console.log({p, d, prod: p*d});

}

readData('./input.txt', handleData);