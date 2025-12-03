import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AddNewUser() {
  const api_url = Constants.expoConfig?.extra?.API_URL;

  const navigation = useNavigation<NavigationProp<any>>();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const removeAsyncStorageData = async (key: string) => {
    try {
      const asyncStorageData = await AsyncStorage.removeItem(key)
      console.log('Dados removidos com sucesso')
    } catch (e) {
      console.log('erro ao remover dados com AsyncStorage: ', e)
    }
  }

  const getDataAsyncStorage = async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key)
      if (value !== null) {
        console.log('Dados recuperados com sucesso: ', key, value)

        return true
      }
    } catch(e) {
      console.log('erro ao recuperar dados com AsyncStorage: ', e)
    }
  }
  
  const setAsyncStorage = async (key: string, value: string) => {
    try {
      const asyncStorageData = await AsyncStorage.setItem(key, value)
      console.log('Dados salvos com sucesso: ', asyncStorageData)
    } catch (e) {
      console.log('erro ao salvar dados com AsyncStorage: ', e)
    }
  }
    
  const handleRegister = async () => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    
   if (!password || !username) {
    Alert.alert('Erro', 'Preencha todos os campos');
    return;
  } else if (!emailRegex.test(email)) {
     Alert.alert('Erro', 'Digite o e-mail corretamente');
    return;
  }
  
  setLoading(true);
  
    try {
      const response = await axios.post(api_url + '/register', {
        username: username,
        email: email,
        password: password,
      });

      console.log('resposta do servidor: ', response.data);
      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso');

      try {
        const stringUsername = String(username)

        const existingUsername = await getDataAsyncStorage('username');
        if (existingUsername) {
          removeAsyncStorageData('username')
          setAsyncStorage('username', stringUsername)
        } else { 
          setAsyncStorage('username', stringUsername)
        }
        

      } catch (e) {
        console.log('erro ao salvar dados com AsyncStorage: ', e)
      }
      
      navigation.navigate('Login');

      setEmail('');
      setPassword('');
      setUsername('');

    } catch (error) {
      console.error('Erro no cadastro:', error); // Imprime o erro completo para debug
      if ((error as any).response) {
        Alert.alert('Erro', (error as any).response.data.message || 'Erro no servidor'); // Mensagem de erro do servidor
      } else {
        Alert.alert('Erro', 'Erro ao conectar com o servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#2C2C54', '#474787', '#5758BB']} style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-add-outline" size={48} color="#F7F1E3" />
          </View>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Cadastre-se para começar</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Nome de Usuário</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#474787" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Digite seu nome de usuário"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                maxLength={20}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#474787" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#474787" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Digite sua senha"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={styles.button}
            activeOpacity={0.8}
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
                  <Ionicons name="person-add" size={20} color="white" />
                  <Text style={styles.buttonText}>Cadastrar</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginLink} 
            onPress={() => {navigation.navigate('Login'); setLoading(false)}}
            activeOpacity={0.7}
          >
            <Text style={styles.loginLinkText}>
              Já tem uma conta? <Text style={styles.loginLinkTextBold}>Faça login aqui!</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

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
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#474787',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
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
  loginLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#474787',
    textAlign: 'center',
  },
  loginLinkTextBold: {
    fontWeight: 'bold',
    color: '#3B3B98',
  },
});