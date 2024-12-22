import {
  ALL_DIRECTIONS,
  Coordinate,
  Grid,
  readFile,
  splitToGrid,
} from "../../utils/utils";
import {
  Edge,
  Node,
  Graph,
} from "../../utils/graphUtils";
import path from "path";

type ValueType = '.' | '#' | 'S' | 'E';

const isValueType = (input: string): input is ValueType => {
  if (
    input === '.'
    || input === '#'
    || input === 'S'
    || input === 'E'
  ) {
    return true;
  }
  return false;
}

class TrackCoord extends Coordinate {
  value: ValueType;
  constructor(i: number, j: number, value: ValueType) {
    super(i, j);
    this.value = value;
  }

  isFreeOrFinish() {
    return this.value === '.' || this.value === 'E';
  }
  isStart() {
    return this.value === 'S';
  }
  isEnd() {
    return this.value === 'E';
  }
}

class RaceTrack extends Grid<TrackCoord> {
  constructor(points: TrackCoord[][]) {
    super(points);
  }
  getStart(): TrackCoord {
    let start: TrackCoord | null = null;
    this.map((v) => {
      if (v.isStart()) {
        start = v;
      }
    });
    if (!start) {
      throw 'Start not found';
    }
    return start;
  }

  getEnd(): TrackCoord {
    let end : TrackCoord | null = null;
    this.map((v) => {
      if (v.isEnd()) {
        end = v;
      }
    });
    if (!end) {
      throw 'Start not found';
    }
    return end;
  }

  print(trackPath: string[]) {
    const str = this.map(v => {
      if (trackPath.includes(v.hash())) {
        return 'O';
      }
      return v.value;
    }).map(line => line.join('')).join('\n');

    console.log(str);
    console.log('\n');
  }
}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input1.txt"));
  const points = splitToGrid(dataStr, (i: number, j: number, value: string) => {
    if (!isValueType(value)) {
      throw `Unexpected input: ${value}`;
    }
    return new TrackCoord(i, j, value);
  });

  const track: RaceTrack = new RaceTrack(points);

  const start = track.getStart();
  const end = track.getEnd();

  const nodes: Node<Edge>[] = track.flatMap((vale, i, j) => {
    const edges = vale
      .getAllNeighours()
      .filter((v) => track.isCoordinateInGrid(v))
      .map(c => track.getByCoordinate(c))
      .filter(v => v.isFreeOrFinish())
      .map(coord => new Edge(vale.hash(), coord.hash()));
    return new Node(vale.hash(), edges, false);
  });

  const graph: Graph<Edge, Node<Edge>> = new Graph(nodes);

  const trackPath = graph.findPathsBFS([start.hash()], (workingPath) => {
    return workingPath[workingPath.length -1] === end.hash();
  }, true)[0];
  if (!trackPath) {
    throw 'Path not found';
  }

  console.log(trackPath);
  track.print(trackPath);
  console.log(trackPath.length - 1);

  const map: {[key: string]: number} = {};

  trackPath.forEach((point, pointIdx) => {
    const [i, j] = point.split(',').map(v => +v);
    const coord = new Coordinate(i,j);
    ALL_DIRECTIONS.map(dir => coord.getCoordinateFromVector(dir, 2)).map(c => c.hash()).map(pointHash => {
      const foundIdx = trackPath.findIndex(v => v === pointHash);
      if (foundIdx === -)
    });

  })
};

main();
