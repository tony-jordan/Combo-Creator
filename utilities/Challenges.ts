// FileName: Challenges.ts
// Author: Tony Jordan
// Desc: holds challenge hard coded data.

import type { SQLiteDatabase } from 'react-native-sqlite-storage';
import { migration_challenges } from './ChallengeMigration';

export type metrics = {name: string, value: number, tier: number, threshold: number};

export const guidedWorkoutChallenges = [
  JSON.stringify(['Jab-Roookie', 'Apprentice Jabber', 'Intermediate Jabber', 'Professional Jabber', 'Master Jabber', 'God-Tier Jabber']),
  JSON.stringify(['Cross-Rookie', 'Apprentice Crosser', 'Intermediate Crosser', 'Professional Crosser', 'Master Crosser', 'God-Tier Crosser']),
  JSON.stringify(['Hook-Rookie', 'Apprentice Hooker', 'Intermediate Hooker', 'Professional Hooker', 'Master Hooker', 'God-Tier Hooker']),
  JSON.stringify(['Uppercut-Rookie', 'Uppercut Apprentice', 'Intermediate Uppercutter', 'Uppercut Professional', 'Uppercut Master', 'God-Tier Uppercutter']),
  JSON.stringify(['Overhand-Rookie', 'Overhand Apprentice', 'Intermediate Overhander', 'Overhand Professional', 'Overhand Master', 'God-Tier Overhander']),
  JSON.stringify(['Ridge-Hand-Rookie', 'Ridge-Hand Apprentice', 'Intermediate Ridge-hander', 'Ridge-Hand Professional', 'Ridge-Hand Master', 'God-Tier Ridge-hander']),
  JSON.stringify(['Sidekick','Amateur Hero', 'Anti-Hero','Bona-fide Superhero','Planet Defender', 'World Conquerer']),
  JSON.stringify(['Round-Kick-Rookie', 'Round Kick Apprentice', 'Intermediate Round Kicker', 'Round Kick Professional', 'Round Kick Master', 'God-Tier Round Kicker']),
  JSON.stringify(['Knee-Rookie', 'Knee Apprentice', 'Intermediate Knee-er', 'Knee Professional', 'Knee Master', 'God-Tier Knee-er']),
  'Banshee Crusher',
  JSON.stringify(['Palm-Strike-Rookie', 'Palm Strike Apprentice', 'Intermediate Palm Striker', 'Palm Strike Professional', 'Palm Strike Master', 'God-Tier Palm Striker']),
  JSON.stringify(['Snap-Kick-Rookie', 'Snap Kick Apprentice', 'Intermediate Snap Kicker', 'Snap Kick Professional', 'Snap Kick Master', 'God-Tier Snap Kicker']),
  JSON.stringify(['Heel-Kick-Rookie', 'Heel Kick Apprentice', 'Intermediate Heel Kicker', 'Heel Kick Professional', 'Heel Kick Master', 'God-Tier Heel Kicker']),
  JSON.stringify(['Teep-Rookie', 'Teep Apprentice', 'Intermediate Teeper', 'Teep Professional', 'Teep Master', 'God-Tier Teeper']),
  JSON.stringify(['Elbow-Rookie', 'Elbow Apprentice', 'Intermediate Elbower', 'Elbow Professional', 'Elbow Master', 'God-Tier Elbower']),
  'Tatsumaki',
  'Nut Buster',
  JSON.stringify(['Double-Punch-Rookie', 'Double Punch Apprentice', 'Intermediate Double Puncher', 'Double Punch Professional', 'Double Punch Master', 'God-Tier Double Puncher']),
  'Legs of Steel',
  'Ultra Instinct',
  'I fear not the man who has practiced 1000 strikes',
  'I fear the man who has practiced one strike 1000 times'
]

// function for getting all values of given challenges for end of workout summary animations and such
export const getChallengeValues = async (db: SQLiteDatabase, names: string[]) => {
  let query = `SELECT name, value, tier, thresholds FROM Challenges WHERE name = (?)`
  for (let x = 0; x < names.length; x++) {
    if (x > 0) {
      query += " OR name = (?)"
    }
  }
  const [result] = await db.executeSql(query, names)
  const values : metrics[] = []
  for (let x = 0; x < result.rows.length; x++) {
    const thresholds = JSON.parse(result.rows.item(x).thresholds)
    if (result.rows.item(x).tier)
      values.push({name: result.rows.item(x).name, value: result.rows.item(x).value, tier: result.rows.item(x).tier, threshold: thresholds[result.rows.item(x).tier]});
    else
      values.push({name: result.rows.item(x).name, value: result.rows.item(x).value, tier: result.rows.item(x).tier, threshold: thresholds[0]});
  }
  return values;
}

