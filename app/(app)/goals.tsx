import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { getGoals, upsertGoal, toggleGoalComplete, deleteGoal, UserGoal } from '../../services/supabase';
import { useAuthStore } from '../../store/auth';

const CATEGORIES = [
  { key: 'recovery', label: 'Recovery', icon: 'heart-outline', color: Colors.primary },
  { key: 'health',   label: 'Health',   icon: 'fitness-outline', color: '#10B981' },
  { key: 'personal', label: 'Personal', icon: 'person-outline',  color: '#F59E0B' },
  { key: 'work',     label: 'Work',     icon: 'briefcase-outline', color: '#3B82F6' },
];

export default function Goals() {
  const { user } = useAuthStore();
  const userId = user?.id ?? null;

  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState<UserGoal | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('recovery');
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const data = await getGoals(userId);
      setGoals(data);
    } catch {
      // fail silently — keep showing previous data
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditGoal(null);
    setTitle('');
    setDescription('');
    setCategory('recovery');
    setShowModal(true);
  };

  const openEdit = (g: UserGoal) => {
    setEditGoal(g);
    setTitle(g.title);
    setDescription(g.description || '');
    setCategory(g.category);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Title required'); return; }
    if (!userId) return;
    Keyboard.dismiss(); // close keyboard before modal closes to avoid layout jump
    setSaving(true);
    try {
      const payload: any = { title: title.trim(), description: description.trim(), category };
      if (editGoal) payload.id = editGoal.id;
      await upsertGoal(userId, payload);
      await load();
      setShowModal(false);
    } catch {
      Alert.alert('Error', 'Could not save goal.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (goal: UserGoal) => {
    const newVal = !goal.completed;
    // Optimistic update
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, completed: newVal } : g));
    try {
      await toggleGoalComplete(goal.id, newVal);
      if (newVal) {
        Alert.alert('Goal completed! 🎉', `"${goal.title}" — great work!`);
      }
    } catch {
      // Roll back optimistic update on failure
      setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, completed: goal.completed } : g));
      Alert.alert('Error', 'Could not update goal. Please try again.');
    }
  };

  const handleDelete = (g: UserGoal) => {
    Alert.alert('Delete Goal', `Delete "${g.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteGoal(g.id);
            setGoals(prev => prev.filter(x => x.id !== g.id));
          } catch {
            Alert.alert('Error', 'Could not delete goal. Please try again.');
          }
        },
      },
    ]);
  };

  const active = goals.filter(g => !g.completed);
  const completed = goals.filter(g => g.completed);

  const getCat = (key: string) => CATEGORIES.find(c => c.key === key) || CATEGORIES[0];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Goals</Text>
        <TouchableOpacity style={styles.addHeaderBtn} onPress={openAdd}>
          <Ionicons name="add" size={26} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{active.length}</Text>
              <Text style={styles.statLbl}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#10B981' }]}>{completed.length}</Text>
              <Text style={styles.statLbl}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#F59E0B' }]}>{goals.length}</Text>
              <Text style={styles.statLbl}>Total</Text>
            </View>
          </View>

          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="flag-outline" size={56} color={Colors.primaryLight} />
              <Text style={styles.emptyTitle}>No goals yet</Text>
              <Text style={styles.emptySub}>Set goals to track your recovery progress and personal growth.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={openAdd}>
                <Text style={styles.emptyBtnText}>Add your first goal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {active.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>In Progress</Text>
                  {active.map(g => {
                    const cat = getCat(g.category);
                    return (
                      <View key={g.id} style={styles.goalCard}>
                        <TouchableOpacity style={styles.checkbox} onPress={() => handleToggle(g)}>
                          <Ionicons name="square-outline" size={24} color={Colors.border} />
                        </TouchableOpacity>
                        <View style={[styles.catDot, { backgroundColor: cat.color + '33' }]}>
                          <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                        </View>
                        <View style={styles.goalText}>
                          <Text style={styles.goalTitle}>{g.title}</Text>
                          {g.description ? <Text style={styles.goalDesc}>{g.description}</Text> : null}
                          <Text style={[styles.goalCat, { color: cat.color }]}>{cat.label}</Text>
                        </View>
                        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(g)}>
                          <Ionicons name="pencil-outline" size={18} color={Colors.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.editBtn} onPress={() => handleDelete(g)}>
                          <Ionicons name="trash-outline" size={18} color="#FF4747" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}

              {completed.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Completed 🎉</Text>
                  {completed.map(g => {
                    const cat = getCat(g.category);
                    return (
                      <View key={g.id} style={[styles.goalCard, styles.goalCardDone]}>
                        <TouchableOpacity style={styles.checkbox} onPress={() => handleToggle(g)}>
                          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                        </TouchableOpacity>
                        <View style={[styles.catDot, { backgroundColor: cat.color + '22' }]}>
                          <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                        </View>
                        <View style={styles.goalText}>
                          <Text style={[styles.goalTitle, styles.goalTitleDone]}>{g.title}</Text>
                          <Text style={[styles.goalCat, { color: cat.color }]}>{cat.label}</Text>
                        </View>
                        <TouchableOpacity style={styles.editBtn} onPress={() => handleDelete(g)}>
                          <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView style={styles.modalSafe}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{editGoal ? 'Edit Goal' : 'New Goal'}</Text>
              <TouchableOpacity onPress={handleSave} disabled={saving}>
                {saving
                  ? <ActivityIndicator size="small" color={Colors.primary} />
                  : <Text style={styles.modalSave}>Save</Text>
                }
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.fieldLabel}>Title</Text>
              <View style={[styles.inputWrap, focused === 'title' && styles.inputFocused]}>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Stay sober for 30 days"
                  placeholderTextColor={Colors.textMuted}
                  maxLength={80}
                  returnKeyType="next"
                  onFocus={() => setFocused('title')}
                  onBlur={() => setFocused(null)}
                />
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Description (optional)</Text>
              <View style={[styles.inputWrap, styles.inputMulti, focused === 'desc' && styles.inputFocused]}>
                <TextInput
                  style={[styles.input, { textAlignVertical: 'top', minHeight: 80 }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Why is this goal important to you?"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  maxLength={200}
                  onFocus={() => setFocused('desc')}
                  onBlur={() => setFocused(null)}
                />
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Category</Text>
              <View style={styles.catRow}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity
                    key={c.key}
                    style={[styles.catBtn, category === c.key && { backgroundColor: c.color + '22', borderColor: c.color }]}
                    onPress={() => setCategory(c.key)}
                  >
                    <Ionicons name={c.icon as any} size={16} color={category === c.key ? c.color : Colors.textMuted} />
                    <Text style={[styles.catBtnLabel, category === c.key && { color: c.color, fontWeight: '700' }]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
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
  addHeaderBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  statLbl: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  emptyState: { alignItems: 'center', gap: 12, paddingVertical: 50 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  emptyBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  emptyBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  goalCardDone: { opacity: 0.7 },
  checkbox: { width: 28 },
  catDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalText: { flex: 1 },
  goalTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  goalTitleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  goalDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 2, lineHeight: 17 },
  goalCat: { fontSize: 11, fontWeight: '700', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.3 },
  editBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
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
  modalBody: { padding: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  inputWrap: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    minHeight: 52,
    justifyContent: 'center',
  },
  inputMulti: { paddingVertical: 12, justifyContent: 'flex-start' },
  inputFocused: { borderColor: Colors.primary },
  input: { fontSize: 15, color: Colors.text },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  catBtnLabel: { fontSize: 13, color: Colors.textMuted },
});
