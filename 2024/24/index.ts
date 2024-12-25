import {
  getCombinations,
  readFile,
} from "../../utils/utils";
import {
  Node,
  Edge,
  Graph,
} from '../../utils/graphUtils';
import path from "path";
import { fail } from "assert";

type GateType = 'AND' | 'OR' | 'XOR';

type WireMap = { [key: string]: Wire };
type GateMap = { [key: number]: Gate };

const isGateType = (input: string): input is GateType => {
  return input === 'AND'
    || input === 'OR'
    || input === 'XOR';
}

class Wire {
  id: string;
  value: number | null;
  outputFrom: number | null = null;
  inputTo: number[] = []

  constructor(id: string, value: number | null) {
    this.value = value;
    this.id = id;
  }
  addInput(gateId: number) {
    this.inputTo.push(gateId);
  }
  addOutput(gateId: number) {
    if (this.outputFrom != null) {
      throw `Adding output to wire that already has one: wire ${this.id}`;
    }
    this.outputFrom = gateId
  }
  copy() {
    const newWire = new Wire(this.id, this.value);
    newWire.outputFrom = this.outputFrom;
    newWire.inputTo = [...this.inputTo];
    return newWire;
  }
}

class Gate {
  id: number
  type: GateType;
  inputIds: string[];
  outputId: string;
  constructor(id: number, type: GateType, inputIds: string[], outputId: string) {
    this.id = id;
    this.type = type;
    this.inputIds = inputIds;
    this.outputId = outputId;
  }

