const fs = require('fs');
const data = fs.readFile('./input.txt', 'utf-8', (err, data) => {
    if (err) {
        return console.error(err);
    }
    handleData(data);
});

const handleData = (data) => {
    const treeArr = data.split('\n').map(line => line.split('').map(n => +n));

    const isVisible = (i, j) => {
        const treeH = treeArr[i][j];
        let topVis = true;
        for (let k = i - 1; k >= 0; k--) {
            if (treeArr[k][j] >= treeH){
                topVis = false;
                break;
            }
        }
        if (topVis) return true;
        let bottomVis = true;
        for (let k = i + 1; k < treeArr.length; k++) {
            if (treeArr[k][j] >= treeH){
                bottomVis = false;
                break;
            }
        }
        if (bottomVis) return true;
        let leftVis = true;
        for (let k = j - 1; k >= 0; k--) {
            if (treeArr[i][k] >= treeH) {
                leftVis = false;
                break;
            }
        }
        if (leftVis) return true;
        let rightVis = true;
        for (let k = j + 1; k < treeArr[i].length; k++) {
            if (treeArr[i][k] >= treeH){
                rightVis = false;
            }
        }
        if (rightVis) return true;
        return false;
    }


    let visibleCount = 0;
    for (let i = 0; i < treeArr.length; i++) {
        for (let j = 0; j < treeArr[i].length; j++) {
            if (
                (i === 0) ||
                (i === treeArr.length - 1) ||
                (j === 0) ||
                (j === treeArr[i].length - 1)
            ) {
                visibleCount++;
            } else {
                console.log(`check ${i} ${j}`)
                if (isVisible(i, j)) {
                    visibleCount++;
                }
            }
        }
    }
    console.log(visibleCount);
}