import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth';
import { supabase } from '../../services/supabase';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

type Goal = {
  id:           string;
  title:        string;
  description:  string | null;
  category:     string;            // 'recovery' | 'personal' | 'work' | 'health'
  target_date:  string | null;     // ISO date string "YYYY-MM-DD" or null
  completed:    boolean;
  completed_at: string | null;
  created_at:   string;
};

const CATEGORIES = [
  { id: 'recovery', label: 'Recovery', color: Colors.primary },
  { id: 'personal', label: 'Personal', color: Colors.goalBlue },
  { id: 'health',   label: 'Health',   color: Colors.goalGreen },
  { id: 'work',     label: 'Work',     color: Colors.goalAmber },
] as const;

const todayISO = () => new Date().toISOString().slice(0, 10);

function isOverdue(goal: Goal): boolean {
  return !goal.completed && !!goal.target_date && goal.target_date < todayISO();
}

function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00');
  return !isNaN(d.getTime());
}

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const user   = useAuthStore((s) => s.user);
  const qc     = useQueryClient();

  const [showModal, setShowModal]     = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [title, setTitle]             = useState('');
  const [desc,  setDesc]              = useState('');
  const [category, setCategory]       = useState('recovery');
  const [targetDate, setTargetDate]   = useState('');

  useEffect(() => {
    if (showModal) {
      setTitle(editingGoal?.title ?? '');
      setDesc(editingGoal?.description ?? '');
      setCategory(editingGoal?.category ?? 'recovery');
      setTargetDate(editingGoal?.target_date ?? '');
    }
  }, [showModal]);

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['goals', user?.id],
    enabled:  !!user?.id,
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user!.id)
        .order('completed', { ascending: true })
        .order('target_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      title: string;
      description: string | null;
      category: string;
      target_date: string | null;
    }) => {
      if (editingGoal) {
        const { error } = await supabase
          .from('user_goals')
          .update(payload)
          .eq('id', editingGoal.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_goals').insert({
          user_id: user!.id,
          ...payload,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      setShowModal(false);
      setEditingGoal(null);
    },
    onError: (e: Error) => Alert.alert('Error', e.message),
  });

  const toggleGoal = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('user_goals')
        .update({ completed, completed_at: completed ? new Date().toISOString() : null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_goals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
    onError: (e: Error) => Alert.alert('Error', e.message),
  });

  function handleDelete(goal: Goal) {
    Alert.alert(
      'Delete Goal',
      `Remove "${goal.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(goal.id) },
      ],
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>My Goals</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => { setEditingGoal(null); setShowModal(true); }}>
            <Ionicons name="add" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {goals.length > 0 && (() => {
          const total = goals.length;
          const done  = goals.filter((g) => g.completed).length;
          const pct   = total === 0 ? 0 : done / total;
          return (
            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>{done} of {total} goals complete</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round(pct * 100)}%` as any }]} />
              </View>
            </View>
          );
        })()}

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
                style={[
                  styles.goalCard,
                  g.completed && styles.goalCardDone,
                  isOverdue(g) && styles.goalCardOverdue,
                ]}
                activeOpacity={0.8}
                onPress={() => toggleGoal.mutate({ id: g.id, completed: !g.completed })}
              >
                <View style={[styles.checkbox, g.completed && styles.checkboxDone]}>
                  {g.completed && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                </View>
                <View style={styles.goalText}>
                  <Text style={[styles.goalTitle, g.completed && styles.goalTitleDone]}>{g.title}</Text>
                  {g.description ? <Text style={styles.goalDesc}>{g.description}</Text> : null}
                  <View style={styles.goalMeta}>
                    {/* Category badge */}
                    {(() => {
                      const cat = CATEGORIES.find((c) => c.id === g.category) ?? CATEGORIES[0];
                      return (
                        <View style={[styles.categoryBadge, { backgroundColor: cat.color + '22' }]}>
                          <Text style={[styles.categoryBadgeText, { color: cat.color }]}>{cat.label}</Text>
                        </View>
                      );
                    })()}
                    {/* Target date chip */}
                    {g.target_date ? (
                      <View style={[styles.dateBadge, isOverdue(g) && styles.dateBadgeOverdue]}>
                        <Ionicons
                          name="calendar-outline"
                          size={11}
                          color={isOverdue(g) ? Colors.warning : Colors.textMuted}
                        />
                        <Text style={[styles.dateBadgeText, isOverdue(g) && styles.dateBadgeTextOverdue]}>
                          {g.target_date}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => { setEditingGoal(g); setShowModal(true); }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.cardActionBtn}
                  >
                    <Ionicons name="pencil-outline" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(g)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.cardActionBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color={Colors.sosRed} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add / Edit Goal Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingGoal ? 'Edit Goal' : 'New Goal'}</Text>

            {/* Title input */}
            <TextInput
              style={styles.input}
              placeholder="Goal title"
              placeholderTextColor={Colors.placeholderText}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />

            {/* Description input */}
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Description (optional)"
              placeholderTextColor={Colors.placeholderText}
              value={desc}
              onChangeText={setDesc}
              multiline
            />

            {/* Category picker */}
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryPill,
                    category === cat.id && { backgroundColor: cat.color, borderColor: cat.color },
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      category === cat.id && styles.categoryPillTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Target date input */}
            <Text style={styles.fieldLabel}>Target Date <Text style={styles.fieldLabelMuted}>(YYYY-MM-DD, optional)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2026-06-01"
              placeholderTextColor={Colors.placeholderText}
              value={targetDate}
              onChangeText={setTargetDate}
              keyboardType="numeric"
              maxLength={10}
            />

            {/* Buttons */}
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setShowModal(false); setEditingGoal(null); }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}
                disabled={!title.trim() || saveMutation.isPending}
                onPress={() => {
                  const td = targetDate.trim();
                  saveMutation.mutate({
                    title: title.trim(),
                    description: desc.trim() || null,
                    category,
                    target_date: td && isValidDate(td) ? td : null,
                  });
                }}
              >
                <Text style={styles.saveText}>
                  {saveMutation.isPending ? 'Saving…' : editingGoal ? 'Save Changes' : 'Add Goal'}
                </Text>
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
  goalCardOverdue: {
    borderColor: Colors.warning,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  checkbox:     { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  goalText:     { flex: 1 },
  goalTitle:    { fontFamily: Fonts.poppinsMedium, fontSize: 14, color: Colors.text },
  goalTitleDone:{ textDecorationLine: 'line-through', color: Colors.textMuted },
  goalDesc:     { fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  goalMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  categoryBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  categoryBadgeText: {
    fontFamily: Fonts.jostMedium,
    fontSize: 11,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: Colors.cardTintPurpleFaint,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  dateBadgeOverdue: {
    borderColor: Colors.warning,
    backgroundColor: '#FFF8F0',
  },
  dateBadgeText: {
    fontFamily: Fonts.jostMedium,
    fontSize: 11,
    color: Colors.textMuted,
  },
  dateBadgeTextOverdue: {
    color: Colors.warning,
  },

  cardActions: {
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  cardActionBtn: {
    padding: 2,
  },

  progressSection: {
    marginBottom: 16,
    gap: 6,
  },
  progressLabel: {
    fontFamily: Fonts.jost,
    fontSize: 13,
    color: Colors.textMuted,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },

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

  fieldLabel: {
    fontFamily: Fonts.jostMedium,
    fontSize: 13,
    color: Colors.text,
    marginBottom: 6,
    marginTop: 2,
  },
  fieldLabelMuted: {
    fontFamily: Fonts.jost,
    color: Colors.textMuted,
    fontSize: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  categoryPillText: {
    fontFamily: Fonts.jostMedium,
    fontSize: 13,
    color: Colors.textMuted,
  },
  categoryPillTextActive: {
    color: Colors.white,
  },
});
