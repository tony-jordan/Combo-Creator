import { Dispatch, SetStateAction } from 'react';

// function for formatting table based on search results
export default function searchFavorites(text: string, setff: Dispatch<SetStateAction<any>>, fullff: any) {
  setff(fullff);
  let f = fullff;
  let output = [];
  if (text.length != 0) {
    for (let x = 0; x < f.length; x++) {
      if (f[x].name) {
        if (f[x].name.toLowerCase().includes(text.toLowerCase()) || (f[x].id).toString().toLowerCase().includes(text.toLowerCase())) {
          output.push(f[x]);
        }
      }
      else {
        if ((f[x].id).toString().toLowerCase().includes(text.toLowerCase())) {
          output.push(f[x]);
        }
      }
    }
    setff(output);
  }
}

// function for formatting table based on search results
export function searchStrikeSets(text: string, setSS: Dispatch<SetStateAction<any>>, fullSS: any) {
  setSS(fullSS);
  let f = fullSS;
  let output = [];
  if (text.length != 0) {
    for (let x = 0; x < f.length; x++) {
      if (f[x].name) {
        if (f[x].name.toLowerCase().includes(text.toLowerCase()) || (f[x].id).toString().toLowerCase().includes(text.toLowerCase())) {
          output.push(f[x]);
        }
      }
      else {
        if ((f[x].id).toString().toLowerCase().includes(text.toLowerCase())) {
          output.push(f[x]);
        }
      }
    }
    setSS(output);
  }
}