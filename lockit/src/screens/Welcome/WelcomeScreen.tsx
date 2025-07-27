import { Text, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

export default function WelcomeScreen() {
  const api_url = Constants.expoConfig?.extra?.API_URL;

  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error("Erro ao obter token do AsyncStorage:", error);
      return null;
    }
  };

  const validateToken = async () => {
    try {
      const token = await getToken();
      setLoading(true);
      const response = await axios.get(api_url + '/api/auth/protected', {
        headers: { authorization: `Bearer ${token}` },
      });
      return response.status === 200;
    } catch (error: any) {
      console.error('Erro ao validar token no backend:', error.response?.data || error.message);
      setLoading(false);
      navigation.navigate('Login');
      return false;
    }
  };

  const handleNavigateToLogin = async () => {
    const token = await getToken();
    if (token) {
      const isValid = await validateToken();
      if (isValid) {
        setLoading(false);
        navigation.navigate('Main');
      } else {
        console.log('Token inválido ou expirado.');
        navigation.navigate('Login');
      }
    } else {
      console.log('Nenhum token encontrado.');
      navigation.navigate('Login');
    }
  };

  return (
    <LinearGradient colors={['#6a0dad', '#8a2be2']} style={styles.container}>
      <Animatable.Image 
        animation="fadeInDown" 
        source={require('../../../assets/LockIcon.png')} 
        style={styles.image} 
        resizeMode="contain"
      />
      
      <Animatable.Text animation="fadeInUp" style={styles.title}>
        Bem-Vindo ao LOCK IT!
      </Animatable.Text>
      
      <Animatable.View animation="fadeInUp" delay={300} style={styles.contentContainer}>
        <Text style={styles.subtitle}>Proteja suas informações com segurança e praticidade.</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleNavigateToLogin}>
          {loading ? <ActivityIndicator size="large" color="white" /> : <Text style={styles.buttonText}>Acessar</Text>}
        </TouchableOpacity>
      </Animatable.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  contentContainer: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    height: 55,
    backgroundColor: '#6a0dad',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6a0dad',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  }
});
