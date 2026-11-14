// File: DefaultInfo.tsx
// Author: Tony Jordan
// Purpose: Holds all functions and variables related to SQLite database for this application.

import SQLite from 'react-native-sqlite-storage';
import type { SQLiteDatabase } from 'react-native-sqlite-storage';
import { challenges, migrate_Challenges } from './Challenges';


// instantiate database
SQLite.enablePromise(true);

export const getDBConnection = async () => {
  return await SQLite.openDatabase({name: 'combocreator.db', location: "default"})
};

// convert strikes to json
const boxingStrikes = JSON.stringify(["jab", "cross", "hook", "overhand", "lead-uppercut", "rear-uppercut"]);
const muayStrikes = JSON.stringify(["jab", "cross", "hook", "overhand", "lead-uppercut", "rear-uppercut", "knee", "teep", "round-kick"]);
const karateStrikes = JSON.stringify(["jab", "cross", "hook", "overhand", "lead-uppercut", "rear-uppercut", "knee", "side-kick", "round-kick", "double-punch", "ridge-hand", "palm-strike", "snap-kick", "heel-kick"]);
const devStrikes = JSON.stringify(["jab", 'cross', 'rear-hook', 'overhand', 'lead-uppercut', 'superman', 'double-punch', 'knee', 'rear-teep','switch-knee', 'switch-kick', 'r-hook-weave', 'lead-check', 'heel-kick', 'snap kick', 'ridgehand', 'rear-elbow', 'spinning kick', 'palm strike']);


// function for checking for default strike set updates
const checkDefault = async (db: SQLiteDatabase, name: String) => {
  const query = "SELECT strikes FROM strike_sets WHERE name = ?"
  const [result] = await db.executeSql(query, [name]);
  // return true or false if database strikes are equal to hard-coded defaults
  switch(name) {
    case 'Boxing':
      if (result.rows.item(0))
        return boxingStrikes == result.rows.item(0).strikes;
      else
        return false;
    case 'Muay Thai':
      if (result.rows.item(0))
        return muayStrikes == result.rows.item(0).strikes;
      else
        return false;
    case 'Karate':
      if (result.rows.item(0))
        return karateStrikes == result.rows.item(0).strikes;
      else
        return false;
    case 'Developer Set':
      if (result.rows.item(0))
        return devStrikes == result.rows.item(0).strikes;
      else
        return false;
    default:
      return false;
  }
}

// create table for whether or not the user is launching the game for the first time
const createTutorial = async (db: SQLiteDatabase) => {
  var query = ` CREATE TABLE IF NOT EXISTS tutorial (
      completed INTEGER
    )`
  await db.executeSql(query)

  // check to see if table is populated
  const [result] = await db.executeSql("SELECT COUNT(*) as count FROM tutorial");
  // enable tutorial on first install
  if (result.rows.item(0).count == 0) {
    query = `INSERT INTO tutorial (completed) VALUES (?)`
    await db.executeSql(query, [0])
  }
}

// create table for challenges
export const createChallengeTable = async (db: SQLiteDatabase) => {
  let query = ` CREATE TABLE IF NOT EXISTS challenges (
      name TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      achieved INTEGER NOT NULL DEFAULT 0,
      value INTEGER NOT NULL DEFAULT 0,
      thresholds TEXT NOT NULL,
      tier INTEGER
    )`
  await db.executeSql(query);
  // migrate challenges to new versions
  await migrate_Challenges(db);

  // ensure all challenges are present in database
  const [result] = await db.executeSql('SELECT * FROM challenges');
  const rows = []
  for (let x = 0; x < result.rows.length; x++) {
    let item;
    if ( result.rows.item(x).tier != undefined) {
      item = {
        name: result.rows.item(x).name,
        description: result.rows.item(x).description,
        achieved: result.rows.item(x).achieved,
        tier: result.rows.item(x).tier,
        thresholds: JSON.parse(result.rows.item(x).thresholds),
        value: result.rows.item(x).value
      }
    }
    else {
      item = {
        name: result.rows.item(x).name,
        description: result.rows.item(x).description,
        achieved: result.rows.item(x).achieved,
        thresholds: JSON.parse(result.rows.item(x).thresholds),
        value: result.rows.item(x).value
      }
    }
    rows.push(item)
  }
  console.log(rows);
  //console.log('DELETING ALL CHALLENGES')
  //await db.executeSql('DELETE FROM challenges')
  //await db.executeSql('DROP TABLE challenges')
  for (let x = 0; x < challenges.length; x++) {
    let found = false;
    for (let y = 0; y < rows.length; y++) {
      // if challenge is not in database, add
      if (rows[y].name == challenges[x].name) {
        found = true;
        break;
      }
    }
    if (!found) {
      console.log(challenges[x].name + " was marked as a new challenge")
      if (challenges[x].tier != undefined) {
        query = `INSERT INTO challenges (name, description, achieved, thresholds, value, tier) VALUES (?, ?, 0, ?, ?, ?)`;
        await db.executeSql(query, [challenges[x].name, challenges[x].description, challenges[x].thresholds, challenges[x].value, challenges[x].tier])
      }
      else {
        query = `INSERT INTO challenges (name, description, achieved, thresholds, value) VALUES (?, ?, 0, ?, 0)`;
        await db.executeSql(query, [challenges[x].name, challenges[x].description, challenges[x].thresholds])
      }
    }
  }
}

