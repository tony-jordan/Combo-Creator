// File: colorRandoimzer.ts
// Author: Tony Jordan
// Purpose: Utility for randomly generating distinct colors.

function generateRandomColor() {
    let color = [0, 0, 0];
    // randomize number between 0 and 2
    let anchor = Math.floor(Math.random() * (3))
    // randomize another number. If this number = anchor, color will be more in line with primary colors, secondary otherwise
    let secondAnchor = Math.floor(Math.random() * (3))
    // if anchor and secondary are equal, generate random color with low chances of other colors being high
    if (anchor == secondAnchor) {
        color[anchor] = Math.floor(Math.random() * (255 - 150 + 1)) + 150
        for (let x = 0; x < color.length; x++) {
            if (x == anchor) {
                color[x] = Math.floor(Math.random() * (255 - 150 + 1)) + 150
            }
            else {
                color[x] = Math.floor(Math.random() * (50 + 1))
            }
        }
    }
    else {
        for (let x = 0; x < color.length; x++) {
            if (x == anchor || x == secondAnchor) {
                color[x] = Math.floor(Math.random() * (255 - 150 + 1)) + 150
            }
            else {
                color[x] = Math.floor(Math.random() * (50 + 1))
            }
        }
    }
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`
}

export default generateRandomColor;