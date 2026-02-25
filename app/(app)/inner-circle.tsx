import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth';

interface Contact { name: string; phone: string; }

export default function InnerCircle() {
  const { user, updateUser } = useAuthStore();
  const [contacts, setContacts] = useState<Contact[]>(user?.innerCircle || []);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [addFocused, setAddFocused] = useState<string | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const openAdd = () => {
    setNewName('');
    setNewPhone('');
    setEditIndex(null);
    setShowModal(true);
  };

  const openEdit = (i: number) => {
    setNewName(contacts[i].name);
    setNewPhone(contacts[i].phone);
    setEditIndex(i);
    setShowModal(true);
  };

  const handleModalSave = () => {
    if (!newName.trim()) { Alert.alert('Name required'); return; }
    if (!newPhone.trim()) { Alert.alert('Phone required'); return; }
    const updated = [...contacts];
    if (editIndex !== null) {
      updated[editIndex] = { name: newName.trim(), phone: newPhone.trim() };
    } else {
      updated.push({ name: newName.trim(), phone: newPhone.trim() });
    }
    setContacts(updated);
    setShowModal(false);
  };

  const handleRemove = (i: number) => {
    Alert.alert('Remove Contact', `Remove ${contacts[i].name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: () => setContacts(prev => prev.filter((_, idx) => idx !== i)),
      },
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser({ innerCircle: contacts });
      Alert.alert('Saved! 💜', 'Your inner circle has been updated.');
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Could not open phone app.'));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Inner Circle</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBanner}>
          <Ionicons name="people-outline" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Your inner circle are trusted people you can contact during a crisis. They appear in your SOS screen for quick calling.
          </Text>
        </View>

        {contacts.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={Colors.primaryLight} />
            <Text style={styles.emptyTitle}>No contacts yet</Text>
            <Text style={styles.emptySub}>Add trusted people you can reach out to in difficult moments.</Text>
          </View>
        ) : (
          <View style={styles.contactList}>
            {contacts.map((c, i) => (
              <View key={i} style={styles.contactCard}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactInitial}>{c.name[0]?.toUpperCase()}</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text style={styles.contactPhone}>{c.phone}</Text>
                </View>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleCall(c.phone)}>
                  <Ionicons name="call-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(i)}>
                  <Ionicons name="pencil-outline" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleRemove(i)}>
                  <Ionicons name="trash-outline" size={20} color="#FF4747" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.addBtnText}>Add Contact</Text>
        </TouchableOpacity>

        {contacts.length > 0 && (
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.saveBtnText}>Save Inner Circle</Text>
            }
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView style={styles.modalSafe}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{editIndex !== null ? 'Edit Contact' : 'Add Contact'}</Text>
              <TouchableOpacity onPress={handleModalSave}>
                <Text style={styles.modalSave}>Save</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={[styles.inputWrap, addFocused === 'name' && styles.inputFocused]}>
                <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Full name"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                  onFocus={() => setAddFocused('name')}
                  onBlur={() => setAddFocused(null)}
                />
              </View>
              <View style={[styles.inputWrap, addFocused === 'phone' && styles.inputFocused]}>
                <Ionicons name="call-outline" size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  value={newPhone}
                  onChangeText={setNewPhone}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  onFocus={() => setAddFocused('phone')}
                  onBlur={() => setAddFocused(null)}
                />
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  scroll: { padding: 20 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.primary, lineHeight: 19 },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  contactList: { gap: 10, marginBottom: 16 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitial: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  contactPhone: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 14,
    height: 50,
    marginBottom: 16,
  },
  addBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 15 },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  modalSafe: { flex: 1, backgroundColor: Colors.white },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCancel: { fontSize: 16, color: Colors.textMuted },
  modalTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  modalSave: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  modalBody: { padding: 20, gap: 14 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputFocused: { borderColor: Colors.primary },
  input: { flex: 1, fontSize: 15, color: Colors.text },
});
