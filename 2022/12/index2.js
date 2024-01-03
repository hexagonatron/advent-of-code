const { verify } = require('crypto');
const fs = require('fs');
const path = require('path');
const absPath = path.join(__dirname, 'input.txt');
const data = fs.readFile(absPath, 'utf-8', (err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const resetOut = () => fs.writeFile('./output.txt', '', () => { });

const handleData = (data) => {
    resetOut();
    const array = data.split('\n').map(l => l.split(''));
    let start;
    const startPoints = [];
    for (let i = 0; i < array.length; i++) {
        if (array[i][0] === 'S'
            || array[i][0] === "a"
        ) {
            startPoints.push({ j: 0, i: i });
            // start = {i,j};
        }
    }
    // const aIslands = [];
    // const checkedIslands = array.map(l => l.map(_ => 0));

    // const notChecked = (i, j) => {
    //     return checkedIslands[i][j] === 0;
    // }

    // for (let i = 0; i < array.length; i++) {
    //     for (let j = 0; j < array[i].length; j++) {
    //         if (notChecked(i,j) && (array[i][j] === 'S' || array[i][j] === "a")) {
    //             const island = [];
    //             island.push({i,j});

    //         }
    //     }
    // }

    console.log(startPoints);

    const getEl = (point) => {
        return array[point.i][point.j];
    }

    const isStepDifOkay = (point, pointToMove) => {
        let currEl = getEl(point);
        let destEl = getEl(pointToMove);
        if (destEl === "E") destEl = "z";
        if (currEl === "E") currEl = "z";
        if (currEl === "S") currEl = "a";
        if (destEl === "S") destEl = "a";
        const elDiff = currEl.charCodeAt(0) - destEl.charCodeAt(0);
        // console.log({currEl, destEl, elDiff, point, pointToMove})
        return elDiff >= -1;
    }

    const getPointFrom = (dir, point) => {
        switch (dir) {
            case 'up':
                return array[point.i - 1][point.j]
            case 'down':
                return array[point.i + 1][point.j]
            case 'left':
                return array[point.i][point.j - 1]
            case 'right':
                return array[point.i][point.j + 1];
        }
    }

    const getPointFromAsCoord = (dir, point) => {
        switch (dir) {
            case 'up':
                return { i: point.i - 1, j: point.j };
            case 'down':
                return { i: point.i + 1, j: point.j };
            case 'left':
                return { i: point.i, j: point.j - 1 }
            case 'right':
                return { i: point.i, j: point.j + 1 };
        }
    }

    const canMove = (dir, point) => {
        let pointToMove;
        switch (dir) {
            case 'up':
                if (point.i === 0) return false;
                pointToMove = getPointFromAsCoord('up', point)
                break;
            case 'down':
                if (point.i === (array.length - 1)) return false;
                pointToMove = getPointFromAsCoord('down', point)
                break;
            case 'left':
                if (point.j === 0) return false;
                pointToMove = getPointFromAsCoord('left', point)
                break;
            case 'right':
                if (point.j === (array[point.i].length - 1)) return false;
                pointToMove = getPointFromAsCoord('right', point)
                break;
        }
        return isStepDifOkay(point, pointToMove);
    }

    const getAvailMoves = (point) => {
        const availMoves = [];

        //CheckUP
        if (canMove('up', point)) {
            availMoves.push(getPointFromAsCoord('up', point))
        }
        if (canMove('down', point)) {
            availMoves.push(getPointFromAsCoord('down', point))
        }
        if (canMove('left', point)) {
            availMoves.push(getPointFromAsCoord('left', point))
        }
        if (canMove('right', point)) {
            availMoves.push(getPointFromAsCoord('right', point))
        }
        return availMoves;
    }

    const renderTrip = (trip) => {
        return new Promise((res, rej) => {
            const tripstr = getTripStr(trip);
            // console.log(printable);
            // console.log();
            // fs.appendFile('./output.txt', printable +"\n\n", (err) =>{
            //     if (err) return rej(err);
            //     return res();
            // } )
            return res();
        });
    }
    const getTripStr = (trip) => {
        const board = array.map(l => l.map(p => p));
        trip.path.forEach(p => board[p.i][p.j] = board[p.i][p.j].toUpperCase());
        // board[trip.currPos.i][trip.currPos.j] = ".";
        const tripStr = board.map(l => l.join("")).join("\n");
        return tripStr;

    }


    const findEnd = (initial) => {
        const visitedArr = array.map(l => l.map(_ => 0));
        visitedArr[initial.currPos.i][initial.currPos.j] = 1;

        const visit = (trip, point) => {
            visitedArr[point.i][point.j] = 1;
            const newTrip = {
                path: [...trip.path, trip.currPos],
                currPos: point,
                moves: trip.moves + 1,
            }
            newTrip.tripStr = getTripStr(newTrip);
            // console.log({newTrip, trip});
            // renderTrip(newTrip);
            return newTrip;
        }

        const notVisited = (point) => {
            return visitedArr[point.i][point.j] === 0;
        }

        let trips = [initial];
        const iterate = () => {
            const newTrips = [];

            for (const trip of trips) {
                if (getEl(trip.currPos) === 'E') {
                    console.log("END");
                    console.log(trip.moves);
                    console.log(trip.tripStr);
                    return trip;
                }
                const availMoves = getAvailMoves(trip.currPos);
                // console.log(availMoves);
                if (availMoves.length === 0) {
                    // console.log("abandoning trip");
                    // console.log(trip);
                }
                for (point of availMoves) {
                    if (notVisited(point)) {
                        const newTrip = visit(trip, point);
                        newTrips.push(newTrip);
                        // console.log(newTrips)
                    } else {
                        // console.log("point visited");
                    }
                }
            }
            trips = newTrips;
            return false;
        }
        let foundEnd = false
        while (trips.length > 0) {
            if (trips[0].moves % 20 === 0) {
                console.log(trips[0].moves)
            }
            foundEnd = iterate();
            if (foundEnd) return foundEnd;
        }
        return false;
    }

    const shortestForStart = startPoints.map(p => findEnd({ currPos: p, path: [], moves: 0 }));
    const filtered = shortestForStart.filter(v => v);
    const sorted = filtered.sort((a, b) => a.moves - b.moves);
    console.log(sorted[0]);
}