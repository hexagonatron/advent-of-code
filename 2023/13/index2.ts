import { readFile, replaceCharAt, transposeStringArr } from "../../utils/utils";
import path from "path";

const getDifferences = (group: string[]) => {
  const copy = group.map((line) => line.split(""));
  let differences = 0;
  const halfIndex = (group.length - 1) / 2;
  for (let i = 0; i < halfIndex; i++) {
    const compositeIndex = halfIndex - i + halfIndex;
    for (let j = 0; j < group[i].length; j++) {
        if (copy[i][j] !== copy[compositeIndex][j]) {
            differences++;
        }
    }
  }
  return differences;
};



// 0 1
// 0 2
// 1 3
// 2 4 

// i 2
// i/2 = 1

const getSummary = (group: string[]) => {
  const rowsCount = group.length;
  for (let i = 2; i <= rowsCount; i += 2) {
    //Get top
    const topPartial = group.slice(0, i);
    const topDifferences = getDifferences(topPartial);
    if (topDifferences === 1) {
      return {rowsAbove: i/2};
    }

    // Get bottom
    const bottomPartial = group.slice(group.length - i);
    const bottomDifferences = getDifferences(bottomPartial);
    if (bottomDifferences === 1) {
      return {rowsAbove: group.length - i + i/2};
    }
  }
}

const getP2Summary = (group: string[]) => {
  const horizontalRes = getSummary(group);
  if (horizontalRes) {
    return 100 * horizontalRes.rowsAbove;
  }
  const verticalRes = getSummary(transposeStringArr(group));
  if (verticalRes) {
    return verticalRes.rowsAbove;
  }
};

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "input.txt"));
  const groupStrs = dataStr.split("\n\n");
  const groupArrs = groupStrs.map((g) => g.split("\n"));

  let totalP2 = 0;

  groupArrs.forEach((group, index) => {
    const summary = getP2Summary(group);
    console.log({index, summary});
    if(summary === undefined) {
      throw 'Score not found';
    }
    totalP2 += summary;
  });

  console.log({ totalP2});
};

main();
