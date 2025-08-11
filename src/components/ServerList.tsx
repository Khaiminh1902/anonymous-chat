'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../lib/auth';
import { Id } from '../../convex/_generated/dataModel';
import { Hash, Users, Lock, Globe } from 'lucide-react';
import AlreadyMemberModal from './AlreadyMemberModal';

interface Server {
  _id: Id<'servers'>;
  _creationTime: number;
  name: string;
  description?: string;
  createdBy: Id<'users'>;
  createdAt: number;
  isPrivate: boolean;
  password?: string;
  memberCount: number;
  creatorCodename: string;
  joinedAt?: number;
}

interface ServerListProps {
  selectedServerId: Id<'servers'> | null;
  onSelectServer: (serverId: Id<'servers'>) => void;
}

export default function ServerList({ selectedServerId, onSelectServer }: ServerListProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
  
  const userServers = useQuery(api.queries.getUserServers, 
    user ? { userId: user._id } : 'skip'
  );
  const publicServers = useQuery(api.queries.getPublicServers);
  const joinServerMutation = useMutation(api.mutations.joinServer);

  const [alreadyMemberServer, setAlreadyMemberServer] = useState<Server | null>(null);

  const handleJoinServer = async (serverId: Id<'servers'>, password?: string) => {
    if (!user) return;
    
    try {
      await joinServerMutation({
        serverId,
        userId: user._id,
        password,
      });
      onSelectServer(serverId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to join server: ${errorMessage}`);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const servers = activeTab === 'my' ? (userServers || []) : (publicServers || []);
  const validServers = (servers || []).filter(Boolean) as Server[];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <div className="flex terminal-border rounded-lg p-1">
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 py-2 px-3 rounded text-sm transition-all duration-200 ${
              activeTab === 'my' 
                ? 'terminal-button-primary' 
                : 'text-green-600 hover:text-green-400'
            }`}
          >
            MY SERVERS
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`flex-1 py-2 px-3 rounded text-sm transition-all duration-200 ${
              activeTab === 'public' 
                ? 'terminal-button-primary' 
                : 'text-green-600 hover:text-green-400'
            }`}
          >
            PUBLIC
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-2">
          {validServers.length === 0 ? (
            <div className="text-center py-8 text-green-600">
              <Hash className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">
                {activeTab === 'my' ? 'No servers joined' : 'No public servers'}
              </p>
            </div>
          ) : (
            validServers.map((server: Server) => (
              <div
                key={server._id}
                className={`terminal-border rounded-lg p-3 transition-all duration-200 hover:bg-green-500/10 ${
                  selectedServerId === server._id ? 'bg-green-500/20 border-green-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 mr-2" />
                    <span className="font-medium">{server.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {server.isPrivate ? (
                      <Lock className="w-3 h-3 text-yellow-400" />
                    ) : (
                      <Globe className="w-3 h-3 text-green-600" />
                    )}
                    <div className="flex items-center text-xs text-green-600">
                      <Users className="w-3 h-3 mr-1" />
                      {server.memberCount}
                    </div>
                  </div>
                </div>
                
                {server.description && (
                  <p className="text-sm text-green-600 mb-2">{server.description}</p>
                )}
                
                <div className="flex justify-between text-xs text-green-700">
                  <span>by {server.creatorCodename}</span>
                  <span>{formatTime(server.createdAt)}</span>
                </div>

                {activeTab === 'public' ? (
                  <div className="mt-3 flex justify-end">
                    {(() => {
                      const myServers = (userServers || []).filter(Boolean) as Server[];
                      const isMember = myServers.some(s => s._id === server._id);
                      if (isMember) {
                        return (
                          <button
                            className="terminal-button px-3 py-1 rounded text-sm"
                            onClick={() => onSelectServer(server._id)}
                          >
                            OPEN
                          </button>
                        );
                      }
                      if (server.isPrivate) {
                        return (
                          <button
                            className="terminal-button px-3 py-1 rounded text-sm opacity-70 cursor-not-allowed"
                            title="Private server - ask owner to invite you"
                          >
                            PRIVATE
                          </button>
                        );
                      }
                      return (
                        <button
                          className="terminal-button-primary px-3 py-1 rounded text-sm"
                          onClick={() => handleJoinServer(server._id)}
                        >
                          JOIN
                        </button>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="mt-3 flex justify-end">
                    <button
                      className="terminal-button px-3 py-1 rounded text-sm"
                      onClick={() => onSelectServer(server._id)}
                    >
                      OPEN
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      {alreadyMemberServer && (
        <AlreadyMemberModal
          server={alreadyMemberServer}
          onClose={() => setAlreadyMemberServer(null)}
          onGoToServer={(serverId) => {
            setAlreadyMemberServer(null);
            onSelectServer(serverId);
          }}
        />
      )}
    </div>
  );
}
