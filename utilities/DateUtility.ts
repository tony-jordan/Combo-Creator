// File: DateUtility.ts
// Author: Tony Jordan
// Purpose: Date and time math and computations


// DATES MUST BE SAVED AS date.toDateString() IN THE DATABASE !!
function inBetween(userDate: string, date1: string, date2: string) {
    const targetDate = new Date(userDate);
    const testDate1 = new Date(date1);
    const testDate2 = new Date(date2);

    const date = new Date();

    if (testDate1 > testDate2) {
        if (targetDate > testDate2 && targetDate < testDate1) {
            return true;
        }
        else{
            return false;
        }
    }
    else {
        if (targetDate < testDate2 && targetDate > testDate1) {
            return true;
        }
        else{
            return false;
        }
    }
}

export function getLast7Days() {
    // result to hold all date strings
    let result = [];
    // get current date
    const date = new Date();
    result.push(date.toDateString());
    // get strings for remaining 6 days
    for (let x = 0; x < 6; x++) {
        date.setDate(date.getDate() - 1);
        result.push(date.toDateString());
    }

    // flip returned result
    return result.reverse();
}

export default inBetween;