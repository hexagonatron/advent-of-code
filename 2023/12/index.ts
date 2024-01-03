import * as fs from 'fs';
import * as path from 'path';

fs.readFile(path.resolve(__dirname, 'input.txt'), 'utf-8', (err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const getAllCombinations = <T>(array: T[], n: number): T[][] => {

    const recurse = (count: number, startIndex: number, partialComb: T[]): T[][] => {
        let total: T[][] = []
        if (count > n) {
            return [partialComb]
        }

        for (let i = startIndex; i < array.length; i++) {
            const res = recurse(count + 1, i + 1, [...partialComb, array[i]]);
            total = [...total, ...res];

        }
        return total;
    }

    return recurse(1, 0, []);
}

const getAllValidCombinations = (
    array: number[],
    n: number,
    springStr: string,
    workingGroups: number[],
    i: number
): number[][] => {
    const startTime = Date.now();

    const recurse = (count: number, startIndex: number, partialComb: number[]): number[][] => {

        // [0]
        const isPossible = (partial: number[], lastRun = false): boolean => {
            const copyArr = springStr.split('');
            partial.forEach(i => {
                copyArr[i] = '#';
            });
            for (let i = 0; i < partial[partial.length - 1]; i++) {
                if (copyArr[i] === '?') {
                    copyArr[i] = '.';
                }
            }
            if (lastRun) {
                for (let i = 0; i < copyArr.length; i++) {
                    if (copyArr[i] === '?') {
                        copyArr[i] = '.';
                    }
                }

            }

            // .##.?.#?
            // Qi = 4
            const lastQi = copyArr.findIndex(v => v === '?');
            let springsSoFar = copyArr.join('');

            if (lastQi !== -1) {
                const sliced = copyArr.join('').slice(0, lastQi);
                const lastDot = sliced.lastIndexOf('.');
                springsSoFar = '';
                if (lastDot !== -1) {
                    springsSoFar = sliced.slice(0, lastDot);
                }
            }

            const groups = springsSoFar.split(/\.+/g).filter(m => m != '').map(g => g.length);
            const isPossible = groups.every((g, i) => workingGroups[i] === g);

            return isPossible;
        }

        let total: number[][] = []
        if (count > n) {
            if (isPossible(partialComb, true)) {
                return [partialComb];
            }
            return [];
        }

        for (let i = startIndex; i < array.length; i++) {
            const updatedPartial = [...partialComb, array[i]];
            // [0]
            if (!isPossible(updatedPartial)) {
                continue;
            }

            const res = recurse(count + 1, i + 1, updatedPartial);
            total = [...total, ...res];

        }
        return total;
    }
    const ans = recurse(1, 0, []);
    const endTime = Date.now();
    const timeDiff = endTime - startTime;
    console.log({secsTaken: timeDiff / 1000});
    return ans;
}

const handleData = (data: string) => {
    const lines = data.split('\n').map((line, i) => {
        const [springStr, groupStr] = line.split(' ');
        const updatedSpringStr = new Array(5).fill(1).map(_ => springStr).join('?');
        const updatedGroupStr = new Array(5).fill(1).map(_ => groupStr).join(',');
        const brokenGroups = updatedGroupStr.split(',').map(g => +g);
        const brokenCount = [...updatedSpringStr.matchAll(/#/g)].length;
        // const workingCount = [...springStr.matchAll(/./g)].length;
        const unknownPositions = [...updatedSpringStr.matchAll(/\?/g)].map(match => match.index) as number[];
        const totalBroken = brokenGroups.reduce((acc, v) => acc + v, 0);
        const brokenRemaining = totalBroken - brokenCount;
        // console.log({
        //     updatedGroupStr,
        //     updatedSpringStr,
        //     brokenCount,
        //     brokenGroups,
        //     unknownPositions
        // });
        // const combinations = getAllCombinations(unknownPositions, brokenRemaining);
        const combinations = getAllValidCombinations(
            unknownPositions,
            brokenRemaining,
            updatedSpringStr,
            brokenGroups,
            i
        );
        // console.log({ combinations });
        // const validCombinations = combinations.filter((combination, i) => {
        //     // if (i > 5) return false;
        //     let copy = springStr.split('');
        //     combination.forEach(index => copy[index] = '#');
        //     copy = copy.map(c => c === '?' ? '.' : c);
        //     const substitutedStr = copy.join('');
        //     const runs = substitutedStr.split(/\.+/).filter(v => v !== '')
        //     const runLengths = runs.map(str => str.length);
        //     return runLengths.every((v, i) => brokenGroups[i] === v);
        // });
        // console.log({
        //     springStr,
        //     brokenGroups,
        //     totalBroken,
        //     brokenRemaining,
        //     unknownPositions,
        //     first5Combinations: combinations.slice(0, 5),
        //     first5Valid: validCombinations.slice(0, 5),
        // });
        console.log({i, updatedSpringStr,brokenGroups, combinationCount: combinations.length});
        return {
            updatedSpringStr,
            brokenGroups,
            combinationCount: combinations.length
        };
    });

    const total = lines.reduce((acc, line) => acc + line.combinationCount, 0)
    console.log({ total });

};