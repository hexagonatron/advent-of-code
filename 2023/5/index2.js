const fs = require('fs');
const path = require('path');
const data = fs.readFile(path.resolve(__dirname, 'input.txt'), 'utf-8', (err, data) => {
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

const getRangesToCarryAndLeftOvers = ([
    destRangeStart,
    srcRangeStart,
    conversionRangeLength
], [
    testRangeStart,
    testRangeLength
]) => {
    const convRangeStart = srcRangeStart;
    const convRangeEnd = srcRangeStart + conversionRangeLength - 1;

    const testRangeEnd = testRangeStart + testRangeLength - 1;

    const fullyIn = () => {
        return testRangeStart >= convRangeStart && testRangeEnd <= convRangeEnd;
    }
    const endIn = () => {
        return testRangeEnd <= convRangeEnd && testRangeEnd >= convRangeStart;
    }
    const startIn = () => {
        return testRangeStart >= convRangeStart && testRangeStart <= convRangeEnd;
    }
    const fullyContain = () => {
        return convRangeStart >= testRangeStart && convRangeEnd <= testRangeEnd
    }

    // 5, 6, 7, 8
    //           6, 7, 8, 9, 10
    //        7, 8, 9, 10
    if (fullyIn()) {
        return [
            [
                testRangeStart - (srcRangeStart - destRangeStart),
                testRangeLength
            ],
            []
        ]
    } else if (fullyContain()) {
        return [
            [
                destRangeStart,
                conversionRangeLength
            ], [
                [
                    convRangeEnd + 1,
                    testRangeEnd - convRangeEnd
                ],
                [
                    testRangeStart,
                    srcRangeStart - testRangeStart
                ]
                // get start and end bit
            ]
        ]

    } else if (endIn()) {
        /**
         *  s              10, 11, 12, 12
         *  t       8,  9, 10, 11, 12
         */
        return [
            [
                destRangeStart,
                testRangeEnd - convRangeStart + 1
            ],
            [
                [
                    testRangeStart,
                    srcRangeStart - testRangeStart
                ]
                //get start bit
            ]
        ]
    } else if (startIn()) {
        /**
         * s 11, 12, 13
         * t 11, 12, 13, 14, 15, 16
         * d 17, 18, 19
         * 
         */
        return [
            [
                testRangeStart - (srcRangeStart - destRangeStart),
                convRangeEnd - testRangeStart + 1
            ],
            [
                [
                    convRangeEnd + 1,
                    testRangeEnd - convRangeEnd
                ]
                // get end bit
            ]
        ]
    }

    return [
        null,
        [
            [
                testRangeStart,
                testRangeLength
            ]
        ]
    ];


}

const handleData = (data) => {
    const [seedsStr, mapsStr] = data.split(/seed-to-soil map:/)
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

    const seedsRanges = seeds.reduce((acc, seed, i) => {
        if (i % 2 === 0) {
            acc.push([seed]);
        } else {
            acc[acc.length - 1].push(seed);
        }
        return acc
    }, []);
    const initialSeedCount = seedsRanges.reduce((total, r) => total + r[1], 0);
    const locations = maps.reduce((rangesToProcess, map, i) => {
        let convertedRanges = [];
        // Do stuff

        while (rangesToProcess.length > 0) {
            const operatingRange = rangesToProcess.pop();
            const workingOpRangeArr = [operatingRange];

            const unconvertedRanges = map.reduce((ranges, mapLine) => {
                let nextRanges = [];
                ranges.forEach(range => {
                    const [rangeToCarry, remainingRanges] = getRangesToCarryAndLeftOvers(mapLine, range);

                    if (rangeToCarry) {
                        convertedRanges.push(rangeToCarry);
                    }

                    nextRanges = [...nextRanges, ...remainingRanges];

                });
                return nextRanges;
            }, workingOpRangeArr)

            convertedRanges = [...convertedRanges, ...unconvertedRanges];

        }

        return convertedRanges;
    }, seedsRanges);


    const locationsSorted = locations.sort((a, b) => {
        return a[0] - b[0];
    })

    console.log(locations);

}