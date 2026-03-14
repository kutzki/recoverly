import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { fetchNearbyMeetings, meetingDayTime, type Meeting } from '../../services/meetings';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Status = 'idle' | 'requesting' | 'loading' | 'done' | 'denied' | 'error';

export default function MeetingsScreen() {
  const insets = useSafeAreaInsets();

  const [status,   setStatus]   = useState<Status>('idle');
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const load = useCallback(async () => {
    setStatus('requesting');
    const { status: perm } = await Location.requestForegroundPermissionsAsync();
    if (perm !== 'granted') {
      setStatus('denied');
      return;
    }
    setStatus('loading');
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const data = await fetchNearbyMeetings(loc.coords.latitude, loc.coords.longitude, 20);
      setMeetings(data);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, []);

  const openMaps = (m: Meeting) => {
    const q = encodeURIComponent(`${m.address} ${m.city} ${m.state}`.trim());
    Linking.openURL(`https://maps.google.com/?q=${q}`);
  };

  const renderMeeting = ({ item: m }: { item: Meeting }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => openMaps(m)}>
      <View style={styles.cardLeft}>
        <View style={styles.dayBadge}>
          <Text style={styles.dayBadgeText}>{DAY_SHORT[m.day] ?? '—'}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.meetingName} numberOfLines={1}>{m.name}</Text>
        {(m.location || m.address) ? (
          <Text style={styles.meetingAddress} numberOfLines={1}>
            {m.location || m.address}
          </Text>
        ) : null}
        <Text style={styles.meetingCity} numberOfLines={1}>
          {m.city && m.state ? `${m.city}, ${m.state}` : (m.city || m.state)}
        </Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.meetingTime}>{meetingDayTime(m).split(' ').slice(1).join(' ')}</Text>
        <Ionicons name="open-outline" size={16} color={Colors.textLight} style={{ marginTop: 4 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.heading}>Nearby Meetings</Text>
      <Text style={styles.subheading}>AA/NA meetings within 20 miles</Text>

      {status === 'requesting' || status === 'loading' ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {status === 'requesting' ? 'Getting your location…' : 'Finding meetings near you…'}
          </Text>
        </View>
      ) : status === 'denied' ? (
        <View style={styles.center}>
          <Ionicons name="location-outline" size={52} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>Location Access Needed</Text>
          <Text style={styles.emptyText}>
            Allow location access to find meetings near you, or browse these resources below.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={() => Location.requestForegroundPermissionsAsync().then(load)}>
            <Text style={styles.permBtnText}>Allow Location</Text>
          </TouchableOpacity>
          <View style={styles.fallbackLinks}>
            {[
              { label: 'AA Meeting Finder',   url: 'https://www.aa.org/find-aa' },
              { label: 'NA Meeting Finder',   url: 'https://www.na.org/meetingsearch/' },
              { label: 'SAMHSA Helpline',     url: 'https://www.samhsa.gov/find-help/national-helpline' },
            ].map((r) => (
              <TouchableOpacity key={r.label} style={styles.fallbackLink} onPress={() => Linking.openURL(r.url)}>
                <Ionicons name="globe-outline" size={18} color={Colors.primary} />
                <Text style={styles.fallbackLinkText}>{r.label}</Text>
                <Ionicons name="open-outline" size={14} color={Colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : status === 'error' ? (
        <View style={styles.center}>
          <Ionicons name="wifi-outline" size={52} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>Couldn't load meetings</Text>
          <Text style={styles.emptyText}>Check your connection and try again.</Text>
          <TouchableOpacity style={styles.permBtn} onPress={load}>
            <Text style={styles.permBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : meetings.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={52} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No meetings found nearby</Text>
          <Text style={styles.emptyText}>Try searching a wider area on aa.org or na.org.</Text>
          <TouchableOpacity style={styles.permBtn} onPress={() => Linking.openURL('https://www.aa.org/find-aa')}>
            <Text style={styles.permBtnText}>Search on AA.org</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={meetings}
          keyExtractor={(m) => m.id}
          renderItem={renderMeeting}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.white, paddingHorizontal: 24 },
  heading:    { fontFamily: Fonts.poppinsBold, fontSize: 24, color: Colors.text, marginBottom: 4 },
  subheading: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, marginBottom: 20 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  loadingText: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, marginTop: 16 },
  emptyTitle: { fontFamily: Fonts.poppinsBold, fontSize: 18, color: Colors.text, marginTop: 16, marginBottom: 8 },
  emptyText:  { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 21, marginBottom: 20 },

  permBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 28,
    marginBottom: 16,
  },
  permBtnText: { fontFamily: Fonts.poppinsSemiBold, fontSize: 15, color: Colors.white },

  fallbackLinks: { width: '100%', gap: 10, marginTop: 8 },
  fallbackLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.cardTintPurpleFaint,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  fallbackLinkText: { flex: 1, fontFamily: Fonts.poppinsMedium, fontSize: 14, color: Colors.text },

  list: { paddingBottom: 32 },
  separator: { height: 10 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardTintPurpleFaint,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    padding: 14,
    gap: 12,
  },
  cardLeft: { alignItems: 'center' },
  dayBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeText: { fontFamily: Fonts.poppinsBold, fontSize: 12, color: Colors.primary },
  cardBody: { flex: 1 },
  meetingName:    { fontFamily: Fonts.poppinsSemiBold, fontSize: 14, color: Colors.text, marginBottom: 2 },
  meetingAddress: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted },
  meetingCity:    { fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted },
  cardRight: { alignItems: 'flex-end' },
  meetingTime: { fontFamily: Fonts.poppinsMedium, fontSize: 12, color: Colors.primary },
});
