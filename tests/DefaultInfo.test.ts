// tests/defaultinfo.test.ts
// mock navigation to prevent jest errors
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useRoute: () => ({ params: {} }),
}));

// clear all mocks before running each test to prevent testing issues
beforeEach(() => {
  jest.clearAllMocks();
});

import { 
    initDatabase, 
    addToFavorites,
    updateFavorite,
    getFavoriteCombos,
    getFavorites,
    deleteFavorite,
    getStrikeSets,
 } 
from "../utilities/DefaultInfo";
import SQLite, { SQLiteDatabase } from "react-native-sqlite-storage";


jest.mock("react-native-sqlite-storage")
// Create a mock DB object
const mockDB = {
    executeSql: jest.fn().mockResolvedValue([
    {
        rows: {
            length: 1,
            item: (i: number) => ({
                strikes: JSON.stringify(['jab', 'cross']), // <-- valid JSON string
            }),
        }
    }
    ])
} as unknown as SQLiteDatabase;


// describe what initDatabase does
describe("initDatabase", () => {
    it("should open the database and create all tables", async () => {
        // call function
        await initDatabase();
        // ensures database was opened
        expect(SQLite.openDatabase).toHaveBeenCalled();
    })
})

// describe what addToFavorites does
describe("addToFavorites", () => {
    it("should call executeSql and add an entry to the favorites table with supplied data", async () => {
        // call function
        await addToFavorites(mockDB, JSON.stringify(['jab', 'cross']), 0);

        // ensure function is called with the correct parameters
        expect(mockDB.executeSql).toHaveBeenCalledWith(
            "INSERT INTO favorite_combos (strikes, super_favorite) VALUES (?, ?)", 
            [JSON.stringify(['jab', 'cross']), 0]
        )
    })
})

// describe what updateFavorite does
describe("updateFavorite", () => {
    it("should call executeSql and update entry based on supplied id and data including name since it has been assigned a value", async () => {
        // call function
        await updateFavorite(mockDB, JSON.stringify(['jab', 'cross']), 0, 1, "My Combo");

        // ensure function is called with the correct parameters
        expect(mockDB.executeSql).toHaveBeenCalledWith(
            "UPDATE favorite_combos SET strikes = ?, super_favorite = ?, name = ? WHERE id = ?", 
            [JSON.stringify(['jab', 'cross']), 0, "My Combo", 1]
        )
    })
})

// describe what getFavoriteCombos does
describe("getFavoriteCombos", () => {
    it("should call executeSql and return formattated combos", async () => {
        // call function
        await getFavoriteCombos(mockDB);

        // ensure function is called with the correct parameters
        expect(mockDB.executeSql).toHaveBeenCalledWith("SELECT strikes FROM favorite_combos")
    })
})

// describe what getFavorites does
describe("getFavorites", () => {
    it("should call executeSql and return all favorite data", async () => {
        // call function
        await getFavorites(mockDB);

        // ensure function is called with the correct parameters
        expect(mockDB.executeSql).toHaveBeenCalledWith(
            "SELECT * FROM favorite_combos ORDER BY " + 
            "CASE WHEN super_favorite = 1 THEN 0 ELSE 1 END, " + 
            "CASE WHEN name IS NOT NULL AND name != '' THEN 0 ELSE 1 END, " + 
            "CASE WHEN name IS NOT NULL AND name != '' THEN name ELSE NULL END ASC,  id ASC "
        )
    })
})

// describe what deleteFavorites does
describe("deleteFavorite", () => {
    it("should call executeSql and delete favorite with the supplied id", async () => {
        // call function
        await deleteFavorite(mockDB, 0);

        // ensure function is called with the correct parameters
        expect(mockDB.executeSql).toHaveBeenCalledWith(
            "DELETE FROM favorite_combos WHERE id = ?", [0]
        )
    })
})

// describe what getStrikeSets does
describe("getStrikeSets", () => {
    it("should call executeSql and return all favorite data", async () => {
        // call function
        await getStrikeSets(mockDB);

        // ensure function is called with the correct parameters
        expect(mockDB.executeSql).toHaveBeenCalledWith("SELECT * FROM strike_sets ORDER BY id")
    })
})