'use client';

import { X, Hash, Users } from 'lucide-react';
import { Id } from '../../convex/_generated/dataModel';

interface AlreadyMemberModalProps {
  server: {
    _id: Id<'servers'>;
    name: string;
    description?: string;
    memberCount: number;
  };
  onClose: () => void;
  onGoToServer: (serverId: Id<'servers'>) => void;
}

export default function AlreadyMemberModal({ server, onClose, onGoToServer }: AlreadyMemberModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md terminal-border rounded-lg p-6 bg-black">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Hash className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-bold">ALREADY A MEMBER</h2>
          </div>
          <button onClick={onClose} className="text-green-600 hover:text-green-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="terminal-border rounded-lg p-4 mb-6">
          <div className="font-medium mb-1">{server.name}</div>
          {server.description && (
            <div className="text-sm text-green-600 mb-2">{server.description}</div>
          )}
          <div className="flex items-center text-xs text-green-700">
            <Users className="w-3 h-3 mr-1" />
            {server.memberCount} members
          </div>
        </div>

        <div className="text-green-300 text-sm mb-6">
          You are already a member of this server. Would you like to open it now?
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 terminal-button p-3 rounded-lg font-medium"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={() => onGoToServer(server._id)}
            className="flex-1 terminal-button-primary p-3 rounded-lg font-medium"
          >
            GO TO SERVER
          </button>
        </div>
      </div>
    </div>
  );
}

