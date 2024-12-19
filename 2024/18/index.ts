import { Edge, Graph, Node } from "../../utils/graphUtils";
import {
  Coordinate,
  Grid,
  readFile,
  splitToGrid,
} from "../../utils/utils";
import path from "path";

class MemCoord extends Coordinate {
  private corrupted: boolean = false;
  constructor(i: number, j: number) {
    super(i, j);
  }

  corrupt() {
    this.corrupted = true;
  }
  isCorrupted() {
    return this.corrupted;
  }
}

class MemGrid extends Grid<MemCoord> {
  constructor(points: MemCoord[][]) {
    super(points);
  }
  addMemCorruption(coord: Coordinate) {
    this.getByCoordinate(coord).corrupt();
  }
  toString() {
    const str = this.map((v) => v.isCorrupted() ? '#' : '.').map(l => l.join('')).join('\n');
    return str;
  }

  print() {
    console.log(this.toString());
    console.log('\n');
  }
  printPath(path: string[]) {
    const str = this.map((v) => v.isCorrupted() ? '#' : path.includes(v.hash()) ? 'O' : '.').map(l => l.join('')).join('\n');
    console.log(str);
    console.log('\n');
  }
}



const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const searchFromByteNo = 1024;
  const gridSize = 70;
  const finishingPointId = `${gridSize},${gridSize}`;


  const coords = dataStr.split('\n').map(line => line.split(',').map(v => +v)).map(([x, y]) => new Coordinate(y, x));
  const solveP1 = () => {

    const memCoords = new Array(gridSize + 1).fill(true).map((_, i) => new Array(gridSize + 1).fill(true).map((_, j) => new MemCoord(i, j)));
    const memGrid = new MemGrid(memCoords);

    coords.forEach((c, i) => i < searchFromByteNo ? memGrid.addMemCorruption(c) : null);

    memGrid.print();

    const nodes = memGrid.flatMap(v => {
      const edges = v.getAllNeighours().filter(c => memGrid.isCoordinateInGrid(c)).map(c => memGrid.getByCoordinate(c)).filter(v => !v.isCorrupted()).map(nonCorruptedPoint => new Edge(v.hash(), nonCorruptedPoint.hash()));
      return new Node(v.hash(), edges, false);
    });
    const graph = new Graph(nodes);
    console.log(graph);
    let i = 0;
    const paths = graph.findPathsBFS(['0,0'], (pred) => {
      if (i % 100 === 0) {
        console.log(pred)
        memGrid.printPath(pred);
      }
      return pred[pred.length - 1] === finishingPointId;
    });
    console.log(paths[0]);
    console.log({ pathLenghtP1: paths[0].length - 1 });
    // memGrid.printPath(paths[0]);

  }

  const solveP2 = () => {

    for (let i = searchFromByteNo; i < coords.length; i++) {

      const memCoords2 = new Array(gridSize + 1).fill(true).map((_, i) => new Array(gridSize + 1).fill(true).map((_, j) => new MemCoord(i, j)));
      const memGrid2 = new MemGrid(memCoords2);
      coords.forEach((c, j) => j < i ? memGrid2.addMemCorruption(c) : null);

      memGrid2.print();

      const nodesP2 = memGrid2.flatMap(v => {
        const edges = v.getAllNeighours().filter(c => memGrid2.isCoordinateInGrid(c)).map(c => memGrid2.getByCoordinate(c)).filter(v => !v.isCorrupted()).map(nonCorruptedPoint => new Edge(v.hash(), nonCorruptedPoint.hash()));
        return new Node(v.hash(), edges, false);
      });
      const graph = new Graph(nodesP2);

      if (!graph.areNodesConnected('0,0', finishingPointId)) {
        console.log({ breakingPoint: coords[i -1] });
        break;
      }

    }

  }

  solveP1();
  solveP2();

};

main();
