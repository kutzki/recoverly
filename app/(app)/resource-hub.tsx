import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const INSURANCE_CARD = {
  title: 'Ameriwell Care',
  desc: 'Connect your insurance plan for care coordination & benefits',
  icon: 'heart-circle-outline',
  color: Colors.goalBlue,
};

const CATEGORIES = [
  {
    id: 'crisis',
    label: 'Crisis Support',
    color: Colors.sosRed,
    items: [
      { title: 'SAMHSA National Helpline', desc: 'Free, confidential, 24/7', url: 'https://www.samhsa.gov/find-help/national-helpline' },
      { title: 'Crisis Text Line',         desc: 'Text HOME to 741741',        url: 'https://www.crisistextline.org' },
    ],
  },
  {
    id: 'recovery',
    label: 'Recovery Resources',
    color: Colors.primary,
    items: [
      { title: 'Alcoholics Anonymous',        desc: 'Find AA meetings worldwide', url: 'https://www.aa.org' },
      { title: 'Narcotics Anonymous',         desc: 'NA meetings & literature',   url: 'https://www.na.org' },
      { title: 'SMART Recovery',             desc: 'Science-based support',       url: 'https://www.smartrecovery.org' },
    ],
  },
  {
    id: 'mental',
    label: 'Mental Health',
    color: Colors.goalBlue,
    items: [
      { title: 'Psychology Today',           desc: 'Find a therapist near you', url: 'https://www.psychologytoday.com' },
      { title: 'NAMI',                       desc: 'Mental health support',     url: 'https://www.nami.org' },
    ],
  },
];

export default function ResourceHubScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Resource Hub</Text>
      <Text style={styles.subheading}>Trusted resources for every step of your recovery</Text>

      {/* ── Ameriwell Care Banner ──────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.insuranceBanner}
        activeOpacity={0.85}
        onPress={() => router.push('/(app)/ameriwell-care' as any)}
      >
        <View style={[styles.insuranceIconWrap, { backgroundColor: INSURANCE_CARD.color + '20' }]}>
          <Ionicons name={INSURANCE_CARD.icon as any} size={28} color={INSURANCE_CARD.color} />
        </View>
        <View style={styles.insuranceText}>
          <Text style={styles.insuranceTitle}>{INSURANCE_CARD.title}</Text>
          <Text style={styles.insuranceDesc}>{INSURANCE_CARD.desc}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={INSURANCE_CARD.color} />
      </TouchableOpacity>

      {CATEGORIES.map((cat) => (
        <View key={cat.id} style={styles.category}>
          <Text style={[styles.catLabel, { color: cat.color }]}>{cat.label}</Text>
          <View style={styles.catItems}>
            {cat.items.map((item) => (
              <TouchableOpacity
                key={item.title}
                style={styles.resourceCard}
                activeOpacity={0.8}
                onPress={() => Linking.openURL(item.url)}
              >
                <View style={styles.resourceText}>
                  <Text style={styles.resourceTitle}>{item.title}</Text>
                  <Text style={styles.resourceDesc}>{item.desc}</Text>
                </View>
                <Ionicons name="open-outline" size={18} color={Colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingHorizontal: 24 },

  heading:    { fontFamily: Fonts.poppinsBold, fontSize: 24, color: Colors.text, marginBottom: 6 },
  subheading: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, marginBottom: 24 },

  category:  { marginBottom: 24 },
  catLabel:  { fontFamily: Fonts.poppinsSemiBold, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },
  catItems:  { gap: 8 },
  resourceCard:  { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.cardTintPurpleFaint, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border },
  resourceText:  { flex: 1 },
  resourceTitle: { fontFamily: Fonts.poppinsMedium, fontSize: 14, color: Colors.text },
  resourceDesc:  { fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  insuranceBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.goalBlue + '10',
    borderRadius: 16, padding: 16, marginBottom: 24,
    borderWidth: 1.5, borderColor: Colors.goalBlue + '30',
  },
  insuranceIconWrap: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  insuranceText:     { flex: 1 },
  insuranceTitle:    { fontFamily: Fonts.poppinsSemiBold, fontSize: 15, color: Colors.text },
  insuranceDesc:     { fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted, marginTop: 2 },
});
