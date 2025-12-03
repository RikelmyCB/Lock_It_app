import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

const LoginScreen = () => {
  const api_url = Constants.expoConfig?.extra?.API_URL;

  const navigation = useNavigation<NavigationProp<any>>();
  const [username, setUsername]= useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password ) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(api_url + '/login', {
        email: email,
        password: password,
      });

      Alert.alert('Sucesso', 'Usuário logado com sucesso');
      setPassword('')
      setEmail('')

      const username = response.data.username;
      const token = response.data.token;
      const user_id = response.data.user_id;

      

      const setToken = async (key: string, value: string) => {
        try{
          AsyncStorage.setItem(key, value)
        } catch (e) {
          console.log('erro ao salvar dados com AsyncStorage (login): ', e)
        }
      }

      const removeToken = async (key: string) => {
        try{
          AsyncStorage.removeItem(key)
        } catch (e) {
          console.log('erro ao remover dados com AsyncStorage (login): ', e)
          
        }
      }

      const getToken = async (key: string) => {
        try {
          const getTokenData = await AsyncStorage.getItem(key)

          return true

        } catch (e) {
          console.log('erro ao recuperar dados com AsyncStorage (login): ', e)
        }
      }

      const existingUsername = async () => {
        await getToken('username')
        return true
      }

      const existingId = async () => {
          await getToken('user_id')
          return true
        }

      const existingToken = async () => {
        await getToken('token')
        return true
      }
      
      if (await existingUsername()) {
        removeToken('username')
        setToken('username', username)
        console.log('username salvo com sucesso: ', username)
      } else {
        setToken('username', username)
      }

      if (await existingId()) {
        removeToken('user_id')
        setToken('user_id', String(user_id))
        console.log('user_id salvo com sucesso: ', user_id)
      } else {
        setToken('user_id', String(user_id))
      }


      if (await existingToken()) {
          removeToken('token')
          setToken('token', token)
        } else {
          setToken('token', token)
        }
        
      navigation.navigate('Main');

    } catch (error) {
      console.error('Erro no login:', error); // Imprime o erro completo para debug
      if (axios.isAxiosError(error) && error.response) {
        Alert.alert('Erro', error.response.data.message || 'Erro no servidor'); // Mensagem de erro do servidor
      } else {
        Alert.alert('Erro', 'Erro ao conectar com o servidor.');
      }
    }

    setLoading(false);
  };

  return (
    <LinearGradient colors={['#2C2C54', '#474787', '#5758BB']} style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={48} color="#F7F1E3" />
          </View>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Entre na sua conta</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#474787" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Email Input"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#474787" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={(text) => setPassword(text)}
              accessibilityLabel="Password Input"
            />
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
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
                  <Ionicons name="log-in-outline" size={20} color="white" />
                  <Text style={styles.buttonText}>Entrar</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkContainer}
            onPress={() => navigation.navigate('AddUser')}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>
              Não tem uma conta ainda? <Text style={styles.linkTextBold}>Crie uma aqui!</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59, 59, 152, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(247, 241, 227, 0.3)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F7F1E3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(247, 241, 227, 0.8)',
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#F7F1E3',
    padding: 28,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 20,
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
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  linkText: {
    fontSize: 14,
    color: '#474787',
    textAlign: 'center',
  },
  linkTextBold: {
    fontWeight: 'bold',
    color: '#3B3B98',
  },
});

export default LoginScreen;