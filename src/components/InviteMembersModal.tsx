'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { X, UserPlus, Search } from 'lucide-react';

interface InviteMembersModalProps {
  serverId: Id<'servers'>;
  ownerId: Id<'users'>;
  onClose: () => void;
}

interface SearchResult {
  _id: Id<'users'>;
  codename: string;
  userCode?: string;
}

export default function InviteMembersModal({ serverId, ownerId, onClose }: InviteMembersModalProps) {
  const [userCode, setUserCode] = useState('');
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  const results = useQuery(api.queries.searchUsersByCodename, query.trim() ? { q: query } : 'skip');
  const userByCode = useQuery(api.queries.getUserByCode, userCode.trim() ? { userCode: userCode.trim() } : 'skip');
  const inviteMutation = useMutation(api.mutations.inviteToPrivateServer);

  useEffect(() => {
    if (!query.trim()) setSelectedUser(null);
  }, [query]);

  const handleInvite = async (targetUserId: Id<'users'>) => {
    try {
      setIsInviting(true);
      await inviteMutation({ serverId, ownerId, targetUserId });
      onClose();
    } catch (e) {
      alert(`Failed to invite: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsInviting(false);
    }
  };

  const handleInviteByCode = async () => {
    if (!userCode.trim()) return;
    try {
      setIsInviting(true);
      if (!userByCode) {
        alert('No user found with that ID');
        return;
      }
      await inviteMutation({ serverId, ownerId, targetUserId: userByCode._id as Id<'users'> });
      onClose();
    } catch (e) {
      alert(`Failed to invite: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg terminal-border rounded-lg p-6 bg-black">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <UserPlus className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-bold">INVITE MEMBERS</h2>
          </div>
          <button onClick={onClose} className="text-green-600 hover:text-green-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-green-300">[INVITE BY USER ID]</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="Enter user's ID (shown next to their name)"
                className="flex-1 p-3 terminal-input rounded-lg"
              />
              <button
                type="button"
                disabled={isInviting || !userCode.trim()}
                className="terminal-button-primary px-4 rounded-lg disabled:opacity-50"
                onClick={handleInviteByCode}
              >
                INVITE
              </button>
            </div>
          </div>

          <div className="terminal-border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Search className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium text-green-300">[SEARCH BY CODENAME]</span>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search codename..."
              className="w-full p-3 terminal-input rounded-lg mb-3"
            />
            <div className="max-h-48 overflow-y-auto space-y-2">
              {Array.isArray(results) && results.length > 0 ? (
                results.map((u: SearchResult) => (
                  <div
                    key={u._id}
                    className={`flex items-center justify-between terminal-border rounded-lg p-2 ${selectedUser?._id === u._id ? 'bg-green-500/10 border-green-500' : ''}`}
                  >
                    <div>
                      <div className="font-medium">{u.codename}</div>
                      {u.userCode && (
                        <div className="text-xs text-green-600">ID: {u.userCode}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="terminal-button-primary px-3 py-1 rounded text-sm"
                      onClick={() => handleInvite(u._id)}
                    >
                      INVITE
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-green-700">No results</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

