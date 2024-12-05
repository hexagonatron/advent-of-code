import {
  readFile,
} from "../../utils/utils";
import path from "path";

const main = async () => {
  const dataStr = await readFile(path.resolve(__dirname, "./input.txt"));

  const [rules, pages] = dataStr.split('\n\n');

  const ruleMap: {[key: number]: number[]} = {};

  rules.split('\n').map(rule => {
    const [first, second] = rule.split('|').map(n => +n);
    if (ruleMap[first]) {
      ruleMap[first].push(second);
    } else {
      ruleMap[first] = [second];
    }
  });

  console.log(ruleMap);

  const pagesToPrint = pages.split('\n').map(line => line.split(',').map(n => +n));

  const isValid = (pageList: number[]): boolean => {
    return pageList.every((page, pageIdx) => {
      if (ruleMap[page]) {
        return ruleMap[page].every(rulePage => {
          const foundIdx = pageList.findIndex((pageListVal) => {
            return pageListVal === rulePage;
          });
          // RulePage not in page list
          if (foundIdx === -1) {
            return true;
          }

          // Return true if rulePage occurs after page to check
          const ruleCheckResult = foundIdx > pageIdx;
          return ruleCheckResult;
        });
      }
      // Page # has no rules associated.
      return true;
    });
  }

  const findMiddle = (pageList: number[]): number => {
    const middleIdx = (pageList.length -1) / 2;
    return pageList[middleIdx];
  }

  const fix = (pageList: number[]): number[] => {
    const pageListCopy = [...pageList];
    pageListCopy.sort((a, b) => {
      const aRule = ruleMap[a];
      const bRule = ruleMap[b];
      if (aRule && aRule.includes(b)) {
        return -1;
      }
      if (bRule && bRule.includes(a)) {
        return 1;
      }
      return 0;
    });
    return pageListCopy;
  }

  const fixAndFindMiddle = (pageList: number[]): number => {
    const fixed = fix(pageList);
    return findMiddle(fixed);
  }

  const middlePageTotal = pagesToPrint.reduce((a, pageList) => {
    if (isValid(pageList)) {
      return {...a, correctTotal: a.correctTotal + findMiddle(pageList)};
    } else {
      return {...a, incorrectTotal: a.incorrectTotal + fixAndFindMiddle(pageList)};
    }
  }, {correctTotal: 0, incorrectTotal: 0});

  console.log(middlePageTotal);

};

main();
