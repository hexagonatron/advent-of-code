export class Node<T extends Edge> {
    id: string;
    edges: T[];
    visited: boolean;

    constructor(
        id: string,
        edges: T[],
        visited: boolean,
    ) {
        this.id = id;
        this.edges = edges;
        this.visited = visited;
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

export class Graph<EdgeType extends Edge, NodeType extends Node<EdgeType>>{
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

export class WeightedGraph<EdgeType extends WeightedEdge, NodeType extends Node<EdgeType>> extends Graph<EdgeType, NodeType> {
    constructor(nodes: NodeType[]) {
        super(nodes);
    }


}