import {
  readFile,
  sumObjArr,
} from "../../utils/utils";
import path from "path";

type Solution = {
  aPushes: number;
  bPushes: number;
  cost: number;
}

class Machine {
  buttonAx: number;
  buttonAy: number;
  buttonBx: number;
  buttonBy: number;
  prizeX: number;
  prizeY: number;
  prizeXP2: number;
  prizeYP2: number;
  constructor(
    buttonAx: number,
    buttonAy: number,
    buttonBx: number,
    buttonBy: number,
    prizeX: number,
    prizeY: number,
  ) {
    this.buttonAx = buttonAx;
    this.buttonAy = buttonAy;
    this.buttonBx = buttonBx;
    this.buttonBy = buttonBy;
    this.prizeX = prizeX;
    this.prizeY = prizeY;
    this.prizeXP2 = prizeX + 10000000000000;
    this.prizeYP2 = prizeY + 10000000000000;
  }

  getSolution(): Solution | null {

      const timesB = (this.buttonAx * this.prizeY - this.prizeX* this.buttonAy) / (this.buttonBy * this.buttonAx - this.buttonAy * this.buttonBx);
      const timesA = (this.prizeX - timesB*this.buttonBx ) / this.buttonAx;

      if (!Number.isInteger(timesA) || !Number.isInteger(timesB)) {
        return null;
      }

      const Acost = 3;
      const Bcost = 1;

      return {
        aPushes: timesA,
        bPushes: timesB,
        cost: timesA * Acost + timesB * Bcost,
      }
  }

  getSolutionP2(): Solution | null {

      const timesB = (this.buttonAx * this.prizeYP2 - this.prizeXP2* this.buttonAy) / (this.buttonBy * this.buttonAx - this.buttonAy * this.buttonBx);
      const timesA = (this.prizeXP2 - timesB*this.buttonBx ) / this.buttonAx;

      if (!Number.isInteger(timesA) || !Number.isInteger(timesB)) {
        return null;
      }

      const Acost = 3;
      const Bcost = 1;

      return {
        aPushes: timesA,
        bPushes: timesB,
        cost: timesA * Acost + timesB * Bcost,
      }
  }


}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));
  const machines = dataStr.split('\n\n').map(str => [...str.matchAll(/A: X\+(\d+), Y\+(\d+)\n.*B: X\+(\d+), Y\+(\d+)\nPrize: X=(\d+), Y=(\d+)/g)]).map(match => {
    const matchArr = match[0];
    if (!matchArr) {
      throw 'No matches found!';
    }
    return new Machine(+matchArr[1], +matchArr[2], +matchArr[3], +matchArr[4], +matchArr[5], +matchArr[6]);
  });

  const totalCostP1 = sumObjArr(machines, (machine) => {
    const solution = machine.getSolution();
    if (solution === null) {
      return 0;
    }
    return solution.cost;
  });

  const totalCostP2 = sumObjArr(machines, (machine) => {
    const solution = machine.getSolutionP2();
    if (solution === null) {
      return 0;
    }
    return solution.cost;
  });

  console.log({totalCostP1, totalCostP2});
};

main();
