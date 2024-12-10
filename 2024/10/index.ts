import { Edge, Graph, Node } from "../../utils/graphUtils";
import {
  Coordinate,
  isCoordinateInBounds,
  isInBounds,
  iterateMultiDimensional,
  readFile,
} from "../../utils/utils";
import path from "path";

class HeightCoord extends Coordinate {
  height: number;
  constructor(i: number, j: number, height: number) {
    super(i, j);
    this.height = height;
  }
}

class TopoNode extends Node<Edge> {

  height: number;

  constructor(id: string, edges: Edge[], visited: boolean, height: number) {
    super(id, edges, visited);
    this.height = height;
  }

}

class TopoGraph extends Graph<Edge, TopoNode> {
  constructor(nodes: TopoNode[]) {
    super(nodes);
  }

  public findPaths(): string[][] {
    const trailHeadNodeIds = this.nodes.filter(v => v.height === 0).map(node => node.id);

    return this.findPathsBFS(trailHeadNodeIds, this.isSolved);

  }

  private isSolved(path: string[]) {
    if (path.length === 0) {
      return false;
    }
    return this.nodeMap[path[path.length - 1]].height === 9;
  }
}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input1.txt"));

  const numGrid = dataStr.split('\r\n').map((line, i) => line.split('').map((v, j) => new HeightCoord(i, j, +v)));

  const topoNodes: TopoNode[] = [];
  iterateMultiDimensional(numGrid, (value) => {
    const edges: Edge[] = value
      .getAllNeighours()
      .filter(coord => isCoordinateInBounds(numGrid, coord))
      .map(coord => numGrid[coord.i][coord.j])
      .filter(topoCoord => topoCoord.height === (value.height + 1))
      .map(coord => new Edge(value.hash(), coord.hash()));

    topoNodes.push(new TopoNode(value.hash(), edges, false, value.height));
  });

  const topoGraph = new TopoGraph(topoNodes);

  const solvedPaths = topoGraph.findPaths();

  const map: {[key: string]: string[]} = {};

  solvedPaths.forEach(path => {
    if (map[path[0]] === undefined) {
      map[path[0]] = []
    };

    map[path[0]] = [...new Set([...map[path[0]], path[path.length-1]])];
  });

  //P1
  console.log("P1 Score: " + Object.values(map).reduce((a, v) => a + v.length,0));

  //P2
  console.log("P2 Score: " +solvedPaths.length);

};

main();
