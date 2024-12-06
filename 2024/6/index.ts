import { dir } from "console";
import {
  Coordinate,
  Direction,
  getNeighbour,
  iterateMultiDimensional,
  readFile,
} from "../../utils/utils";
import path from "path";

type BoardSpot = "." | "#"

class Point extends Coordinate {
  value: BoardSpot;
  visited: boolean;
  visitedFromDirection: Direction[];

  constructor(value: BoardSpot, i: number, j: number, visited: boolean, directions: Direction[]) {
    super(i, j);
    this.value = value;
    this.visited = visited;
    this.visitedFromDirection = [...directions];
  }

  public copy(): Point {
    return new Point(this.value, this.i, this.j, this.visited, [...this.visitedFromDirection]);
  }
}

class Cursor {
  i: number;
  j: number;
  facing: Direction;
  constructor(i: number, j: number) {
    this.i = i;
    this.j = j;
    this.facing = 'Up';
  }

  move(board: Board) {
    const facingCoord = getNeighbour(this.i, this.j, this.facing);

    if (board.canMove(facingCoord)) {
      this.enter(facingCoord, board, this.facing);
      return;
    }

    this.turnRight();
  }

  moveIfNotAlreadyVisited(board: Board) {
    const facingCoord = getNeighbour(this.i, this.j, this.facing);

    if (board.canMove(facingCoord)) {
      const alreadyVisited = this.enter(facingCoord, board, this.facing);
      if (alreadyVisited) {
        return true;
      }
      return false
    }

    this.turnRight();

  }

  enter({ i, j }: { i: number, j: number }, board: Board, direction: Direction): boolean {
    this.updatePosition({ i, j });
    if (board.isInRange({ i, j })) {
      board.board[i][j].visited = true;
      if (board.board[i][j].visitedFromDirection.includes(direction)) {
        return true
      }
      board.board[i][j].visitedFromDirection.push(direction);
    }
    return false;
  }

  updatePosition({ i, j }: { i: number, j: number }) {
    this.i = i;
    this.j = j;
  }

  turnRight() {
    const order: Direction[] = ['Up', 'Right', "Down", "Left"];
    const currentIdx = order.findIndex(v => v === this.facing);
    if (currentIdx === -1) {
      throw "Direction not found";
    }
    const newFacingDirection = order[(currentIdx + 1) % 4]
    if (!newFacingDirection) {
      throw "Invalid new facing direction";
    }
    this.facing = newFacingDirection;
  }

  copy(): Cursor {
    return new Cursor(this.i, this.j);
  }

}

class Board {
  board: Point[][];

  constructor(board: Point[][]) {
    this.board = board;
  }
  isInRange(coordinate: { i: number, j: number }) {
    return coordinate.i >= 0 && coordinate.i < this.board.length && coordinate.j >= 0 && coordinate.j < this.board[0].length;
  }
  canMove({ i, j }: { i: number, j: number }): boolean {
    if (!this.isInRange({ i, j })) {
      return true;
    }

    const point = this.board[i][j];

    if (point.value === ".") {
      return true;
    }

    return false;
  }

  printVisited() {
    let count = 0;
    iterateMultiDimensional(this.board, (point) => {
      if (point.visited) {
        count++;
      }
    });
    console.log("Visited: " + count);
  }

  copy(): Board {
    const pointCopies = this.board.map(line => line.map(point => point.copy()));
    return new Board(pointCopies);
  }

}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  let cursor: Cursor = new Cursor(0, 0);

  const board: Board = new Board(dataStr.split('\n').map((line, i) => line.split('').map((char, j) => {
    if (char === "^") {
      cursor = new Cursor(i, j);
      return new Point(".", i, j, true, ["Up"]);
    }
    if (char === ".") {
      return new Point(".", i, j, false, []);
    }
    return new Point("#", i, j, false, []);
  })));

  console.log(cursor);

  // Part 1
  // while (board.isInRange({i: cursor.i, j: cursor.j})) {
  //   cursor.move(board);
  // }
  // board.printVisited();

  // Part 2
  let loopCount = 0;
  iterateMultiDimensional(board.board, (point, i, j) => {
    const boardCopy = board.copy();
    const cursorCopy = cursor.copy();

    // Can't place at starting pos or where there is already a #
    if (point.value === "#" || (i === cursorCopy.i && j === cursorCopy.j)) {
      return;
    }

    boardCopy.board[i][j].value = "#";
    while (boardCopy.isInRange({ i: cursorCopy.i, j: cursorCopy.j })) {
      const causesLoop = cursorCopy.moveIfNotAlreadyVisited(boardCopy);
      if (causesLoop) {
        loopCount++;
        break;
      }
    }

  })
  console.log("Loop causes: " + loopCount);
};

main();
