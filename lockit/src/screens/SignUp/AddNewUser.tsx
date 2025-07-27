import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import api from '../../../src/backend/api.js';

export default function AddNewUser() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
    
  const handleRegister = async () => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    
    if (!username || !email || !password) {
      alert('Preencha todos os campos');
      return;
    }
    if (!emailRegex.test(email)) {
      alert('Por favor, digite um e-mail válido');
      return;
    }
  
    setLoading(true);
  
    try {
      
      const response = await api.post('/api/auth/register', {
        username: username,
        email: email,
        password: password,
      });

      // Se o cadastro for bem-sucedido, você pode armazenar os dados do usuário
      alert('Usuário cadastrado com sucesso!\nAgora você pode fazer o login.');
      navigation.navigate('Login');

    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      if (error.isAxiosError && error.response) {
        alert(`Erro: ${error.response.data.message || 'Erro no servidor'}`);
      } else {
        alert('Erro ao conectar com o servidor.');
      }
    } finally {
      // O 'finally' garante que o loading sempre será desativado.
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastre um novo usuário</Text>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Nome de Usuário</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Digite seu nome de usuário"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#999"
          maxLength={20}
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Digite seu e-mail"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#999"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Crie uma senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLinkText}>Já tem uma conta? Faça o login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#5D40A8',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#5D40A8',
  },
  textInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#F2F2F2',
  },
  button: {
    backgroundColor: '#5D40A8',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    height: 40,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginLink: {
    marginTop: 15,
    alignSelf: 'center'
  },
  loginLinkText: {
    color: '#013AE6',
    textAlign: 'center',
  }
});