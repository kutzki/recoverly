import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const APP_ITEMS = [
  { id: 'tracker',      label: 'Tracker',       icon: 'analytics-outline',     route: '/(app)/tracker',      desc: 'Monitor your progress'     },
  { id: 'goals',        label: 'Goals',          icon: 'flag-outline',          route: '/(app)/goals',        desc: 'Set and track your goals'  },
  { id: 'inner-circle', label: 'Inner Circle',   icon: 'people-circle-outline', route: '/(app)/inner-circle', desc: 'Your support network'      },
  { id: 'sponsor',      label: 'Sponsor',        icon: 'person-add-outline',    route: '/(app)/sponsor',      desc: 'Connect with your sponsor' },
  { id: 'meetings',     label: 'Meetings',       icon: 'calendar-outline',      route: '/(app)/meetings',     desc: 'Nearby AA/NA meetings'     },
  { id: 'resource-hub', label: 'Resource Hub',   icon: 'library-outline',       route: '/(app)/resource-hub', desc: 'Articles & tools'          },
  { id: 'find-users',   label: 'Find People',    icon: 'search-outline',        route: '/(app)/find-users',   desc: 'Connect with others'       },
  { id: 'settings',     label: 'Settings',       icon: 'settings-outline',      route: '/(app)/settings',     desc: 'App preferences'           },
] as const;

export default function AppsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>All Features</Text>
        <Text style={styles.subheading}>Everything in one place</Text>

        <View style={styles.grid}>
          {APP_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon as any} size={26} color={Colors.primary} />
              </View>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.white },
  scroll:     { flexGrow: 1, paddingHorizontal: 20 },

  heading:    { fontFamily: Fonts.poppinsBold,    fontSize: 24, color: Colors.text,      marginBottom: 4  },
  subheading: { fontFamily: Fonts.jost,            fontSize: 14, color: Colors.textMuted, marginBottom: 24 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  card: {
    width:           '47%',
    backgroundColor: Colors.cardTintPurpleFaint,
    borderRadius:    14,
    padding:         16,
    gap:             8,
    borderWidth:     1,
    borderColor:     Colors.primaryLight,
  },
  iconCircle: {
    width:          46,
    height:         46,
    borderRadius:   23,
    backgroundColor: Colors.primaryLight,
    alignItems:     'center',
    justifyContent: 'center',
  },
  cardLabel: { fontFamily: Fonts.poppinsSemiBold, fontSize: 13, color: Colors.text      },
  cardDesc:  { fontFamily: Fonts.jost,             fontSize: 11, color: Colors.textMuted },
});
