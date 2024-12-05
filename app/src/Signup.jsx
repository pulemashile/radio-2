import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Background from './Background';
import { Sky } from './Constants';  // If you have Sky color in Constants
import Btn from './Btn';

// Define new color scheme here or use your existing constants file
const Colors = {
  primary: '#3498db',   // Blue color for buttons and input borders
  secondary: '#2c3e50',  // Dark grey for text
  error: 'red',          // Red for error text
  lightGrey: '#bdc3c7',  // Light grey for subtle text (optional)
};

const Signup = (props) => {
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const saveUserInformation = async (userDetails) => {
    try {
      const jsonValue = JSON.stringify(userDetails);
      await AsyncStorage.setItem('userDetails', jsonValue);
      console.log('User details saved:', jsonValue);
    } catch (error) {
      console.error('Error saving user information:', error);
    }
  };

  const handleSignup = () => {
    const { firstName, lastName, email, password, confirmPassword } = userDetails;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all the fields');
    } else if (password !== confirmPassword) {
      setError('Passwords do not match');
    } else {
      setError('');
      Alert.alert('Account Created', 'Your account has been successfully created.');
      // Save the user's information
      saveUserInformation(userDetails);
      props.navigation.navigate('Login');
    }
  };

  return (
    <Background>
      <SafeAreaView style={styles.safeAreaView}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Register</Text>
              <Text style={styles.subHeaderText}>Create a new account</Text>
            </View>
            <View style={styles.formContainer}>
              <TextInput
                style={[styles.inputField, { borderColor: Colors.primary }]}
                placeholder="First Name"
                value={userDetails.firstName}
                onChangeText={(text) => setUserDetails({ ...userDetails, firstName: text })}
                placeholderTextColor={Colors.primary}
              />
              <TextInput
                style={[styles.inputField, { borderColor: Colors.primary }]}
                placeholder="Last Name"
                value={userDetails.lastName}
                onChangeText={(text) => setUserDetails({ ...userDetails, lastName: text })}
                placeholderTextColor={Colors.primary}
              />
              <TextInput
                style={[styles.inputField, { borderColor: Colors.primary }]}
                placeholder="Email / Username"
                keyboardType="email-address"
                value={userDetails.email}
                onChangeText={(text) => setUserDetails({ ...userDetails, email: text })}
                placeholderTextColor={Colors.primary}
              />
              <TextInput
                style={[styles.inputField, { borderColor: Colors.primary }]}
                placeholder="Password"
                secureTextEntry
                value={userDetails.password}
                onChangeText={(text) => setUserDetails({ ...userDetails, password: text })}
                placeholderTextColor={Colors.primary}
              />
              <TextInput
                style={[styles.inputField, { borderColor: Colors.primary }]}
                placeholder="Confirm Password"
                secureTextEntry
                value={userDetails.confirmPassword}
                onChangeText={(text) => setUserDetails({ ...userDetails, confirmPassword: text })}
                placeholderTextColor={Colors.primary}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By signing in, you agree to our{' '}
                  <Text style={{ color: Sky, fontWeight: 'bold' }}>Terms & Conditions</Text>
                </Text>
                <Text style={{ color: 'sky' }}> and </Text>
                <Text style={styles.termsText}>Privacy Policy</Text>
              </View>
              <Btn textColor="white" bgColor={Colors.primary} btnLabel="Signup" Press={handleSignup} />
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => props.navigation.navigate('Login')}>
                  <Text style={[styles.loginLink, { color: Colors.primary }]}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
};

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    alignItems: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  headerText: {
    color: 'white',
    fontSize: moderateScale(54),
    fontWeight: 'bold',
  },
  subHeaderText: {
    color: 'white',
    fontSize: moderateScale(16),
  },
  formContainer: {
    backgroundColor: 'white',
    height: verticalScale(710),
    width: width - 1,
    borderTopLeftRadius: moderateScale(130),
    paddingTop: verticalScale(60),
    alignItems: 'center',
    paddingVertical: verticalScale(30),
    marginTop: -verticalScale(20),
  },
  inputField: {
    height: verticalScale(40),
    width: '80%',
    borderBottomWidth: 1,
    borderColor: Colors.primary,  // Updated color
    color: Colors.secondary,  // Updated text color
    fontSize: moderateScale(16),
    marginBottom: verticalScale(16),
  },
  errorText: {
    color: Colors.error,  // Updated error color
    marginBottom: verticalScale(10),
  },
  termsContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '90%',
    paddingRight: moderateScale(65),
    marginTop: verticalScale(5),
    marginBottom: verticalScale(10),
  },
  termsText: {
    color: Colors.primary,  // Updated color
    fontWeight: 'bold',
    fontSize: moderateScale(16),
  },
  loginContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
  },
  loginText: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
  loginLink: {
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    marginLeft: moderateScale(5),
  },
});

export default Signup;
