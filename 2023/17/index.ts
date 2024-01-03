import { Edge, Node, WeightedEdge } from "../../utils/graphUtils";
import {
  Coordinate,
  CoordinateDirection,
  Direction,
  readFile,
  sleep,
} from "../../utils/utils";
import path from "path";

const ALL_DIRECTIONS: Direction[] = ["Down", "Up", "Left", "Right"];
const OPPOSITE_DIRECTION_MAP: { [key in Direction]: Direction } = {
  Down: "Up",
  Up: "Down",
  Right: "Left",
  Left: "Right",
};

class Path {
  totalHeatLoss: number;
  path: CoordinateDirection[] = [];
  avgLossPerStep: number;

  constructor(path: CoordinateDirection[], heatLoss: number) {
    this.path = path;
    this.totalHeatLoss = heatLoss;
    this.avgLossPerStep = 0;
  }

  public getLastThreeDirections(): Direction[] {
    return this.path.slice(-3).map((cd) => cd.direction);
  }

  public getLastDirection(): Direction | null {
    return this.path.slice(-1).pop()?.direction || null;
  }

  public lastThreeSame(): boolean {
    const last3 = this.getLastThreeDirections();
    return last3.length === 3 && [...new Set(last3)].length === 1;
  }

  public getCurrentPos(): Coordinate {
    const currentPos = this.path.slice(-1)[0];
    if (!currentPos) {
      return new Coordinate(0, 0);
    }
    return currentPos;
  }

  public copyThenAddPoint(newPoint: CoordinateDirection, heatLoss: number) {
    const copy = this.copy();
    copy.addCoord(newPoint, heatLoss);
    return copy;
  }

  private copy(): Path {
    return new Path(
      this.path.map((cd) => cd.copy()),
      this.totalHeatLoss
    );
  }

  public addCoord(point: CoordinateDirection, heatloss: number) {
    this.path.push(point);
    this.totalHeatLoss += heatloss;
    // this.recalculateAvgHeatLoss();
  }

  public print(board: Cell[][]) {
    const bgRedSeq = "\x1b[41m";
    const resetSeq = "\x1b[0m";
    const boardHeatMaps = board.map((line) =>
      line.map((cell) => cell.heatLoss.toString())
    );
    const directionMap: { [key in Direction]: string } = {
      Down: "v",
      Left: "<",
      Right: ">",
      Up: "^",
    };
    this.path.forEach((cd) => {
      boardHeatMaps[cd.i][cd.j] =
        bgRedSeq + directionMap[cd.direction] + resetSeq;
    });
    const boardStr = boardHeatMaps.map((line) => line.join("")).join("\n");
    console.log(boardStr);
    console.log(`HeatLoss: ${this.totalHeatLoss}`);
  }

  public hasVisited(coordinate: Coordinate) {
    return this.path.some(
      (cd) => cd.i === coordinate.i && cd.j === coordinate.j
    );
  }

  private recalculateAvgHeatLoss() {
    if (this.path.length === 0) {
      this.avgLossPerStep = 0;
      return;
    }
    this.avgLossPerStep = this.totalHeatLoss / this.path.length;
  }
}

class Cell {
  coordinate: Coordinate;
  heatLoss: number;
  minVisitedTotalMap: { [key in Direction]: number } = {
    Down: 999999999,
    Up: 999999999,
    Left: 999999999,
    Right: 999999999,
  };

  constructor(i: number, j: number, heatLoss: number) {
    this.coordinate = new Coordinate(i, j);
    this.heatLoss = heatLoss;
  }

  public visit(path: Path, from: Direction): Path | null {
    // if (path.hasVisited(this.coordinate)) {
    //   return null;
    // }
    // if (path.lastThreeSame())
    const currentMinHeatLossForEntry = this.minVisitedTotalMap[from];
    // if ((currentMinHeatLossForEntry + 1)  < path.totalHeatLoss) {
    //   // Already been here from the same entrance with a lesser headloss, so abort.
    //   return null;
    // }

    this.minVisitedTotalMap[from] = path.totalHeatLoss;

    const newPath = path.copyThenAddPoint(
      new CoordinateDirection(this.coordinate.i, this.coordinate.j, from),
      this.heatLoss
    );

    return newPath;
  }

