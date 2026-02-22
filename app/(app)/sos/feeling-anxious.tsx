import React from 'react';
import { SOSResponseScreen } from '../../../components/sos/SOSResponseScreen';

export default function FeelingAnxious() {
  return (
    <SOSResponseScreen
      title="Feeling Anxious"
      subtitle="Anxiety is temporary. Let's slow things down together."
      accentColor="#A55EEA"
      headerIcon="pulse-outline"
      actions={[
        { id: 'breathe', label: 'Try 4-7-8 breathing (inhale 4, hold 7, exhale 8)', icon: 'medical-outline' },
        { id: 'ground', label: 'Name 5 things you can see right now', icon: 'eye-outline' },
        { id: 'meditate', label: 'Listen to a 5-minute meditation', icon: 'flower-outline' },
        { id: 'sponsor', label: 'Talk to your sponsor', icon: 'call-outline' },
      ]}
      tip="Anxiety cannot hurt you. It's your body trying to protect you. You are safe."
    />
  );
}
