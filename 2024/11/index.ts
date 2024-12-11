import {
  readFile,
} from "../../utils/utils";
import path from "path";

const getNewStones = (stoneNum: string): string[] => {
  if (stoneNum === '0'){ 
    return ['1'];
  }
  if (stoneNum.length % 2 === 0) {
    const ans = [
      (+stoneNum.substring(0, stoneNum.length / 2)).toString(),
      (+stoneNum.substring(stoneNum.length / 2)).toString()
    ];
    return ans;
  }

  const stoneNumDigit = +stoneNum;
  const ansStr = (stoneNumDigit * 2024).toString();
  return [ansStr];
}

const finalCountMap: { [key: string]: number } = {};

const getFinalStoneCount = (iterationNum: number, stoneNum: string, stopAt: number): number => {
  const key = `${iterationNum}-${stoneNum}-${stopAt}`;
  if (finalCountMap[key]) {
    return finalCountMap[key];
  }

  if (iterationNum > stopAt) {
    return 1;
  }

  const newStoneNums = getNewStones(stoneNum);

  const total = newStoneNums.reduce((a, num) => {
    return a + getFinalStoneCount(iterationNum + 1, num, stopAt);
  }, 0);

  finalCountMap[key] = total;

  return total;
}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  let nums = dataStr.split(' ');

  const getTotal = (iterations: number) => {

    let total = 0;
    for (let i = 0; i < nums.length; i++) {
      const workingNum = nums[i];
      const totalForNum = getFinalStoneCount(1, workingNum, iterations);
      total += totalForNum
    }
    return total;
  }

  //P1
  const p1Total = getTotal(25);

  //P2
  const p2Total = getTotal(75);
  console.log({p1Total, p2Total});
};

main();
