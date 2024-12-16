export class Node<T extends Edge> {
  id: string;
  edges: T[];
  visited: boolean;
  smallestPathTotal: number;

  constructor(
    id: string,
    edges: T[],
    visited: boolean,
  ) {
    this.id = id;
    this.edges = edges;
    this.visited = visited;
    this.smallestPathTotal = Number.MAX_SAFE_INTEGER;
  }
}

export class Edge {

  fromNodeId: string;
  toNodeId: string;

  constructor(fromNodeId: string, toNodeId: string) {
    this.fromNodeId = fromNodeId;
    this.toNodeId = toNodeId;
  }
}
export class WeightedEdge extends Edge {
  weight: number;
  constructor(fromNodeId: string, toNodeId: string, weight: number) {
    super(fromNodeId, toNodeId);
    this.weight = weight;
  }
}

type PathSolvedPredicate = (path: string[]) => boolean

export class Graph<EdgeType extends Edge, NodeType extends Node<EdgeType>> {
  nodes: NodeType[];
  nodeMap: {
    [key: string]: NodeType;
  } = {};

  constructor(nodes: NodeType[]) {
    this.nodes = nodes;
    nodes.forEach((n) => {
      this.nodeMap[n.id] = n;
    });
  }
  public getNode(nodeId: string): NodeType {
    const node = this.nodeMap[nodeId];
    if (!node) {
      throw `Node not found, id: ${nodeId}`;
    }
    return node;
  }

  public findPathsBFS(startingNodes: string[], pathIsSolved: PathSolvedPredicate): string[][] {

    const solvedPaths: string[][] = [];

    for (let i = 0; i < startingNodes.length; i++) {
      const workingNode = this.nodeMap[startingNodes[i]];
      if (!workingNode) {
        throw 'Node not found';
      }
      workingNode.visited = true;
      let workingPaths: string[][] = [[workingNode.id]];

      while (workingPaths.length > 0) {
        const nextPaths: string[][] = [];
        const workingPath = workingPaths.pop();
        if (!workingPath || workingPath.length === 0) {
          throw "Invalid Path";
        }

        if (pathIsSolved.bind(this)(workingPath)) {
          solvedPaths.push(workingPath);
          continue;
        }
        const lastNode = this.nodeMap[workingPath[workingPath.length - 1]];
        if (lastNode.edges.length) {
          lastNode.edges.forEach(edge => {
            nextPaths.push([...workingPath, edge.toNodeId]);
          });
        }
        workingPaths = [...nextPaths, ...workingPaths];
      }

    }
    return solvedPaths;
  }

}

class PathWithTotal {
  path: string[];
  total: number;

  constructor(path: string[], total: number) {
    this.path = [...path];
    this.total = total;
  }

  copy(): PathWithTotal {
    return new PathWithTotal(this.path, this.total);
  }

  getCurrentNodeId(): string {
    return this.path[this.path.length - 1];
  }

  addNode(nodeId: string, weight: number) {
    this.path.push(nodeId);
    this.total += weight;
  }

  compare(otherPath: PathWithTotal): number {
    return this.total - otherPath.total;
  }

}

const DEBUG = true;

export class WeightedGraph<EdgeType extends WeightedEdge, NodeType extends Node<EdgeType>> extends Graph<EdgeType, NodeType> {
  constructor(nodes: NodeType[]) {
    super(nodes);
  }

  findShortestPathDijkstra(fromNodeId: string, toNodeIds: string[], hasVisited: (path: string[], nodeId: string) => boolean, findAllPaths = false, printFn?: (path: string[]) => void): PathWithTotal[] {

    const solvedPaths: PathWithTotal[] = []

    const initialPath: PathWithTotal = new PathWithTotal([fromNodeId], 0);
    let workingPath = initialPath;
    let allPathsOrdered: PathWithTotal[] = [workingPath];
    let i = 0;
    while (!toNodeIds.includes(workingPath.getCurrentNodeId()) || findAllPaths && allPathsOrdered.length) {
      i++;
      if (DEBUG) {
        if (i % 10_000 === 0) {
          console.log(i);
          if (printFn) {
            printFn(workingPath.path);
          }
        }
      }
      if (toNodeIds.includes(workingPath.getCurrentNodeId())) {
        const existingSolved = solvedPaths[0];
        if (existingSolved && existingSolved.total === workingPath.total || !existingSolved) {
          solvedPaths.push(workingPath);
        }
        const newWorkingPath = allPathsOrdered.shift();
        if (!newWorkingPath) {
          break;
        }
        workingPath = newWorkingPath;
      }
      const firstSolved = solvedPaths[0];
      if (firstSolved && firstSolved.total < workingPath.total) {
        const newWorkingPath = allPathsOrdered.shift();
        if (!newWorkingPath) {
          break;
        }
        workingPath = newWorkingPath;
        continue;
      }
      const currentNode = this.getNode(workingPath.getCurrentNodeId());
      const newPaths: PathWithTotal[] = [];
      currentNode.edges.filter(edge => !hasVisited(workingPath.path, edge.toNodeId)).filter(edge => {
        const toNode = this.getNode(edge.toNodeId);
        return toNode.smallestPathTotal >= (workingPath.total + edge.weight);
      }).forEach(edge => {
        const newPath = workingPath.copy();
        newPath.addNode(edge.toNodeId, edge.weight);
        const toNode = this.getNode(edge.toNodeId);
        if (newPath.total < toNode.smallestPathTotal) {
          toNode.smallestPathTotal = newPath.total;
        }
        newPaths.push(newPath);
      });
      allPathsOrdered = allPathsOrdered.concat(newPaths).sort((pathA, pathB) => pathA.compare(pathB));
      const newWorkingPath = allPathsOrdered.shift();
      if (!newWorkingPath) {
        break;
      }
      workingPath = newWorkingPath;
    }
    return solvedPaths;
  }

}