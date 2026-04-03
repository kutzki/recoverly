import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useAuthStore } from '../../store/auth';
import { guardianService, GuardianLink } from '../../services/guardian';

export default function GuardianScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeLinks, setActiveLinks] = useState<GuardianLink[]>([]);
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null);

  const fetchLinks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const links = await guardianService.getMyLinks(user.id, 'SEEKER');
      setActiveLinks(links.filter(l => l.status === 'ACTIVE'));
      // Sync local code if it exists on profile
      if (user.guardian_code) {
        setCurrentCode(user.guardian_code);
        setCodeExpiry(user.guardian_code_expires_at ? new Date(user.guardian_code_expires_at) : null);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [user]);

  const handleGenerateCode = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const code = await guardianService.generateLinkingCode(user.id);
      setCurrentCode(code);
      // Expiry is 15 minutes
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 15);
      setCodeExpiry(expiry);
      Alert.alert('New Code Generated', `Share this code with your Guardian: ${code}`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (linkId: string) => {
    Alert.alert(
      'Revoke Guardian',
      'Are you sure you want to disconnect this Guardian? They will no longer receive safety alerts.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Revoke', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await guardianService.updateLinkStatus(linkId, 'REVOKED');
              fetchLinks();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(171,49,240,0.15)', 'transparent']}
        style={styles.bgOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
      />
      
      <ScrollView 
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Guardian Ecosystem</Text>
          <Text style={styles.subtitle}>Link with someone you trust to help keep you safe.</Text>
        </View>

        {/* ── Linking Card ────────────────────────────────────────────────── */}
        <View style={styles.linkingCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="key-outline" size={24} color={Colors.primary} />
            <Text style={styles.cardTitle}>Share Linking Code</Text>
          </View>
          
          <Text style={styles.cardDesc}>
            Generate a unique code for your Guardian to enter on their app. Codes expire in 15 minutes for your security.
          </Text>

          {currentCode ? (
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{currentCode}</Text>
              <Text style={styles.expiryLabel}>
                Expires: {codeExpiry?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyCodeBox}>
              <Text style={styles.emptyCodeText}>No active code</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.generateBtn, generating && { opacity: 0.7 }]} 
            onPress={handleGenerateCode}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.generateBtnText}>
                {currentCode ? 'Regenerate Code' : 'Generate Code'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Active Guardians ────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Your Guardians</Text>
        
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
        ) : activeLinks.length > 0 ? (
          activeLinks.map((link) => (
            <View key={link.id} style={styles.linkItem}>
              <View style={styles.linkInfo}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={20} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.guardianName}>Guardian Active</Text>
                  <Text style={styles.linkTime}>Connected {new Date(link.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleRevoke(link.id)} hitSlop={10}>
                <Ionicons name="trash-outline" size={22} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyLinks}>
            <Ionicons name="shield-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyLinksText}>No active Guardians yet.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  bgOverlay: {
    position: 'absolute', left: 0, top: 0, width: '100%', height: 400,
  },
  scroll: { paddingHorizontal: 24 },
  header: { marginBottom: 32 },
  title: { fontFamily: Fonts.poppinsBold, fontSize: 28, color: Colors.text },
  subtitle: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.textMuted, marginTop: 4 },
  
  linkingCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 40,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  cardTitle: { fontFamily: Fonts.poppinsSemiBold, fontSize: 18, color: Colors.text },
  cardDesc: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, lineHeight: 20, marginBottom: 24 },
  
  codeBox: {
    backgroundColor: Colors.cardTintPurpleFaint,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  codeText: { fontFamily: Fonts.poppinsBold, fontSize: 36, color: Colors.primary, letterSpacing: 8 },
  expiryLabel: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  
  emptyCodeBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 30,
    alignItems: 'center',
    marginBottom: 24,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyCodeText: { fontFamily: Fonts.jostMedium, fontSize: 14, color: Colors.textMuted },
  
  generateBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  generateBtnText: { fontFamily: Fonts.poppinsSemiBold, fontSize: 16, color: Colors.white },
  
  sectionLabel: { fontFamily: Fonts.poppinsSemiBold, fontSize: 18, color: Colors.text, marginBottom: 16 },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  linkInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.cardTintPurpleFaint,
    alignItems: 'center', justifyContent: 'center',
  },
  guardianName: { fontFamily: Fonts.poppinsSemiBold, fontSize: 15, color: Colors.text },
  linkTime: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted },
  
  emptyLinks: { alignItems: 'center', marginTop: 20, gap: 12, opacity: 0.5 },
  emptyLinksText: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted },
});
