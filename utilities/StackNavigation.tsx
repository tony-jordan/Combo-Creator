// File: StackNavigation.tsx
// Author: Tony Jordan
// Purpose: Handles navigation changes between components

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../components/Home'
import WorkoutCustomization from '../components/WorkoutCustomization'
import WorkoutExecution from '../components/WorkoutExecution'
import FavoritesOverview from '../components/FavoritesOverview';
import StrikeSetsCustomization from '../components/StrikeSetsCustomization';
import StatusReport from '../components/StatusReport';
import Disclaimer from '../components/Disclaimer';
import WorkoutSummary from '../components/WorkoutSummary';
import HelpMenu from '../components/HelpMenu'
import InWorkout from '../components/InWorkout';
import TimedWorkoutCustomization from '../components/TimedWorkoutCustomization';
import TimedWorkoutExecution from '../components/TimedWorkoutExecution';
import Challenges from '../components/Challenges';
import Tutorial from '../components/Tutorial';
import { metrics } from './Challenges';

// type for root navigation stack
export type RootStackParamList = {
  Disclaimer: undefined;
  Home: {strikeSetId: string};
  WorkoutCustomization: {strikeSetId: string};
  WorkoutExecution: {strikeSetId: string, comboCount: number, throwCount: number, strikesPerCombo: number, timePerStrike: number, pbc?: number, pwrc?: number, strikes?: any, tts: boolean};
  FavoritesOverview: {favorite: any};
  StrikeSetsCustomization: {set: any};
  StatusReport: undefined;
  WorkoutSummary: {time: string, combos: string[][], favorited: number[], bf: boolean, count: number, startMetrics: metrics[] }
  InWorkout: {strikeSetId: string, comboCount: number, throwCount: number, strikesPerCombo: number, timePerStrike: number, pbc?: number, pwrc?: number, strikes?: any}
  TimedWorkoutCustomization: undefined;
  TimedWorkoutExecution: {rounds: number, workTime: string, restTime: string,favorites?: any[]};
  Challenges: undefined;
  Tutorial: {selectedTutorial: boolean[]};
};

// create stack navigator
const Stack = createNativeStackNavigator();

// navigation configuration
const Navigation = () => {
    return (
      <Stack.Navigator initialRouteName="Disclaimer" screenOptions={{
        headerShown: false,
      }}>
        <Stack.Screen name="Disclaimer" component={Disclaimer} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="WorkoutCustomization" component={WorkoutCustomization} />
        <Stack.Screen name="WorkoutExecution" component={WorkoutExecution} />
        <Stack.Screen name="FavoritesOverview" component={FavoritesOverview} />
        <Stack.Screen name="StrikeSetsCustomization" component={StrikeSetsCustomization} />
        <Stack.Screen name="StatusReport" component={StatusReport} />
        <Stack.Screen name="WorkoutSummary" component={WorkoutSummary} />
        <Stack.Screen name="HelpMenu" component={HelpMenu} />
        <Stack.Screen name="InWorkout" component={InWorkout} />
        <Stack.Screen name="TimedWorkoutCustomization" component={TimedWorkoutCustomization} />
        <Stack.Screen name="TimedWorkoutExecution" component={TimedWorkoutExecution} />
        <Stack.Screen name="Challenges" component={Challenges} />
        <Stack.Screen name="Tutorial" component={Tutorial} />
      </Stack.Navigator>
    );
}

export default Navigation