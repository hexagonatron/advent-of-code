import { count } from "console";
import {
  Coordinate,
  iterateMultiDimensional,
  readFile,
} from "../../utils/utils";
import path from "path";

type Tile = '.' | 'S' | '#';
type VisitedTiled = { [key: string]: number[] };
class NodeCoordinate {
  coord: Coordinate;
  visited: boolean;
  tile: Tile;
  steps: number[] = [];
  visitedTiled: VisitedTiled = {};
  constructor(i: number, j: number, tile: Tile, visited: boolean) {
    this.coord = new Coordinate(i, j);
    this.visited = visited;
    this.tile = tile;
  }

  public visit(step: number) {
    this.visited = true;
    this.steps.push(step);
  }

  public visitedInTile(iTile: number, jTile: number) {
    const key = this.getKey(iTile, jTile);
    return this.visitedTiled[key] !== undefined && this.visitedTiled[key].length > 0;
  }

  public visitInTile(iTile: number, jTile: number, step: number) {
    const key = this.getKey(iTile, jTile);
    if (this.visitedTiled[key] === undefined) {
      this.visitedTiled[key] = [step];
      return;
    }
    this.visitedTiled[key].push(step);
  }

  private getKey(iTile: number, jTile: number) {
    const key = [iTile, jTile].join(',');
    return key;
  }

  public getVisitedCountTiled(even: boolean) {
    return Object.values(this.visitedTiled).reduce((acc, arr) => {
      if (even) {
        const res = arr.some(v => v % 2 === 0);
        return res ? acc + 1 : acc;
      } else if (!even) {
        const res = arr.some(v => v % 1 === 0);
        return res ? acc + 1 : acc;
      } else {
        throw 'Error';
      }
    }, 0);
  }
}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input1.txt"));
  let starting: Coordinate = new Coordinate(0, 0);
  const nodes = dataStr.split('\n').map((line, i) => line.split('').map((c, j) => {
    const node = new NodeCoordinate(i, j, c as Tile, false);
    return node;
  }));
  nodes.forEach(line => {
    line.forEach(n => {
      if (n.tile === 'S') {
        starting = n.coord;
      }
    })
  });


  if (starting === null) {
    throw 'No starting found';
  }

  const getNormalisedI = (i: number) => {
    const iMod = i >= 0
      ? i % nodes.length
      : nodes.length - (Math.abs(i + 1) % nodes.length) - 1;
    return iMod;
  }

  const getNormalisedJ = (j: number) => {
    const jMod = j >= 0
      ? j % nodes[0].length
      : nodes[0].length - (Math.abs(j + 1) % nodes[0].length) - 1;
    return jMod;
  }
  const getTiledI = (i: number) => {
    const iDiv = i / nodes.length;
    const iTiled = Math.floor(iDiv);
    return iTiled;
  }
  const getTiledJ = (j: number) => {
    const jDiv = j / nodes[0].length;
    const jTiled = Math.floor(jDiv);
    return jTiled;
  }
  const hash = (c: Coordinate) => {
    return `${c.i},${c.j}`;
  }
  const unHash = (c: string) => {
    const [i, j] = c.split(',').map(a => +a);
    return new Coordinate(i, j);
  }

  let startingCoordinate = hash(starting);
  let unvisited = [startingCoordinate];

  // for (let i = 0; i <= 26_501_365; i++) {
  for (let i = 0; i <= 5000; i++) {
    let nextUnvisited = new Set<string>();

    unvisited.forEach(unvisitedCoordinateStr => {
      const unvisitedCoordinate = unHash(unvisitedCoordinateStr);
      const iTiled = getTiledI(unvisitedCoordinate.i);
      const jTiled = getTiledJ(unvisitedCoordinate.j);
      const iMod = getNormalisedI(unvisitedCoordinate.i);
      const jMod = getNormalisedJ(unvisitedCoordinate.j);
      // console.log({
      //   i: unvisitedCoordinate.i,
      //   iTiled,
      //   iMod,
      //   j: unvisitedCoordinate.j,
      //   jTiled,
      //   jMod,
      // });

      const thisNode = nodes[iMod][jMod];

      unvisitedCoordinate.getAllNeighours()
        .map(c => {
          const iNorm = getNormalisedI(c.i);
          const jNorm = getNormalisedJ(c.j);
          const neighborITiled = getTiledI(c.i);
          const neighborJTiled = getTiledJ(c.j);
          const neighborNode = nodes[iNorm][jNorm];
          return { neighborNode, neighborITiled, neighborJTiled, c };
        })
        .filter(({ neighborNode, neighborITiled, neighborJTiled }) => {
          return (
            (neighborNode.tile == '.' || neighborNode.tile === 'S')
            && !neighborNode.visitedInTile(neighborITiled, neighborJTiled)
          )
        }).forEach(({ c }) => {
          nextUnvisited.add(hash(c));
        });

      thisNode.visitInTile(iTiled, jTiled, i);
    });
    console.log({ i, nodes0: nodes[0].map(n => n.visitedTiled) });
    unvisited = [...nextUnvisited];

  }

  let total = 0;

  iterateMultiDimensional(nodes, (node) => {
    total += node.getVisitedCountTiled(true);
  });

  // const total = nodes.reduce((lineTotal, line) => lineTotal + line.reduce((total, node) => node.steps.some(n => n % 2 === 0) ? total + 1 : total, 0), 0);
  const str = nodes.map(line => line.map(n => {
    if (n.tile === '#') {
      return '#'
    }
    if (n.tile === 'S') {
      return 'S'
    }
    if (n.visitedTiled['0,0'] && n.visitedTiled['0,0'].some(n => n % 2 === 0)) {
      return 'O';
    } else {
      return '.';
    }

  }).join('')).join('\n');
  // 3681 too low.
  // 3682 too low.
  console.log({ total });

};

main();
