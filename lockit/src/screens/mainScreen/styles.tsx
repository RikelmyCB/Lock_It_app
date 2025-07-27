import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flexGrow: 1,
    },
  
    WelcomeBox: {
      width: '100%',
      height: '15%',
      top: 40,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#3B3B98',
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
    },
    logoutButton: {
      position: 'absolute',
      top: 20,
      right: 20,
    },
    welcomeText: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#F7F1E3',
    },
    usernameText: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#F7F1E3',
    },
    sectionsContainer: {
      top: 60,
      alignItems: 'center',
    },
    categoriesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 10,
    },
    categoryButton: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#5758BB',
      padding: 20,
      borderRadius: 12,
      width: '22%',
      height: 100,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    categoryText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 8,
      textAlign: 'center',
    },
    recentTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#F7F1E3',
      marginTop: 50,
      paddingBottom: 15,
    },
    recentContainer: {
      backgroundColor: '#23235B',
      padding: 15,
      borderRadius: 10,
      width: '95%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
  
    recentItemsList: {
      flexWrap: 'wrap',
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      gap: 20
    },
  
    recentItem: {
      backgroundColor: '#5758BB',
      padding: 10,
      borderRadius: 10,
      width: '45%',
      height: 90,
      marginVertical: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    recentItemTitle: {
      textAlign: 'center',
      color: 'white',
      fontWeight: 'bold',
      bottom: 12,
    },
  
    recentItemDescription: {
      color: 'white',
      fontWeight: '400',
      textAlign: 'center'
    },
  
    floatingButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: '#8778DB',
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
  
    ModalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
  
    modalContent: {
      backgroundColor: 'white',
      top: 200,
      flex: 1,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
    },
  
    formContainer: {
      padding: 20,
    },
    
    title: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
  
    input: {
      height: 40,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 10,
    },
  
    label: {
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 5,
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
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 5,
      marginBottom: 10,
      backgroundColor: "white",
    },
  });