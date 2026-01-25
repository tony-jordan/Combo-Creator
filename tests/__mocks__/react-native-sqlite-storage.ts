// Mock for react-native-sqlite-storage
const mockExecuteSql = jest.fn(async (query?: string, params?: any[]) => {
  return [
    {
      rows: {
        length: 0,
        item: (index: number) => ({}),
      },
    },
  ];
});

const mockOpenDatabase = jest.fn(async (params?: any) => {
  return {
    executeSql: mockExecuteSql,
  };
});

const SQLiteMock = {
  enablePromise: jest.fn(),
  openDatabase: mockOpenDatabase,
};

export default SQLiteMock;
export const enablePromise = SQLiteMock.enablePromise;
export const openDatabase = SQLiteMock.openDatabase;