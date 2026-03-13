import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth';
import { supabase } from '../../services/supabase';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

type Goal = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
};

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const user   = useAuthStore((s) => s.user);
  const qc     = useQueryClient();

  const [showAdd, setShowAdd]   = useState(false);
  const [title, setTitle]       = useState('');
  const [desc,  setDesc]        = useState('');

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['goals', user?.id],
    enabled:  !!user?.id,
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const addGoal = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('user_goals').insert({
        user_id: user!.id, title, description: desc || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      setTitle(''); setDesc(''); setShowAdd(false);
    },
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const toggleGoal = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      await supabase.from('user_goals').update({ completed, completed_at: completed ? new Date().toISOString() : null }).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  });

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>My Goals</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Ionicons name="add" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {goals.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="flag-outline" size={64} color={Colors.primaryLight} />
            <Text style={styles.emptyTitle}>No goals yet</Text>
            <Text style={styles.emptyBody}>Tap + to set your first recovery goal.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {goals.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[styles.goalCard, g.completed && styles.goalCardDone]}
                activeOpacity={0.8}
                onPress={() => toggleGoal.mutate({ id: g.id, completed: !g.completed })}
              >
                <View style={[styles.checkbox, g.completed && styles.checkboxDone]}>
                  {g.completed && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                </View>
                <View style={styles.goalText}>
                  <Text style={[styles.goalTitle, g.completed && styles.goalTitleDone]}>{g.title}</Text>
                  {g.description ? <Text style={styles.goalDesc}>{g.description}</Text> : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Goal</Text>
            <TextInput
              style={styles.input}
              placeholder="Goal title"
              placeholderTextColor={Colors.placeholderText}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Description (optional)"
              placeholderTextColor={Colors.placeholderText}
              value={desc}
              onChangeText={setDesc}
              multiline
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}
                disabled={!title.trim() || addGoal.isPending}
                onPress={() => addGoal.mutate()}
              >
                <Text style={styles.saveText}>{addGoal.isPending ? 'Saving…' : 'Add Goal'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingHorizontal: 24 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  heading:{ fontFamily: Fonts.poppinsBold, fontSize: 24, color: Colors.text },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },

  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontFamily: Fonts.poppinsSemiBold, fontSize: 18, color: Colors.text },
  emptyBody:  { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, textAlign: 'center' },

  list: { gap: 12 },
  goalCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: Colors.cardTintPurpleFaint, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.primaryLight },
  goalCardDone: { opacity: 0.7 },
  checkbox:     { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  goalText:     { flex: 1 },
  goalTitle:    { fontFamily: Fonts.poppinsMedium, fontSize: 14, color: Colors.text },
  goalTitleDone:{ textDecorationLine: 'line-through', color: Colors.textMuted },
  goalDesc:     { fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal:        { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 14 },
  modalTitle:   { fontFamily: Fonts.poppinsBold, fontSize: 18, color: Colors.text },
  input:        { backgroundColor: Colors.cardTintPurpleFaint, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontFamily: Fonts.jost, fontSize: 14, color: Colors.text, borderWidth: 1, borderColor: Colors.primaryLight },
  inputMulti:   { height: 80, textAlignVertical: 'top' },
  modalBtns:    { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn:    { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  cancelText:   { fontFamily: Fonts.poppinsMedium, fontSize: 15, color: Colors.textMuted },
  saveBtn:      { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveText:     { fontFamily: Fonts.poppinsSemiBold, fontSize: 15, color: Colors.white },
});
