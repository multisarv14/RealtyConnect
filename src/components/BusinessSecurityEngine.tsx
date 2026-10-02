/**
 * Team and security for the signed-in company: who has access, what they may do,
 * where they are signed in, and what they have done. Everything here is live data.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Users, Monitor, History, UserPlus, Copy, ShieldCheck, Trash2 } from 'lucide-react';
import { api, errorMessage, type Session } from '../lib/api';

interface SecurityEngineProps {
  userSession: Session | null;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNotificationTriggered?: (type: 'email' | 'sms' | 'push' | 'in_app', recipient: string, content: string) => void;
  setActiveViewMode?: (view: any) => void;
}

interface Member {
  id: string;
  name: string;
  email: string;
  orgRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  status: string;
  lastLoginAt: string | null;
}

interface InviteRow {
  id: string;
  email: string;
  name: string;
  orgRole: string;
  invitedBy: string;
  expiresAt: string;
}

interface TeamData {
  members: Member[];
  invites: InviteRow[];
  seatLimit: number;
  seatsUsed: number;
}

interface SessionRow {
  id: string;
  email: string;
  name: string;
  role: string;
  ip: string;
  device: string;
  signedInAt: string;
  lastActiveAt: string;
}

interface ActivityRow {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  status: string;
  details: string;
}

const ROLE_HELP: Record<string, string> = {
  OWNER: 'Full control, including billing and administrators.',
  ADMIN: 'Manages the team, the company profile and billing. Can change all company data.',
  MEMBER: 'Works in every module the plan includes. Cannot manage the team or billing.',
  VIEWER: 'Can look at company data but cannot change anything.'
};

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never');

export default function BusinessSecurityEngine({ userSession, showToast, onLogTriggered }: SecurityEngineProps) {
  const [tab, setTab] = useState<'team' | 'sessions' | 'activity'>('team');
  const [team, setTeam] = useState<TeamData | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [invite, setInvite] = useState({ email: '', name: '', orgRole: 'MEMBER' });
  const [issued, setIssued] = useState<{ email: string; link: string; emailed: boolean } | null>(null);

  const isOwner = userSession?.orgRole === 'OWNER';
  const canManage = isOwner || userSession?.orgRole === 'ADMIN';

  const loadTeam = useCallback(() => {
    api<TeamData>('GET', '/team').then(setTeam).catch(err => showToast(errorMessage(err), 'error'));
  }, [showToast]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  useEffect(() => {
    if (!canManage) return;
    if (tab === 'sessions') api<SessionRow[]>('GET', '/team/sessions').then(setSessions).catch(err => showToast(errorMessage(err), 'error'));
    if (tab === 'activity') api<ActivityRow[]>('GET', '/team/activity').then(setActivity).catch(err => showToast(errorMessage(err), 'error'));
  }, [tab, canManage, showToast]);

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await api<{ email: string; link: string; emailed: boolean }>('POST', '/team/invites', invite);
      setIssued(result);
      setInvite({ email: '', name: '', orgRole: 'MEMBER' });
      loadTeam();
      showToast(result.emailed ? `Invitation emailed to ${result.email}.` : `Invitation created. Share the link with ${result.email}.`, 'success');
      onLogTriggered('TEAM_INVITE_CREATED', 'invites', result.email, 'SUCCESS', `Invited ${result.email}.`);
    } catch (err) {
      showToast(errorMessage(err), 'error');
    }
  };

  const update = (member: Member, changes: Partial<{ orgRole: string; status: string }>) =>
    api('PATCH', `/team/members/${member.id}`, changes)
      .then(loadTeam)
      .then(() => showToast(`Updated ${member.name || member.email}.`, 'success'))
      .catch(err => showToast(errorMessage(err), 'error'));

  const revokeInvite = (id: string) =>
    api('DELETE', `/team/invites/${id}`)
      .then(loadTeam)
      .catch(err => showToast(errorMessage(err), 'error'));

  const endSession = (id: string) =>
    api('DELETE', `/team/sessions/${id}`)
      .then(() => setSessions(prev => prev.filter(s => s.id !== id)))
      .then(() => showToast('Session ended. That person has to sign in again within 15 minutes.', 'success'))
      .catch(err => showToast(errorMessage(err), 'error'));

  const copy = (text: string) => navigator.clipboard.writeText(text).then(() => showToast('Link copied.', 'success')).catch(() => showToast('Copy the link manually.', 'info'));

  const tabs = [
    { id: 'team', label: 'Team', icon: Users },
    ...(canManage ? ([{ id: 'sessions', label: 'Active sessions', icon: Monitor }, { id: 'activity', label: 'Activity log', icon: History }] as const) : [])
  ] as { id: 'team' | 'sessions' | 'activity'; label: string; icon: any }[];

  return (
    <div className="space-y-6 text-xs text-slate-300" id="team-security-root">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-500" />Team and security</h2>
          <p className="text-slate-400 mt-1">Control who can use {userSession?.organizationName || 'your company'}'s workspace and what they can do.</p>
        </div>
        <div className="flex gap-1 p-1 bg-slate-950 border border-slate-900 rounded-xl">
          {tabs.map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 ${tab === t.id ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}>
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {tab === 'team' && team && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-4 gap-2">
            {Object.entries(ROLE_HELP).map(([role, help]) => (
              <div key={role} className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl">
                <div className="font-bold text-slate-200 capitalize">{role.toLowerCase()}</div>
                <div className="text-slate-500 mt-0.5">{help}</div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto border border-slate-900 rounded-xl">
            <div className="px-4 py-2 bg-slate-900/60 flex justify-between text-slate-400">
              <span className="font-semibold">People ({team.members.length})</span>
              <span>{team.seatsUsed} of {team.seatLimit} seats used on the {userSession?.plan.name} plan</span>
            </div>
            <table className="w-full text-left">
              <thead className="text-slate-500"><tr>{['Name', 'Email', 'Role', 'Status', 'Last sign-in', ''].map(h => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
              <tbody>
                {team.members.map(m => (
                  <tr key={m.id} className="border-t border-slate-900">
                    <td className="px-3 py-2 text-slate-100 font-medium">{m.name || '-'}{m.email === userSession?.email && <span className="ml-1 text-emerald-400">(you)</span>}</td>
                    <td className="px-3 py-2">{m.email}</td>
                    <td className="px-3 py-2">
                      {m.orgRole === 'OWNER' || !canManage || m.email === userSession?.email || (m.orgRole === 'ADMIN' && !isOwner) ? (
                        <span className="capitalize">{m.orgRole.toLowerCase()}</span>
                      ) : (
                        <select value={m.orgRole} onChange={e => update(m, { orgRole: e.target.value })} className="bg-slate-950 border border-slate-800 rounded px-2 py-1">
                          {isOwner && <option value="ADMIN">Admin</option>}
                          <option value="MEMBER">Member</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                      )}
                    </td>
                    <td className="px-3 py-2"><span className={m.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-500'}>{m.status === 'ACTIVE' ? 'Active' : 'Deactivated'}</span></td>
                    <td className="px-3 py-2">{when(m.lastLoginAt)}</td>
                    <td className="px-3 py-2 text-right">
                      {canManage && m.orgRole !== 'OWNER' && m.email !== userSession?.email && !(m.orgRole === 'ADMIN' && !isOwner) && (
                        <button type="button" onClick={() => update(m, { status: m.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })} className="text-slate-400 hover:text-emerald-400 hover:underline">
                          {m.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {canManage && (
            <div className="grid lg:grid-cols-2 gap-4">
              <form onSubmit={sendInvite} className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3" id="invite-form">
                <h3 className="font-bold text-slate-200 flex items-center gap-2"><UserPlus className="w-4 h-4 text-emerald-500" />Invite a colleague</h3>
                <input required type="email" placeholder="Work email" value={invite.email} onChange={e => setInvite({ ...invite, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2" />
                <input type="text" placeholder="Name (optional)" value={invite.name} onChange={e => setInvite({ ...invite, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2" />
                <select value={invite.orgRole} onChange={e => setInvite({ ...invite, orgRole: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                  {isOwner && <option value="ADMIN">Admin</option>}
                  <option value="MEMBER">Member</option>
                  <option value="VIEWER">Viewer (read only)</option>
                </select>
                <button type="submit" className="w-full py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold">Create invitation</button>
                {issued && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-2" id="invite-result">
                    <p className="text-emerald-300">{issued.emailed ? `Emailed to ${issued.email}. ` : 'Email delivery is not set up on this server, so share this link yourself. '}It works once, for {issued.email}, for 7 days.</p>
                    <div className="flex gap-2">
                      <input readOnly value={issued.link} className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono text-[11px]" />
                      <button type="button" onClick={() => copy(issued.link)} className="px-2.5 rounded bg-slate-900 border border-slate-800 flex items-center gap-1"><Copy className="w-3.5 h-3.5" />Copy</button>
                    </div>
                  </div>
                )}
              </form>

              <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-2">
                <h3 className="font-bold text-slate-200">Pending invitations ({team.invites.length})</h3>
                {team.invites.length === 0 && <p className="text-slate-500">No open invitations.</p>}
                {team.invites.map(i => (
                  <div key={i.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950 border border-slate-900">
                    <div>
                      <div className="text-slate-100">{i.email}</div>
                      <div className="text-slate-500 capitalize">{i.orgRole.toLowerCase()} • expires {new Date(i.expiresAt).toLocaleDateString('en-IN')}</div>
                    </div>
                    <button type="button" onClick={() => revokeInvite(i.id)} className="text-slate-500 hover:text-red-400" title="Withdraw invitation"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'sessions' && canManage && (
        <div className="overflow-x-auto border border-slate-900 rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-slate-900/60 text-slate-400"><tr>{['Person', 'Identity', 'Device', 'IP address', 'Signed in', 'Last active', ''].map(h => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {sessions.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-500">No active sessions.</td></tr>}
              {sessions.map(s => (
                <tr key={s.id} className="border-t border-slate-900">
                  <td className="px-3 py-2"><div className="text-slate-100">{s.name || s.email}</div><div className="text-slate-500">{s.email}</div></td>
                  <td className="px-3 py-2">{s.role.replace(/_/g, ' ').toLowerCase()}</td>
                  <td className="px-3 py-2 max-w-[16rem] truncate" title={s.device}>{s.device || 'Unknown'}</td>
                  <td className="px-3 py-2 font-mono">{s.ip || '-'}</td>
                  <td className="px-3 py-2">{when(s.signedInAt)}</td>
                  <td className="px-3 py-2">{when(s.lastActiveAt)}</td>
                  <td className="px-3 py-2 text-right"><button type="button" onClick={() => endSession(s.id)} className="text-red-400 hover:underline">End session</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'activity' && canManage && (
        <div className="overflow-x-auto border border-slate-900 rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-slate-900/60 text-slate-400"><tr>{['When (UTC)', 'Who', 'Action', 'Result', 'Details'].map(h => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {activity.length === 0 && <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">No activity recorded yet.</td></tr>}
              {activity.map(a => (
                <tr key={a.id} className="border-t border-slate-900 align-top">
                  <td className="px-3 py-2 whitespace-nowrap font-mono">{a.timestamp}</td>
                  <td className="px-3 py-2">{a.userId}</td>
                  <td className="px-3 py-2 font-mono">{a.action}</td>
                  <td className={`px-3 py-2 ${a.status === 'FAILURE' ? 'text-red-400' : a.status === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'}`}>{a.status.toLowerCase()}</td>
                  <td className="px-3 py-2 text-slate-400">{a.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