// function for getting highest strike count for challenge updating
export const setHighestStrikeCount = async (db: SQLiteDatabase) => {
  const [result] = await db.executeSql(`SELECT * FROM challenges WHERE tier IS NOT NULL`);
  let highIndex = 0;
  for (let x = 0; x < result.rows.length; x++) {
    if (result.rows.item(highIndex).value < result.rows.item(x).value) {
      highIndex = x;
    }
  }

  const query = `UPDATE challenges SET value = (?) WHERE name = 'I fear the man who has practiced one strike 1000 times'`;
  await db.executeSql(query, [result.rows.item(highIndex).value])
  await updateChallenge(db, 'I fear the man who has practiced one strike 1000 times', 0);
}

// function for increasing the value of a challenge entry by name
export const updateChallenge = async (db: SQLiteDatabase, name: string, amount: number) => {
  const [result] = await db.executeSql(`SELECT * FROM challenges WHERE name = (?)`, [name]);
  const entry = result.rows.item(0);
  console.log('increasing challenge: ' + name + " by: " + amount + ' = ' + (entry.value + amount));
  entry.thresholds = JSON.parse(entry.thresholds);
  try {
    if (!entry.achieved) {
    if (entry.tier != undefined) {
      if (entry.value + amount >= entry.thresholds[entry.tier]) {
        // if last tier has been passed, set achieved 
        if (entry.tier == entry.thresholds.length - 1) {
          const q  = `UPDATE challenges SET achieved = (?), tier = (?), value = (?) WHERE name = (?)`;
          await db.executeSql(q, [1, entry.tier + 1, entry.value + amount, name]);
          return true;
        }
        else {
            // account for multiple tiers being updated
            let temp = entry.tier;
            while (entry.value + amount >= entry.thresholds[temp]) {
              temp += 1
            }
          const q =  `UPDATE challenges SET tier = (?), value = (?) WHERE name = (?)`;
          await db.executeSql(q, [temp, entry.value + amount, name]);
          return true
        }
      }
      else {
        const q = `UPDATE challenges SET value = (?) WHERE name = (?)`;
        await db.executeSql(q, [entry.value + amount, name]);
      }
    }
    else {
      if (entry.value + amount >= entry.thresholds[0]) {
        const q  = `UPDATE challenges SET achieved = (?), value = (?) WHERE name = (?)`;
        await db.executeSql(q, [1, entry.value + amount, name]);
        return true;
      }
      else {
        const q = `UPDATE challenges SET value = (?) WHERE name = (?)`;
        await db.executeSql(q, [entry.value + amount, name]);
      }
    }
  }
  else {
    const q = `UPDATE challenges SET value = (?) WHERE name = (?)`;
    await db.executeSql(q, [entry.value + amount, name]);
  }
  
  return false;
  }
  catch (e) {
    console.error(e + '\n' + entry.name);
  }
}

