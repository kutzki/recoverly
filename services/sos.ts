import api from './api';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  role: 'sponsor' | 'inner_circle' | 'counselor';
}

export const sosService = {
  async getEmergencyContacts(): Promise<Contact[]> {
    try {
      const { data } = await api.get<Contact[]>('/sos/contacts');
      return data;
    } catch {
      return [
        { id: '1', name: 'Jack (Sponsor)', phone: '888-888-8888', role: 'sponsor' },
        { id: '2', name: 'Sarah', phone: '555-123-4567', role: 'inner_circle' },
        { id: '3', name: 'Mike', phone: '555-234-5678', role: 'inner_circle' },
      ];
    }
  },

  async logSOSEvent(type: string): Promise<void> {
    try {
      await api.post('/sos/log', { type, timestamp: new Date().toISOString() });
    } catch {}
  },
};
