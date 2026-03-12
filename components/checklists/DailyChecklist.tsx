import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useChecklistStore } from '../../store/checklist';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export interface SheetRef {
  expand: () => void;
  close: () => void;
}

const ChecklistSheet = forwardRef<SheetRef>((_, ref) => {
  const { items, toggleItem } = useChecklistStore();
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
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

  const completed = items.filter(i => i.completed).length;
  const progress = items.length > 0 ? (completed / items.length) * 100 : 0;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={closeSheet}>
      <View style={styles.modalWrap}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeSheet} activeOpacity={1} />
        </Animated.View>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          {/* Handle */}
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Daily Checklist</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{completed}/{items.length}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Celebrate every small achievement. 🎉</Text>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: `${progress}%` as any }]} />
          </View>

          {/* Items */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
            {items.map((item, idx) => (
              <ChecklistItem
                key={item.id}
                item={item}
                index={idx}
                onToggle={toggleItem}
              />
            ))}
            <View style={{ height: 32 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
});

function ChecklistItem({
  item,
  index,
  onToggle,
}: {
  item: { id: string; label: string; completed: boolean; current: number; target: number };
  index: number;
  onToggle: (id: string) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, speed: 40 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    onToggle(item.id);
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.item, item.completed && styles.itemDone]}
        onPress={handlePress}
        activeOpacity={0.9}
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
        <View style={[styles.toggle, item.completed && styles.toggleOn]}>
          <View style={[styles.toggleThumb, item.completed && styles.toggleThumbOn]} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

ChecklistSheet.displayName = 'ChecklistSheet';
export default ChecklistSheet;

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
    maxHeight: SCREEN_HEIGHT * 0.85,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 4,
  },
  title: { fontSize: 20, fontFamily: Fonts.poppinsBold, color: Colors.text },
  badge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: Colors.primary, fontFamily: Fonts.poppinsBold, fontSize: 13 },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 16,
    lineHeight: 20,
    fontFamily: Fonts.jost,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  list: { flex: 1 },
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
