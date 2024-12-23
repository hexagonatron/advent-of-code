import {
  Coordinate,
  CoordinateDirection,
  Direction,
  iterateMultiDimensional,
  readFile,
  sleep,
  Vector,
} from "../../utils/utils";
import path from "path";

const directionToArrow = (direction: Direction): string => {
  if (direction === 'Up') {
    return '^';
  } else if (direction === 'Down') {
    return 'v';
  } else if (direction === 'Left') {
    return '<';
  } else if (direction === 'Right') {
    return '>';
  }
  throw `Direction not supported: ${direction}`;
}

class ButtonCoordinate extends Coordinate {
  button: string | null;
  constructor(i: number, j: number, button: string | null) {
    super(i, j);
    this.button = button;
  }
  isValidButton() {
    return this.button !== null;
  }
}

const memo: { [key: string]: string[] } = {};

class Keypad {
  grid: ButtonCoordinate[][]
  currentPosition: Coordinate;
  positionMap: { [key: string]: ButtonCoordinate } = {};
  directionOrder: Direction[];
  type: string;
  constructor(buttons: ButtonCoordinate[][], initialPosition: Coordinate, directionOrder: Direction[], type: string) {
    this.grid = buttons;
    this.currentPosition = initialPosition;
    iterateMultiDimensional(buttons, ((e, i, j) => {
      if (e.button !== null) {
        this.positionMap[e.button] = e;
      }
    }));
    this.directionOrder = directionOrder;
    this.type = type;
  }

  getInstructionsForButton(button: string): string[] {
    const btnPosition = this.positionMap[button];
    if (!btnPosition) {
      throw `Position for button ${button} not found`;
    }
    const hash = `f${this.currentPosition.hash()}-t${btnPosition.hash()}-${this.type}`;

    if (memo[hash]) {
      this.currentPosition = btnPosition;
      return memo[hash];
    }

    const { i: iDiff, j: jDiff } = this.currentPosition.getDifference(btnPosition);
    const iDir: Direction | null = iDiff > 0 ? 'Up' : iDiff < 0 ? 'Down' : null;
    const jDir: Direction | null = jDiff > 0 ? 'Left' : jDiff < 0 ? 'Right' : null;

    const dirs: Vector[] = [];
    if (iDir) {
      dirs.push({ direction: iDir, magnitude: Math.abs(iDiff) });
    }
    if (jDir) {
      dirs.push({ direction: jDir, magnitude: Math.abs(jDiff) });
    }

    // console.log({ from: this.currentPosition, to: button, moves: dirs, iDir, iDiff, jDir, jDiff });

    dirs.sort((a, b) => this.directionOrder.indexOf(a.direction) - this.directionOrder.indexOf(b.direction));

    if (dirs.length === 0) {
      memo[hash] = [];
      return [];
    }

    if (!this.orderValid(dirs)) {
      dirs.reverse();
    }

    const instructions = dirs.flatMap(v => new Array(v.magnitude).fill(directionToArrow(v.direction)));
    this.currentPosition = btnPosition;
    memo[hash] = [...instructions];
    return instructions;
  }
  orderValid(dirs: Vector[]): boolean {
    const firstMove = dirs[0];
    const coordAfterFirstMove = this.currentPosition.getCoordinateFromVector(firstMove.direction, firstMove.magnitude);
    return this.grid[coordAfterFirstMove.i][coordAfterFirstMove.j].isValidButton()
  }
  getInstructionsForButtonFrom(from: string, to: string): string[] {
    this.currentPosition = this.positionMap[from];
    return [...this.getInstructionsForButton(to), "A"];
  }
}

class NumKeypad extends Keypad {
  constructor() {
    const buttons = [
      ['7', '8', '9'],
      ['4', '5', '6'],
      ['1', '2', '3'],
      [null, '0', 'A'],
    ];
    const buttonnCoords = buttons
      .map((line, i) => line.map((b, j) => new ButtonCoordinate(i, j, b)));
    const initialPosition = new Coordinate(3, 2);
    super(buttonnCoords, initialPosition, ['Left', 'Down', 'Up', 'Right'], 'num');
  }
}

class ArrowKeypad extends Keypad {
  constructor() {
    const buttons = [
      [null, '^', 'A'],
      ['<', 'v', '>'],
    ];
    const buttonnCoords = buttons
      .map((line, i) => line.map((b, j) => new ButtonCoordinate(i, j, b)));
    const initialPosition = new Coordinate(0, 2);
    super(buttonnCoords, initialPosition, ['Left', 'Down', 'Up', 'Right'], 'dir');
  }
}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const codes = dataStr.split('\r\n');

  console.log(codes);

  const getComplexity = (numberOfMiddleRobots: number) => {

    const codeLengthMap: { [key: string]: number } = {};

    const getCodeLength = (from: string, to: string, level: number): number => {
      const key = `${from}-${to}-${level}`;
      const ans = codeLengthMap[key];
      if (ans) {
        return ans;
      }

      const instructions = new ArrowKeypad().getInstructionsForButtonFrom(from, to);
      if (level === numberOfMiddleRobots) {
        const ansAtFinalLevel = instructions.length;
        codeLengthMap[key] = ansAtFinalLevel;
        return ansAtFinalLevel;
      }
      let totalInstructions = 0;
      for (let i = 0; i < instructions.length; i++) {
        const fromNested = i === 0 ? 'A' : instructions[i - 1];
        const toNested = instructions[i];
        const total = getCodeLength(fromNested, toNested, level + 1);
        totalInstructions += total;
      }
      codeLengthMap[key] = totalInstructions;
      return totalInstructions;

    };



    let runningTotal = 0;

    codes.forEach((code) => {
      const doorBot = new NumKeypad();

      const letters = code.split('');

      let doorBotInstructions: string[] = [];
      for (let k = 0; k < letters.length; k++) {
        const buttonToPush = letters[k];
        const buttonPushesDoorBot = doorBot.getInstructionsForButton(buttonToPush);
        doorBotInstructions = doorBotInstructions.concat([...buttonPushesDoorBot, 'A']);
      }

      let totalInstructions = 0;
      for (let m = 0; m < doorBotInstructions.length; m++) {
        const from = m === 0 ? 'A' : doorBotInstructions[m - 1];
        const to = doorBotInstructions[m];

        const total = getCodeLength(from, to, 1);
        totalInstructions += total;
      }

      const codeNum = +code.substring(0, code.length - 1);
      const codeComplexity = totalInstructions * codeNum;
      runningTotal += codeComplexity;
    });
    return runningTotal;
  }

  const codeComplexityP1 = getComplexity(2);
  console.log({codeComplexityP1});
  const codeComplexityP2 = getComplexity(25);
  console.log({ 
    codeComplexityP2 
  });

};

main();
