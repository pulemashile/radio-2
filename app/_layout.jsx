import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AudioRecorder from './src/AudioRecorder';
import Home from './src/Home';
import Signup from './src/Signup';
import Login from './src/Login';


const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer screenOptions={{ hearderShown: false }}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name='AudioRecorder' component={AudioRecorder}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;