const fs = require('fs');
const data = fs.readFile('./input.txt', 'utf-8', (err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const inRange = (toTest, rangeStart, rangeLength) => {
    const lastInRange = rangeStart + rangeLength - 1;
    return toTest >= rangeStart && toTest <= lastInRange
}

const convertToDest = (toTest, srcRangeStart, destRangeStart) => {
    const diff = toTest - srcRangeStart;
    return destRangeStart + diff;
}

const handleData = (data) => {

    const [seedsStr, mapsStr] = data.split(/seed-to-soil map:/)
    console.log({ seedsStr, mapsStr });
    const seeds = [...seedsStr.matchAll(/\s(\d+)/g)].map(match => +match[1]);

    const maps = mapsStr.split(/^.*map:\n/gm)
        .map(mapStr =>
            mapStr
                .split('\n')
                .filter(line => line !== '')
                .map(line =>
                    [...line.matchAll(/(\d+)/g)]
                        .map(match => +match[1])
                )
        );

    // Part 2
    const seeds2 = seeds.reduce((acc, seed, i) => {
        if (i % 2 === 0) {
            acc.push([seed]);
        } else {
            acc[acc.length - 1].push(seed);
        }
        return acc
    }, []);
    console.log(seeds2);

    const seedMin = Math.min(...seeds2.map(([min, range]) => min));
    const seedMax = Math.max(...seeds2.map(([min, range]) => min + range -1));

    const finalVals = seeds3.map(seed => {
        const finalVal = maps.reduce((toConvert, map) => {
            for (const [destRangeStart, srcRangeStart, rangeLength] of map) {
                if (inRange(toConvert, srcRangeStart, rangeLength)) {
                    // console.log({
                    //     toConvert,
                    //     srcRangeStart,
                    //     destRangeStart,
                    //     rangeLength,
                    //     msg: 'Found in range!'
                    // })
                    return convertToDest(
                        toConvert,
                        srcRangeStart,
                        destRangeStart,
                    )
                }
            }
            // console.log({
            //     msg: 'Not found in any range',
            //     toConvert,
            //     map,
            // });
            return toConvert
        }, seed)
        return finalVal;
    });

    // console.log(finalVals);

    const lowestNum = Math.min(...finalVals);
    console.log(lowestNum);
}