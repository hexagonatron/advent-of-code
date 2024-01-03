import {
  Coordinate,
  Direction,
  iterateMultiDimensional,
  readFile,
  writeFile,
} from "../../utils/utils";
import path from "path";

type DigInstruction = {
  direction: Direction,
  magnitute: number,
  colour: string,
}

const parseInputLine = (line: string): DigInstruction => {
  const match = line.match(/(?<dir>[UDLR]) (?<count>\d+) \(#(?<colour>[a-z0-9]{6})\)/);
  if (!match?.groups) throw 'No match found'
  return {
    direction: letterToDirection(match.groups.dir),
    magnitute: +match.groups.count,
    colour: match.groups.colour,
  }
}

const letterToDirection = (letter: string) => {
  const map: { [key: string]: Direction } = {
    'U': 'Up',
    'D': 'Down',
    'L': 'Left',
    'R': 'Right',
  }
  const mapped = map[letter];
  if (!mapped) {
    console.log(letter);
    throw "Couldn't map direction";
  }
  return mapped;
}

class VisitableCoordinate extends Coordinate {
  visited: boolean = false;
  constructor(i: number, j: number, visited: boolean) {
    super(i, j);
    this.visited = visited;
  }
  public visit() {
    this.visited = true;
  }
  public toString() {
    return this.visited ? '#' : '.';
  }
}

class Grid<T> {
  grid: T[][] = [];

  constructor(grid: T[][]) {
    this.grid = grid;
  }

  public isInGrid(coordinate: Coordinate): boolean {
    return coordinate.i >= 0
      && coordinate.i < this.grid.length
      && coordinate.j >= 0
      && coordinate.j < this.grid[0].length;
  }

  public get(coordinate: Coordinate): T {
    if (!this.isInGrid(coordinate)) {
      console.log(coordinate);
      throw 'Coordinate not in grid';
    }
    return this.grid[coordinate.i][coordinate.j];
  }

  public set(coordinate: Coordinate, value: T) {
    if (!this.isInGrid(coordinate)) {
      throw 'Coordinate not in grid';
    }
    this.grid[coordinate.i][coordinate.j] = value;
  }

  public forEach(callback: (value: T, i: number, j: number) => void) {
    return iterateMultiDimensional(this.grid, callback);
  }

  public print(mapper?: (value: T, i: number, j: number) => string) {
    if (mapper) {
      const str = this.toString(mapper);
      console.log(str);
      console.log('');
      return;
    }
    this.forEach((element, i, j) => console.log({ element, i, j }));
  }

  public toString(mapper: (value: T, i: number, j: number) => string): string {
    const str = this.grid.map((line, i) => line.map((element, j) => mapper(element, i, j)).join('')).join('\n');
    return str;
  }

}

class CoordinateMagnitude extends Coordinate {
  magnitude: number;
  constructor(coord: Coordinate, magnitude: number) {
    super(coord.i, coord.j);
    this.magnitude = magnitude;
  }
}

const dirArr: Direction[] = ['Right', 'Down', 'Left', 'Up'];
const getNextVertexP2 = (colour: string, currentPos: Coordinate) => {
  const steps = Number('0x' + colour.slice(0, 5));
  const direction: Direction = dirArr[+colour.slice(5)];
  console.log({ steps, direction });
  const nextVertex = currentPos.getCoordinateFromVector(direction, steps);
  return new CoordinateMagnitude(nextVertex.getCoordinate(), steps);
}

const mainP2 = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const digInstructions = dataStr.split('\n').map(line => parseInputLine(line));
  const startingPoint = new CoordinateMagnitude(new Coordinate(0, 0), 0);
  let verticies: CoordinateMagnitude[] = [startingPoint]
  for (const instruction of digInstructions) {
    const nextVertex = getNextVertexP2(instruction.colour, verticies[verticies.length - 1]);
    verticies.push(nextVertex);
  }
  console.log(verticies);
  let areaSum = 0;
  let perimiter = verticies.reduce((total, c) => c.magnitude + total,0);
  for (let i = 0; i < verticies.length - 1; i++) {
    const thisV = verticies[i];
    const nextV = verticies[i + 1];
    areaSum += (thisV.j*nextV.i - thisV.i*nextV.j)
  }
  const area = areaSum / 2;
  const areaAbs = area < 0 ? area * -1 : area;
  const total = areaAbs + (perimiter / 2) + 1;
  console.log({ areaAbs, perimiter, total});


}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const digInstructions = dataStr.split('\n').map(line => parseInputLine(line));
  const startingPoint = new Coordinate(0, 0);
  let allPoints = [startingPoint];
  let verticies: Coordinate[] = [startingPoint]
  for (const instruction of digInstructions) {
    const currentPoint = allPoints[allPoints.length - 1];
    const pointsCovered = currentPoint.getCoordinatesPassedThrough(instruction.direction, instruction.magnitute);
    allPoints = [...allPoints, ...pointsCovered];
    const nextVertex = getNextVertexP2(instruction.colour, verticies[verticies.length - 1]);
    verticies.push(nextVertex);
  }
  const { minI, minJ, maxI, maxJ } = allPoints.reduce(({ minI, minJ, maxI, maxJ }, point) => ({
    minI: Math.min(minI, point.i),
    minJ: Math.min(minJ, point.j),
    maxI: Math.max(maxI, point.i),
    maxJ: Math.max(maxJ, point.j)
  }), { minI: 999, minJ: 999, maxI: 0, maxJ: 0 });
  console.log({ minI, minJ, maxI, maxJ });
  const normalisedPoints = allPoints.map((coordinate) => new Coordinate(coordinate.i - minI, coordinate.j - minJ));

  const normMaxI = maxI - minI;
  const normMaxJ = maxJ - minJ;

  const grid: VisitableCoordinate[][] = [];

  for (let i = 0; i <= normMaxI; i++) {
    grid[i] = [];
    for (let j = 0; j <= normMaxJ; j++) {
      grid[i][j] = new VisitableCoordinate(i, j, false);
    }
  }
  const digGrid = new Grid(grid);

  normalisedPoints.forEach(point => {
    digGrid.get(point).visit();
  })

  await writeFile(path.resolve(__dirname, `./${Date.now()}-before.txt`), digGrid.toString(v => v.toString()));

  const ffStartPoint = digGrid.grid[0].find(v => v.visited);
  if (!ffStartPoint) throw "Visited point on first row not found";
  const firstInner = ffStartPoint.getNeighbour('Down').getNeighbour('Right').getCoordinate();

  let unvisited = [[firstInner.i, firstInner.j]];
  let count = 0;
  const loopStart = Date.now();
  while (unvisited.length > 0) {
    let nextToVisit: number[][] = [];
    unvisited.forEach(([i, j]) => {
      if (!digGrid.grid[i][j].visited) {
        digGrid.grid[i][j].visit();
        const neighbors = new Coordinate(i, j).getAllNeighours().map(c => [c.i, c.j]);
        nextToVisit = nextToVisit.concat(neighbors);
      }
    });
    count++;
    unvisited = [...nextToVisit];
    // await writeFile(path.resolve(__dirname, `./${loopStart}-fill-${count}.txt`), digGrid.toString(v => v.toString()));

    if (count % 50 === 0) {
      digGrid.print((v => v.toString()))
    }
  }

  let digCount = 0;
  digGrid.forEach(v => {
    if (v.visited) {
      digCount++;
    }
  });
  console.log({ digCount });

};

// main();
mainP2();