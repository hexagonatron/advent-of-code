import {
  readFile,
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
  }

  getSolution(): Solution {
      const timesB = (this.prizeY - ((this.prizeX*this.buttonBy)/this.buttonAx)) / (((this.buttonBx*this.buttonAy)/this.buttonAx) + this.buttonBy);
      const timesA = (this.prizeX - timesB*this.buttonBx ) / this.buttonAx;

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
  const dataStr = await readFile(path.resolve(__dirname, "./input1.txt"));
  const machines = dataStr.split('\n\n').map(str => [...str.matchAll(/A: X\+(\d+), Y\+(\d+)\n.*B: X\+(\d+), Y\+(\d+)\nPrize: X=(\d+), Y=(\d+)/g)]).map(match => {
    const matchArr = match[0];
    if (!matchArr) {
      return
    }
    return new Machine(+matchArr[1], +matchArr[2], +matchArr[3], +matchArr[4], +matchArr[5], +matchArr[6]);
  });

  const solution = machines[0]?.getSolution();
  console.log({solution});
};

main();
