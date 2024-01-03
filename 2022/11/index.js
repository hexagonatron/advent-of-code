const { verify } = require('crypto');
const fs = require('fs');
const path = require('path');
const data = fs.readFile('./input.txt', 'utf-8', (err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const doOperation = (item, op) => {
    let operator;
    if (op[1] === "old") {
        if (op[0] === "+") {
            return item.val + item.val;
        } else {
            return item.val * item.val;
        }
    }
    if (op[0] === "+") {
        return item.val + op[1];
    } else {
        return item.val * op[1];
    }
}

const substr = 84
const isInPattern = (item) => {
    if (item.path.length < substr) return false;
    const last50 = item.path.substring(item.path.length - substr/2, item.path.length);
    const firstBit = item.path.substring(0, item.path.length - substr);

    const ans = firstBit.indexOf(last50);
    // console.log({full: item.path, last50, firstBit, ans });
    return ans !== -1

}

const calcNext = (item) => {
    const last50 = item.path.substring(item.path.length - substr/2, item.path.length);
    const firstBit = item.path.substring(0, item.path.length - substr/2);
    const index = firstBit.indexOf(last50);
    const nextM = +item.path[index + substr/2];
    console.log({path: item.path, last50, firstBit, firstBit, index, nextM });
    // process.exit();
    return nextM;
}

const handleData = (data) => {
    const monkeys = data.split('\n\n').map((m, i) => {
        const startingReg = /Starting items: (.*)$/m
        const startingI = m.match(startingReg)[1].split(', ').map(n => +n);
        const startingItems = startingI.map((m, j) => ({ val: BigInt(m), id: i + ',' + j, path: `${i}` }));
        const opReg = /Operation: new = old ([\+\*]) (\d+|old)/m
        const op = m.match(opReg);
        const test = m.match(/divisible by (\d+)/);
        const ifTrue = m.match(/If true: throw to monkey (\d)/)
        const ifFalse = m.match(/If false: throw to monkey (\d)/)
        return {
            items: startingItems,
            op: [op[1], op[2] === "old" ? "old" : BigInt(+op[2])],
            test: BigInt(+test[1]),
            ifTrue: +ifTrue[1],
            ifFalse: +ifFalse[1],
            inspectCount: 0,
        }
    });
    const rounds = 10_000;
    console.log(monkeys);
    const testN = monkeys.map(m => m.test).reduce((a, v) => a*v,1n);
    for (let i = 1; i <= rounds; i++) {
        for (let j = 0; j < monkeys.length; j++) {
            const monkey = monkeys[j];
            while (monkey.items.length > 0) {
                monkey.inspectCount++;
                let item = monkey.items.shift();

                if (false) {
                    const next = calcNext(item);
                    console.log({path: item.path, i, j, next });
                    monkeys[next].items.push(item);
                } else {

                    let newitem = { val: doOperation(item, monkey.op), path: item.path, id: item.id };
                    newitem.val = newitem.val%testN
                    const test = newitem.val%monkey.test;
                    if (test === 0n) {
                        monkeys[monkey.ifTrue].items.push(newitem);
                    } else {
                        monkeys[monkey.ifFalse].items.push(newitem);
                    }
                }
            }
        }
        if (i % 50 === 0) {
            console.log(i);
        }
    }
    const monkeycounts = monkeys.map((m, i) => ({ monkey: i, count: m.inspectCount })).sort((a,b) => b.count - a.count);
    console.log(monkeycounts);
    console.log(monkeycounts[0].count * monkeycounts[1].count);
    // console.log(monkeycounts);
    // console.log(monkeycountsN);
}