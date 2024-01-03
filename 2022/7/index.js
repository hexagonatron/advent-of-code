const fs = require('fs');
const data = fs.readFile('./input.txt', 'utf-8', (err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const CMD_REGEX = /^\$ (?<command>\w+)( (?<input>[a-zA-Z0-9\./]+))?$/
const LS_REGEX = /^(?<size>\d+) (?<filename>[a-zA-Z0-9\.]+)$/
const DIR_REGEX = /^dir (?<dirname>[a-zA-Z0-9]+)$/

const parseData = (data) => {
    const lines = data.split('\n');

    let path = [];
    const folders = {}

    for (line of lines) {
        const cmdMatch = line.match(CMD_REGEX);
        const lsMatch = line.match(LS_REGEX);
        const dirMatch = line.match(DIR_REGEX);
        if (cmdMatch) {
            if (cmdMatch.groups.command === 'cd') {
                if (cmdMatch.groups.input === '..') {
                    path.pop();
                } else {
                    path.push(cmdMatch.groups.input)
                    folders[path.join('>')] = { size: 0 };
                }
            }
        } else if (lsMatch) {
            const pathCopy = [...path];
            do {
                folders[pathCopy.join('>')].size += +lsMatch.groups.size;
                pathCopy.pop();
            } while(pathCopy.length > 0);
        } else if (dirMatch) {
        } else {
            throw `no match for:\n${line}`
        }
    }
    return folders;
}

const handleData = (data) => {
    const structure = parseData(data);
    console.log(structure);
    total = 0;
    strArr = [];
    for(key in structure) {
        if (key != '/') {
            strArr.push({name: key, size: structure[key].size})
            if (structure[key].size <= 100000) {
                total += structure[key].size;
            }
        }
    }
    const totalSpace = 70_000_000
    const neededFree = 30_000_000
    const usedSpace = structure['/'].size;
    const currentSpace = totalSpace - usedSpace;
    const needToDelete = neededFree - currentSpace;
    console.log({
        totalSpace,
        neededFree,
        currentSpace,
        needToDelete
    });

    const deletable = strArr.filter(folder => folder.size >= needToDelete).sort((f1, f2) => f1.size - f2.size);
    console.log(deletable);
    
}