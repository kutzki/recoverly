import React from 'react';
import { SOSResponseScreen } from '../../../components/sos/SOSResponseScreen';

export default function SelfHarm() {
  return (
    <SOSResponseScreen
      title="Self-Harm"
      subtitle="Your life has value. You are not alone in this moment."
      accentColor="#EE5A24"
      headerIcon="heart-dislike-outline"
      actions={[
        { id: 'safe', label: 'Move to a safe space', icon: 'home-outline' },
        { id: 'call988', label: 'Call or text 988 now', icon: 'call-outline' },
        { id: 'distract', label: 'Hold ice or snap a rubber band', icon: 'hand-left-outline' },
        { id: 'trusted', label: 'Tell someone you trust', icon: 'person-outline' },
      ]}
      tip="If you're in immediate danger, call 911. The 988 Lifeline is available 24/7, free and confidential."
    />
  );
}
