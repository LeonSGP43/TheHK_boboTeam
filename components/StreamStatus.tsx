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
    <div className="bg-black border-b border-slate-900 p-2 flex items-center justify-between text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Server size={14} className="text-slate-400" />
                <span>FIREHOSE_V1</span>
            </div>
            <ArrowRight size={12} className="text-slate-700 animate-pulse" />
            <div className="flex items-center gap-2">
                <Database size={14} style={{ color: '#00d4ff' }} />
                <span className="font-bold text-slate-300">KAFKA_CLUSTER</span>
                <span className="bg-[#00d4ff]/10 text-[#00d4ff] px-1 rounded">{packetCount.toLocaleString()} events</span>
            </div>
            <ArrowRight size={12} className="text-slate-700 animate-pulse" />
            <div className="flex items-center gap-2">
                <Activity size={14} style={{ color: '#ffd700' }} />
                <span>GEMINI_NEURAL</span>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            <span 
                className={`h-2 w-2 rounded-full ${status === DataStreamStatus.INGESTING ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: status === DataStreamStatus.INGESTING ? '#00d4ff' : '#ff6b35' }}
            ></span>
            <span style={{ color: status === DataStreamStatus.INGESTING ? '#00d4ff' : '#ff6b35' }}>
                {status === DataStreamStatus.INGESTING ? 'LINK_ESTABLISHED' : 'LINK_OFFLINE'}
            </span>
        </div>
    </div>
  );
};

export default StreamStatus;