import React from 'react';
import { SOSResponseScreen } from '../../../components/sos/SOSResponseScreen';

export default function JustRelapsed() {
  return (
    <SOSResponseScreen
      title="Just Relapsed"
      subtitle="It's okay. This is part of recovery. Let's get you back on track."
      accentColor="#FF9F43"
      headerIcon="refresh-circle-outline"
      actions={[
        { id: 'accept', label: 'Accept it happened — no shame', icon: 'heart-outline' },
        { id: 'sponsor', label: 'Call your sponsor or a trusted person', icon: 'call-outline' },
        { id: 'meeting', label: 'Attend a meeting today', icon: 'people-outline' },
        { id: 'reset', label: 'Reset your sobriety counter', icon: 'refresh-outline' },
      ]}
      tip="Relapse is not failure — it's information. Every day sober is a victory."
    />
  );
}