  public getNeighbouringCoords(): CoordinateDirection[] {
    return ALL_DIRECTIONS.map((d) => {
      const coordinate = this.coordinate.getNeighbour(d);
      return new CoordinateDirection(coordinate.i, coordinate.j, d);
    });
  }
}

class HeatLossNode extends Node<HeatLossEdge> {
  position: Coordinate;
  entryDirection: Direction | null;
  stepsSinceLastTurn: number;
  shortestDistance: number;
  shortestPath: Path | null;
  edgeHash: string;
  path: string[] = [];

  constructor(
    id: string,
    edges: HeatLossEdge[],
    visited: boolean,
    position: Coordinate,
    shortestDistance: number,
    shortestPath: Path | null,
    entryDirection: Direction | null,
    stepsSinceLastTurn: number,
    nodeEdgeHash: string,
  ) {
    super(id, edges, visited);
    this.position = position;
    this.shortestDistance = shortestDistance;
    this.shortestPath = shortestPath;
    this.entryDirection = entryDirection;
    this.stepsSinceLastTurn = stepsSinceLastTurn;
    this.edgeHash = nodeEdgeHash;
  }

  public print() {
    console.log(`ID: ${this.id}`)
    console.log('Edges:')
    this.edges.forEach(e => console.log(`\t${e.hash()}`))
    console.log('');
  }

  public setCurrentShortestDistance(distance: number) {
    this.shortestDistance = distance;
  }
}

class HeatLossEdge extends WeightedEdge {
  public hash() {
    return `To: ${this.toNodeId}`
  }
}

type HeatLossNodeMap = { [key: string]: HeatLossNode };

class Board {
  grid: Cell[][];
  finishedPaths: Path[] = [];

  constructor(grid: Cell[][]) {
    this.grid = grid;
  }

  private createNodesP1(): { [key: string]: HeatLossNode } {
    const nodeMap: { [key: string]: HeatLossNode } = {};
    const origin = new Coordinate(0, 0);
    const originValidNeighbours = origin.getAllNeighours().filter(c => this.isCoordinateInGrid(c));
    const originNodeEdges = originValidNeighbours.map(c => {
      const toNodeidStr = `${c.direction}-${c.hash()}-1`;
      const toNodeWeight = this.getCell(c).heatLoss;
      return new HeatLossEdge("start", toNodeidStr, toNodeWeight);
    });

    const startingNode = new HeatLossNode("start", originNodeEdges, false, origin, 0, new Path([], 0), null, 0, '');
    nodeMap[startingNode.id] = startingNode;

    for (const line of this.grid) {
      for (const cell of line) {
        const cellCoordinate = cell.coordinate;
        const inboundsCellNeighbours = cellCoordinate.getAllNeighours().filter((c) => this.isCoordinateInGrid(c));
        const possibleEntryDirections = inboundsCellNeighbours.map(c => OPPOSITE_DIRECTION_MAP[c.direction]);
        possibleEntryDirections.forEach(entryDirection => {
          [1, 2, 3].forEach(timeSinceTurn => {
            let possibleExitCoordinates = inboundsCellNeighbours.filter(coordinate => {
              if (timeSinceTurn === 3 && coordinate.direction === entryDirection) {
                return false;
              }
              return entryDirection !== OPPOSITE_DIRECTION_MAP[coordinate.direction];
            });
            const idStr = `${entryDirection}-${cellCoordinate.hash()}-${timeSinceTurn}`;
            const nodeEdges = possibleExitCoordinates.map(exitCoordinate => {
              const exitCoordinateHeatloss = this.getCell(exitCoordinate).heatLoss;
              const newTimeSinceLastTurn = entryDirection === exitCoordinate.direction ? timeSinceTurn + 1 : 1;
              const toNodeidStr = `${exitCoordinate.direction}-${exitCoordinate.hash()}-${newTimeSinceLastTurn}`;
              return new HeatLossEdge(idStr, toNodeidStr, exitCoordinateHeatloss);
            });
            const nodeEdgeHash = nodeEdges.map(e => e.toNodeId).sort().join(',');
            const node = new HeatLossNode(idStr, nodeEdges, false, cellCoordinate, 9999999, null, entryDirection, timeSinceTurn, nodeEdgeHash);
            nodeMap[node.id] = node;
          });
        });
      }
    }
    console.log("Finished creating nodes");
    return nodeMap;
  }

