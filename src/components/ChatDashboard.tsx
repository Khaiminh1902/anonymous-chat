'use client';

import { useState } from 'react';
import { useAuth } from '../lib/auth';
import ServerList from './ServerList';
import ChatRoom from './ChatRoom';
import CreateServerModal from './CreateServerModal';
import { LogOut, Plus, Server } from 'lucide-react';
import { Id } from '../../convex/_generated/dataModel';

export default function ChatDashboard() {
  const { user, logout } = useAuth();
  const [selectedServerId, setSelectedServerId] = useState<Id<'servers'> | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLogout = () => {
    setSelectedServerId(null);
    logout();
  };

  return (
    <div className="h-screen bg-black text-green-400 flex">
      <div className="w-80 terminal-border border-r border-l-0 border-t-0 border-b-0 flex flex-col">
        <div className="p-4 terminal-border border-l-0 border-r-0 border-t-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Server className="w-6 h-6 mr-2" />
              <h1 className="text-lg font-bold">SERVERS</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="terminal-button p-2 rounded-lg"
              title="Create Server"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-green-300">[USER]</span> {user?.codename}
              {user?.userCode && (
                <span className="ml-2 text-xs text-green-600">ID: {user.userCode}</span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ServerList 
            selectedServerId={selectedServerId}
            onSelectServer={setSelectedServerId}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedServerId ? (
          <ChatRoom serverId={selectedServerId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <Server className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <h2 className="text-xl mb-2 text-green-600">
                [NO SERVER SELECTED]
              </h2>
              <p className="text-green-700 text-sm max-w-md">
                Select a server from the sidebar to start chatting, or create a new one.
              </p>
              <div className="mt-8 text-xs text-green-800">
                <div className="mb-2">█▓▒░ TERMINAL READY ░▒▓█</div>
                <div>Awaiting user input...</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateServerModal
          onClose={() => setShowCreateModal(false)}
          onServerCreated={(serverId) => {
            setSelectedServerId(serverId);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
