import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Importar o 'api' centralizado. Não precisamos mais de axios ou Constants aqui.
import api from '../../../src/backend/api.js';

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 3. Lógica do AsyncStorage simplificada e encapsulada
  const saveUserData = async (data: { token: string, username: string, id: number }) => {
    try {
      // O AsyncStorage salva os dados em paralelo.
      // setItem irá criar a chave ou sobrescrever a anterior. Não precisa checar e remover.
      await Promise.all([
        AsyncStorage.setItem('token', data.token),
        AsyncStorage.setItem('username', data.username),
        AsyncStorage.setItem('user_id', String(data.id)) // AsyncStorage só guarda strings
      ]);
    } catch (e) {
      console.log('Erro ao salvar dados com AsyncStorage (login): ', e);
      // Opcional: Avisar o usuário que houve um erro ao salvar a sessão
      Alert.alert("Erro", "Não foi possível salvar os dados da sua sessão.");
    }
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      // 2. Usar 'api.post' e apenas o final da rota.
      // O 'baseURL' já está configurado no nosso arquivo 'api.js'
      const response = await api.post('/api/auth/login', {
        email: email,
        password: password,
      });

      // Chama a função para salvar todos os dados de uma vez.
      await saveUserData(response.data);

      Alert.alert('Sucesso', 'Usuário logado com sucesso');
      navigation.navigate('Main');

    } catch (error: any) { // Definindo tipo para ter acesso às propriedades do erro
      console.error('Erro no login:', error);
      if (error.isAxiosError && error.response) {
        // Usa a mensagem de erro que vem do seu backend
        Alert.alert('Erro', error.response.data.message || 'Erro no servidor');
      } else {
        Alert.alert('Erro', 'Erro ao conectar com o servidor.');
      }
    } finally {
      // O finally garante que o loading sempre será desativado, mesmo se der erro.
      setLoading(false);
      // Limpar campos após a tentativa de login, mesmo se falhar (opcional)
      setPassword('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
        accessibilityLabel="Email Input"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
        accessibilityLabel="Password Input"
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('AddUser')}>
        <Text style={styles.linkText}>Não tem uma conta ainda? Crie uma clicando aqui!</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#5D40A8',
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#5D40A8',
    borderRadius: 5,
    padding: 10,
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  linkText: {
    paddingTop: 30,
    color: '#013AE6',
  },
});

export default LoginScreen;