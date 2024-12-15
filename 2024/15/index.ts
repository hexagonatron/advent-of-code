import { appendFileSync } from "fs";
import {
  Coordinate,
  Direction,
  Grid,
  readFile,
  splitToGrid,
  writeFile,
} from "../../utils/utils";
import path from "path";

type InputString = '#' | '@' | '.' | 'O' | '[' | ']';

const isSubValue = (value: string): value is InputString => {
  return value === '#' || value === '@' || value === '.' || value === 'O' || value === '[' || value === ']';
}

class SubCoordinate extends Coordinate {
  value: InputString;

  constructor(value: InputString, i: number, j: number) {
    super(i, j);
    this.value = value;
  }

  isSub() {
    return this.value === '@';
  }
  isWall() {
    return this.value === '#';
  }
  isFree() {
    return this.value === '.';
  }
  isBox() {
    return this.value === 'O' || this.value === '[' || this.value === ']';
  }
  isWideBox() {
    return this.isLeftBox() || this.isRightBox();
  }
  isLeftBox() {
    return this.value === '[';
  }
  isRightBox() {
    return this.value === ']';
  }
  getGPS() {
    if (!this.isBox()) {
      throw "Can't get GPS of non-box";
    }
    if (this.isRightBox()) {
      return 0;
    }
    return this.i * 100 + this.j;
  }
  getOtherBoxCoord(): Coordinate {
    if (this.value === '[') {
      return this.getNeighbour('Right');
    }
    if (this.value === ']') {
      return this.getNeighbour('Left');
    }
    throw 'Not a wide box';

  }

}


class SubBoard extends Grid<SubCoordinate> {
  movedThisIteratino: string[];

  constructor(points: SubCoordinate[][]) {
    super(points);
    this.movedThisIteratino = [];
  }

  toString() {
    return this.points.map(line => line.map(v => v.value).join('')).join('\n');
  }

  print() {
    const str = this.toString();
    console.log(str);
    console.log('');
  }

  moveSub(direction: Direction, iteration = 0) {
    const currentSub = this.getSub();

    const proposedMoveCoord = currentSub.getNeighbour(direction);

    const cell = this.getByCoordinate(proposedMoveCoord);

    if (cell.isWall()) {
      return;
    }
    if (cell.isFree()) {
      cell.value = '@';
      currentSub.value = '.';
      return;
    }
    if (cell.isBox()) {
      if (cell.isWideBox()) {
        return this.moveWideBox(cell, direction, currentSub, iteration);
      }
      const nextFreeSpace: SubCoordinate | null = this.findNextFreeSpaceInDirection(cell, direction);
      if (nextFreeSpace === null) {
        return;
      }

      nextFreeSpace.value = 'O';
      cell.value = '@';
      currentSub.value = '.';
    }
  }

  moveWideBox(cell: SubCoordinate, direction: Direction, currentSub: SubCoordinate, iteration: number) {
    if (direction === 'Left' || direction === 'Right') {
      const nextFreeSpace = this.findNextFreeSpaceInDirection(cell, direction);

      if (nextFreeSpace === null) {
        return;
      }
      let tempVal: InputString = cell.value;
      cell.value = '@';
      currentSub.value = '.'
      let neighbour = cell.getNeighbour(direction);
      while (!neighbour.isEqual(nextFreeSpace.getNeighbour(direction))) {
        const loopCell = this.getByCoordinate(neighbour)
        const loopTemp = loopCell.value;
        loopCell.value = tempVal;
        tempVal = loopTemp;
        neighbour = loopCell.getNeighbour(direction);
      }

    } else {
      const otherBoxCoord = cell.getOtherBoxCoord();

      if (this.wideBoxCanMove(cell, otherBoxCoord, direction)) {
        currentSub.value = '.';
        const temp1 = cell.value;
        const otherCell = this.getByCoordinate(otherBoxCoord)
        const temp2 = otherCell.value
        cell.value = '@'
        otherCell.value = '.';

        this.executeMoveWideBox(cell, temp1, otherBoxCoord, temp2, direction, iteration);
      }
      this.movedThisIteratino = [];
    }
  }


