import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useUIStore } from '../../store/ui';
import { useProgressStore } from '../../store/progress';
import { useAuthStore } from '../../store/auth';
import { journalService, JournalEntry } from '../../services/journal';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const { width } = Dimensions.get('window');

// ─── Calendar helpers ─────────────────────────────────────────────────────────

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type CalendarDay = {
  id: string;
  dayLabel: string;
  date: string;     // display day number
  fullDate: string; // ISO yyyy-mm-dd
  isToday: boolean;
  isFuture: boolean;
};

function buildCalendarDays(): CalendarDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result: CalendarDay[] = [];

  // 2 days before + today + 2 days ahead = 5 slots
  for (let i = -2; i <= 2; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push({
      id: String(i + 2),
      dayLabel: DAY_LETTERS[d.getDay()],
      date: String(d.getDate()),
      fullDate: d.toISOString().slice(0, 10),
      isToday: i === 0,
      isFuture: i > 0,
    });
  }
  return result;
}

// ─── Mood constants ───────────────────────────────────────────────────────────

const EMOJI_OPTIONS = [
  { id: 'angry',   emoji: '😡', label: 'Angry'   },
  { id: 'anxious', emoji: '😰', label: 'Anxious' },
  { id: 'happy',   emoji: '😄', label: 'Happy'   },
  { id: 'calm',    emoji: '😌', label: 'Calm'    },
  { id: 'sad',     emoji: '😢', label: 'Sad'     },
];

// ─── Date formatting ──────────────────────────────────────────────────────────

