import { readFile, sum } from "../../utils/utils";
import path from "path";

const hash = (input: string) => {
  const hashRes = input.split("").reduce((acc, c) => {
    const addCharCode = c.charCodeAt(0) + acc;
    const mult = addCharCode * 17;
    const remainder = mult % 256;
    return remainder;
  }, 0);

  return hashRes;
};

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));
  // const dataStr = "rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7";
  const instructions = dataStr.split(",");
  const operations = instructions.map((i) => {
    const labelMatches = i.split(/=|-/);
    const label = labelMatches[0];
    const box = hash(label);
    const opMatch = i.match(/-|=/);
    if (!opMatch) {
      throw "Error";
    }
    const op = opMatch[0];
    let focalLength = null;
    if (op === "=") {
      focalLength = +labelMatches[1];
    }
    return {
      box: box,
      label,
      op,
      focalLength,
    };
  });
  console.log(operations);
  type Lens = {
    label: string;
    focalLength: number;
  };
  const initialBoxes: Lens[][] = new Array(256).fill(1).map((_) => []);

  const finalBoxes = operations.reduce((boxes, operation) => {
    if (operation.op === "-") {
      boxes[operation.box] = boxes[operation.box].filter(
        (lens) => lens.label !== operation.label
      );
    } else if (operation.op === "=") {
      if (operation.focalLength === null) {
        throw "Trying to add lens without focal length";
      } else {
        if (
          boxes[operation.box].some((lens) => lens.label === operation.label)
        ) {
          boxes[operation.box] = boxes[operation.box].map((lens) => {
            return lens.label === operation.label
              ? { label: operation.label, focalLength: operation.focalLength as number }
              : lens;
          });
        } else {
          boxes[operation.box].push({
            label: operation.label,
            focalLength: operation.focalLength,
          });
        }
      }
    } else {
      throw "Op not supported";
    }
    return boxes;
  }, initialBoxes);
  const totalFocusingPower = finalBoxes.reduce((total, box, i) => {
    const boxMult = i+1;
    const boxFocusPower = box.reduce((boxTotal, lens, slotIdx) => boxTotal + (boxMult * (slotIdx + 1) * lens.focalLength) , 0);
    return total + boxFocusPower;
  }, 0);
  console.log(totalFocusingPower);
};

main();
