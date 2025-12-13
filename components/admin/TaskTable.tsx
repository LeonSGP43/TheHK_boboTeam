import React from 'react';
import { MoreHorizontal, Radio } from 'lucide-react';

const TASKS = [
  { id: 'OP-X92', name: 'Gemini Launch Hype', status: 'Published', vks: 92, node: 'Node-Alpha' },
  { id: 'OP-A15', name: 'Crypto Crash Control', status: 'Draft', vks: 0, node: 'Node-Beta' },
  { id: 'OP-B77', name: 'Viral Meme Seed', status: 'Published', vks: 68, node: 'Auto-Scaler' },
  { id: 'OP-C02', name: 'Competitor Analysis', status: 'Ended', vks: 45, node: 'Sys-Core' },
  { id: 'OP-D99', name: 'Black Friday Prep', status: 'Draft', vks: 0, node: 'Node-Alpha' },
];

export function TaskTable() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'text-pulse bg-pulse/10 border-pulse/20';
      case 'Draft': return 'text-slate-400 bg-slate-800/50 border-slate-700';
      case 'Ended': return 'text-spark bg-spark/10 border-spark/20';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 text-[10px] uppercase font-mono text-slate-500 tracking-wider">
            <th className="py-3 px-4">Op_ID</th>
            <th className="py-3 px-4">Operation Name</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Live VKS</th>
            <th className="py-3 px-4">Deploy Node</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {TASKS.map((task) => (
            <tr key={task.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
              <td className="py-3 px-4 font-mono text-xs text-slate-400 group-hover:text-pulse transition-colors">
                {task.id}
              </td>
              <td className="py-3 px-4 text-sm font-medium text-slate-200">
                {task.name}
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(task.status)} flex w-fit items-center gap-1`}>
                  {task.status === 'Published' && <Radio size={8} className="animate-pulse" />}
                  {task.status}
                </span>
              </td>
              <td className="py-3 px-4 font-mono text-sm">
                {task.status === 'Published' ? (
                   <span className="text-white font-bold">{task.vks}</span>
                ) : (
                   <span className="text-slate-600">-</span>
                )}
              </td>
              <td className="py-3 px-4 text-xs text-slate-400 font-mono">
                {task.node}
              </td>
              <td className="py-3 px-4 text-right">
                <button className="text-slate-500 hover:text-white">
                  <MoreHorizontal size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}