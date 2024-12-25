import {
  readFile,
} from "../../utils/utils";
import path from "path";

class Lock {
  combination: number[]

  constructor(raw: string[]) {
    this.combination = new Array(raw[0].length).fill(0);
    for (let i = 0; i < raw.length - 1; i++) {
      for (let j = 0; j < raw[i].length; j++) {
        if (raw[i][j] === '#') {
          this.combination[j]++;
        }
      }
    }
  }

  fits(key: Key) {
    return key.combination.every((bidding, i) => {
      return bidding + this.combination[i] < 6;
    })
  }

}

class Key {
  combination: number[]

  constructor(raw: string[]) {
    this.combination = new Array(raw[0].length).fill(0);
    for (let i = 1; i < raw.length - 1; i++) {
      for (let j = 0; j < raw[i].length; j++) {
        if (raw[i][j] === '#') {
          this.combination[j] += 1;
        }
      }
    }
  }

}

const LOCK_LINE = "#####"

const isLock = (input: string) => {
  return input === LOCK_LINE;
}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const items = dataStr.split('\r\n\r\n');

  const locks: Lock[] = [];
  const keys: Key[] = [];

  items.forEach(item => {
    const lines = item.split('\r\n');

    if (isLock(lines[0])) {
      keys.push(new Key(lines));
    } else {
      locks.push(new Lock(lines));
    }
  });

  let totalCombinations = 0
  locks.forEach(lock => {
    keys.forEach(key => {
      if (lock.fits(key)) {
        totalCombinations += 1;
      }
    })
  })

  console.log({part1_combs: totalCombinations});

};

main();