// function for getting challenges
export const getChallenges = async (db: SQLiteDatabase) => {
  const query = `SELECT * FROM challenges ORDER BY tier DESC`;
  const [result] = await db.executeSql(query);
  for (let x = 0; x < result.rows.length; x++) {
    result.rows.item(x).thresholds = JSON.parse(result.rows.item(x).thresholds);
  }
  return result;
}

// create table for recent workouts
export const createRecentWorkouts = async (db: SQLiteDatabase) => {
  let query = ` CREATE TABLE IF NOT EXISTS recent_workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time_spent TEXT NOT NULL
    )`;
  await db.executeSql(query);
}

// function for getting all recent workouts
export const getRecentWorkouts = async (db: SQLiteDatabase) => {
  const query = `SELECT * FROM recent_workouts`
  return await db.executeSql(query);
}

// function for adding recent workout to database
export const addRecentWorkout = async (db: SQLiteDatabase, date: string, time_spent: string) => {
  const query = 'INSERT INTO recent_workouts (date, time_spent) VALUES (?, ?)';
  await db.executeSql(query, [date, time_spent]);
}

// function for checking to ensure all recent workouts are not older than 7 days
export const updateRecentWorkouts = async (db: SQLiteDatabase, dates: string[]) => {
  // declare query variable
  const query = "DELETE FROM recent_workouts WHERE id=(?)";
  // get all recent workouts
  const [workouts] = await getRecentWorkouts(db);
  // iterate through all workouts and ensure they all take place on days specified in supplied array
  for (let x = 0; x < workouts.rows.length; x++) {
    if (!dates.includes(workouts.rows.item(x).date)) {
      console.log('removing recent workout ' + workouts.rows.item(x).date)
      await db.executeSql(query, [workouts.rows.item(x).id])
    }
  }
}

// create table for default strike sets
const createStrikeSets = async (db: SQLiteDatabase) => {
  const query = 
    ` CREATE TABLE IF NOT EXISTS strike_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      strikes TEXT,
      locked INTEGER DEFAULT 0
    )`;
  await db.executeSql(query);

  // if tables are empty, populate them
  const [result] = await db.executeSql("SELECT COUNT(*) as count FROM strike_sets");
  if (result.rows.item(0).count === 0) {
    await db.executeSql(`INSERT INTO strike_sets (name, strikes, locked, id) VALUES (?, ?, ?, ?)`, ['Boxing', boxingStrikes, 1, 1]);
    await db.executeSql(`INSERT INTO strike_sets (name, strikes, locked, id) VALUES (?, ?, ?, ?)`, ['Karate', karateStrikes, 1, 2]);
    await db.executeSql(`INSERT INTO strike_sets (name, strikes, locked, id) VALUES (?, ?, ?, ?)`, ['Muay Thai', muayStrikes, 1, 3]);
  }
}

