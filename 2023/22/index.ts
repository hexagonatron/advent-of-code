import {
  readFile,
} from "../../utils/utils";
import path from "path";

class Point3D {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  translateDown(magnitude: number) {
    return new Point3D(this.x, this.y, this.z - magnitude);
  }
}

class Brick {
  points: Point3D[];
  isVertical: boolean;
  id: number;
  supportedBy: Set<number> = new Set<number>();
  supports: Set<number> = new Set<number>();

  constructor(points: Point3D[], id: number) {
    this.id = id;

    // Lowest Z points first;
    this.points = points.sort((p1, p2) => p1.z - p2.z);
    this.isVertical = points.every(p => p.x === points[0].x) && points.every(p => p.y === points[0].y);
  }

  getMax() {
    return this.points.reduce((acc, p) => {
      return {
        maxX: Math.max(acc.maxX, p.x),
        maxY: Math.max(acc.maxY, p.y),
        maxZ: Math.max(acc.maxZ, p.z),
      }
    }, {
      maxX: 0,
      maxY: 0,
      maxZ: 0,
    });

  }

  translateDown(magnitude: number) {
    const newPoints = this.points.map(p => p.translateDown(magnitude));
    this.points = newPoints;
  }

  addSupportedBy(ids: number[]) {
    ids.forEach(id => {
      this.supportedBy.add(id);
    });
  }

  addSupports(id: number) {
    this.supports.add(id);
  }

}

class Board {
  board: (number | null)[][][];
  brickMap: { [key: number]: Brick } = {};
  constructor(dimX: number, dimY: number, dimZ: number) {
    const board: (number | null)[][][] = [];

    for (let i = 0; i <= dimX; i++) {
      board[i] = []
      for (let j = 0; j <= dimY; j++) {
        board[i][j] = [];
        for (let k = 0; k <= dimZ; k++) {
          board[i][j][k] = null;
        }
      }
    }

    this.board = board;

  }

  getPoint(x: number, y: number, z: number) {
    return this.board[x][y][z];
  }
  setPoint(point: Point3D, value: number) {
    this.board[point.x][point.y][point.z] = value;
  }

  canMoveDown(points: Point3D[]): boolean {
    if (
      points.every(p => {
        const under = this.getPoint(p.x, p.y, p.z - 1);
        return under === null;
      })
    ) {
      return true;
    }
    return false;
  }

  getSupportedByIds(brick: Brick): number[] {
    if (brick.isVertical) {
      const lowestPoint = brick.points[0];
      const below = this.getPoint(lowestPoint.x, lowestPoint.y, lowestPoint.z - 1);
      return [below].filter(p => typeof p === 'number') as number[];
    }
    return brick.points.map(p => {
      return this.getPoint(p.x, p.y, p.z - 1);
    }).filter(p => typeof p === 'number') as number[];
  }

  placeBrickInBoard(brick: Brick) {
    brick.points.forEach(p => {
      this.setPoint(p, brick.id);
    });
    const supportedBy = this.getSupportedByIds(brick);
    brick.addSupportedBy(supportedBy);
    supportedBy.forEach(id => {
      const supportedByBrick = this.brickMap[id];
      if (!supportedByBrick) {
        throw "Brick not in brick Map";
      }
      supportedByBrick.addSupports(brick.id);
    });
    this.brickMap[brick.id] = brick;
  }

  findBrickPositionAfterGravity(brick: Brick) {
    const startingZ = brick.points[0].z;
    for (let i = 0; i <= startingZ; i++) {
      const translatedPoints = brick.points.map(p => p.translateDown(i))
      if (!this.canMoveDown(translatedPoints)) {
        brick.translateDown(i);
        this.placeBrickInBoard(brick);
        return;
      }
    }
    throw "No position found";
  }

