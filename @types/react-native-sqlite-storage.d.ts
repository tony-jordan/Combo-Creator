declare module 'react-native-sqlite-storage' {
  export interface ResultSetRowList {
    length: number;
    item(index: number): any;
  }

  export interface ResultSet {
    rows: ResultSetRowList;
  }

  export interface SQLiteDatabase {
    executeSql(
      sqlStatement: string,
      args?: any[]
    ): Promise<[ResultSet]>;
    close(): Promise<void>;
  }

  export interface OpenDatabaseParams {
    name: string;
    location: string;
  }

  const SQLite: {
    openDatabase(params: OpenDatabaseParams): Promise<SQLiteDatabase>;
    enablePromise(enable: boolean): void;
  };

  export default SQLite;
}