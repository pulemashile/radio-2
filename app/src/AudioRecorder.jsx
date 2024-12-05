import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text, FlatList, Alert, TextInput } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import {NavigationContainer} from '@react-navigation/native';


export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [voiceNotes, setVoiceNotes] = useState([]); // Store list of voice notes
  const [sound, setSound] = useState(null); // Audio playback object
  const [recordingTime, setRecordingTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Request microphone permission on app load (using Audio API)
    const requestPermissions = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "You need to grant permission to access the microphone");
      }
    };
    requestPermissions();
    loadVoiceNotes();
  }, []);

  // Load saved voice notes from local storage
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
      console.error("Error loading voice notes", e);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      if (hasPermission) {
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        setIsRecording(true);
        setRecordingTime(0);
        await recording.startAsync();

        // Update the recording time every second
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

  // Stop recording
  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setVoiceNotes(prevNotes => [...prevNotes, { name: `Note ${voiceNotes.length + 1}`, uri, date: new Date() }]);
        setIsRecording(false);
        setRecording(null);

        // Clear the recording interval
        clearInterval(recordingInterval);
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
    }
  };

  // Play the selected voice note
  const playSound = async (uri) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
      await sound.playAsync();
    } catch (err) {
      console.error('Error playing sound:', err);
    }
  };

  // Stop the playback
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

  // Delete a voice note
  
  

  // Search functionality
  const filteredVoiceNotes = voiceNotes.filter(note => note.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
   
    <View style={styles.container}>
      <Button styles={styles.button}
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={!hasPermission}
      />
      {isRecording && <Text style={styles.timer}>Recording Time: {recordingTime}s</Text>}
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search Voice Notes"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <FlatList
        data={filteredVoiceNotes}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <Text style={styles.noteName}>{item.name}</Text>
            <Text style={styles.noteDate}>{item.date.toString()}</Text>
            <Button title="Play" onPress={() => playSound(item.uri)} />
           
          </View>
        )}
      />
    </View>
   
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 10,
    backgroundColor: 'Black',
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
  button: {
    marginBottom: 10,
    backgroundColor: '#B7B7B7', 
    padding: 10,
    borderRadius: 10,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',   
    },
  noteName: {
    fontSize: 18,                // Set the font size for the note name
    fontWeight: 'bold',           // Make the name bold
    color: '#0A5EB0',               // White color for the name
    marginBottom: 5,             // Space below the name
    flex: 1
    ,                      // Ensures the name takes available space in the row
  },
  noteDate: {
    fontSize: 14,                // Sets the font size
    color: '#888',               // Light gray color for the text
    fontStyle: 'italic',         // Italicize the text
    marginTop: 5,                // Adds space above the date
    textAlign: 'right',          // Aligns the text to the right
  },
   
  });

  
