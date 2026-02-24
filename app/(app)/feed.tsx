import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Modal,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import {
  getTimelineFeed,
  getOwnFeed,
  postActivity,
  addReaction,
  addComment,
  getComments,
  getStreamFeedClient,
  ActivityType,
} from '../../services/streamFeed';
import { useAuthStore } from '../../store/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

// getstream v8 with enrich:true returns actor as an enriched object {id, data}
// getstream v5/legacy returns actor as a plain "SU:userId" string
type EnrichedActor = { id: string; data?: { name?: string; [key: string]: any }; [key: string]: any };

interface FeedActivity {
  id: string;
  verb: ActivityType;
  actor: string | EnrichedActor;
  actor_name?: string;
  text?: string;
  time?: string;
  reaction_counts?: Record<string, number>;
  own_reactions?: Record<string, any[]>;
}

interface Comment {
  id: string;
  data: { text: string; author_name?: string };
  created_at: string;
  user_id?: string;
}

// Extract userId from actor — handles both getstream v5 plain strings ("SU:userId")
// and getstream v8 enriched objects ({ id: "SU:userId", data: { name: ... } })
function extractUserId(actor: string | EnrichedActor | null | undefined): string {
  if (!actor) return '';
  if (typeof actor === 'object') {
    const id = (actor as EnrichedActor).id ?? '';
    return typeof id === 'string' && id.startsWith('SU:') ? id.slice(3) : String(id);
  }
  const s = actor as string;
  return s.startsWith('SU:') ? s.slice(3) : s;
}

// Extract display name from actor — enriched object exposes it in actor.data.name
function extractActorName(
  actor: string | EnrichedActor | null | undefined,
  actorNameField?: string,
): string {
  if (actorNameField) return actorNameField;
  if (!actor) return 'Community Member';
  if (typeof actor === 'object') {
    return (actor as EnrichedActor).data?.name || 'Community Member';
  }
  // plain string format — just the raw id, no useful display name
  const id = extractUserId(actor as string);
  return id || 'Community Member';
}

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Comments Modal ───────────────────────────────────────────────────────────

