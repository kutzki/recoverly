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
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
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
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Gradient hero header ── */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary, Colors.primaryMid]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>

          <View style={styles.heroBadge}>
            <Ionicons name="people" size={28} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>Inner Circle</Text>
          <Text style={styles.heroSub}>People you can call in a moment of need</Text>
        </LinearGradient>

        {/* ── Send call link card ── */}
        <View style={styles.callLinkCard}>
          <View style={styles.callLinkIconWrap}>
            <Ionicons name="videocam" size={28} color={Colors.primary} />
          </View>
          <View style={styles.callLinkText}>
            <Text style={styles.callLinkTitle}>Send a Video Call Link</Text>
            <Text style={styles.callLinkSub}>All members of your inner circle will receive a call link</Text>
          </View>
          <TouchableOpacity
            style={styles.callLinkBtn}
            onPress={() =>
              router.push({
                pathname: '/(app)/call/[callId]' as any,
                params: { callId: 'inner_circle_room', type: 'default', calleeName: encodeURIComponent('Inner Circle') },
              })
            }
            activeOpacity={0.85}
          >
            <Ionicons name="call" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* ── Contacts section ── */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>Contacts</Text>
        </View>

        {contacts.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={Colors.primaryLight} />
            <Text style={styles.emptyTitle}>No contacts yet</Text>
            <Text style={styles.emptySub}>Add trusted people you can reach out to in difficult moments.</Text>
          </View>
        ) : (
          <View style={styles.contactsCard}>
            {contacts.map((c, i) => (
              <React.Fragment key={i}>
                <View style={styles.contactRow}>
                  {/* Avatar */}
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactInitial}>{c.name[0]?.toUpperCase()}</Text>
                  </View>
                  {/* Info */}
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{c.name}</Text>
                    <Text style={styles.contactPhone}>{c.phone}</Text>
                  </View>
                  {/* Call button */}
                  <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(c.phone)} activeOpacity={0.8}>
                    <Ionicons name="call" size={17} color={Colors.white} />
                  </TouchableOpacity>
                  {/* Edit */}
                  <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(i)}>
                    <Ionicons name="pencil-outline" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                  {/* Remove */}
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleRemove(i)}>
                    <Ionicons name="trash-outline" size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
                {i < contacts.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* ── Add Contact button ── */}
        <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.addBtnText}>Add Contact</Text>
        </TouchableOpacity>

        {/* ── Save button ── */}
        {contacts.length > 0 && (
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.saveBtnText}>Save Inner Circle</Text>
            }
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Add/Edit Modal ── */}
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
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 20 },

  /* ── Hero ── */
  hero: {
    paddingTop: Platform.OS === 'android' ? 50 : 58,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 12 : 56,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: Fonts.generalSansBold,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  /* ── Call link card ── */
  callLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: Colors.primary + '33',
  },
  callLinkIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callLinkText: { flex: 1 },
  callLinkTitle: { fontSize: 14, fontFamily: Fonts.generalSansBold, color: Colors.text },
  callLinkSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2, lineHeight: 17 },
  callLinkBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Section label ── */
  sectionLabel: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  sectionLabelText: {
    fontSize: 12,
    fontFamily: Fonts.generalSansBold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  /* ── Contacts flat card ── */
  contactsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  contactAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitial: { fontSize: 18, fontFamily: Fonts.generalSansBold, color: Colors.primary },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontFamily: Fonts.generalSansSemiBold, color: Colors.text },
  contactPhone: { fontSize: 13, color: Colors.textMuted, marginTop: 1 },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 72,
  },

  /* ── Empty ── */
  empty: { alignItems: 'center', gap: 12, paddingVertical: 40, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 17, fontFamily: Fonts.generalSansBold, color: Colors.text },
  emptySub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },

  /* ── Add / Save buttons ── */
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
    marginHorizontal: 20,
    marginTop: 16,
  },
  addBtnText: { color: Colors.primary, fontFamily: Fonts.generalSansSemiBold, fontSize: 15 },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 12,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: Colors.white, fontFamily: Fonts.generalSansBold, fontSize: 16 },

  /* ── Add/Edit Modal ── */
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
  modalTitle: { fontSize: 17, fontFamily: Fonts.generalSansBold, color: Colors.text },
  modalSave: { fontSize: 16, fontFamily: Fonts.generalSansBold, color: Colors.primary },
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
