import api from './api';

export interface Meeting {
  id: string;
  name: string;
  type: 'AA' | 'NA' | 'Online' | 'SMART';
  address: string;
  time: string;
  day: string;
  format: 'In Person' | 'Online' | 'Hybrid';
  lat?: number;
  lng?: number;
}

export const meetingsService = {
  async getMeetings(filter?: string): Promise<Meeting[]> {
    try {
      const { data } = await api.get<Meeting[]>('/meetings', {
        params: filter ? { type: filter } : undefined,
      });
      return data;
    } catch {
      return mockMeetings(filter);
    }
  },

  async getFeaturedMeetings(): Promise<Meeting[]> {
    try {
      const { data } = await api.get<Meeting[]>('/meetings/featured');
      return data;
    } catch {
      return mockMeetings().slice(0, 2);
    }
  },
};

function mockMeetings(filter?: string): Meeting[] {
  const meetings: Meeting[] = [
    {
      id: '1', name: 'New Connections', type: 'AA',
      address: '1234 Recovery Blvd, Los Angeles, CA',
      time: '7:00 PM', day: 'Tonight', format: 'In Person',
    },
    {
      id: '2', name: 'Morning Miracles', type: 'AA',
      address: '5678 Sober St, Los Angeles, CA',
      time: '10:00 AM', day: 'Tomorrow', format: 'In Person',
    },
    {
      id: '3', name: 'NA Online Group', type: 'NA',
      address: 'Zoom Meeting',
      time: '6:30 PM', day: 'Tonight', format: 'Online',
    },
    {
      id: '4', name: 'SMART Recovery', type: 'SMART',
      address: '910 Wellness Way, Los Angeles, CA',
      time: '8:00 PM', day: 'Thursday', format: 'Hybrid',
    },
  ];

  if (filter && filter !== 'All') {
    return meetings.filter(m => m.type === filter);
  }
  return meetings;
}
