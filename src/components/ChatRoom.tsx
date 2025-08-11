'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../lib/auth';
import { Id } from '../../convex/_generated/dataModel';
import { Send, Hash, Users, Eye, EyeOff, UserPlus } from 'lucide-react';
import InviteMembersModal from './InviteMembersModal';

interface Message {
  _id: Id<'messages'>;
  content: string;
  serverId: Id<'servers'>;
  userId: Id<'users'>;
  isAnonymous: boolean;
  timestamp: number;
  authorCodename: string;
}

interface ChatRoomProps {
  serverId: Id<'servers'>;
}

export default function ChatRoom({ serverId }: ChatRoomProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const serverInfo = useQuery(api.queries.getServerInfo, { serverId });
  const messages = useQuery(api.queries.getServerMessages, 
    user ? { serverId, userId: user._id } : 'skip'
  );
  const sendMessageMutation = useMutation(api.mutations.sendMessage);
  const [showInvite, setShowInvite] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;

    try {
      await sendMessageMutation({
        content: message.trim(),
        serverId,
        userId: user._id,
        isAnonymous,
      });
      setMessage('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to send message: ${errorMessage}`);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!serverInfo) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="typing-indicator text-2xl">▓</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="terminal-border border-l-0 border-r-0 border-t-0 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Hash className="w-6 h-6 mr-2" />
          <div>
            <h2 className="text-xl font-bold">{serverInfo.name}</h2>
            {serverInfo.description && (
              <p className="text-sm text-green-600">{serverInfo.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-sm text-green-600">
            <Users className="w-4 h-4 mr-1" />
            {serverInfo.memberCount} members
          </div>
          {user?._id === serverInfo.createdBy && (
            <button
              className="terminal-button px-3 py-1 rounded-lg text-sm"
              onClick={() => setShowInvite(true)}
              title="Invite members"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!messages || messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <div className="text-green-600 mb-2">
                [CHANNEL_EMPTY]
              </div>
              <div className="text-green-700 text-sm">
                Be the first to send a message
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg: Message) => (
              <div
                key={msg._id}
                className="terminal-border rounded-lg p-3 hover:bg-green-500/5 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className={`font-medium ${
                      msg.isAnonymous ? 'text-gray-400' : 'text-green-300'
                    }`}>
                      {msg.authorCodename}
                    </span>
                    {msg.isAnonymous && (
                      <EyeOff className="w-3 h-3 ml-1 text-gray-500" />
                    )}
                  </div>
                  <span className="text-xs text-green-700">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div className="text-green-100 break-words">
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="terminal-border border-l-0 border-r-0 border-b-0 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-green-600">
            Sending as: <span className="text-green-300 font-medium">
              {isAnonymous ? 'Anonymous' : user?.codename}
            </span>
          </div>
          <button
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`flex items-center px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
              isAnonymous 
                ? 'terminal-button-primary' 
                : 'terminal-button'
            }`}
          >
            {isAnonymous ? (
              <>
                <EyeOff className="w-4 h-4 mr-1" />
                ANONYMOUS
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-1" />
                VISIBLE
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message #${serverInfo.name}...`}
            className="flex-1 p-3 terminal-input rounded-lg"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="terminal-button-primary px-4 py-3 rounded-lg disabled:opacity-50 transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
      {showInvite && user && (
        <InviteMembersModal serverId={serverId} ownerId={user._id} onClose={() => setShowInvite(false)} />
      )}
    </div>
  );
}
