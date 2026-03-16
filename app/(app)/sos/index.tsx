import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/auth';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';

const CRISIS_OPTIONS = [
  {
    id: 'bad_day',
    label: "I'm having a bad day",
    emoji: '😔',
    color: Colors.sosOrange,
    route: '/(app)/sos/bad-day',
  },
  {
    id: 'feel_like_using',
    label: "I feel like using",
    emoji: '🚨',
    color: Colors.sosRed,
    route: '/(app)/sos/feel-like-using',
  },
  {
    id: 'just_relapsed',
    label: "I just relapsed",
    emoji: '💔',
    color: Colors.sosDark,
    route: '/(app)/sos/just-relapsed',
  },
  {
    id: 'self_harm',
    label: "I'm thinking about self-harm",
    emoji: '🆘',
    color: Colors.sosRedBright,
    route: '/(app)/sos/self-harm',
  },
  {
    id: 'feeling_anxious',
    label: "I'm feeling anxious",
    emoji: '🌊',
    color: Colors.sosPurple,
    route: '/(app)/sos/feeling-anxious',
  },
] as const;

export default function SOSIndexScreen() {
  const insets = useSafeAreaInsets();
  const user   = useAuthStore((s) => s.user);
  const innerCircle: any[] = Array.isArray(user?.inner_circle) ? (user?.inner_circle as any[]) : [];

  return (
    <Animated.View entering={FadeIn.duration(220).delay(120)} style={styles.root}>
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primaryMid]}
        style={styles.headerGrad}
      >
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 24 }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>SOS — I Need Help</Text>
            <View style={{ width: 24 }} />
          </View>
          <Text style={styles.headerSub}>
            You're safe. Choose what you're going through and we'll guide you through it.
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Crisis options */}
        <Text style={styles.sectionLabel}>What's going on?</Text>
        <View style={styles.options}>
          {CRISIS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.optionCard, { borderLeftColor: opt.color }]}
              activeOpacity={0.85}
              onPress={() => router.push(opt.route as any)}
            >
              <Text style={styles.optionEmoji}>{opt.emoji}</Text>
              <Text style={styles.optionLabel}>{opt.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency contacts */}
        {innerCircle.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Call Your Support</Text>
            <View style={styles.contacts}>
              {innerCircle.slice(0, 3).map((c: any, i: number) => (
                <TouchableOpacity
                  key={i}
                  style={styles.contactCard}
                  activeOpacity={0.8}
                  onPress={() => Linking.openURL(`tel:${c.phone}`)}
                >
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactInitial}>{c.name[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{c.name}</Text>
                    <Text style={styles.contactRel}>{c.relationship || 'Support contact'}</Text>
                  </View>
                  <View style={styles.callBtn}>
                    <Ionicons name="call" size={18} color={Colors.white} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Crisis helplines */}
        <Text style={styles.sectionLabel}>Crisis Helplines</Text>
        <View style={styles.helplines}>
          {[
            { label: 'SAMHSA Helpline (24/7)',    phone: '18006624357' },
            { label: 'Crisis Text Line (24/7)',   phone: 'sms:741741'  },
            { label: 'National Suicide Hotline',  phone: '988'         },
          ].map((h) => (
            <TouchableOpacity
              key={h.phone}
              style={styles.helplineCard}
              activeOpacity={0.8}
              onPress={() => Linking.openURL(h.phone.startsWith('sms') ? h.phone : `tel:${h.phone}`)}
            >
              <Ionicons name="call-outline" size={20} color={Colors.sosRed} />
              <Text style={styles.helplineLabel}>{h.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },

  headerGrad:  { width: '100%' },
  headerRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerTitle: { fontFamily: Fonts.poppinsBold, fontSize: 18, color: Colors.white },
  headerSub:   { fontFamily: Fonts.jost, fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },

  scroll: { paddingHorizontal: 24, paddingTop: 24 },

  sectionLabel: { fontFamily: Fonts.poppinsSemiBold, fontSize: 14, color: Colors.text, marginBottom: 12 },

  options: { gap: 10, marginBottom: 28 },
  optionCard: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            14,
    backgroundColor: Colors.white,
    borderRadius:   12,
    padding:        16,
    borderWidth:    1,
    borderColor:    Colors.border,
    borderLeftWidth: 4,
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 1 },
    shadowOpacity:  0.06,
    shadowRadius:   4,
    elevation:      2,
  },
  optionEmoji: { fontSize: 28 },
  optionLabel: { flex: 1, fontFamily: Fonts.poppinsMedium, fontSize: 15, color: Colors.text },

  contacts: { gap: 10, marginBottom: 28 },
  contactCard:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.cardTintPurpleFaint, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.primaryLight },
  contactAvatar:  { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  contactInitial: { fontFamily: Fonts.poppinsBold, fontSize: 18, color: Colors.primary },
  contactInfo:    { flex: 1 },
  contactName:    { fontFamily: Fonts.poppinsMedium, fontSize: 15, color: Colors.text },
  contactRel:     { fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted },
  callBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },

  helplines: { gap: 10, marginBottom: 28 },
  helplineCard:  { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.sosBgRed, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.sosBorderRed },
  helplineLabel: { flex: 1, fontFamily: Fonts.poppinsMedium, fontSize: 14, color: Colors.text },
});
