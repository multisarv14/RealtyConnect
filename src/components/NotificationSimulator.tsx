/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Info
} from 'lucide-react';
import { SystemNotification } from '../types';

interface NotificationSimulatorProps {
  notifications: SystemNotification[];
  onTriggerNotification: (type: SystemNotification['type'], recipient: string, content: string) => void;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
}

export default function NotificationSimulator({ notifications, onTriggerNotification, onLogTriggered }: NotificationSimulatorProps) {
  const [notiType, setNotiType] = useState<SystemNotification['type']>('email');
  const [recipient, setRecipient] = useState('');
  const [messageContent, setMessageContent] = useState('');

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient.trim() || !messageContent.trim()) return;

    onTriggerNotification(notiType, recipient.trim(), messageContent.trim());
    
    onLogTriggered(
      'NOTIFICATION_ENQUEUED',
      'system_notifications',
      Math.random().toString(36).substr(2, 5).toUpperCase(),
      'SUCCESS',
      `Asynchronous Queue Trigger: Placed ${notiType.toUpperCase()} notification to "${recipient}" into RabbitMQ Broker.`
    );

    setRecipient('');
    setMessageContent('');
  };

  const fillTemplate = (template: string) => {
    if (template === 'lockout') {
      setNotiType('sms');
      setRecipient('+91 98765 43210');
      setMessageContent('SECURITY WARNING: 5 failed login attempts detected. Your RealtyConnect profile is locked for 30 minutes.');
    } else if (template === 'verification') {
      setNotiType('email');
      setRecipient('builder@realtyconnect.com');
      setMessageContent('RealtyConnect: Welcome! Your builder profile verification has been approved by the compliance team. Log in to access your CRM workspace.');
    } else if (template === 'rfq') {
      setNotiType('push');
      setRecipient('supplier_all_nodes');
      setMessageContent('New procurement RFQ published: Structural Grade-I steel materials required for Pune project, 200 metric tons.');
    }
    onLogTriggered('PREFILL_NOTIFICATION_TEMPLATE', 'notification_helper', template, 'SUCCESS', `Loaded notification template: ${template}`);
  };

  const getIconForType = (type: SystemNotification['type']) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4 text-emerald-400" />;
      case 'sms':
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'push':
        return <Bell className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="notification-simulator-root">
      {/* Form and templates */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <span className="text-[10px] text-slate-500 font-mono block uppercase px-1 tracking-wider">Asynchronous Dispatch Terminal</span>

        <div className="p-5 bg-slate-900/30 border border-slate-800 rounded-xl flex-1">
          <h3 className="font-display font-bold text-slate-100 flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-400" />
            Queue Notification Job
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch cross-channel messages representing decoupled system notification payloads.
          </p>

          <form onSubmit={handleDispatch} className="space-y-3.5 mt-4" id="form-notification">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Channel Type</label>
                <select
                  value={notiType}
                  onChange={(e) => setNotiType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-200 p-2 rounded outline-none"
                >
                  <option value="email">Email (SendGrid)</option>
                  <option value="sms">SMS (Twilio)</option>
                  <option value="push">Browser Web Push</option>
                  <option value="in_app">SSE In-App</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Target Address</label>
                <input
                  type="text"
                  required
                  placeholder={notiType === 'email' ? 'e.g. user@domain.com' : notiType === 'sms' ? '+91 99999 88888' : 'e.g. target_node'}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-200 p-2 rounded outline-none transition-all placeholder:text-slate-650"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Notification Payload</label>
              <textarea
                required
                rows={3}
                placeholder="Enter alert message details..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-200 p-2.5 rounded outline-none transition-all placeholder:text-slate-650 resize-none"
              />
            </div>

            <button
              type="submit"
              id="btn-dispatch-submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-semibold py-2 px-4 rounded text-sm transition-colors shadow-lg flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Queue Dispatch Task
            </button>
          </form>
        </div>

        {/* Templates box */}
        <div className="p-3.5 bg-slate-900/10 border border-slate-850 rounded-xl">
          <h4 className="text-xs font-semibold text-slate-300 mb-2">Simulate Common Alert Scenarios</h4>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => fillTemplate('lockout')}
              id="btn-template-lockout"
              className="text-left px-3 py-2 bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 font-mono transition-all hover:text-emerald-400"
            >
              [SMS Alert] ➔ Bruteforce account lockout
            </button>
            <button
              onClick={() => fillTemplate('verification')}
              id="btn-template-verification"
              className="text-left px-3 py-2 bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 font-mono transition-all hover:text-emerald-400"
            >
              [Email Alert] ➔ RERA business profile verification approval
            </button>
            <button
              onClick={() => fillTemplate('rfq')}
              id="btn-template-rfq"
              className="text-left px-3 py-2 bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 font-mono transition-all hover:text-emerald-400"
            >
              [Web Push] ➔ B2B bidding marketplace RFQ publish
            </button>
          </div>
        </div>
      </div>

      {/* Outbox log stream */}
      <div className="lg:col-span-7 p-5 bg-slate-900/30 border border-slate-800 rounded-xl flex flex-col justify-between" id="notification-outbox">
        <div>
          <h3 className="font-display font-bold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-900">
            <Bell className="w-4 h-4 text-emerald-400" />
            Asynchronous Notification Outbox
          </h3>

          {/* List of outbox logs */}
          <div className="space-y-2 mt-4 max-h-[195px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-550 text-xs font-mono">
                Outbox buffer is empty. Dispatch alert payloads to view brokers.
              </div>
            ) : (
              notifications.map(noti => {
                const isSent = noti.status === 'sent';
                const isQueued = noti.status === 'queued';
                
                return (
                  <div 
                    key={noti.id}
                    id={`noti-row-${noti.id}`}
                    className="p-3 bg-slate-950 border border-slate-900 rounded-lg flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 mt-0.5">
                        {getIconForType(noti.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-slate-400 font-semibold">{noti.recipient}</span>
                          <span className="text-[9px] bg-slate-900 text-slate-500 font-mono px-1 py-0.2 rounded border border-slate-850">
                            {noti.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 mt-1 leading-relaxed">{noti.content}</p>
                        <span className="text-[9px] text-slate-500 font-mono block mt-1.5">Timestamp: {noti.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isSent ? (
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 font-bold">
                          <CheckCircle className="w-3 h-3" />
                          Sent
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1 font-bold animate-pulse">
                          <Clock className="w-3 h-3" />
                          Queued
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Info box */}
        <div className="mt-5 p-3.5 bg-slate-900/20 border border-slate-850 rounded-lg text-xs text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Queue Decoupling Active:</strong> Notifications queue into active thread workers asynchronously to shield user response threads, shifting from 'QUEUED' to 'SENT' after passing delivery gates.
          </span>
        </div>
      </div>
    </div>
  );
}
