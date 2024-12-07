import {
  matchAll,
  readFile,
} from "../../utils/utils";
import path from "path";

const multiplyAndTimes = (running: number[], newNum: number): number[] => {
  return running.map(num => num *= newNum).concat(...running.map(num => num += newNum));
}

const concat = (running: number[], newNum: number): number[] => {
  return running.map(num => +[num, newNum].join(''));
}

const hasSolution = (total: number, nums: number[]) => {
  const numsCopy = [...nums];
  let sols: number[] = [];

  while(numsCopy.length) {
    const toTest = numsCopy.shift();
    if (toTest === undefined) {
      throw "No number to Test";
    }
    if (sols.length === 0) {
      sols.push(toTest);
    } else {
      // P1, multiply and times only
      // P2, add concat too
      sols = [...multiplyAndTimes(sols, toTest), ...concat(sols, toTest)]
    }
  }

  return sols.some(num => num === total);

}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const lines = dataStr
  .split('\n')
  .map(line => matchAll(line, /(\d+): (.*)/g)[0])
  .map(match => ({total: +match[1], nums: match[2].split(' ').map(n => +n)}));

  const total = lines.reduce((a, {total, nums}) => {

    if (hasSolution(total, nums)) {
      return a+ total;
    }
    return a;
  }, 0);
  console.log(total);
};

main();
