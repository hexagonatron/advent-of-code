import { PriorityQueue } from "./PriorityQueue";

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

  public findPathsBFS(startingNodes: string[], pathIsSolved: PathSolvedPredicate, returnFirstSolved = false): string[][] {

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
          if (returnFirstSolved) {
            return solvedPaths;
          }
          continue;
        }
        const lastNode = this.nodeMap[workingPath[workingPath.length - 1]];
        if (lastNode.edges.length) {
          lastNode.edges.forEach(edge => {
            const toNode = this.getNode(edge.toNodeId);
            if (!toNode.visited) {
              toNode.visited = true;
              nextPaths.push([...workingPath, edge.toNodeId]);
            }
          });
        }
        workingPaths = [...nextPaths, ...workingPaths];
      }

    }
    return solvedPaths;
  }

  public areNodesConnected(nodeId1: string, nodeId2: string) {
    const startNode = this.getNode(nodeId1);
    startNode.visited = true;
    const toDo: NodeType[] = [startNode];
    while (toDo.length > 0) {
      const node = toDo.shift();
      if (!node) {
        return false;
      }
      if (node.id === nodeId2) {
        return true;
      }
      node.visited = true;
      node.edges.map(edge => this.getNode(edge.toNodeId)).filter(node => !node.visited).forEach(node => {
        node.visited = true;
        toDo.push(node);
      });
    }
    return false;
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

  findShortestPathDijkstra(fromNodeId: string, toNodeIds: string[], findAllPaths = false, printFn?: (path: string[]) => void): PathWithTotal[] {

    const solvedPaths: PathWithTotal[] = []

    const initialPath: PathWithTotal = new PathWithTotal([fromNodeId], 0);
    let allPathsOrdered: PriorityQueue<PathWithTotal> = new PriorityQueue();
    allPathsOrdered.push(0, initialPath);
    let i = 0;
    let minimumSolved: number | null = null;
    while (allPathsOrdered.length > 0) {

      const workingPath = allPathsOrdered.pop();
      if (!workingPath) {
        break;
      }
      if (toNodeIds.includes(workingPath.getCurrentNodeId())) {
        if (minimumSolved === null) {
          minimumSolved = workingPath.total;
          solvedPaths.push(workingPath);
        } else if (workingPath.total === minimumSolved) {
          solvedPaths.push(workingPath);
        } else if (workingPath.total < minimumSolved) {
          throw `Solved ${workingPath.total} is less than minimum solved ${minimumSolved}`;
        }

        if (!findAllPaths) {
          return solvedPaths;
        }
        continue;
      }

      i++;
      if (DEBUG) {
        if (i % 10_000 === 0) {
          if (printFn) {
            printFn([...workingPath.path]);
          }
          console.log({
            iterations: i,
            queueLength: allPathsOrdered.length,
            currentTotal: workingPath.total,
          });
        }
      }

      const currentNode = this.getNode(workingPath.getCurrentNodeId());
      currentNode.visited = true;
      currentNode.edges.filter(edge => {
        const toNode = this.getNode(edge.toNodeId);
        return !toNode.visited && toNode.smallestPathTotal >= (workingPath.total + edge.weight)
      }).forEach(edge => {
        const newPath = workingPath.copy();
        newPath.addNode(edge.toNodeId, edge.weight);
        const toNode = this.getNode(edge.toNodeId);
        if (newPath.total < toNode.smallestPathTotal) {
          toNode.smallestPathTotal = newPath.total;
        }
        allPathsOrdered.push(newPath.total, newPath);
      });
    }
    return solvedPaths;
  }

}