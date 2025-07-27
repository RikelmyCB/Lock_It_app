import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, Animated, RefreshControl, TextInput, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import RNPickerSelect from "react-native-picker-select";
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import api from '../../../src/backend/api.js';
import { styles } from './styles';
import { config } from 'process';


const wait = (timeout: number) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};


export default function MainScreen() {
  const [username, setUsername] = useState("")
  const [userId, setUserId] = useState("")
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [passes, setPasses] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [email, setEmails] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({
    tituloNota: "",
    descricaoNota: "",
    apelidoCartao: "",
    nomeCartao: "",
    numeroCartao: "",
    vencimentoCartao: "",
    codigoSeguranca: "",
    tituloEmail: "",
    email: "",
    tituloSenha: "",
    senha: "",
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => {setRefreshing(false); renderRecentItems()});
  }, []);

const verifyDatas = () => {
  if (passes.length === 0 && notes.length === 0 && cards.length === 0 && email.length === 0) {
    return false;
  } else {
    return true;
  }
}

  const animation = useRef(new Animated.Value(0)).current;
  
  const navigation = useNavigation<NavigationProp<any>>();
  
  const toggleModal = () => {
    setModalVisible(!modalVisible);
    Animated.timing(animation, {
      toValue: modalVisible ? 0 : 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }
  
  const logoutHandler = async () => {
    navigation.navigate('Login');
  };

  const getDataAsyncStorage = async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return value;
      }
    } catch (e) {
      console.log('Erro ao recuperar dados com AsyncStorage:', e);
    }
    return null;
  };
  
  const fetchAsyncStorageData = async () => {
    const foundUsername = await getDataAsyncStorage('username');
    const foundUserID = await getDataAsyncStorage('user_id');

    if (foundUsername) setUsername(foundUsername);
    if (foundUserID) setUserId(foundUserID);
  };
  
  useEffect(() => {
    fetchAsyncStorageData();
  }, []);
  
  const checkSelection = async () => {
    if (selectedType == "") {
      console.log('Selecione um tipo de dado');

      alert('Selecione um tipo de dado');

      return true;
    }
  }

  const sendData = async () => {
    if (selectedType == 'nota') {
      try{
      const response = await api.post('/api/addnote', {
        user_id: userId,
        note_key: formData.tituloNota,
        note_value: formData.descricaoNota
      });
      // console.log('nota enviada')
    } catch (error) {
      console.log('Erro ao enviar nota:', error);
      }
    }
    
    if (selectedType == 'cartao') {
      try{
      const response = await api.post('/api/addkeycard',{
        user_id: userId,
        keycard_title: formData.apelidoCartao,
        keycard_name: formData.nomeCartao,
        keycard_number: formData.numeroCartao,
        keycard_data: formData.vencimentoCartao,
        security_code: formData.codigoSeguranca,
      })
      // console.log('cartão enviado')
      } catch (error) {
        console.log('Erro ao enviar cartão:', error);
      }
    }
    
    if (selectedType == 'email') {
      try{
      const response = api.post('/api/addemaildata',{
        user_id: userId,
        email_title: formData.tituloEmail,
        email: formData.email,
      })
      // console.log('email enviado')
        } catch (error) {
          console.log('Erro ao enviar email:', error);
      }
    }
    
    if (selectedType == 'senha') {
      try{
        console.log(formData.senha, formData.tituloSenha)
      const response = api.post('/api/addpassword',{
        user_id: userId,
        pass_title: formData.tituloSenha,
        password_key: formData.senha,
      })
      // console.log('senha enviada')
      } catch (error) {
        console.log('Erro ao enviar senha:', error);
      }
    }
    toggleModal();
  }




  const formatCardNumber = (text: string) => {
    let cleaned = text.replace(/\D/g, ''); // Remove caracteres não numéricos
    cleaned = cleaned.slice(0, 19); // Limita a 12 dígitos
  
    let formatted = cleaned.match(/.{1,4}/g)?.join(' ') || ''; // Adiciona espaço a cada 4 números
  
    
    setFormData({ ...formData, numeroCartao: formatted })
  };


  const fromatCardDate = (text: string) => {
    let cleaned = text.replace(/\D/g, ''); // Remove caracteres não numéricos
    cleaned = cleaned.slice(0, 5); // Limita a 4 dígitos

    let formated = cleaned.match(/.{1,2}/g)?.join('/') || ''; // Adiciona espaço a cada 2 números

    setFormData({ ...formData, vencimentoCartao: formated })
  }


