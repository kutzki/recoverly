import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '../../store/ui';
import { useAuthStore } from '../../store/auth';
import { journalService } from '../../services/journal';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const EMOJIS = [
  { id: 'happy',   emoji: '😄' },
  { id: 'neutral', emoji: '😐' },
  { id: 'cool',    emoji: '😎' },
  { id: 'calm',    emoji: '😌' },
  { id: 'sad',     emoji: '😢' },
  { id: 'anxious', emoji: '😰' }
];

export function JournalModal() {
  const isOpen = useUIStore((s) => s.isJournalOpen);
  const close  = useUIStore((s) => s.closeJournal);
  const user   = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();
  
  const [title, setTitle]               = useState('');
  const [body, setBody]                 = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(0);
  const [saving, setSaving]             = useState(false);

  const handleSubmit = async () => {
    if (!user?.id) return;
    if (!title.trim() && !body.trim()) { close(); return; }
    setSaving(true);
    try {
      await journalService.createEntry({
        user_id: user.id,
        date: new Date().toISOString().slice(0, 10),
        title: title.trim() || 'Untitled',
        body: body.trim() || '',
        mood: EMOJIS[selectedEmoji].id,
      });
      setTitle('');
      setBody('');
      setSelectedEmoji(0);
      close();
    } catch(e: any) {
      console.error(e);
      Alert.alert('Save Error', e.message || 'Could not save your journal entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}
        >
          <View style={styles.handleBar} />

          {/* Formatting Toolbar */}
          <View style={styles.toolbar}>
            <MaterialCommunityIcons name="format-align-left" size={28} color={Colors.text} style={styles.toolIcon} />
            <MaterialCommunityIcons name="format-align-center" size={28} color={Colors.textLight} style={styles.toolIcon} />
            <MaterialCommunityIcons name="format-align-right" size={28} color={Colors.textLight} style={styles.toolIcon} />
            <MaterialCommunityIcons name="format-bold" size={28} color={Colors.textLight} style={styles.toolIcon} />
            <MaterialCommunityIcons name="format-underline" size={28} color={Colors.textLight} style={styles.toolIcon} />
            <View style={styles.colorCircle} />
          </View>

          <View style={styles.inputContainer}>
            {/* Emoji Selector */}
            <View style={styles.emojiContainer}>
              {EMOJIS.map((item, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => setSelectedEmoji(idx)} 
                  style={[styles.emojiBtn, selectedEmoji === idx && styles.emojiBtnActive]}
                >
                  <Text style={styles.emojiText}>{item.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.titleInput}
              placeholder="Write a title here"
              placeholderTextColor={Colors.text}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={styles.bodyInput}
              placeholder="Write how about how you're feeling today and what you did...."
              placeholderTextColor={Colors.textLight}
              multiline
              textAlignVertical="top"
              value={body}
              onChangeText={setBody}
            />
          </View>

          <TouchableOpacity style={[styles.submitBtn, saving && { opacity: 0.7 }]} onPress={handleSubmit} disabled={saving}>
            {saving
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.submitBtnText}>Submit Entry</Text>
            }
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  handleBar: {
    width: 130,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryDark,
    alignSelf: 'center',
    marginBottom: 28,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  toolIcon: {
    padding: 0,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
  inputContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    height: 380,
  },
  emojiContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 30,
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emojiBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnActive: {
    backgroundColor: Colors.cardTintBlue,
  },
  emojiText: {
    fontSize: 26,
  },
  titleInput: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 22,
    color: Colors.text,
    marginBottom: 16,
    paddingVertical: 0,
  },
  bodyInput: {
    fontFamily: Fonts.jost,
    fontSize: 16,
    color: Colors.text,
    flex: 1,
    lineHeight: 24,
    paddingVertical: 0,
  },
  submitBtn: {
    backgroundColor: '#bd51ff',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 16,
    color: Colors.white,
  },
});
