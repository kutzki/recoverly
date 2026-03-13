import { SOSResponseScreen } from '../../../components/sos/SOSResponseScreen';
import { Colors } from '../../../constants/colors';

export default function FeelingAnxiousScreen() {
  return (
    <SOSResponseScreen
      incidentType="feeling_anxious"
      headerTitle="Anxiety Support"
      headerColor={Colors.sosPurple}
      headerEmoji="🌊"
      affirmation="Anxiety is a wave — it rises, peaks, and falls. It cannot hurt you. You will get through this."
      steps={[
        {
          id: 'box_breathe',
          label: 'Box breathing (4-4-4-4)',
          body: 'Breathe in for 4 counts, hold for 4, breathe out for 4, hold for 4. Repeat until you feel your heart rate slow.',
        },
        {
          id: 'grounding',
          label: '5-4-3-2-1 Grounding',
          body: 'Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. Stay in the present.',
        },
        {
          id: 'cold_water',
          label: 'Cold water on your wrists',
          body: 'Run cold water over your wrists or splash it on your face. This activates the dive reflex and slows your heart rate.',
        },
        {
          id: 'body_scan',
          label: 'Progressive muscle relaxation',
          body: 'Starting from your feet, tense each muscle group for 5 seconds then release. Work your way up to your head.',
        },
        {
          id: 'reassure',
          label: 'Remind yourself: this will pass',
          body: 'Say aloud: "I am having anxiety. This is temporary. My body is trying to protect me. I am safe right now."',
        },
      ]}
    />
  );
}
