import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { messagingService, alistProsService } from '../services/api';
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
  FaVideo,
  FaBell,
  FaCircle,
  FaCheckCircle,
  FaCheck,
  FaClock,
  FaSyncAlt,
  FaUserTag,
  FaStar,
  FaShieldAlt,
  FaTimes
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
  const [lastFetchTime, setLastFetchTime] = useState(Date.now());
  const [newMessageNotifications, setNewMessageNotifications] = useState([]);
  const [participantsInfo, setParticipantsInfo] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Refs
  const messageEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  // Auto-refresh interval (30 seconds)
  const POLLING_INTERVAL = 30000;

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
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Notification permission granted');
          }
        });
      }
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

  // Setup auto-refresh polling
  useEffect(() => {
    if (isAuthenticated && activeConversation) {
      startPolling();
    } else {
      stopPolling();
    }

    // Cleanup on unmount
    return () => {
      stopPolling();
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [isAuthenticated, activeConversation]);

  // Start polling for new messages
  const startPolling = useCallback(() => {
    stopPolling(); // Clear any existing interval
    
    pollingIntervalRef.current = setInterval(() => {
      if (activeConversation && !messagesLoading && !sending) {
        checkForNewMessages();
      }
    }, POLLING_INTERVAL);
  }, [activeConversation, messagesLoading, sending]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Check for new messages without showing loading
  const checkForNewMessages = useCallback(async () => {
    if (!activeConversation) return;

    try {
      const response = await messagingService.getMessages(activeConversation.id);
      const newMessagesData = response.data.results || [];
      
      // Check if there are new messages
      const currentMessageIds = messages.map(m => m.id);
      const newMessages = newMessagesData.filter(msg => !currentMessageIds.includes(msg.id));
      
      if (newMessages.length > 0) {
        setMessages(newMessagesData);
        setLastFetchTime(Date.now());
        
        // Show notification for new messages from others
        const messagesFromOthers = newMessages.filter(msg => msg.sender?.id !== currentUser?.id);
        if (messagesFromOthers.length > 0) {
          showNewMessageNotification(messagesFromOthers[messagesFromOthers.length - 1]);
        }
        
        // Mark conversation as read
        try {
          await messagingService.markConversationAsRead(activeConversation.id);
          updateConversationReadStatus(activeConversation.id);
        } catch (markReadErr) {
          console.error('Error marking conversation as read:', markReadErr);
        }
      }
      
      // Also update conversations list to get latest timestamps
      await fetchConversationsQuietly();
      
    } catch (err) {
      console.error('Error checking for new messages:', err);
    }
  }, [activeConversation, messages, currentUser]);

  // Fetch conversations without loading indicator
  const fetchConversationsQuietly = useCallback(async () => {
    try {
      const response = await messagingService.getConversations();
      const conversationsData = response.data.results || [];
      setConversations(conversationsData);
    } catch (err) {
      console.error('Error fetching conversations quietly:', err);
    }
  }, []);

  // Show new message notification
  const showNewMessageNotification = useCallback((message) => {
    const notification = {
      id: Date.now(),
      message,
      senderName: getMessageSenderName(message),
      timestamp: new Date()
    };
    
    setNewMessageNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNewMessageNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
    
    // Browser notification if supported and permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${notification.senderName}`, {
        body: message.content,
        icon: '/logo192.png',
        badge: '/logo192.png'
      });
    }
  }, []);

  // Get sender name for message
  const getMessageSenderName = useCallback((message) => {
    if (!message.sender) return isArabic ? 'مستخدم' : 'User';
    
    const participantInfo = participantsInfo[message.sender.id];
    if (participantInfo) {
      return participantInfo.business_name || 
             `${participantInfo.user?.first_name || ''} ${participantInfo.user?.last_name || ''}`.trim() ||
             participantInfo.user?.name ||
             participantInfo.user?.email ||
             (isArabic ? 'مستخدم' : 'User');
    }
    
    return `${message.sender.first_name || ''} ${message.sender.last_name || ''}`.trim() ||
           message.sender.name ||
           message.sender.email ||
           (isArabic ? 'مستخدم' : 'User');
  }, [participantsInfo, isArabic]);

  // Fetch participant info (professional details)
  const fetchParticipantInfo = useCallback(async (userId) => {
    if (participantsInfo[userId]) return; // Already fetched
    
    try {
      // Try to get professional details
      const response = await alistProsService.getProfileDetail(userId);
      setParticipantsInfo(prev => ({
        ...prev,
        [userId]: response.data
      }));
    } catch (err) {
      // If not a professional, we'll use basic user info from conversation
      console.log(`User ${userId} is not a professional or error fetching details:`, err.message);
    }
  }, [participantsInfo]);

  // Update conversation read status
  const updateConversationReadStatus = useCallback((conversationId) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread_count: 0 }
          : conv
      )
    );
  }, []);

  // Manual refresh function
  const handleManualRefresh = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      await fetchConversations();
      if (activeConversation) {
        await fetchMessages(activeConversation.id);
      }
    } catch (err) {
      console.error('Error during manual refresh:', err);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, activeConversation]);

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
      
      // Fetch participant info for all message senders
      const senderIds = [...new Set(messagesData.map(msg => msg.sender?.id).filter(Boolean))];
      await Promise.all(senderIds.map(senderId => fetchParticipantInfo(senderId)));
      
      // Mark conversation as read
      try {
        await messagingService.markConversationAsRead(conversationId);
        updateConversationReadStatus(conversationId);
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
    
    if (!otherParticipant) return isArabic ? 'محادثة' : 'Conversation';
    
    // Check if we have detailed professional info
    const participantInfo = participantsInfo[otherParticipant.id];
    if (participantInfo) {
      return participantInfo.business_name || 
             `${participantInfo.user?.first_name || ''} ${participantInfo.user?.last_name || ''}`.trim() ||
             participantInfo.user?.name ||
             participantInfo.user?.email ||
             (isArabic ? 'مستخدم' : 'User');
    }
    
    // Fallback to basic participant info
    return `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.trim() ||
           otherParticipant.name ||
           otherParticipant.email || 
           (isArabic ? 'مستخدم' : 'User');
  };

  // Get participant details for conversation header
  const getParticipantDetails = (conversation) => {
    if (!conversation.participants) return null;
    
    const otherParticipant = conversation.participants.find(
      p => p.id !== currentUser?.id
    );
    
    if (!otherParticipant) return null;
    
    const participantInfo = participantsInfo[otherParticipant.id];
    if (participantInfo) {
      return {
        name: participantInfo.business_name || 
              `${participantInfo.user?.first_name || ''} ${participantInfo.user?.last_name || ''}`.trim() ||
              participantInfo.user?.name ||
              (isArabic ? 'مستخدم' : 'User'),
        profession: participantInfo.profession || participantInfo.business_description || (isArabic ? 'محترف' : 'Professional'),
        rating: participantInfo.average_rating,
        isVerified: participantInfo.is_verified,
        avatar: participantInfo.profile_image || participantInfo.user?.profile_picture,
        phone: participantInfo.user?.phone_number,
        email: participantInfo.user?.email
      };
    }
    
    return {
      name: `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.trim() ||
            otherParticipant.name ||
            (isArabic ? 'مستخدم' : 'User'),
      profession: isArabic ? 'مستخدم' : 'User',
      rating: null,
      isVerified: false,
      avatar: otherParticipant.profile_picture,
      phone: otherParticipant.phone_number,
      email: otherParticipant.email
    };
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
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={handleManualRefresh}
                  disabled={refreshing}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                  title={isArabic ? 'تحديث الرسائل' : 'Refresh messages'}
                >
                  <FaSyncAlt className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <Link
                  to="/dashboard"
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-colors"
                  title={isArabic ? 'العودة للوحة التحكم' : 'Back to dashboard'}
                >
                  <FaArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
            
            {/* Auto-update indicator */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-xs text-gray-500">
                <FaCircle className="h-2 w-2 text-green-500 mr-1 animate-pulse" />
                <span>{isArabic ? 'تحديث تلقائي كل 30 ثانية' : 'Auto-refresh every 30s'}</span>
              </div>
              <div className="text-xs text-gray-400">
                {isArabic ? 'آخر تحديث: ' : 'Last update: '}
                {new Date(lastFetchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
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
                    {(() => {
                      const participantDetails = getParticipantDetails(activeConversation);
                      return (
                        <>
                          <div className="relative mr-3">
                            {participantDetails?.avatar ? (
                              <img
                                src={participantDetails.avatar}
                                alt={participantDetails.name}
                                className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <FaUserCircle className="h-12 w-12 text-gray-400" />
                            )}
                            {participantDetails?.isVerified && (
                              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                                <FaShieldAlt className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h2 className="text-lg font-semibold text-gray-900 mr-2">
                                {participantDetails?.name || getParticipantName(activeConversation)}
                              </h2>
                              {participantDetails?.isVerified && (
                                <FaCheckCircle className="h-4 w-4 text-blue-500" title={isArabic ? 'محقق' : 'Verified'} />
                              )}
                              {participantDetails?.rating && (
                                <div className="flex items-center mr-2">
                                  <FaStar className="h-3 w-3 text-yellow-500 mr-1" />
                                  <span className="text-sm text-gray-600">{participantDetails.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <FaUserTag className="h-3 w-3 mr-1" />
                              <span>{participantDetails?.profession}</span>
                              {participantDetails?.phone && (
                                <span className="ml-2">• {participantDetails.phone}</span>
                              )}
                      </div>
                    </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex space-x-2">
                    {(() => {
                      const participantDetails = getParticipantDetails(activeConversation);
                      return (
                        <>
                          {participantDetails?.phone && (
                            <a
                              href={`tel:${participantDetails.phone}`}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                              title={isArabic ? 'اتصال هاتفي' : 'Phone call'}
                            >
                              <FaPhone className="h-5 w-5" />
                            </a>
                          )}
                        </>
                      );
                    })()}
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                      <FaVideo className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
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
                      const senderName = getMessageSenderName(message);
                      const senderInfo = participantsInfo[message.sender?.id];
                      
                      return (
                        <motion.div
                            key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isCurrentUserMessage ? 'justify-end' : 'justify-start'} mb-4`}
                        >
                          {!isCurrentUserMessage && (
                            <div className="flex-shrink-0 mr-3">
                              {senderInfo?.profile_image || senderInfo?.user?.profile_picture ? (
                                <img
                                  src={senderInfo.profile_image || senderInfo.user.profile_picture}
                                  alt={senderName}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <FaUserCircle className="h-8 w-8 text-gray-400" />
                              )}
                              </div>
                          )}
                          
                          <div className={`max-w-xs lg:max-w-md ${isCurrentUserMessage ? 'text-right' : 'text-left'}`}>
                            {/* Sender name for received messages */}
                            {!isCurrentUserMessage && (
                              <div className="flex items-center mb-1">
                                <span className="text-xs font-medium text-gray-700 mr-2">
                                  {senderName}
                                </span>
                                {senderInfo?.is_verified && (
                                  <FaCheckCircle className="h-3 w-3 text-blue-500" title={isArabic ? 'محقق' : 'Verified'} />
                                )}
                                {senderInfo?.profession && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    • {senderInfo.profession}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <div className={`px-4 py-2 rounded-lg shadow-sm ${
                              isCurrentUserMessage
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            
                            {/* Message timestamp and status */}
                            <div className={`flex items-center mt-1 text-xs text-gray-500 ${
                              isCurrentUserMessage ? 'justify-end' : 'justify-start'
                            }`}>
                              <span>{formatTimestamp(message.created_at)}</span>
                              {isCurrentUserMessage && (
                                <div className="ml-2 flex items-center">
                                  {message.is_read ? (
                                    <FaCheckCircle className="h-3 w-3 text-blue-500" title={isArabic ? 'تم القراءة' : 'Read'} />
                                  ) : (
                                    <FaCheck className="h-3 w-3 text-gray-400" title={isArabic ? 'تم الإرسال' : 'Sent'} />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {isCurrentUserMessage && (
                            <div className="flex-shrink-0 ml-3">
                              {currentUser?.profile_picture ? (
                                <img
                                  src={currentUser.profile_picture}
                                  alt={currentUser.name || currentUser.email}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <FaUserCircle className="h-8 w-8 text-blue-500" />
                              )}
                            </div>
                          )}
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

        {/* New Message Notifications */}
        <AnimatePresence>
          {newMessageNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50"
              style={{ top: `${80 + index * 70}px` }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaBell className="h-5 w-5 text-blue-600" />
          </div>
        </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {isArabic ? 'رسالة جديدة من' : 'New message from'} {notification.senderName}
                  </p>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {notification.message.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimestamp(notification.message.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setNewMessageNotifications(prev => 
                    prev.filter(n => n.id !== notification.id)
                  )}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default MessagesPage; 