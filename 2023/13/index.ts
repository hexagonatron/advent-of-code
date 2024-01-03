import { readFile, replaceCharAt, transposeStringArr } from '../../utils/utils';
import path from 'path';

// Magnitude, rows either side of reflection axis
type SymmetryAxis = { index: number, magnitude: number };

const findHorizontalSymAxisFromTop = (array: string[], oldSol?: SymmetryAxis | null): SymmetryAxis | null => {
    const firstRow = array[0];
    checkComposite:
    for (let i = array.length - 1; i > 0; i--) {
        if (array[i] === firstRow) {
            for (let j = 1; j < i / 2; j++) {
                if (array[i - j] !== array[j]) {
                    continue checkComposite;
                }
            }
            const symAxis: SymmetryAxis = { index: i / 2, magnitude: (i + 1) / 2 };
            if (oldSol === undefined) {
                return symAxis;
            }
            if (isDifferentToOld(symAxis, oldSol)) {
                return symAxis;
            }
        }
    }
    return null;
}

const isDifferentToOld = (newSol: SymmetryAxis, oldSol: SymmetryAxis | null) => {
    if (oldSol === null) {
        return true;
    }
    return newSol.index != oldSol.index
}

const inSymAxis = (axis: SymmetryAxis, i: number) => {
        const res = i < (axis.index + axis.magnitude) && i > (axis.index - axis.magnitude);
        return res;
}

const getHorizontalSymAxis = (array: string[], oldSol?: ReflectionAxis | null): ReflectionAxis | null => {
    const symAxisfromTop = findHorizontalSymAxisFromTop(array, oldSol === undefined ? undefined : oldSol === null ? null : {index: oldSol.index, magnitude: oldSol.magnitude});
    if (symAxisfromTop != null) {
        return { index: symAxisfromTop.index, orientation: 'H', magnitude: symAxisfromTop.magnitude };
    }

    const symAxisFromBottom = findHorizontalSymAxisFromTop(array.slice().reverse(), oldSol === undefined ? undefined : oldSol === null? null :{index: array.length -1 -oldSol.index, magnitude: oldSol.magnitude});
    if (symAxisFromBottom != null) {
        // Convert from top to from bottom
        const symIndex = array.length - 1 - symAxisFromBottom.index;
        return { index: symIndex, magnitude: symAxisFromBottom.magnitude, orientation: 'H' }
    }

    return null;
}

const getVerticalSymAxis = (array: string[], oldSol?: ReflectionAxis): ReflectionAxis | null => {
    // left now top
    const transposed = transposeStringArr(array);

    const symAxisTransposed = getHorizontalSymAxis(transposed, oldSol === undefined ? undefined : oldSol.orientation === 'H' ? null : oldSol);
    if (symAxisTransposed != null) {
        // Untranspose the symmetry axis
        return {
            ...symAxisTransposed,
            orientation: 'V',
        }
    }

    return null;
}

type ReflectionAxis = { index: number, orientation: 'H' | 'V', magnitude: number };

const findReflectionAxesForGroup = (group: string[], oldReflectionAxis?: ReflectionAxis): ReflectionAxis[] => {

    const allReflections = [];

    const horizontalSymAxis = getHorizontalSymAxis(group, oldReflectionAxis);
    const verticalSymAxis = getVerticalSymAxis(group, oldReflectionAxis);

    if (horizontalSymAxis != null) {
        allReflections.push(horizontalSymAxis);
    }

    if (verticalSymAxis != null) {
        allReflections.push(verticalSymAxis);
    }

    return allReflections;

}

const getSummaryForReflectionAxis = (axis: ReflectionAxis): number => {
    return axis.orientation === 'H'
        ? (100 * Math.ceil(axis.index))
        : (Math.ceil(axis.index))
}

const findSummaryForGroup = (group: string[]): number => {
    const axes = findReflectionAxesForGroup(group);

    if (axes.length === 1) {
        return getSummaryForReflectionAxis(axes[0]);
    }

    throw 'Invalid reflections';

}

const flipCharacter = (input: string, index: number) => {
    return replaceCharAt(input, index, input[index] === '.' ? '#' : '.');
}

const flip = (group: string[], i: number, j: number) => {
    const copy = group.slice();
    const newStr = flipCharacter(group[i], j);
    copy[i] = newStr;
    return copy;
}

const flippedInMirror = (axis: ReflectionAxis, i: number, j: number) => {
    if (axis.orientation === 'H') {
        return i < (axis.index + axis.magnitude) && i > (axis.index - axis.magnitude);
    }
    if (axis.orientation === 'V') {
        return j < (axis.index + axis.magnitude) && j > (axis.index - axis.magnitude);
    }
}
const printGroup = (group: string[]) => {
    console.log(group.join('\n'));
}

const main = async () => {
    const dataStr = await readFile(path.resolve(__dirname, 'input.txt'));
    const groupStrs = dataStr.split('\n\n');
    const groupArrs = groupStrs.map(g => g.split('\n'));

    let totalP2 = 0;
    let totalP1 = 0;

    groupArrs.forEach((group, index) => {

        const oldReflectionAxis = findReflectionAxesForGroup(group)[0];
        if (!oldReflectionAxis) {
            throw 'Old axis not found';
        }


        for (let i = 0; i < group.length; i++) {
            for (let j = 0; j < group[i].length; j++) {
                const flipped = flip(group, i, j);
                const reflectionAxes = findReflectionAxesForGroup(flipped, oldReflectionAxis);
                for (const reflectionAxis of reflectionAxes) {
                    // if (flippedInMirror(reflectionAxis, i, j)) {
                        totalP2 += getSummaryForReflectionAxis(reflectionAxis);
                        console.log({ reflectionAxis, i, j, index });
                        return;
                    // }
                }
            }
        }
        console.log(index);
        printGroup(group);
        throw 'Smudge axis not found'
    });

    console.log({ totalP2, totalP1 });

}

main();