const updateDefaultStrikeSets = async (db: SQLiteDatabase) => {
  // check for updates to default strike sets
  if (!await checkDefault(db, "Boxing")) {
    await db.executeSql("DELETE FROM strike_sets WHERE id = 1")
    await db.executeSql("INSERT INTO strike_sets (name, strikes, locked, id) VALUES (?, ?, ?, ?)", ['Boxing', boxingStrikes, 1, 1])
  }
  if (!await checkDefault(db, "Muay Thai")) {
    await db.executeSql("DELETE FROM strike_sets WHERE id = 3")
    await db.executeSql("INSERT INTO strike_sets (name, strikes, locked, id) VALUES (?, ?, ?, ?)", ['Muay Thai', muayStrikes, 1, 3])
  }
  if (!await checkDefault(db, "Karate")) {
    await db.executeSql("DELETE FROM strike_sets WHERE id = 2")
    await db.executeSql("INSERT INTO strike_sets (name, strikes, locked, id) VALUES (?, ?, ?, ?)", ['Karate', karateStrikes, 1, 2])
  }
  if (!await checkDefault(db, "Developer Set")) {
    await db.executeSql("DELETE FROM strike_sets WHERE id = 0")
    await db.executeSql("INSERT INTO strike_sets (name, strikes, locked, id) VALUES (?, ?, ?, ?)", ['Developer Set', devStrikes, 1, 0])
  }
}

// create table for holding report data
const createStatisticsTable = async (db: SQLiteDatabase) => {
  const query =
    ` CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT,
      date TEXT
    )`;
    await db.executeSql(query);
}

// create table for holding favorite combo data
const createFavoritesTable = async (db: SQLiteDatabase) => {
  const query =
    ` CREATE TABLE IF NOT EXISTS favorite_combos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      strikes TEXT,
      name TEXT,
      super_favorite INTEGER
    )`;
    await db.executeSql(query);
}

// function for adding to favorites from scratch
export const addFavoriteByScratch = async (db: SQLiteDatabase, combo: string, superfavorite: number, name: string) => {
  const query = `INSERT INTO favorite_combos (strikes, super_favorite, name) VALUES (?, ?, ?)`
  await db.executeSql(query, [combo, superfavorite, name]);
}

// function for adding new favorite to favorites table
export const addToFavorites = async (db: SQLiteDatabase, combo: string, superfavorite: number) => {
  const query = `INSERT INTO favorite_combos (strikes, super_favorite) VALUES (?, ?)`
  await db.executeSql(query, [combo, superfavorite]);
}

// function for updating existing favorite by favorite id
export const updateFavorite = async (db: SQLiteDatabase, combo: string, superfavorite: number, id: number, name: string) => {
  const query = `UPDATE favorite_combos SET strikes = ?, super_favorite = ?, name = ? WHERE id = ?`
  await db.executeSql(query, [combo, superfavorite, name, id])
}

// function for getting all strike data from favorite combos in favorites table
export const getFavoriteCombos = async (db: SQLiteDatabase) => {
  var output: any[] = [];
  const [result] = await db.executeSql("SELECT strikes FROM favorite_combos");
  for (let x = 0; x < result.rows.length; x++) {
    const row = result.rows.item(x);
    output.push(JSON.parse(row.strikes));
  }
  return output;
}

// function for getting all favorites from favorites table
export const getFavorites = async (db: SQLiteDatabase) => {
  var output: any[] = [];
  const [result] = await db.executeSql("SELECT * FROM favorite_combos ORDER BY " + 
    "CASE WHEN super_favorite = 1 THEN 0 ELSE 1 END, " + 
    "CASE WHEN name IS NOT NULL AND name != '' THEN 0 ELSE 1 END, " + 
    "CASE WHEN name IS NOT NULL AND name != '' THEN name ELSE NULL END ASC,  id ASC ");
  for (let x = 0; x < result.rows.length; x++) {
    const row = result.rows.item(x);
    output.push(row);
  }
  return output;
}

// function for deleting a favorite based on its id
export const deleteFavorite = async (db: SQLiteDatabase, id: number) => {
  const query = `DELETE FROM favorite_combos WHERE id = ?`
  await db.executeSql(query, [id])
}

