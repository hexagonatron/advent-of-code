import * as fs from 'fs';

export const readFile = (filePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve(data);
        });
    })
}

export const writeFile = (filePath: string, data: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, 'utf-8', (err) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve("Success");
        });
    })
}

export const splitToGrid = <T>(string: string, mapper: (i: number, j: number, value: string) => T): T[][] => {
    return string.split(/\r?\n/g).map((line, i) => line.split('').map((value, j) => mapper(i, j, value)));
}

export const sum = (arr: number[]): number => {
    return arr.reduce((acc, v) => acc + v, 0);
}

export const avg = (...numbers: number[]) => {
    return numbers.reduce((a, v) => a + v, 0) / numbers.length;
}

export const sumObjArr = <T>(objArr: T[], provider: (obj: T) => number) => {
    return sum(objArr.map(v => provider(v)))
}

export const transpose = <T>(array: T[][]): T[][] => {
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

export const transposeStringArr = (array: string[]) => {
    return transpose(array.map(r => r.split(''))).map(r => r.join(''));
}

export const iterateMultiDimensional = <T, U>(array: T[][], callback: (element: T, i: number, j: number) => U): U[][] => {
    const newArr: U[][] = [];
    for (let i = 0; i < array.length; i++) {
        newArr.push([]);
        for (let j = 0; j < array[i].length; j++) {
            newArr[i].push(callback(array[i][j], i, j));
        }
    }
    return newArr;
}

export const isInBounds = <T>(board: T[][], i: number, j: number): boolean => {
    return i >= 0 && j >= 0 && i < board.length && j < board[0].length;
}

export const isCoordinateInBounds = <T>(board: T[][], coordinate: Coordinate): boolean => {
    return isInBounds(board, coordinate.i, coordinate.j);
}

export const matchAll = (string: string, regex: RegExp) => {
    return [...string.matchAll(regex)];
}

export const arraysEqualByValue = <T>(arr1: T[], arr2: T[]): boolean => arr1.length === arr2.length && arr1.every((v, i) => v === arr2[i]);

export const replaceCharAt = (input: string, index: number, char: string) => {
    return input.substring(0, index) + char + input.substring(index + 1);
}

export const rotateMultiDimArrayClockwise = <T>(array: T[][]): T[][] => {
    const copy: T[][] = new Array(array[0].length).fill(1).map(_ => []);
    const rows = array.length;
    const maxRowIndex = rows - 1;
    iterateMultiDimensional(array, (element, i, j) => {
        copy[j][maxRowIndex - i] = element;
    });
    return copy;
};
export const rotateMultiDimArrayCounterClockwise = <T>(array: T[][]): T[][] => {
    const copy: T[][] = new Array(array[0].length).fill(1).map(_ => []);
    const cols = array[0].length;
    const maxColIndex = cols - 1;
    iterateMultiDimensional(array, (element, i, j) => {
        copy[maxColIndex - j][i] = element;
    });
    return copy;
};

export const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    })
}

export const invertCoord = (coord: { i: number, j: number }) => {
    return {
        i: coord.i * -1,
        j: coord.j * -1,
    };
}

export type Direction = "Up" | "Down" | "Left" | "Right";
export type DirectionDiag = Direction | "UpLeft" | "UpRight" | "DownLeft" | "DownRight";
export const ALL_DIRECTIONS: Direction[] = ["Up", "Down", "Left", "Right"];
export const ALL_DIRECTIONS_DIAG: DirectionDiag[] = [...ALL_DIRECTIONS, "UpLeft", "UpRight", "DownRight", "DownLeft"];

export const getNeighbour = (i: number, j: number, direction: DirectionDiag, magnitude = 1): { i: number, j: number } => {
    switch (direction) {
        case 'Up':
            return { i: i - magnitude, j };
        case 'Down':
            return { i: i + magnitude, j };
        case 'Left':
            return { i: i, j: j - magnitude };
        case 'Right':
            return { i: i, j: j + magnitude };
        case 'UpLeft':
            return { i: i - magnitude, j: j - magnitude };
        case 'UpRight':
            return { i: i - magnitude, j: j + magnitude };
        case 'DownLeft':
            return { i: i + magnitude, j: j - magnitude };
        case 'DownRight':
            return { i: i + magnitude, j: j + magnitude };
    }
}

export class Coordinate {
    i: number;
    j: number;

    constructor(i: number, j: number) {
        this.i = i;
        this.j = j;
    }

    public getAllNeighours() {
        return ALL_DIRECTIONS.map(d => this.getNeighbour(d));
    }

    public getNeighbour(direction: Direction): CoordinateDirection {
        return this.getCoordinateFromVector(direction, 1);
    }

    public getCoordinateFromVector(direction: Direction, magnitude: number) {
        switch (direction) {
            case 'Down':
                return new CoordinateDirection(this.i + magnitude, this.j, 'Down');
            case 'Up':
                return new CoordinateDirection(this.i - magnitude, this.j, 'Up');
            case 'Right':
                return new CoordinateDirection(this.i, this.j + magnitude, 'Right');
            case 'Left':
                return new CoordinateDirection(this.i, this.j - magnitude, 'Left');
        }
    };

    public getCoordinatesPassedThrough(direction: Direction, magnitude: number) {
        const coordinates: Coordinate[] = [];
        for (let i = 1; i <= magnitude; i++) {
            coordinates.push(this.getCoordinateFromVector(direction, i));
        }
        return coordinates;
    }

    public isEqual(other: Coordinate) {
        return this.i === other.i && this.j === other.j;
    }

    public copy() {
        return new Coordinate(this.i, this.j);
    }

    public hash() {
        return `${this.i},${this.j}`;
    }

    public getCoordinate() {
        return new Coordinate(this.i, this.j);
    }

    public getDifference(other: Coordinate): { i: number, j: number } {
        const i = this.i - other.i;
        const j = this.j - other.j;
        return { i, j };
    }

    public addCoordinate(mag: { i: number, j: number }): Coordinate {
        return new Coordinate(this.i + mag.i, this.j + mag.j);
    }
}

export class CoordinateDirection extends Coordinate {
    direction: Direction;

    constructor(i: number, j: number, direction: Direction) {
        super(i, j);
        this.direction = direction;
    }

    public copy() {
        return new CoordinateDirection(this.i, this.j, this.direction);
    }
}

const isNotAGrid = <T>(points: T[][]): boolean => {
    if (points.length === 0) {
        return true;
    }

    const firstLength = points[0].length
    if (firstLength === 0) {
        return true;
    }

    return !points.every(row => row.length === firstLength);
}

export class Grid<T extends Coordinate> {
    points: T[][];

    constructor(points: T[][]) {
        if (isNotAGrid(points)) {
            throw "Points don't adhere to grid";
        }
        this.points = points;
    }

    getByPoint(i: number, j: number): T {
        if (!this.isInGrid(i, j)) {
            throw 'Point not in grid';
        }
        return this.points[i][j];
    }

    getByCoordinate(coordinate: Coordinate) {
        return this.getByPoint(coordinate.i, coordinate.j);
    }

    isInGrid(i: number, j: number) {
        return isCoordinateInBounds(this.points, new Coordinate(i, j));
    }

    isCoordinateInGrid(coordinate: Coordinate) {
        return this.isInGrid(coordinate.i, coordinate.j);
    }

    map<U>(callback: (value: T, i: number, j: number) => U): U[][] {
        return iterateMultiDimensional<T, U>(this.points, callback);
    }

}