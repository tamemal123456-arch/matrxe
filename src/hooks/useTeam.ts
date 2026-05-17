import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  status: string;
  permissions: Record<string, boolean>;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  max_members: number;
  created_at: string;
}

export function useTeam() {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    if (!user) { setTeam(null); setMembers([]); setLoading(false); return; }
    const { data: teamData } = await supabase.from("teams").select("*").eq("owner_id", user.id).single();
    setTeam(teamData);
    if (teamData) {
      const { data: memberData } = await supabase.from("team_members").select("*").eq("team_id", teamData.id);
      setMembers(memberData || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const inviteMember = async (email: string, role = "member") => {
    if (!team) return { error: "No team found" };
    const { error } = await supabase.from("team_invitations").insert({
      team_id: team.id, email, role, invited_by: user?.id,
    });
    return { error };
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase.from("team_members").delete().eq("id", memberId);
    if (!error) setMembers(prev => prev.filter(m => m.id !== memberId));
    return { error };
  };

  const updateMemberRole = async (memberId: string, role: string) => {
    const { error } = await supabase.from("team_members").update({ role }).eq("id", memberId);
    if (!error) setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));
    return { error };
  };

  const createTeam = async (name: string) => {
    const { data, error } = await supabase.from("teams").insert({ name, owner_id: user?.id }).select().single();
    if (data) {
      setTeam(data);
      await supabase.from("team_members").insert({ team_id: data.id, user_id: user?.id, role: "owner" });
    }
    return { data, error };
  };

  return { team, members, loading, inviteMember, removeMember, updateMemberRole, createTeam, refetch: fetchTeam };
}
