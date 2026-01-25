// tests/Validations.test.ts

import hasNonNumeric, {validateStrikes} from "../utilities/Validations";

describe('hasNonNumeric', () => {
    it("should return false if supplied string only contains numbers", () => {
        // set up param
        const value = "1232857";
        // expect function call to return false
        expect(hasNonNumeric(value)).toBe(false);
    });
    it("should return true if supplied string has any non-numeric characters", () => {
        // set up param
        const value = "12A28b$7";
        // expect function call to return true
        expect(hasNonNumeric(value)).toBe(true);
    });
})

describe('validateStrikes', () => {
    it("should return true if parameter array contains no empty strings", () => {
       // set up string array parameter
       const arr = ["aa", "bb", "cc", "dd", "ee", "ff"]
       // expect function call to return true
       expect(validateStrikes(arr)).toBe(true);
    });
    it("should return false if parameter array contains empty strings", () => {
       // set up string array parameter
       const arr = ["aa", "", "cc", "dd", "ee", "ff"]
       // expect function call to return false
       expect(validateStrikes(arr)).toBe(false);
    })
})