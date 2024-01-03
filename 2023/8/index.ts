import fs from 'fs';
import path from 'path';

const data = fs.readFile(path.resolve(__dirname, 'input.txt'), 'utf-8', (err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

class Network {
    nodes: { [key: string]: Node };
    instructions: string[];
    currentPos: string;
    steps: number;
    currentPositions: string[];
    constructor(instructions: string) {
        this.nodes = {};
        this.instructions = instructions.split('');
        this.currentPos = 'AAA';
        this.steps = 0;
        this.currentPositions = [];
    }
    addNode(node: Node) {
        this.nodes[node.name] = node;
        if (node.name.endsWith('A')) {
            this.currentPositions.push(node.name);
        }
    }
    traverse() {
        let count = 0;
        while (this.currentPos !== 'ZZZ') {
            const ins = this.instructions[count % this.instructions.length];
            if (ins === 'L') {
                const newPos = this.nodes[this.currentPos].left
                console.log({ count, newPos, currPos: this.currentPos, ins });
                this.currentPos = newPos;
            } else if (ins === 'R') {
                const newPos = this.nodes[this.currentPos].right
                console.log({ count, newPos, currPos: this.currentPos, ins });
                this.currentPos = newPos;
            } else {
                console.log(ins);
                throw 'Invalid'
            }
            count++;
            this.steps++;
        }
        console.log(this.steps);
    }
    traverse2() {
        let count = 0;
        const finnishCounts: number[][] = this.currentPositions.map(_ => ([]));
        while (!this.currentPositions.every(name => name.endsWith('Z'))) {
            const ins = this.instructions[count % this.instructions.length];

            this.currentPositions.forEach((pos, i) => {
                if (pos.endsWith('Z')) {
                    finnishCounts[i].push(count);
                }
            });
            // 50 100 150
            // 50 50
            if (finnishCounts.every(a => a.length > 1)) {
                const sequences = finnishCounts.map(a => {
                    return a.map((a, i, orig) => (orig[i + 1] || a) - a);
                });
                console.log(sequences);
                const a = sequences.map(s => s[0]);
                console.log(a);
                let total = 1;
                a.forEach(a => {
                    total *= a
                });
                console.log(total);
                return
                let lcm = Math.max(...a);
                while(!a.every(num => (lcm%num) === 0)) {
                    lcm++;
                }
                console.log(lcm);
                return;
            }



            const newPositions = this.currentPositions.map((node, i) => {
                if (ins === 'L') {
                    const newPos = this.nodes[node].left
                    return newPos;
                } else if (ins === 'R') {
                    const newPos = this.nodes[node].right
                    return newPos;
                } else {
                    console.log(ins);
                    throw 'Invalid'
                }

            });

            this.currentPositions = newPositions;
            count++;

        }
        console.log(count);
    }
}

class Node {
    name: string;
    left: string;
    right: string;
    constructor(
        name: string,
        left: string,
        right: string
    ) {
        this.name = name;
        this.left = left;
        this.right = right;
    }
}

const handleData = (data: string) => {
    const [instructions, networkStr] = data.split('\n\n');

    const network = new Network(instructions);

    [...networkStr.matchAll(
        new RegExp('(?<node>.{3}) = \\((?<left>.*), (?<right>.*)\\)', 'g'))
    ]
        .forEach((match) => {
            const groups = match.groups as { node: string, left: string, right: string };
            network.addNode(new Node(groups.node, groups.left, groups.right));
        });
    console.log(network);
    // network.traverse();
    network.traverse2();
}