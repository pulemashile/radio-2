import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Background from './Background';
import Btn from './Btn';
import { Sky, Arctic } from './Constants';

const Home = (props) => {
  return (
    <Background>
      <View style={{ marginHorizontal: 40, marginVertical: 100 }}>
        <Text style={{ color: 'white', fontSize: 64 }}>Let's Record</Text>
        <Text style={{ color: 'white', fontSize: 64, marginBottom: 40}}>Your Memories</Text>
        <Btn bgColor='black' textColor='white' btnLabel="Login" Press={() => props.navigation.navigate("Login")} />
        <Btn bgColor='white' textColor='black' btnLabel="Signup" Press={() => props.navigation.navigate("Signup")} />
        
      </View>
    </Background>
  )
}

const styles = StyleSheet.create({})

export default Home;

