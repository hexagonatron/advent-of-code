import {
  readFile,
} from "../../utils/utils";
import path from "path";

type ModuleType = "%" | "&" | "broadcaster";
type State = "High" | "Low";

class Module {
  type: ModuleType;
  id: string;
  outputs: string[];
  inputs: string[] = [];
  state: State = "Low";


  constructor(
    type: ModuleType,
    outputs: string[],
    id?: string,
  ) {
    if (!id) {
      this.id = 'broadcaster';
    } else {
      this.id = id;
    }
    this.type = type;
    this.outputs = outputs;
  }

  addInput(id: string) {
    this.inputs.push(id);
  }

  flipFlop() {
    if (this.state === "High") {
      this.state = "Low";
    } else {
      this.state = "High";
    }
  }

}

interface Pulse {
  type: State;
  to: string;
}

class ModuleGroup {
  modules: { [key: string]: Module };
  highPulses: number = 0;
  lowPulses: number = 0;

  constructor(modules: { [key: string]: Module }) {
    this.modules = modules;
  }

  getModule(id: string) {
    return this.modules[id];
  }

  pressButton(printRes = false) {
    let pulses: Pulse[] = [];
    pulses.push({ to: 'broadcaster', type: "Low" });

    while (pulses.length > 0) {
      let newPulses: Pulse[] = [];
      for (const pulse of pulses) {
        const resultPulses = this.handlePulse(pulse);
        newPulses = newPulses.concat(resultPulses);
        if (printRes) {
          console.log({ pulse, resultPulses });
        }
      }
      pulses = newPulses;
    }

  }

  handlePulse(pulse: Pulse): Pulse[] {

    if (pulse.type === 'High') {
      this.highPulses += 1;
    } else {
      this.lowPulses += 1;
    }

    const module = this.getModule(pulse.to);
    if (!module) {
      return [];
    }
    let resultPulses: Pulse[] = [];

    switch (module.type) {
      case "%":
        if (pulse.type === 'Low') {
          module.flipFlop();
          resultPulses = resultPulses.concat(module.outputs.map(o => ({ to: o, type: module.state })));
        }
        break;
      case "&":
        const inputModules = module.inputs.map(i => this.getModule(i));
        if (inputModules.some(m => m.state === "Low")) {
          module.state = "High";
          resultPulses = resultPulses.concat(module.outputs.map(o => ({ to: o, type: module.state })));
        } else {
          module.state = "Low";
          resultPulses = resultPulses.concat(module.outputs.map(o => ({ to: o, type: module.state })));
        }
        break;
      case "broadcaster":
        module.state = "Low";
        resultPulses = resultPulses.concat(module.outputs.map(o => ({ to: o, type: module.state })));
        break;
    }

    return resultPulses;
  }
}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const modules: { [key: string]: Module } = {};

  const getModule = (id: string) => {
    const module = modules[id];
    return module;
  }

  const printModules = () => {
    Object.values(modules).forEach(module => {
      console.log(module);
    });
  }

  dataStr.split('\n').forEach(line => {
    const match = line.match(/^(?<type>\%|\&|broadcaster)(?<id>[a-z]+)? -> (?<connections>.+)$/);
    if (!match?.groups) {
      throw "groups not found";
    }
    const { type, id, connections } = match.groups;
    const module = new Module(type as ModuleType, connections.split(', '), id);
    modules[module.id] = module;
  });

  Object.values(modules).forEach(module => {
    module.outputs.forEach(outputId => {
      const outputModule = getModule(outputId);
      if (!outputModule) {
        return;
      }
      outputModule.addInput(module.id);
    })
  });

  const group = new ModuleGroup(modules);

  for (let i = 1; i <= 1_000; i++) {
    group.pressButton();
    console.log(i);
  }
  console.log({ high: group.highPulses, low: group.lowPulses, prod: group.lowPulses * group.highPulses });

};

main();
