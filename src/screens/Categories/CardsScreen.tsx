import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, Animated, RefreshControl, TextInput, Button, Alert, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Constants from 'expo-constants';
import { Clipboard } from 'react-native';

export default function CardsScreen() {
  const api_url = Constants.expoConfig?.extra?.API_URL;
  const navigation = useNavigation<NavigationProp<any>>();
  
  const [userId, setUserId] = useState("");
  const [cards, setCards] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest' | 'az' | 'za'>('recent');
  const [pinnedItems, setPinnedItems] = useState<number[]>([]);
  const detailAnimation = useRef(new Animated.Value(0)).current;

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

  const fetchData = async () => {
    let currentUserId: string = userId;
    if (!currentUserId || currentUserId === "") {
      const loadedUserId = await getDataAsyncStorage('user_id');
      if (!loadedUserId) {
        console.error('userId não encontrado no AsyncStorage');
        return;
      }
      currentUserId = loadedUserId;
      setUserId(currentUserId);
    }
    
    try {
      const cardsRes = await axios.get(`${api_url}/api/getkeycards`, { params: { user_id: currentUserId } }).catch(err => {
        return err.response || { status: 500, data: null };
      });

      if(cardsRes.status === 404 || !cardsRes.data || !cardsRes.data.data || !Array.isArray(cardsRes.data.data)) {
        setCards([]);
      } else {
        const mappedCards = cardsRes.data.data.map((card: { data_id: number; keycard_title: string; keycard_name: string; keycard_number: string; keycard_data: string; security_code: string; }) => ({
          title: card.keycard_title,
          name: card.keycard_name,
          number: card.keycard_number,
          data: card.keycard_data,
          code: card.security_code,
          id: card.data_id,
          type: 'card'
        }));
        setCards(mappedCards);
      }
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const loadedUserId = await getDataAsyncStorage('user_id');
        if (loadedUserId) {
          setUserId(loadedUserId);
          await fetchData();
        }
      };
      loadData();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [userId]);

  const deleteData = async (data_id: number) => {
    try {
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
        await fetchData();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Erro ao deletar dado:', error);
      return false;
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
        const success = await deleteData(selectedItem.id);
        if (success) {
          setDetailModalVisible(false);
          setSelectedItem(null);
        }
      }}
    ]);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;
    try {
      let currentUserId: string = userId;
      if (!currentUserId || currentUserId === "") {
        const loadedUserId = await getDataAsyncStorage('user_id');
        if (!loadedUserId) {
          Alert.alert('Erro', 'userId não encontrado');
          return;
        }
        currentUserId = loadedUserId;
        setUserId(currentUserId);
      }
      const api_url = Constants.expoConfig?.extra?.API_URL;
      const updatePayload: any = {
        data_id: selectedItem.id,
        user_id: currentUserId,
        data_type: 'keycard',
        keycard_title: editFormData.title !== undefined ? editFormData.title : selectedItem.title,
        keycard_name: editFormData.name !== undefined ? editFormData.name : selectedItem.name,
        keycard_number: editFormData.number !== undefined ? editFormData.number : selectedItem.number,
        keycard_data: editFormData.data !== undefined ? editFormData.data : selectedItem.data,
        security_code: editFormData.code !== undefined ? editFormData.code : selectedItem.code
      };
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

  const togglePin = async (itemId: number) => {
    const newPinned = pinnedItems.includes(itemId) 
      ? pinnedItems.filter(id => id !== itemId)
      : [...pinnedItems, itemId];
    setPinnedItems(newPinned);
    try {
      await AsyncStorage.setItem('pinned_cards', JSON.stringify(newPinned));
    } catch (e) {
      console.log('Erro ao salvar itens fixados:', e);
    }
  };

  const loadPinnedItems = async () => {
    try {
      const pinned = await AsyncStorage.getItem('pinned_cards');
      if (pinned) {
        setPinnedItems(JSON.parse(pinned));
      }
    } catch (e) {
      console.log('Erro ao carregar itens fixados:', e);
    }
  };

  useEffect(() => {
    loadPinnedItems();
  }, []);

  const sortedCards = useMemo(() => {
    const sorted = [...cards];
    const pinned = sorted.filter(item => pinnedItems.includes(item.id));
    const unpinned = sorted.filter(item => !pinnedItems.includes(item.id));

    const sortItems = (items: any[]) => {
      switch (sortOrder) {
        case 'recent':
          return items;
        case 'oldest':
          return [...items].reverse();
        case 'az':
          return [...items].sort((a, b) => a.title.localeCompare(b.title));
        case 'za':
          return [...items].sort((a, b) => b.title.localeCompare(a.title));
        default:
          return items;
      }
    };

    return [...sortItems(pinned), ...sortItems(unpinned)];
  }, [cards, sortOrder, pinnedItems]);

  const renderDetailContent = () => {
    if (!selectedItem) return null;
    if (editMode) {
      return (
        <ScrollView style={styles.detailScrollView}>
          <Text style={styles.label}>Apelido do Cartão</Text>
          <TextInput
            value={editFormData.title !== undefined ? editFormData.title : selectedItem.title}
            onChangeText={(text) => setEditFormData({ ...editFormData, title: text })}
            style={styles.inputTitle}
            placeholder="Apelido"
          />
          <Text style={styles.label}>Nome do Cartão</Text>
          <TextInput
            value={editFormData.name !== undefined ? editFormData.name : selectedItem.name}
            onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
            style={styles.inputTitle}
            placeholder="Nome"
          />
          <Text style={styles.label}>Número do Cartão</Text>
          <TextInput
            value={editFormData.number !== undefined ? editFormData.number : selectedItem.number}
            onChangeText={(text) => setEditFormData({ ...editFormData, number: text })}
            style={styles.inputTitle}
            placeholder="Número"
            keyboardType="numeric"
          />
          <Text style={styles.label}>Data de Vencimento</Text>
          <TextInput
            value={editFormData.data !== undefined ? editFormData.data : selectedItem.data}
            onChangeText={(text) => setEditFormData({ ...editFormData, data: text })}
            style={styles.inputTitle}
            placeholder="MM/AA"
          />
          <Text style={styles.label}>Código de Segurança</Text>
          <TextInput
            value={editFormData.code !== undefined ? editFormData.code : selectedItem.code}
            onChangeText={(text) => setEditFormData({ ...editFormData, code: text })}
            style={styles.inputTitle}
            placeholder="CVV"
            keyboardType="numeric"
            secureTextEntry
          />
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
          <Ionicons name="card" size={40} color="#3B3B98" />
          <Text style={styles.detailTitle}>{selectedItem.title}</Text>
        </View>
        <View style={styles.detailField}>
          <Text style={styles.detailLabel}>Nome:</Text>
          <Text style={styles.detailValue}>{selectedItem.name}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyToClipboard(selectedItem.name, 'Nome')}
          >
            <Ionicons name="copy-outline" size={20} color="#3B3B98" />
            <Text style={styles.copyButtonText}>Copiar Nome</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.detailField}>
          <Text style={styles.detailLabel}>Número:</Text>
          <Text style={styles.detailValue}>{selectedItem.number}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyToClipboard(selectedItem.number, 'Número do Cartão')}
          >
            <Ionicons name="copy-outline" size={20} color="#3B3B98" />
            <Text style={styles.copyButtonText}>Copiar Número</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.detailField}>
          <Text style={styles.detailLabel}>Vencimento:</Text>
          <Text style={styles.detailValue}>{selectedItem.data}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyToClipboard(selectedItem.data, 'Data de Vencimento')}
          >
            <Ionicons name="copy-outline" size={20} color="#3B3B98" />
            <Text style={styles.copyButtonText}>Copiar Vencimento</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.detailField}>
          <Text style={styles.detailLabel}>CVV:</Text>
          <Text style={styles.detailValue}>{selectedItem.code}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyToClipboard(selectedItem.code, 'CVV')}
          >
            <Ionicons name="copy-outline" size={20} color="#3B3B98" />
            <Text style={styles.copyButtonText}>Copiar CVV</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.detailActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => {
              setEditFormData({
                title: selectedItem.title,
                name: selectedItem.name,
                number: selectedItem.number,
                data: selectedItem.data,
                code: selectedItem.code
              });
              setEditMode(true);
            }}
          >
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteFromDetail}
          >
            <Ionicons name="trash-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Deletar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const isPinned = pinnedItems.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.itemCard, isPinned && styles.pinnedCard]}
        onPress={() => {
          setSelectedItem(item);
          setEditFormData({});
          setEditMode(false);
          setDetailModalVisible(true);
          Animated.timing(detailAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemIconContainer}>
            <Ionicons name="card" size={24} color="#3B3B98" />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.itemSubtitle} numberOfLines={1}>{item.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.pinButton}
            onPress={(e) => {
              e.stopPropagation();
              togglePin(item.id);
            }}
          >
            <Ionicons
              name={isPinned ? "pin" : "pin-outline"}
              size={20}
              color={isPinned ? "#3B3B98" : "#999"}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#2C2C54', '#474787']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="card" size={28} color="white" />
          <Text style={styles.headerTitle}>Cartões</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filtersLabel}>Ordenar por:</Text>
        <View style={styles.filtersButtons}>
          <TouchableOpacity
            style={[styles.filterButton, sortOrder === 'recent' && styles.filterButtonActive]}
            onPress={() => setSortOrder('recent')}
          >
            <Text style={[styles.filterButtonText, sortOrder === 'recent' && styles.filterButtonTextActive]}>Mais Recente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, sortOrder === 'oldest' && styles.filterButtonActive]}
            onPress={() => setSortOrder('oldest')}
          >
            <Text style={[styles.filterButtonText, sortOrder === 'oldest' && styles.filterButtonTextActive]}>Mais Antigo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, sortOrder === 'az' && styles.filterButtonActive]}
            onPress={() => setSortOrder('az')}
          >
            <Text style={[styles.filterButtonText, sortOrder === 'az' && styles.filterButtonTextActive]}>A-Z</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, sortOrder === 'za' && styles.filterButtonActive]}
            onPress={() => setSortOrder('za')}
          >
            <Text style={[styles.filterButtonText, sortOrder === 'za' && styles.filterButtonTextActive]}>Z-A</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={sortedCards}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color="#999" />
            <Text style={styles.emptyText}>Nenhum cartão cadastrado</Text>
          </View>
        }
      />

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
                {editMode ? 'Editar Cartão' : 'Detalhes do Cartão'}
              </Text>
            </View>
            {renderDetailContent()}
          </Animated.View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#3B3B98',
  },
  backButton: {
    padding: 5,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerRight: {
    width: 34,
  },
  filtersContainer: {
    padding: 15,
    backgroundColor: '#23235B',
  },
  filtersLabel: {
    color: '#F7F1E3',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filtersButtons: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#5758BB',
  },
  filterButtonActive: {
    backgroundColor: '#3B3B98',
  },
  filterButtonText: {
    color: '#F7F1E3',
    fontSize: 12,
  },
  filterButtonTextActive: {
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  itemCard: {
    backgroundColor: '#5758BB',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  pinnedCard: {
    borderWidth: 2,
    borderColor: '#3B3B98',
    backgroundColor: '#474787',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconContainer: {
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  pinButton: {
    padding: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginTop: 16,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  detailModalContent: {
    backgroundColor: 'white',
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    maxHeight: '90%',
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
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  inputTitle: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

