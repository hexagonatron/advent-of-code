import * as fs from 'fs';
import * as path from 'path';

const data = fs.readFile(path.resolve(__dirname, 'input.txt'), 'utf-8', (err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const transpose = <T>(array: T[][]): T[][] => {
    const result: T[][] = [];
    for (let j = 0; j < array[0].length; j++) {
        result.push([]);
    }

    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
            result[j][i] = array[i][j];
        }
    }
    return result;
}

const expandBlanks = (rows: string[]) => {
    let result = rows.slice();
    for (let i = 0; i < result.length; i++) {
        if (!result[i].includes("#")) {
            result = [
                ...result.slice(0, i),
                result[i],
                result[i],
                ...result.slice(i + 1)
            ]
            i++;
        }
    }
    return result;
}

const iterateMultiDimensional = <T, U>(array: T[][], callback: (element: T, i: number, j: number) => U) => {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
            callback(array[i][j], i, j);
        }
    }
}

const handleData = (data: string) => {
    const original = data.split('\n');
    const expanded = expandBlanks(original);
    const transposed = transpose(expanded.map(row => row.split(''))).map(r => r.join(''));
    const transposedExpanded = expandBlanks(transposed);
    const originalExpanded2 = transpose(transposedExpanded.map(r => r.split(''))).map(r => r.join(''));
    // console.log('Original')
    // console.log(original.join('\n'));
    // console.log('Original Expanded')
    // console.log(expanded.join('\n'));
    // console.log('Transposed')
    // console.log(transposed.join('\n'));
    // console.log('Transposed Expanded')
    // console.log(transposedExpanded.join('\n'));
    // console.log('Original Expanded x2')
    // console.log(originalExpanded2.join('\n'));
    const expandedArray = originalExpanded2.map(r => r.split(''));
    const galaxies: { i: number, j: number }[] = [];
    iterateMultiDimensional(expandedArray, (element, i, j) => {
        if (element === "#") {
            galaxies.push({ i, j });
        }
    });
    // console.log(galaxies);
    // console.log(galaxies.length);
    const distances: number[] = [];
    for (let i = 0; i < galaxies.length -1; i++) {
        const galaxy1 = galaxies[i];
        for (let j = i +1; j < galaxies.length; j++) {
            const galaxy2 = galaxies[j];
            const iDist = Math.abs(galaxy2.i - galaxy1.i);
            const jDist = Math.abs(galaxy2.j - galaxy1.j);
            distances.push(iDist + jDist);
        }
    }
    // console.log(distances);
    const distSum = distances.reduce((total, dist) => dist + total,0);
    console.log({part1DistSum: distSum});


    // Part 2
    const nonExpandedArray = original.map(r => r.split(''));
    const transposedArray = transpose(nonExpandedArray);
    const emptyRows: number[] = nonExpandedArray.reduce((acc: number[], row, i) => row.every(v => v === '.') ? [...acc, i] : acc, [] );
    const emptyCols: number[] = transposedArray.reduce((acc: number[], row, i) => row.every(v => v === '.') ? [...acc, i] : acc, [] );
    console.log({emptyCols, emptyRows});

    const galaxies2: { i: number, j: number }[] = [];
    iterateMultiDimensional(nonExpandedArray, (element, i, j) => {
        if (element === "#") {
            galaxies2.push({ i, j });
        }
    });

    const distances2: number[] = [];

    const expansionFactor = 1_000_000;
    // const expansionFactor = 10;

    const findDist = (v1: number, v2: number, emptyIndexArray: number[]) => {
            const bigV = Math.max(v1, v2);
            const littleV = Math.min(v1, v2);
            let vDiff = bigV - littleV;
            emptyIndexArray.forEach(rowIndex => {
                if (rowIndex > littleV && rowIndex < bigV) {
                    vDiff += (expansionFactor -1);
                }
            });
            return vDiff;
    }


    for (let i = 0; i < galaxies2.length -1; i++) {
        const galaxy1 = galaxies2[i];
        for (let j = i +1; j < galaxies2.length; j++) {
            const galaxy2 = galaxies2[j];

            const iDiff = findDist(galaxy1.i, galaxy2.i, emptyRows);
            const jDiff = findDist(galaxy1.j, galaxy2.j, emptyCols);

            distances2.push(iDiff + jDiff);
        }
    }
    console.log(distances2);
    const distance2Sum = distances2.reduce((total, d) => total + d,0);

    console.log({part2DistSum: distance2Sum});



}