const censoredText = (text: string) => {
  const censored = text.replace(/./g, '*'); // Substitui todos os caracteres por '*'
  return censored;
}





  
const fetchData = async () => {
  let token;

  try {
    token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log('Token não encontrado');
      return;
      
    }
    
  } catch (error) {
  console.error('Erro ao recuperar o token:', error);
  }
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  console.log("token:", token)
  try {
    const [notesRes, passesRes, emailsRes, keyCardsRes] = await Promise.all([
      api.get('/api/data?type=note', config).catch(err => err.response),
      api.get('/api/data?type=password', config).catch(err => err.response),
      api.get('/api/data?type=email', config).catch(err => err.response),
      api.get('/api/data?type=keycard', config).catch(err => err.response)
    ]);

    if(await notesRes.status === 200) {
      setNotes(notesRes.data.data.map((note: { note_key: string; note_value: string; data_type: string; }) => ({
        title: note.note_key,
        description: note.note_value,
        dataType: note.data_type
      })));
    } else if (await notesRes.status === 404) {
      // console.log('Nenhum dado encontrado para notas.');
    }

    if(await passesRes.status === 200) {
      setPasses(passesRes.data.data.map((pass: { pass_title: string; password_key: string; data_type: string; }) => ({
        title: pass.pass_title,
        key: pass.password_key,
        dataType: pass.data_type
      })));
    } else if (await passesRes.status === 404) {
      // console.log('Nenhum dado encontrado para senhas.');
    }
    
    if(await emailsRes.status === 200) {
      setEmails(emailsRes.data.data.map((email: { email_title: string; email: string; data_type: string; }) => ({
        title: email.email_title,
        key: email.email,
        dataType: email.data_type
      })));
    } else if (await emailsRes.status === 404) {
      // console.log('Nenhum dado encontrado para e-mails.');
    }

    if(await keyCardsRes.status === 200) {
      setCards(keyCardsRes.data.data.map((card: { keycard_title: string; keycard_name: string; keycard_number: string; keycard_data: string; security_code: string; data_type: string; }) => ({
        title: card.keycard_title,
        name: card.keycard_name,
        number: card.keycard_number,
        data: card.keycard_data,
        code: card.security_code,
        dataType: card.data_type
      })));
    } else if (await keyCardsRes.status === 404) {
      // console.log('Nenhum dado encontrado para keycards.');
    }
    
  } catch (error: any) {
    console.error('Erro ao buscar dados no fetch data da API:', error);
  }
};

