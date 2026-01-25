// tests/FavoritesOverview.test.ts
// mock navigation to prevent jest errors
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useRoute: () => ({ params: {} }),
}));
import searchFavorites from "../utilities/Search";

describe('searchFavorites', () => {
    it ("should call 'setDisplayedList' to include results that contain 'text'", () => {
        // set up params
        const text = "Hello!";
        const setOption = jest.fn();
        const setDisplayedList = jest.fn();
        const fullList = [{name: "Hello!", id: 0}, {name: "Hello World!", id: 1}, {name: "Hello! World!", id: 2}, {name: "The quick brown fox jumped over the lazy dog", id: 3}, 
            {name: "My Name is ComboCreator, Hello!", id: 4}];

        // call function
        searchFavorites(text, setDisplayedList, fullList);
        // expect displayed list to be set to expected result
        expect(setDisplayedList).toHaveBeenCalledWith([{name: "Hello!", id: 0}, {name: "Hello! World!", id: 2}, {name: "My Name is ComboCreator, Hello!", id: 4}])
    })
})