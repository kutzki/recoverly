import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

// ─── Affirmations ─────────────────────────────────────────────────────────────

const AFFIRMATIONS = [
  "I am stronger than my cravings.",
  "Every sober day is a victory worth celebrating.",
  "I choose healing. I choose me.",
  "My past does not define my future.",
  "I am worthy of love and belonging.",
  "Recovery is possible — I am proof.",
  "I have survived 100% of my hardest days.",
  "Progress, not perfection.",
  "I am building a life I am proud of.",
  "One day at a time is all I need.",
  "My story is not over yet.",
  "I deserve peace, health, and happiness.",
  "I am not alone on this journey.",
  "Small steps lead to big changes.",
  "Today I choose to move forward.",
  "I am more than my struggles.",
  "Asking for help is a sign of strength.",
  "I release the shame and embrace growth.",
  "I am becoming the person I want to be.",
  "Sobriety is the greatest gift I can give myself.",
];

function AffirmationsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * AFFIRMATIONS.length));
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const shuffle = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    setIndex(prev => {
      let next = prev;
      while (next === prev) next = Math.floor(Math.random() * AFFIRMATIONS.length);
      return next;
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={modal.safe}>
        <View style={modal.header}>
          <Text style={modal.headerTitle}>Daily Affirmation</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <View style={modal.body}>
          <View style={modal.affirmIcon}>
            <Ionicons name="sunny" size={40} color={Colors.warning} />
          </View>
          <Animated.Text style={[modal.affirmText, { opacity: fadeAnim }]}>
            "{AFFIRMATIONS[index]}"
          </Animated.Text>
          <Text style={modal.affirmSub}>
            Read this. Breathe it in. Believe it.
          </Text>
        </View>
        <View style={modal.footer}>
          <TouchableOpacity style={modal.shuffleBtn} onPress={shuffle} activeOpacity={0.8}>
            <Ionicons name="shuffle-outline" size={18} color={Colors.primary} />
            <Text style={modal.shuffleBtnText}>New Affirmation</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={modal.doneBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={modal.doneBtnText}>I believe this 💜</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Box Breathing ────────────────────────────────────────────────────────────

type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'idle';

const PHASE_LABELS: Record<BreathPhase, string> = {
  inhale: 'Breathe In',
  hold1: 'Hold',
  exhale: 'Breathe Out',
  hold2: 'Hold',
  idle: 'Ready',
};

const PHASE_COLORS: Record<BreathPhase, string> = {
  inhale: Colors.primary,
  hold1: Colors.warning,
  exhale: Colors.success,
  hold2: Colors.warning,
  idle: Colors.primaryLight,
};

const PHASE_ORDER: BreathPhase[] = ['inhale', 'hold1', 'exhale', 'hold2'];
const PHASE_DURATION = 4; // seconds per phase (4-4-4-4 box breathing)
const TOTAL_CYCLES = 4;

function BreathingModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [countdown, setCountdown] = useState(PHASE_DURATION);
  const [cycle, setCycle] = useState(0);
  const [running, setRunning] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseIndexRef = useRef(0);
  const countRef = useRef(PHASE_DURATION);
  const cycleRef = useRef(0);

  const stopSession = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setPhase('idle');
    setCountdown(PHASE_DURATION);
    setCycle(0);
    phaseIndexRef.current = 0;
    countRef.current = PHASE_DURATION;
    cycleRef.current = 0;
    Animated.timing(scaleAnim, {
      toValue: 0.7,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const startSession = useCallback(() => {
    phaseIndexRef.current = 0;
    countRef.current = PHASE_DURATION;
    cycleRef.current = 0;
    const firstPhase = PHASE_ORDER[0];
    setPhase(firstPhase);
    setCountdown(PHASE_DURATION);
    setCycle(1);
    setRunning(true);

    Animated.timing(scaleAnim, {
      toValue: 1.0,
      duration: PHASE_DURATION * 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    intervalRef.current = setInterval(() => {
      countRef.current -= 1;

      if (countRef.current <= 0) {
        // Advance phase
        phaseIndexRef.current = (phaseIndexRef.current + 1) % PHASE_ORDER.length;
        const nextPhase = PHASE_ORDER[phaseIndexRef.current];

        // If we wrapped around, increment cycle
        if (phaseIndexRef.current === 0) {
          cycleRef.current += 1;
          if (cycleRef.current >= TOTAL_CYCLES) {
            clearInterval(intervalRef.current!);
            setPhase('idle');
            setCountdown(PHASE_DURATION);
            setCycle(0);
            setRunning(false);
            Animated.timing(scaleAnim, {
              toValue: 0.7, duration: 400, useNativeDriver: true,
            }).start();
            Alert.alert('Session Complete 🌿', "Great work! You completed 4 cycles of box breathing. Take a moment to notice how you feel.");
            return;
          }
          setCycle(cycleRef.current + 1);
        }

        countRef.current = PHASE_DURATION;
        setPhase(nextPhase);
        setCountdown(PHASE_DURATION);

        // Animate circle for inhale/exhale
        if (nextPhase === 'inhale') {
          Animated.timing(scaleAnim, {
            toValue: 1.0, duration: PHASE_DURATION * 1000,
            easing: Easing.inOut(Easing.ease), useNativeDriver: true,
          }).start();
        } else if (nextPhase === 'exhale') {
          Animated.timing(scaleAnim, {
            toValue: 0.7, duration: PHASE_DURATION * 1000,
            easing: Easing.inOut(Easing.ease), useNativeDriver: true,
          }).start();
        }
      } else {
        setCountdown(countRef.current);
      }
    }, 1000);
  }, [scaleAnim]);

  // Cleanup on unmount / close
  useEffect(() => {
    if (!visible) stopSession();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [visible, stopSession]);

  const circleColor = PHASE_COLORS[phase];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={modal.safe}>
        <View style={modal.header}>
          <Text style={modal.headerTitle}>Box Breathing</Text>
          <TouchableOpacity onPress={() => { stopSession(); onClose(); }}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={modal.breathBody} showsVerticalScrollIndicator={false}>
          <Text style={modal.breathSubtitle}>
            4 counts in · 4 hold · 4 out · 4 hold{'\n'}Repeat {TOTAL_CYCLES} cycles
          </Text>

          {/* Animated circle */}
          <View style={modal.circleWrap}>
            <Animated.View
              style={[
                modal.breathCircleOuter,
                { borderColor: circleColor, transform: [{ scale: scaleAnim }] },
              ]}
            >
              <View style={[modal.breathCircleInner, { backgroundColor: circleColor + '22' }]}>
                <Text style={[modal.phaseLabel, { color: circleColor }]}>
                  {PHASE_LABELS[phase]}
                </Text>
                {running && (
                  <Text style={[modal.countdown, { color: circleColor }]}>{countdown}</Text>
                )}
              </View>
            </Animated.View>
          </View>

          {running && (
            <View style={modal.cycleRow}>
              {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
                <View
                  key={i}
                  style={[modal.cycleDot, i < cycle && { backgroundColor: Colors.primary }]}
                />
              ))}
            </View>
          )}

          <View style={modal.breathBtns}>
            {!running ? (
              <TouchableOpacity style={modal.startBtn} onPress={startSession} activeOpacity={0.85}>
                <Ionicons name="play" size={18} color={Colors.white} />
                <Text style={modal.startBtnText}>Start Session</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={modal.stopBtn} onPress={stopSession} activeOpacity={0.85}>
                <Ionicons name="stop" size={18} color={Colors.error} />
                <Text style={modal.stopBtnText}>Stop</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={modal.tipBox}>
            <Ionicons name="bulb-outline" size={16} color={Colors.primary} />
            <Text style={modal.tipText}>
              Box breathing activates the parasympathetic nervous system, reducing anxiety and cravings within minutes.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── CBT Thought Record ───────────────────────────────────────────────────────

const CBT_PROMPTS = [
  { key: 'situation', label: 'Situation', placeholder: 'What triggered this feeling? Where were you, who was there?', icon: 'location-outline' as const },
  { key: 'thoughts', label: 'Automatic Thought', placeholder: 'What went through your mind? What did you tell yourself?', icon: 'chatbubble-outline' as const },
  { key: 'feeling', label: 'Feeling & Intensity', placeholder: 'What emotion did you feel? Rate intensity 0-100.', icon: 'heart-outline' as const },
  { key: 'evidence_for', label: 'Evidence FOR the thought', placeholder: 'What facts support this thought?', icon: 'checkmark-circle-outline' as const },
  { key: 'evidence_against', label: 'Evidence AGAINST the thought', placeholder: 'What facts contradict this thought?', icon: 'close-circle-outline' as const },
  { key: 'balanced', label: 'Balanced Thought', placeholder: 'Write a more balanced, realistic thought based on the evidence.', icon: 'bulb-outline' as const },
];

function CBTModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const reset = () => { setStep(0); setValues({}); setDone(false); };
  const handleClose = () => { reset(); onClose(); };

  const current = CBT_PROMPTS[step];
  const isLast = step === CBT_PROMPTS.length - 1;

  const goNext = () => {
    if (!values[current.key]?.trim()) {
      Alert.alert('Please fill this in', 'Take a moment to reflect and write something — even a few words.');
      return;
    }
    if (isLast) { setDone(true); }
    else { setStep(s => s + 1); }
  };

  if (done) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={modal.safe}>
          <View style={modal.header}>
            <Text style={modal.headerTitle}>Thought Record</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={modal.cbtDoneBody}>
            <View style={modal.cbtDoneIcon}>
              <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
            </View>
            <Text style={modal.cbtDoneTitle}>Great reflection work! 💜</Text>
            <Text style={modal.cbtDoneSub}>
              Challenging automatic thoughts takes practice. Each time you do this, you build new mental habits.
            </Text>
            {CBT_PROMPTS.map(p => (
              <View key={p.key} style={modal.cbtSummaryRow}>
                <Text style={modal.cbtSummaryLabel}>{p.label}</Text>
                <Text style={modal.cbtSummaryValue}>{values[p.key] || '—'}</Text>
              </View>
            ))}
            <TouchableOpacity style={modal.startBtn} onPress={reset}>
              <Text style={modal.startBtnText}>Start a New Record</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={modal.safe}>
        <View style={modal.header}>
          <Text style={modal.headerTitle}>Thought Record</Text>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={modal.cbtBody} keyboardShouldPersistTaps="handled">
          {/* Progress */}
          <View style={modal.cbtProgress}>
            {CBT_PROMPTS.map((_, i) => (
              <View
                key={i}
                style={[modal.cbtDot, i <= step && { backgroundColor: Colors.primary }]}
              />
            ))}
          </View>
          <Text style={modal.cbtStep}>Step {step + 1} of {CBT_PROMPTS.length}</Text>

          <View style={modal.cbtPromptIcon}>
            <Ionicons name={current.icon} size={26} color={Colors.primary} />
          </View>
          <Text style={modal.cbtLabel}>{current.label}</Text>

          <TextInput
            style={modal.cbtInput}
            placeholder={current.placeholder}
            placeholderTextColor={Colors.textMuted}
            value={values[current.key] || ''}
            onChangeText={v => setValues(prev => ({ ...prev, [current.key]: v }))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            autoFocus
          />

          <View style={modal.cbtBtnRow}>
            {step > 0 && (
              <TouchableOpacity
                style={modal.backBtn}
                onPress={() => setStep(s => s - 1)}
              >
                <Ionicons name="chevron-back" size={18} color={Colors.primary} />
                <Text style={modal.backBtnText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[modal.startBtn, { flex: 1 }]}
              onPress={goNext}
              activeOpacity={0.85}
            >
              <Text style={modal.startBtnText}>
                {isLast ? 'Complete ✓' : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Tool categories ──────────────────────────────────────────────────────────

type ToolId = 'meditation' | 'exercises' | 'affirmations' | 'goals' | 'videos' | 'podcasts';

const TOOL_CATEGORIES: {
  id: ToolId;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  comingSoon: boolean;
}[] = [
  {
    id: 'meditation',
    title: 'Box Breathing',
    description: '4-4-4-4 breathing to calm cravings fast',
    icon: 'leaf-outline',
    color: Colors.success,
    comingSoon: false,
  },
  {
    id: 'exercises',
    title: 'Thought Record',
    description: 'CBT worksheet to challenge negative thoughts',
    icon: 'clipboard-outline',
    color: Colors.primary,
    comingSoon: false,
  },
  {
    id: 'affirmations',
    title: 'Affirmations',
    description: 'Daily positive reminders for your recovery',
    icon: 'sunny-outline',
    color: Colors.warning,
    comingSoon: false,
  },
  {
    id: 'goals',
    title: 'Goal Tracker',
    description: 'Set and track recovery milestones',
    icon: 'flag-outline',
    color: Colors.accent,
    comingSoon: true,
  },
  {
    id: 'videos',
    title: 'Recovery Videos',
    description: 'Educational content & stories',
    icon: 'play-circle-outline',
    color: Colors.primaryDark,
    comingSoon: true,
  },
  {
    id: 'podcasts',
    title: 'Podcasts',
    description: 'Recovery stories & expert talks',
    icon: 'mic-outline',
    color: Colors.successDark,
    comingSoon: true,
  },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function Apps() {
  const [breathingVisible, setBreathingVisible] = useState(false);
  const [affirmVisible, setAffirmVisible] = useState(false);
  const [cbtVisible, setCbtVisible] = useState(false);

  const handleToolPress = (id: ToolId) => {
    if (id === 'meditation') { setBreathingVisible(true); return; }
    if (id === 'affirmations') { setAffirmVisible(true); return; }
    if (id === 'exercises') { setCbtVisible(true); return; }
    Alert.alert('Coming Soon', `${TOOL_CATEGORIES.find(t => t.id === id)?.title} is coming soon! Check back for updates.`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Recovery Tools</Text>
          <Text style={styles.subtitle}>Everything you need on your journey</Text>
        </View>

        {/* Tool grid */}
        <View style={styles.grid}>
          {TOOL_CATEGORIES.map(tool => (
            <TouchableOpacity
              key={tool.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => handleToolPress(tool.id)}
            >
              <View style={[styles.iconCircle, { backgroundColor: tool.color + '20' }]}>
                <Ionicons name={tool.icon} size={26} color={tool.color} />
              </View>
              <Text style={styles.cardTitle}>{tool.title}</Text>
              <Text style={styles.cardDesc}>{tool.description}</Text>
              {tool.comingSoon ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Coming Soon</Text>
                </View>
              ) : (
                <View style={[styles.badge, styles.badgeActive]}>
                  <Text style={[styles.badgeText, styles.badgeActiveText]}>Available</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BreathingModal visible={breathingVisible} onClose={() => setBreathingVisible(false)} />
      <AffirmationsModal visible={affirmVisible} onClose={() => setAffirmVisible(false)} />
      <CBTModal visible={cbtVisible} onClose={() => setCbtVisible(false)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontFamily: Fonts.poppinsBold, color: Colors.text },
  subtitle: { fontSize: 14, fontFamily: Fonts.jost, color: Colors.textMuted, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 14, fontFamily: Fonts.poppinsBold, color: Colors.text, marginBottom: 4 },
  cardDesc: { fontSize: 12, fontFamily: Fonts.jost, color: Colors.textMuted, lineHeight: 17, marginBottom: 10 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 10, color: Colors.primary, fontFamily: Fonts.poppinsSemiBold },
  badgeActive: { backgroundColor: Colors.success + '22' },
  badgeActiveText: { color: Colors.success },
});

const modal = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 18, fontFamily: Fonts.poppinsBold, color: Colors.text },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  footer: { padding: 24, gap: 12 },

  // Affirmations
  affirmIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.warning + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  affirmText: {
    fontSize: 22,
    fontFamily: Fonts.poppinsBold,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 32,
    fontStyle: 'italic',
  },
  affirmSub: { fontSize: 13, fontFamily: Fonts.jost, color: Colors.textMuted, textAlign: 'center' },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    height: 48,
  },
  shuffleBtnText: { color: Colors.primary, fontFamily: Fonts.poppinsSemiBold, fontSize: 15 },
  doneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: { color: Colors.white, fontFamily: Fonts.poppinsBold, fontSize: 16 },

  // Breathing
  breathBody: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 24,
  },
  breathSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.jost,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  circleWrap: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathCircleOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathCircleInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  phaseLabel: { fontSize: 16, fontFamily: Fonts.poppinsBold, textAlign: 'center' },
  countdown: { fontSize: 36, fontFamily: Fonts.poppinsBold, textAlign: 'center' },
  cycleRow: { flexDirection: 'row', gap: 8 },
  cycleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
  },
  breathBtns: { width: '100%', gap: 10 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 52,
  },
  startBtnText: { color: Colors.white, fontFamily: Fonts.poppinsBold, fontSize: 15 },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.error,
    borderRadius: 12,
    height: 52,
  },
  stopBtnText: { color: Colors.error, fontFamily: Fonts.poppinsSemiBold, fontSize: 15 },
  tipBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    width: '100%',
  },
  tipText: { flex: 1, fontSize: 13, fontFamily: Fonts.jost, color: Colors.primaryDark, lineHeight: 20 },

  // CBT
  cbtBody: {
    padding: 24,
    gap: 16,
  },
  cbtProgress: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  cbtDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  cbtStep: { fontSize: 12, fontFamily: Fonts.jost, color: Colors.textMuted, textAlign: 'center' },
  cbtPromptIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  cbtLabel: { fontSize: 18, fontFamily: Fonts.poppinsBold, color: Colors.text, textAlign: 'center' },
  cbtInput: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 15,
    fontFamily: Fonts.jost,
    color: Colors.text,
    minHeight: 120,
    lineHeight: 22,
  },
  cbtBtnRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
  },
  backBtnText: { color: Colors.primary, fontFamily: Fonts.poppinsSemiBold, fontSize: 15 },

  // CBT done
  cbtDoneBody: { padding: 24, gap: 16, alignItems: 'center' },
  cbtDoneIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cbtDoneTitle: { fontSize: 22, fontFamily: Fonts.poppinsBold, color: Colors.text, textAlign: 'center' },
  cbtDoneSub: { fontSize: 14, fontFamily: Fonts.jost, color: Colors.textMuted, textAlign: 'center', lineHeight: 21 },
  cbtSummaryRow: {
    alignSelf: 'stretch',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  cbtSummaryLabel: { fontSize: 11, fontFamily: Fonts.poppinsBold, color: Colors.primary, textTransform: 'uppercase' },
  cbtSummaryValue: { fontSize: 14, fontFamily: Fonts.jost, color: Colors.text, lineHeight: 20 },
});
