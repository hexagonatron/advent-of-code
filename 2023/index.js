const fs = require('fs');
const path = require('path');
const data = fs.readFile('./input.txt', 'utf-8', (err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const map = {
    'one': '1',
    'two': '2',
    'three': '3',
    'four': '4',
    'five': '5',
    'six': '6',
    'seven': '7',
    'eight': '8',
    'nine': '9',
}

const convert = (string) => {
    // console.log(string);
    if (string.length > 1) {
        return map[string];
    }
    return string;
}

const handleData = (data) => {
    const nums = data.split('\n').map(line => {
        const matchLazy = line.match(/^.*?(one|two|three|four|five|six|seven|eight|nine|\d)/);
        const matchGreedy = line.match(/^.*(one|two|three|four|five|six|seven|eight|nine|\d{1})/);
        // console.log({matchGreedy, matchLazy});
        // console.log(line);
        const lazyStr = convert(matchLazy[1]);
        const greedyStr = convert(matchGreedy[1]);
        console.log({lazyStr, greedyStr});
        return +(lazyStr + greedyStr);
    });

    // console.log(nums);

    const total = nums.reduce((a, num) => a+num,0);
    console.log(total);
}