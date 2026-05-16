// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type MemoryType = "fact" | "preference" | "skill" | "conversation_summary" | "learned_knowledge";

interface Memory {
  id: string;
  twin_id: string;
  memory_type: MemoryType;
  key: string;
  value: string;
  importance: number;
  created_at: string;
  updated_at: string;
}

export function useTwinMemory(twinId?: string) {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMemories = useCallback(async (type?: MemoryType) => {
    if (!twinId || !user) return;
    setLoading(true);
    try {
      let query = supabase
        .from("twin_memories")
        .select("*")
        .eq("twin_id", twinId)
        .order("importance", { ascending: false });

      if (type) query = query.eq("memory_type", type);

      const { data, error } = await query;
      if (!error && data) setMemories(data);
    } finally {
      setLoading(false);
    }
  }, [twinId, user]);

  const saveMemory = useCallback(async (key: string, value: string, type: MemoryType = "fact", importance = 5) => {
    if (!twinId || !user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("twin_memories")
      .upsert({
        twin_id: twinId,
        user_id: user.id,
        memory_type: type,
        key,
        value,
        importance,
      }, { onConflict: "twin_id, key" });

    if (!error) await loadMemories();
    return { error };
  }, [twinId, user, loadMemories]);

  const deleteMemory = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from("twin_memories").delete().eq("id", id);
    setMemories(prev => prev.filter(m => m.id !== id));
  }, [user]);

  const searchMemories = useCallback(async (query: string) => {
    if (!twinId) return [];
    const { data, error } = await supabase
      .from("twin_memories")
      .select("*")
      .eq("twin_id", twinId)
      .or(`key.ilike.%${query}%,value.ilike.%${query}%`)
      .order("importance", { ascending: false })
      .limit(20);

    if (error) return [];
    return data || [];
  }, [twinId]);

  return {
    memories,
    loading,
    loadMemories,
    saveMemory,
    deleteMemory,
    searchMemories,
  };
}