  executeMoveWideBox(boxCell: Coordinate, newBoxVal: InputString, otherBoxCell: Coordinate, otherBoxVal: InputString, direction: Direction, iteration: number) {

    const neighbour1 = this.getByCoordinate(boxCell.getNeighbour(direction));
    const neighbour2 = this.getByCoordinate(otherBoxCell.getNeighbour(direction));


    if (this.movedThisIteratino.includes(neighbour1.hash()) && this.movedThisIteratino.includes(neighbour2.hash())) {
      return;
    }

    if (neighbour1.isFree() && neighbour2.isFree()) {
      neighbour1.value = newBoxVal;
      neighbour2.value = otherBoxVal;
      this.movedThisIteratino.push(neighbour1.hash())
      this.movedThisIteratino.push(neighbour2.hash())
      return;
    }
    if (neighbour1.isFree() && neighbour2.isWideBox()) {
      neighbour1.value = newBoxVal;
      const neighbour2OtherBox = this.getByCoordinate(neighbour2.getOtherBoxCoord());
      const temp1 = neighbour2.value;
      neighbour2.value = otherBoxVal;
      const temp2 = neighbour2OtherBox.value
      neighbour2OtherBox.value = '.';
      this.movedThisIteratino.push(neighbour1.hash())
      this.movedThisIteratino.push(neighbour2.hash())
      this.executeMoveWideBox(neighbour2, temp1, neighbour2OtherBox, temp2, direction, iteration);
      return;
    }
    if (neighbour1.isWideBox() && neighbour2.isFree()) {
      neighbour2.value = otherBoxVal;
      const neighbour1OtherBox = this.getByCoordinate(neighbour1.getOtherBoxCoord());
      const temp1 = neighbour1.value;
      neighbour1.value = newBoxVal;
      const temp2 = neighbour1OtherBox.value;
      neighbour1OtherBox.value = '.';
      this.movedThisIteratino.push(neighbour1.hash())
      this.movedThisIteratino.push(neighbour2.hash())
      this.executeMoveWideBox(neighbour1, temp1, neighbour1OtherBox, temp2, direction, iteration);
      return;
    }
    if (neighbour1.isWideBox() && neighbour2.isWideBox()) {
      if (this.isPair(neighbour1, neighbour2)) {
        const temp1Pair = neighbour1.value;
        const temp2Pair = neighbour2.value;
        neighbour1.value = newBoxVal;
        neighbour2.value = otherBoxVal;
        this.executeMoveWideBox(neighbour1, temp1Pair, neighbour2, temp2Pair, direction, iteration);
        return;
      }
      const neighbour1OtherBox = this.getByCoordinate(neighbour1.getOtherBoxCoord());
      const neighbour2OtherBox = this.getByCoordinate(neighbour2.getOtherBoxCoord());
      const temp1 = neighbour1.value;
      neighbour1.value = newBoxVal;
      const temp2 = neighbour2.value;
      neighbour2.value = otherBoxVal;
      const temp12 = neighbour1OtherBox.value;
      const temp22 = neighbour2OtherBox.value;
      neighbour1OtherBox.value = '.';
      neighbour2OtherBox.value = '.';
      this.movedThisIteratino.push(neighbour1.hash())
      this.movedThisIteratino.push(neighbour2.hash())
      this.executeMoveWideBox(neighbour1, temp1, neighbour1OtherBox, temp12, direction, iteration);
      this.executeMoveWideBox(neighbour2, temp2, neighbour2OtherBox, temp22, direction, iteration);
      return;
    }
    throw `Unhandled case ${neighbour1.value}-${neighbour2.value}`;


  }

  isPair(cell1: SubCoordinate, cell2: SubCoordinate): boolean {
    return cell1.getOtherBoxCoord().isEqual(cell2);
  }

