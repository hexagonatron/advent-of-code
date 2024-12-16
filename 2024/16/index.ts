import { Edge, Graph, Node, WeightedEdge, WeightedGraph } from "../../utils/graphUtils";
import {
  ALL_DIRECTIONS,
  Coordinate,
  CoordinateDirection,
  Direction,
  Grid,
  readFile,
  splitToGrid,
} from "../../utils/utils";
import path from "path";

const turnCost = 1000;
const moveCost = 1;


const getAllowedRotationDirections = (inputDirection: Direction): Direction[] => {
  if (inputDirection === 'Down' || inputDirection === 'Up') {
    return ['Left', 'Right'];
  }
  return ['Up', 'Down'];
}
const getNodeId = (coordDir: CoordinateDirection): string => {
  return coordDir.hash() + '-' + coordDir.direction[0];
}

type MazeValue = '.' | '#' | 'S' | 'E';
type MazeCell = '.' | '#';

const isMazeInput = (value: string): value is MazeValue => {
  return value === '.'
    || value === '#'
    || value === 'S'
    || value === 'E';
}
class MazeCoord extends Coordinate {
  value: MazeCell;
  validNeighbours: CoordinateDirection[];
  isStart: boolean;
  isEnd: boolean;

  constructor(i: number, j: number, value: MazeValue) {
    super(i, j);
    this.value = value === '#' ? '#' : '.';
    this.validNeighbours = [];
    this.isEnd = value === 'E';
    this.isStart = value === 'S';
  }
  isWall() {
    return this.value === '#';
  }
  getNodeId(direction: Direction): string {
    return getNodeId(new CoordinateDirection(this.i, this.j, direction));
  }
  getMazeNeighbour(direction: Direction): CoordinateDirection | null {
    return this.validNeighbours.find(v => v.direction === direction) || null;
  }
}

class Maze extends Grid<MazeCoord> {
  startPosition: MazeCoord;
  endPosition: MazeCoord;
  constructor(points: MazeCoord[][]) {
    super(points);
    let start: MazeCoord | null = null;
    let end: MazeCoord | null = null;
    points.forEach(line => line.forEach(point => {
      if (point.isEnd) {
        end = point;
      }
      if (point.isStart) {
        start = point;
      }
    }));
    if (start === null || end === null) {
      throw "No start or end";
    }
    this.startPosition = start;
    this.endPosition = end;
    this.addValidNeighbours();
  }
  private addValidNeighbours() {
    this.map(v => {
      if (v.isWall()) {
        return;
      }
      const validNeighbours = v.getAllNeighours()
        .filter(cd => this.isCoordinateInGrid(cd))
        .map(cd => ({ mazeCell: this.getByCoordinate(cd), cd: cd }))
        .filter(({ mazeCell }) => !mazeCell.isWall()).map(v => v.cd);
      v.validNeighbours = validNeighbours;
    });
  }
  printPath(path: string[]) {
    const reversed = path.reverse();
    const strRes = this.map((v) => {
      const foundId = reversed.find((id) => id.startsWith(v.hash() + '-'));
      if (foundId) {
        if (foundId.endsWith('U')) {
          return 'o';
        } else if (foundId.endsWith('D')) {
          return "o"
        } else if (foundId.endsWith('L')) {
          return 'o'
        } else if (foundId.endsWith('R')) {
          return 'o'
        }
      }
      if (v.value === '.') {
        return ' '
      }
      return v.value;
    }).map(line => line.join('')).join('\n');
    console.log(strRes);
    console.log('');
  }
}

class MazeEdge extends WeightedEdge {
  constructor(fromNode: string, toNode: string, weight: number) {
    super(fromNode, toNode, weight);
  }
}

class MazeNode extends Node<MazeEdge> {
  constructor(id: string, edges: MazeEdge[]) {
    super(id, edges, false);
  }
}

class MazeGraph extends WeightedGraph<MazeEdge, MazeNode> {
  constructor(nodes: MazeNode[]) {
    super(nodes);
  }

}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));
  const points = splitToGrid(dataStr, (i, j, value) => {
    if (!isMazeInput(value)) {
      throw `InvalidValue: ${value}`
    }
    return new MazeCoord(i, j, value);
  });
  const maze = new Maze(points);
  const nodes: MazeNode[] = [];
  maze.map(cell => {
    if (cell.isWall()) {
      return;
    }
    ALL_DIRECTIONS.map(direction => {
      const edges: MazeEdge[] = [];
      const cellNeighbour: CoordinateDirection | null = cell.getMazeNeighbour(direction);
      if (cellNeighbour != null) {
        edges.push(new MazeEdge(cell.getNodeId(direction), getNodeId(cellNeighbour), moveCost));
      }
      getAllowedRotationDirections(direction).forEach(turnDirection => {
        edges.push(new MazeEdge(cell.getNodeId(direction), cell.getNodeId(turnDirection), turnCost));
      });
      edges.sort((a, b) => a.weight - b.weight);
      console.log(edges);
      nodes.push(new MazeNode(cell.getNodeId(direction), edges));
    });
  });
  const graph = new MazeGraph(nodes);
  const startingNode = maze.startPosition.getNodeId('Right');
  const allFinishingNodeIds = ALL_DIRECTIONS.map(direction => maze.endPosition.getNodeId(direction));

  const hasVisited = (currentPath: string[], proposedNodeId: string) => {
    const nodeIdsSansD = currentPath.map(nodeId => nodeId.substring(0, nodeId.length - 2));
    const proposedNodeIdSansD = proposedNodeId.substring(0, proposedNodeId.length - 2);
    let result = false;
    if (currentPath.includes(proposedNodeId)) {
      result = true;
    } else if (nodeIdsSansD[nodeIdsSansD.length - 1] === proposedNodeIdSansD) {
      result = false;
    } else {
      result = nodeIdsSansD.includes(proposedNodeIdSansD)
    }
    // console.log({ result, nodeIdsSansD, proposedNodeIdSansD, currentPath, proposedNodeId });
    return result;
  }

  const shortestPaths = graph.findShortestPathDijkstra(startingNode, allFinishingNodeIds, hasVisited, true, maze.printPath.bind(maze));
  console.log(shortestPaths[0]);
  shortestPaths.map(path => {
    console.log(path.total)
    maze.printPath(path.path)
  });
  console.log(shortestPaths.length);
  const stringSet = new Set<string>();
  shortestPaths.map(path => path.path.map(hash => stringSet.add(hash.substring(0, hash.length -2))));
  console.log(stringSet.size);

  console.log([...stringSet]);
};

main();
