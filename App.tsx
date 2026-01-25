// run this: npx react-native run-android to start emulator
// then this to start Metro: npx react-native start --port 8088

import Navigation from './utilities/StackNavigation'
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { initDatabase } from './utilities/DefaultInfo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

enableScreens();

const App = () => {
  // initialize database
  initDatabase();
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;