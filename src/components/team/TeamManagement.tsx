import { useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, Trash2, Crown, Shield, User, Mail, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTeam, TeamMember } from "@/hooks/useTeam";

const roleLabels: Record<string, string> = { owner: "مالك", admin: "مدير", member: "عضو", viewer: "مشاهد" };
const roleColors: Record<string, string> = { owner: "bg-yellow-500/20 text-yellow-500", admin: "bg-blue-500/20 text-blue-500", member: "bg-green-500/20 text-green-500", viewer: "bg-gray-500/20 text-gray-500" };
const roleIcons: Record<string, React.ElementType> = { owner: Crown, admin: Shield, member: User, viewer: User };

export function TeamManagement() {
  const { team, members, loading, inviteMember, removeMember, updateMemberRole, createTeam } = useTeam();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState("");

  const handleInvite = async () => {
    if (!inviteEmail) return;
    const { error } = await inviteMember(inviteEmail, inviteRole);
    if (!error) setInviteEmail("");
  };

  if (loading) return <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  if (!team) {
    return (
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-8 text-center">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">ليس لديك فريق</h2>
          <p className="text-muted-foreground mb-6">أنشئ فريقاً للتعاون مع الآخرين</p>
          {showCreate ? (
            <div className="flex items-center gap-3 max-w-sm mx-auto">
              <Input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="اسم الفريق" />
              <Button onClick={async () => { await createTeam(teamName); setShowCreate(false); }} size="sm">إنشاء</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}><X className="w-4 h-4" /></Button>
            </div>
          ) : (
            <Button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-primary to-accent">
              <Users className="w-4 h-4 ml-2" /> إنشاء فريق
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الفريق</h1>
          <p className="text-muted-foreground">{team.name} — {members.length}/{team.max_members} أعضاء</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border border-border/50">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5" /> دعوة عضو جديد</h2>
        <div className="flex items-center gap-3">
          <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="البريد الإلكتروني" className="flex-1" />
          <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="px-3 py-2 rounded-lg border border-border/50 bg-background text-sm">
            <option value="member">عضو</option>
            <option value="admin">مدير</option>
            <option value="viewer">مشاهد</option>
          </select>
          <Button onClick={handleInvite} size="sm"><Check className="w-4 h-4 ml-1" /> دعوة</Button>
        </div>
      </motion.div>

      <div className="space-y-3">
        {members.map((member: TeamMember, i: number) => {
          const Icon = roleIcons[member.role] || User;
          return (
            <motion.div key={member.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-4 border border-border/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{member.user_email || `مستخدم ${member.user_id.slice(0, 8)}`}</p>
                  <Badge className={roleColors[member.role]} variant="secondary">{roleLabels[member.role] || member.role}</Badge>
                </div>
              </div>
              {member.role !== "owner" && (
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeMember(member.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
