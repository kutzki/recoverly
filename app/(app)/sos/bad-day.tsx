import { SOSResponseScreen } from '../../../components/sos/SOSResponseScreen';
import { Colors } from '../../../constants/colors';

export default function BadDayScreen() {
  return (
    <SOSResponseScreen
      incidentType="bad_day"
      headerTitle="Rough Day"
      headerColor={Colors.sosOrange}
      headerEmoji="😔"
      affirmation="Bad days don't last forever. You've survived 100% of your hardest days so far."
      steps={[
        {
          id: 'breathe',
          label: 'Take 5 deep breaths',
          body: 'Breathe in for 4 counts, hold for 4, out for 6. Repeat 5 times. This activates your parasympathetic nervous system.',
        },
        {
          id: 'reach_out',
          label: 'Call or text someone',
          body: 'You don\'t have to face this alone. Call your sponsor, a friend, or anyone in your inner circle.',
        },
        {
          id: 'grounding',
          label: '5-4-3-2-1 Grounding',
          body: 'Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.',
        },
        {
          id: 'movement',
          label: 'Move your body',
          body: 'A 10-minute walk can significantly shift your mood. Even standing up and stretching helps.',
        },
        {
          id: 'journal',
          label: 'Write it out',
          body: 'Spend 5 minutes writing whatever is on your mind. No structure needed — just get it out.',
        },
      ]}
    />
  );
}
