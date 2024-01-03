const fs = require('fs');
const data = fs.readFile('./input.txt', 'utf-8' ,(err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const handleData = (data) => {
    const elvesTxt = data.split('\n\n');
    const elvesArr = elvesTxt.map(data => data.split('\n'));
    const totals = elvesArr.map(data => data.reduce((a, v) => a + +v ,0)).sort();
    console.log(totals.pop() + totals.pop() + totals.pop());
}