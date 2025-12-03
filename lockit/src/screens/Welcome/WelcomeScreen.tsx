import { Text, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import Ionicons from '@expo/vector-icons/Ionicons';

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
      const response = await axios.get(api_url + '/protected', {
        headers: { Authorization: `Bearer ${token}` },
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
    <LinearGradient colors={['#2C2C54', '#474787', '#5758BB']} style={styles.container}>
      <View style={styles.content}>
        <Animatable.View animation="fadeInDown" style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Ionicons name="lock-closed" size={80} color="#F7F1E3" />
          </View>
        </Animatable.View>
        
        <Animatable.Text animation="fadeInUp" style={styles.title}>
          Bem-Vindo ao
        </Animatable.Text>
        <Animatable.Text animation="fadeInUp" delay={100} style={styles.appName}>
          LOCK IT!
        </Animatable.Text>
        
        <Animatable.View animation="fadeInUp" delay={200} style={styles.contentContainer}>
          <Text style={styles.subtitle}>
            Proteja suas informações com segurança e praticidade.
          </Text>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleNavigateToLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            <LinearGradient 
              colors={['#3B3B98', '#474787']} 
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="arrow-forward" size={24} color="white" />
                  <Text style={styles.buttonText}>Acessar</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(59, 59, 152, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(247, 241, 227, 0.3)',
  },
  title: {
    fontSize: 28,
    color: '#F7F1E3',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  appName: {
    fontSize: 42,
    color: '#F7F1E3',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#F7F1E3',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#474787',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
    lineHeight: 24,
  },
  button: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3B3B98',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});