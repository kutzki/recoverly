import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useChecklistStore } from '../../store/checklist';

const ChecklistSheet = forwardRef<BottomSheet>((_, ref) => {
  const { items, toggleItem } = useChecklistStore();
  const snapPoints = useMemo(() => ['60%', '85%'], []);

  const completed = items.filter(i => i.completed).length;

  const handleToggle = useCallback((id: string) => {
    toggleItem(id);
  }, [toggleItem]);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.bg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Daily Checklist</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{completed}/{items.length}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Remember to always celebrate your small achievements.</Text>

        {/* Progress */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${items.length > 0 ? (completed / items.length) * 100 : 0}%` },
            ]}
          />
        </View>

        {/* Items */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {items.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.item, item.completed && styles.itemDone]}
              onPress={() => handleToggle(item.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.check, item.completed && styles.checkDone]}>
                {item.completed && <Ionicons name="checkmark" size={14} color={Colors.white} />}
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemLabel, item.completed && styles.itemLabelDone]}>
                  {item.label}
                </Text>
                <Text style={styles.itemProgress}>
                  Today: {item.current}/{item.target}
                </Text>
              </View>
              <View style={[
                styles.toggle,
                item.completed && styles.toggleOn,
              ]}>
                <View style={[
                  styles.toggleThumb,
                  item.completed && styles.toggleThumbOn,
                ]} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
});

ChecklistSheet.displayName = 'ChecklistSheet';

export default ChecklistSheet;

const styles = StyleSheet.create({
  bg: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handle: { backgroundColor: Colors.border, width: 36, height: 4 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 4, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: { fontSize: 20, fontFamily: Fonts.poppinsBold, color: Colors.text },
  badge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: Colors.primary, fontFamily: Fonts.poppinsBold, fontSize: 13 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginBottom: 16, lineHeight: 20, fontFamily: Fonts.jost },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  itemDone: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  itemInfo: { flex: 1 },
  itemLabel: { fontSize: 14, fontFamily: Fonts.poppinsSemiBold, color: Colors.text },
  itemLabelDone: { color: Colors.primary },
  itemProgress: { fontSize: 12, color: Colors.textMuted, marginTop: 2, fontFamily: Fonts.jost },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: { backgroundColor: Colors.primary },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.white,
  },
  toggleThumbOn: { alignSelf: 'flex-end' },
});
