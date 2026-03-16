import { Linking } from 'react-native';
import { router } from 'expo-router';
import { SOSResponseScreen } from '../../../components/sos/SOSResponseScreen';
import { Colors } from '../../../constants/colors';

export default function FeelLikeUsingScreen() {
  return (
    <SOSResponseScreen
      incidentType="feel_like_using"
      headerTitle="Urge to Use"
      headerColor={Colors.sosRed}
      headerEmoji="🚨"
      affirmation="This craving will pass. Cravings peak and fade — they cannot last forever. You are stronger."
      steps={[
        {
          id: 'delay',
          label: 'Delay for 15 minutes',
          body: 'Tell yourself: I will wait 15 minutes before doing anything. Most cravings peak and pass within 15-20 minutes.',
        },
        {
          id: 'call_sponsor',
          label: 'Call your sponsor NOW',
          body: 'This is exactly the moment your sponsor is there for. Pick up the phone and call them immediately.',
          cta: { label: '📞 Open Sponsor Screen', action: () => router.push('/(app)/sponsor' as any) },
        },
        {
          id: 'urge_surf',
          label: 'Urge surfing',
          body: 'Observe the craving like a wave. Don\'t fight it — watch it rise, peak, and then recede. You are not the craving.',
        },
        {
          id: 'leave',
          label: 'Change your environment',
          body: 'Physically leave where you are. Go to a coffee shop, a park, anywhere that isn\'t where the urge started.',
        },
        {
          id: 'helpline',
          label: 'Call SAMHSA Helpline',
          body: 'Free, confidential, 24/7 — 1-800-662-4357. They are there specifically for moments like this.',
          cta: { label: '📞 Call Now (Free)', action: () => Linking.openURL('tel:18006624357') },
        },
      ]}
    />
  );
}
