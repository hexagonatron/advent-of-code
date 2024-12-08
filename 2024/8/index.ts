import {
  Coordinate,
  invertCoord,
  iterateMultiDimensional,
  readFile,
} from "../../utils/utils";
import path from "path";

class Position extends Coordinate {
  value: string;
  isAntinode: boolean;
  isAntenna: boolean;
  constructor(i: number, j: number, value: string) {
    super(i,j);
    this.value = value;
    this.isAntenna = value != ".";
    this.isAntinode = false;
  }

  getAntiNodes(other: Position): Coordinate[] {
    const difference = this.getDifference(other);
    const antiNode1 = this.addCoordinate(difference);
    const antiNode2 = other.addCoordinate(invertCoord(difference))
    return [antiNode1, antiNode2];
  }
}

class Board {
  points: Position[][]

  constructor(points: Position[][]) {
    this.points = points;
  }

  addAntinodesP1() {
    iterateMultiDimensional(this.points, (value, i, j) => {
      if (value.isAntenna) {
        iterateMultiDimensional(this.points, (value2, i2, j2) => {
          if (value2.isAntenna && value2.value === value.value && !value2.isEqual(value)) {

            const antiNodePositions = value.getAntiNodes(value2).filter((node) => this.isInRange(node));
            antiNodePositions.forEach(coordinate => {
              this.points[coordinate.i][coordinate.j].isAntinode = true;
            })
          }
        })
      }
    })
  }

  addAntinodesP2() {
    iterateMultiDimensional(this.points, (value, i, j) => {
      if (value.isAntenna) {
        iterateMultiDimensional(this.points, (value2, i2, j2) => {
          if (value2.isAntenna && value2.value === value.value && !value2.isEqual(value)) {

            let difference = value.getDifference(value2);

            let runningDifference = new Coordinate(difference.i,difference.j);

            while(true) {
              const antiNodePosition = value2.addCoordinate(runningDifference)
              if (!this.isInRange(antiNodePosition)) {
                break;
              }
              this.points[antiNodePosition.i][antiNodePosition.j].isAntinode = true;
              runningDifference = runningDifference.addCoordinate(difference);
            }

          }
        })
      }
    })
  }

  isInRange(position: Coordinate): boolean {
    return position.i >= 0 && position.i < this.points.length && position.j >= 0 && position.j < this.points[0].length;
  }

  print() {
    const boardStr = this.points.map(line => line.map(point => {
      if (point.isAntinode) {
        return '#'
      }
      if (point.isAntenna) {
        return point.value;
      }
      return '.';
    }).join('')).join('\n');
    console.log(boardStr);
  }

  countAntiNodes(): number {
    let count = 0;
    iterateMultiDimensional(this.points, (value) => {
      if (value.isAntinode) {
        count++;
      }
    });
    return count;
  }
}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));
  const points: Position[][] = dataStr.split('\r\n').map((line, i) => line.split('').map((value, j) => new Position(i, j, value)));

  const board: Board = new Board(points);

  // Part 1
  // board.addAntinodesP1();

  // Part 2
  board.addAntinodesP2();

  board.print();

  console.log(board.countAntiNodes());

};

main();
