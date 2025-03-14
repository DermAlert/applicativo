import { API_URL } from '@env';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export const apiService = {
  // Register a new attendance for a patient
  registerAttendance: async (patientId, token) => {
    try {
      console.log(`Registering attendance for patientId: ${patientId}`);
      const response = await fetch(
        `${API_URL}/cadastrar-atendimento?paciente_id=${patientId}`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to register attendance');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in registerAttendance:', error);
      throw error;
    }
  },

  // Upload consent term with signature
  uploadConsentTerm: async (attendanceId, signaturePhoto, token) => {
    try {
      console.log(`Uploading consent term for attendanceId: ${attendanceId}`);
      
      // Check if signaturePhoto exists
      if (!signaturePhoto) {
        throw new Error('Signature photo is required');
      }
      
      // Create form data
      const formData = new FormData();
      
      // Handle different signature photo formats
      let fileUri;
      let fileType;
      let fileName = 'signature.png';
      
      if (typeof signaturePhoto === 'string') {
        // It's a string - could be a base64 or a file URI
        if (signaturePhoto.startsWith('data:image')) {
          // It's a base64 image
          fileUri = await createFileFromBase64(signaturePhoto, fileName);
          fileType = 'image/png';
        } else {
          // It's a file URI
          fileUri = signaturePhoto;
          fileType = 'image/png';
        }
      } else if (signaturePhoto.uri) {
        // It's an object with a URI
        fileUri = signaturePhoto.uri;
        fileType = signaturePhoto.type || 'image/png';
        fileName = signaturePhoto.name || fileName;
      } else {
        throw new Error('Invalid signature photo format');
      }
      
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: fileType
      });

      const response = await fetch(
        `${API_URL}/cadastrar-termo-consentimento?atendimento_id=${attendanceId}`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to upload consent term');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in uploadConsentTerm:', error);
      throw error;
    }
  },

  // Submit anamnesis data
  submitAnamnesisData: async (attendanceId, anamnesisData, token) => {
    try {
      console.log(`Submitting anamnesis data for attendanceId: ${attendanceId}`);
      const response = await fetch(
        `${API_URL}/cadastrar-informacoes-completas?atendimento_id=${attendanceId}`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(anamnesisData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to submit anamnesis data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in submitAnamnesisData:', error);
      throw error;
    }
  },

  // Register lesion with images
  registerLesion: async (attendanceId, lesionData, lesionImages, token) => {
    try {
      console.log(`Registering lesion for attendanceId: ${attendanceId}`);
      const formData = new FormData();
      formData.append('atendimento_id', attendanceId);
      formData.append('local_lesao_id', lesionData.location);
      formData.append('descricao_lesao', lesionData.description);
      
      // Append all images to form data
      if (lesionImages && lesionImages.length > 0) {
        for (let i = 0; i < lesionImages.length; i++) {
          const image = lesionImages[i];
          try {
            if (!image) continue; // Skip undefined images
            
            // Process image based on its format
            let fileUri;
            let fileType = 'image/jpeg';
            let fileName = `lesion_image_${i}.jpg`;
            
            if (typeof image === 'string') {
              // It's a string - could be a base64 or a file URI
              if (image.startsWith('data:image')) {
                // It's a base64 image
                fileUri = await createFileFromBase64(image, fileName);
              } else {
                // It's a file URI
                fileUri = image;
              }
            } else if (image.uri) {
              // It's an object with a URI
              fileUri = image.uri;
              fileType = image.type || fileType;
              fileName = image.name || fileName;
            } else {
              console.warn('Skipping invalid image format', image);
              continue;
            }
            
            formData.append('files', {
              uri: fileUri,
              name: fileName,
              type: fileType
            });
          } catch (error) {
            console.error('Error processing image:', error);
            // Continue with other images even if one fails
          }
        }
      }

      const response = await fetch(
        `${API_URL}/cadastrar-lesao`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to register lesion');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in registerLesion:', error);
      throw error;
    }
  }
};

// Helper function to create a file from base64 data
const createFileFromBase64 = async (base64Data, filename) => {
  // Check if base64Data is defined
  if (!base64Data) {
    throw new Error('base64Data is undefined');
  }
  
  if (Platform.OS === 'ios') {
    // For iOS, we can use the base64 data directly
    return base64Data;
  } else {
    // For Android, we need to create a file
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;
    
    // Make sure we're working with the correct format of base64 data
    let base64Content = base64Data;
    
    // Check if the data includes the data URL scheme
    if (base64Data.includes && base64Data.includes(',')) {
      base64Content = base64Data.split(',')[1];
    } else if (base64Data.indexOf && base64Data.indexOf(',') !== -1) {
      // Alternative check if includes is not available
      base64Content = base64Data.substring(base64Data.indexOf(',') + 1);
    }
    
    await FileSystem.writeAsStringAsync(fileUri, base64Content, {
      encoding: FileSystem.EncodingType.Base64
    });
    
    return fileUri;
  }
};