  calculateOutput(wireMap: WireMap) {
    const [in1, in2] = this.inputIds.map(id => wireMap[id]);

    if (in1.value === null || in2.value === null) {
      throw `Can't calculate output because one of the wires has no value. ${in1.id}: ${in1.value}, ${in2.id}: ${in2.value}`;
    }

    let result;

    switch (this.type) {
      case "AND":
        result = in1.value & in2.value;
        break;
      case "OR":
        result = in1.value | in2.value;
        break;
      case "XOR":
        result = in1.value ^ in2.value;
        break;
    }

    const outputWire = wireMap[this.outputId];
    if (!outputWire) {
      throw `Output wire for gate not found ${this.outputId}`;
    }

    outputWire.value = result;

  }
  copy() {
    return new Gate(this.id, this.type, [...this.inputIds], this.outputId);
  }
}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));
  const [wiresStr, connectionsStr] = dataStr.split('\r\n\r\n');

  const initialWires: Wire[] = wiresStr.split('\r\n').map(wire => {
    const [id, value] = wire.split(': ');
    return new Wire(id, +value);
  });

  let wireMap: WireMap = {};

  initialWires.forEach(wire => {
    wireMap[wire.id] = wire;
  });

  let gateMap: GateMap = {};

  connectionsStr.split('\r\n').map((connectionLine, i) => {
    const match = connectionLine.match(/([\da-z]+) ([A-Z]+) ([\da-z]+) -> ([a-z\d]+)/);
    if (!match) {
      throw "No match found";
    }
    const matchArr = [...match];
    const [_, inputWire1Id, gateType, inputWire2Id, outputWireId] = matchArr
    let inputWire1 = wireMap[inputWire1Id];
    if (!inputWire1) {
      inputWire1 = new Wire(inputWire1Id, null);
      wireMap[inputWire1Id] = inputWire1;
    }
    inputWire1.addInput(i);

    let inputWire2 = wireMap[inputWire2Id];
    if (!inputWire2) {
      inputWire2 = new Wire(inputWire2Id, null);
      wireMap[inputWire2Id] = inputWire2;
    }
    inputWire2.addInput(i);

    let outputWire = wireMap[outputWireId];
    if (!outputWire) {
      outputWire = new Wire(outputWireId, null);
      wireMap[outputWireId] = outputWire;
    }
    outputWire.addOutput(i);

    if (!isGateType(gateType)) {
      throw `Unknown gate type: ${gateType}`;
    }

    const gate = new Gate(i, gateType, [inputWire1Id, inputWire2Id], outputWireId);
    gateMap[i] = gate;
  });

  const calculateGateOutput = (gate: Gate): number[] => {
    const inputsThatNeedValue: Wire[] = gate.inputIds.map(id => {
      return wireMap[id];
    }).filter(wire => wire.value === null);

    let allTouched: number[] = [];

    inputsThatNeedValue.forEach(wire => {
      const touchedGates = calculateWireValue(wire);
      allTouched = allTouched.concat(touchedGates);
    });

    gate.calculateOutput(wireMap);
    return [...new Set([...allTouched, gate.id])];
  }

  const calculateWireValue = (wire: Wire): number[] => {

    if (wire.value != null) {
      return [];
    }

    const outputGateId = wire.outputFrom;
    if (outputGateId === null) {
      throw `No output gate for wire: ${wire.id}`;
    }

    const outputGate = gateMap[outputGateId];
    const touchedGates = calculateGateOutput(outputGate);
    return [...new Set(touchedGates)]
  }

  const resetInternalAndOutputWires = () => {
    Object.values(wireMap)
      .filter(wire => !wire.id.startsWith('x') && !wire.id.startsWith('y'))
      .forEach(wire => wire.value = null);
  };

  const setInputWire = (valueToSet: number, input: 'x' | 'y') => {
    Object.values(wireMap)
      .filter(wire => wire.id.startsWith(input))
      .forEach(wire => wire.value = 0);

    const numberInBinaryString = valueToSet.toString(2);
    const digits = numberInBinaryString.split('').reverse();
    digits.forEach((d, i) => {
      const wireIdPrefix = i < 10 ? input + '0' : input;
      const wireId = wireIdPrefix + i;
      const wire = wireMap[wireId];
      if (!wire) {
        throw `Wire not found ${wireId}`;
      }
      wire.value = +d;
    });
  }

  const setXWires = (valueToSet: number) => {
    setInputWire(valueToSet, 'x');
  }

  const setYWires = (valueToSet: number) => {
    setInputWire(valueToSet, 'y');
  }

  const calculateAllZWires = () => {
    Object.values(wireMap).filter(w => w.id.startsWith('z')).forEach(zWire => {
      calculateWireValue(zWire);
    });
  }

  const readOutput = () => {
    const zWires = Object.values(wireMap).filter(w => w.id.startsWith('z'));
    zWires.sort((a, b) => {
      return a.id < b.id ? 1 : -1;
    });

    const zWireOutputs = zWires.map(zWire => {
      return { id: zWire.id, result: zWire.value };
    });

    const resultStr = zWireOutputs.reduce((a, v) => a + v.result, '0b')
    const result = Number(resultStr);

    return result;
  }

  if (process.argv[2]) {
    const str = process.argv[2];
    const [w, id] = str.split('-');
    if (w === 'w') {
      console.log(wireMap[id]);
    } else if (w === 'g') {
      console.log(gateMap[+id]);
    } else {
      throw 'invalid';
    }
    return;
  }

  calculateAllZWires();

  const resultP1 = readOutput();
  console.log({ resultP1 });

  type Result = { x: number, y: number, z: number | null, sum: number, matches: boolean, gatesTouched: number[], wire: string };
  const resultArray: Result[] = [];

  for (let i = 0; i <= 44; i++) {
    const num = 2 ** i;
    resetInternalAndOutputWires();
    setXWires(num);
    setYWires(0);
    const expectedResult = num;
    // calculateAllZWires()

    const wire = wireMap[`z${i < 10 ? '0' + i : i}`];
    const touchedGates = calculateWireValue(wire);
    resultArray.push({ x: num, y: 0, z: wire.value, matches: wire.value === 1, sum: expectedResult, wire: `z${i < 10 ? '0' + i : i}`, gatesTouched: touchedGates });
  }
  for (let i = 0; i <= 44; i++) {
    const num = 2 ** i;
    resetInternalAndOutputWires();
    setXWires(0);
    setYWires(num);
    const expectedResult = num;

    const wire = wireMap[`z${i < 10 ? '0' + i : i}`];
    const touchedGates = calculateWireValue(wire);
    resultArray.push({ x: num, y: 0, z: wire.value, matches: wire.value === 1, sum: expectedResult, wire: `z${i < 10 ? '0' + i : i}`, gatesTouched: touchedGates });
  }
  const failedResults: Result[] = [];
  resultArray.forEach((result, i) => {
    if (result.matches) {
      return;
    }

    const resultPrev = resultArray[i - 1];
    const prevTouched = resultPrev.gatesTouched;
    const newRes: Result = { ...result, gatesTouched: [...result.gatesTouched].filter(g => !prevTouched.includes(g)) };
    failedResults.push(newRes);
  })

  console.log({nonWorkingBits: failedResults.map(r => r.wire)});

  // Part 2 done on pen and paper by mapping out connections from working bit and then following through the logic for non-working bits.

};

main();