  private getNodeId(entryDirection: Direction[], position: Coordinate, timeSinceTurn: number) {
    return `${entryDirection.sort().join(',')}-${position.hash()}-${timeSinceTurn}`;
  }

  /**
   * It needs to move a minimum of four blocks in that direction before it can turn (or even before it can stop at the end). 
   * an ultra crucible can move a maximum of ten consecutive blocks without turning.
   */
  private createNodesP2(): HeatLossNodeMap {
    const nodeMap: HeatLossNodeMap = {}

    const originCoord = new Coordinate(0, 0);

    const possibleFirstMoves = ALL_DIRECTIONS
      .map(d => ({ coordArr: originCoord.getCoordinatesPassedThrough(d, 4), direction: d }))
      .filter(a => this.isCoordinateInGrid(a.coordArr[a.coordArr.length - 1]));

    const startEdges = possibleFirstMoves.map(a => {
      const totalHeatloss = a.coordArr.map(c => this.getCell(c).heatLoss).reduce((total, hl) => total + hl, 0);
      const toNodeId = this.getNodeId([a.direction], a.coordArr[a.coordArr.length - 1], 4);

      return new HeatLossEdge('start', toNodeId, totalHeatloss);
    })

    const startNode = new HeatLossNode("start", startEdges, false, originCoord, 0, null, null, 0, '');

    nodeMap[startNode.id] = startNode;

    return nodeMap;
  }

  private getEdgesForNodeId(id: string) {
  }

  private createNodeFromId(id: string) {

    const perpendicularDirectionMap: { [key in Direction]: Direction[] } = {
      "Down": ["Left", "Right"],
      "Up": ["Left", "Right"],
      "Left": ["Down", "Up"],
      "Right": ["Down", "Up"],
    }

    const parralellDirMap: { [key in Direction]: Direction[] } = {
      "Down": ["Down", "Up"],
      "Up": ["Down", "Up"],
      "Left": ["Left", "Right"],
      "Right": ["Left", "Right"],
    }


    const [directionsStr, coordinatesStr, timeSinceTurnStr] = id.split('-');
    const directionArr = directionsStr.split(',') as Direction[]
    const [i, j] = coordinatesStr.split(',').map(n => +n);
    const coordinate = new Coordinate(i, j);
    const timeSinceTurn = +timeSinceTurnStr;

    const edges: HeatLossEdge[] = [];

    const singleDirection = directionArr.pop();
    if (!singleDirection) {
      throw "Couldn't create node. No direction.";
    }

    if (timeSinceTurn === 10) {
      perpendicularDirectionMap[singleDirection].forEach(d => {
        const allPointsArr = coordinate.getCoordinatesPassedThrough(d, 4);
        if (this.isCoordinateInGrid(allPointsArr[allPointsArr.length - 1])) {
          const totalHeatloss = allPointsArr.map(c => this.getCell(c).heatLoss).reduce((total, hl) => total + hl, 0);

          const toNodeId = this.getNodeId([d], allPointsArr[allPointsArr.length - 1], 4);
          const edge = new HeatLossEdge(id, toNodeId, totalHeatloss);
          edges.push(edge);
        }
      });
    }
    // else if (timeSinceTurn === 9) {
    //   const tenCoordinate = coordinate.getCoordinateFromVector(singleDirection, 1);
    //   if (this.isCoordinateInGrid(tenCoordinate)) {
    //     const toNodeId = this.getNodeId(parralellDirMap[singleDirection], tenCoordinate, 10);
    //   }
    //   const otherDirections = perpendicularDirectionMap[singleDirection].map(d => ({ d, coordinateArr: coordinate.getCoordinatesPassedThrough(d, 4) })).filter(({ coordinateArr }) => this.isCoordinateInGrid(coordinateArr[coordinateArr.length - 1]));

    //   otherDirections.forEach(({ d, coordinateArr }) => {
    //     const toNodeId = this.getNodeId([d], coordinate, 4);
    //     const heatLoss = coordinateArr.map(c => this.getCell(c).heatLoss).reduce((a, v) => a + v, 0);
    //     const edge = new HeatLossEdge(id, toNodeId, heatLoss);
    //     edges.push(edge);
    //   });
    // }
    else {
      ALL_DIRECTIONS.filter(d => d !== OPPOSITE_DIRECTION_MAP[singleDirection]).forEach(d => {
        if (d === singleDirection) {
          // Going the same way
          const coordinateSameDir = coordinate.getCoordinateFromVector(d, 1);
          if (this.isCoordinateInGrid(coordinateSameDir)) {
            const toNodeId = this.getNodeId([d], coordinateSameDir, timeSinceTurn + 1);
            const heatLoss = this.getCell(coordinateSameDir).heatLoss;
            const edge = new HeatLossEdge(id, toNodeId, heatLoss);
            edges.push(edge);
          }
        } else {
          // Making a turn
          const path = coordinate.getCoordinatesPassedThrough(d, 4);
          if (this.isCoordinateInGrid(path[path.length - 1])) {
            const toNodeId = this.getNodeId([d], path[path.length - 1], 4);
            const heatLoss = path.map(c => this.getCell(c).heatLoss).reduce((t, v) => t + v, 0);
            const edge = new HeatLossEdge(id, toNodeId, heatLoss);
            edges.push(edge);
          }
        }

      });
    }

    const node = new HeatLossNode(id, edges, false, coordinate, 9999999, null, null, timeSinceTurn, '');
    return node;
  }

