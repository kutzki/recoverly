import { Linking } from 'react-native';
import { SOSResponseScreen } from '../../../components/sos/SOSResponseScreen';
import { Colors } from '../../../constants/colors';

export default function JustRelapsedScreen() {
  return (
    <SOSResponseScreen
      incidentType="just_relapsed"
      headerTitle="Relapse Support"
      headerColor={Colors.sosDark}
      headerEmoji="💔"
      affirmation="Relapse is not failure — it's part of many people's recovery journey. What matters is what you do right now."
      steps={[
        {
          id: 'safety',
          label: 'Make sure you\'re physically safe',
          body: 'If you\'ve taken something dangerous or aren\'t sure, call 911 immediately. Your life is the priority.',
          cta: { label: '🆘 Call 911', action: () => Linking.openURL('tel:911') },
        },
        {
          id: 'no_shame',
          label: 'No shame — just action',
          body: 'Shame will not help you right now. One moment of using does not erase your progress. Focus on the next right action.',
        },
        {
          id: 'tell_sponsor',
          label: 'Tell your sponsor',
          body: 'Call your sponsor as soon as you\'re safe. They\'ve heard this before and are there for you without judgment.',
        },
        {
          id: 'meeting',
          label: 'Find a meeting today',
          body: 'Getting to a meeting — even if it\'s online — today can make a significant difference in what happens next.',
          cta: { label: '📍 Find a Meeting', action: () => Linking.openURL('https://www.aa.org/find-aa') },
        },
        {
          id: 'reset',
          label: 'Reset your sobriety date',
          body: 'When you\'re ready, update your sobriety date in the app. This is a new beginning, not an ending.',
        },
      ]}
    />
  );
}
