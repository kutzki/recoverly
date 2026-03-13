import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

type Contact = { name: string; phone: string; relationship: string };

export default function InnerCircleScreen() {
  const insets     = useSafeAreaInsets();
  const user       = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const circle: Contact[] = Array.isArray(user?.inner_circle) ? (user?.inner_circle as Contact[]) : [];

  const [showAdd, setShowAdd]   = useState(false);
  const [name,    setName]      = useState('');
  const [phone,   setPhone]     = useState('');
  const [rel,     setRel]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleAdd = async () => {
    if (!name.trim() || !phone.trim()) { Alert.alert('Name and phone required'); return; }
    setLoading(true);
    try {
      await updateUser({ inner_circle: [...circle, { name, phone, relationship: rel }] });
      setName(''); setPhone(''); setRel(''); setShowAdd(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (idx: number) => {
    const updated = circle.filter((_, i) => i !== idx);
    await updateUser({ inner_circle: updated });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 20 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Inner Circle</Text>
          <Text style={styles.subheading}>People who support your recovery</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={circle}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-circle-outline" size={64} color={Colors.primaryLight} />
            <Text style={styles.emptyTitle}>No contacts yet</Text>
            <Text style={styles.emptyBody}>Add the people you trust most. They'll be here for you in a crisis.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.contactCard}>
            <View style={styles.contactAvatar}>
              <Text style={styles.contactInitial}>{item.name[0].toUpperCase()}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactRel}>{item.relationship || 'Support contact'}</Text>
            </View>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)} hitSlop={8}>
              <Ionicons name="call-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemove(index)} hitSlop={8}>
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Contact</Text>
            {[
              { label: 'Name', value: name, setter: setName, placeholder: 'Full name' },
              { label: 'Phone', value: phone, setter: setPhone, placeholder: '+1 (555) 000-0000', kbType: 'phone-pad' as any },
              { label: 'Relationship', value: rel, setter: setRel, placeholder: 'e.g. Parent, Friend' },
            ].map((f) => (
              <View key={f.label} style={styles.field}>
                <Text style={styles.label}>{f.label}</Text>
                <TextInput style={styles.input} value={f.value} onChangeText={f.setter} placeholder={f.placeholder} placeholderTextColor={Colors.placeholderText} keyboardType={f.kbType} />
              </View>
            ))}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.6 }]} onPress={handleAdd} disabled={loading}>
                <Text style={styles.saveText}>{loading ? 'Saving…' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.white, paddingHorizontal: 24 },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  heading:    { fontFamily: Fonts.poppinsBold, fontSize: 24, color: Colors.text },
  subheading: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  addBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },

  list:     { gap: 12, paddingBottom: 40 },
  empty:    { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle:{ fontFamily: Fonts.poppinsSemiBold, fontSize: 18, color: Colors.text },
  emptyBody: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, textAlign: 'center' },

  contactCard:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.cardTintPurpleFaint, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.primaryLight },
  contactAvatar:  { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  contactInitial: { fontFamily: Fonts.poppinsBold, fontSize: 18, color: Colors.primary },
  contactInfo:    { flex: 1 },
  contactName:    { fontFamily: Fonts.poppinsMedium, fontSize: 15, color: Colors.text },
  contactRel:     { fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal:   { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 14 },
  modalTitle: { fontFamily: Fonts.poppinsBold, fontSize: 18, color: Colors.text },
  field:      { gap: 6 },
  label:      { fontFamily: Fonts.poppinsMedium, fontSize: 13, color: Colors.text },
  input:      { backgroundColor: Colors.cardTintPurpleFaint, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontFamily: Fonts.jost, fontSize: 14, color: Colors.text, borderWidth: 1, borderColor: Colors.primaryLight },
  modalBtns:  { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn:  { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  cancelText: { fontFamily: Fonts.poppinsMedium, fontSize: 15, color: Colors.textMuted },
  saveBtn:    { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center' },
  saveText:   { fontFamily: Fonts.poppinsSemiBold, fontSize: 15, color: Colors.white },
});
