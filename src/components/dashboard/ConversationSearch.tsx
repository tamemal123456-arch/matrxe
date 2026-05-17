import { useState, useEffect, useCallback } from "react";
import { Search, MessageSquare, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function ConversationSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!user || q.length < 2) { setResults([]); return; }
    setSearching(true);
    const { data } = await supabase
      .from("chat_messages")
      .select("id, content, conversation_id, created_at, conversations!inner(title)")
      .textSearch("search_vector", q, { config: "simple" })
      .eq("conversations.user_id", user.id)
      .limit(10);
    setResults(data?.map(m => ({
      id: m.id, content: m.content?.slice(0, 150), conversation_id: m.conversation_id,
      conversation_title: (m as any).conversations?.title || "بدون عنوان", created_at: m.created_at,
    })) || []);
    setSearching(false);
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query} onChange={e => { setQuery(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          placeholder="ابحث في المحادثات..."
          className="pr-9 pl-8"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); }} className="absolute left-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {showResults && query.length >= 2 && (
        <div className="absolute top-full mt-2 left-0 right-0 glass-card rounded-xl border border-border/50 shadow-xl z-50 max-h-80 overflow-y-auto">
          {searching ? (
            <div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">لا توجد نتائج</div>
          ) : (
            results.map(r => (
              <button key={r.id} onClick={() => { navigate(`/chat/${r.conversation_id}`); setShowResults(false); }}
                className="w-full p-3 text-right hover:bg-muted/50 transition-colors border-b border-border/10 last:border-0"
              >
                <p className="text-sm font-medium text-foreground truncate">{r.conversation_title}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">{r.content}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
