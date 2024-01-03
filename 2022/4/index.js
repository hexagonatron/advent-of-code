const fs = require('fs');
const data = fs.readFile('./input.txt', 'utf-8' ,(err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const contains = ([g1f, g1t], [g2f, g2t]) => {
    return (g1f >= g2f && g1f <= g2t) 
    || (g1t >= g2f && g1t <= g2t) 
    || (g2f >= g1f && g2f <= g1t)
    || (g2t >= g1f && g2f <= g1t);
}

const handleData = (data) => {
    const lines = data.split('\n');
    const pairs = lines.map(p => {
        const groups = p.split(',');
        return groups.map(group => group.split('-').map(v => +v));
    });
    const overlaps = pairs.filter(([group1, group2]) => {
        return contains(group1, group2);
    });
    console.log(overlaps);
    console.log({overlaps: overlaps.length, starting: pairs.length});
}