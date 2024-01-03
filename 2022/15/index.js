const fs = require('fs');
const path = require('path');
const data = fs.readFile('./input.txt', 'utf-8', (err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const regex = /.*x=(-?\d+), y=(-?\d+).*x=(-?\d+), y=(-?\d+)/

const handleData = (text) => {
    const points = text.split('\n').map(r => {
        const match = r.match(regex);
        const res = [
            +match[1], 
            +match[2], 
            +match[3], 
            +match[4], 
        ];
        return res;
    });
    console.log(points);
    const board = new Array(4000000).fill(true).map(_ => new Array(4000000).fill("."));
    points.forEach(point => {
        const distancex = Math.abs(point[0] - point[2]);
        const distancey = Math.abs(point[1] - point[3]);
        const taxicabDist = distancex + distancey;
        console.log(taxicabDist);
    })

}