  wideBoxCanMove(coord1: Coordinate, coord2: Coordinate, direction: Direction): boolean {
    const neighbour1 = this.getByCoordinate(coord1.getNeighbour(direction));
    const neighbour2 = this.getByCoordinate(coord2.getNeighbour(direction));

    if (neighbour1.isWall() || neighbour2.isWall()) {
      return false;
    }

    if (neighbour1.isFree() && neighbour2.isFree()) {
      return true;
    }
    if (neighbour1.isFree() && neighbour2.isWideBox()) {
      return this.wideBoxCanMove(neighbour2, neighbour2.getOtherBoxCoord(), direction);
    }
    if (neighbour1.isWideBox() && neighbour2.isFree()) {
      return this.wideBoxCanMove(neighbour1, neighbour1.getOtherBoxCoord(), direction);
    }
    if (neighbour1.isWideBox() && neighbour2.isWideBox()) {
      return this.wideBoxCanMove(neighbour1, neighbour1.getOtherBoxCoord(), direction) && this.wideBoxCanMove(neighbour2, neighbour2.getOtherBoxCoord(), direction);
    }
    console.log({ n1: neighbour1.hash(), n2: neighbour2.hash(), c1: coord1.hash(), c2: coord2.hash(), direction });
    this.print();
    throw `Unhandled case: ${neighbour1.value}, ${neighbour2.value}`;
  }

  findNextFreeSpaceInDirection(coordinate: Coordinate, direction: Direction): SubCoordinate | null {
    const neighbour = this.getByCoordinate(coordinate.getNeighbour(direction));
    if (neighbour.isFree()) {
      return neighbour;
    }
    if (neighbour.isBox()) {
      return this.findNextFreeSpaceInDirection(neighbour, direction);
    }
    // Neighbour is a wall
    return null;
  }

  getSub(): SubCoordinate {
    let sub: SubCoordinate | null = null;
    this.map(v => {
      if (v.isSub()) {
        sub = v;
      }
    });

    if (sub === null) {
      throw "Sub not found";
    }
    return sub;
  }

  getAllBoxGPSTotal() {
    let total = 0;
    this.map(v => {
      if (v.isBox() || v.isLeftBox()) {
        total += v.getGPS()
      }
    });
    return total;
  }
}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const [grid, instructions] = dataStr.split('\r\n\r\n');

  const points: SubCoordinate[][] = splitToGrid(grid, (i, j, value) => {
    if (!isSubValue(value)) {
      throw `Unexpected Input: ${value}`
    }
    return new SubCoordinate(value, i, j);
  });

  const board: SubBoard = new SubBoard(points);

  const directionInstructions: Direction[] = instructions.split('\r\n').join('').split('').map(ins => {
    if (ins === '<') {
      return 'Left'
    } else if (ins === '>') {
      return 'Right'
    } else if (ins === '^') {
      return 'Up'
    } else if (ins === 'v') {
      return 'Down'
    }
    throw `Not a valid direction: ${ins}`
  });

  directionInstructions.forEach(d => {
    board.moveSub(d);
  });
  board.print();
  const totalP1 = board.getAllBoxGPSTotal();

  const pointsP2 = grid.split('\r\n').map((line, i) => line.split('').map(v => {
    if (v === '@') {
      return '@.';
    }
    if (v === '.') {
      return '..';
    }
    if (v === '#') {
      return '##'
    }
    if (v === 'O') {
      return '[]';
    }
  }).join('').split('').map((v, j) => {
    if (!isSubValue(v)) {
      throw "Invalid Input";
    }
    return new SubCoordinate(v, i, j);
  }));

  const boardP2 = new SubBoard(pointsP2);
  boardP2.print();
  directionInstructions.forEach(async (d, i) => {
    boardP2.moveSub(d, i);
    // const str = d + ' ' + i + '\n' + boardP2.toString() + '\n\n';
    // await appendFileSync('./results/path.txt', str);
  });
  boardP2.print();
  const totalP2 = boardP2.getAllBoxGPSTotal();
  console.log({ totalP1, totalP2 });

};

main();
