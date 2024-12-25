import { Edge, Graph, Node } from "../../utils/graphUtils";
import {
  readFile,
  getCombinations
} from "../../utils/utils";
import path from "path";

class BiDirectionalNode extends Node<Edge> {
  constructor(id: string) {
    super(id, [], false);
  }

  hasConnectionsTo(nodeIds: string[]) {
    return nodeIds.every(id => this.edges.some(e => e.toNodeId === id));
  }
}

class BiDirectionalGraph extends Graph<Edge, BiDirectionalNode> {
  private groupIdCount = 0;
  private groups: string[] = [];
  constructor() {
    super([]);
  }

  addBidirectionalEdge(edge: Edge) {
    let node1 = this.nodeMap[edge.fromNodeId];
    if (!node1) {
      node1 = new BiDirectionalNode(edge.fromNodeId);
      this.nodeMap[node1.id] = node1;
      this.nodes.push(node1);
    }
    node1.addEdge(edge);

    let node2 = this.nodeMap[edge.toNodeId];
    if (!node2) {
      node2 = new BiDirectionalNode(edge.toNodeId);
      this.nodeMap[node2.id] = node2;
      this.nodes.push(node2);
    }
    const edgeReversed = new Edge(edge.toNodeId, edge.fromNodeId);
    node2.addEdge(edgeReversed);
  }

  calculateGroups(size: number): string[][] {
    const groups: string[][] = [];
    for (let i = 0; i < this.nodes.length; i++) {
      const workingNode = this.nodes[i];
      if (workingNode.edges.length >= size -1) {
        const connectedNodes = workingNode.edges.map(e => e.toNodeId);

        const possibleCombs = getCombinations([workingNode.id, ...connectedNodes], size);

        possibleCombs
          .filter(c => c[0] === workingNode.id)
          .forEach(combination => {
            const allConnected = combination.every(nodeId => {
              return this.nodeMap[nodeId].hasConnectionsTo(combination.filter(combId => combId != nodeId));
            });
            if (allConnected) {
              groups.push(combination);
            }
          });
      }
    }
    return groups;
  }
}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const graph = new BiDirectionalGraph();

  dataStr.split('\r\n').forEach(str => {
    const [node1Id, node2Id] = str.split('-');
    const edge = new Edge(node1Id, node2Id);
    graph.addBidirectionalEdge(edge);
  });

  const groups = graph.calculateGroups(3);
  const groupsWithT = groups.filter(group => group.some(g => g.startsWith('t')));
  console.log({part1_groupNum: groupsWithT.length});

  for(let j = graph.nodes.length; j > 0; j--) {
    if (j %100 === 0) {
      console.log(j);
    }
    const groups = graph.calculateGroups(j);
    if (groups.length > 0) {
      console.log({groupSize: j, password: groups[0].join(',')})
      break;
    }
  }

};

main();