function CommentsModal({ visible, activityId, activityText, userName, onClose }: {
  visible: boolean;
  activityId: string;
  activityText?: string;
  userName: string;
  onClose: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    getComments(activityId).then(r => {
      setComments(r as Comment[]);
      setLoading(false);
    });
  }, [visible, activityId]);

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await addComment(activityId, text.trim(), userName);
      const newComment: Comment = {
        id: Date.now().toString(),
        data: { text: text.trim(), author_name: userName },
        created_at: new Date().toISOString(),
      };
      setComments(prev => [...prev, newComment]);
      setText('');
    } catch {
      Alert.alert('Error', 'Could not post comment. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView style={cm.safe}>
          <View style={cm.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
            <Text style={cm.title}>Comments</Text>
            <View style={{ width: 32 }} />
          </View>

          {activityText ? (
            <View style={cm.postPreview}>
              <Text style={cm.postPreviewText} numberOfLines={2}>{activityText}</Text>
            </View>
          ) : null}

          {loading ? (
            <View style={cm.centered}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : (
            <ScrollView style={cm.list} contentContainerStyle={cm.listContent}>
              {comments.length === 0 ? (
                <View style={cm.empty}>
                  <Text style={cm.emptyText}>No comments yet. Be the first!</Text>
                </View>
              ) : (
                comments.map(c => (
                  <View key={c.id} style={cm.commentRow}>
                    <View style={cm.commentAvatar}>
                      <Text style={cm.commentInitial}>
                        {(c.data.author_name || 'A')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={cm.commentBody}>
                      <Text style={cm.commentAuthor}>{c.data.author_name || 'Anonymous'}</Text>
                      <Text style={cm.commentText}>{c.data.text}</Text>
                      <Text style={cm.commentTime}>{timeAgo(c.created_at)}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}

          <View style={cm.inputRow}>
            <TextInput
              style={cm.input}
              value={text}
              onChangeText={setText}
              placeholder="Add a comment…"
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={300}
            />
            <TouchableOpacity
              style={[cm.sendBtn, (!text.trim() || posting) && cm.sendBtnDisabled]}
              onPress={handlePost}
              disabled={!text.trim() || posting}
            >
              {posting
                ? <ActivityIndicator size="small" color={Colors.white} />
                : <Ionicons name="send" size={18} color={Colors.white} />
              }
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Activity Card ────────────────────────────────────────────────────────────

function ActivityItem({
  activity,
  currentUserId,
  currentUserName,
  onLike,
}: {
  activity: FeedActivity;
  currentUserId: string;
  currentUserName: string;
  onLike: (id: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const actorName = extractActorName(activity.actor, activity.actor_name);
  const initial = actorName[0]?.toUpperCase() ?? '?';
  const likeCount = activity.reaction_counts?.like ?? 0;
  const commentCount = activity.reaction_counts?.comment ?? 0;
  const liked = (activity.own_reactions?.like?.length ?? 0) > 0;
  const actorUserId = extractUserId(activity.actor);
  const isOwnPost = actorUserId === currentUserId;

  const iconMap: Record<ActivityType, string> = {
    milestone: 'trophy-outline',
    checkin: 'checkmark-circle-outline',
    post: 'chatbubble-outline',
  };
  const colorMap: Record<ActivityType, string> = {
    milestone: '#F59E0B',
    checkin: Colors.primary,
    post: '#06B6D4',
  };
  const labelMap: Record<ActivityType, string> = {
    milestone: 'Milestone',
    checkin: 'Check-in',
    post: 'Post',
  };

  const color = colorMap[activity.verb] ?? Colors.primary;
  const label = labelMap[activity.verb] ?? activity.verb;
  const icon = iconMap[activity.verb] ?? 'alert-circle-outline';

  const handleAvatarPress = () => {
    if (isOwnPost) {
      router.push('/(app)/profile' as any);
    } else {
      router.push({ pathname: '/(app)/user/[userId]' as any, params: { userId: actorUserId } });
    }
  };

  return (
    <View style={card.container}>
      <View style={card.topRow}>
        <TouchableOpacity style={card.avatar} onPress={handleAvatarPress} activeOpacity={0.8}>
          <Text style={card.avatarText}>{initial}</Text>
        </TouchableOpacity>
        <View style={card.meta}>
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
            <Text style={card.actorName}>{actorName}</Text>
          </TouchableOpacity>
          <Text style={card.time}>{timeAgo(activity.time)}</Text>
        </View>
        <View style={[card.badge, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon as any} size={13} color={color} />
          <Text style={[card.badgeText, { color }]}>{label}</Text>
        </View>
      </View>

      {activity.text ? <Text style={card.body}>{activity.text}</Text> : null}

      <View style={card.actions}>
        <TouchableOpacity style={card.actionBtn} onPress={() => onLike(activity.id)} activeOpacity={0.7}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? '#EF4444' : Colors.textMuted} />
          {likeCount > 0 && <Text style={[card.actionCount, liked && { color: '#EF4444' }]}>{likeCount}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={card.actionBtn} onPress={() => setShowComments(true)} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={17} color={Colors.textMuted} />
          {commentCount > 0 && <Text style={card.actionCount}>{commentCount}</Text>}
          <Text style={card.actionLabel}>Comment</Text>
        </TouchableOpacity>
      </View>

      <CommentsModal
        visible={showComments}
        activityId={activity.id}
        activityText={activity.text}
        userName={currentUserName}
        onClose={() => setShowComments(false)}
      />
    </View>
  );
}

// ─── Compose Modal ────────────────────────────────────────────────────────────

function ComposeModal({ visible, userId, userName, onClose, onPosted }: {
  visible: boolean;
  userId: string;
  userName: string;
  onClose: () => void;
  onPosted: () => void;
}) {
  const [text, setText] = useState('');
  const [type, setType] = useState<ActivityType>('post');
  const [posting, setPosting] = useState(false);

  const typeOptions: { key: ActivityType; label: string; icon: string }[] = [
    { key: 'post', label: 'Post', icon: 'chatbubble-outline' },
    { key: 'checkin', label: 'Check-in', icon: 'checkmark-circle-outline' },
    { key: 'milestone', label: 'Milestone', icon: 'trophy-outline' },
  ];

  const submit = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await postActivity({ text: text.trim(), type, userId, userName });
      setText('');
      onPosted();
      onClose();
    } catch (err: any) {
      Alert.alert('Post Failed', err?.message ?? 'Could not post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={compose.safe}>
          <View style={compose.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={compose.cancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={compose.title}>New Post</Text>
            <TouchableOpacity
              onPress={submit}
              disabled={!text.trim() || posting}
              style={[compose.postBtn, (!text.trim() || posting) && compose.postBtnDisabled]}
            >
              {posting
                ? <ActivityIndicator size="small" color={Colors.white} />
                : <Text style={compose.postBtnText}>Post</Text>
              }
            </TouchableOpacity>
          </View>
          <View style={compose.typeRow}>
            {typeOptions.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[compose.typeBtn, type === opt.key && compose.typeBtnActive]}
                onPress={() => setType(opt.key)}
              >
                <Ionicons name={opt.icon as any} size={16} color={type === opt.key ? Colors.primary : Colors.textMuted} />
                <Text style={[compose.typeBtnLabel, type === opt.key && compose.typeBtnLabelActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={compose.input}
            placeholder={
              type === 'checkin' ? 'How are you feeling today?'
              : type === 'milestone' ? 'Share your milestone!'
              : 'Share something with the community…'
            }
            placeholderTextColor={Colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
            maxLength={500}
          />
          <Text style={compose.charCount}>{text.length}/500</Text>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Feed Screen ─────────────────────────────────────────────────────────

export default function Feed() {
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<FeedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [composeVisible, setComposeVisible] = useState(false);
  const [error, setError] = useState(false);
  const loadAttempts = React.useRef(0);
  // Tracks whether the initial mount load has fired — prevents useFocusEffect
  // from triggering a duplicate concurrent fetch on the very first screen focus.
  const initialLoadDone = React.useRef(false);
  const loadFeed = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    loadAttempts.current += 1;
    // Re-read client inside the callback so we always get the latest reference
    const feedClient = getStreamFeedClient();
    if (!feedClient) {
      setLoading(false);
      setRefreshing(false);
      // On retry (attempt > 1), surface an error instead of silently returning
      if (loadAttempts.current > 1) setError(true);
      return;
    }
    try {
      setError(false);
      const results = await getTimelineFeed(user.id, 30);
      const data = results.length ? results : await getOwnFeed(user.id, 30);
      setActivities(data as FeedActivity[]);
    } catch (err) {
      console.warn('[Feed] load error:', err);
      setError(true);
      setActivities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadFeed().finally(() => { initialLoadDone.current = true; });
  }, [loadFeed]);

  // Reload feed whenever this tab comes back into focus (e.g. after posting from tracker).
  // Skip the very first focus event because useEffect above already handles the initial load.
  useFocusEffect(
    useCallback(() => {
      if (!initialLoadDone.current) return; // initial load still in flight
      loadFeed();
    }, [loadFeed])
  );

  const onLike = useCallback(async (activityId: string) => {
    try {
      await addReaction(activityId, 'like');
      setActivities(prev =>
        prev.map(a =>
          a.id === activityId
            ? {
                ...a,
                reaction_counts: { ...a.reaction_counts, like: (a.reaction_counts?.like ?? 0) + 1 },
                own_reactions: { ...a.own_reactions, like: [{}] },
              }
            : a
        )
      );
    } catch {}
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Feed</Text>
        <TouchableOpacity style={styles.composeBtn} onPress={() => setComposeVisible(true)} accessibilityLabel="Create a new post">
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {!getStreamFeedClient() ? (
        <View style={styles.centered}>
          <Ionicons name="people-outline" size={52} color={Colors.primaryLight} />
          <Text style={styles.emptyTitle}>Feed Coming Soon</Text>
          <Text style={styles.emptySubtitle}>Add your Stream App ID to constants/stream.ts to enable the activity feed.</Text>
        </View>
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={52} color={Colors.primaryLight} />
          <Text style={styles.emptyTitle}>Couldn't load feed</Text>
          <Text style={styles.emptySubtitle}>Check your connection and try again.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); loadFeed(); }}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={a => a.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadFeed(); }}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item }) => (
            <ActivityItem
              activity={item}
              currentUserId={user?.id || ''}
              currentUserName={user?.name || ''}
              onLike={onLike}
            />
          )}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="people-outline" size={52} color={Colors.primaryLight} />
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptySubtitle}>Follow others or share your own post to get started.</Text>
              <TouchableOpacity style={styles.postFirstBtn} onPress={() => setComposeVisible(true)}>
                <Text style={styles.postFirstBtnText}>Share your first post</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {user && (
        <ComposeModal
          visible={composeVisible}
          userId={user.id}
          userName={user.name}
          onClose={() => setComposeVisible(false)}
          onPosted={loadFeed}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  title: { fontSize: 20, fontWeight: '800', color: Colors.text },
  composeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  postFirstBtn: { marginTop: 8, backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  postFirstBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  retryBtn: { marginTop: 8, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  list: { paddingVertical: 8, flexGrow: 1 },
});

const card = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    marginHorizontal: 12,
    marginVertical: 5,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  meta: { flex: 1 },
  actorName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  time: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  body: { fontSize: 14, color: Colors.text, lineHeight: 21, marginBottom: 8 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    gap: 16,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionCount: { fontSize: 13, color: Colors.textMuted },
  actionLabel: { fontSize: 13, color: Colors.textMuted },
});

const compose = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cancel: { fontSize: 16, color: Colors.textMuted },
  title: { fontSize: 17, fontWeight: '700', color: Colors.text },
  postBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 7 },
  postBtnDisabled: { opacity: 0.5 },
  postBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  typeRow: { flexDirection: 'row', gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  typeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  typeBtnActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  typeBtnLabel: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  typeBtnLabelActive: { color: Colors.primary, fontWeight: '700' },
  input: { flex: 1, padding: 16, fontSize: 16, color: Colors.text, textAlignVertical: 'top', lineHeight: 24 },
  charCount: { textAlign: 'right', paddingHorizontal: 16, paddingBottom: 8, fontSize: 12, color: Colors.textMuted },
});

const cm = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: 17, fontWeight: '700', color: Colors.text },
  postPreview: { backgroundColor: Colors.background, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  postPreviewText: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { flex: 1 },
  listContent: { padding: 16, gap: 14 },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: Colors.textMuted },
  commentRow: { flexDirection: 'row', gap: 10 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  commentInitial: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  commentBody: { flex: 1 },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: Colors.text },
  commentText: { fontSize: 14, color: Colors.text, marginTop: 2, lineHeight: 20 },
  commentTime: { fontSize: 11, color: Colors.textMuted, marginTop: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border, gap: 8 },
  input: { flex: 1, backgroundColor: Colors.background, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: Colors.text, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
});
