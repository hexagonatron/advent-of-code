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
    let end: TrackCoord | null = null;
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
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));
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
    return workingPath[workingPath.length - 1] === end.hash();
  }, true)[0];
  if (!trackPath) {
    throw 'Path not found';
  }

  console.log(trackPath);
  track.print(trackPath);
  console.log(trackPath.length - 1);

  const countCheatsGreaterThan = (cheatLength: number, cheatMin: number): number => {
    const map: { [key: string]: number } = {};

    trackPath.forEach((point, pointIdx) => {
      if (pointIdx % 100 === 0) {
        console.log(`Index: ${pointIdx}, ${Math.floor(pointIdx / trackPath.length * 100)}% Complete`)
      }
      const [i, j] = point.split(',').map(v => +v);
      const coord = new Coordinate(i, j);
      coord.getCoordinatesInStepRange(cheatLength).filter(c => track.isCoordinateInGrid(c)).map(c => {
        const pointHash = c.hash();
        const lengthOfCheat = coord.getStepsToReach(c);
        const foundIdx = trackPath.findIndex(v => v === pointHash);
        if (foundIdx === -1) {
          return;
        }
        if (foundIdx < pointIdx) {
          return;
        }
        const difference = foundIdx - pointIdx - lengthOfCheat;
        if (difference <= 0) {
          return;
        }
        map[difference] = map[difference] === undefined ? 1 : map[difference] + 1;
      });
    });

    const total = Object.entries(map).reduce((a, [key, value]) => {
      const keyNum = +key;
      if (keyNum >= cheatMin) {
        return a + value;
      } else {
        return a;
      }
    }, 0);

    console.log(map);
    return total;

  }

  const totalP1 = countCheatsGreaterThan(2, 100);
  const totalP2 = countCheatsGreaterThan(20, 100);

  console.log({ totalP1, totalP2});
};

main();
