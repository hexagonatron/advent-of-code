import {
  readFile,
  sum,
  writeFile,
} from "../../utils/utils";
import path from "path";

const prune = (input: bigint): bigint => {
  return input % 16777216n;
}

const mix = (secretNum: bigint, input: bigint): bigint=> {
  return secretNum ^ input;
}

const divide = (input: bigint): bigint => {
  return input / 32n;
}

const multiply1 = (input: bigint): bigint=> {
  return input * 64n;
}

const multiply2 = (input: bigint): bigint=> {
  return input * 2048n;
}

const calcNext = (num: bigint): bigint=> {
  const mult1 = multiply1(num);
  const newSecret1 = prune(mix(num, mult1));

  const divided = divide(newSecret1);
  const newSecret2 = prune(mix(newSecret1, divided));

  const mult2= multiply2(newSecret2);
  const newSecret3 = prune(mix(newSecret2, mult2));

  return newSecret3;
}

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));
  const nums = dataStr.split('\r\n').map(v => BigInt(+v));

  const map: {[key: string]: number} = {}

  const numAtSeq = (seq: number, starting: bigint): bigint => {
    const map2: {[key: string]: number} = {}
    const all: bigint[] = [starting];
    const runningChange: {banannas: number, difference: number | null}[] = [{banannas: Number(starting % 10n), difference: null}];
    for(let i = 1; i <= seq; i ++ ) {
      const working = all[all.length -1];
      const result = calcNext(working);
      const banannaCost = Number(result %10n);
      const lastCost = runningChange[runningChange.length -1].banannas;
      const difference = banannaCost - lastCost;
      runningChange.push({banannas: banannaCost, difference: difference});
      if (runningChange.length >= 4) {
        const group:{banannas: number, difference: number | null}[] = []
        for (let j = 4; j >= 1; j--) {
          const working = runningChange[runningChange.length - j];
          group.push(working);
        }
        const key = group.map(v => v.difference).join(',');
        const banannas = banannaCost;
        if (map2[key] === undefined) {
          map2[key] = banannas;
          map[key] = map[key] === undefined ? banannas : map[key] + banannas;
        }
      }
      all.push(result);
    }
    return all[all.length -1];
  }

  const answers = nums.map((num, i) => {
    if (i %10 === 0) {
      console.log(i);
    }
    return numAtSeq(2000, num);
  });
  const ansPart1 = answers.reduce((a, n) => a + n, 0n);
  const ansPart2 = Object.entries(map).sort((a, b) => b[1] - a[1])[0];
  console.log({
    ansPart1,
    ansPart2_seq: ansPart2[0],
    ansPart2_cost: ansPart2[1],
  });
};

main();
/**
Calculate the result of multiplying the secret number by 64. Then, mix this result into the secret number. Finally, prune the secret number.

Calculate the result of dividing the secret number by 32. Round the result down to the nearest integer. Then, mix this result into the secret number. Finally, prune the secret number.

Calculate the result of multiplying the secret number by 2048. Then, mix this result into the secret number. Finally, prune the secret number.

Each step of the above process involves mixing and pruning:

To mix a value into the secret number, calculate the bitwise XOR of the given value and the secret number. Then, the secret number becomes the result of that operation. (If the secret number is 42 and you were to mix 15 into the secret number, the secret number would become 37.)

To prune the secret number, calculate the value of the secret number modulo 16777216. Then, the secret number becomes the result of that operation. (If the secret number is 100000000 and you were to prune the secret number, the secret number would become 16113920.)

15887950
16495136
527345
704524
1553684
12683156
11100544
12249484
7753432
5908254
 */