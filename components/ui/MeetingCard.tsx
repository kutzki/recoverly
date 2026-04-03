import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import {
  Meeting,
  FORMAT_LABELS,
  COMMUNITY_LABELS,
  TYPE_LABELS,
  formatMeetingTime,
  getTimezoneAbbr,
} from '../../services/meetings';

interface MeetingCardProps {
  meeting: Meeting;
  onPress?: (meeting: Meeting) => void;
}

export function MeetingCard({ meeting, onPress }: MeetingCardProps) {
  const timeStr = formatMeetingTime(meeting.nextEventUTC);
  const tzAbbr = getTimezoneAbbr();
  const typeLabel = meeting.type ? TYPE_LABELS[meeting.type] : null;
  const isOpen = meeting.type === 'O';

  const handleJoin = () => {
    if (meeting.conference_url) {
      Linking.openURL(meeting.conference_url);
    }
  };

  const handlePhone = () => {
    if (meeting.conference_phone) {
      Linking.openURL(`tel:${meeting.conference_phone}`);
    }
  };

  // Collect visible badges (max 3 to avoid overflow)
  const formatBadges = meeting.formats
    .map((f) => FORMAT_LABELS[f])
    .filter(Boolean)
    .slice(0, 2);
  const communityBadges = meeting.communities
    .map((c) => COMMUNITY_LABELS[c])
    .filter(Boolean)
    .slice(0, 2);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress?.(meeting)}
    >
      {/* Top row: time + type */}
      <View style={styles.topRow}>
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={14} color={Colors.primary} />
          <Text style={styles.timeText}>
            {timeStr} {tzAbbr}
          </Text>
          {meeting.duration ? (
            <Text style={styles.durationText}>{meeting.duration} min</Text>
          ) : null}
        </View>
        {typeLabel ? (
          <View style={[styles.typeBadge, isOpen ? styles.typeBadgeOpen : styles.typeBadgeClosed]}>
            <Text style={[styles.typeBadgeText, isOpen ? styles.typeBadgeTextOpen : styles.typeBadgeTextClosed]}>
              {typeLabel}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Meeting name */}
      <Text style={styles.name} numberOfLines={2}>
        {meeting.name}
      </Text>

      {/* Badges row */}
      {(formatBadges.length > 0 || communityBadges.length > 0) && (
        <View style={styles.badgesRow}>
          {formatBadges.map((label) => (
            <View key={label} style={styles.formatBadge}>
              <Text style={styles.formatBadgeText}>{label}</Text>
            </View>
          ))}
          {communityBadges.map((label) => (
            <View key={label} style={styles.communityBadge}>
              <Text style={styles.communityBadgeText}>{label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        {meeting.conference_url ? (
          <TouchableOpacity
            style={styles.joinButton}
            activeOpacity={0.8}
            onPress={handleJoin}
            hitSlop={8}
          >
            <Ionicons name="videocam" size={16} color="#fff" />
            <Text style={styles.joinButtonText}>Join Meeting</Text>
          </TouchableOpacity>
        ) : null}
        {meeting.conference_phone ? (
          <TouchableOpacity
            style={styles.phoneButton}
            activeOpacity={0.8}
            onPress={handlePhone}
            hitSlop={8}
          >
            <Ionicons name="call-outline" size={16} color={Colors.primary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Top row
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 13,
    color: Colors.primary,
  },
  durationText: {
    fontFamily: Fonts.jost,
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 4,
  },

  // Type badge
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  typeBadgeOpen: {
    backgroundColor: '#E8F5E9',
  },
  typeBadgeClosed: {
    backgroundColor: '#FFF3E0',
  },
  typeBadgeText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 11,
  },
  typeBadgeTextOpen: {
    color: '#2E7D32',
  },
  typeBadgeTextClosed: {
    color: '#E65100',
  },

  // Name
  name: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 22,
  },

  // Badges
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  formatBadge: {
    backgroundColor: Colors.cardTintPurpleFaint || '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  formatBadgeText: {
    fontFamily: Fonts.jost,
    fontSize: 11,
    color: Colors.primary,
  },
  communityBadge: {
    backgroundColor: '#FFF0F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  communityBadgeText: {
    fontFamily: Fonts.jost,
    fontSize: 11,
    color: '#C2185B',
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  joinButtonText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 13,
    color: '#fff',
  },
  phoneButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
