import React, { useEffect, useState } from 'react';
import { Activity, Server, Database, ArrowRight } from 'lucide-react';
import { DataStreamStatus } from '../types';

interface Props {
  status: DataStreamStatus;
}

const StreamStatus: React.FC<Props> = ({ status }) => {
  const [packetCount, setPacketCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        if (status === DataStreamStatus.INGESTING) {
            setPacketCount(p => p + Math.floor(Math.random() * 50));
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-2 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Server size={14} className="text-blue-500" />
                <span>Source: Social Firehose</span>
            </div>
            <ArrowRight size={12} className="text-slate-600 animate-pulse" />
            <div className="flex items-center gap-2">
                <Database size={14} className="text-purple-500" />
                <span className="font-bold text-purple-400">Confluent Kafka</span>
                <span className="bg-purple-900/50 text-purple-300 px-1 rounded">{packetCount.toLocaleString()} events</span>
            </div>
            <ArrowRight size={12} className="text-slate-600 animate-pulse" />
            <div className="flex items-center gap-2">
                <Activity size={14} className="text-green-500" />
                <span>Gemini Analysis Agent</span>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${status === DataStreamStatus.INGESTING ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span>{status === DataStreamStatus.INGESTING ? 'STREAM ACTIVE' : 'STREAM PAUSED'}</span>
        </div>
    </div>
  );
};

export default StreamStatus;
