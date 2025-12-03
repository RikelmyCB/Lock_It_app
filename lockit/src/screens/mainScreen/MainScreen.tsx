import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, Animated, RefreshControl, TextInput, Button, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import RNPickerSelect from "react-native-picker-select";
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import axios from 'axios';
import Constants from 'expo-constants';
import { Clipboard } from 'react-native';


const wait = (timeout: number) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};


export default function MainScreen() {
  

  const api_url = Constants.expoConfig?.extra?.API_URL;

  const [username, setUsername] = useState("")
  const [userId, setUserId] = useState("")
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [passes, setPasses] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [email, setEmails] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [editFormData, setEditFormData] = useState<any>({});
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Garantir que userId está atualizado antes de buscar dados
    const loadedUserId = await getDataAsyncStorage('user_id');
    if (loadedUserId && loadedUserId !== userId) {
      setUserId(loadedUserId);
    }
    await fetchData();
    setRefreshing(false);
    renderRecentItems();
  }, [userId]);

const verifyDatas = () => {
  if (passes.length === 0 && notes.length === 0 && cards.length === 0 && email.length === 0) {
    return false;
  } else {
    return true;
  }
}

  const animation = useRef(new Animated.Value(0)).current;
  const detailAnimation = useRef(new Animated.Value(0)).current;
  
  const navigation = useNavigation<NavigationProp<any>>();
  
  const toggleModal = () => {
    if (!modalVisible) {
      setModalVisible(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
        setSelectedType("");
        setFormData({
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
      });
    }
  }

  // Função para formatar número do cartão
  const formatCardNumber = (text: string) => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');
    // Limita a 16 dígitos
    const limitedNumbers = numbers.slice(0, 16);
    // Adiciona espaços a cada 4 dígitos
    const formatted = limitedNumbers.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
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
    
    // Retornar o user_id para usar imediatamente
    return foundUserID;
  };

  useEffect(() => {
    const loadData = async () => {
      const loadedUserId = await fetchAsyncStorageData();
      // Só busca os dados após carregar o userId
      if (loadedUserId) {
        await fetchData();
      }
    };
    loadData();
  }, []);

  const sendData = async () => {
    // Garantir que userId está disponível
    let currentUserId: string = userId;
    if (!currentUserId || currentUserId === "") {
      const loadedUserId = await getDataAsyncStorage('user_id');
      if (!loadedUserId) {
        console.error('userId não encontrado ao enviar dados');
        return false;
      }
      currentUserId = loadedUserId;
      setUserId(currentUserId);
    }
    
    let success = false;
    
    if (selectedType == 'nota') {
      try{
      const response = await axios.post(`${api_url}/api/addnote`, {
        user_id: currentUserId,
        note_key: formData.tituloNota,
        note_value: formData.descricaoNota
      });
      console.log('nota enviada')
      success = true;
    } catch (error) {
      console.log('Erro ao enviar nota:', error);
      return false;
      }
    }
    
    if (selectedType == 'cartao') {
      try{
      const response = await axios.post(`${api_url}/api/addkeycard`,{
        user_id: currentUserId,
        keycard_title: formData.apelidoCartao,
        keycard_name: formData.nomeCartao,
        keycard_number: formData.numeroCartao,
        keycard_data: formData.vencimentoCartao,
        security_code: formData.codigoSeguranca,
      })
      console.log('cartão enviado')
      success = true;
      } catch (error) {
        console.log('Erro ao enviar cartão:', error);
        return false;
      }
    }
    
    if (selectedType == 'email') {
      try{
      const response = await axios.post(`${api_url}/api/addemaildata`,{
        user_id: currentUserId,
        email_title: formData.tituloEmail,
        email: formData.email,
      })
      console.log('email enviado')
      success = true;
        } catch (error) {
          console.log('Erro ao enviar email:', error);
          return false;
      }
    }

    if (selectedType == 'senha') {
      try{
      const response = await axios.post(`${api_url}/api/addpassword`,{
        user_id: currentUserId,
        pass_title: formData.tituloSenha,
        password_key: formData.senha,
      })
      console.log('senha enviada')
      success = true;
      } catch (error) {
        console.log('Erro ao enviar senha:', error);
        return false;
      }
    }
    
    return success;
  }
  
  const handleSaveButton = async () => {
    // Fechar o modal primeiro
    toggleModal();
    
    // Enviar os dados
    const success = await sendData();
    
    if (success) {
      // Limpar o formulário
      setFormData({
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
      setSelectedType("");
      
      // Atualizar os dados após um pequeno delay para garantir que o servidor processou
      setRefreshing(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Pequeno delay
      await fetchData();
      setRefreshing(false);
      renderRecentItems();
    }
  }













  
const fetchData = async () => {
  // Garantir que userId está disponível antes de fazer as requisições
  let currentUserId: string = userId;
  if (!currentUserId || currentUserId === "") {
    console.log('Aguardando userId ser carregado...');
    // Tentar carregar novamente do AsyncStorage
    const loadedUserId = await getDataAsyncStorage('user_id');
    if (!loadedUserId) {
      console.error('userId não encontrado no AsyncStorage');
      return;
    }
    currentUserId = loadedUserId;
    setUserId(currentUserId);
  }
  
  try {
    const api_url = Constants.expoConfig?.extra?.API_URL;
    console.log('Buscando dados com user_id:', currentUserId);
    
    const [notesRes, passesRes, emailsRes, keyCardsRes] = await Promise.all([
      axios.get(`${api_url}/api/getnotes`, { params: { user_id: currentUserId } }).catch(err => {
        console.log('Erro ao buscar notas:', err.response?.status || err.message);
        return err.response || { status: 500, data: null };
      }),
      axios.get(`${api_url}/api/getpasswords`, { params: { user_id: currentUserId } }).catch(err => {
        console.log('Erro ao buscar senhas:', err.response?.status || err.message);
        return err.response || { status: 500, data: null };
      }),
      axios.get(`${api_url}/api/getemails`, { params: { user_id: currentUserId } }).catch(err => {
        console.log('Erro ao buscar emails:', err.response?.status || err.message);
        return err.response || { status: 500, data: null };
      }),
      axios.get(`${api_url}/api/getkeycards`, { params: { user_id: currentUserId } }).catch(err => {
        console.log('Erro ao buscar cartões:', err.response?.status || err.message);
        return err.response || { status: 500, data: null };
      })
    ]);
    
    console.log('Respostas recebidas - Notas:', notesRes.status, 'Senhas:', passesRes.status, 'Emails:', emailsRes.status, 'Cartões:', keyCardsRes.status);

    // Atualizar notas - sempre atualizar o estado
    if(notesRes.status === 404 || !notesRes.data || !notesRes.data.data || !Array.isArray(notesRes.data.data)) {
      console.log('Nenhum dado encontrado para notas. Status:', notesRes.status);
      setNotes([]);
    } else {
      const mappedNotes = notesRes.data.data.map((note: { data_id: number; note_key: string; note_value: string; }) => ({
        title: note.note_key,
        description: note.note_value,
        id: note.data_id
      }));
      console.log('Notas atualizadas:', mappedNotes.length);
      setNotes(mappedNotes);
    }

    // Atualizar senhas - sempre atualizar o estado
    if(passesRes.status === 404 || !passesRes.data || !passesRes.data.data || !Array.isArray(passesRes.data.data)) {
      console.log('Nenhum dado encontrado para senhas. Status:', passesRes.status);
      setPasses([]);
    } else {
      const mappedPasses = passesRes.data.data.map((pass: { data_id: number; pass_title: string; password_key: string; }) => ({
        title: pass.pass_title,
        key: pass.password_key,
        id: pass.data_id
      }));
      console.log('Senhas atualizadas:', mappedPasses.length);
      setPasses(mappedPasses);
    }

    // Atualizar emails - sempre atualizar o estado
    if(emailsRes.status === 404 || !emailsRes.data || !emailsRes.data.data || !Array.isArray(emailsRes.data.data)) {
      console.log('Nenhum dado encontrado para e-mails. Status:', emailsRes.status);
      setEmails([]);
    } else {
      const mappedEmails = emailsRes.data.data.map((email: { data_id: number; email_title: string; email: string; }) => ({
        title: email.email_title,
        key: email.email,
        id: email.data_id
      }));
      console.log('Emails atualizados:', mappedEmails.length);
      setEmails(mappedEmails);
    }

    // Atualizar cartões - sempre atualizar o estado
    if(keyCardsRes.status === 404 || !keyCardsRes.data || !keyCardsRes.data.data || !Array.isArray(keyCardsRes.data.data)) {
      console.log('Nenhum dado encontrado para keycards. Status:', keyCardsRes.status);
      setCards([]);
    } else {
      const mappedCards = keyCardsRes.data.data.map((card: { data_id: number; keycard_title: string; keycard_name: string; keycard_number: string; keycard_data: string; security_code: string; }) => ({
        title: card.keycard_title,
        name: card.keycard_name,
        number: card.keycard_number,
        data: card.keycard_data,
        code: card.security_code,
        id: card.data_id
      }));
      console.log('Cartões atualizados:', mappedCards.length);
      setCards(mappedCards);
    }
    
  } catch (error: any) {
    console.error('Erro ao buscar dados no fetch data da API:', error);
  }
};

  // Removido - fetchData agora é chamado após carregar userId do AsyncStorage

  const deleteData = async (data_id: number, shouldRefresh: boolean = true) => {
    try {
      // Garantir que userId está disponível
      let currentUserId: string = userId;
      if (!currentUserId || currentUserId === "") {
        const loadedUserId = await getDataAsyncStorage('user_id');
        if (!loadedUserId) {
          console.error('userId não encontrado ao deletar');
          return false;
        }
        currentUserId = loadedUserId;
        setUserId(currentUserId);
      }
      
      const api_url = Constants.expoConfig?.extra?.API_URL;
      const response = await axios.delete(`${api_url}/api/deletedata`, {
        data: {
          data_id: data_id,
          user_id: currentUserId
        }
      });

      if (response.status === 200) {
        console.log('Dado deletado com sucesso.');
        // Atualizar os dados após deletar apenas se shouldRefresh for true
        if (shouldRefresh) {
          setRefreshing(true);
          await new Promise(resolve => setTimeout(resolve, 300)); // Pequeno delay para garantir processamento
          await fetchData();
          setRefreshing(false);
        }
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Erro ao deletar dado:', error);
      if (error.response) {
        console.error('Resposta do servidor:', error.response.data);
      }
      return false;
    }
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedItems([]); // Limpar seleção ao sair do modo
  };

  const toggleItemSelection = useCallback((itemId: number) => {
    const numericId = Number(itemId); // Garantir que é um número
    setSelectedItems(prevSelected => {
      // Criar um Set para comparação mais eficiente e precisa
      const selectedSet = new Set(prevSelected.map(id => Number(id)));
      if (selectedSet.has(numericId)) {
        return prevSelected.filter(id => Number(id) !== numericId);
      } else {
        return [...prevSelected, numericId];
      }
    });
  }, []);

  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) return;

    try {
      setRefreshing(true);
      
      // Deletar todos os itens selecionados (sem atualizar individualmente)
      const deleteResults = await Promise.all(
        selectedItems.map(id => deleteData(id, false))
      );
      
      // Verificar se todas as deleções foram bem-sucedidas
      const allSuccess = deleteResults.every(result => result === true);
      
      if (allSuccess) {
        console.log('Todos os itens foram deletados com sucesso.');
        
        // Remover os itens do estado local imediatamente para feedback visual
        setNotes(prevNotes => prevNotes.filter(note => !selectedItems.includes(note.id)));
        setPasses(prevPasses => prevPasses.filter(pass => !selectedItems.includes(pass.id)));
        setEmails(prevEmails => prevEmails.filter(emailItem => !selectedItems.includes(emailItem.id)));
        setCards(prevCards => prevCards.filter(card => !selectedItems.includes(card.id)));
      } else {
        console.warn('Alguns itens podem não ter sido deletados.');
      }
      
      // Limpar seleção e sair do modo de exclusão
      setSelectedItems([]);
      setDeleteMode(false);
      
      // Aguardar um pouco para garantir que o servidor processou todas as deleções
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Atualizar dados do servidor para garantir sincronização
      console.log('Atualizando dados após deleção...');
      await fetchData();
      
      setRefreshing(false);
    } catch (error) {
      console.error('Erro ao deletar itens selecionados:', error);
      setRefreshing(false);
    }
  };

  // Criar um Set para comparação mais eficiente
  const selectedSet = useMemo(() => new Set(selectedItems.map(id => Number(id))), [selectedItems]);

  // Função helper para retornar o ícone baseado no tipo
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'card':
        return 'card';
      case 'note':
        return 'document-text';
      case 'password':
        return 'lock-closed';
      case 'email':
        return 'mail';
      default:
        return 'document';
    }
  };

  const renderRecentItems = useCallback(() => {
    // Criar uma lista com identificador único para cada item, filtrando apenas itens com ID válido
    const itemsWithType = [
      ...passes.filter(item => item.id !== undefined && item.id !== null).map(item => ({ ...item, type: 'password', uniqueId: `password-${item.id}` })),
      ...notes.filter(item => item.id !== undefined && item.id !== null).map(item => ({ ...item, type: 'note', uniqueId: `note-${item.id}` })),
      ...email.filter(item => item.id !== undefined && item.id !== null).map(item => ({ ...item, type: 'email', uniqueId: `email-${item.id}` })),
      ...cards.filter(item => item.id !== undefined && item.id !== null).map(item => ({ ...item, type: 'card', uniqueId: `card-${item.id}` }))
    ].slice(0, 7); // Pega os 7 mais recentes

    return itemsWithType.map((item) => {
      const itemId = Number(item.id); // Garantir que é um número
      const isSelected = selectedSet.has(itemId);
      
      return (
        <TouchableOpacity 
          key={item.uniqueId} 
          style={[
            styles.recentItem,
            deleteMode && isSelected && styles.selectedItem,
            deleteMode && styles.deleteModeItem
          ]}
          onPress={() => {
            if (deleteMode && itemId) {
              toggleItemSelection(itemId);
            } else if (!deleteMode) {
              // Abrir modal de detalhes
              setSelectedItem(item);
              setEditFormData({});
              setEditMode(false);
              setDetailModalVisible(true);
              // Iniciar animação
              Animated.timing(detailAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }).start();
            }
          }}
          activeOpacity={0.7}
        >
          <LinearGradient 
            colors={isSelected ? ['#4CAF50', '#66BB6A'] : ['#5758BB', '#474787']} 
            style={styles.recentItemGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {deleteMode && (
              <View style={styles.checkboxContainer}>
                <Ionicons 
                  name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                  size={24} 
                  color={isSelected ? "white" : "rgba(255, 255, 255, 0.6)"} 
                />
              </View>
            )}
            <View style={styles.itemIconContainer}>
              <View style={styles.itemIconBackground}>
                <Ionicons 
                  name={getItemIcon(item.type)} 
                  size={22} 
                  color="white" 
                />
              </View>
            </View>
            <Text style={styles.recentItemTitle} numberOfLines={1}>{item.title}</Text>
            {item.description && <Text style={styles.recentItemDescription} numberOfLines={1}>{item.description.slice(0, 30)+ '...'}</Text>}
            {item.key && <Text style={styles.recentItemDescription} numberOfLines={1}>{item.key}</Text>}
            {item.name && <Text style={styles.recentItemDescription} numberOfLines={1}>{item.name}</Text>}
          </LinearGradient>
        </TouchableOpacity>
      );
    });
  }, [passes, notes, email, cards, deleteMode, selectedSet, toggleItemSelection]);

  const renderInputs = () => {
    switch (selectedType) {
      case "nota":
        return (
          <>
            <Text style={styles.label}>Título da Nota</Text>
            <TextInput
              value={formData.tituloNota}
              onChangeText={(text) => setFormData({ ...formData, tituloNota: text })}
              style={styles.inputTitle}
              placeholder="Digite o título"
            />
            <Text style={styles.label}>Descrição da Nota</Text>
            <TextInput
              value={formData.descricaoNota}
              onChangeText={(text) => setFormData({ ...formData, descricaoNota: text })}
              style={styles.inputDescription}
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
              style={styles.inputTitle}
              placeholder="Digite um apelido para esse cartão"
            />
            <Text style={styles.label}>Nome do Cartão</Text>
            <TextInput
              value={formData.nomeCartao}
              onChangeText={(text) => setFormData({ ...formData, nomeCartao: text })}
              style={styles.inputTitle}
              placeholder="Nome impresso no cartão"
            />
            <Text style={styles.label}>Número do Cartão</Text>
            <TextInput
              value={formData.numeroCartao}
              onChangeText={(text) => {
                const formatted = formatCardNumber(text);
                setFormData({ ...formData, numeroCartao: formatted });
              }}
              keyboardType="numeric"
              style={styles.inputTitle}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
            <Text style={styles.label}>Data de Vencimento</Text>
            <TextInput
              value={formData.vencimentoCartao}
              onChangeText={(text) => setFormData({ ...formData, vencimentoCartao: text })}
              style={styles.inputTitle}
              placeholder="MM/AA"
            />
            <Text style={styles.label}>Código de Segurança</Text>
            <TextInput
              value={formData.codigoSeguranca}
              onChangeText={(text) => setFormData({ ...formData, codigoSeguranca: text })}
              keyboardType="numeric"
              secureTextEntry
              style={styles.inputTitle}
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
              style={styles.inputTitle}
              placeholder="Título do email"
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              style={styles.inputDescription}
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
              style={styles.inputTitle}
              placeholder="Título da senha"
            />
            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={formData.senha} 
              onChangeText={(text) => setFormData({ ...formData, senha: text })}
              secureTextEntry
              style={styles.inputDescription}
              placeholder="Digite sua senha"
            />
          </>
        );
      default:
        return null;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Copiado!', `${label} copiado para a área de transferência.`);
  };

  const handleDeleteFromDetail = async () => {
    if (!selectedItem) return;
    Alert.alert('Confirmar exclusão', 'Tem certeza que deseja deletar este item?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Deletar', style: 'destructive', onPress: async () => {
        const success = await deleteData(selectedItem.id, true);
        if (success) { setDetailModalVisible(false); setSelectedItem(null); }
      }}
    ]);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;
    try {
      let currentUserId: string = userId;
      if (!currentUserId || currentUserId === "") {
        const loadedUserId = await getDataAsyncStorage('user_id');
        if (!loadedUserId) { Alert.alert('Erro', 'userId não encontrado'); return; }
        currentUserId = loadedUserId;
        setUserId(currentUserId);
      }
      const api_url = Constants.expoConfig?.extra?.API_URL;
      const updatePayload: any = { data_id: selectedItem.id, user_id: currentUserId, data_type: selectedItem.type };
      if (selectedItem.type === 'note') {
        updatePayload.note_key = editFormData.title !== undefined ? editFormData.title : selectedItem.title;
        updatePayload.note_value = editFormData.description !== undefined ? editFormData.description : selectedItem.description;
      } else if (selectedItem.type === 'password') {
        updatePayload.pass_title = editFormData.title !== undefined ? editFormData.title : selectedItem.title;
        updatePayload.password_key = editFormData.key !== undefined ? editFormData.key : selectedItem.key;
      } else if (selectedItem.type === 'email') {
        updatePayload.email_title = editFormData.title !== undefined ? editFormData.title : selectedItem.title;
        updatePayload.email = editFormData.key !== undefined ? editFormData.key : selectedItem.key;
      } else if (selectedItem.type === 'card') {
        updatePayload.keycard_title = editFormData.title !== undefined ? editFormData.title : selectedItem.title;
        updatePayload.keycard_name = editFormData.name !== undefined ? editFormData.name : selectedItem.name;
        updatePayload.keycard_number = editFormData.number !== undefined ? editFormData.number : selectedItem.number;
        updatePayload.keycard_data = editFormData.data !== undefined ? editFormData.data : selectedItem.data;
        updatePayload.security_code = editFormData.code !== undefined ? editFormData.code : selectedItem.code;
      }
      const response = await axios.put(`${api_url}/api/updatedata`, updatePayload);
      if (response.status === 200) {
        Alert.alert('Sucesso', 'Item atualizado com sucesso!');
        setEditMode(false);
        setDetailModalVisible(false);
        setSelectedItem(null);
        setEditFormData({});
        await fetchData();
      }
    } catch (error: any) {
      console.error('Erro ao atualizar item:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o item.');
    }
  };

  const renderDetailContent = () => {
    if (!selectedItem) return null;
    if (editMode) {
      return (
        <ScrollView style={styles.detailScrollView}>
          {selectedItem.type === 'note' && (
            <>
              <Text style={styles.label}>Título</Text>
              <TextInput value={editFormData.title !== undefined ? editFormData.title : selectedItem.title} onChangeText={(text) => setEditFormData({ ...editFormData, title: text })} style={styles.inputTitle} placeholder="Título da nota" />
              <Text style={styles.label}>Descrição</Text>
              <TextInput value={editFormData.description !== undefined ? editFormData.description : selectedItem.description} onChangeText={(text) => setEditFormData({ ...editFormData, description: text })} style={styles.inputDescription} placeholder="Descrição da nota" multiline />
            </>
          )}
          {selectedItem.type === 'password' && (
            <>
              <Text style={styles.label}>Título</Text>
              <TextInput value={editFormData.title !== undefined ? editFormData.title : selectedItem.title} onChangeText={(text) => setEditFormData({ ...editFormData, title: text })} style={styles.inputTitle} placeholder="Título da senha" />
              <Text style={styles.label}>Senha</Text>
              <TextInput value={editFormData.key !== undefined ? editFormData.key : selectedItem.key} onChangeText={(text) => setEditFormData({ ...editFormData, key: text })} style={styles.inputTitle} placeholder="Senha" secureTextEntry />
            </>
          )}
          {selectedItem.type === 'email' && (
            <>
              <Text style={styles.label}>Título</Text>
              <TextInput value={editFormData.title !== undefined ? editFormData.title : selectedItem.title} onChangeText={(text) => setEditFormData({ ...editFormData, title: text })} style={styles.inputTitle} placeholder="Título do email" />
              <Text style={styles.label}>Email</Text>
              <TextInput value={editFormData.key !== undefined ? editFormData.key : selectedItem.key} onChangeText={(text) => setEditFormData({ ...editFormData, key: text })} style={styles.inputTitle} placeholder="Email" keyboardType="email-address" />
            </>
          )}
          {selectedItem.type === 'card' && (
            <>
              <Text style={styles.label}>Apelido do Cartão</Text>
              <TextInput value={editFormData.title !== undefined ? editFormData.title : selectedItem.title} onChangeText={(text) => setEditFormData({ ...editFormData, title: text })} style={styles.inputTitle} placeholder="Apelido" />
              <Text style={styles.label}>Nome do Cartão</Text>
              <TextInput value={editFormData.name !== undefined ? editFormData.name : selectedItem.name} onChangeText={(text) => setEditFormData({ ...editFormData, name: text })} style={styles.inputTitle} placeholder="Nome" />
              <Text style={styles.label}>Número do Cartão</Text>
              <TextInput value={editFormData.number !== undefined ? editFormData.number : selectedItem.number} onChangeText={(text) => setEditFormData({ ...editFormData, number: text })} style={styles.inputTitle} placeholder="Número" keyboardType="numeric" />
              <Text style={styles.label}>Data de Vencimento</Text>
              <TextInput value={editFormData.data !== undefined ? editFormData.data : selectedItem.data} onChangeText={(text) => setEditFormData({ ...editFormData, data: text })} style={styles.inputTitle} placeholder="MM/AA" />
              <Text style={styles.label}>Código de Segurança</Text>
              <TextInput value={editFormData.code !== undefined ? editFormData.code : selectedItem.code} onChangeText={(text) => setEditFormData({ ...editFormData, code: text })} style={styles.inputTitle} placeholder="CVV" keyboardType="numeric" secureTextEntry />
            </>
          )}
          <View style={styles.editButtonsContainer}>
            <Button title="Salvar" color='#3B3B98' onPress={handleSaveEdit} />
            <View style={{ marginTop: 10 }} />
            <Button title="Cancelar" color='#999' onPress={() => { setEditMode(false); setEditFormData({}); }} />
          </View>
        </ScrollView>
      );
    }
    return (
      <ScrollView style={styles.detailScrollView}>
        <View style={styles.detailHeader}>
          <Ionicons name={getItemIcon(selectedItem.type)} size={40} color="#3B3B98" />
          <Text style={styles.detailTitle}>{selectedItem.title}</Text>
        </View>
        {selectedItem.type === 'note' && (
          <View style={styles.detailField}>
            <Text style={styles.detailLabel}>Descrição:</Text>
            <Text style={styles.detailValue}>{selectedItem.description}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={() => copyToClipboard(selectedItem.description, 'Descrição')}>
              <Ionicons name="copy-outline" size={20} color="#3B3B98" />
              <Text style={styles.copyButtonText}>Copiar Descrição</Text>
            </TouchableOpacity>
          </View>
        )}
        {selectedItem.type === 'password' && (
          <View style={styles.detailField}>
            <Text style={styles.detailLabel}>Senha:</Text>
            <Text style={styles.detailValue}>{selectedItem.key}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={() => copyToClipboard(selectedItem.key, 'Senha')}>
              <Ionicons name="copy-outline" size={20} color="#3B3B98" />
              <Text style={styles.copyButtonText}>Copiar Senha</Text>
            </TouchableOpacity>
          </View>
        )}
        {selectedItem.type === 'email' && (
          <View style={styles.detailField}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{selectedItem.key}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={() => copyToClipboard(selectedItem.key, 'Email')}>
              <Ionicons name="copy-outline" size={20} color="#3B3B98" />
              <Text style={styles.copyButtonText}>Copiar Email</Text>
            </TouchableOpacity>
          </View>
        )}
        {selectedItem.type === 'card' && (
          <>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Nome:</Text>
              <Text style={styles.detailValue}>{selectedItem.name}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={() => copyToClipboard(selectedItem.name, 'Nome')}>
                <Ionicons name="copy-outline" size={20} color="#3B3B98" />
                <Text style={styles.copyButtonText}>Copiar Nome</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Número:</Text>
              <Text style={styles.detailValue}>{selectedItem.number}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={() => copyToClipboard(selectedItem.number, 'Número do Cartão')}>
                <Ionicons name="copy-outline" size={20} color="#3B3B98" />
                <Text style={styles.copyButtonText}>Copiar Número</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Vencimento:</Text>
              <Text style={styles.detailValue}>{selectedItem.data}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={() => copyToClipboard(selectedItem.data, 'Data de Vencimento')}>
                <Ionicons name="copy-outline" size={20} color="#3B3B98" />
                <Text style={styles.copyButtonText}>Copiar Vencimento</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>CVV:</Text>
              <Text style={styles.detailValue}>{selectedItem.code}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={() => copyToClipboard(selectedItem.code, 'CVV')}>
                <Ionicons name="copy-outline" size={20} color="#3B3B98" />
                <Text style={styles.copyButtonText}>Copiar CVV</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        <View style={styles.detailActions}>
          <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => { setEditFormData({ title: selectedItem.title, description: selectedItem.description, key: selectedItem.key, name: selectedItem.name, number: selectedItem.number, data: selectedItem.data, code: selectedItem.code }); setEditMode(true); }}>
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDeleteFromDetail}>
            <Ionicons name="trash-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Deletar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };
  




  return (
    <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        >
    <LinearGradient colors={['#2C2C54', '#474787', '#5758BB']} style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <LinearGradient 
          colors={['#3B3B98', '#474787']} 
          style={styles.WelcomeBox}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={toggleDeleteMode} 
              style={[styles.headerActionButton, deleteMode && styles.deleteModeButtonActive]}
            >
              <Ionicons 
                name={deleteMode ? "trash" : "trash-outline"} 
                size={22} 
                color={deleteMode ? "#FF6B6B" : "white"} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={logoutHandler} style={styles.headerActionButton}>
              <Ionicons name="exit-outline" size={22} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>Bem-vindo de volta</Text>
            <Text style={styles.usernameText}>{username ? username : 'Carregando...'}!</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.sectionsContainer}>
        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <View style={styles.categoriesContainer}>
            <TouchableOpacity 
              style={styles.categoryButton}
              onPress={() => navigation.navigate('Passwords')}
              activeOpacity={0.8}
            >
              <LinearGradient 
                colors={['#5758BB', '#474787']} 
                style={styles.categoryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.categoryIconContainer}>
                  <Ionicons name="lock-closed" size={28} color="white" />
                </View>
                <Text style={styles.categoryText}>Senhas</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.categoryButton}
              onPress={() => navigation.navigate('Notes')}
              activeOpacity={0.8}
            >
              <LinearGradient 
                colors={['#5758BB', '#474787']} 
                style={styles.categoryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.categoryIconContainer}>
                  <Ionicons name="document-text" size={28} color="white" />
                </View>
                <Text style={styles.categoryText}>Notas</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.categoryButton}
              onPress={() => navigation.navigate('Cards')}
              activeOpacity={0.8}
            >
              <LinearGradient 
                colors={['#5758BB', '#474787']} 
                style={styles.categoryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.categoryIconContainer}>
                  <Ionicons name="card" size={28} color="white" />
                </View>
                <Text style={styles.categoryText}>Cartões</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.categoryButton}
              onPress={() => navigation.navigate('Emails')}
              activeOpacity={0.8}
            >
              <LinearGradient 
                colors={['#5758BB', '#474787']} 
                style={styles.categoryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.categoryIconContainer}>
                  <Ionicons name="mail" size={28} color="white" />
                </View>
                <Text style={styles.categoryText}>E-mails</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Items Section */}
        <View style={styles.recentSection}>
          <View style={styles.recentSectionHeader}>
            <Ionicons name="time-outline" size={24} color="#F7F1E3" />
            <Text style={styles.recentTitle}>
              {deleteMode ? 'Modo de Exclusão' : 'Adicionados Recentemente'}
            </Text>
          </View>
          
          {deleteMode && selectedItems.length > 0 && (
            <View style={styles.deleteActionsContainer}>
              <View style={styles.selectedCountContainer}>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.selectedCount}>
                  {selectedItems.length} item(s) selecionado(s)
                </Text>
              </View>
              <View style={styles.deleteButtonsRow}>
                <TouchableOpacity 
                  style={styles.confirmDeleteButton}
                  onPress={deleteSelectedItems}
                >
                  <Ionicons name="trash" size={18} color="white" />
                  <Text style={styles.confirmDeleteText}>Deletar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelDeleteButton}
                  onPress={toggleDeleteMode}
                >
                  <Text style={styles.cancelDeleteText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          <View style={styles.recentContainer}>
            {!verifyDatas() ? (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={48} color="#5758BB" />
                <Text style={styles.emptyStateText}>Nenhum item recente</Text>
                <Text style={styles.emptyStateSubtext}>Adicione novos itens para começar</Text>
              </View>
            ) : (
              <View style={styles.recentItemsList}>
                {renderRecentItems()}
              </View>
            )}
          </View>
        </View>
      </View>


      <Modal 
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={toggleModal}
        >
          <View style={styles.ModalContainer}>
            <TouchableOpacity 
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={toggleModal}
            />
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [
                    {
                      translateY: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1000, 0]}),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <View style={styles.modalHeaderIconContainer}>
                    <Ionicons name="add-circle" size={32} color="#3B3B98" />
                  </View>
                  <Text style={styles.modalHeaderTitle}>Adicionar Novo Item</Text>
                </View>
                <TouchableOpacity onPress={toggleModal} style={styles.modalCloseButton}>
                  <Ionicons name="close" size={28} color="#3B3B98" />
                </TouchableOpacity>
              </View>
            
              <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.typeSelectorContainer}>
                  <Text style={styles.sectionLabel}>Tipo de Dado</Text>
                  <RNPickerSelect
                    onValueChange={(value: string) => setSelectedType(value)}
                    items={[
                      { label: "📝 Nota", value: "nota" },
                      { label: "💳 Cartão de Crédito", value: "cartao" },
                      { label: "📧 Email", value: "email" },
                      { label: "🔒 Senha", value: "senha" },
                    ]}
                    placeholder={{ label: "Escolha uma opção...", value: null }}
                    style={{
                      inputAndroid: styles.picker,
                      inputIOS: styles.picker,
                    }}
                  />
                </View>

                {selectedType && (
                  <View style={styles.inputsSection}>
                    <View style={styles.sectionDivider} />
                    <Text style={styles.sectionLabel}>Informações</Text>
                    {renderInputs()}
                  </View>
                )}

                {selectedType && (
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSaveButton}
                  >
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                    <Text style={styles.saveButtonText}>Salvar</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </Animated.View>
          </View>
      </Modal>

      {!deleteMode && (
        <TouchableOpacity 
          style={styles.floatingButton} 
          onPress={() => toggleModal()}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={36} color="white" />
        </TouchableOpacity>
      )}

      {/* Modal de Detalhes */}
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => {
          Animated.timing(detailAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setDetailModalVisible(false);
            setEditMode(false);
            setSelectedItem(null);
            setEditFormData({});
          });
        }}
      >
        <View style={styles.ModalContainer}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              Animated.timing(detailAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }).start(() => {
                setDetailModalVisible(false);
                setEditMode(false);
                setSelectedItem(null);
                setEditFormData({});
              });
            }}
          />
          <Animated.View
            style={[
              styles.detailModalContent,
              {
                transform: [
                  {
                    translateY: detailAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1000, 0]
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.detailModalHeader}>
              <TouchableOpacity
                onPress={() => {
                  Animated.timing(detailAnimation, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                  }).start(() => {
                    setDetailModalVisible(false);
                    setEditMode(false);
                    setSelectedItem(null);
                    setEditFormData({});
                  });
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
              <Text style={styles.detailModalTitle}>
                {editMode ? 'Editar Item' : 'Detalhes do Item'}
              </Text>
            </View>
            {renderDetailContent()}
          </Animated.View>
        </View>
      </Modal>

    </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },

  headerSection: {
    paddingTop: Constants.statusBarHeight || 40,
    marginBottom: 20,
  },
  WelcomeBox: {
    width: '100%',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 10,
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteModeButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(247, 241, 227, 0.9)',
    marginBottom: 5,
  },
  usernameText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F7F1E3',
    textAlign: 'center',
  },
  sectionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  categoriesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F7F1E3',
    marginBottom: 15,
    paddingLeft: 5,
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  categoryButtonGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  recentSection: {
    marginTop: 10,
  },
  recentSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingLeft: 5,
  },
  recentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F7F1E3',
    marginLeft: 8,
  },
  recentContainer: {
    backgroundColor: '#23235B',
    padding: 20,
    borderRadius: 20,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  recentItemsList: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  recentItem: {
    borderRadius: 16,
    width: '47%',
    minHeight: 110,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  recentItemGradient: {
    padding: 12,
    borderRadius: 16,
    width: '100%',
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F7F1E3',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: 'rgba(247, 241, 227, 0.7)',
    textAlign: 'center',
  },
  deleteModeItem: {
    opacity: 0.8,
  },
  selectedItem: {
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#66BB6A',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  itemIconContainer: {
    marginTop: 2,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  recentItemTitle: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 4,
  },
  recentItemDescription: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
    fontSize: 11,
    textAlign: 'center',
  },

  floatingButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: '#3B3B98',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B3B98',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  ModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: '#F7F1E3',
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 25,
    backgroundColor: '#3B3B98',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalHeaderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailModalContent: {
    backgroundColor: 'white',
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    maxHeight: '90%',
  },

  formContainer: {
    padding: 20,
    flexGrow: 1,
  },
  typeSelectorContainer: {
    marginBottom: 20,
  },
  inputsSection: {
    marginTop: 10,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B3B98',
    marginBottom: 12,
    marginTop: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: '#3B3B98',
  },
  inputTitle: {
    height: 50,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: 'white',
    fontSize: 16,
    color: '#333',
  },
  inputDescription: {
    height: 160,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingTop: 15,
    marginBottom: 15,
    backgroundColor: 'white',
    fontSize: 16,
    color: '#333',
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: '#474787',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B3B98',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#3B3B98',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },

  radioText: {
    fontSize: 16,
  },

  selectedRadio: {
    fontWeight: "bold",
    color: "blue",
  },

  picker: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: 'white',
    color: '#333',
    marginBottom: 10,
  },
  deleteActionsContainer: {
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 16,
    marginTop: 15,
    marginBottom: 15,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  selectedCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  selectedCount: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmDeleteButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#DC3545',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC3545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmDeleteText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  cancelDeleteButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelDeleteText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  detailModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 5,
  },
  detailModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginRight: 33,
  },
  detailScrollView: {
    padding: 20,
  },
  detailHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  detailField: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3e3e3',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  copyButtonText: {
    marginLeft: 8,
    color: '#3B3B98',
    fontWeight: '600',
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#3B3B98',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  editButtonsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});