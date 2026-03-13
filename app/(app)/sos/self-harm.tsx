import { Linking } from 'react-native';
import { SOSResponseScreen } from '../../../components/sos/SOSResponseScreen';

export default function SelfHarmScreen() {
  return (
    <SOSResponseScreen
      incidentType="self_harm"
      headerTitle="You Are Not Alone"
      headerColor="#FF3B30"
      headerEmoji="🆘"
      affirmation="These feelings are real and overwhelming, but they are not permanent. Help is available right now."
      steps={[
        {
          id: 'call_988',
          label: 'Call or text 988 — right now',
          body: 'The 988 Suicide & Crisis Lifeline is free, confidential, and available 24/7. Please call or text 988 immediately.',
          cta: { label: '📞 Call 988 Now', action: () => Linking.openURL('tel:988') },
        },
        {
          id: 'text_crisis',
          label: 'Text HOME to 741741',
          body: 'Crisis Text Line connects you with a trained crisis counselor via text. Available 24/7, completely free.',
          cta: { label: '💬 Text 741741', action: () => Linking.openURL('sms:741741') },
        },
        {
          id: 'safe_space',
          label: 'Move to a safe space',
          body: 'Go somewhere you\'re not alone — a public place, a neighbor, anywhere with other people present.',
        },
        {
          id: 'tell_someone',
          label: 'Tell someone near you',
          body: 'Tell a trusted person what you\'re experiencing. You don\'t have to face this moment alone.',
        },
      ]}
    />
  );
}