  public findShortestDijkstraP2() {
    const nodeMap = this.createNodesP2();

    const unvisited = Object.values(nodeMap).sort((a, b) => a.shortestDistance - b.shortestDistance);

    const finishingCoord = new Coordinate(
      this.grid.length - 1,
      this.grid[0].length - 1
    );

    let count = 0;
    let currentHeatloss = 0;

    let foundSol = false

    while (!foundSol) {
      const shortestUnvisited = unvisited.sort((a, b) => a.shortestDistance - b.shortestDistance).shift();

      if (!shortestUnvisited) {
        throw "No Shortest";
      }
      if (shortestUnvisited.position.isEqual(finishingCoord)) {
        console.log("done");
        // console.log(nodeMap);
        console.log(shortestUnvisited.path);
        console.log(shortestUnvisited.shortestDistance);
        break;
      }

      for (const edge of shortestUnvisited.edges) {
        const totalDistanceToNode =
          shortestUnvisited.shortestDistance + edge.weight;
        let toNode = nodeMap[edge.toNodeId];
        if (toNode === undefined) {
          toNode = this.createNodeFromId(edge.toNodeId);
          nodeMap[toNode.id] = toNode;
          unvisited.unshift(toNode);
        }
        if (totalDistanceToNode < toNode.shortestDistance) {
          toNode.setCurrentShortestDistance(shortestUnvisited.shortestDistance + edge.weight);
          toNode.path = [...shortestUnvisited.path, toNode.id];
        }
      }
      if (shortestUnvisited.shortestDistance > currentHeatloss) {
        currentHeatloss = shortestUnvisited.shortestDistance;
        console.log({ count, heatloss: shortestUnvisited.shortestDistance });
      }
      count++;
      shortestUnvisited.visited = true;
    }
  }

