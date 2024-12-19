import { convertToObject } from "typescript";
import {
  readFile,
  writeFile,
} from "../../utils/utils";
import path from "path";
import { appendFile, appendFileSync, writeFileSync } from "fs";

type ComputerInstruction = (operand: number) => void

class Computer {
  program: number[];
  regA: bigint;
  regB: bigint;
  regC: bigint;

  instructionCounter: number = 0;
  output: number[] = [];

  opCodes: ComputerInstruction[] = [
    this.adv,
    this.bxl,
    this.bst,
    this.jnz,
    this.bxc,
    this.out,
    this.bdv,
    this.cdv,
  ]
  constructor(program: number[], initialA: bigint) {
    this.program = program;
    this.regA = initialA;
    this.regB = 0n;
    this.regC = 0n;
  }

  adv(operand: number) {
    const answer = this.divideOperation(operand)
    this.regA = answer;
    this.incrementInstructionCounter();
  }

  bxl(operand: number) {
    const value = this.getOperandValue('literal', operand);
    const answer = this.regB ^ value;
    this.regB = answer;
    this.incrementInstructionCounter();
  }

  bst(operand: number) {
    const value = this.getOperandValue('combo', operand);
    const answer = value % 8n;
    this.regB = answer;
    this.incrementInstructionCounter();
  }

  jnz(operand: number) {
    if (this.regA === 0n) {
      this.incrementInstructionCounter();
      return;
    }
    const jumpTo = this.getOperandValue('literal', operand);
    this.instructionCounter = Number(jumpTo);
  }

  bxc(operand: number) {
    const answer = this.regB ^ this.regC;
    this.regB = answer;
    this.incrementInstructionCounter();
  }

  out(operand: number) {
    const value = this.getOperandValue('combo', operand);
    const result = value % 8n;
    this.output.push(Number(result));
    this.incrementInstructionCounter();
  }

  bdv(operand: number) {
    const answer = this.divideOperation(operand)
    this.regB = answer;
    this.incrementInstructionCounter();
  }

  cdv(operand: number) {
    const answer = this.divideOperation(operand)
    this.regC = answer;
    this.incrementInstructionCounter();
  }

  getOperandValue(type: 'literal' | 'combo', operand: number): bigint {
    if (type === 'literal') {
      return BigInt(operand);
    }
    if (operand <= 3) {
      return BigInt(operand);
    }
    if (operand === 4) {
      return this.regA
    }
    if (operand === 5) {
      return this.regB
    }
    if (operand === 6) {
      return this.regC
    }
    if (operand >= 7) {
      throw "Invalid operand"
    }
    throw "Invalid type or operand"
  }

  incrementInstructionCounter() {
    this.instructionCounter += 2;
  }

  divideOperation(operand: number): bigint {
    const num = this.regA;
    const denom = this.getOperandValue('combo', operand);
    const answerFrac = num / (BigInt(2) ** denom);
    // const answer = Math.trunc(answerFrac);
    return answerFrac;
  }

