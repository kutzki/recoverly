import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export default function SponsorScreen() {
  const insets     = useSafeAreaInsets();
  const user       = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [name,    setName]    = useState(user?.sponsor_name  ?? '');
  const [phone,   setPhone]   = useState(user?.sponsor_phone ?? '');
  const [editing, setEditing] = useState(!user?.sponsor_name);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    setLoading(true);
    try {
      await updateUser({ sponsor_name: name, sponsor_phone: phone });
      setEditing(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.heading}>My Sponsor</Text>
      <Text style={styles.subheading}>Your sponsor is your lifeline. Keep their info here.</Text>

      {!editing && user?.sponsor_name ? (
        <View style={styles.sponsorCard}>
          <View style={styles.sponsorAvatar}>
            <Text style={styles.sponsorInitial}>{user.sponsor_name[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.sponsorName}>{user.sponsor_name}</Text>
          {user.sponsor_phone && (
            <Text style={styles.sponsorPhone}>{user.sponsor_phone}</Text>
          )}
          <View style={styles.sponsorActions}>
            {user.sponsor_phone && (
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => Linking.openURL(`tel:${user.sponsor_phone}`)}
              >
                <Ionicons name="call" size={20} color={Colors.white} />
                <Text style={styles.callText}>Call Sponsor</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Sponsor Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={Colors.placeholderText} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+1 (555) 000-0000" placeholderTextColor={Colors.placeholderText} keyboardType="phone-pad" />
          </View>
          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveText}>{loading ? 'Saving…' : 'Save Sponsor'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.white, paddingHorizontal: 24 },
  heading:    { fontFamily: Fonts.poppinsBold, fontSize: 24, color: Colors.text, marginBottom: 6 },
  subheading: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, marginBottom: 28 },

  sponsorCard:   { backgroundColor: Colors.cardTintPurpleFaint, borderRadius: 16, padding: 24, alignItems: 'center', gap: 8 },
  sponsorAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  sponsorInitial:{ fontFamily: Fonts.poppinsBold, fontSize: 30, color: Colors.primary },
  sponsorName:   { fontFamily: Fonts.poppinsBold, fontSize: 20, color: Colors.text },
  sponsorPhone:  { fontFamily: Fonts.jost, fontSize: 15, color: Colors.textMuted },

  sponsorActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  callBtn:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20 },
  callText:  { fontFamily: Fonts.poppinsSemiBold, fontSize: 15, color: Colors.white },
  editBtn:   { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.primary },
  editText:  { fontFamily: Fonts.poppinsMedium, fontSize: 15, color: Colors.primary },

  form:    { gap: 16 },
  field:   { gap: 6 },
  label:   { fontFamily: Fonts.poppinsMedium, fontSize: 13, color: Colors.text },
  input:   { backgroundColor: Colors.cardTintPurpleFaint, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontFamily: Fonts.jost, fontSize: 14, color: Colors.text, borderWidth: 1, borderColor: Colors.primaryLight },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveText:{ fontFamily: Fonts.poppinsSemiBold, fontSize: 16, color: Colors.white },
});
