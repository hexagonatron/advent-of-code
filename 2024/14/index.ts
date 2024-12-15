import {
  Coordinate,
  Grid,
  readFile,
  writeFile
} from "../../utils/utils";
import path from "path";

class Robot extends Coordinate {
  iVelocity: number;
  jVelocity: number;
  originalI: number;
  originalJ: number;
  constructor(i: number, j: number, iVelocity: number, jVelocity: number) {
    super(i, j);
    this.iVelocity = iVelocity;
    this.jVelocity = jVelocity;
    this.originalI = i;
    this.originalJ = j;
  }

  getNewCoordinatesAtStep(step: number) {
    return new Coordinate(this.i + (step * this.iVelocity), this.j + (step * this.jVelocity));
  }

  updatePositionToStep(step: number) {
    const newPos = this.getNewCoordinatesAtStep(step);
    this.i = newPos.i;
    this.j = newPos.j;
  }

  reset() {
    this.i = this.originalI;
    this.j = this.originalJ;
  }
}

class RobotCoordinate extends Coordinate {
  robots: Robot[]
  constructor(i: number, j: number) {
    super(i, j);
    this.robots = [];
  }

  addRobot(robot: Robot) {
    this.robots.push(robot);
  }
}

class RobotBoard extends Grid<RobotCoordinate> {
  width: number;
  height: number;
  constructor(width: number, height: number) {
    const points = new Array(height).fill(true).map((_v, i) => new Array(width).fill(true).map((_v, j) => new RobotCoordinate(i, j)));
    super(points);
    this.width = width;
    this.height = height;
  }

  placeRobots(robots: Robot[]) {
    robots.forEach(robot => {
      const coordNormalised = this.normaliseCoordinate(robot);
      this.getByCoordinate(this.normaliseCoordinate(robot)).addRobot(robot);
    })
  }

  normaliseCoordinate(coordinate: Coordinate): Coordinate {
    const normalisedI = coordinate.i % this.height;
    const normalisedJ = coordinate.j % this.width;

    const absoluteI = normalisedI < 0 ? this.height + normalisedI : normalisedI;
    const absoluteJ = normalisedJ < 0 ? this.width + normalisedJ : normalisedJ;

    return new Coordinate(absoluteI, absoluteJ);
  }

  countByQuadrant() {
    let topLeft = 0;
    let topRight = 0;
    let bottomLeft = 0;
    let bottomRight = 0;

    const middleIdxI = Math.floor(this.height / 2);
    const middleIdxJ = Math.floor(this.width / 2);

    const isTopHalf = (i: number) => i < middleIdxI;
    const isBottomHalf = (i: number) => i > middleIdxI;
    const isLeftHalf = (j: number) => j < middleIdxJ;
    const isRightHalf = (j: number) => j > middleIdxJ;

    this.map((value, i, j) => {
      if (isTopHalf(i) && isLeftHalf(j)) {
        topLeft += value.robots.length;
      } else if (isTopHalf(i) && isRightHalf(j)) {
        topRight += value.robots.length;
      } else if (isBottomHalf(i) && isLeftHalf(j)) {
        bottomLeft += value.robots.length;
      } else if (isBottomHalf(i) && isRightHalf(j)) {
        bottomRight += value.robots.length;
      }
    });
    return {
      topLeft,
      topRight,
      bottomLeft,
      bottomRight
    }

  }

  toString(): string {
    const boradStr = this.map((v, i, j) => {
      if (v.robots.length === 0) {
        return '.'
      }
      return v.robots.length
    }).map(line => line.join('')).join('\n');
    return boradStr;
  }

  print() {
    console.log(this.toString());
    console.log('');
  }

  clear() {
    this.map((v) => v.robots = []);
  }

  multiplyQuadrantCounts() {
    const counts = this.countByQuadrant();

    return counts.topLeft * counts.topRight * counts.bottomLeft * counts.bottomRight;
  }

  hasBotLineOfLength(length: number) {
    const regexp = new RegExp('\\d'.repeat(length), 'g');
    const matches = [...this.toString().matchAll(regexp)];
    return matches.length > 0;
  }

}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const robots = dataStr.split('\r\n').map(line => [...line.matchAll(/p=(\d+),(\d+) v=(-?\d+),(-?\d+)/g)][0]).map(match => new Robot(+match[2], +match[1], +match[4], +match[3]));

  const boardP1: RobotBoard = new RobotBoard(101, 103);

  robots.forEach(robot => robot.updatePositionToStep(100));

  boardP1.placeRobots(robots);

  const quadProduct = boardP1.multiplyQuadrantCounts();
  // P1
  console.log({ quadProduct });

  robots.forEach(r => r.reset());

  const iterations = 10_000;
  for (let i = 1; i < iterations; i++) {

    const boardP2: RobotBoard = new RobotBoard(101, 103);
    robots.forEach(r => r.updatePositionToStep(1));
    boardP2.placeRobots(robots);
    if (boardP2.hasBotLineOfLength(30)) {
      console.log(`Iteration ${i}`);
      boardP2.print();
      await writeFile(path.resolve(__dirname, `./results/${i}.txt`), boardP2.toString());
    }
  }

};

main();
