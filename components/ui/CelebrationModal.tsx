import { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

type CelebrationModalProps = {
  daysSober: number;
  userId: string | null;
};

const MILESTONE_DATA: Record<number, { label: string; emoji: string; message: string }> = {
  7:   { label: '7 Days',   emoji: '⭐', message: 'One whole week sober. Every day you chose yourself.' },
  30:  { label: '30 Days',  emoji: '🔥', message: 'A full month! Your brain is healing. Keep going.' },
  60:  { label: '60 Days',  emoji: '💪', message: 'Two months strong. You are building a new life.' },
  90:  { label: '90 Days',  emoji: '🏅', message: '90 days. A quarter year of courage and commitment.' },
  180: { label: '6 Months', emoji: '🌟', message: 'Half a year. You have proven it is possible.' },
  365: { label: '1 Year',   emoji: '🏆', message: 'One full year. You did what many only dream of.' },
};
const MILESTONE_DAYS = [7, 30, 60, 90, 180, 365];

const STORE_KEY = 'recoverly_celebrated_milestones';

type CelebratedTuple = [string, number];

export function CelebrationModal({ daysSober, userId }: CelebrationModalProps) {
  const [visible, setVisible] = useState(false);
  const [pendingMilestone, setPendingMilestone] = useState<number | null>(null);

  useEffect(() => {
    if (userId === null) return;

    const checkMilestones = async () => {
      const raw = await SecureStore.getItemAsync(STORE_KEY);
      let celebrated: CelebratedTuple[] = [];
      try {
        celebrated = raw ? JSON.parse(raw) : [];
      } catch {
        celebrated = [];
      }

      // Find the highest milestone day <= daysSober not yet celebrated by this user
      const eligible = MILESTONE_DAYS.filter(
        (day) =>
          day <= daysSober &&
          !celebrated.some(([uid, d]) => uid === userId && d === day),
      );

      if (eligible.length === 0) return;

      const milestone = Math.max(...eligible);
      setPendingMilestone(milestone);
      setVisible(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    checkMilestones();
  }, [daysSober, userId]);

  const handleDismiss = async () => {
    if (userId === null || pendingMilestone === null) return;

    const raw = await SecureStore.getItemAsync(STORE_KEY);
    let celebrated: CelebratedTuple[] = [];
    try {
      celebrated = raw ? JSON.parse(raw) : [];
    } catch {
      celebrated = [];
    }

    celebrated.push([userId, pendingMilestone]);
    await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(celebrated));
    setVisible(false);
  };

  if (pendingMilestone === null || !visible) return null;

  const data = MILESTONE_DATA[pendingMilestone];
  if (!data) return null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={[Colors.primaryDark, Colors.primaryMid]}
            style={styles.gradientHeader}
          >
            <Text style={styles.emoji}>{data.emoji}</Text>
            <Text style={styles.milestoneLabel}>{data.label}</Text>
          </LinearGradient>

          <View style={styles.body}>
            <Text style={styles.message}>{data.message}</Text>
            <TouchableOpacity style={styles.button} onPress={handleDismiss} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Keep Going!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '85%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradientHeader: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 64,
  },
  milestoneLabel: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 22,
    color: Colors.white,
  },
  body: {
    backgroundColor: Colors.white,
    padding: 24,
    alignItems: 'center',
  },
  message: {
    fontFamily: Fonts.jost,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 26,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 20,
  },
  buttonText: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 16,
    color: Colors.white,
  },
});