  executeProgram(checkForReplica = false) {
    let iterations = 0;
    while (this.instructionCounter < this.program.length) {
      if (this.anyNegatives()) {
        throw "Negatives";
      }
      iterations++;
      if (iterations % 1000 === 0) {
        console.log(iterations);
      }
      const opCode = this.program[this.instructionCounter];
      const operand = this.program[this.instructionCounter + 1];

      const operation = this.opCodes[opCode];
      if (!operation) {
        throw `Invalid operation for op code: ${opCode}`;
      }
      operation.bind(this)(operand);
    }
    return {
      output: this.output,
      output_withCommas: this.output.join(','),
    }
  }
  findReplicaOutput() {
    const res = this.executeProgram(true);
    if (!res) {
      return false;
    }
    return true;
  }
  isValidReplicaSoFar() {
    if (this.output.length > this.program.length) {
      return false;
    }
    return this.output.every((outV, i) => this.program[i] === outV);
  }
  anyNegatives() {
    if (this.regA < 0 || this.regB < 0 || this.regC < 0) {
      console.log({ A: this.regA, B: this.regB, C: this.regC });
      return true;
    }
    return false;
  }

}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const [registers, program] = dataStr.split('\n\n');
  const [initialA, initialB, initialC] = [...registers.matchAll(/: (\d+)/g)].map(match => +match[1]);
  const programInstructions = program.split('Program: ')[1].split(',').map(v => +v);

  const computerP1 = new Computer(programInstructions, BigInt(initialA));
  const resultP1 = computerP1.executeProgram();
  console.log({ resultP1 });

  // let initialAP2 = 0;
  // let prev = 0;
  // const mapDiffs: {
  //   [key: string]: { i: number, diffToPrev: number }[]
  // } = {}
  // programInstructions.map((v, i) => {
  //   mapDiffs[i] = [];
  // })
  type DiffType = { a: number, diff: number };
  // const first5CorrectInstances: DiffType[] = []
  // for (let a = 0; a < 10_000_000; a++) {
  //   const com = new Computer(programInstructions, a, 0, 0);
  //   const solution = com.executeProgram();
  //   if (!solution) {
  //     console.log("no solution");
  //     continue;
  //   }

  // }
  const countCorrect = (solution: number[]): number => {
    let matching = 0;
    for (let i = 0; i < programInstructions.length - 1; i++) {
      if (programInstructions[i] === solution[i]) {
        matching++;
      } else {
        return matching;
      }
    }
    return matching;
  }

  const getDiff = (list: DiffType[], a: number) => {
    if (list.length === 0) {
      return a;
    }
    return a - list[list.length - 1].a;
  }

  const isSolved = (solution: number[]) => {
    return solution.length === programInstructions.length && countCorrect(solution) === programInstructions.length;
  }

  let workingSequence: number[] = [1];

  const initialA2 = 0o3_000_000_000_000_000n;
  const maxA = 0o4_000_000_000_000_000n - 1n;
  let runningA = initialA2;
  const increment = 1n * 8n ** 14n
  console.log(increment.toString(8));
  const percentCount = (maxA - runningA) / 100n;

  const findSolutionForOctet = (runningNumber: bigint, octet: bigint) => {

    const solutionindex = octet;

    for (let m = 0n; m < 8n; m++) {
      const incrementAmount = m * 8n ** octet;
      const newRunningNumber = runningNumber + incrementAmount;
      const computer = new Computer(programInstructions, newRunningNumber);
      const { output } = computer.executeProgram();
      console.log({ aOctet: newRunningNumber.toString(8), incrementAmount: incrementAmount.toString(8), m, octet, output });
      if (isSolved(output)) {
        console.log({ aOctet: newRunningNumber.toString(8), a: runningA, output });
        console.log("solved");
        return true;
      }
      if (output[Number(octet)] === programInstructions[Number(octet)]) {
        console.log({ aOctet: newRunningNumber.toString(8), output, a: newRunningNumber });
        findSolutionForOctet(newRunningNumber, octet - 1n);
      }
    }
  }

  const aSolved = 109019476330651n;
  const solvedInput = new Computer(programInstructions, aSolved);
  const {output} = solvedInput.executeProgram();
  console.log(output);
  console.log(output.join(',') === programInstructions.join(','));

  return

  findSolutionForOctet(0o3_000_000_000_000_000n, 14n);
  return;


  for (let l = 14n; l >= 0n; l--) {
    const increment = 1n * 8n ** l;

    for (let m = 0; m < 8; m++) {

    }
  }

  while (true) {
    break;
    const computerP2 = new Computer(programInstructions, runningA);
    const { output, output_withCommas } = computerP2.executeProgram();

    // if (runningA % 100_000n === 0n) {
    //   console.log({
    //     runningA,
    //     runningAOct: runningA.toString(8),
    //     pc: (runningA - initialA2) / percentCount + '%',
    //   });
    // }
    console.log({ output, a: runningA.toString(8) });

    if (isSolved(output)) {
      console.log({ solutionP2: runningA });
      break;
    }
    if (runningA > maxA) {
      console.log("Solution not found");
      break;
    }
    runningA += increment;


    // const solutionCopyRev = [...solution.output].reverse()

    // for (let k = 0; k < solutionCopyRev.length; k++) {

    //   const v = solutionCopyRev[k]
    //   if (v === expectedOutputReversed[k]) {
    //     await appendFileSync(`${k}oct.txt`, runningA.toString(8) + '\n');
    //   }
    // }


    // const correctOutputs = countCorrect(solution.output);
    // if (correctOutputs > 0) {
    //   for (let ci = correctOutputs; ci >= 1; ci--) {
    //     let solList = sequenceMap[ci];
    //     if (!solList) {
    //       await appendFileSync('./outs.txt', `first time ${correctOutputs}: ${runningA}\n\n`)
    //       const newSolList: DiffType[] = []
    //       sequenceMap[ci] = newSolList
    //       solList = newSolList;
    //     }
    //     solList.push({ a: runningA, diff: solList.length === 0 ? runningA : runningA - solList[solList.length - 1].a });
    //     if (solList.length === 1000) {
    //       await writeFileSync(`${ci}.txt`, solList.map(v => v.a.toString(2)).join('\n'));
    //       console.log(`Writing file for ${ci}`)
    //     }
    //   }
    // }

    // if (correctOutputs > sequenceForSols) {
    //   const solList = sequenceMap[sequenceForSols + 1];
    //   if (!solList) {
    //     sequenceMap[sequenceForSols + 1] = [];
    //   }
    //   const solList2 = sequenceMap[sequenceForSols+1];
    //   const diff = getDiff(solList2, runningA);
    //   solList2.push({ a: runningA, diff });
    //   if (solList2.length === 1000) {
    //     const diffs = solList2.map(l => l.diff).join(' ');
    //     console.log(diffs);
    //     const lastA = solList2[solList2.length - 1];
    //     let allAIdxes: number[] = solList2.reduce((a, v, i) => {
    //       if (i === solList2.length - 1) {
    //         return a;
    //       }
    //       if (v.diff === lastA.diff) {
    //         a.push(i);
    //       }
    //       return a;
    //     }, [] as number[]);

    //     let workingIdxMag = 0;
    //     let foundSequence: DiffType[] = [];
    //     while (solList2.length - 1 - workingIdxMag != allAIdxes[allAIdxes.length - 1]) {
    //       if (workingIdxMag > allAIdxes.length) {
    //         throw 'repeating sequence not found';
    //       }
    //       const valueToMatch = solList2[solList2.length - 1 - workingIdxMag]
    //       const diffToMatch = valueToMatch.diff;
    //       allAIdxes = allAIdxes.filter((idx) => {
    //         return solList2[idx - workingIdxMag].diff === diffToMatch;
    //       })
    //       foundSequence.unshift(valueToMatch);
    //       workingIdxMag++;
    //     }
    //     console.log("Repeating sequence found");
    //     console.log(foundSequence);
    //     console.log({ seqLength: foundSequence.length, correctOutputs: correctOutputs });
    //     sequenceForSols = correctOutputs;
    //     runningA = foundSequence[0].a - foundSequence[0].diff;
    //     console.log({newA: foundSequence[0].a - foundSequence[0].diff});
    //     j = 0;
    //     continue;
    //   }
    // }
  }



  // const diffToFind = 78481;

  // let idx = first5CorrectInstances.findIndex((v) => v.diff === diffToFind);

  // if (idx === -1) {
  //   throw "not found";
  // }
  // const repeatingSeq: DiffType[] = [];
  // while (true) {
  //   idx++;
  //   repeatingSeq.push(first5CorrectInstances[idx]);
  //   if (first5CorrectInstances[idx].diff === diffToFind) {
  //     break;
  //   }
  // }
  // const repeatingSeqNums = repeatingSeq.map(v => v.diff);
  // console.log("repeating seq found");
  // console.log(repeatingSeq);
  // const seqLength = repeatingSeq.length;


  // console.log("using seq to find solutions");

  // return;
  // while (true) {
  //   initialAP2++;
  //   if (initialAP2 % 1_000_000 === 0) {
  //     console.log({ initialAP2 });
  //   }
  // }
  // console.log({ resultP1, resultP2: initialAP2 });
}

main();
