import { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, TextInput, StyleSheet,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const MOODS = [
  { value: 1, emoji: '😞', label: 'Rough' },
  { value: 2, emoji: '😕', label: 'Hard' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (mood: number, notes: string) => Promise<void>;
};

export function CheckInModal({ visible, onClose, onConfirm }: Props) {
  const [mood,    setMood]    = useState(3);
  const [notes,   setNotes]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(mood, notes.trim());
      setNotes('');
      setMood(3);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.overlay}
        >
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView behavior="padding" style={styles.kavWrapper}>
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              style={styles.sheet}
            >
              {/* Handle */}
              <View style={styles.handle} />

              <Text style={styles.title}>Daily Check-In</Text>
              <Text style={styles.subtitle}>How are you feeling today?</Text>

              {/* Mood row */}
              <View style={styles.moodRow}>
                {MOODS.map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    style={[styles.moodBtn, mood === m.value && styles.moodBtnActive]}
                    onPress={() => setMood(m.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    <Text style={[styles.moodLabel, mood === m.value && styles.moodLabelActive]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Notes */}
              <Text style={styles.notesLabel}>Anything on your mind? (optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Write a note about today…"
                placeholderTextColor={Colors.placeholderText}
                multiline
                numberOfLines={3}
                maxLength={300}
              />

              {/* Buttons */}
              <TouchableOpacity
                style={[styles.confirmBtn, loading && styles.btnDisabled]}
                activeOpacity={0.85}
                onPress={handleConfirm}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={Colors.white} />
                  : <Text style={styles.confirmBtnText}>Check In ✓</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  kavWrapper: { width: '100%' },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 22,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },

  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  moodBtn: {
    alignItems: 'center',
    width: 58,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: Colors.background,
  },
  moodBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  moodEmoji: { fontSize: 28, marginBottom: 4 },
  moodLabel: {
    fontFamily: Fonts.jost,
    fontSize: 11,
    color: Colors.textMuted,
  },
  moodLabelActive: {
    color: Colors.primary,
    fontFamily: Fonts.jostMedium,
  },

  notesLabel: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 13,
    color: Colors.text,
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: Colors.text,
    height: 90,
    textAlignVertical: 'top',
    marginBottom: 20,
  },

  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnDisabled: { opacity: 0.6 },
  confirmBtnText: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 16,
    color: Colors.white,
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: Fonts.jost,
    fontSize: 15,
    color: Colors.textMuted,
  },
});
