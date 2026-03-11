import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { getGoals, upsertGoal, toggleGoalComplete, deleteGoal, UserGoal } from '../../services/supabase';
import { useAuthStore } from '../../store/auth';

const CATEGORIES = [
  { key: 'recovery', label: 'Recovery', icon: 'heart-outline',    color: Colors.primary   },
  { key: 'health',   label: 'Health',   icon: 'fitness-outline',  color: Colors.goalGreen },
  { key: 'personal', label: 'Personal', icon: 'person-outline',   color: Colors.goalAmber },
  { key: 'work',     label: 'Work',     icon: 'briefcase-outline', color: Colors.goalBlue  },
];

export default function Goals() {
  const { user } = useAuthStore();
  const userId = user?.id ?? null;

  const [goals, setGoals]           = useState<UserGoal[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editGoal, setEditGoal]     = useState<UserGoal | null>(null);
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]     = useState('recovery');
  const [saving, setSaving]         = useState(false);
  const [focused, setFocused]       = useState<string | null>(null);

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
    Keyboard.dismiss();
    setSaving(true);
    try {
      const payload: Partial<UserGoal> & { title: string } = {
        title: title.trim(),
        description: description.trim(),
        category,
        ...(editGoal ? { id: editGoal.id } : {}),
      };
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

  const active    = useMemo(() => goals.filter(g => !g.completed), [goals]);
  const completed = useMemo(() => goals.filter(g => g.completed), [goals]);
  const getCat    = useCallback((key: string) => CATEGORIES.find(c => c.key === key) ?? CATEGORIES[0], []);

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>

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
        <TouchableOpacity style={styles.addHeroBtn} onPress={openAdd}>
          <Ionicons name="add" size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>

        <View style={styles.heroBadge}>
          <Ionicons name="flag" size={28} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>My Goals</Text>
        <Text style={styles.heroSub}>Track your recovery journey</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Stats row ── */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{active.length}</Text>
              <Text style={styles.statLbl}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: Colors.goalGreen }]}>{completed.length}</Text>
              <Text style={styles.statLbl}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: Colors.goalAmber }]}>{goals.length}</Text>
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
                <>
                  <View style={styles.sectionLabel}>
                    <Text style={styles.sectionLabelText}>In Progress</Text>
                  </View>
                  <View style={styles.goalsCard}>
                    {active.map((g, i) => {
                      const cat = getCat(g.category);
                      return (
                        <React.Fragment key={g.id}>
                          <View style={styles.goalRow}>
                            <TouchableOpacity onPress={() => handleToggle(g)} style={styles.checkbox}>
                              <Ionicons name="square-outline" size={24} color={Colors.border} />
                            </TouchableOpacity>
                            <View style={[styles.catDot, { backgroundColor: cat.color + '22' }]}>
                              <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                            </View>
                            <View style={styles.goalText}>
                              <Text style={styles.goalTitle}>{g.title}</Text>
                              {g.description ? <Text style={styles.goalDesc}>{g.description}</Text> : null}
                              <Text style={[styles.goalCat, { color: cat.color }]}>{cat.label}</Text>
                            </View>
                            <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(g)}>
                              <Ionicons name="pencil-outline" size={18} color={Colors.textMuted} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(g)}>
                              <Ionicons name="trash-outline" size={18} color={Colors.error} />
                            </TouchableOpacity>
                          </View>
                          {i < active.length - 1 && <View style={styles.divider} />}
                        </React.Fragment>
                      );
                    })}
                  </View>
                </>
              )}

              {completed.length > 0 && (
                <>
                  <View style={styles.sectionLabel}>
                    <Text style={styles.sectionLabelText}>Completed 🎉</Text>
                  </View>
                  <View style={styles.goalsCard}>
                    {completed.map((g, i) => {
                      const cat = getCat(g.category);
                      return (
                        <React.Fragment key={g.id}>
                          <View style={[styles.goalRow, { opacity: 0.7 }]}>
                            <TouchableOpacity onPress={() => handleToggle(g)} style={styles.checkbox}>
                              <Ionicons name="checkmark-circle" size={24} color={Colors.goalGreen} />
                            </TouchableOpacity>
                            <View style={[styles.catDot, { backgroundColor: cat.color + '22' }]}>
                              <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                            </View>
                            <View style={styles.goalText}>
                              <Text style={[styles.goalTitle, styles.goalTitleDone]}>{g.title}</Text>
                              <Text style={[styles.goalCat, { color: cat.color }]}>{cat.label}</Text>
                            </View>
                            <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(g)}>
                              <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
                            </TouchableOpacity>
                          </View>
                          {i < completed.length - 1 && <View style={styles.divider} />}
                        </React.Fragment>
                      );
                    })}
                  </View>
                </>
              )}
            </>
          )}

          {/* ── Add Goal button ── */}
          <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.addBtnText}>Add Goal</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ── Add/Edit Modal ── */}
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
                    <Text style={[styles.catBtnLabel, category === c.key && { color: c.color, fontFamily: Fonts.poppinsBold }]}>
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
  safe:     { flex: 1, backgroundColor: Colors.background },
  scroll:   { paddingBottom: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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
  addHeroBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 12 : 56,
    right: 16,
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
    fontFamily: Fonts.poppinsBold,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: Fonts.jost,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  /* ── Stats row ── */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statBox:     { alignItems: 'center' },
  statNum:     { fontSize: 22, fontFamily: Fonts.poppinsBold, color: Colors.primary },
  statLbl:     { fontSize: 12, fontFamily: Fonts.jost, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },

  /* ── Section label ── */
  sectionLabel: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  sectionLabelText: {
    fontSize: 12,
    fontFamily: Fonts.poppinsBold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  /* ── Goals flat card ── */
  goalsCard: {
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
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  checkbox:      { width: 28, alignItems: 'center' },
  catDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalText:      { flex: 1 },
  goalTitle:     { fontSize: 14, fontFamily: Fonts.poppinsSemiBold, color: Colors.text },
  goalTitleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  goalDesc:      { fontSize: 12, fontFamily: Fonts.jost, color: Colors.textMuted, marginTop: 2, lineHeight: 17 },
  goalCat:       { fontSize: 11, fontFamily: Fonts.poppinsBold, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.3 },
  iconBtn:       { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  divider:       { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginLeft: 88 },

  /* ── Empty state ── */
  emptyState:   { alignItems: 'center', gap: 12, paddingVertical: 50, paddingHorizontal: 24 },
  emptyTitle:   { fontSize: 18, fontFamily: Fonts.poppinsBold, color: Colors.text },
  emptySub:     { fontSize: 14, fontFamily: Fonts.jost, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  emptyBtn:     { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  emptyBtnText: { color: Colors.white, fontFamily: Fonts.poppinsBold, fontSize: 14 },

  /* ── Add Goal button ── */
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
  addBtnText: { color: Colors.primary, fontFamily: Fonts.poppinsSemiBold, fontSize: 15 },

  /* ── Modal ── */
  modalSafe:   { flex: 1, backgroundColor: Colors.white },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCancel: { fontSize: 16, fontFamily: Fonts.jost, color: Colors.textMuted },
  modalTitle:  { fontSize: 17, fontFamily: Fonts.poppinsBold, color: Colors.text },
  modalSave:   { fontSize: 16, fontFamily: Fonts.poppinsBold, color: Colors.primary },
  modalBody:   { padding: 20 },
  fieldLabel:  { fontSize: 13, fontFamily: Fonts.poppinsBold, color: Colors.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  inputWrap: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    minHeight: 52,
    justifyContent: 'center',
  },
  inputMulti:   { paddingVertical: 12, justifyContent: 'flex-start' },
  inputFocused: { borderColor: Colors.primary },
  input:        { fontSize: 15, fontFamily: Fonts.jost, color: Colors.text },
  catRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
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
  catBtnLabel: { fontSize: 13, fontFamily: Fonts.jost, color: Colors.textMuted },
});
