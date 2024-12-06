import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, Alert, TextInput, Pressable, Button } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importing FontAwesome icons

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [voiceNotes, setVoiceNotes] = useState([]);
  const [sound, setSound] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingURI, setRecordingURI] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'You need to grant permission to access the microphone');
      }
    };
    requestPermissions();
    loadVoiceNotes();
    loadUserSettings();
  }, []);

  const loadVoiceNotes = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'voice_notes');
      const notes = files.map(file => ({
        name: file,
        uri: FileSystem.documentDirectory + 'voice_notes/' + file,
        date: new Date(),
      }));
      setVoiceNotes(notes);
    } catch (e) {
      console.error('Error loading voice notes', e);
    }
  };

  const loadUserSettings = async () => {
    try {
      const savedTheme = await SecureStore.getItemAsync('theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const saveUserSettings = async (newTheme) => {
    try {
      await SecureStore.setItemAsync('theme', newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme setting:', error);
    }
  };

  const startRecording = async () => {
    try {
      if (hasPermission) {
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(recording);
        setIsRecording(true);
        setRecordingTime(0);
        await recording.startAsync();

        const interval = setInterval(() => {
          setRecordingTime(prevTime => prevTime + 1);
        }, 1000);
        setRecordingInterval(interval);
      } else {
        Alert.alert('Permission Required', 'You must grant permission to record audio.');
      }
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecordingURI(uri);
        setIsRecording(false);
        setRecording(null);
        clearInterval(recordingInterval);
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
    }
  };

  const playSound = async (uri) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
      await sound.playAsync();
    } catch (err) {
      console.error('Error playing sound:', err);
    }
  };

  const stopSound = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setSound(null);
      }
    } catch (err) {
      console.error('Error stopping playback:', err);
    }
  };

  const shareRecording = async () => {
    try {
      if (recordingURI && Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(recordingURI);
      } else {
        Alert.alert('Sharing Unavailable', 'Sharing is not available on this device.');
      }
    } catch (err) {
      console.error('Error sharing recording:', err);
    }
  };

  const saveRecording = async () => {
    try {
      const fileName = `VoiceNote_${new Date().toISOString()}.m4a`;
      const destUri = FileSystem.documentDirectory + 'voice_notes/' + fileName;
      await FileSystem.copyAsync({
        from: recordingURI,
        to: destUri,
      });
      setVoiceNotes(prevNotes => [...prevNotes, { name: fileName, uri: destUri, date: new Date() }]);
      Alert.alert('Saved', 'Your recording has been saved.');
    } catch (err) {
      console.error('Error saving recording:', err);
    }
  };

  const deleteRecording = async () => {
    try {
      if (recordingURI) {
        await FileSystem.deleteAsync(recordingURI);
        Alert.alert('Deleted', 'Your recording has been deleted.');
        setRecordingURI(null);
      }
    } catch (err) {
      console.error('Error deleting recording:', err);
    }
  };

  const filteredVoiceNotes = voiceNotes.filter(note => note.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const latestVoiceNote = voiceNotes.length > 0 ? voiceNotes[0] : null;

  return (
    <View style={[styles.container, theme === 'dark' ? styles.darkTheme : styles.lightTheme]}>
      {/* Display the name of the most recent recording */}
      {latestVoiceNote ? (
        <Text style={styles.noteName}>{latestVoiceNote.name}</Text>
      ) : (
        <Text>No recordings available</Text>
      )}

      {/* Recording controls */}
      <Pressable
        style={styles.playButton}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={!hasPermission}
      >
        <Icon name="microphone" size={20} color="white" />
        <Text style={styles.buttonText}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
      </Pressable>

      {/* After recording, show options to play, save, delete, and share */}
      {recordingURI && !isRecording && (
        <View style={styles.actionContainer}>
          <Pressable style={styles.playButton} onPress={() => playSound(recordingURI)}>
            <Text style={styles.buttonText}>Play</Text>
          </Pressable>

          <Pressable style={styles.playButton} onPress={saveRecording}>
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>

          <Pressable style={styles.playButton} onPress={deleteRecording}>
            <Text style={styles.buttonText}>❌ Delete</Text>
          </Pressable>

          <Pressable style={styles.playButton} onPress={shareRecording}>
            <Text style={styles.buttonText}>Share</Text>
          </Pressable>
        </View>
      )}

      {/* Search input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search Voice Notes"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* List of voice notes */}
      <FlatList
        data={filteredVoiceNotes}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <Text style={styles.noteName}>{item.name}</Text>
            <Text style={styles.noteDate}>{item.date.toString()}</Text>
            <Pressable style={styles.playButton} onPress={() => playSound(item.uri)}>
              <Text style={styles.buttonText}>Play</Text>
            </Pressable>
          </View>
        )}
      />

      {/* Theme toggle */}
      <View style={styles.footer}>
        <Button title="Toggle Theme" onPress={() => saveUserSettings(theme === 'dark' ? 'light' : 'dark')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 10,
  },
  darkTheme: {
    backgroundColor: '#222',
    color: '#fff',
  },
  lightTheme: {
    backgroundColor: '#fff',
    color: '#000',
  },
  timer: {
    fontSize: 24,
    marginBottom: 10,
    color: 'white',
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    fontSize: 16,
    borderRadius: 10,
    backgroundColor: '#B7B7B7',
  },
  playButton: {
    width: 120,
    height: 40,
    borderRadius: 5,
    backgroundColor: '#B7B7B7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noteName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A5EB0',
    marginBottom: 5,
  },
  noteDate: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  footer: {
    marginTop: 20,
  },
});