// function for adding new detected challenges
async function add_challenges(db: SQLiteDatabase) {
  // ensure all challenges are present in database
  let query;
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

// function for updating database with challenge changes. Preserves user stats
export async function migrate_Challenges(db: SQLiteDatabase) {
  for (let x = 0; x < migration_challenges.length; x++) {
    // check to see if challenge has been migrated.
    const existence_check = `SELECT * FROM challenges WHERE name = (?)`
    const [check] = await db.executeSql(existence_check, [migration_challenges[x].old_name]);
    // if old challenge is still present, update it
    if (check.rows.length > 0) {
      // grab attributes from old challenge
      const value = check.rows.item(0).value;
      // update name, description, rollback achieved if new tiers have not been eclipsed
      // update thresholds and tier based on new thresholds.
      const update_query = `UPDATE challenges SET name = (?), description = (?), achieved = (?),
        tier = (?), thresholds = (?) WHERE name = (?)`;
      // find new description from challenge list
      const new_challenge = challenges.find((item) => item.name == migration_challenges[x].new_name);
      if (new_challenge) {
        // parse thresholds
        const thresholds = JSON.parse(new_challenge.thresholds);
        // set achieved if user value is greater >= highest threshold
        const achieved = (value >= thresholds[thresholds.length - 1])
        // find current tier based on challenge thresholds
        let tier = 0;
        for(let i = 0; i < thresholds.length; i++) {
          if (value >= thresholds[i]) {
            tier++;
          }
        }
        await db.executeSql(update_query, [migration_challenges[x].new_name, new_challenge.description, 
          achieved, tier, new_challenge.thresholds, migration_challenges[x].old_name]);
      }
    }
  }
  // add any missing challenges
  await add_challenges(db);
}

// function for easily getting challenges based on strike name
export function get_base_challenge_name_by_strike(name: string) {
  const result = guidedWorkoutChallenges.find((item) => item.includes(name));
  return result;
}

export const challenges = [
// jab
  {
    name: JSON.stringify([
      'Jab-Roookie',
      'Apprentice Jabber',
      'Intermediate Jabber',
      'Professional Jabber',
      'Master Jabber',
      'God-Tier Jabber'
    ]),
    description: JSON.stringify([
      'Throw 100 total jabs in guided workouts',
      'Throw 250 total jabs in guided workouts',
      'Throw 500 total jabs in guided workouts',
      'Throw 750 total jabs in guided workouts',
      'Throw 1000 total jabs in guided workouts',
      'Throw 1500 total jabs in guided workouts'
    ]),
    regex: /^jab$/,
    thresholds: JSON.stringify([100, 250, 500, 750, 1000, 1500]),
    value: 0,
    achieved: 0,
    tier: 0,
  },

  // cross
  {
    name: JSON.stringify([
      'Cross-Rookie',
      'Apprentice Crosser',
      'Intermediate Crosser',
      'Professional Crosser',
      'Master Crosser',
      'God-Tier Crosser'
    ]),
    description: JSON.stringify([
      'Throw 100 total crosses in guided workouts',
      'Throw 250 total crosses in guided workouts',
      'Throw 500 total crosses in guided workouts',
      'Throw 750 total crosses in guided workouts',
      'Throw 1000 total crosses in guided workouts',
      'Throw 1500 total crosses in guided workouts'
    ]),
    regex: /^cross$/,
    thresholds: JSON.stringify([100, 250, 500, 750, 1000, 1500]),
    value: 0,
    achieved: 0,
    tier: 0,
  },

  // hook
  {
    name: JSON.stringify([
      'Hook-Rookie',
      'Apprentice Hooker',
      'Intermediate Hooker',
      'Professional Hooker',
      'Master Hooker',
      'God-Tier Hooker'
    ]),
    description: JSON.stringify([
      'Throw 100 total hooks in guided workouts',
      'Throw 250 total hooks in guided workouts',
      'Throw 500 total hooks in guided workouts',
      'Throw 750 total hooks in guided workouts',
      'Throw 1000 total hooks in guided workouts',
      'Throw 1500 total hooks in guided workouts'
    ]),
    regex: /^hook$/,
    thresholds: JSON.stringify([100, 250, 500, 750, 1000, 1500]),
    value: 0,
    achieved: 0,
    tier: 0,
  },

  // overhand
  {
    name: JSON.stringify([
      'Overhand-Rookie',
      'Overhand Apprentice',
      'Intermediate Overhander',
      'Overhand Professional',
      'Overhand Master',
      'God-Tier Overhander'
    ]),
    description: JSON.stringify([
      'Throw 100 total overhands in guided workouts',
      'Throw 250 total overhands in guided workouts',
      'Throw 500 total overhands in guided workouts',
      'Throw 750 total overhands in guided workouts',
      'Throw 1000 total overhands in guided workouts',
      'Throw 1500 total overhands in guided workouts'
    ]),
    regex: /^over[- ]?hand$/,
    thresholds: JSON.stringify([100, 250, 500, 750, 1000, 1500]),
    value: 0,
    achieved: 0,
    tier: 0,
  },

  // uppercut
  {
    name: JSON.stringify([
      'Uppercut-Rookie',
      'Uppercut Apprentice',
      'Intermediate Uppercutter',
      'Uppercut Professional',
      'Uppercut Master',
      'God-Tier Uppercutter'
    ]),
    description: JSON.stringify([
      'Throw 100 total uppercuts in guided workouts',
      'Throw 250 total uppercuts in guided workouts',
      'Throw 500 total uppercuts in guided workouts',
      'Throw 750 total uppercuts in guided workouts',
      'Throw 1000 total uppercuts in guided workouts',
      'Throw 1500 total uppercuts in guided workouts'
    ]),
    regex: /^upper[- ]?cut$/,
    thresholds: JSON.stringify([100, 250, 500, 750, 1000, 1500]),
    value: 0,
    achieved: 0,
    tier: 0,
  },

  // superman
  {
    name: JSON.stringify([
      'Sidekick',
      'Amateur Hero',
      'Anti-Hero',
      'Bona-fide Superhero',
      'Planet Defender',
      'World Conquerer'
    ]),
    description: JSON.stringify([
      'Throw 100 total superman punches in guided workouts',
      'Throw 250 total superman punches in guided workouts',
      'Throw 500 total superman punches in guided workouts',
      'Throw 750 total superman punches in guided workouts',
      'Throw 1000 total superman punches in guided workouts',
      'Throw 1500 total superman punches in guided workouts'
    ]),
    regex: /^super[- ]?man$/,
    thresholds: JSON.stringify([100, 250, 500, 750, 1000, 1500]),
    value: 0,
    achieved: 0,
    tier: 0,
  },

  // round kick
  {
    name: JSON.stringify([
      'Round-Kick-Rookie',
      'Round Kick Apprentice',
      'Intermediate Round Kicker',
      'Round Kick Professional',
      'Round Kick Master',
      'God-Tier Round Kicker'
    ]),
    description: JSON.stringify([
      'Throw 100 total round kicks in guided workouts',
      'Throw 250 total round kicks in guided workouts',
      'Throw 500 total round kicks in guided workouts',
      'Throw 750 total round kicks in guided workouts',
      'Throw 1000 total round kicks in guided workouts',
      'Throw 1500 total round kicks in guided workouts'
    ]),
    regex: /^(round[- ]?(kicks|houses)|switch[- ]?kicks)$/,
    thresholds: JSON.stringify([100, 250, 500, 750, 1000, 1500]),
    value: 0,
    achieved: 0,
    tier: 0,
  },

  // knee
  {
    name: JSON.stringify([
      'Knee-Rookie',
      'Knee Apprentice',
      'Intermediate Knee-er',
      'Knee Professional',
      'Knee Master',
      'God-Tier Knee-er'
    ]),
    description: JSON.stringify([
      'Throw 100 total knees in guided workouts',
      'Throw 250 total knees in guided workouts',
      'Throw 500 total knees in guided workouts',
      'Throw 750 total knees in guided workouts',
      'Throw 1000 total knees in guided workouts',
      'Throw 1500 total knees in guided workouts'
    ]),
    regex: /^knee$/,
    thresholds: JSON.stringify([100, 250, 500, 750, 1000, 1500]),
    value: 0,
    achieved: 0,
    tier: 0,
  },

  // double punch
  {
    name: JSON.stringify([
      'Double-Punch-Rookie',
      'Double Punch Apprentice',
      'Intermediate Double Puncher',
      'Double Punch Professional',
      'Double Punch Master',
      'God-Tier Double Puncher'
    ]),
    description: JSON.stringify([
      'Throw 100 total double punches in guided workouts',
      'Throw 250 total double punches in guided workouts',
      'Throw 500 total double punches in guided workouts',
      'Throw 750 total double punches in guided workouts',
      'Throw 1000 total double punches in guided workouts',
      'Throw 1500 total double punches in guided workouts'
    ]),
    regex: /^double[- ]?punch$/i,
    thresholds: JSON.stringify([100, 250, 500, 750, 1000, 1500]),
    value: 0,
    achieved: 0,
    tier: 0,
  },

  // ridge hand
  {
    name: JSON.stringify([
      'Ridge-Hand-Rookie',
      'Ridge-Hand Apprentice',
      'Intermediate Ridge-hander',
      'Ridge-Hand Professional',
      'Ridge-Hand Master',
      'God-Tier Ridge-hander'
    ]),
    description: JSON.stringify([
      'Throw 100 total ridge hands in guided workouts',
      'Throw 250 total ridge hands in guided workouts',
      'Throw 500 total ridge hands in guided workouts',
      'Throw 750 total ridge hands in guided workouts',
      'Throw 1000 total ridge hands in guided workouts',
      'Throw 1500 total ridge hands in guided workouts'
    ]),
    regex: /^ridge[- ]?hand$/i,
    thresholds: JSON.stringify([100, 250, 500, 750, 1000, 1500]),
    value: 0,
    achieved: 0,
    tier: 0,
  },

  // palm strike
  {
    name: JSON.stringify([
      'Palm-Strike-Rookie',
      'Palm Strike Apprentice',
      'Intermediate Palm Striker',
      'Palm Strike Professional',
      'Palm Strike Master',
      'God-Tier Palm Striker'
    ]),
    description: JSON.stringify([
      'Throw 100 total palm strikes in guided workouts',
      'Throw 250 total palm strikes in guided workouts',
      'Throw 500 total palm strikes in guided workouts',
      'Throw 750 total palm strikes in guided workouts',
      'Throw 1000 total palm strikes in guided workouts',
      'Throw 1500 total palm strikes in guided workouts'
    ]),
    regex: /^palm[- ]?strike$/i,
    thresholds: JSON.stringify([100, 250, 500, 750, 1000, 1500]),
    value: 0,
    achieved: 0,
    tier: 0,
  },

  // snap kick
  {
    name: JSON.stringify([
      'Snap-Kick-Rookie',
      'Snap Kick Apprentice',
      'Intermediate Snap Kicker',
      'Snap Kick Professional',
      'Snap Kick Master',
      'God-Tier Snap Kicker'
    ]),
    description: JSON.stringify([
      'Throw 100 total snap kicks in guided workouts',
      'Throw 250 total snap kicks in guided workouts',
      'Throw 500 total snap kicks in guided workouts',
      'Throw 750 total snap kicks in guided workouts',
      'Throw 1000 total snap kicks in guided workouts',
      'Throw 1500 total snap kicks in guided workouts'
    ]),
    regex: /^snap[- ]?kick$/i,
    thresholds: JSON.stringify([100, 250, 500, 750, 1000, 1500]),
    value: 0,
    achieved: 0,
    tier: 0,
  },

  // heel kick
  {
    name: JSON.stringify([
      'Heel-Kick-Rookie',
      'Heel Kick Apprentice',
      'Intermediate Heel Kicker',
      'Heel Kick Professional',
      'Heel Kick Master',
      'God-Tier Heel Kicker'
    ]),
    description: JSON.stringify([
      'Throw 100 total heel kicks in guided workouts',
      'Throw 250 total heel kicks in guided workouts',
      'Throw 500 total heel kicks in guided workouts',
      'Throw 750 total heel kicks in guided workouts',
      'Throw 1000 total heel kicks in guided workouts',
      'Throw 1500 total heel kicks in guided workouts'
    ]),
    regex: /^heel[- ]?kick$/i,
    thresholds: JSON.stringify([100, 250, 500, 750, 1000, 1500]),
    value: 0,
    achieved: 0,
    tier: 0,
  },

  // teep
  {
    name: JSON.stringify([
      'Teep-Rookie',
      'Teep Apprentice',
      'Intermediate Teeper',
      'Teep Professional',
      'Teep Master',
      'God-Tier Teeper'
    ]),
    description: JSON.stringify([
      'Throw 100 total teeps in guided workouts',
      'Throw 250 total teeps in guided workouts',
      'Throw 500 total teeps in guided workouts',
      'Throw 750 total teeps in guided workouts',
      'Throw 1000 total teeps in guided workouts',
      'Throw 1500 total teeps in guided workouts'
    ]),
    regex: /^teep$/,
    thresholds: JSON.stringify([100, 250, 500, 750, 1000, 1500]),
    value: 0,
    achieved: 0,
    tier: 0,
  },
// elbows
  {
  name: JSON.stringify([
    'Elbow-Rookie',
    'Elbow Apprentice',
    'Intermediate Elbower',
    'Elbow Professional',
    'Elbow Master',
    'God-Tier Elbower'
  ]),
  description: JSON.stringify([
    'Throw 100 total elbows in guided workouts',
    'Throw 250 total elbows in guided workouts',
    'Throw 500 total elbows in guided workouts',
    'Throw 750 total elbows in guided workouts',
    'Throw 1000 total elbows in guided workouts',
    'Throw 1500 total elbows in guided workouts'
  ]),
  regex: /^elbow$/,
  thresholds: JSON.stringify([100, 250, 500, 750, 1000, 1500]),
  value: 0,
  achieved: 0,
  tier: 0,
},
// other basic challenges 
{ name: JSON.stringify(['Your Single Step',
  'A Double',
  'A Turkey',
  'A Quad',
  'The Big V',
  'Wind down a bit huh?',
  'You should probably get some rest'
  ]), 
  description: JSON.stringify(['Complete any type of workout',
  'Complete any type of workout two consecutive days in a week',
  'Complete any type of workout three consecutive days in a week',
  'Complete any type of workout four consecutive days in a week',
  'Complete any type of workout five consecutive days in a week',
  'Complete any type of workout six consecutive days in a week',
  'Complete any type of workout seven consecutive days in a week'
  ]),
  achieved: 0, 
  thresholds: JSON.stringify([1, 2, 3, 4, 5, 6, 7]), 
  value: 0,
  tier: 0,
}, 
{ name: 'Unorthodox Combo Enjoyer', description: 'Complete a Guided Workout.', achieved: 0, thresholds: JSON.stringify([1]), value: 0}, 
{ name: 'Honorary Boxer', description: 'Complete a timed workout.', achieved: 0, thresholds: JSON.stringify([1]), value: 0}, 
{ name: "A Journey's Beginning", description: 'Save your first favorite combo.', achieved: 0, thresholds: JSON.stringify([1]), value: 0}, 
{ name: 'You know what you like', description: 'Save your first custom strike set.', achieved: 0, thresholds: JSON.stringify([1]), value: 0}, 
// advanced challenges 
{ name: 'Nut Buster', description: 'Throw 1000 combined double-punches and knees.', achieved: 0, thresholds: JSON.stringify([1000]), value: 0}, 
{ name: 'Legs of Steel', description: 'Throw 2000 combined round kicks and checks.', achieved: 0, thresholds: JSON.stringify([2000]), value: 0}, 
{ name: 'Tatsumaki', description: 'Throw 2000 combined spinning strikes.', achieved: 0, thresholds: JSON.stringify([2000]), value: 0}, 
{ name: 'Banshee Crusher', description: 'Throw 1117 total super man strikes.', achieved: 0, thresholds: JSON.stringify([1117]), value: 0}, 
{ name: 'Ultra Instinct', description: 'Throw 1000 total weaves, blocks or checks.', achieved: 0, thresholds: JSON.stringify([1000]), value: 0}, 
{ name: 'I fear not the man who has practiced 1000 strikes', description: 'Throw 1000 total strikes.', achieved: 0, thresholds: JSON.stringify([1000]), value: 0}, 
{ name: 'I fear the man who has practiced one strike 1000 times', description: 'Throw any single strike 1000 times.', achieved: 0, thresholds: JSON.stringify([1000]), value: 0}, 
{ name: 'Hyperbolic Time Chamber', description: 'Complete 100 total hours all workouts.', achieved: 0, thresholds: JSON.stringify([100]), value: 0}, 
{ name: 'More like Mike', description: 'Complete 223 total rounds on timed workouts.', achieved: 0, thresholds: JSON.stringify([223]), value: 0}, 
{ name: 'Float like a butterfly', description: 'Complete 548 total rounds on timed workouts.', achieved: 0, thresholds: JSON.stringify([548]), value: 0}, 
{ name: 'Insane Worker', description: 'Complete 4 hours of workouts in a single day.', achieved: 0, thresholds: JSON.stringify([4]), value: 0},
]


export const medalImages = [
  {
    name: 'Unorthodox Combo Enjoyer',
    items: [require('../assets/medals/Unorthodox-Combo-Enjoyer.png')]
  },

  {
    name: 'Honorary Boxer',
    items: [require('../assets/medals/Honorary-Boxer.png')]
  },

  {
    name: "A Journey's Beginning",
    items: [require("../assets/medals/A-Journey's-Beginning.png")]
  },

  {
    name: "You know what you like",
    items: [require("../assets/medals/You-know-what-you-like.png")]
  },

  {
    name: "Nut Buster",
    items: [require("../assets/medals/Nut-Buster.png")]
  },

  {
    name: "Legs of Steel",
    items: [require("../assets/medals/Legs-of-Steel.png")]
  },

  {
    name: "Tatsumaki",
    items: [require("../assets/medals/Tatsumaki.png")]
  },

  {
    name: "Banshee Crusher",
    items: [require("../assets/medals/Banshee-Crusher.png")]
  },

  {
    name: "Ultra Instinct",
    items: [require("../assets/medals/Ultra-Instinct.png")]
  },

  {
    name: "I fear not the man who has practiced 1000 strikes",
    items: [require("../assets/medals/I-fear-not-the-man-who-has-practiced-1000-strikes.png")]
  },

  {
    name: "I fear the man who has practiced one strike 1000 times",
    items: [require("../assets/medals/I-fear-the-man-who-has-practiced-one-strike-1000-times.png")]
  },

  {
    name: "Hyperbolic Time Chamber",
    items: [require("../assets/medals/Hyperbolic-Time-Chamber.png")]
  },

  {
    name: "More like Mike",
    items: [require("../assets/medals/More-like-Mike.png")]
  },

  {
    name: "Float like a butterfly",
    items: [require("../assets/medals/Float-like-a-butterfly.png")]
  },

   {
    name: "Insane Worker",
    items: [require("../assets/medals/Insane-Worker.png")]
  },

  {
    name: "Your Single Step",
    items: [
      require('../assets/medals/Your-Single-Step/t1.png'),
      require('../assets/medals/Your-Single-Step/t2.png'),
      require('../assets/medals/Your-Single-Step/t3.png'),
      require('../assets/medals/Your-Single-Step/t4.png'),
      require('../assets/medals/Your-Single-Step/t5.png'),
      require('../assets/medals/Your-Single-Step/t6.png'),
      require('../assets/medals/Your-Single-Step/t7.png'),
    ],
  },

  {
    name: "Jab-Roookie",
    items: [
      require('../assets/medals/Jab-Rookie/t1.png'),
      require('../assets/medals/Jab-Rookie/t2.png'),
      require('../assets/medals/Jab-Rookie/t3.png'),
      require('../assets/medals/Jab-Rookie/t4.png'),
      require('../assets/medals/Jab-Rookie/t5.png'),
      require('../assets/medals/Jab-Rookie/t6.png'),
    ],
  },

  {
    name: "Cross-Rookie",
    items: [
      require('../assets/medals/Cross-Rookie/t1.png'),
      require('../assets/medals/Cross-Rookie/t2.png'),
      require('../assets/medals/Cross-Rookie/t3.png'),
      require('../assets/medals/Cross-Rookie/t4.png'),
      require('../assets/medals/Cross-Rookie/t5.png'),
      require('../assets/medals/Cross-Rookie/t6.png'),
    ],
  },

  {
    name: "Hook-Rookie",
    items: [
      require('../assets/medals/Hook-Rookie/t1.png'),
      require('../assets/medals/Hook-Rookie/t2.png'),
      require('../assets/medals/Hook-Rookie/t3.png'),
      require('../assets/medals/Hook-Rookie/t4.png'),
      require('../assets/medals/Hook-Rookie/t5.png'),
      require('../assets/medals/Hook-Rookie/t6.png'),
    ],
  },

  {
    name: "Overhand-Rookie",
    items: [
      require('../assets/medals/Overhand-Rookie/t1.png'),
      require('../assets/medals/Overhand-Rookie/t2.png'),
      require('../assets/medals/Overhand-Rookie/t3.png'),
      require('../assets/medals/Overhand-Rookie/t4.png'),
      require('../assets/medals/Overhand-Rookie/t5.png'),
      require('../assets/medals/Overhand-Rookie/t6.png'),
    ],
  },

  {
    name: "Uppercut-Rookie",
    items: [
      require('../assets/medals/Uppercut-Rookie/t1.png'),
      require('../assets/medals/Uppercut-Rookie/t2.png'),
      require('../assets/medals/Uppercut-Rookie/t3.png'),
      require('../assets/medals/Uppercut-Rookie/t4.png'),
      require('../assets/medals/Uppercut-Rookie/t5.png'),
      require('../assets/medals/Uppercut-Rookie/t6.png'),
    ],
  },

  {
    name: "Sidekick",
    items: [
      require('../assets/medals/Sidekick/t1.png'),
      require('../assets/medals/Sidekick/t2.png'),
      require('../assets/medals/Sidekick/t3.png'),
      require('../assets/medals/Sidekick/t4.png'),
      require('../assets/medals/Sidekick/t5.png'),
      require('../assets/medals/Sidekick/t6.png'),
    ],
  },

  {
    name: "Round-Kick-Rookie",
    items: [
      require('../assets/medals/Round-Kick-Rookie/t1.png'),
      require('../assets/medals/Round-Kick-Rookie/t2.png'),
      require('../assets/medals/Round-Kick-Rookie/t3.png'),
      require('../assets/medals/Round-Kick-Rookie/t4.png'),
      require('../assets/medals/Round-Kick-Rookie/t5.png'),
      require('../assets/medals/Round-Kick-Rookie/t6.png'),
    ],
  },

  {
    name: "Knee-Rookie",
    items: [
      require('../assets/medals/Knee-Rookie/t1.png'),
      require('../assets/medals/Knee-Rookie/t2.png'),
      require('../assets/medals/Knee-Rookie/t3.png'),
      require('../assets/medals/Knee-Rookie/t4.png'),
      require('../assets/medals/Knee-Rookie/t5.png'),
      require('../assets/medals/Knee-Rookie/t6.png'),
    ],
  },

  {
    name: "Double-Punch-Rookie",
    items: [
      require('../assets/medals/Double-Punch-Rookie/t1.png'),
      require('../assets/medals/Double-Punch-Rookie/t2.png'),
      require('../assets/medals/Double-Punch-Rookie/t3.png'),
      require('../assets/medals/Double-Punch-Rookie/t4.png'),
      require('../assets/medals/Double-Punch-Rookie/t5.png'),
      require('../assets/medals/Double-Punch-Rookie/t6.png'),
    ],
  },

  {
    name: "Ridge-Hand-Rookie",
    items: [
      require('../assets/medals/Ridge-Hand-Rookie/t1.png'),
      require('../assets/medals/Ridge-Hand-Rookie/t2.png'),
      require('../assets/medals/Ridge-Hand-Rookie/t3.png'),
      require('../assets/medals/Ridge-Hand-Rookie/t4.png'),
      require('../assets/medals/Ridge-Hand-Rookie/t5.png'),
      require('../assets/medals/Ridge-Hand-Rookie/t6.png'),
    ],
  },

  {
    name: "Palm-Strike-Rookie",
    items: [
      require('../assets/medals/Palm-Strike-Rookie/t1.png'),
      require('../assets/medals/Palm-Strike-Rookie/t2.png'),
      require('../assets/medals/Palm-Strike-Rookie/t3.png'),
      require('../assets/medals/Palm-Strike-Rookie/t4.png'),
      require('../assets/medals/Palm-Strike-Rookie/t5.png'),
      require('../assets/medals/Palm-Strike-Rookie/t6.png'),
    ],
  },

  {
    name: "Snap-Kick-Rookie",
    items: [
      require('../assets/medals/Snap-Kick-Rookie/t1.png'),
      require('../assets/medals/Snap-Kick-Rookie/t2.png'),
      require('../assets/medals/Snap-Kick-Rookie/t3.png'),
      require('../assets/medals/Snap-Kick-Rookie/t4.png'),
      require('../assets/medals/Snap-Kick-Rookie/t5.png'),
      require('../assets/medals/Snap-Kick-Rookie/t6.png'),
    ],
  },

  {
    name: "Heel-Kick-Rookie",
    items: [
      require('../assets/medals/Heel-Kick-Rookie/t1.png'),
      require('../assets/medals/Heel-Kick-Rookie/t2.png'),
      require('../assets/medals/Heel-Kick-Rookie/t3.png'),
      require('../assets/medals/Heel-Kick-Rookie/t4.png'),
      require('../assets/medals/Heel-Kick-Rookie/t5.png'),
      require('../assets/medals/Heel-Kick-Rookie/t6.png'),
    ],
  },

  {
    name: "Teep-Rookie",
    items: [
      require('../assets/medals/Teep-Rookie/t1.png'),
      require('../assets/medals/Teep-Rookie/t2.png'),
      require('../assets/medals/Teep-Rookie/t3.png'),
      require('../assets/medals/Teep-Rookie/t4.png'),
      require('../assets/medals/Teep-Rookie/t5.png'),
      require('../assets/medals/Teep-Rookie/t6.png'),
    ],
  },

  {
    name: "Elbow-Rookie",
    items: [
      require('../assets/medals/Elbow-Rookie/t1.png'),
      require('../assets/medals/Elbow-Rookie/t2.png'),
      require('../assets/medals/Elbow-Rookie/t3.png'),
      require('../assets/medals/Elbow-Rookie/t4.png'),
      require('../assets/medals/Elbow-Rookie/t5.png'),
      require('../assets/medals/Elbow-Rookie/t6.png'),
    ],
  },
];