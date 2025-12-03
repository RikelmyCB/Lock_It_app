// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
// import * as Keychain from 'react-native-keychain';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation, NavigationProp } from '@react-navigation/native';

// // Cores (mantendo a consistência visual)
// const primaryColor = '#5D40A8';
// const backgroundColor = '#F8F8F8';
// const cardBackgroundColor = '#FFFFFF';
// const borderColor = '#DCDCDC';
// const textColor = '#333333';
// const removeColor = 'red';

// const SelectUser = () => {
//     const navigation = useNavigation<NavigationProp<any>>();
//     const [savedUsers, setSavedUsers] = useState([]);

//     useEffect(() => {
//         const loadUsers = async () => {
//             const users = await getSavedUsers();
//             setSavedUsers(users || []);
//         };
//         loadUsers();
//     }, []);

//     const handleSelectUser = async (email) => {
//         const credentials = await getUserCredentials();
//         if (credentials && credentials.username === email) {
//             console.log("Fazendo login automático com:", email, credentials.password);
//             navigation.navigate('Home');
//         } else {
//             alert('Credenciais não encontradas para este usuário.');
//         }
//     };

//     const handleRemoveUser = async (user) => {
//         await removeUser(user);
//         setSavedUsers(prevUsers => prevUsers.filter(u => u !== user));
//         await Keychain.resetGenericPassword({ service: 'meuAppDeLogin' });
//     };

//     const handleAddUser = () => {
//         navigation.navigate('AddUser');
//     };

//     const renderUserItem = ({ item }) => (
//         <View style={styles.userItem}>
//             <Image
//                 source={require('../../../assets/Netflix-avatar.png')} // Caminho para sua imagem padrão
//                 style={styles.userImage}
//             />
//             <Text style={styles.userName}>{item}</Text>
//             <TouchableOpacity onPress={() => handleRemoveUser(item)} style={styles.removeButton}>
//                 <Text style={{color: removeColor}}>Remover</Text>
//             </TouchableOpacity>
//         </View>
//     );

//     return (
//         <View style={styles.container}>
//             <Text style={styles.title}>Selecione um usuário:</Text>
//             <FlatList
//                 data={savedUsers}
//                 renderItem={renderUserItem}
//                 keyExtractor={(item) => item}
//                 numColumns={2}
//                 contentContainerStyle={styles.gridContainer}
//             />
//             <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
//                 <Text style={styles.addButtonText}>Adicionar Usuário</Text>
//             </TouchableOpacity>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: backgroundColor,
//         padding: 20,
//     },
//     title: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: primaryColor,
//         marginBottom: 20,
//         textAlign: 'center'
//     },
//     gridContainer: {
//         alignItems: 'center',
//     },
//     userItem: {
//         backgroundColor: cardBackgroundColor,
//         borderRadius: 10,
//         padding: 15,
//         margin: 10,
//         alignItems: 'center',
//         width: '45%',
//         borderWidth: 1,
//         borderColor: borderColor,
//     },
//     userImage: {
//         width: 80,
//         height: 80,
//         borderRadius: 40,
//         marginBottom: 10,
//     },
//     userName: {
//         fontSize: 16,
//         color: textColor,
//         textAlign: 'center'
//     },
//     addButton: {
//         backgroundColor: primaryColor,
//         padding: 15,
//         borderRadius: 8,
//         alignItems: 'center',
//         marginTop: 20,
//     },
//     addButtonText: {
//         color: 'white',
//         fontWeight: 'bold',
//         fontSize: 16,
//     },
//     removeButton: {
//         marginTop: 5,
//     }
// });

// // Funções auxiliares (getUserCredentials, getSavedUsers, saveUser, removeUser)
// const getUserCredentials = async () => {
//     try {
//       const credentials = await Keychain.getGenericPassword({
//         service: 'meuAppDeLogin', // Use o mesmo nome de serviço!
//       });
//       if (credentials) {
//         console.log(
//           'Credenciais recuperadas:',
//           credentials.username, // Email
//           credentials.password // Senha
//         );
//         return credentials; // Retorna o objeto com username (email) e password
//       } else {
//         console.log('Nenhuma credencial encontrada.');
//         return null;
//       }
//     } catch (error) {
//       console.error('Erro ao recuperar credenciais:', error);
//       return null;
//     }
//   };

// const getSavedUsers = async () => {
//     try {
//       const jsonValue = await AsyncStorage.getItem('savedUsers');
//       return jsonValue != null ? JSON.parse(jsonValue) : null;
//     } catch(e) {
//       // error reading value
//     }
//   }

// const saveUser = async (user) =>{
//     try {
//         const existingUsers = await getSavedUsers() || []
//         const updatedUsers = [...existingUsers, user]
//         const jsonValue = JSON.stringify(updatedUsers)
//         await AsyncStorage.setItem('savedUsers', jsonValue)
//       } catch (e) {
//         // saving error
//       }
// }

// //Remover usuario salvo
// const removeUser = async (userToRemove) =>{
//     try {
//         const existingUsers = await getSavedUsers() || []
//         const filteredUsers = existingUsers.filter(user => user !== userToRemove)
//         const jsonValue = JSON.stringify(filteredUsers)
//         await AsyncStorage.setItem('savedUsers', jsonValue)
//       } catch (e) {
//         // saving error
//       }
// }

// export default SelectUser;