// function for getting all strike sets from strike_sets table
export const getStrikeSets = async (db: SQLiteDatabase) => {
  var output = [];
  const query = `SELECT * FROM strike_sets ORDER BY id`;

  const [result] = await db.executeSql(query);

  for (let x = 0; x < result.rows.length; x++) {
    const row = result.rows.item(x)
    output.push({id: row.id, name: row.name, strikes: row.strikes, locked: row.locked});
  }
  return output;
}

// function for getting all default strike sets that cannot be changed.
export const getLockedStrikeSets = async (db: SQLiteDatabase) => {
  var output = [];
  const query = `SELECT * FROM strike_sets WHERE locked = 1 ORDER BY id`;

  const [result] = await db.executeSql(query);

  for (let x = 0; x < result.rows.length; x++) {
    const row = result.rows.item(x)
    output.push({id: row.id, name: row.name, strikes: row.strikes, locked: row.locked});
  }
  return output;
}

// function for creating new stirke set based on supplied attributes.
export const createStrikeSet = async (db:SQLiteDatabase, strikes:string, name:string, locked:number) => {
  const query = `INSERT INTO strike_sets (strikes, name, locked) VALUES (?, ?, ?)`
  await db.executeSql(query, [strikes, name, locked]);
}

// function for deleting strike sets by ID
export const deleteStrikeSet = async (db:SQLiteDatabase, id:number) => {
  const query = `DELETE FROM strike_sets WHERE id = (?)`
  await db.executeSql(query, [id]);
}

// function for updating a strike set by ID
export const updateStrikeSet = async (db: SQLiteDatabase, id:number, name:string, strikes:string, locked:number) => {
  const query = `UPDATE strike_sets SET strikes = ?, name = ?, locked = ? WHERE id = ?`
  await db.executeSql(query, [strikes, name, locked, id]);
}

// function for getting strike set from strike sets table by id
export const getStrikeSetByID = async (db: SQLiteDatabase, id: string) => {
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    throw new Error('Invalid ID passed to query.');
  }

  const query = `SELECT * FROM strike_sets WHERE id = (?)`;
  const [result] = await db.executeSql(query, [parsedId]);

  const row = result.rows.item(0)
  const output = {id: row.id, name: row.name, strikes: row.strikes, locked: row.locked};
  return output;
}

// function for adding a new entry to reports data based on supplied attributes.
export const createReport = async (db: SQLiteDatabase, data: string, date: string) => {
  const query = "INSERT INTO reports (data, date) VALUES (?, ?)"
  await db.executeSql(query, [data, date]);
}

// function for getting all reports from reports table
export const getReports = async (db: SQLiteDatabase) => {
  const query = "SELECT * FROM reports ORDER BY date";
  const [result] = await db.executeSql(query);
  var output = [];
  for (let x = 0; x < result.rows.length; x++) {
    const row = result.rows.item(x)
    output.push({id: row.id, data: row.data, date: row.date})
  }
  return output
}

// function for deleting reports from the report table by ID
export const deleteReport = async (db: SQLiteDatabase, id: number) => {
  const query = "DELETE FROM reports WHERE id = (?)";
  await db.executeSql(query, [id]);
}

// function for getting report from report table by ID
export const getReportById = async (db: SQLiteDatabase, id: number) => {
  const query = "SELECT * FROM reports WHERE id = (?)";
  const [result] = await db.executeSql(query, [id]);
  const row = result.rows.item(0);
  return {data: row.data, date: row.date};
}

// function for initializing database, and creating tables (if they do not already exist)
export const initDatabase = async () => {
  try {
    const db = await getDBConnection();
    await createStrikeSets(db);
    await createFavoritesTable(db);
    await createStatisticsTable(db);
    await createTutorial(db);
    await createRecentWorkouts(db);
    await createChallengeTable(db);
    await updateDefaultStrikeSets(db);
    return db;
  }
  catch(e) {
    console.error(e)
  }
}

// DataSet type
export type DataSet = {
  id: number;
  name: string;
  strikes: string;
  locked?: number;
};

// function for randomizing a supplied 2D array of combos (specifically used when )
export function randomizeCombos(arr: string[][]) {
  let currentIndex = arr.length;
  let randomIndex: number;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }
  return arr;
}

export function randomizeArray(arr: any[]) {
  let currentIndex = arr.length;
  let randomIndex: number;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    const temp = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = temp;

  }
  return arr;
}
