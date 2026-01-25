// File: GenerateReport
// Author: Tony Jordan
// Purpose: SortData

export type info = {name: string, count: number};

// sort counts in descending order for more readable bar graph
export function sortCounts(output: info[]) {
  for (let x = 0; x < output.length; x++) {
    for (let y = x; y < output.length; y++) {
      if (output[x].count < output[y].count) {
        let temp = output[x];
        output[x] = output[y];
        output[y] = temp;
      }
    }
  }
}