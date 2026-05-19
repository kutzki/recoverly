import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { EmptyState } from '@/components/ui/EmptyState';

interface Meeting {
  id: string;
  name: string;
  type: string;
  location: string;
  time: string;
  online: boolean;
}

interface Article {
  id: string;
  title: string;
  emoji: string;
  source: string;
}

// ─── Mock saved items (replace with real store/DB when favorites table exists) ─

const SAVED_MEETINGS: Meeting[] = [];
const SAVED_ARTICLES: Article[] = [];

// ─── Component ────────────────────────────────────────────────────────────────

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const isEmpty = SAVED_MEETINGS.length === 0 && SAVED_ARTICLES.length === 0;

  return (
    <View style={styles.root}>
      {/* Subtle gradient */}
      <LinearGradient
        colors={['rgba(171,49,240,0.08)', 'transparent']}
        style={styles.bgOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll, 
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
          isEmpty && { flex: 1, justifyContent: 'center' }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header content only shows when not empty, OR we can show it above the empty state if preferred. 
            ECC standard suggests that empty states should be self-contained or centered. 
            I'll keep the header visible but style it appropriately. */}
        {!isEmpty && (
          <View style={styles.header}>
            <View>
              <Text style={styles.heading}>Saved</Text>
              <Text style={styles.subheading}>Your bookmarked meetings & resources</Text>
            </View>
            <TouchableOpacity style={styles.searchBtn} hitSlop={12}>
              <Ionicons name="search-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {isEmpty ? (
          <EmptyState
            title="No Favorites Yet"
            description="Start exploring meetings and resources to build your recovery toolkit. Everything you save will appear here."
            actionText="Find Meetings"
            onActionPress={() => router.push('/(app)/meetings' as any)}
          />
        ) : (
          <>
            <SectionHeader 
              title="Meetings" 
              onSeeAll={() => router.push('/(app)/meetings' as any)} 
            />

            {SAVED_MEETINGS.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}

            <SectionHeader 
              title="Articles" 
              marginTop={24}
              onSeeAll={() => router.push('/(app)/resource-hub' as any)} 
            />

            <View style={styles.articlesRow}>
              {SAVED_ARTICLES.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </View>

            <ComingSoon />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  bgOverlay: {
    position: 'absolute', left: 0, top: 0, width: 300, height: 300, zIndex: 0,
  },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28,
  },
  heading: { fontFamily: Fonts.poppinsBold, fontSize: 26, color: Colors.text },
  subheading: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  searchBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.cardTintPurpleFaint,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primaryLight,
  },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
  },
  sectionTitle:  { fontFamily: Fonts.poppinsSemiBold, fontSize: 17, color: Colors.text },
  seeAll:        { fontFamily: Fonts.jostMedium, fontSize: 13, color: Colors.primary },

  // Meeting cards
  meetingCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16, padding: 14, marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  meetingIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: Colors.cardTintPurpleFaint,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  meetingType:    { fontFamily: Fonts.poppinsBold, fontSize: 16, color: Colors.primary },
  meetingInfo:    { flex: 1, gap: 3 },
  meetingName:    { fontFamily: Fonts.poppinsSemiBold, fontSize: 15, color: Colors.text },
  meetingLoc:     { fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted },
  meetingMeta:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meetingTime:    { fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted },
  onlinePill: {
    backgroundColor: '#DCFCE7', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 1, marginLeft: 4,
  },
  onlinePillText: { fontFamily: Fonts.jostMedium, fontSize: 10, color: '#16A34A' },
  heartBtn:       { padding: 4 },

  // Article cards
  articlesRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  articleCard: {
    flex: 1, backgroundColor: Colors.cardTintPurpleFaint,
    borderRadius: 16, padding: 16, gap: 8, position: 'relative',
    borderWidth: 1, borderColor: Colors.primaryLight,
  },
  articleEmoji:  { fontSize: 28 },
  articleTitle:  { fontFamily: Fonts.poppinsSemiBold, fontSize: 13, color: Colors.text, lineHeight: 18 },
  articleSource: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.textMuted },
  articleHeart:  { position: 'absolute', top: 10, right: 10 },

  // Coming soon banner
  comingSoonBanner: {
    borderRadius: 20, padding: 24, alignItems: 'center', gap: 10,
  },
  comingSoonTitle: { fontFamily: Fonts.poppinsBold, fontSize: 16, color: Colors.text },
  comingSoonBody:  {
    fontFamily: Fonts.jost, fontSize: 13, color: Colors.textMuted,
    textAlign: 'center', lineHeight: 20,
  },
});

// ─── Sub-Components ───────────────────────────────────────────────────────────

function SectionHeader({ title, onSeeAll, marginTop }: { title: string; onSeeAll: () => void; marginTop?: number }) {
  return (
    <View style={[styles.sectionHeader, marginTop ? { marginTop } : null]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAll}>See all</Text>
      </TouchableOpacity>
    </View>
  );
}

function MeetingCard({ meeting }: { meeting: Meeting }) {
  return (
    <TouchableOpacity
      style={styles.meetingCard}
      activeOpacity={0.85}
      onPress={() => router.push('/(app)/meetings' as any)}
    >
      <View style={styles.meetingIconWrap}>
        <Text style={styles.meetingType}>{meeting.type}</Text>
      </View>
      <View style={styles.meetingInfo}>
        <Text style={styles.meetingName} numberOfLines={1}>{meeting.name}</Text>
        <Text style={styles.meetingLoc} numberOfLines={1}>{meeting.location}</Text>
        <View style={styles.meetingMeta}>
          <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.meetingTime}>{meeting.time}</Text>
          {meeting.online && (
            <View style={styles.onlinePill}>
              <Text style={styles.onlinePillText}>Online</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.heartBtn} hitSlop={12}>
        <Ionicons name="heart" size={20} color={Colors.accent} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <TouchableOpacity
      style={styles.articleCard}
      activeOpacity={0.85}
      onPress={() => router.push('/(app)/resource-hub' as any)}
    >
      <Text style={styles.articleEmoji}>{article.emoji}</Text>
      <Text style={styles.articleTitle} numberOfLines={3}>{article.title}</Text>
      <Text style={styles.articleSource}>{article.source}</Text>
      <TouchableOpacity style={styles.articleHeart} hitSlop={12}>
        <Ionicons name="heart" size={16} color={Colors.accent} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function ComingSoon() {
  return (
    <LinearGradient
      colors={[Colors.eventGradientStart, Colors.eventGradientEnd]}
      style={styles.comingSoonBanner}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name="bookmark-outline" size={28} color={Colors.primary} />
      <Text style={styles.comingSoonTitle}>More saving coming soon</Text>
      <Text style={styles.comingSoonBody}>
        Save sober pals, resources, and milestones to access them here anytime.
      </Text>
    </LinearGradient>
  );
}
