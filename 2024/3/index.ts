import {
	readFile,
} from "../../utils/utils";
import path from "path";

const main = async () => {
	const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));
	const matches = [...dataStr.matchAll(/(do\(\)|don\'t\(\)|mul\((\d{1,3}),(\d{1,3})\))/g)];
	const total = matches.reduce((a, v) => {
		if (v[0] === 'do()') {
			return { ...a, do: true };
		}
		if (v[0] === 'don\'t()') {
			return { ...a, do: false };
		}

		if (a.do) {
			const prod = (+v[2] * +v[3]);
			console.log(v);
			console.log(prod);
			return { ...a, total: a.total + prod };
		}
		return a;
	}, { total: 0, do: true });
	console.log(total);
};

main();