function formatEntryDate(iso: string): { day: string; date: string } {
  const d = new Date(iso);
  return {
    day:  d.toLocaleDateString('en-US', { weekday: 'long' }),
    date: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();
  const openMenu    = useUIStore((s) => s.openMenu);
  const openJournal = useUIStore((s) => s.openJournal);
  const user        = useAuthStore((s) => s.user);
  const weeklyStreak = useProgressStore((s) => s.weeklyStreak);

  const [selectedEmotion, setSelectedEmotion] = useState('happy');
  const [calendarDays]   = useState<CalendarDay[]>(buildCalendarDays);
  const [journals, setJournals]   = useState<JournalEntry[]>([]);
  const [journalLoading, setJournalLoading] = useState(true);

  // Load real journal entries
  useEffect(() => {
    if (!user?.id) {
      setJournalLoading(false);
      return;
    }
    journalService.getEntries(user.id)
      .then((entries) => setJournals(entries.slice(0, 5))) // show latest 5
      .catch(() => {})
      .finally(() => setJournalLoading(false));
  }, [user?.id]);

  // Map today's weeklyStreak to know which past days were checked in
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={openMenu} style={[styles.iconBtn, { backgroundColor: 'transparent' }]}>
          <Ionicons name="menu" size={28} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Title Area */}
        <View style={styles.titleArea}>
          <Text style={styles.mainTitle}>Daily Check-In</Text>
          <Text style={styles.subTitle}>You're doing amazing, keep up the great work!</Text>
        </View>

        {/* Calendar Strip — real rolling 5-day window */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarStrip}>
          {calendarDays.map((d) => {
            // Match weeklyStreak for past days — rough mapping
            const dayOfWeek = new Date(d.fullDate).getDay();
            const strIdx = (dayOfWeek + 6) % 7;
            const checkedIn = !d.isFuture && weeklyStreak[strIdx];

            return (
              <View
                key={d.id}
                style={[
                  styles.dayCard,
                  d.isToday   && styles.dayCardToday,
                  d.isFuture  && styles.dayCardFuture,
                  !d.isToday && !d.isFuture && styles.dayCardPast,
                ]}
              >
                <Text style={[styles.dayLabel, d.isToday && { color: Colors.white }]}>{d.dayLabel}</Text>
                <Text style={[styles.dateLabel, d.isToday && { color: Colors.white }]}>{d.date}</Text>
                <View style={styles.emojiSlot}>
                  {!d.isFuture && (
                    <Text style={styles.dayEmoji}>{checkedIn ? '😄' : '😴'}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* How are you feeling card */}
        <View style={styles.feelingCard}>
          <Text style={styles.feelingTitle}>How are you feeling today?</Text>

          <View style={styles.waveBanner}>
            <Svg height="100%" width="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
              <Path
                d="M0 40 Q25 20 50 40 T100 40 L100 60 Q75 80 50 60 T0 60 Z"
                fill="#aa44ff"
                opacity={0.8}
              />
            </Svg>

            <View style={styles.emojiRow}>
              {EMOJI_OPTIONS.map((opt) => {
                const isSelected = selectedEmotion === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedEmotion(opt.id)}
                    style={[styles.feelBtn, isSelected && styles.feelBtnSelected]}
                  >
                    <Text style={[styles.feelEmoji, isSelected && { fontSize: 44 }]}>{opt.emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Text style={styles.feelingLabel}>
            {EMOJI_OPTIONS.find((o) => o.id === selectedEmotion)?.label || 'Happy'}
          </Text>

          <TouchableOpacity 
            style={styles.trackBtn} 
            onPress={() => {
              useProgressStore.getState().markTodayCheckedIn(user?.id);
              Alert.alert('Awesome!', "You've checked in for the day!");
            }}
          >
            <Text style={styles.trackBtnText}>Check In Daily Mood</Text>
          </TouchableOpacity>
        </View>

        {/* Journal Entries Header */}
        <View style={styles.journalHeader}>
          <Text style={styles.journalTitle}>Journal Entries</Text>
          <TouchableOpacity style={styles.addJournalBtn} onPress={openJournal}>
            <Ionicons name="add" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Journal Entries List */}
        {journalLoading ? (
          <View style={styles.journalLoadingWrap}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : journals.length === 0 ? (
          <View style={styles.journalEmptyWrap}>
            <Text style={styles.journalEmptyText}>No journal entries yet. Tap + to write your first one.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.journalStrip}>
            {journals.map((j) => {
              const { day, date } = formatEntryDate(j.created_at);
              const emojiMap: Record<string, string> = { angry: '😡', anxious: '😰', happy: '😄', calm: '😌', sad: '😢', neutral: '😐', cool: '😎' };
              const moodEmoji = emojiMap[j.mood] || '😄';
              return (
                <View key={j.id} style={styles.journalCard}>
                  <View style={styles.journalCardTop}>
                    <Text style={styles.journalCardTitle}>{j.title || 'Untitled'}</Text>
                    <Text style={styles.journalCardTime}>
                      {new Date(j.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={styles.journalCardBody} numberOfLines={5}>{j.body || ''}</Text>
                  <View style={styles.journalCardBottom}>
                    <View style={styles.journalCardEmojiCircle}>
                      <Text style={styles.journalCardEmoji}>{moodEmoji}</Text>
                    </View>
                    <View style={styles.journalCardDateData}>
                      <Text style={styles.journalCardDay}>{day}</Text>
                      <Text style={styles.journalCardDate}>{date}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  titleArea: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  mainTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 28,
    color: '#3B0061',
    marginBottom: 4,
  },
  subTitle: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: '#8CA0B3',
  },
  calendarStrip: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  dayCard: {
    width: 60,
    height: 90,
    borderRadius: 30,
    alignItems: 'center',
    paddingVertical: 12,
  },
  dayCardToday: {
    backgroundColor: '#b740ff',
  },
  dayCardFuture: {
    borderWidth: 1,
    borderColor: '#C1E6F5',
    borderStyle: 'dashed',
  },
  dayCardPast: {
    backgroundColor: '#F8F5FF',
  },
  dayLabel: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 14,
    color: Colors.text,
  },
  dateLabel: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
  },
  emojiSlot: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayEmoji: {
    fontSize: 20,
  },
  feelingCard: {
    backgroundColor: '#E7CFFF',
    marginHorizontal: 24,
    borderRadius: 24,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 32,
    overflow: 'hidden',
  },
  feelingTitle: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 18,
    color: Colors.text,
    marginBottom: 24,
  },
  waveBanner: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    marginBottom: 24,
  },
  emojiRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  feelBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feelBtnSelected: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FAF5FF',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  feelEmoji: {
    fontSize: 32,
  },
  feelingLabel: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.text,
  },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  journalTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.text,
  },
  addJournalBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#C8F2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalStrip: {
    paddingHorizontal: 24,
    gap: 16,
  },
  journalCard: {
    width: width * 0.65,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  journalCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  journalCardTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  journalCardTime: {
    fontFamily: Fonts.jost,
    fontSize: 12,
    color: Colors.textLight,
  },
  journalCardBody: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 20,
  },
  journalCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  journalCardEmojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalCardEmoji: {
    fontSize: 20,
  },
  journalCardDateData: {
    alignItems: 'flex-end',
  },
  journalCardDay: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 14,
    color: Colors.text,
  },
  journalCardDate: {
    fontFamily: Fonts.jost,
    fontSize: 12,
    color: Colors.textLight,
  },
  journalLoadingWrap: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  journalEmptyWrap: {
    marginHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: Colors.cardTintPurpleFaint,
    borderRadius: 16,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  journalEmptyText: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  trackBtn: {
    backgroundColor: '#b740ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
  },
  trackBtnText: {
    fontFamily: Fonts.poppinsMedium,
    color: Colors.white,
    fontSize: 16,
  },
});
