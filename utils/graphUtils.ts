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
}

export class WeightedGraph<EdgeType extends WeightedEdge, NodeType extends Node<EdgeType>> extends Graph<EdgeType, NodeType> {
    constructor(nodes: NodeType[]) {
        super(nodes);
    }


}