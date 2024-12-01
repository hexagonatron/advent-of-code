import {
  readFile,
} from "../../utils/utils";
import path from "path";

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const [left, right] = dataStr.split('\n').map(line => line.split('   ').map(t => +t)).reduce(([l, r]: number[][], [lv, rv], i) => {
    l.push(lv);
    r.push(rv);
    return [l, r];
  }, [[],[]]);

  left.sort();
  right.sort();

  let total = 0;

  left.forEach((v) => {
    const count = right.filter(v1 => v1 === v).length;
    console.log(`num: ${v}, count: ${count}, prod: ${count * v}`);
    total += (count * v); 
  })

  
  const distTot = left.reduce((total, v, i) => {
    return total + Math.abs(v - right[i]);
  }, 0);

  // P1
  // console.log(distTot);

  // P2
  console.log(total);
};

main();
