import {
  readFile,
} from "../../utils/utils";
import path from "path";

type Property = 'x' | 'm' | 'a' | 's';
type Operator = '>' | '<';
class Rule {
  property: Property;
  operator: Operator;
  magnitude: number;
  passInstruction: string;
  constructor(
    property: string,
    operator: string,
    magnitude: number,
    passInstruction: string
  ) {
    this.property = property as Property;
    this.operator = operator as Operator;
    this.magnitude = magnitude;
    this.passInstruction = passInstruction;
  }

  public test(part: Part) {
    if (this.operator === '<') {
      return part[this.property] < this.magnitude;
    } else {
      return part[this.property] > this.magnitude;
    }
  }

}

class Workflow {
  label: string;
  rules: Rule[]
  failInstruction: string;
  constructor(label: string, rules: Rule[], failInstruction: string) {
    this.label = label;
    this.rules = rules;
    this.failInstruction = failInstruction;
  };

  public processPart(part: Part): string {
    for (let i = 0; i < this.rules.length; i++) {
      const rule = this.rules[i];
      if (rule.test(part)) {
        return rule.passInstruction;
      }
    }
    return this.failInstruction;
  }
}

class Part {
  x: number;
  m: number;
  a: number;
  s: number;

  constructor(
    x: number,
    m: number,
    a: number,
    s: number,
  ) {
    this.x = x;
    this.m = m;
    this.a = a;
    this.s = s;
  }

  sum() {
    return this.x + this.m + this.a + this.s
  }

}

class Machine {
  workflowMap: { [key: string]: Workflow } = {};
  constructor(workflows: Workflow[]) {

    workflows.forEach(wf => {
      this.workflowMap[wf.label] = wf;
    });
  }

  private processPart(part: Part) {
    let nextWf = this.workflowMap.in;
    let result: string = ''
    let count = 0;
    while (result != 'A' && result != 'R') {
      const res = nextWf.processPart(part);
      console.log({nextWf, res});
      if (res === 'A' || res === 'R') {
        result = res;
        break;
      }
      nextWf = this.workflowMap[res];
      count++;
    }
    if (result === 'A') {
      return part.sum();
    }
    return 0;
  }

  public processParts(parts: Part[]) {
    const total = parts.reduce((acc, p) => this.processPart(p) + acc, 0);
    console.log({ total });
  }
}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const [wf, p] = dataStr.split('\n\n');

  const workflows = wf.split('\n').map(line => {
    const match = line.match(/^(?<label>[a-z]{1,3}){(?<rules>(?<rule>,?(?<property>[axms])(?<comparison>[\>\<])(?<mag>\d+):(?<result>[a-zA-Z]{1,3}))+),(?<fail>[a-zA-Z]{1,3})}$/);
    if (!match?.groups) {
      throw 'no match';
    }
    const { label, fail } = match.groups;

    const rules: Rule[] = [...match.groups.rules.matchAll(/(?<property>[axms])(?<comparison>[\>\<])(?<mag>\d+):(?<result>[a-zA-Z]{1,3})/g)].map(match => {
      if (!match.groups) {
        throw 'No rules found';
      }
      const { property, comparison, mag, result } = match.groups;

      return new Rule(property, comparison, +mag, result);
    });
    const wf = new Workflow(
      label,
      rules,
      fail
    );
    console.log(wf);
    return wf;
  });

  const parts: Part[] = p.split('\n').map(part => {
    const match = part.match(/{x=(?<x>\d+),m=(?<m>\d+),a=(?<a>\d+),s=(?<s>\d+)}/);
    if (!match?.groups) {
      console.log(part)
      throw 'No match';
    }
    const { x, m, a, s } = match.groups;
    return new Part(+x, +m, +a, +s);
  });

  const machine = new Machine(workflows);

  machine.processParts(parts);


};

main();
