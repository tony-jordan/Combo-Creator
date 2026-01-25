// tests/colorRandomizer.test.ts

import generateRandomColor from "../utilities/colorRandomizer";


describe('generateRandomColor', () => {
    it('should return a string that is formatted correctly', () => {
        // expect return value of function to contain 'rgb('
        expect(generateRandomColor()).toContain("rgb(")
    })
})