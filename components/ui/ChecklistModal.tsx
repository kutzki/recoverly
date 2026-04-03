import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '../../store/ui';
import { useChecklistStore } from '../../store/checklist';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const CHECKLIST_ITEMS = [
  { id: '1', title: 'Fellowship', current: 2, target: 5 },
  { id: '2', title: 'Contact Sponsor', current: 0, target: 1 },
  { id: '3', title: 'Pray or Meditate', current: 0, target: 1 },
  { id: '4', title: 'Daily Journal', current: 0, target: 1 },
  { id: '5', title: 'Attended Meeting', current: 1, target: 1 },
];

export function ChecklistModal() {
  const isOpen     = useUIStore((s) => s.isChecklistOpen);
  const close      = useUIStore((s) => s.closeChecklist);
  const items      = useChecklistStore((s) => s.items);
  const toggleItem = useChecklistStore((s) => s.toggleItem);
  const insets     = useSafeAreaInsets();

  const completedCount = items.filter((i) => i.completed).length;

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.handleBar} />

          <Text style={styles.headerTitle}>Daily Checklist</Text>
          <Text style={styles.headerSubtitle}>Remember to always celebrate your small achievements.</Text>

          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.taskCard}
                activeOpacity={0.7}
                onPress={() => toggleItem(item.id)}
              >
                <View>
                  <Text style={styles.taskTitle}>{item.label}</Text>
                  <Text style={styles.taskSubtitle}>
                    {item.completed ? 'Completed ✓' : 'Tap to complete'}
                  </Text>
                </View>

                <View style={styles.checkboxContainer}>
                  <View style={[styles.checkbox, item.completed && styles.checkboxFilled]}>
                    {item.completed && (
                      <Ionicons name="checkmark" size={24} color={Colors.white} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Progress summary */}
          <Text style={styles.progressSummary}>
            {completedCount} of {items.length} completed today
          </Text>
        </View>
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
  headerTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 26,
    color: '#4D0076', // specific deep purple from Figma
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: Fonts.jost,
    fontSize: 16,
    color: '#999', // Colors.textLight approx
    marginBottom: 24,
  },
  listContainer: {
    marginBottom: 10,
  },
  taskCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  taskTitle: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 16,
    color: '#4D0076',
    marginBottom: 4,
  },
  taskSubtitle: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: '#A06BD7',
  },
  checkboxContainer: {
    width: 40,
    height: 40,
  },
  checkbox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    justifyContent: 'flex-end', // grow from bottom
  },
  checkboxFilled: {
    backgroundColor: '#4D0076',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxProgress: {
    width: '100%',
    backgroundColor: '#4D0076',
  },
  progressSummary: {
    fontFamily: Fonts.jost,
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
