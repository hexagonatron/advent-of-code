import {
  ALL_DIRECTIONS_DIAG,
  Direction,
  DirectionDiag,
  getNeighbour,
  iterateMultiDimensional,
  readFile,
} from "../../utils/utils";
import path from "path";

const WORD = "XMAS".split('');

type Point = {i: number, j: number};

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const board = dataStr.split('\n').map(l => l.split(''));

  let count = 0;

  const pointValid = ({i, j}: Point) => {
    if (i < 0 || j < 0 || i >= board.length || j >= board[0].length ) {
      return false;
    }
    return true;
  }


  const findXmas = (i: number, j: number, direction: DirectionDiag, iteration: number) => {
    // Out of bounds
    if (!pointValid({i, j})) {
      return;
    }

    if (board[i][j] === WORD[iteration]) {

      //End of word
      if (iteration === WORD.length -1) {
        count++;
        return;
      }

      const {i: newI, j: newJ} = getNeighbour(i, j, direction);

      // In a word
      return findXmas(newI, newJ, direction, iteration + 1);
    }

  }

  // Part 1
  iterateMultiDimensional(board, (el, i ,j) => {
    if (el === WORD[0]) {
      ALL_DIRECTIONS_DIAG.forEach(direction => {
        const {i: newI, j: newJ} = getNeighbour(i, j, direction);
        findXmas(newI, newJ, direction, 1);
      })
    }
  })

  console.log("Part 1: " + count);

  const isMS = (point1: Point, point2: Point) => {
    return board[point1.i][point1.j] === "M" && board[point2.i][point2.j] === "S" ||
    board[point1.i][point1.j] === "S" && board[point2.i][point2.j] === "M";
  }

  const checkMS = (i: number, j: number): boolean => {
    const upLeft = getNeighbour(i, j, "UpLeft");
    const downRight = getNeighbour(i, j, "DownRight");

    const upRight = getNeighbour(i, j, "UpRight");
    const downLeft = getNeighbour(i, j, "DownLeft");

    if (![upLeft, downRight, upRight, downLeft].every(point => pointValid(point))){
      return false;
    }

    return isMS(upLeft, downRight) && isMS(upRight, downLeft);

  }

  let count2 = 0;
  // Part 2
  iterateMultiDimensional(board, (el, i ,j) => {
    if (el === "A") {
      if (checkMS(i, j)) {
        count2++;
      }
    }
  });
  console.log("Part 2: " + count2);

};

main();
