import React, { forwardRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'angry', emoji: '😠', label: 'Angry' },
  { id: 'cool', emoji: '😎', label: 'Cool' },
  { id: 'confused', emoji: '😕', label: 'Confused' },
  { id: 'sad', emoji: '😢', label: 'Sad' },
  { id: 'blank', emoji: '😐', label: 'Blank' },
] as const;

const JournalSheet = forwardRef<BottomSheet>((_, ref) => {
  const snapPoints = useMemo(() => ['75%', '95%'], []);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [bold, setBold] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('left');

  const handleSubmit = () => {
    if (!body.trim()) {
      Alert.alert('Empty entry', 'Please write something before submitting.');
      return;
    }
    // TODO: call journal service
    Alert.alert('Entry saved', 'Your journal entry has been saved.', [
      { text: 'OK', onPress: () => {
        setTitle('');
        setBody('');
        setSelectedMood(null);
        (ref as any)?.current?.close();
      }},
    ]);
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.bg}
      handleIndicatorStyle={styles.handle}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={styles.container}>
        <Text style={styles.title}>Journal Entry</Text>

        {/* Mood picker */}
        <View style={styles.moodRow}>
          {MOODS.map(mood => (
            <TouchableOpacity
              key={mood.id}
              style={[styles.moodBtn, selectedMood === mood.id && styles.moodSelected]}
              onPress={() => setSelectedMood(mood.id === selectedMood ? null : mood.id)}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity
            style={[styles.toolBtn, align === 'left' && styles.toolActive]}
            onPress={() => setAlign('left')}
          >
            <Ionicons name="reorder-three-outline" size={18} color={align === 'left' ? Colors.primary : Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toolBtn, align === 'center' && styles.toolActive]}
            onPress={() => setAlign('center')}
          >
            <Ionicons name="menu-outline" size={18} color={align === 'center' ? Colors.primary : Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toolBtn, align === 'right' && styles.toolActive]}
            onPress={() => setAlign('right')}
          >
            <Ionicons name="reorder-two-outline" size={18} color={align === 'right' ? Colors.primary : Colors.textMuted} />
          </TouchableOpacity>
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
          {/* Title */}
          <TextInput
            style={styles.titleInput}
            placeholder="Write a title here"
            placeholderTextColor={Colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          {/* Body */}
          <TextInput
            style={[
              styles.bodyInput,
              bold && { fontWeight: '700' },
              underline && { textDecorationLine: 'underline' },
              { textAlign: align },
            ]}
            placeholder="Write how about how you're feeling today and what you did....."
            placeholderTextColor={Colors.textMuted}
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
        </ScrollView>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, !body.trim() && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={!body.trim()}
        >
          <Text style={styles.submitText}>Submit Entry</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
});

JournalSheet.displayName = 'JournalSheet';

export default JournalSheet;

const styles = StyleSheet.create({
  bg: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handle: { backgroundColor: Colors.border, width: 36, height: 4 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 16 },
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
  toolBold: { fontSize: 15, fontWeight: '900', color: Colors.textMuted },
  toolUnderline: { fontSize: 15, textDecorationLine: 'underline', fontWeight: '700', color: Colors.textMuted },
  toolDivider: { width: 1, height: 20, backgroundColor: Colors.border, marginHorizontal: 4 },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 10,
  },
  bodyInput: {
    fontSize: 15,
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
  submitText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
