import { Graph } from "../../utils/graphUtils";
import {
  readFile,
} from "../../utils/utils";
import path from "path";

let idCount = 0;

const getId = () => {
  idCount += 1;
  return idCount;
}

class TrieNode {
  value: string;
  isTerminal: boolean;
  childrenMap: { [key: string]: TrieNode } = {};
  isRoot: boolean;
  id: number;
  visitIndexMap: { [key: string]: number } = {};

  constructor(value: string, isRoot = false) {
    this.value = value;
    this.isTerminal = false;
    this.isRoot = isRoot;
    this.id = getId();
    if (isRoot) {
      this.visitIndexMap['-1'] = 1;
    }
  }
  add(input: string, index = 0) {
    const character = input[index];
    const foundChildNode = this.getChild(character);
    if (this.isRoot) {
      // console.log({character, foundChildNode, root: this.isRoot});
      if (foundChildNode) {
        foundChildNode.add(input, 0);
        return;
      } else {
        const newNode = new TrieNode(character);
        this.childrenMap[newNode.value] = newNode;
        newNode.add(input, 0);
        return;
      }
    }
    if (index + 1 === input.length) {
      this.isTerminal = true;
      return;
    }
    const nextIdx = index + 1;
    const nextChar = input[nextIdx];
    const existingChild = this.getChild(nextChar);
    if (existingChild) {
      existingChild.add(input, nextIdx);
    } else {
      const newChild = new TrieNode(nextChar);
      this.childrenMap[newChild.value] = newChild;
      newChild.add(input, nextIdx);
    }
  }
  getChild(value: string) {
    return this.childrenMap[value];
  }

  toString(indentation = 0): string {
    const str = `${'-'.repeat(indentation)} ${this.value} - ${this.id} ${this.isTerminal ? 'T' : ''}\n`;
    const childStr = Object
      .values(this.childrenMap)
      .map((v) => v.toString(indentation + 1))
      .join('\n');
    return str + childStr;
  }
  addCountForIndex(index: number, currentCount: number) {
    if (this.visitIndexMap[index] === undefined) {
      this.visitIndexMap[index] = 0;
    }
    this.visitIndexMap[index] += currentCount;
  }
  resetCounts() {
    this.visitIndexMap = {};
    if (this.isRoot) {
      this.visitIndexMap['-1'] = 1;
    }
    Object.values(this.childrenMap).forEach(node => node.resetCounts());
  }
}

class Trie {
  rootNode: TrieNode;

  constructor() {
    this.rootNode = new TrieNode('', true);
  }

  add(input: string) {
    this.rootNode.add(input);
  }
  print() {
    const str = this.rootNode.toString();
    console.log(str);
    console.log('');
  }
  search(input: string) {
    let runningNodes: TrieNode[] = [this.rootNode];
    for (let i = 0; i < input.length; i++) {
      const nextRunningNodes: TrieNode[] = [];
      const charToSearch = input[i];
      runningNodes.forEach(node => {
        if (node.isTerminal) {
          const nextNode = this.rootNode.getChild(charToSearch);
          if (nextNode) {
            const currentPaths = node.visitIndexMap[i - 1];
            nextNode.addCountForIndex(i, currentPaths);
            if (nextRunningNodes.findIndex(v => v.id === nextNode.id) === -1) {
              nextRunningNodes.push(nextNode);
            }
          }
        }
        const foundNext = node.getChild(charToSearch);
        if (foundNext) {
          const currentPaths = node.visitIndexMap[i - 1];
          foundNext.addCountForIndex(i, currentPaths);
          if (nextRunningNodes.findIndex(v => v.id === foundNext.id) === -1) {
            nextRunningNodes.push(foundNext);
          }
        }
      });
      runningNodes = nextRunningNodes;
    }
    // runningNodes.map(n => {
    //   console.log({ v: n.value, terminal: n.isTerminal, id: n.id });
    //   console.log(n.visitIndexMap);
    //   console.log('');
    // });
    const result = runningNodes.filter(node => node.isTerminal).reduce((a, v) => a + v.visitIndexMap[input.length - 1], 0);
    this.rootNode.resetCounts();
    return result;
  }
}


const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const [towelStr, patternStr] = dataStr.split('\r\n\r\n');

  const towels = towelStr.split(', ').sort((a, b) => a.length - b.length).reverse();
  const patterns = patternStr.split('\r\n');

  console.log(towels);

  const trie = new Trie();

  towels.forEach((t, i) => {
    trie.add(t);
  });

  console.log(trie.rootNode);

  let possiblePatterns = 0;
  let pathsTotal = 0;

  patterns.forEach((pattern, i) => {
    const result = trie.search(pattern);
    if (result > 0) {
      console.log({ possible: pattern });
      possiblePatterns += 1;
      pathsTotal += result;
    }
  });

  console.log({ totalPatternsP1: possiblePatterns, totalSolutionsP2: pathsTotal });

};

main();
