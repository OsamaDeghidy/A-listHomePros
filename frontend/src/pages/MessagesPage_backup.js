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
  FaTimes,
  FaFileInvoiceDollar,
  FaQuoteLeft,
  FaHandshake,
  FaTools,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt
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
  const [participantsInfo, setParticipantsInfo] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // Refs
  const messageEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Auto-refresh interval (30 seconds)
  const POLLING_INTERVAL = 30000;

  // Check if current user is a professional
  const isProfessional = currentUser?.role === 'contractor' || currentUser?.role === 'specialist' || currentUser?.role === 'crew';

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
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
      if (conversation && (!activeConversation || activeConversation.id !== conversation.id)) {
        handleConversationSelect(conversation);
      }
    } else if (conversations.length > 0 && !activeConversation && !conversationId) {
      // Auto-select first conversation if none selected and no conversationId in URL
      handleConversationSelect(conversations[0]);
    }
  }, [conversationId, conversations, activeConversation]);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
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

    return () => {
      stopPolling();
    };
  }, [isAuthenticated, activeConversation?.id]); // Only depend on conversation id to prevent infinite loops

  // Start polling for new messages
  const startPolling = useCallback(() => {
    stopPolling(); // Clear any existing interval
    
    pollingIntervalRef.current = setInterval(() => {
      if (activeConversation && !messagesLoading && !sending) {
        console.log('🔄 Polling for new messages...');
        checkForNewMessages();
      } else {
        console.log('⏸️ Skipping poll - sending:', sending, 'loading:', messagesLoading);
      }
    }, POLLING_INTERVAL);
  }, [activeConversation?.id, messagesLoading, sending]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Check for new messages - SIMPLIFIED VERSION
  const checkForNewMessages = useCallback(async () => {
    if (!activeConversation || sending) {
      console.log('Skipping message check - conversation:', !!activeConversation, 'sending:', sending);
      return;
    }

    try {
      const response = await messagingService.getMessages(activeConversation.id);
      const serverMessages = response.data.results || [];
      
      console.log('Message check - Current:', messages.length, 'Server:', serverMessages.length);
      
      // Only update if server has different number of messages
      if (serverMessages.length !== messages.length) {
        console.log('Updating messages from server');
        setMessages(serverMessages);
        setLastFetchTime(Date.now());
        
        // Mark conversation as read
        try {
          await messagingService.markConversationAsRead(activeConversation.id);
          updateConversationReadStatus(activeConversation.id);
        } catch (markReadErr) {
          console.error('Error marking conversation as read:', markReadErr);
        }
      }
      
      // Update conversations list
      await fetchConversationsQuietly();
      
    } catch (err) {
      console.error('Error checking for new messages:', err);
    }
  }, [activeConversation?.id, messages.length, sending]);

  // Fetch conversations without loading indicator
  const fetchConversationsQuietly = useCallback(async () => {
    try {
      const response = await messagingService.getConversations();
      const conversationsData = response.data.results || [];
      
      // Update conversations with participant info
      for (const conversation of conversationsData) {
        await fetchParticipantsInfo(conversation);
      }
      
      setConversations(conversationsData);
    } catch (err) {
      console.error('Error fetching conversations quietly:', err);
    }
  }, []);

  // Fetch participant info for a conversation
  const fetchParticipantsInfo = useCallback(async (conversation) => {
    if (!conversation.participants) return;
    
    for (const participant of conversation.participants) {
      if (participant.id !== currentUser?.id && !participantsInfo[participant.id]) {
        try {
          // Try to get professional details
          const response = await alistProsService.getProfileDetail(participant.id);
          setParticipantsInfo(prev => ({
            ...prev,
            [participant.id]: response.data
          }));
        } catch (err) {
          // If not a professional, use basic user info
          setParticipantsInfo(prev => ({
            ...prev,
            [participant.id]: {
              user: participant,
              business_name: participant.name || participant.email?.split('@')[0] || 'User',
              is_verified: false
            }
          }));
        }
      }
    }
  }, [currentUser?.id, participantsInfo]);

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
  }, [refreshing, activeConversation?.id]);

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await messagingService.getConversations();
      const conversationsData = response.data.results || [];
      
      // Fetch participant info for all conversations
      for (const conversation of conversationsData) {
        await fetchParticipantsInfo(conversation);
      }
      
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
    if (activeConversation?.id === conversation.id) return; // Prevent reselecting same conversation
    
    setActiveConversation(conversation);
    navigate(`${isProfessional ? '/pro-dashboard' : '/dashboard'}/messages/${conversation.id}`, { replace: true });
    await fetchMessages(conversation.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    
    // Stop polling while sending
    stopPolling();
    
    // Create optimistic message for immediate UI update
    const optimisticMessage = {
      id: `temp_${Date.now()}`, // Use string ID for temp messages
      content: messageContent,
      sender: currentUser,
      created_at: new Date().toISOString(),
      conversation: activeConversation.id,
      is_read: false,
      isOptimistic: true // Flag to identify optimistic messages
    };

    // Add optimistic message immediately
    setMessages(prev => {
      console.log('✅ Adding optimistic message immediately:', messageContent);
      return [...prev, optimisticMessage];
    });

    setNewMessage(''); // Clear input immediately

    try {
      console.log('📤 Sending message to server:', messageContent);
      
      const response = await messagingService.sendMessage(activeConversation.id, {
        content: messageContent
      });

      console.log('✅ Message sent successfully, server response:', response.data);

      // Replace optimistic message with real message
      const realMessage = response.data;
      
      setMessages(prev => {
        console.log('🔄 Replacing optimistic message with real message');
        const filtered = prev.filter(msg => msg.id !== optimisticMessage.id);
        return [...filtered, realMessage];
      });

      // Update the conversation's last message in the sidebar
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation.id 
            ? { 
                ...conv, 
                last_message: { 
                  content: messageContent,
                  created_at: realMessage.created_at,
                  sender: currentUser
                },
                updated_at: realMessage.created_at
              }
            : conv
        )
      );

      // Force scroll to bottom
      setTimeout(() => {
        if (messageEndRef.current) {
          messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
    } catch (err) {
      console.error('❌ Error sending message:', err);
      
      // Remove optimistic message on error
      setMessages(prev => {
        console.log('🗑️ Removing failed optimistic message');
        return prev.filter(msg => msg.id !== optimisticMessage.id);
      });
      
      setError(isArabic ? 'فشل في إرسال الرسالة' : 'Failed to send message');
      setNewMessage(messageContent); // Restore message content on error
      
      // Show error details in console for debugging
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
    } finally {
      setSending(false);
      
      // Restart polling after sending
      setTimeout(() => {
        if (activeConversation) {
          startPolling();
        }
      }, 1000);
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
    if (!conversation.participants || conversation.participants.length === 0) {
      return isArabic ? 'محادثة' : 'Conversation';
    }
    
    // Find the other participant (not current user)
    const otherParticipant = conversation.participants.find(
      p => p.id !== currentUser?.id
    );
    
    if (!otherParticipant) return isArabic ? 'محادثة' : 'Conversation';
    
    // Check if we have detailed professional info
    const participantInfo = participantsInfo[otherParticipant.id];
    if (participantInfo) {
      return participantInfo.business_name || 
             participantInfo.user?.name ||
             participantInfo.user?.email?.split('@')[0] ||
             (isArabic ? 'مستخدم' : 'User');
    }
    
    // Fallback to basic participant info
    return otherParticipant.name ||
           otherParticipant.email?.split('@')[0] || 
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
              participantInfo.user?.name ||
              (isArabic ? 'مستخدم' : 'User'),
        profession: participantInfo.profession || participantInfo.business_description || (isArabic ? 'محترف' : 'Professional'),
        rating: participantInfo.average_rating,
        isVerified: participantInfo.is_verified,
        avatar: participantInfo.profile_image || participantInfo.user?.profile_picture,
        phone: participantInfo.user?.phone_number || participantInfo.phone_number,
        email: participantInfo.user?.email || otherParticipant.email,
        location: participantInfo.business_address || participantInfo.location,
        userId: otherParticipant.id
      };
    }
    
    return {
      name: otherParticipant.name ||
            otherParticipant.email?.split('@')[0] ||
            (isArabic ? 'مستخدم' : 'User'),
      profession: isArabic ? 'مستخدم' : 'User',
      rating: null,
      isVerified: false,
      avatar: otherParticipant.profile_picture,
      phone: otherParticipant.phone_number,
      email: otherParticipant.email,
      location: null,
      userId: otherParticipant.id
    };
  };

  // Handle quote creation
  const handleCreateQuote = () => {
    if (!activeConversation) return;
    
    const participantDetails = getParticipantDetails(activeConversation);
    if (participantDetails) {
      // Navigate to quote creation page with conversation context
      navigate('/pro-dashboard/quotes/create', {
        state: {
          clientId: participantDetails.userId,
          clientName: participantDetails.name,
          conversationId: activeConversation.id
        }
      });
    }
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
                  to={isProfessional ? '/pro-dashboard' : '/dashboard'}
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
                {filteredConversations.map(conversation => {
                  const participantDetails = getParticipantDetails(conversation);
                  
                  return (
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
                          {participantDetails?.avatar ? (
                            <img
                              src={participantDetails.avatar}
                              alt={participantDetails.name}
                              className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <FaUserCircle className="h-12 w-12 text-gray-400" />
                          )}
                          {conversation.unread_count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {conversation.unread_count}
                            </span>
                          )}
                          {participantDetails?.isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                              <FaShieldAlt className="h-2 w-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center">
                                <h3 className="text-sm font-medium text-gray-900 truncate mr-2">
                                  {participantDetails?.name || getParticipantName(conversation)}
                                </h3>
                                {participantDetails?.isVerified && (
                                  <FaCheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                )}
                              </div>
                              {participantDetails?.profession && (
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <FaUserTag className="h-2 w-2 mr-1" />
                                  <span className="truncate">{participantDetails.profession}</span>
                                  {participantDetails.rating && (
                                    <div className="flex items-center ml-2">
                                      <FaStar className="h-2 w-2 text-yellow-500 mr-1" />
                                      <span>{participantDetails.rating.toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatTimestamp(conversation.last_message?.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.last_message?.content || (isArabic ? 'لا توجد رسائل' : 'No messages')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
                            <div className="flex items-center text-sm text-gray-500 space-x-4">
                              {participantDetails?.profession && (
                                <div className="flex items-center">
                                  <FaUserTag className="h-3 w-3 mr-1" />
                                  <span>{participantDetails.profession}</span>
                                </div>
                              )}
                              {participantDetails?.location && (
                                <div className="flex items-center">
                                  <FaMapMarkerAlt className="h-3 w-3 mr-1" />
                                  <span className="truncate max-w-xs">{participantDetails.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Quote Button for Professionals */}
                    {isProfessional && (
                      <button
                        onClick={handleCreateQuote}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        title={isArabic ? 'إنشاء عرض سعر' : 'Create Quote'}
                      >
                        <FaFileInvoiceDollar className="h-4 w-4 mr-2" />
                        {isArabic ? 'عرض سعر' : 'Quote'}
                      </button>
                    )}
                    
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
                          {participantDetails?.email && (
                            <a
                              href={`mailto:${participantDetails.email}`}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                              title={isArabic ? 'إرسال بريد إلكتروني' : 'Send email'}
                            >
                              <FaEnvelope className="h-5 w-5" />
                            </a>
                          )}
                        </>
                      );
                    })()}
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                      <FaEllipsisV className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
                  
              {/* Messages Area */}
              <div 
                ref={chatWindowRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
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
                                  alt={senderInfo.business_name}
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
                                  {senderInfo?.business_name || message.sender?.name || message.sender?.email?.split('@')[0] || (isArabic ? 'مستخدم' : 'User')}
                                </span>
                                {senderInfo?.is_verified && (
                                  <FaCheckCircle className="h-3 w-3 text-blue-500" title={isArabic ? 'محقق' : 'Verified'} />
                                )}
                              </div>
                            )}
                            
                            <div className={`px-4 py-2 rounded-lg shadow-sm ${
                              isCurrentUserMessage
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
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
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
            >
              <div className="flex items-center">
                <span className="mr-2">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-white hover:text-gray-200"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default MessagesPage; 