  getDisintegratableBricks() {
    const brickIds: number[] = [];
    const total = Object.values(this.brickMap).reduce((acc, brick) => {
      // console.log({ supportedBy: brick.supportedBy, supports: brick.supports, id: brick.id });
      if (brick.supports.size === 0) {
        brickIds.push(brick.id)
        return acc + 1;
      }
      const allSupportedByOthers = [...brick.supports].every(id => this.brickMap[id].supportedBy.size > 1);
      if (allSupportedByOthers) {
        brickIds.push(brick.id);
        return acc + 1;
      }
      return acc;
    }, 0);
    console.log({ disintegratableBricks: total });
    return brickIds;
  }

  getDisintegrateBrickSum() {
    const inconsequentialBricks = this.getDisintegratableBricks();
    Object.values(this.brickMap)
      .filter(b => !inconsequentialBricks.includes(b.id))
      .forEach(b => {
        const brickMapCopy: { [key: number]: { supports: Set<number>, supportedBy: Set<number> } } = {};
        Object.values(this.brickMap).forEach(b => {
          brickMapCopy[b.id] = { supportedBy: new Set(), supports: new Set() };
          b.supportedBy.forEach(v => brickMapCopy[b.id].supportedBy.add(v));
          b.supports.forEach(v => brickMapCopy[b.id].supports.add(v));
        });

        
      });
  }
}

const sort = (num1: number, num2: number) => {
  return [num1, num2].sort((a, b) => a - b);
}

const expand = (min: number, max: number) => {
  const nums: number[] = [];
  for (let i = min; i <= max; i++) {
    nums.push(i);
  }
  return nums;
}

const getExpandedPoints = (from: Point3D, to: Point3D): Point3D[] => {
  // X Y Z - single cube
  if (
    from.x === to.x
    && from.y === to.y
    && from.z === to.z
  ) {
    return [from];
  }
  // X Y
  if (
    from.x === to.x
    && from.y === to.y
  ) {
    const [minZ, maxZ] = sort(from.z, to.z);
    console.log({ minZ, maxZ });
    return expand(minZ, maxZ).map(z => new Point3D(from.x, from.y, z));
  }

  // X Z
  if (
    from.x === to.x
    && from.z === to.z
  ) {
    const [minY, maxY] = sort(from.y, to.y);
    return expand(minY, maxY).map(y => new Point3D(from.x, y, from.z));
  }

  // Y Z
  if (
    from.z === to.z
    && from.y === to.y
  ) {
    const [minX, maxX] = sort(from.x, to.x);
    return expand(minX, maxX).map(x => new Point3D(x, from.y, from.z));
  }
  throw "No 2 points equal";
}

const getBrick = (from: Point3D, to: Point3D, index: number) => {
  const points = getExpandedPoints(from, to);
  console.log(points);
  if (points.length === 0) {
    console.log({ from, to });
    throw "no points";
  }
  const brick = new Brick(points, index);
  return brick;
}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input2.txt"));

  const bricks = dataStr.split('\n').map((line, index) => {
    const [from, to] = line.split('~');

    const [fromX, fromY, fromZ] = from.split(',').map(c => +c);
    const [toX, toY, toZ] = to.split(',').map(c => +c);

    const fromPoint = new Point3D(fromX, fromY, fromZ);
    const toPoint = new Point3D(toX, toY, toZ);

    return getBrick(fromPoint, toPoint, index);
  }).sort((b1, b2) => {
    return b1.points[0].z - b2.points[0].z;
  }).map(b => {
    console.log(b);
    return b;
  });

  const { maxX, maxY, maxZ } = bricks.reduce((acc, b) => {
    const bMax = b.getMax();
    return {
      maxX: Math.max(acc.maxX, bMax.maxX),
      maxY: Math.max(acc.maxY, bMax.maxY),
      maxZ: Math.max(acc.maxZ, bMax.maxZ),
    }
  }, { maxX: 0, maxY: 0, maxZ: 0 });

  const board = new Board(maxX, maxY, maxZ);

  bricks.forEach(brick => {
    board.findBrickPositionAfterGravity(brick);
  });
  board.getDisintegratableBricks();
  board.getDisintegrateBrickSum();



};

main();
