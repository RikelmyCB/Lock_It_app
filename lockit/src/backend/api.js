import axios from 'axios';
import Constants from 'expo-constants';

// Pega a URL da API definida no seu arquivo de configuração do Expo
const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
});

export default api;