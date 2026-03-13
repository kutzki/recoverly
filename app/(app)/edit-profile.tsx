import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export default function EditProfileScreen() {
  const insets     = useSafeAreaInsets();
  const user       = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [name,      setName]      = useState(user?.name      ?? '');
  const [username,  setUsername]  = useState(user?.username  ?? '');
  const [bio,       setBio]       = useState(user?.bio       ?? '');
  const [location,  setLocation]  = useState(user?.location  ?? '');
  const [substance, setSubstance] = useState(user?.substance ?? '');
  const [loading,   setLoading]   = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser({ name, username, bio, location, substance });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: 40 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.heading}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {[
        { label: 'Full Name',    value: name,      setter: setName,      placeholder: 'Your full name'         },
        { label: 'Username',     value: username,  setter: setUsername,  placeholder: '@username'              },
        { label: 'Location',     value: location,  setter: setLocation,  placeholder: 'City, Country'          },
        { label: 'Substance',    value: substance, setter: setSubstance, placeholder: 'e.g. Alcohol, Opioids'  },
      ].map((f) => (
        <View key={f.label} style={styles.field}>
          <Text style={styles.label}>{f.label}</Text>
          <TextInput
            style={styles.input}
            value={f.value}
            onChangeText={f.setter}
            placeholder={f.placeholder}
            placeholderTextColor={Colors.placeholderText}
            returnKeyType="next"
          />
        </View>
      ))}

      <View style={styles.field}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.inputMulti]}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell your story…"
          placeholderTextColor={Colors.placeholderText}
          multiline
        />
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
        activeOpacity={0.85}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveText}>{loading ? 'Saving…' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingHorizontal: 24 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  heading:{ fontFamily: Fonts.poppinsBold, fontSize: 20, color: Colors.text },

  field:   { gap: 6, marginBottom: 16 },
  label:   { fontFamily: Fonts.poppinsMedium, fontSize: 13, color: Colors.text },
  input:   { backgroundColor: Colors.cardTintPurpleFaint, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontFamily: Fonts.jost, fontSize: 14, color: Colors.text, borderWidth: 1, borderColor: Colors.primaryLight },
  inputMulti: { height: 100, textAlignVertical: 'top' },

  saveBtn:         { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnDisabled: { opacity: 0.6 },
  saveText:        { fontFamily: Fonts.poppinsSemiBold, fontSize: 16, color: Colors.white },
});