  public findShortestDijkstra(part: 1 | 2 = 2) {

    let nodeMap: HeatLossNodeMap =
      part === 1 ? this.createNodesP1() : this.createNodesP2();

    const nodeArr = Object.values(nodeMap);
    // nodeArr.forEach(n => n.print());
    console.log(`Nodes: ${nodeArr.length}`);

    // Seeing if there are any duplicated nodes
    // let i1 = 0;
    // let dupCount = 0;
    // while (i1 < nodeArr.length - 2) {
    //   let j1 = i1 + 1;
    //   const node = nodeArr[i1];
    //   while(j1 < nodeArr.length -1) {
    //     const node2 = nodeArr[j1];
    //     if (node.edgeHash === node2.edgeHash) {
    //       // console.log(`Identical exits found for ${node.id} and ${node2.id}`);
    //       dupCount++;
    //     }
    //     j1++;
    //   }
    //   i1++;
    // }
    // console.log({dupCount});

    let count = 1;
    let currentMin = 0;

    const finishingCoord = new Coordinate(
      this.grid.length - 1,
      this.grid[0].length - 1
    );

    const unvisited = Object.values(nodeMap).sort((a, b) => a.shortestDistance - b.shortestDistance);

    while (this.finishedPaths.length === 0) {
      const shortestUnvisited = unvisited.sort((a, b) => a.shortestDistance - b.shortestDistance).shift();

      if (!shortestUnvisited) {
        throw "No Shortest";
      }
      if (shortestUnvisited.position.isEqual(finishingCoord)) {
        console.log("done");
        console.log(shortestUnvisited.shortestDistance);
        break;
      }
      const currentMinPath = shortestUnvisited.shortestPath;
      if (!currentMinPath) {
        throw "No path on node";
      }
      for (const edge of shortestUnvisited.edges) {
        const totalDistanceToNode =
          shortestUnvisited.shortestDistance + edge.weight;
        const toNode = nodeMap[edge.toNodeId];
        if (totalDistanceToNode < toNode.shortestDistance) {
          toNode.setCurrentShortestDistance(shortestUnvisited.shortestDistance + edge.weight);
          if (!toNode.entryDirection) {
            throw "To Node has no entry direction"
          }
          const cd = new CoordinateDirection(toNode.position.i, toNode.position.j, toNode.entryDirection);
          const newShortestPath = this.visit(cd, currentMinPath);
          if (!newShortestPath) {
            throw "Couldn't visit node";
          }
          toNode.shortestPath = newShortestPath;
        }
      }
      if (shortestUnvisited.shortestDistance > currentMin) {
        currentMin = shortestUnvisited.shortestDistance;
        console.log({ count, heatloss: shortestUnvisited.shortestDistance });
      }
      count++;
      shortestUnvisited.visited = true;
    }
    // // const startingCoordinate = new Coordinate(0,0);
    // // const startingNode = new Node(startingCoordinate.hash(), [], startingCoordinate);
    // // let unvisited:{[key: string]: Node} = {
    // // }
    // // const running: {
    // //   [key: string]: {
    // //     paths: Path[];
    // //     heatLoss: number;
    // //   };
    // // } = {};
    // // const nextCoordinates = this.getNextValidCoordinates(new Coordinate(0, 0));
    // // unvisited.forEach((c) => {
    // //   running[c.hash()] = { heatLoss: 9999999, paths: [] };
    // // });
    // // running[new Coordinate(0, 0).hash()] = {
    // //   heatLoss: 0,
    // //   paths: [new Path([], 0)],
    // // };
    // // while (this.finishedPaths.length === 0) {
    // //   const shortestUnvisited = unvisited
    // //     .sort((a, b) => running[a.hash()].heatLoss - running[b.hash()].heatLoss)
    // //     .shift();
    // //   if (!shortestUnvisited) {
    // //     throw "No Shortest";
    // //   }
    // //   let paths = running[shortestUnvisited.hash()].paths;
    // //   if (paths.length === 0) {
    // //     throw "Unvisited node without no paths";
    // //   }
    // //   paths.forEach((p) => {
    // //     const nextPossibleCoords = this.getNextValidCoordinates(
    // //       shortestUnvisited,
    // //       p
    // //     );
    // //     nextPossibleCoords.forEach((coord) => {
    // //       if (!path) {
    // //         throw "Unvisited node without a Path forEach";
    // //       }
    // //       const newPath = this.visit(coord, p);
    // //       if (!newPath) return;
    // //       const currentMin = running[coord.hash()].heatLoss;
    // //       if (newPath.totalHeatLoss < currentMin) {
    // //         running[coord.hash()] = {
    // //           heatLoss: newPath.totalHeatLoss,
    // //           paths: [newPath],
    // //         };
    // //       } else if (newPath.totalHeatLoss === currentMin) {
    // //         const oldPaths = running[coord.hash()].paths;
    // //         running[coord.hash()] = {
    // //           heatLoss: newPath.totalHeatLoss,
    // //           paths: [...oldPaths, newPath],
    // //         };
    // //       }
    // //       newPath.print(this.grid);
    // //     });
    // //   });
    // // }
  }

