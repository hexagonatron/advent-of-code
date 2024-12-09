import { sign } from "crypto";
import {
  readFile,
} from "../../utils/utils";
import path from "path";
import { emit } from "process";

type Chunk = {
  id: number | 'empty';
  size: number;
}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));
  const array = dataStr.split('').map(v => +v);

  const mem: Chunk[] = []

  for (let i = 0; i < array.length; i++) {
    const isFile = i % 2 === 0;

    const id = isFile ? i / 2 : 'empty';

    const value = array[i];
    if (i === undefined) {
      throw "Array out of bounds";
    }
    if (value === 0) {
      continue;
    }

    for (let j = 1; j <= value; j++) {
      mem.push({
        id: id,
        size: value,
      });
    }
  }

  let i = 0;
  let j = mem.length - 1;

  console.log(mem.length);
  const defragP1 = () => {
    while (i < j) {
      const iVal = mem[i];
      if (iVal.id != 'empty') {
        i++;
        continue;
      }
      const jVal = mem[j];
      if (jVal.id === 'empty') {
        j--;
        continue;
      }
      [mem[i], mem[j]] = [mem[j], mem[i]];

      if (i % 50 === 0) {
        console.log(i);
      }
    }
  }
  // P1
  // defragP1();

  const defragP2 = () => {
    let j = mem.length - 1;
    loop1:
    while (j > 0) {
      if (j % 500 === 0) {
        console.log(j);
      }
      const val = mem[j];
      if (val.id === 'empty') {
        j--;
        continue;
      }
      const sizeToFit = val.size;

      let emptyIdxs = [];
      for (let i = 0; i <= j - sizeToFit; i++) {
        if (mem[i].id != 'empty') {
          emptyIdxs = [];
          continue;
        }
        emptyIdxs.push(i);
        if (emptyIdxs.length === sizeToFit) {
          for (let m = 0; m < emptyIdxs.length; m++) {
            const swapIdx = emptyIdxs[m];
            [mem[swapIdx], mem[j - m]] = [mem[j - m], mem[swapIdx]]
          }
          emptyIdxs = [];
          j -= sizeToFit;
          continue loop1;
        }
      }
      j -= sizeToFit;
    }
  }

  //P2
  defragP2();

  const memHash = mem.reduce((a, value, i) => {
    if (value.id === 'empty') {
      return a;
    }
    return a + (value.id * i);
  }, 0);

  console.log(memHash);

};

main();
