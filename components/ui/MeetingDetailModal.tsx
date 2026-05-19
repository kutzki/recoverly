import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import {
  Meeting,
  getTimezoneRegion,
  formatMeetingTime,
  formatMeetingDay,
  getTimezoneAbbr,
  FORMAT_LABELS,
  COMMUNITY_LABELS,
  TYPE_LABELS,
  LANGUAGE_LABELS,
} from '../../services/meetings';

export function MeetingDetailModal({
  meeting,
  onClose,
}: {
  meeting: Meeting | null;
  onClose: () => void;
}) {
  if (!meeting) return null;

  const timeStr = formatMeetingTime(meeting.nextEventUTC);
  const tzAbbr = getTimezoneAbbr();
  const dayStr = formatMeetingDay(meeting.nextEventUTC);

  return (
    <Modal
      visible={!!meeting}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={modalStyles.root}>
        {/* Handle bar */}
        <View style={modalStyles.handleBar} />

        {/* Close button */}
        <TouchableOpacity
          style={modalStyles.closeButton}
          onPress={onClose}
          hitSlop={12}
        >
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={modalStyles.content}
        >
          {/* Name */}
          <Text style={modalStyles.name}>{meeting.name}</Text>

          {/* Schedule */}
          <View style={modalStyles.infoRow}>
            <Ionicons name="time-outline" size={18} color={Colors.primary} />
            <Text style={modalStyles.infoText}>
              {dayStr} at {timeStr} {tzAbbr}
              {meeting.duration ? ` · ${meeting.duration} min` : ''}
            </Text>
          </View>

          {/* Timezone */}
          {meeting.timezone && (
            <View style={modalStyles.infoRow}>
              <Ionicons name="globe-outline" size={18} color={Colors.primary} />
              <Text style={modalStyles.infoText}>
                {meeting.timezone} ({getTimezoneRegion(meeting.timezone)})
              </Text>
            </View>
          )}

          {/* Type */}
          {meeting.type && (
            <View style={modalStyles.infoRow}>
              <Ionicons
                name={meeting.type === 'O' ? 'lock-open-outline' : 'lock-closed-outline'}
                size={18}
                color={Colors.primary}
              />
              <Text style={modalStyles.infoText}>
                {TYPE_LABELS[meeting.type]} Meeting
              </Text>
            </View>
          )}

          {/* Language */}
          {meeting.languages && meeting.languages.length > 0 && (
            <View style={modalStyles.infoRow}>
              <Ionicons name="language-outline" size={18} color={Colors.primary} />
              <Text style={modalStyles.infoText}>
                {meeting.languages
                  .map((l) => LANGUAGE_LABELS[l] || l)
                  .join(', ')}
              </Text>
            </View>
          )}

          {/* Formats */}
          {meeting.formats && meeting.formats.length > 0 && (
            <View style={modalStyles.badgeSection}>
              <Text style={modalStyles.badgeLabel}>Format</Text>
              <View style={modalStyles.badgeRow}>
                {meeting.formats.map((f) => (
                  <View key={f} style={modalStyles.badge}>
                    <Text style={modalStyles.badgeText}>
                      {FORMAT_LABELS[f] || f}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Communities */}
          {meeting.communities && meeting.communities.length > 0 && (
            <View style={modalStyles.badgeSection}>
              <Text style={modalStyles.badgeLabel}>Community</Text>
              <View style={modalStyles.badgeRow}>
                {meeting.communities.map((c) => (
                  <View key={c} style={modalStyles.communityBadge}>
                    <Text style={modalStyles.communityBadgeText}>
                      {COMMUNITY_LABELS[c] || c}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Group notes */}
          {meeting.groupNotes && (
            <View style={modalStyles.notesSection}>
              <Text style={modalStyles.notesLabel}>About This Meeting</Text>
              <Text style={modalStyles.notesText}>{meeting.groupNotes}</Text>
            </View>
          )}

          {/* Conference URL notes */}
          {meeting.conference_url_notes && (
            <View style={modalStyles.notesSection}>
              <Text style={modalStyles.notesLabel}>Join Details</Text>
              <Text style={modalStyles.notesText}>
                {meeting.conference_url_notes}
              </Text>
            </View>
          )}

          {/* Phone notes */}
          {meeting.conference_phone_notes && (
            <View style={modalStyles.notesSection}>
              <Text style={modalStyles.notesLabel}>Phone Dial-In</Text>
              <Text style={modalStyles.notesText}>
                {meeting.conference_phone_notes}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom actions */}
        <View style={modalStyles.actions}>
          {meeting.conference_url && (
            <TouchableOpacity
              style={modalStyles.joinButton}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(meeting.conference_url!)}
            >
              <Ionicons name="videocam" size={18} color="#fff" />
              <Text style={modalStyles.joinButtonText}>Join Meeting</Text>
            </TouchableOpacity>
          )}
          {meeting.conference_phone && (
            <TouchableOpacity
              style={modalStyles.phoneButton}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(`tel:${meeting.conference_phone}`)}
            >
              <Ionicons name="call-outline" size={18} color={Colors.primary} />
              <Text style={modalStyles.phoneButtonText}>Call In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
  },
  content: {
    padding: 24,
    paddingTop: 28,
  },

  name: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 22,
    color: Colors.text,
    marginBottom: 20,
    paddingRight: 36,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  infoText: {
    fontFamily: Fonts.jost,
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },

  badgeSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  badgeLabel: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: Colors.cardTintPurpleFaint,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: {
    fontFamily: Fonts.jostMedium,
    fontSize: 13,
    color: Colors.primary,
  },
  communityBadge: {
    backgroundColor: '#FFF0F6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  communityBadgeText: {
    fontFamily: Fonts.jostMedium,
    fontSize: 13,
    color: '#C2185B',
  },

  notesSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  notesLabel: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  notesText: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  joinButtonText: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 15,
    color: '#fff',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  phoneButtonText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 15,
    color: Colors.primary,
  },
});
