import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Modal,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { journalService } from '../../services/journal';
import type { SheetRef } from '../checklists/DailyChecklist';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const MOODS = [
  { id: 'happy',    emoji: '😊', label: 'Happy' },
  { id: 'angry',    emoji: '😠', label: 'Angry' },
  { id: 'cool',     emoji: '😎', label: 'Cool' },
  { id: 'confused', emoji: '😕', label: 'Confused' },
  { id: 'sad',      emoji: '😢', label: 'Sad' },
  { id: 'blank',    emoji: '😐', label: 'Blank' },
] as const;

const JournalSheet = forwardRef<SheetRef>((_, ref) => {
  const [visible, setVisible]           = useState(false);
  const [title, setTitle]               = useState('');
  const [body, setBody]                 = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [bold, setBold]                 = useState(false);
  const [underline, setUnderline]       = useState(false);
  const [align, setAlign]               = useState<'left' | 'center' | 'right'>('left');
  const [saving, setSaving]             = useState(false);

  const translateY      = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const openSheet = useCallback(() => {
    setVisible(true);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        mass: 0.9,
        stiffness: 180,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, backdropOpacity]);

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  }, [translateY, backdropOpacity]);

  useImperativeHandle(ref, () => ({ expand: openSheet, close: closeSheet }));

  const handleSubmit = async () => {
    if (!body.trim()) {
      Alert.alert('Empty entry', 'Please write something before submitting.');
      return;
    }
    setSaving(true);
    try {
      await journalService.createEntry({
        date: new Date().toISOString().split('T')[0],
        mood: selectedMood || 'blank',
        title: title.trim() || 'Journal Entry',
        body: body.trim(),
      });
      Alert.alert('Entry saved ✨', 'Your journal entry has been saved.', [
        {
          text: 'OK',
          onPress: () => {
            setTitle('');
            setBody('');
            setSelectedMood(null);
            closeSheet();
          },
        },
      ]);
    } catch {
      Alert.alert('Error', 'Could not save your entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={closeSheet}>
      <KeyboardAvoidingView
        style={styles.modalWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeSheet} activeOpacity={1} />
        </Animated.View>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          {/* Handle */}
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <Text style={styles.title}>Journal Entry</Text>

          {/* Mood picker */}
          <View style={styles.moodRow}>
            {MOODS.map(mood => (
              <TouchableOpacity
                key={mood.id}
                style={[styles.moodBtn, selectedMood === mood.id && styles.moodSelected]}
                onPress={() => setSelectedMood(mood.id === selectedMood ? null : mood.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Toolbar */}
          <View style={styles.toolbar}>
            {(['left', 'center', 'right'] as const).map(a => (
              <TouchableOpacity
                key={a}
                style={[styles.toolBtn, align === a && styles.toolActive]}
                onPress={() => setAlign(a)}
              >
                <Ionicons
                  name={
                    a === 'left'
                      ? 'reorder-three-outline'
                      : a === 'center'
                      ? 'menu-outline'
                      : 'reorder-two-outline'
                  }
                  size={18}
                  color={align === a ? Colors.primary : Colors.textMuted}
                />
              </TouchableOpacity>
            ))}
            <View style={styles.toolDivider} />
            <TouchableOpacity
              style={[styles.toolBtn, bold && styles.toolActive]}
              onPress={() => setBold(v => !v)}
            >
              <Text style={[styles.toolBold, bold && { color: Colors.primary }]}>B</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolBtn, underline && styles.toolActive]}
              onPress={() => setUnderline(v => !v)}
            >
              <Text style={[styles.toolUnderline, underline && { color: Colors.primary }]}>U</Text>
            </TouchableOpacity>
            <View style={styles.toolDivider} />
            <TouchableOpacity style={styles.toolBtn}>
              <Ionicons name="attach-outline" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <TextInput
              style={styles.titleInput}
              placeholder="Write a title here"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[
                styles.bodyInput,
                bold && { fontWeight: '700' },
                underline && { textDecorationLine: 'underline' },
                { textAlign: align },
              ]}
              placeholder="Write about how you're feeling today…"
              placeholderTextColor={Colors.textMuted}
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitBtn, (!body.trim() || saving) && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={!body.trim() || saving}
          >
            <Text style={styles.submitText}>{saving ? 'Saving…' : 'Submit Entry'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

JournalSheet.displayName = 'JournalSheet';
export default JournalSheet;

const styles = StyleSheet.create({
  modalWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SCREEN_HEIGHT * 0.9,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  title: { fontSize: 20, fontFamily: Fonts.poppinsBold, color: Colors.text, marginBottom: 16 },
  moodRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  moodBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  moodSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  moodEmoji: { fontSize: 22 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 6,
    marginBottom: 14,
    gap: 2,
  },
  toolBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolActive: { backgroundColor: Colors.primaryLight },
  toolBold: {
    fontSize: 15,
    fontFamily: Fonts.poppinsBold,
    color: Colors.textMuted,
  },
  toolUnderline: {
    fontSize: 15,
    fontFamily: Fonts.poppinsBold,
    textDecorationLine: 'underline',
    color: Colors.textMuted,
  },
  toolDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  titleInput: {
    fontSize: 18,
    fontFamily: Fonts.poppinsSemiBold,
    color: Colors.text,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 10,
  },
  bodyInput: {
    fontSize: 15,
    fontFamily: Fonts.jost,
    color: Colors.text,
    lineHeight: 24,
    minHeight: 160,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitDisabled: { opacity: 0.4 },
  submitText: { color: Colors.white, fontFamily: Fonts.poppinsBold, fontSize: 15 },
});
