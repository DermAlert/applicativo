import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Switch
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../../store/userSlice';
import {API_URL} from '@env';
import { useFocusEffect , useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const RegisterHealthUnitScreen = ({  route }) => {
  const [unitName, setUnitName] = useState('');
  const [location, setLocation] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [city, setCity] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState('2025-03-02 23:15:32');
  const [currentUser, setCurrentUser] = useState('hannanhunny01');

    const navigation = useNavigation();
  
  
  // Get user role from Redux
  const isAdmin = useSelector(selectIsAdmin);
  const token = useSelector(state => state.auth.accessToken);

            useFocusEffect(
              React.useCallback(() => {
                const onBackPress = () => {
                  navigation.navigate('HealthUnitList');
                  return true; // Prevent default behavior
                };
            
                BackHandler.addEventListener('hardwareBackPress', onBackPress);
            
                return () => 
                  BackHandler.removeEventListener('hardwareBackPress', onBackPress);
              }, [navigation])
            );
    

  useEffect(() => {
    // Check if user is admin, if not, redirect back
    if (!isAdmin) {
      Alert.alert(
        'Acesso Negado',
        'Você não tem permissão para acessar esta página.',
        [{ text: 'OK', onPress: () =>       navigation.navigate('HealthUnitList')        }]
      );
    }
  }, [isAdmin, navigation]);

  const validateForm = () => {
    if (!unitName.trim()) {
      setError('Nome da unidade é obrigatório.');
      return false;
    }
    if (!location.trim()) {
      setError('Endereço é obrigatório.');
      return false;
    }
    if (!unitCode.trim()) {
      setError('Código da unidade é obrigatório.');
      return false;
    }
    if (!city.trim()) {
      setError('Cidade é obrigatória.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/cadastrar-unidade-saude`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome_unidade_saude: unitName,
          nome_localizacao: location,
          codigo_unidade_saude: unitCode,
          cidade_unidade_saude: city,
          fl_ativo: isActive
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao cadastrar unidade de saúde');
      }

      // Show success modal
      setSuccessModalVisible(true);
      resetForm();
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao tentar cadastrar a unidade de saúde');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUnitName('');
    setLocation('');
    setUnitCode('');
    setCity('');
    setIsActive(true);
    setError(null);
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalVisible(false);
    navigation.navigate('HealthUnitList');
  };

  // Header with date and user info
  const renderHeaderInfo = () => (
    <View style={styles.headerInfo}>
      <Text style={styles.dateText}>Data: {currentDate} (UTC)</Text>
      <Text style={styles.userText}>Usuário: {currentUser}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() =>       navigation.navigate('HealthUnitList')}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastrar Unidade de Saúde</Text>
      </View>

      <ScrollView style={styles.content}>
        {renderHeaderInfo()}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome da Unidade</Text>
          <TextInput
            style={styles.input}
            value={unitName}
            onChangeText={setUnitName}
            placeholder="Ex: Unidade de Saúde Central"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Código</Text>
          <TextInput
            style={styles.input}
            value={unitCode}
            onChangeText={setUnitCode}
            placeholder="Ex: USC001"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Ex: São Paulo"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Endereço Completo</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={location}
            onChangeText={setLocation}
            placeholder="Ex: Rua das Flores, 123 - Centro"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Status da Unidade</Text>
          <View style={styles.switchWrapper}>
            <Text style={isActive ? styles.inactiveText : styles.activeTextBold}>
              Inativo
            </Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#f5f5f5', true: '#a5d6a7' }}
              thumbColor={isActive ? '#4CAF50' : '#F44336'}
              style={styles.switch}
            />
            <Text style={isActive ? styles.activeTextBold : styles.inactiveText}>
              Ativo
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Cadastrar Unidade</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() =>       navigation.navigate('HealthUnitList')            }
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <Icon name="check-circle" size={72} color="#4CAF50" />
            </View>
            
            <Text style={styles.successModalTitle}>Unidade Cadastrada!</Text>
            <Text style={styles.successModalText}>
              A unidade foi cadastrada com sucesso no sistema.
            </Text>
            
            <TouchableOpacity 
              style={styles.successModalButton}
              onPress={handleCloseSuccessModal}
            >
              <Text style={styles.successModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    marginLeft: 16,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerInfo: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  userText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: '#B71C1C',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  switch: {
    marginHorizontal: 12,
  },
  activeTextBold: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  inactiveText: {
    color: '#757575',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#1e3d59',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successModalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1e3d59',
    marginBottom: 12,
    textAlign: 'center',
  },
  successModalText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  successModalButton: {
    backgroundColor: '#1e3d59',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 36,
    alignItems: 'center',
    width: '100%',
  },
  successModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default RegisterHealthUnitScreen;