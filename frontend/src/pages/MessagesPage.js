import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { messagingService } from '../services/api';
import { 
  FaInbox, 
  FaUserCircle, 
  FaPaperPlane, 
  FaEllipsisV, 
  FaSearch, 
  FaPaperclip, 
  FaRegSmile,
  FaArrowLeft,
  FaComments,
  FaPhone,
  FaVideo
} from 'react-icons/fa';

const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // State management
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);

  // Refs
  const messageEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/dashboard/messages');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch conversations on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  // Handle conversation selection from URL parameter
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === parseInt(conversationId));
      if (conversation) {
        handleConversationSelect(conversation);
      }
    } else if (conversations.length > 0 && !activeConversation) {
      // Auto-select first conversation if none selected
      handleConversationSelect(conversations[0]);
    }
  }, [conversationId, conversations]);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await messagingService.getConversations();
      const conversationsData = response.data.results || [];
      setConversations(conversationsData);
      
      if (conversationsData.length === 0) {
        setLoading(false);
        return;
      }

      // If we have a specific conversation ID from URL, load it
      if (conversationId) {
        const targetConversation = conversationsData.find(c => c.id === parseInt(conversationId));
        if (targetConversation) {
          setActiveConversation(targetConversation);
          await fetchMessages(targetConversation.id);
        }
      } else if (conversationsData.length > 0) {
        // Otherwise load the first conversation
        setActiveConversation(conversationsData[0]);
        await fetchMessages(conversationsData[0].id);
      }
      
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(isArabic ? 'فشل في تحميل المحادثات' : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    setMessagesLoading(true);
    
    try {
      const response = await messagingService.getMessages(conversationId);
      const messagesData = response.data.results || [];
      setMessages(messagesData);
      
      // Mark conversation as read
      try {
        await messagingService.markConversationAsRead(conversationId);
        // Update local conversation state
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, unread_count: 0 }
              : conv
          )
        );
      } catch (markReadErr) {
        console.error('Error marking conversation as read:', markReadErr);
      }
      
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(isArabic ? 'فشل في تحميل الرسائل' : 'Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleConversationSelect = async (conversation) => {
    setActiveConversation(conversation);
    navigate(`/dashboard/messages/${conversation.id}`, { replace: true });
    await fetchMessages(conversation.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      const response = await messagingService.sendMessage(activeConversation.id, {
        content: messageContent
      });

      // Add the new message to the local state
      const newMessageObj = response.data;
      setMessages(prev => [...prev, newMessageObj]);

      // Update the conversation's last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation.id 
            ? { 
                ...conv, 
                last_message: { 
                  content: messageContent,
                  created_at: newMessageObj.created_at 
                }
              }
            : conv
        )
      );

    } catch (err) {
      console.error('Error sending message:', err);
      setError(isArabic ? 'فشل في إرسال الرسالة' : 'Failed to send message');
      setNewMessage(messageContent); // Restore message content on error
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // If message is from today, show time only
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If message is from yesterday, show "Yesterday"
    if (date.toDateString() === yesterday.toDateString()) {
      return isArabic ? 'أمس' : 'Yesterday';
    }
    
    // Otherwise show date
    return date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getParticipantName = (conversation) => {
    if (!conversation.participants) return isArabic ? 'محادثة' : 'Conversation';
    
    // Find the other participant (not current user)
    const otherParticipant = conversation.participants.find(
      p => p.id !== currentUser?.id
    );
    
    return otherParticipant?.first_name + ' ' + otherParticipant?.last_name || 
           otherParticipant?.email || 
           (isArabic ? 'مستخدم' : 'User');
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation => {
    const participantName = getParticipantName(conversation);
    const lastMessageContent = conversation.last_message?.content || '';
    const searchLower = searchTerm.toLowerCase();
    
    return participantName.toLowerCase().includes(searchLower) ||
           lastMessageContent.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">{isArabic ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isArabic ? 'الرسائل | A-List Home Pros' : 'Messages | A-List Home Pros'}</title>
      </Helmet>

      <div className="h-screen flex bg-gray-100">
        {/* Conversations Sidebar */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {isArabic ? 'الرسائل' : 'Messages'}
              </h1>
              <Link
                to="/dashboard"
                className="text-blue-600 hover:text-blue-800"
              >
                <FaArrowLeft className="h-5 w-5" />
              </Link>
            </div>
            
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={isArabic ? 'البحث في المحادثات...' : 'Search conversations...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center">
                <FaComments className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  {isArabic ? 'لا توجد محادثات' : 'No conversations'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredConversations.map(conversation => (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`p-4 cursor-pointer transition-colors ${
                      activeConversation?.id === conversation.id 
                        ? 'bg-blue-50 border-r-2 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 relative">
                        <FaUserCircle className="h-12 w-12 text-gray-400" />
                        {conversation.unread_count > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {getParticipantName(conversation)}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(conversation.last_message?.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.last_message?.content || (isArabic ? 'لا توجد رسائل' : 'No messages')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaUserCircle className="h-10 w-10 text-gray-400 mr-3" />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {getParticipantName(activeConversation)}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {activeConversation.title || (isArabic ? 'محادثة' : 'Conversation')}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                      <FaPhone className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                      <FaVideo className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                      <FaEllipsisV className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={chatWindowRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {messagesLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <FaComments className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      {isArabic ? 'ابدأ المحادثة بإرسال رسالة' : 'Start the conversation by sending a message'}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((message, index) => {
                      const isCurrentUserMessage = message.sender?.id === currentUser?.id;
                      
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isCurrentUserMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isCurrentUserMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isCurrentUserMessage ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTimestamp(message.created_at)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
                <div ref={messageEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <FaPaperclip className="h-5 w-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={isArabic ? 'اكتب رسالة...' : 'Type a message...'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={sending}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FaRegSmile className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <FaPaperPlane className="h-5 w-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <FaComments className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isArabic ? 'اختر محادثة للبدء' : 'Select a conversation to start'}
                </h3>
                <p className="text-gray-500">
                  {isArabic 
                    ? 'اختر محادثة من القائمة للبدء في المراسلة'
                    : 'Choose a conversation from the list to start messaging'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Toast */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            <div className="flex items-center">
              <span className="mr-2">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default MessagesPage; 