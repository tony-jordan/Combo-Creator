// FileName: Challenges.ts
// Author: Tony Jordan
// Desc: holds challenge hard coded data.

import type { SQLiteDatabase } from 'react-native-sqlite-storage';

export type metrics = {name: string, value: number, tier: number, threshold: number};

export const guidedWorkoutChallenges = [
  JSON.stringify(['Jabbing Apprentice', 'Intermediate Jabber', 'Master Jabber', 'God-Tier Jabber']),
  JSON.stringify(['Cross Trainee','Cross Examiner','Crossing Menace','THE Crosser']),
  JSON.stringify(['Newbie Hooker', 'Certified Hooker', 'Captain Hooks','Hooked on Destruction']),
  JSON.stringify(['Uppercut Rookie','Chin Checker','Send Them to Orbit','Peek-a-boo-er']),
  JSON.stringify(['Overhand Intern','Overhand Enthusiast','Meteor Fist Overhand',"You're gonna kill someone kid"]),
  JSON.stringify(['Amateur Ridger','Ridge Curious','Sideways Violence','Chop Supreme']),
  JSON.stringify(['Sidekick','Anti-hero','Bona-fide Superhero','Super-DUPER man']),
  'Banshee Crusher',
  JSON.stringify(['Open-Handed Apprentice','Respectful Violence','High-Five of Doom','Palm of Judgment']),
  JSON.stringify(['Basic Snapper','Whiplash Enthusiast','Blink-and-You-Missed-It','Oof ouch my chin']),
  JSON.stringify(['Heel Turn','Backstabber','Eyes-in-the-Back-Kicker','No Look. All Damage.']),
  JSON.stringify(['Sleeper Teeper','Season for Teepin','Personal Space Enjoyer','Teepzilla']),
  JSON.stringify(['Elbow Rookie','Close-Range Negotiator','Sharp Conversations','Built Different (and Dangerous)']),
  'Tatsumaki',
  'Nut Buster',
  JSON.stringify(['Two-Piece Starter',"Can't guard em both",'A PAIR of knuckle sandwiches','Kung Fu Panda']),
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

export const challenges = [
    // jab
    {
        name: JSON.stringify([
          'Jabbing Apprentice', 
          'Intermediate Jabber', 
          'Master Jabber', 
          'God-Tier Jabber'
        ]),
        description: JSON.stringify([
          'Throw 100 total jabs in guided workouts', 
          'Throw 500 total jabs in guided workouts', 
          'Throw 750 total jabs in guided workouts', 
          'Throw 1000 total jabs in guided workouts'
        ]),
        regex: /^jab$/,
        thresholds: JSON.stringify([100, 500, 750, 1000]),
        value: 0,
        achieved: 0,
        tier: 0,
    },
    // cross
{
  name: JSON.stringify([
    'Cross Trainee',
    'Cross Examiner',
    'Crossing Menace',
    'THE Crosser'
  ]),
  description: JSON.stringify([
    'Throw 100 total crosses in guided workouts',
    'Throw 500 total crosses in guided workouts',
    'Throw 750 total crosses in guided workouts',
    'Throw 1000 total crosses in guided workouts'
  ]),
  regex: /^cross$/,
  thresholds: JSON.stringify([100, 500, 750, 1000]),
  value: 0,
  achieved: 0,
  tier: 0,
},

// hook
{
  name: JSON.stringify([
    'Newbie Hooker',
    'Certified Hooker',
    'Captain Hooks',
    'Hooked on Destruction'
  ]),
  description: JSON.stringify([
    'Throw 100 total hooks in guided workouts',
    'Throw 500 total hooks in guided workouts',
    'Throw 750 total hooks in guided workouts',
    'Throw 1000 total hooks in guided workouts'
  ]),
  regex: /^hook$/,
  thresholds: JSON.stringify([100, 500, 750, 1000]),
  value: 0,
  achieved: 0,
  tier: 0,
},

// overhand
{
  name: JSON.stringify([
    'Overhand Intern',
    'Overhand Enthusiast',
    'Meteor Fist Overhand',
    "You're gonna kill someone kid"
  ]),
  description: JSON.stringify([
    'Throw 100 total overhands in guided workouts',
    'Throw 500 total overhands in guided workouts',
    'Throw 750 total overhands in guided workouts',
    'Throw 1000 total overhands in guided workouts'
  ]),
  regex: /^over[- ]?hand$/,
  thresholds: JSON.stringify([100, 500, 750, 1000]),
  value: 0,
  achieved: 0,
  tier: 0,
},

// uppercut
{
  name: JSON.stringify([
    'Uppercut Rookie',
    'Chin Checker',
    'Send Them to Orbit',
    'Peek-a-boo-er'
  ]),
  description: JSON.stringify([
    'Throw 100 total uppercuts in guided workouts',
    'Throw 500 total uppercuts in guided workouts',
    'Throw 750 total uppercuts in guided workouts',
    'Throw 1000 total uppercuts in guided workouts'
  ]),
  regex: /^upper[- ]?cut$/,
  thresholds: JSON.stringify([100, 500, 750, 1000]),
  value: 0,
  achieved: 0,
  tier: 0,
},

// superman
{
  name: JSON.stringify([
    'Sidekick',
    'Anti-hero',
    'Bona-fide Superhero',
    'Super-DUPER man'
  ]),
  description: JSON.stringify([
    'Throw 100 total superman punches in guided workouts',
    'Throw 500 total superman punches in guided workouts',
    'Throw 750 total superman punches in guided workouts',
    'Throw 1000 total superman punches in guided workouts'
  ]),
  regex: /^super[- ]?man$/,
  thresholds: JSON.stringify([100, 500, 750, 1000]),
  value: 0,
  achieved: 0,
  tier: 0,
},

// round kick
{
  name: JSON.stringify([
    'Roundhouse Recruit',
    'Bruised Shin Haver',
    'Honorary Thai',
    'Femur Obliterator'
  ]),
  description: JSON.stringify([
    'Throw 100 total round kicks in guided workouts',
    'Throw 500 total round kicks in guided workouts',
    'Throw 750 total round kicks in guided workouts',
    'Throw 1000 total round kicks in guided workouts'
  ]),
  regex: /^(round[- ]?(kicks|houses)|switch[- ]?kicks)$/,
  thresholds: JSON.stringify([100, 500, 750, 1000]),
  value: 0,
  achieved: 0,
  tier: 0,
},

// knee
{
  name: JSON.stringify([
    'Beg-knee-ner',
    'Clinch Goblin',
    'Sir Knees-a-lot',
    'Rib Breaker'
  ]),
  description: JSON.stringify([
    'Throw 100 total knees in guided workouts',
    'Throw 500 total knees in guided workouts',
    'Throw 750 total knees in guided workouts',
    'Throw 1000 total knees in guided workouts'
  ]),
  regex: /^knee$/,
  thresholds: JSON.stringify([100, 500, 750, 1000]),
  value: 0,
  achieved: 0,
  tier: 0,
},

// double punch
{
  name: JSON.stringify([
    'Two-Piece Starter',
    "Can't guard em both",
    'A PAIR of knuckle sandwiches',
    'Kung Fu Panda'
  ]),
  description: JSON.stringify([
    'Throw 100 total double punches in guided workouts',
    'Throw 500 total double punches in guided workouts',
    'Throw 750 total double punches in guided workouts',
    'Throw 1000 total double punches in guided workouts'
  ]),
  regex: /^double[- ]?punch$/i,
  thresholds: JSON.stringify([100, 500, 750, 1000]),
  value: 0,
  achieved: 0,
  tier: 0,
},

// ridge hand
{
  name: JSON.stringify([
    'Amateur Ridger',
    'Ridge Curious',
    'Sideways Violence',
    'Chop Supreme'
  ]),
  description: JSON.stringify([
    'Throw 100 total ridge hands in guided workouts',
    'Throw 500 total ridge hands in guided workouts',
    'Throw 750 total ridge hands in guided workouts',
    'Throw 1000 total ridge hands in guided workouts'
  ]),
  regex: /^ridge[- ]?hand$/i,
  thresholds: JSON.stringify([100, 500, 750, 1000]),
  value: 0,
  achieved: 0,
  tier: 0,
},

// palm strike
{
  name: JSON.stringify([
    'Open-Handed Apprentice',
    'Respectful Violence',
    'High-Five of Doom',
    'Palm of Judgment'
  ]),
  description: JSON.stringify([
    'Throw 100 total palm strikes in guided workouts',
    'Throw 500 total palm strikes in guided workouts',
    'Throw 750 total palm strikes in guided workouts',
    'Throw 1000 total palm strikes in guided workouts'
  ]),
  regex: /^palm[- ]?strike$/i,
  thresholds: JSON.stringify([100, 500, 750, 1000]),
  value: 0,
  achieved: 0,
  tier: 0,
},

// snap kick
{
  name: JSON.stringify([
    'Basic Snapper',
    'Whiplash Enthusiast',
    'Blink-and-You-Missed-It',
    'Oof ouch my chin'
  ]),
  description: JSON.stringify([
    'Throw 100 total snap kicks in guided workouts',
    'Throw 500 total snap kicks in guided workouts',
    'Throw 750 total snap kicks in guided workouts',
    'Throw 1000 total snap kicks in guided workouts'
  ]),
  regex: /^snap[- ]?kick$/i,
  thresholds: JSON.stringify([100, 500, 750, 1000]),
  value: 0,
  achieved: 0,
  tier: 0,
},

// heel kick
{
  name: JSON.stringify([
    'Heel Turn',
    'Backstabber',
    'Eyes-in-the-Back-Kicker',
    'No Look. All Damage.'
  ]),
  description: JSON.stringify([
    'Throw 100 total heel kicks in guided workouts',
    'Throw 500 total heel kicks in guided workouts',
    'Throw 750 total heel kicks in guided workouts',
    'Throw 1000 total heel kicks in guided workouts'
  ]),
  regex: /^heel[- ]?kick$/i,
  thresholds: JSON.stringify([100, 500, 750, 1000]),
  value: 0,
  achieved: 0,
  tier: 0,
},

// teep
{
  name: JSON.stringify([
    'Sleeper Teeper',
    'Season for Teepin',
    'Personal Space Enjoyer',
    'Teepzilla'
  ]),
  description: JSON.stringify([
    'Throw 100 total teeps in guided workouts',
    'Throw 500 total teeps in guided workouts',
    'Throw 750 total teeps in guided workouts',
    'Throw 1000 total teeps in guided workouts'
  ]),
  regex: /^teep$/,
  thresholds: JSON.stringify([100, 500, 750, 1000]),
  value: 0,
  achieved: 0,
  tier: 0,
},

// elbows
{
  name: JSON.stringify([
    'Elbow Rookie',
    'Close-Range Negotiator',
    'Sharp Conversations',
    'Built Different (and Dangerous)'
  ]),
  description: JSON.stringify([
    'Throw 100 total elbows in guided workouts',
    'Throw 500 total elbows in guided workouts',
    'Throw 750 total elbows in guided workouts',
    'Throw 1000 total elbows in guided workouts'
  ]),
  regex: /^elbow$/,
  thresholds: JSON.stringify([100, 500, 750, 1000]),
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
    name: "Jabbing Apprentice",
    items: [
      require('../assets/medals/Jabbing-Apprentice/t1.png'),
      require('../assets/medals/Jabbing-Apprentice/t2.png'),
      require('../assets/medals/Jabbing-Apprentice/t3.png'),
      require('../assets/medals/Jabbing-Apprentice/t4.png'),
    ],
  },

  {
    name: "Cross Trainee",
    items: [
      require('../assets/medals/Cross-Trainee/t1.png'),
      require('../assets/medals/Cross-Trainee/t2.png'),
      require('../assets/medals/Cross-Trainee/t3.png'),
      require('../assets/medals/Cross-Trainee/t4.png'),
    ],
  },

  {
    name: "Newbie Hooker",
    items: [
      require('../assets/medals/Newbie-Hooker/t1.png'),
      require('../assets/medals/Newbie-Hooker/t2.png'),
      require('../assets/medals/Newbie-Hooker/t3.png'),
      require('../assets/medals/Newbie-Hooker/t4.png'),
    ],
  },

  {
    name: "Overhand Intern",
    items: [
      require('../assets/medals/Overhand-Intern/t1.png'),
      require('../assets/medals/Overhand-Intern/t2.png'),
      require('../assets/medals/Overhand-Intern/t3.png'),
      require('../assets/medals/Overhand-Intern/t4.png'),
    ],
  },

  {
    name: "Uppercut Rookie",
    items: [
      require('../assets/medals/Uppercut-Rookie/t1.png'),
      require('../assets/medals/Uppercut-Rookie/t2.png'),
      require('../assets/medals/Uppercut-Rookie/t3.png'),
      require('../assets/medals/Uppercut-Rookie/t4.png'),
    ],
  },

  {
    name: "Sidekick",
    items: [
      require('../assets/medals/Sidekick/t1.png'),
      require('../assets/medals/Sidekick/t2.png'),
      require('../assets/medals/Sidekick/t3.png'),
      require('../assets/medals/Sidekick/t4.png'),
    ],
  },

  {
    name: "Roundhouse Recruit",
    items: [
      require('../assets/medals/Roundhouse-Recruit/t1.png'),
      require('../assets/medals/Roundhouse-Recruit/t2.png'),
      require('../assets/medals/Roundhouse-Recruit/t3.png'),
      require('../assets/medals/Roundhouse-Recruit/t4.png'),
    ],
  },

  {
    name: "Beg-knee-ner",
    items: [
      require('../assets/medals/Beg-knee-ner/t1.png'),
      require('../assets/medals/Beg-knee-ner/t2.png'),
      require('../assets/medals/Beg-knee-ner/t3.png'),
      require('../assets/medals/Beg-knee-ner/t4.png'),
    ],
  },

  {
    name: "Two-Piece Starter",
    items: [
      require('../assets/medals/Two-Piece-Starter/t1.png'),
      require('../assets/medals/Two-Piece-Starter/t2.png'),
      require('../assets/medals/Two-Piece-Starter/t3.png'),
      require('../assets/medals/Two-Piece-Starter/t4.png'),
    ],
  },

  {
    name: "Amateur Ridger",
    items: [
      require('../assets/medals/Amateur-Ridger/t1.png'),
      require('../assets/medals/Amateur-Ridger/t2.png'),
      require('../assets/medals/Amateur-Ridger/t3.png'),
      require('../assets/medals/Amateur-Ridger/t4.png'),
    ],
  },

  {
    name: "Open-Handed Apprentice",
    items: [
      require('../assets/medals/Open-Handed-Apprentice/t1.png'),
      require('../assets/medals/Open-Handed-Apprentice/t2.png'),
      require('../assets/medals/Open-Handed-Apprentice/t3.png'),
      require('../assets/medals/Open-Handed-Apprentice/t4.png'),
    ],
  },

  {
    name: "Basic Snapper",
    items: [
      require('../assets/medals/Basic-Snapper/t1.png'),
      require('../assets/medals/Basic-Snapper/t2.png'),
      require('../assets/medals/Basic-Snapper/t3.png'),
      require('../assets/medals/Basic-Snapper/t4.png'),
    ],
  },

  {
    name: "Heel Turn",
    items: [
      require('../assets/medals/Heel-Turn/t1.png'),
      require('../assets/medals/Heel-Turn/t2.png'),
      require('../assets/medals/Heel-Turn/t3.png'),
      require('../assets/medals/Heel-Turn/t4.png'),
    ],
  },

  {
    name: "Sleeper Teeper",
    items: [
      require('../assets/medals/Sleeper-Teeper/t1.png'),
      require('../assets/medals/Sleeper-Teeper/t2.png'),
      require('../assets/medals/Sleeper-Teeper/t3.png'),
      require('../assets/medals/Sleeper-Teeper/t4.png'),
    ],
  },

  {
    name: "Elbow Rookie",
    items: [
      require('../assets/medals/Elbow-Rookie/t1.png'),
      require('../assets/medals/Elbow-Rookie/t2.png'),
      require('../assets/medals/Elbow-Rookie/t3.png'),
      require('../assets/medals/Elbow-Rookie/t4.png'),
    ],
  },
];