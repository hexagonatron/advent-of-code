import { iterateMultiDimensional, readFile, sleep } from "../../utils/utils";
import path from "path";

type Direction = "Up" | "Down" | "Left" | "Right";
type Tile = "." | "/" | "\\" | "|" | "-";
type Coordinate = { i: number; j: number };
type CoordinateDirection = Coordinate & { direction: Direction };

class Cell {
  coordinate: Coordinate;
  tile: Tile;
  visited: boolean;
  directions: Direction[];

  constructor(i: number, j: number, tile: string) {
    this.coordinate = { i: i, j: j };
    this.tile = tile as Tile;
    this.visited = false;
    this.directions = [];
  }

  public visit(travelDirection: Direction): CoordinateDirection[] {
    this.visited = true;
    switch (this.tile) {
      case ".":
        return [...this.nextCoordinate(travelDirection)];
      case "-":
        return [...this.handleDash(travelDirection)];
      case "|":
        return [...this.handlePipe(travelDirection)];
      case "\\":
        return [...this.handleBackSlash(travelDirection)];
      case "/":
        return [...this.handleForwardSlash(travelDirection)];
    }
  }

  private handleDash(travelDirection: Direction): CoordinateDirection[] {
    switch (travelDirection) {
      case "Down":
      case "Up":
        return [
          ...this.nextCoordinate("Left"),
          ...this.nextCoordinate("Right"),
        ];
      case "Left":
        return [...this.nextCoordinate("Left")];
      case "Right":
        return [...this.nextCoordinate("Right")];
    }
  }

  private handlePipe(travelDirection: Direction): CoordinateDirection[] {
    switch (travelDirection) {
      case "Left":
      case "Right":
        return [...this.nextCoordinate("Up"), ...this.nextCoordinate("Down")];
      case "Up":
        return [...this.nextCoordinate("Up")];
      case "Down":
        return [...this.nextCoordinate("Down")];
    }
  }

  private handleBackSlash(travelDirection: Direction): CoordinateDirection[] {
    switch (travelDirection) {
      case "Left":
        return this.nextCoordinate("Up");
      case "Right":
        return this.nextCoordinate("Down");
      case "Up":
        return this.nextCoordinate("Left");
      case "Down":
        return this.nextCoordinate("Right");
    }
  }

  private handleForwardSlash(
    travelDirection: Direction
  ): CoordinateDirection[] {
    switch (travelDirection) {
      case "Left":
        return this.nextCoordinate("Down");
      case "Right":
        return this.nextCoordinate("Up");
      case "Up":
        return this.nextCoordinate("Right");
      case "Down":
        return this.nextCoordinate("Left");
    }
  }

  private nextCoordinate(direction: Direction): CoordinateDirection[] {
    if (this.directions.includes(direction)) {
      return [];
    }
    switch (direction) {
      case "Down":
        this.directions.push("Down");
        return [
          { i: this.coordinate.i + 1, j: this.coordinate.j, direction: "Down" },
        ];
      case "Left":
        this.directions.push("Left");
        return [
          { i: this.coordinate.i, j: this.coordinate.j - 1, direction: "Left" },
        ];
      case "Right":
        this.directions.push("Right");
        return [
          {
            i: this.coordinate.i,
            j: this.coordinate.j + 1,
            direction: "Right",
          },
        ];
      case "Up":
        this.directions.push("Up");
        return [
          { i: this.coordinate.i - 1, j: this.coordinate.j, direction: "Up" },
        ];
    }
  }

  public reset() {
    this.visited = false;
    this.directions = [];
  }
}

class Board {
  board: Cell[][];

  constructor(board: Cell[][]) {
    this.board = board;
  }

  // Part 1
  public async startMoving() {
    const total = await this.getTotalFromStartingLocation({
      i: 0,
      j: 0,
      direction: "Right",
    }, true);
    console.log({ total });
  }

  private async getTotalFromStartingLocation(
    startingLocation: CoordinateDirection,
    print = false
  ): Promise<number> {
    let queue: CoordinateDirection[] = [startingLocation];

    while (queue.length) {
      const current = queue.shift();
      if (!current) {
        break;
      }
      if (
        current.i < 0 ||
        current.i >= this.board.length ||
        current.j < 0 ||
        current.j >= this.board[0].length
      ) {
        continue;
      }
      const points = this.board[current.i][current.j].visit(current.direction);
      queue = [...queue, ...points];
      if (print) {
        this.printBoard();
        await sleep(10);
      }
    }

    return this.countVisited();
  }

  // Part 2
  public async findOptimal() {
    const topStartingLocations: CoordinateDirection[] = this.board[0].map(
      (cell) => ({ ...cell.coordinate, direction: "Down" })
    );
    const leftStartingLocations: CoordinateDirection[] = this.board.map(
      (row) => ({ ...row[0].coordinate, direction: "Right" })
    );
    const bottomStartingLocations: CoordinateDirection[] = this.board[
      this.board.length - 1
    ].map((cell) => ({ ...cell.coordinate, direction: "Up" }));
    const rightStartingLocations: CoordinateDirection[] = this.board.map(
      (row) => ({ ...row[row.length - 1].coordinate, direction: "Left" })
    );
    const allStartingLocations = [
      ...topStartingLocations,
      ...leftStartingLocations,
      ...bottomStartingLocations,
      ...rightStartingLocations,
    ];

    let currentMax = 0;
    for (const startingLocation of allStartingLocations) {
      const total = await this.getTotalFromStartingLocation(startingLocation);
      const newMax = Math.max(currentMax, total);
      console.log({ location, total, currentMax: newMax === total });
      this.resetBoard();
      currentMax = newMax;
    }

    console.log({ currentMax });
  }

  private countVisited(): number {
    let total = 0;
    iterateMultiDimensional(this.board, (val) => {
      if (val.visited) {
        total += 1;
      }
    });
    return total;
  }

  public printBoard() {
    const boardStr = this.board
      .map((line) =>
        line
          .map((cell) => {
            if (cell.tile != ".") {
              return cell.tile;
            }
            if (cell.visited) {
              return "#";
            } else {
              return cell.tile;
            }
          })
          .join("")
      )
      .join("\n");
    console.log(boardStr);
    console.log("\n");
  }

  private resetBoard() {
    iterateMultiDimensional(this.board, (cell) => {
      cell.reset();
    });
  }
}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));
  const grid = dataStr.split("\n").map((line, i) =>
    line.split("").map((char, j) => {
      return new Cell(i, j, char);
    })
  );
  const board = new Board(grid);

  // board.findOptimal();
  await board.startMoving();
};

main();
