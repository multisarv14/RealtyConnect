/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Terminal, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Lock, 
  Layers,
  Database,
  Info
} from 'lucide-react';
import { AuditLog } from '../types';

interface LogsViewerProps {
  logs: AuditLog[];
  onClearSimulatorLogs: () => void;
}

export default function LogsViewer({ logs, onClearSimulatorLogs }: LogsViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILURE' | 'WARNING'>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: AuditLog['status']) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-2.5 h-2.5" />
            Success
          </span>
        );
      case 'FAILURE':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert className="w-2.5 h-2.5" />
            Critical
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <AlertTriangle className="w-2.5 h-2.5" />
            Warning
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="logs-viewer-root">
      {/* Real-time Logs Terminal Grid */}
      <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[400px]" id="logs-terminal">
        {/* Terminal Header */}
        <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-slate-650 font-mono text-xs">|</span>
            <span className="font-mono text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              compliance_audit_stream.log
            </span>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="grep logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded px-2 py-1 text-[11px] font-mono text-slate-300 pl-7 outline-none transition-all placeholder:text-slate-600"
              />
              <Search className="absolute left-2 top-1.5 w-3 h-3 text-slate-650" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 px-2 py-1 rounded outline-none"
            >
              <option value="ALL">All Levels</option>
              <option value="SUCCESS">Success Only</option>
              <option value="WARNING">Warning Only</option>
              <option value="FAILURE">Critical Only</option>
            </select>
          </div>
        </div>

        {/* Terminal logs area */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-600 italic">
              No matching log records found in active telemetry stream.
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const isSelected = selectedLog?.id === log.id;
              return (
                <div 
                  key={log.id}
                  id={`log-row-${log.id}`}
                  onClick={() => setSelectedLog(log)}
                  className={`p-2 rounded cursor-pointer border hover:bg-slate-900/30 transition-all ${
                    isSelected 
                      ? 'border-emerald-500/40 bg-slate-900/40' 
                      : 'border-transparent hover:border-slate-900'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-600 text-[10px]">{log.timestamp}</span>
                      <span className="text-slate-500 text-[10px] bg-slate-900 px-1.5 py-0.2 rounded border border-slate-850">
                        IP: {log.ipAddress}
                      </span>
                      {getStatusBadge(log.status)}
                      <span className="text-emerald-400 font-bold">{log.action}</span>
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-slate-600" />
                      <span>CHAIN_HASH: {log.chainHash.substr(0, 10)}...</span>
                    </div>
                  </div>

                  <p className="text-slate-300 mt-1 text-[11px] truncate">{log.details}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Terminal footer displaying metrics */}
        <div className="px-4 py-2 bg-slate-900/40 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Telemetry Stream Buffer Size: {logs.length} events</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SECURE LIVE CONNECTION ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Selected Log Cryptographic Detail Inspector */}
      <div className="lg:col-span-4 p-5 bg-slate-900/30 border border-slate-800 rounded-xl flex flex-col justify-between" id="logs-inspector">
        <div>
          <h3 className="font-display font-bold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-900">
            <Layers className="w-4 h-4 text-emerald-400" />
            Audit Trace Inspector
          </h3>

          {selectedLog ? (
            <div className="mt-4 space-y-3.5 font-mono text-xs" id="log-detail-card">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Event Identifier</span>
                <span className="text-slate-300 font-semibold">{selectedLog.id}</span>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 block uppercase">User Email / Security Role</span>
                <span className="text-slate-300">{selectedLog.userId}</span>
                <span className="ml-1.5 text-[9px] bg-slate-900 border border-slate-850 text-slate-400 px-1 py-0.2 rounded font-bold">
                  {selectedLog.userRole}
                </span>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Affected Registry / Record Key</span>
                <span className="text-slate-300">{selectedLog.entity}</span>
                <span className="ml-1.5 text-slate-400">➔ {selectedLog.entityId}</span>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Crystallized Action Details</span>
                <p className="text-slate-250 font-sans mt-0.5 leading-relaxed bg-slate-950 p-2 rounded border border-slate-850">
                  {selectedLog.details}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-500 block uppercase">Block Chaining SHA-256 Hash</span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded font-bold border border-emerald-500/20">
                    Secured
                  </span>
                </div>
                <p className="text-slate-400 text-[10px] break-all bg-slate-950 p-2 rounded border border-slate-850 mt-1">
                  {selectedLog.chainHash}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-16 text-center text-slate-500 text-xs italic">
              <Info className="w-6 h-6 text-slate-700 mx-auto mb-2" />
              Select any event entry inside the log terminal to inspect its unalterable cryptographic payload and linked block signature details.
            </div>
          )}
        </div>

        {/* Immutability disclaimer */}
        <div className="p-3.5 bg-slate-900/20 border border-slate-850 rounded-lg text-[10px] text-slate-400 flex items-start gap-2 mt-4">
          <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Compliance Mandate LOG-01 enforced:</strong> Audit traces are write-once. Editing or deleting events is prevented at the database driver layer to satisfy strict regulatory audits.
          </span>
        </div>
      </div>
    </div>
  );
}
