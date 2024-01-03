import * as fs from 'fs';
import * as path from 'path';

fs.readFile(path.resolve(__dirname, 'input.txt'), 'utf-8', (err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const handleData = (data: string) => {

    const solutionMap: { [key: string]: number } = {

    }

    const placeSpring = (string: string, indexToReplace: number) => {
        return string.split('').map((c, i) => {
            if (i < indexToReplace && c === "?") {
                return '.';
            }
            if (i === indexToReplace) {
                return '#';
            }
            return c
        }).join('');
    }

    const findGroups = (string: string) => string.split(/\.+/g).filter(m => m != '').map(g => g.length);

    const sameValsSoFar = (groups: number[], requiredGroups: number[]) => groups.every((v, i) => v === requiredGroups[i]);
    const sameValsFinished = (groups: number[], requiredGroups: number[]) => sameValsSoFar(groups, requiredGroups) && groups.length === requiredGroups.length;

    // [2, 2]
    // ##.##
    // #.##?....
    const satisfiesGroups = (string: string, requiredGroups: number[]) => {
        const firstQ = string.indexOf('?');
        if (firstQ === -1) {
            const groups = findGroups(string);
            const satisfies = sameValsFinished(groups, requiredGroups);
            return satisfies;
        }

        const spliced = matchKnownBefore(string);
        const groups = findGroups(spliced);
        const satisfies = sameValsSoFar(groups, requiredGroups)
        return satisfies;
    }

    const countH = (string: string) => {
        return [...string.matchAll(/#/g)].length;
    }

    const sum = (arr: number[]): number => {
        return arr.reduce((acc, v) => acc + v, 0);
    }
    const sumObjArr = <T>(objArr: T[], provider: (obj: T) => number) => {
        return sum(objArr.map(v => provider(v)))
    }

    const allAccountedFor = (string: string, groups: number[]) => {
        const totalSprings = sum(groups);
        const hCount = countH(string);

        return totalSprings === hCount;
    }

    const replaceRemainingEmpty = (string: string) => {
        return string.replace(/\?/g, '.');
    }

    const getKey = (inputStr: string, groups: number[]) => {
        return inputStr + '-' + groups.join(',');
    }

    const matchKnownBefore = (string: string) => {
        const match = string.match(/(^([\.#])*\.(?=\?))|(^[\.#]+\.(?=#+\?))/g);
        if (!match) {
            return '';
        }
        return match[0];
    }

    const removeKnownFromStrAndGroups = (string: string, groups: number[]): { remainingStr: string, remainingGroups: number[] } => {
        const match = string.match(/(^([\.#])*\.(?=\?))|(^[\.#]+\.(?=#+\?))/g);
        if (!match) {
            return {
                remainingStr: string,
                remainingGroups: [...groups]
            }
        }

        const matchedStr = match[0] as string;
        const knownGroups = findGroups(matchedStr);
        const remainingGroups = groups.slice(knownGroups.length);
        const remainaingStr = string.replace(matchedStr, '');


        return {
            remainingStr: remainaingStr,
            remainingGroups: remainingGroups,
        };
    }


    const getCombinationCount = (inputStr: string, groups: number[]): number => {
        if (solutionMap[getKey(inputStr, groups)] !== undefined) {
            return solutionMap[getKey(inputStr, groups)];
        }

        if (allAccountedFor(inputStr, groups)) {
            const finalStr = replaceRemainingEmpty(inputStr);
            if (satisfiesGroups(finalStr, groups)) {
                solutionMap[getKey(inputStr, groups)] = 1;
                return 1;
            }
            solutionMap[getKey(inputStr, groups)] = 0;
            return 0;
        }

        let count = 0;
        const qPositions = [...inputStr.matchAll(/\?/g)].map(match => match.index) as number[];
        for (const qIndex of qPositions) {
            const replacedH = placeSpring(inputStr, qIndex);
            if (satisfiesGroups(replacedH, groups)) {
                const { remainingStr, remainingGroups } = removeKnownFromStrAndGroups(replacedH, groups);
                count += getCombinationCount(remainingStr, remainingGroups);
            }
        }
        solutionMap[getKey(inputStr, groups)] = count;
        return count;
    }


    const lines = data.split('\n').map((line, i) => {
        const [springStr, groupStr] = line.split(' ');

        const updatedSpringStr = new Array(5).fill(1).map(_ => springStr).join('?');
        const updatedGroupStr = new Array(5).fill(1).map(_ => groupStr).join(',');

        // const updatedSpringStr = springStr;
        // const updatedGroupStr = groupStr;

        const groups = updatedGroupStr.split(',').map(g => +g);
        const startT = Date.now();
        const combinationCount = getCombinationCount(updatedSpringStr, groups);
        const endT = Date.now();
        console.log({ i, combinationCount, time: (endT - startT) / 1000 });
        return {
            i,
            updatedGroupStr,
            groups,
            combinationCount
        };
    });

    const total = sumObjArr(lines, (l) => l.combinationCount);
    console.log({ total });

};