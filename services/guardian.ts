import { supabase } from './supabase';
import { UserProfile } from './auth';

export type GuardianLink = {
  id: string;
  seeker_id: string;
  guardian_id: string;
  status: 'PENDING' | 'ACTIVE' | 'REVOKED';
  created_at: string;
  seeker?: UserProfile;
  guardian?: UserProfile;
};

export const guardianService = {
  async generateCode(userId: string) {
    // 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    const { data, error } = await supabase
      .from('profiles')
      .update({
        guardian_code: code,
        guardian_code_expires_at: expiresAt
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return code;
  },

  async clearCode(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({
        guardian_code: null,
        guardian_code_expires_at: null
      })
      .eq('id', userId);
    
    if (error) throw error;
  },

  async linkWithCode(guardianId: string, code: string) {
    // 1. Find seeker by code and check expiry
    const { data: seeker, error: findError } = await supabase
      .from('profiles')
      .select('id, guardian_code, guardian_code_expires_at')
      .eq('guardian_code', code)
      .single();

    if (findError || !seeker) throw new Error('Invalid or expired code');

    const now = new Date();
    const expiry = new Date(seeker.guardian_code_expires_at!);
    if (now > expiry) throw new Error('Code expired');

    // 2. Create link
    const { data, error } = await supabase
      .from('guardian_links')
      .insert({
        seeker_id: seeker.id,
        guardian_id: guardianId,
        status: 'PENDING' // Seeker must approve
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new Error('Already linked to this seeker');
      throw error;
    }

    // 3. Notify seeker
    await supabase.from('notifications').insert({
      recipient_id: seeker.id,
      actor_id: guardianId,
      type: 'LINK_REQUEST',
      content: 'Wants to be your guardian'
    });

    return data;
  },

  async getMyLinks(userId: string, role: 'SEEKER' | 'GUARDIAN') {
    const column = role === 'SEEKER' ? 'seeker_id' : 'guardian_id';
    const otherColumn = role === 'SEEKER' ? 'guardian' : 'seeker';

    const { data, error } = await supabase
      .from('guardian_links')
      .select(`
        *,
        seeker:profiles!guardian_links_seeker_id_fkey(*),
        guardian:profiles!guardian_links_guardian_id_fkey(*)
      `)
      .eq(column, userId);

    if (error) throw error;
    return data as GuardianLink[];
  },

  async updateLinkStatus(linkId: string, status: 'ACTIVE' | 'REVOKED') {
    const { data, error } = await supabase
      .from('guardian_links')
      .update({ status })
      .eq('id', linkId)
      .select()
      .single();

    if (error) throw error;

    // Notify other party
    const link = data as GuardianLink;
    await supabase.from('notifications').insert({
      recipient_id: status === 'ACTIVE' ? link.guardian_id : link.guardian_id, // For now always notify guardian
      actor_id: link.seeker_id,
      type: status === 'ACTIVE' ? 'LINK_ACCEPTED' : 'EMERGENCY', // Better mappings later
      content: status === 'ACTIVE' ? 'Accepted your link request' : 'Revoked the link'
    });

    return data;
  }
};
