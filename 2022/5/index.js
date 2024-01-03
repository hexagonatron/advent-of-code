const fs = require('fs');
const data = fs.readFile('./input.txt', 'utf-8' ,(err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const parseStackText = (stackText) => {
    const charArr = stackText.split('\n').map(l => l.split(""));
    const piles = {}
    for (let i = 1; i <= 9; i++) {
        const labelRowIndex = charArr.length -1
        const labelRow = charArr[labelRowIndex];
        for (let j = 0; j <= labelRow.length; j++) {
            const pileLabel = +labelRow[j];
            if (!isNaN(pileLabel) && pileLabel === i) {
                piles[i] = [];
                for(let k = labelRowIndex -1; k >= 0; k--) {
                    const value = charArr[k][j];
                    if (value != " ") {
                        piles[i].push(value);
                    }
                }
            }
        }
    }
    console.log(piles);
    return piles;
}

const parseInstructions = (text) => {
    console.log("len:" + text.split('\n').length);
    const regex = /move (?<count>\d{1,2}) from (?<from>\d) to (?<to>\d)/gi
    return [...text.matchAll(regex)].map(({groups:{count, from, to}}) => ({count: +count, from: +from, to: +to}));
}

const handleData = (data) => {
    const [stackText, instructionText] = data.split('\n\n');

    const stacks = parseStackText(stackText);
    const instructions = parseInstructions(instructionText);
    console.log({instuctions: instructions.length});
    let count = 0;
    for (instruction of instructions) {
        const fromArr = stacks[instruction.from];
        const toMove = fromArr.splice(fromArr.length - instruction.count, fromArr.length);
        stacks[instruction.to] = [...stacks[instruction.to], ...toMove];
    }
    let onTop = "";
    for(let i = 1; i <= 9; i++) {
        onTop += stacks[i].pop()
    }
    console.log(onTop)
}