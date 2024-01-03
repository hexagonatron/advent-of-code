const fs = require('fs');

const readData = (path, callback) => {
    fs.readFile(path, 'utf-8', (err, data) => {
        callback(data);
    });
}

const handleData = (data) => {
    let d = 0;
    let p = 0;
    let aim = 0;
    const commands = data.split('\n');
    for (command of commands) {
        const [dir, magtxt] = command.split(' ');
        const magNum = +magtxt;
        if (dir === "up") {
            aim -= magNum;
        }
        if (dir === "down"){ 
            aim += magNum;
        }
        if (dir === "forward"){
            p += magNum;
            d += (aim * magNum);
        } 
    console.log({p, d, aim, prod: p*d});
    }
    console.log({p, d, aim, prod: p*d});

}

readData('./input.txt', handleData);