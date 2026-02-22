import React from 'react';
import { SOSResponseScreen } from '../../../components/sos/SOSResponseScreen';

export default function BadDay() {
  return (
    <SOSResponseScreen
      title="Having a Bad Day"
      subtitle="Bad days are temporary. You've made it through every hard day so far."
      accentColor="#778CA3"
      headerIcon="cloudy-outline"
      actions={[
        { id: 'journal', label: 'Write in your journal', icon: 'journal-outline' },
        { id: 'walk', label: 'Go for a 10-minute walk', icon: 'walk-outline' },
        { id: 'contact', label: 'Reach out to a sober friend', icon: 'chatbubble-outline' },
        { id: 'checklist', label: 'Complete one small task', icon: 'checkbox-outline' },
      ]}
      tip="Acknowledge your feelings without judgment. It's okay to not be okay."
    />
  );
}
