import {
  Grid,
  Coordinate,
  readFile,
  splitToGrid,
  iterateMultiDimensional,
  sum,
  sumObjArr,
  avg,
  Direction,
} from "../../utils/utils";
import path from "path";

type BoundryCoord = {
  inner: Coordinate;
  outer: Coordinate;
  orientation: 'H' | 'V';
}

const getOrientation = (direction: Direction) => {
  if (direction === 'Down' || direction === 'Up') {
    return 'H'
  }
  return 'V'
}

class GardenCoordinate extends Coordinate {
  plantType: string;
  regionised: boolean;
  constructor(i: number, j: number, plantType: string) {
    super(i, j);
    this.plantType = plantType;
    this.regionised = false;
  }
}

class Region {
  id: string;
  points: GardenCoordinate[];
  plantType: string;
  perimiter: number;
  fenceSides: number;

  constructor(points: GardenCoordinate[]) {
    this.points = points;
    const firstPoint = points[0];
    if (!firstPoint) {
      throw "Region with no points";
    }
    this.plantType = firstPoint.plantType;
    this.id = `${this.plantType}-${firstPoint.i},${firstPoint.j}`
    this.perimiter = 0;
    this.fenceSides = 0;
  }

  getArea(): number {
    return this.points.length;
  }
  getPerimiter(): number {
    return this.perimiter;
  }
  getFenceSides(): number {
    return this.fenceSides;
  }
  getFenceCostP1(): number {
    return this.getArea() * this.getPerimiter();
  }

  getFenceCostP2(): number {
    return this.getArea() * this.getFenceSides();
  }
}

class Farm extends Grid<GardenCoordinate> {
  regions: Region[];
  constructor(plots: GardenCoordinate[][]) {
    super(plots);
    this.regions = [];
  }

  calculateRegions() {
    this.map((plot) => {
      if (plot.regionised) {
        return;
      }

      const pointsInRegion: GardenCoordinate[] = [];

      let pointsToProcess: GardenCoordinate[] = [plot];

      while (pointsToProcess.length > 0) {
        const working = pointsToProcess.shift();
        if (!working) {
          throw 'No working point';
        }
        if (working.regionised) {
          continue;
        }
        working.regionised = true;
        pointsInRegion.push(working);

        const newPointsToProcess = working
          .getAllNeighours()
          .filter(c => this.isCoordinateInGrid(c))
          .map(c => this.getByCoordinate(c))
          .filter(plot => plot.plantType === working.plantType && !plot.regionised);
        pointsToProcess = pointsToProcess.concat(newPointsToProcess);
      }

      this.regions.push(new Region(pointsInRegion));

    });

    this.computeRegionPerimetersAndSides();
  }

  computeRegionPerimetersAndSides() {
    this.regions.forEach(region => {
      let perimiterTotal = 0;
      let boundaryCoordinates: BoundryCoord[] = []
      region.points.forEach(point => {
        point.getAllNeighours()
          .forEach(coordinate => {
            if (!this.isCoordinateInGrid(coordinate)) {
              perimiterTotal += 1;
              boundaryCoordinates.push({
                inner: point,
                outer: coordinate,
                orientation: getOrientation(coordinate.direction)
              })
              return;
            }
            const neighbour = this.getByCoordinate(coordinate);
            if (neighbour.plantType != point.plantType) {
              perimiterTotal += 1;
              boundaryCoordinates.push({
                inner: point,
                outer: coordinate,
                orientation: getOrientation(coordinate.direction)
              })
              return;
            }
            // Neighbour has same plant type, so no fence needed.
          });
      });
      region.perimiter = perimiterTotal;

      const findAndRemoveForDirection = (workingCoord: BoundryCoord, direction: Direction) => {
        const innerNeighbour = workingCoord.inner.getNeighbour(direction);
        const outerNeighbour = workingCoord.outer.getNeighbour(direction);
        const foundIdx = boundaryCoordinates.findIndex(coord => {
          return coord.inner.isEqual(innerNeighbour)
            && coord.outer.isEqual(outerNeighbour);
        });
        if (foundIdx != -1) {
          const coord = boundaryCoordinates.splice(foundIdx, 1);
          removeNeighbours(coord[0]);
        }
      }

      const removeNeighbours = (workingCoord: BoundryCoord) => {

        if (workingCoord.orientation === 'H') {
          findAndRemoveForDirection(workingCoord, 'Left');
          findAndRemoveForDirection(workingCoord, 'Right');
        } else {
          findAndRemoveForDirection(workingCoord, 'Up');
          findAndRemoveForDirection(workingCoord, 'Down');
        }

      }

      let sides = 0;
      while (boundaryCoordinates.length > 0) {
        const working = boundaryCoordinates.shift();
        if (!working) {
          throw 'No working';
        }
        removeNeighbours(working);
        sides += 1;
      }
      region.fenceSides = sides;
    });
  }

  getTotalPriceP1() {
    return sumObjArr(this.regions, (region) => region.getFenceCostP1());
  }
  getTotalPriceP2() {
    return sumObjArr(this.regions, (region) => region.getFenceCostP2());
  }

}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const coordinates: GardenCoordinate[][] = splitToGrid(dataStr, (i, j, plantType) => {
    return new GardenCoordinate(i, j, plantType);
  });

  const farm: Farm = new Farm(coordinates);

  farm.calculateRegions();
  const priceP1 = farm.getTotalPriceP1();
  const priceP2 = farm.getTotalPriceP2();


  console.log({ priceP1, priceP2 });

};

main();