useEffect(() => {
  const fetchDataAsync = async () => {
    try {
      await fetchData();
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
    }
  };

  fetchDataAsync();
}, [refreshing]);

  const renderRecentItems = () => {
    const recentItems = [...passes, ...notes, ...email, ...cards].slice(0, 7); // Pega os 7 itens mais recentes

    return recentItems.map((item, index) => (
      <TouchableOpacity key={index} style={styles.recentItem}>
        <Text style={styles.recentItemTitle}>{item.title}</Text>
        {item.description && <Text style={styles.recentItemDescription}>{item.description.slice(0, 40)+ '...'}</Text>}
        {item.key && <Text style={styles.recentItemDescription}>{item.key}</Text>}
        {item.name && <Text style={styles.recentItemDescription}>{item.name}</Text>}

      </TouchableOpacity>
    ));
  };

  const renderInputs = () => {
    switch (selectedType) {
      case "nota":
        return (
          <>
            <Text style={styles.label}>Título da Nota</Text>
            <TextInput
              value={formData.tituloNota}
              onChangeText={(text) => setFormData({ ...formData, tituloNota: text })}
              style={styles.input}
              placeholder="Digite o título"
              />
            <Text style={styles.label}>Descrição da Nota</Text>
            <TextInput
              value={formData.descricaoNota}
              onChangeText={(text) => setFormData({ ...formData, descricaoNota: text })}
              style={styles.input}
              placeholder="Digite a descrição"
              multiline
              />
          </>
        );
        case "cartao":
          return (
            <>
            <Text style={styles.label}>Apelido do Cartão</Text>
            <TextInput
              value={formData.apelidoCartao}
              onChangeText={(text) => setFormData({ ...formData, apelidoCartao: text })}
              style={styles.input}
              placeholder="Digite um apelido para esse cartão"
            />
            <Text style={styles.label}>Nome do Cartão</Text>
            <TextInput
              value={formData.nomeCartao}
              onChangeText={(text) => setFormData({ ...formData, nomeCartao: text })}
              style={styles.input}
              placeholder="Nome impresso no cartão"
            />
            <Text style={styles.label}>Número do Cartão</Text>
            <TextInput
              value={formData.numeroCartao}
              onChangeText={(text) => {''
                formatCardNumber(text);
              }
            }
              maxLength={19}
              keyboardType="numeric"
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              />
            <Text style={styles.label}>Data de Vencimento</Text>
            <TextInput
              value={formData.vencimentoCartao}
              onChangeText={(text) => {
                fromatCardDate(text);
              }
            }
            maxLength={5}
            style={styles.input}
            placeholder="MM/AA"
            />
            <Text style={styles.label}>Código de Segurança</Text>
            <TextInput
              value={formData.codigoSeguranca}
              onChangeText={(text) => setFormData({ ...formData, codigoSeguranca: text })}
              keyboardType="numeric"
              secureTextEntry
              style={styles.input}
              placeholder="CVV"
            />
          </>
        );
      case "email":
        return (
          <>
            <Text style={styles.label}>Título do Email</Text>
            <TextInput
              value={formData.tituloEmail}
              onChangeText={(text) => setFormData({ ...formData, tituloEmail: text })}
              style={styles.input}
              placeholder="Título do email"
              />
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              style={styles.input}
              placeholder="exemplo@email.com"
              />
          </>
        );
        case "senha":
        return (
          <>
            <Text style={styles.label}>Título da Senha</Text>
            <TextInput
              value={formData.tituloSenha}
              onChangeText={(text) => setFormData({ ...formData, tituloSenha: text })}
              style={styles.input}
              placeholder="Título da senha"
            />
            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={formData.senha} 
              onChangeText={(text) => setFormData({ ...formData, senha: text })}
              secureTextEntry
              style={styles.input}
              placeholder="Digite sua senha"
            />
          </>
        );
      default:
        return null;
    }
  };
  
  
  
  

  return (
    <ScrollView
    contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        >
    <LinearGradient colors={['#2C2C54', '#474787']} style={styles.container}>
      <View style={styles.WelcomeBox}>
        <TouchableOpacity onPress={logoutHandler} style={styles.logoutButton}>
          <Ionicons name="exit-outline" size={24} color="red" />
        </TouchableOpacity>
        <Text style={styles.welcomeText}>Bem-vindo de volta,</Text>
        <Text style={styles.usernameText}>{username ? username : 'Carregando...'}!</Text>
      </View>

      <View style={styles.sectionsContainer}>
        <View style={styles.categoriesContainer}>
          <TouchableOpacity style={styles.categoryButton}>
            <Ionicons name="lock-closed" size={24} color="white" />
            <Text style={styles.categoryText}>Senhas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton}>
            <Ionicons name="document-text" size={24} color="white" />
            <Text style={styles.categoryText}>Notas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton}>
            <Ionicons name="card" size={24} color="white" />
            <Text style={styles.categoryText}>Cartões</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton}>
            <Ionicons name="mail" size={24} color="white" />
            <Text style={styles.categoryText}>E-mails</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.recentTitle}>Adicionados Recentemente</Text>
        
        <View style={styles.recentContainer}>
          <View style={styles.recentItemsList}>
            {!verifyDatas() ? (<Text style={styles.recentItemTitle}>Nenhum item recente</Text>) : renderRecentItems()}

          </View>
        </View>
      </View>


      <Modal 
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        >

          <View style={styles.ModalContainer}>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [
                    {
                      translateY: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [900, 0]}),
                    },
                  ],
                },
              ]}
            >
            
            <View style={styles.formContainer}>
            <Text style={styles.title}>Selecione o Tipo de Dado</Text>
            
            {/* Menu suspenso (Dropdown) */}
            <RNPickerSelect
              onValueChange={(value: string) => setSelectedType(value)}
              items={[
                { label: "Nota", value: "nota" },
                { label: "Cartão de Crédito", value: "cartao" },
                { label: "Email", value: "email" },
                { label: "Senha", value: "senha" },
              ]}
              placeholder={{ label: "Escolha uma opção...", value: null }}
              style={{
                inputAndroid: styles.picker,
                inputIOS: styles.picker,
              }}
              />

            {renderInputs()}

           <Button title="Salvar" color='#3B3B98' onPress={ async () => { 
             if ( await checkSelection()) {
               return
              }
              
              sendData(); 
              toggleModal(); 
              setRefreshing(true); 
              onRefresh(); 
            }} 
            />
          </View>

            </Animated.View>
              <TouchableOpacity style={{height: 200, bottom: "83%", opacity: 0}} onPress={() => toggleModal()} ><View></View></TouchableOpacity>
          </View>
      </Modal>
        
      <TouchableOpacity style={styles.floatingButton} onPress={() => toggleModal()}>
        <AntDesign name="addfile" size={24} color="white" />
      </TouchableOpacity>
    </LinearGradient>
    </ScrollView>
  );
}