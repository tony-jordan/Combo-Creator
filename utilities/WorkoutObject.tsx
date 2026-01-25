// File: WorkoutObject.tsx
// Author: Tony Jordan
// Purpose: Workout objects for different types of workouts the user may generate

import { Text, StyleSheet } from 'react-native';
import { getDBConnection, getFavoriteCombos, randomizeCombos } from './DefaultInfo';

// parent class for creating workouts based on user selected strike set
export class WorkoutByStrikeSet {
    strikes: string[];
    currentComboActive: boolean[];

    constructor(
        private comboCount: number,
        private throwCount: number,
        private timePerStrike: number,
        private strikesPerCombo?: number,
        private strikeSetId?: string,
    ) {
        this.strikeSetId = strikeSetId;
        this.comboCount = comboCount;
        this.throwCount = throwCount;
        this.strikesPerCombo = strikesPerCombo;
        this.timePerStrike = timePerStrike;
        this.strikes = [];
        this.currentComboActive = [];
    }
    // get the strike numbers of a supplied strike set (i.e jab will return '1' in default strike sets)
    getComboNumsByAlpha(combo: string[]) {
        return combo.map(strike => this.strikes.indexOf(strike) + 1);
    }

    // set boolean array representing which 'strike' is active during a workout. (which strike is actively being thrown)
    initiateComboActiveStrike(arr: any[], setActive: React.Dispatch<React.SetStateAction<boolean[]>>) {
        const result = Array(arr.length).fill(false);
        setActive(result);
    }

    // creates view of full combo during workout execution. If corresponging boolean value is set to 'true'
    // in active states, text will display red, letting the user know which strike is the active strike.
    buildText(arr: any[], getActive: boolean[]) {
        return (
            <Text>
                {arr.map((item, index) => (
                    <Text key={index} style={[styles.bodyText, { color: getActive[index] ? 'red' : 'white' }]}>
                        {item}{' '}
                    </Text>
                ))}
            </Text>
        );
    }

    // getter for strike set id on this object
    getStrikeSetId() {
        if (this.strikeSetId) {
            return this.strikeSetId;
        }
        else return "-1"
    }

    // getter for strikes per combo on this object
    getStrikesPerCombo() {
        if (this.strikesPerCombo) {
            return this.strikesPerCombo;
        }
        else return -1
    }

    // getter for combo count on this object
    getComboCount() {
        return this.comboCount;
    }
    
    // function for creating randomized combos for use in user-generated workout
    async setUpWorkout(userDefined?: string[]) {
        const combos: string[][] = [];
        for (let x = 0; x < this.getComboCount(); x++) {
            // randomize number to get the count of strikes
            const strikeNum = Math.floor(Math.random() * (this.getStrikesPerCombo() - 3 + 1) + 3);
            const combo: string[] = [];
            // randomize a combo
            for (let y = 0; y < strikeNum; y++) {
                var strike = this.strikes[Math.floor(Math.random() * this.strikes.length)];
                // if user defined, ensure randomized strike is included in user's defined strikes for this workout
                if (userDefined) {
                    if (!userDefined.includes(strike)) {
                        while (!userDefined.includes(strike)) {
                            strike = this.strikes[Math.floor(Math.random() * this.strikes.length)];
                        }
                    }
                }
                combo.push(strike);
            }
            combos.push(combo);
        }
        return combos;
    }
}

// child class creating a workout using user's favorite combos
export class WorkoutByFavorite extends WorkoutByStrikeSet {

    constructor(
        comboCount: number,
        throwCount: number,
        timePerStrike: number
    ) {
        super(comboCount, throwCount, timePerStrike);
        this.strikes = [];
        this.currentComboActive = [];

    }

    // Overriding setup workout in parent, grab favorites from database and duplicate items (if needed) to get to user defined number of combos
    async setUpWorkout(userDefined?: string[][] | string[]) {
        var favs;
        const output: string[][] = [];
        if (userDefined) {
            favs = userDefined
        }
        else {
            const db = await getDBConnection();
            favs = await getFavoriteCombos(db);
        }
        let t = this.getComboCount();
        // variable to hold starting point for duplication
        let v = 0;
        // duplicate favorite combos to reach desired combo count
        for (let x = 0; x < t; x++) {
            if (v == favs.length) {
                v = 0;
            }
            output.push(favs[v]);
            v++;
        }
        // randomize duplicated combos for user
        return randomizeCombos(output);
    }

}


const styles = StyleSheet.create({
    bodyMain: {
        flex: 6,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    workoutBody: {
        width: '95%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bodyText: {
        fontSize: 22,
        color: 'white',
        fontWeight: 'bold',
        margin: 10,
        textAlign: 'center',
    },
    pauseView: {
        borderStyle: 'solid',
        borderWidth: 5,
        borderColor: 'black',
        borderRadius: 10,
        position: 'absolute',
        zIndex: 999,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '5%',
        padding: 20,
        backgroundColor: 'white',
    },
    homeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 22,
    },
    controlButton: {
        paddingTop: '10%',
        paddingBottom: '10%',
        paddingStart: '20%',
        paddingEnd: '20%',
        borderStyle: 'solid',
        borderWidth: 3,
        borderColor: 'black',
        borderRadius: 40,
        margin: 15,
        alignItems: 'center',
    },
});
