import {
  readFile,
  rotateMultiDimArrayClockwise,
  rotateMultiDimArrayCounterClockwise,
} from "../../utils/utils";
import path from "path";

const getWeight = (arr: string[][]): number => {
  const rotated = rotateMultiDimArrayCounterClockwise(arr);
  let total = 0;
  for (const line of rotated) {
    const indexes: number[] = line.reduce(
      (acc, v, i) => (v === "O" ? [...acc, i] : [...acc]),
      [] as number[]
    );
    const length = line.length;
    const lineTotal = indexes.reduce(
      (total, index) => total + (length - index),
      0
    );
    total += lineTotal;
  }
  return total;
};

const sortRoundFirst = (string: string) => {
  return string
    .split("")
    .sort((a, b) => {
      return a < b ? 1 : -1;
    })
    .join("");
};

const tipNorth = (arr: string[][]) => {
  const rotated = rotateMultiDimArrayCounterClockwise(arr);
  const joined = rotated.map((line) => line.join(""));
  const tipped = joined.map((line) => {
    let idx = 0;
    let nextStr = "";
    while (idx <= line.length) {
      let nextHash = line.indexOf("#", idx);
      let idxToSearchTo = nextHash;
      if (nextHash === -1) {
        idxToSearchTo = line.length;
      }
      const sortedSection = sortRoundFirst(line.substring(idx, idxToSearchTo));
      nextStr += sortedSection;
      if (nextHash != -1) {
        nextStr += "#";
      }
      idx = idxToSearchTo + 1;
    }
    return nextStr;
  });
  return rotateMultiDimArrayClockwise(tipped.map((l) => l.split("")));
};

const printBoard = (board: string[][]) => {
  console.log(board.map((l) => l.join("")).join("\n") + "\n");
};

const hash = (board: string[][]): string => {
  return board.map((l) => l.join("")).join("-");
};
const unHash = (boardHash: string): string[][] => {
  return boardHash.split("-").map((l) => l.split(""));
};

const spinMap: { [key: string]: string } = {};

const spin = (board: string[][]): string[][] => {

  const tip1 = tipNorth(board);
  const rotate1 = rotateMultiDimArrayClockwise(tip1);

  const tip2 = tipNorth(rotate1);
  const rotate2 = rotateMultiDimArrayClockwise(tip2);

  const tip3 = tipNorth(rotate2);
  const rotate3 = rotateMultiDimArrayClockwise(tip3);

  const tip4 = tipNorth(rotate3);
  const rotate4 = rotateMultiDimArrayClockwise(tip4);

  // printBoard(board);
  // printBoard(tip1);
  // printBoard(rotate1)
  // printBoard(tip2);
  // printBoard(rotate2)
  // printBoard(tip3);
  // printBoard(rotate3)
  // printBoard(tip4);
  // printBoard(rotate4)

  return rotate4;
};

const spinFromHash = (boardHash: string): string => {
  if (spinMap[boardHash] != undefined) {
    return spinMap[boardHash];
  }
  console.log("Calculating");
  const spinned = spin(unHash(boardHash));
  const spinnedHash = hash(spinned)
  spinMap[boardHash] = spinnedHash;
  return spinnedHash;
};

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));
  let board = dataStr.split("\n").map((l) => l.split(""));

  let boardHash = hash(board);

  const beforeT = Date.now();
  for (let i = 0; i < 1_000_000_000; i++) {
    boardHash = spinFromHash(boardHash);
    if (i % 500_000 === 0) {
      console.log(i);
    }
  }
  console.log(getWeight(unHash(boardHash)));
  const afterT = Date.now();
  console.log({
    T: (afterT - beforeT) / 1000,
  });
};

main();
