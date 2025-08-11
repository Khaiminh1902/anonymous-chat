'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../lib/auth';
import { X, Server, Lock, Globe } from 'lucide-react';
import { Id } from '../../convex/_generated/dataModel';

interface CreateServerModalProps {
  onClose: () => void;
  onServerCreated: (serverId: Id<'servers'>) => void;
}

export default function CreateServerModal({ onClose, onServerCreated }: CreateServerModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const createServerMutation = useMutation(api.mutations.createServer);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setIsLoading(true);
    
    try {
      const serverId = await createServerMutation({
        name: name.trim(),
        description: description.trim() || undefined,
        userId: user._id,
        isPrivate,
        password: isPrivate && password ? password : undefined,
      });
      
      onServerCreated(serverId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to create server: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md terminal-border rounded-lg p-6 bg-black">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Server className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-bold">CREATE SERVER</h2>
          </div>
          <button
            onClick={onClose}
            className="text-green-600 hover:text-green-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-green-300">
              [SERVER NAME] *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter server name..."
              className="w-full p-3 terminal-input rounded-lg"
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-green-300">
              [DESCRIPTION]
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional server description..."
              className="w-full p-3 terminal-input rounded-lg resize-none"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="terminal-border rounded-lg p-4">
            <div className="mb-3">
              <span className="text-sm font-medium text-green-300">[PRIVACY SETTINGS]</span>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  checked={!isPrivate}
                  onChange={() => setIsPrivate(false)}
                  className="sr-only"
                />
                <div className={`flex items-center p-3 rounded-lg terminal-border transition-all duration-200 ${
                  !isPrivate ? 'bg-green-500/20 border-green-500' : 'hover:bg-green-500/10'
                }`}>
                  <Globe className="w-4 h-4 mr-3" />
                  <div>
                    <div className="font-medium">PUBLIC SERVER</div>
                    <div className="text-sm text-green-600">Anyone can join</div>
                  </div>
                </div>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  checked={isPrivate}
                  onChange={() => setIsPrivate(true)}
                  className="sr-only"
                />
                <div className={`flex items-center p-3 rounded-lg terminal-border transition-all duration-200 ${
                  isPrivate ? 'bg-green-500/20 border-green-500' : 'hover:bg-green-500/10'
                }`}>
                  <Lock className="w-4 h-4 mr-3" />
                  <div>
                    <div className="font-medium">PRIVATE SERVER</div>
                    <div className="text-sm text-green-600">Requires password</div>
                  </div>
                </div>
              </label>
            </div>

            {isPrivate && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2 text-green-300">
                  [SERVER PASSWORD] *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter server password..."
                  className="w-full p-3 terminal-input rounded-lg"
                  required={isPrivate}
                />
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 terminal-button p-3 rounded-lg font-medium"
              disabled={isLoading}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim() || (isPrivate && !password.trim())}
              className="flex-1 terminal-button-primary p-3 rounded-lg font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="typing-indicator mr-2">▓</div>
                  CREATING...
                </div>
              ) : (
                'CREATE SERVER'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
