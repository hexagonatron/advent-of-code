import {
  readFile,
} from "../../utils/utils";
import path from "path";

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const lines = dataStr.split('\n').map(line => line.split(' ').map(num => +num));

  const newLines = lines.filter((line, i) => {

    // console.log({
    //   line: i,
    //   isAsc: isAscending(line),
    //   isDesc: isDescending(line),
    //   isSafe: isSafe(line),
    //   keeping: (isAscending(line) || isDescending(line) ) && isSafe(line),
    // });

    return (
      (isAscending(line) || isDescending(line)) && isSafe(line))
      || isSafeAfterOneRemoval(line);
  });

  console.log(`Safe reports: ${newLines.length}`);
};

function isAscending(arr: number[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] - arr[i + 1] >= 0) {
      return false;
    }
  }
  return true;
}

function isDescending(arr: number[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] - arr[i + 1] <= 0) {
      return false;
    }
  }
  return true;
}

const MAX_SAFE = 3

function isSafe(arr: number[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (Math.abs(arr[i] - arr[i + 1]) > MAX_SAFE) {
      return false;
    }
  }
  return true;
}

function isSafeAfterOneRemoval(arr: number[]): boolean {
  for (let i = 0; i < arr.length; i++) {
    const newArr = [...arr]
    newArr.splice(i, 1);
    if ((isAscending(newArr) || isDescending(newArr)) && isSafe(newArr)) {
      return true;
    }
  }
  return false;

}

main();
