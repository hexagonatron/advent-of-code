import { Edge, Node } from "../../utils/graphUtils";
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

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input1.txt"));

  const numGrid = dataStr.split('\n').map((line, i) => line.split('').map((v, j) => new HeightCoord(i, j, +v)));

  const nodeArr = iterateMultiDimensional(numGrid, (value, i, j): TopoNode => {
    const edges: Edge[] = value
    .getAllNeighours()
    .filter(coord => isCoordinateInBounds(numGrid, coord))
    .map(coord => numGrid[coord.i][coord.j])
    .filter(topoCoord => topoCoord.height === (value.height + 1))
    .map(coord => new Edge(value.hash(), coord.hash()));

    return new TopoNode(value.hash(), edges, false, value.height);
  })


};

main();