  private getCell(coordinate: Coordinate): Cell {
    return this.grid[coordinate.i][coordinate.j];
  }

  private visit(coord: CoordinateDirection, path: Path): Path | null {
    const cellToVisit = this.getCell(coord);
    const maybePath = cellToVisit.visit(path, coord.direction);
    if (!maybePath) {
      return null;
    }
    const pathPos = path.getCurrentPos();
    if (!pathPos) {
      return maybePath;
    }
    if (this.isAtFinish(pathPos)) {
      this.finishedPaths.push(path);
      console.log({ total: path.totalHeatLoss });
      path.print(this.grid);
      return null;
    }
    return maybePath;
  }

  private isAtFinish(coordinate: Coordinate) {
    return (
      coordinate.i === this.grid.length - 1 &&
      coordinate.j === this.grid[this.grid.length - 1].length - 1
    );
  }

  public print() {
    const str = this.grid
      .map((line) => line.map((cell) => cell.heatLoss).join(""))
      .join("\n");
    console.log(str);
    console.log("");
  }

  private getNextValidCoordinates(
    coordinate: Coordinate,
    path?: Path
  ): CoordinateDirection[] {
    const allNeighbourCoords = this.getCell(coordinate).getNeighbouringCoords();
    const inBoundsNeighbours = allNeighbourCoords.filter(
      (coord) =>
        coord.i >= 0 &&
        coord.i < this.grid.length &&
        coord.j >= 0 &&
        coord.j < this.grid[0].length
    );

    if (!path) {
      return inBoundsNeighbours;
    }

    const lastPathDirection = path.getLastDirection();
    if (!lastPathDirection) {
      return inBoundsNeighbours;
    }

    const reverseDir = OPPOSITE_DIRECTION_MAP[lastPathDirection];
    const inBoundsNoBackwards = inBoundsNeighbours.filter(
      (cd) => cd.direction !== reverseDir
    );
    if (!path.lastThreeSame()) {
      return inBoundsNoBackwards;
    }
    return inBoundsNoBackwards.filter(
      (cd) => cd.direction !== path.getLastDirection()
    );
  }
  private getNextValidCoordinates2(path: Path) {
    const currentPathPos = path.getCurrentPos();
    const currentCell = this.getCell(currentPathPos);
    const allNeighbourCoords = currentCell.getNeighbouringCoords();
    const inBoundsNeighbours = allNeighbourCoords.filter((c) =>
      this.isCoordinateInGrid(c)
    );
    const lastPathDirection = path.getLastDirection();
    if (!lastPathDirection) {
      return inBoundsNeighbours;
    }

    const reverseDir = OPPOSITE_DIRECTION_MAP[lastPathDirection];
    const inBoundsNoBackwards = inBoundsNeighbours.filter(
      (cd) => cd.direction !== reverseDir
    );
    if (!path.lastThreeSame()) {
      return inBoundsNoBackwards;
    }
    return inBoundsNoBackwards.filter(
      (cd) => cd.direction !== path.getLastDirection()
    );
  }

  private isCoordinateInGrid(coordinate: Coordinate) {
    return (
      coordinate.i >= 0 &&
      coordinate.i < this.grid.length &&
      coordinate.j >= 0 &&
      coordinate.j < this.grid[0].length
    );
  }

}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const cells = dataStr
    .split("\n")
    .map((line, i) =>
      line.split("").map((cellStr, j) => new Cell(i, j, +cellStr))
    );

  const board = new Board(cells);

  board.print();

  const before = Date.now();
  // board.findOptimal();
  board.findShortestDijkstraP2();
  // board.findOptimalWithNodes();
  const after = Date.now();
  const secondsToCompute = (after - before) / 1000;
  console.log({ secondsToCompute })
};

main();
