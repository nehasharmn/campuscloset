import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Tabs from './components/Tab-Bar';
import ProfileSetup from './components/Profile-Setup-Screen';
import Login from './components/Login-Screen';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { registerTranslation } from 'react-native-paper-dates';
import db from './db';
import { AuthContext, AuthProvider } from './contexts/authContext';

function AppContainer() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <App />
      </AuthProvider>
    </NavigationContainer>
    
  );
}

function App() {
  const Stack = createStackNavigator();
  const navigation = useNavigation();
  const {user, setUser, isProfileComplete} = useContext(AuthContext)
  const auth = getAuth();

  registerTranslation('en', {
    save: 'Save',
    selectSingle: 'Select date',
    selectMultiple: 'Select dates',
    selectRange: 'Select period',
    notAccordingToDateFormat: (inputFormat) =>
      `Date format must be ${inputFormat}`,
    mustBeHigherThan: (date) => `Must be later then ${date}`,
    mustBeLowerThan: (date) => `Must be earlier then ${date}`,
    mustBeBetween: (startDate, endDate) =>
      `Must be between ${startDate} - ${endDate}`,
    dateIsDisabled: 'Day is not allowed',
    previous: 'Previous',
    next: 'Next',
    typeInDate: 'Type in date',
    pickDateFromCalendar: 'Pick date from calendar',
    close: 'Close',
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);
  
  useEffect(() => {
    if (user && auth.currentUser?.emailVerified) {
      if (isProfileComplete) {
        navigation.navigate('Home');
      } else {
        navigation.navigate('ProfileSetup');
      }
    } else {
      navigation.navigate("Login");
    }
  }, [user, isProfileComplete]);

  const fetchUserData = async (user) => {
    const docRef = doc(db, "users", user.uid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data(); 
      } else {
        console.log("No such document!");
        return null; 
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      return null; 
    }
  };

  return (
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetup} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      </Stack.Navigator>
  );
}

export default AppContainer;