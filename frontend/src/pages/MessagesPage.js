import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import messageService from '../services/messageService';
import { alistProsService } from '../services/api';
import InstallmentQuoteModal from '../components/modals/InstallmentQuoteModal';
import PaymentMilestones from '../components/payments/PaymentMilestones';
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
  FaCalendarAlt,
  FaImage,
  FaFile,
  FaMicrophone,
  FaThumbsUp,
  FaHeart,
  FaLaugh,
  FaSurprise,
  FaSadTear,
  FaAngry,
  FaEdit,
  FaTrash,
  FaReply,
  FaUsers,
  FaUserPlus,
  FaArchive,
  FaDownload
} from 'react-icons/fa';

const REACTION_ICONS = {
  '👍': <FaThumbsUp className="text-blue-500" />,
  '❤️': <FaHeart className="text-red-500" />,
  '😂': <FaLaugh className="text-yellow-500" />,
  '😮': <FaSurprise className="text-purple-500" />,
  '😢': <FaSadTear className="text-blue-400" />,
  '😠': <FaAngry className="text-red-600" />
};

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
  const [showInstallmentQuoteModal, setShowInstallmentQuoteModal] = useState(false);
  
  // Enhanced states for new features
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [showParticipantMenu, setShowParticipantMenu] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [recordingAudio, setRecordingAudio] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  // Service Request states
  const [showServiceRequestModal, setShowServiceRequestModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showClientActionsMenu, setShowClientActionsMenu] = useState(false);
  const [serviceRequestData, setServiceRequestData] = useState({
    title: '',
    description: '',
    budget_max: '',
    urgency: 'medium',
    flexible_schedule: true
  });
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    description: '',
    address: '',
    professionalId: null,
    selectedSlot: null
  });
  const [creatingServiceRequest, setCreatingServiceRequest] = useState(false);
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Refs
  const messageEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const audioRecorderRef = useRef(null);

  // Auto-refresh interval (30 seconds)
  const POLLING_INTERVAL = 30000;
  const SHORT_POLLING_INTERVAL = 5000; // 5 seconds for after sending messages

  // Check if current user is a professional
  const isProfessional = currentUser?.role === 'contractor' || currentUser?.role === 'specialist' || currentUser?.role === 'crew';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showClientActionsMenu && !event.target.closest('.client-actions-menu')) {
        setShowClientActionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showClientActionsMenu]);

  // Fetch availability when appointment modal opens
  useEffect(() => {
    if (showAppointmentModal && appointmentData.professionalId) {
      console.log('📅 Fetching availability for professional:', appointmentData.professionalId);
      fetchAvailabilitySlots(appointmentData.professionalId);
    }
  }, [showAppointmentModal, appointmentData.professionalId]);

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
      console.log('⏸️ Skipping message check - conversation:', !!activeConversation, 'sending:', sending);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token available for message check');
        return;
      }

      const response = await messageService.getMessages(token, activeConversation.id);
      const serverMessages = response.data.results || response.data || [];
      
      console.log('📨 Message check - Current:', messages.length, 'Server:', serverMessages.length);
      
      // Get current optimistic messages (messages being sent)
      const optimisticMessages = messages.filter(msg => 
        typeof msg.id === 'string' && msg.id.startsWith('temp_')
      );
      
      // If we have optimistic messages and server doesn't have them yet, keep them
      if (optimisticMessages.length > 0) {
        console.log('📌 Keeping', optimisticMessages.length, 'optimistic messages');
        
        // Check if the optimistic messages were successfully sent
        // by looking for messages with same content in server response
        const sentOptimisticMessages = optimisticMessages.filter(optMsg => {
          return serverMessages.some(serverMsg => 
            serverMsg.content === optMsg.content && 
            serverMsg.sender.id === optMsg.sender.id &&
            // Check if server message was created recently (within last 30 seconds)
            new Date(serverMsg.created_at) > new Date(Date.now() - 30000)
          );
        });
        
        // Remove optimistic messages that were successfully sent
        const remainingOptimisticMessages = optimisticMessages.filter(optMsg => {
          return !sentOptimisticMessages.some(sentMsg => sentMsg.id === optMsg.id);
        });
        
        // Combine server messages with remaining optimistic messages
        const combinedMessages = [...serverMessages, ...remainingOptimisticMessages];
        
        // Sort by created_at to maintain order
        combinedMessages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        setMessages(combinedMessages);
      } else {
        // No optimistic messages, safe to update from server
        setMessages(serverMessages);
      }
      
      setLastFetchTime(Date.now());
      
      // Mark conversation as read
      try {
        await messageService.markConversationAsRead(token, activeConversation.id);
        updateConversationReadStatus(activeConversation.id);
      } catch (markReadErr) {
        console.error('Error marking conversation as read:', markReadErr);
      }
      
      // Update conversations list
      await fetchConversationsQuietly();
      
    } catch (err) {
      console.error('❌ Error checking for new messages:', err);
    }
  }, [activeConversation?.id, messages, sending]);

  // Start polling for new messages
  const startPolling = useCallback((shortInterval = false) => {
    stopPolling();
    
    const interval = shortInterval ? SHORT_POLLING_INTERVAL : POLLING_INTERVAL;
    console.log(`🔄 Starting polling with ${interval/1000}s interval`);
    
    pollingIntervalRef.current = setInterval(() => {
      if (activeConversation && !messagesLoading && !sending) {
        console.log('🔄 Polling for new messages...');
        checkForNewMessages();
      } else {
        console.log('⏸️ Skipping poll - sending:', sending, 'loading:', messagesLoading);
      }
    }, interval);
  }, [activeConversation?.id, messagesLoading, sending, checkForNewMessages, stopPolling]);

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
  }, [isAuthenticated, activeConversation?.id, startPolling, stopPolling]);

  // Fetch conversations without loading indicator
  const fetchConversationsQuietly = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token available for conversations fetch');
        return;
      }

      const response = await messageService.getUserConversations(token);
      const conversationsData = response.data.results || response.data || [];
      
      // Debug: طباعة البيانات للتحقق - Print data for debugging
      console.log('🔍 DEBUG: Conversations data from API:', conversationsData);
      if (conversationsData.length > 0) {
        console.log('🔍 DEBUG: Sample conversation structure:', conversationsData[0]);
      }
      
      // Fetch participant info for all conversations
      for (const conversation of conversationsData) {
        await fetchParticipantsInfo(conversation);
      }
      
      setConversations(conversationsData);
    } catch (err) {
      console.error('Error fetching conversations quietly:', err);
    }
  }, []);

  // Fetch participant info for a conversation (now simplified since we get other_participant from API)
  const fetchParticipantsInfo = useCallback(async (conversation) => {
    // Skip if we already have other_participant data from ConversationListSerializer
    if (conversation.other_participant) {
      console.log('🔍 DEBUG: Skipping fetchParticipantsInfo - already have other_participant data');
      return;
    }
    
    // Only fetch for legacy support or if participants array exists without other_participant
    if (!conversation.participants) return;
    
    console.log('🔍 DEBUG: fetchParticipantsInfo for conversation:', conversation.id);
    console.log('🔍 DEBUG: Current participantsInfo state:', participantsInfo);
    
    for (const participant of conversation.participants) {
      console.log('🔍 DEBUG: Processing participant:', participant);
      
      if (participant.id !== currentUser?.id && !participantsInfo[participant.id]) {
        try {
          console.log('🔍 DEBUG: Fetching professional details for participant:', participant.id);
      // Try to get professional details
          const response = await alistProsService.getProfileDetail(participant.id);
          console.log('🔍 DEBUG: Professional details response:', response.data);
          
      setParticipantsInfo(prev => ({
        ...prev,
            [participant.id]: response.data
      }));
    } catch (err) {
          console.log('🔍 DEBUG: Failed to get professional details, using basic info:', err.message);
          console.log('🔍 DEBUG: Basic participant info:', participant);
          
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
      } else {
        console.log('🔍 DEBUG: Skipping participant (current user or already loaded):', participant.id);
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
      const token = localStorage.getItem('token');
      if (!token) {
        setError(isArabic ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
        setLoading(false);
        return;
      }

      const response = await messageService.getUserConversations(token);
      const conversationsData = response.data.results || response.data || [];
      
      // Debug: طباعة البيانات للتحقق - Print data for debugging
      console.log('🔍 DEBUG: Conversations data from API:', conversationsData);
      if (conversationsData.length > 0) {
        console.log('🔍 DEBUG: Sample conversation structure:', conversationsData[0]);
      }
      
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
      const token = localStorage.getItem('token');
      if (!token) {
        setError(isArabic ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
        setMessagesLoading(false);
        return;
      }

      const response = await messageService.getMessages(token, conversationId);
      const messagesData = response.data.results || response.data || [];
      setMessages(messagesData);
      
      // Mark conversation as read
      try {
        await messageService.markConversationAsRead(token, conversationId);
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
    if (activeConversation?.id === conversation.id) return;
    
    setActiveConversation(conversation);
    navigate(`${isProfessional ? '/pro-dashboard' : '/dashboard'}/messages/${conversation.id}`, { replace: true });
    await fetchMessages(conversation.id);
  };

  // Enhanced send message with attachments support
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachmentPreview) || !activeConversation || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    
    // Stop polling while sending
    stopPolling();
    
    // Get token
    const token = localStorage.getItem('token');
    if (!token) {
      setError(isArabic ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      setSending(false);
      return;
    }
    
    // Create optimistic message for immediate UI update
    const optimisticMessage = {
      id: `temp_${Date.now()}`,
      content: messageContent,
      sender: currentUser,
      created_at: new Date().toISOString(),
      conversation: activeConversation.id,
      is_read: false,
      isOptimistic: true,
      reply_to: replyingTo,
      message_type: attachmentPreview?.type || 'TEXT',
      image: attachmentPreview?.type === 'IMAGE' ? attachmentPreview.preview : null,
      file_name: attachmentPreview?.type === 'FILE' ? attachmentPreview.name : null,
    };

    // Add optimistic message immediately
    setMessages(prev => {
      console.log('✅ Adding optimistic message immediately:', messageContent);
      console.log('📊 Previous messages count:', prev.length);
      const newMessages = [...prev, optimisticMessage];
      console.log('📊 New messages count:', newMessages.length);
      return newMessages;
    });

    setNewMessage('');
    setReplyingTo(null);
    setAttachmentPreview(null);

    try {
      console.log('📤 Sending message to server:', messageContent);
      
      let response;
      if (attachmentPreview) {
        // Send message with attachment
        response = await messageService.sendMessageWithAttachment(
          token, 
          activeConversation.id, 
          {
            content: messageContent,
            messageType: attachmentPreview.type,
            replyTo: replyingTo?.id
          },
          attachmentPreview.file
        );
      } else {
        // Send regular text message
        response = await messageService.sendMessage(token, activeConversation.id, {
          content: messageContent,
          reply_to: replyingTo?.id
        });
      }

      console.log('✅ Message sent successfully, server response:', response.data);

      // Replace optimistic message with real message
      const realMessage = response.data;
      
      setMessages(prev => {
        console.log('🔄 Replacing optimistic message with real message');
        // Remove the optimistic message and add the real one
        const filtered = prev.filter(msg => msg.id !== optimisticMessage.id);
        const newMessages = [...filtered, realMessage];
        // Sort to ensure proper order
        newMessages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        return newMessages;
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
      
      // Restore the message content so user can try again
      setNewMessage(messageContent);
      
      // Show user-friendly error message
      if (err.response?.status === 404) {
        setError(isArabic ? 'المحادثة غير موجودة' : 'Conversation not found');
      } else if (err.response?.status === 403) {
        setError(isArabic ? 'ليس لديك صلاحية لإرسال رسائل في هذه المحادثة' : 'You do not have permission to send messages in this conversation');
      } else if (err.response?.status === 500) {
        setError(isArabic ? 'خطأ في الخادم. يرجى المحاولة مرة أخرى' : 'Server error. Please try again');
      } else {
        setError(isArabic ? 'فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى' : 'Failed to send message. Please try again');
      }
      
      // Show error details in console for debugging
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
    } finally {
      setSending(false);
      
      // Restart polling after a delay with shorter interval initially
      setTimeout(() => {
        if (activeConversation) {
          // Start with short interval to quickly sync after sending
          startPolling(true);
          // Do an immediate check for new messages
          checkForNewMessages();
          
          // After 15 seconds, switch back to normal interval
          setTimeout(() => {
            if (activeConversation) {
              startPolling(false);
            }
          }, 15000);
        }
      }, 1000); // Wait 1 second before restarting polling
    }
  };

  // Handle message reactions
  const handleReaction = async (messageId, reactionType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError(isArabic ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
        return;
      }

      // Try to call the function, if it doesn't exist, handle locally
      try {
        if (messageService.addReaction) {
          await messageService.addReaction(token, activeConversation.id, messageId, reactionType);
        } else {
          console.log('Reaction feature not implemented in backend yet');
        }
      } catch (apiErr) {
        console.log('Reaction API not available, handling locally');
      }

      // Update message in local state
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const updatedReactions = msg.reactions || [];
          const existingReaction = updatedReactions.find(r => r.user.id === currentUser.id);
          if (existingReaction) {
            existingReaction.reaction_type = reactionType;
          } else {
            updatedReactions.push({
              user: currentUser,
              reaction_type: reactionType
            });
          }
          return { ...msg, reactions: updatedReactions };
        }
        return msg;
      }));
      setShowReactionPicker(null);
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
  };

  // Handle message edit
  const handleEditMessage = async (messageId, newContent) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError(isArabic ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
        return;
      }

      // Try to call the function, if it doesn't exist, handle locally
      try {
        if (messageService.editMessage) {
          await messageService.editMessage(token, activeConversation.id, messageId, newContent);
        } else {
          console.log('Edit message feature not implemented in backend yet');
        }
      } catch (apiErr) {
        console.log('Edit message API not available, handling locally');
      }

      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, is_edited: true, edited_at: new Date().toISOString() }
          : msg
      ));
      setEditingMessage(null);
    } catch (err) {
      console.error('Error editing message:', err);
      setError(isArabic ? 'فشل في تعديل الرسالة' : 'Failed to edit message');
    }
  };

  // Handle message delete
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذه الرسالة؟' : 'Are you sure you want to delete this message?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError(isArabic ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
        return;
      }

      await messageService.deleteMessage(token, messageId);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_deleted: true, deleted_at: new Date().toISOString() }
          : msg
      ));
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(isArabic ? 'فشل في حذف الرسالة' : 'Failed to delete message');
    }
  };

  // Handle file attachment
  const handleFileAttachment = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(isArabic ? 'حجم الملف كبير جداً (الحد الأقصى 10 ميجابايت)' : 'File size too large (max 10MB)');
      return;
    }
    
    setAttachmentPreview({
      type: 'FILE',
      file: file,
      name: file.name,
      size: file.size,
      preview: null
    });
    setShowAttachmentMenu(false);
  };

  // Handle image attachment
  const handleImageAttachment = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      setError(isArabic ? 'الرجاء اختيار ملف صورة' : 'Please select an image file');
      return;
    }
    
    // Check file size (max 5MB for images)
    if (file.size > 5 * 1024 * 1024) {
      setError(isArabic ? 'حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)' : 'Image size too large (max 5MB)');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachmentPreview({
        type: 'IMAGE',
        file: file,
        name: file.name,
        size: file.size,
        preview: reader.result
      });
    };
    reader.readAsDataURL(file);
    setShowAttachmentMenu(false);
  };

  // Search users for new conversation
  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setUserSearchResults([]);
      return;
    }
    
    setSearchingUsers(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError(isArabic ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
        setSearchingUsers(false);
        return;
      }

      // Try to call the function, if it doesn't exist, handle locally
      try {
        if (messageService.searchUsers) {
          const response = await messageService.searchUsers(token, query);
          setUserSearchResults(response.data.results || response.data || []);
        } else {
          console.log('User search feature not implemented in backend yet');
          setUserSearchResults([]);
        }
      } catch (apiErr) {
        console.log('User search API not available');
        setUserSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setSearchingUsers(false);
    }
  };

  // Create new conversation
  const createNewConversation = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError(isArabic ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
        return;
      }

      const response = await messageService.createConversation(token, {
        participants: [userId]
      });
      const newConversation = response.data;
      setConversations(prev => [newConversation, ...prev]);
      handleConversationSelect(newConversation);
      setUserSearchQuery('');
      setUserSearchResults([]);
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(isArabic ? 'فشل في إنشاء المحادثة' : 'Failed to create conversation');
    }
  };

  // Archive conversation
  const handleArchiveConversation = async () => {
    if (!activeConversation) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError(isArabic ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
        return;
      }

      // Try to call the function, if it doesn't exist, handle locally
      try {
        if (messageService.archiveConversation) {
          await messageService.archiveConversation(token, activeConversation.id);
        } else {
          console.log('Archive conversation feature not implemented in backend yet');
        }
      } catch (apiErr) {
        console.log('Archive conversation API not available, handling locally');
      }

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id 
          ? { ...conv, is_archived: !conv.is_archived }
          : conv
      ));
    } catch (err) {
      console.error('Error archiving conversation:', err);
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
    console.log('🔍 DEBUG: getParticipantName for conversation:', conversation.id);
    console.log('🔍 DEBUG: Conversation structure:', conversation);
    console.log('🔍 DEBUG: other_participant:', conversation.other_participant);
    console.log('🔍 DEBUG: title:', conversation.title);
    
    // For group conversations, use the title
    if (conversation.is_group && conversation.title) {
      console.log('🔍 DEBUG: Returning group title:', conversation.title);
      return conversation.title;
    }
    
    // For direct conversations, use other_participant data from API
    if (conversation.other_participant) {
      const name = conversation.other_participant.name ||
                  conversation.other_participant.full_name ||
                  conversation.other_participant.email ||
                  (isArabic ? 'مستخدم' : 'User');
      console.log('🔍 DEBUG: Returning other_participant name:', name);
      return name;
    }
    
    // Fallback: try using participants array (for backward compatibility)
    if (conversation.participants && conversation.participants.length > 0) {
      console.log('🔍 DEBUG: Using participants array fallback');
    const otherParticipant = conversation.participants.find(
      p => p.id !== currentUser?.id
    );
    
      if (otherParticipant) {
        const name = otherParticipant.name ||
               otherParticipant.email || 
             (isArabic ? 'مستخدم' : 'User');
        console.log('🔍 DEBUG: Returning fallback participant name:', name);
        return name;
      }
    }
    
    console.log('🔍 DEBUG: No participant data found, returning fallback');
    return isArabic ? 'محادثة' : 'Conversation';
  };

  // New function to get conversation date
  const getConversationDate = (conversation) => {
    console.log('🔍 DEBUG: getConversationDate for conversation:', conversation.id);
    console.log('🔍 DEBUG: last_message_preview:', conversation.last_message_preview);
    console.log('🔍 DEBUG: last_message_time:', conversation.last_message_time);
    
    // Use last_message_time from ConversationListSerializer, fallback to other fields
    const dateToFormat = conversation.last_message_time || 
                        conversation.last_message_preview?.created_at ||
                        conversation.last_message?.created_at || 
                        conversation.created_at;
    
    if (!dateToFormat) {
      console.log('🔍 DEBUG: No date found');
      return '';
    }
    
    const date = new Date(dateToFormat);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    console.log('🔍 DEBUG: Date calculation - diffDays:', diffDays);
    
    if (diffDays === 0) {
      // Today - show time
      const timeString = date.toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      console.log('🔍 DEBUG: Returning today time:', timeString);
      return timeString;
    } else if (diffDays === 1) {
      // Yesterday
      const yesterdayString = isArabic ? 'أمس' : 'Yesterday';
      console.log('🔍 DEBUG: Returning yesterday:', yesterdayString);
      return yesterdayString;
    } else if (diffDays < 7) {
      // This week - show day name
      const dayString = date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { 
        weekday: 'short' 
      });
      console.log('🔍 DEBUG: Returning day name:', dayString);
      return dayString;
    } else {
      // Older - show date
      const dateString = date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { 
        month: 'short', 
        day: 'numeric',
        year: diffDays > 365 ? 'numeric' : undefined
      });
      console.log('🔍 DEBUG: Returning date:', dateString);
      return dateString;
    }
  };

  // Get participant details for conversation header
  const getParticipantDetails = (conversation) => {
    console.log('🔍 DEBUG: getParticipantDetails for conversation:', conversation.id);
    console.log('🔍 DEBUG: conversation object keys:', Object.keys(conversation));
    console.log('🔍 DEBUG: other_participant:', conversation.other_participant);
    console.log('🔍 DEBUG: participants:', conversation.participants);
    console.log('🔍 DEBUG: current user ID:', currentUser?.id);
    
    // For group conversations
    if (conversation.is_group) {
      console.log('🔍 DEBUG: Group conversation detected');
      return {
        name: conversation.title || (isArabic ? 'مجموعة' : 'Group'),
        profession: isArabic ? 'محادثة جماعية' : 'Group Chat',
        rating: null,
        isVerified: false,
        avatar: conversation.avatar_url,
        phone: null,
        email: null,
        location: null,
        userId: null
      };
    }
    
    // For direct conversations, use other_participant data from API
    if (conversation.other_participant) {
      const participant = conversation.other_participant;
      console.log('🔍 DEBUG: Using other_participant data:', participant);
      console.log('🔍 DEBUG: other_participant keys:', Object.keys(participant));
      
      return {
        name: participant.full_name || participant.name || participant.username || participant.email?.split('@')[0] || (isArabic ? 'مستخدم' : 'User'),
        profession: isArabic ? 'مستخدم' : 'User',
        rating: null,
        isVerified: false,
        avatar: participant.avatar_url || participant.profile_picture,
        phone: participant.phone_number,
        email: participant.email,
        location: null,
        userId: participant.id || participant.user_id,
        professionalId: participant.alistpro_id || participant.professional_id,
        alistpro_id: participant.alistpro_id
      };
    }
    
    // Fallback: try using participants array and participantsInfo state
    if (conversation.participants && Array.isArray(conversation.participants)) {
      console.log('🔍 DEBUG: Using participants array fallback');
      console.log('🔍 DEBUG: participants array:', conversation.participants);
    
    const otherParticipant = conversation.participants.find(
      p => p.id !== currentUser?.id
    );
    
      console.log('🔍 DEBUG: found other participant:', otherParticipant);
      
      if (!otherParticipant) {
        console.log('🔍 DEBUG: No other participant found');
        return null;
      }
    
    const participantInfo = participantsInfo[otherParticipant.id];
      console.log('🔍 DEBUG: participantInfo from state:', participantInfo);
      
    if (participantInfo) {
      console.log('🔍 ParticipantInfo object:', participantInfo);
      console.log('🔍 ParticipantInfo keys:', Object.keys(participantInfo));
      
      return {
        name: participantInfo.business_name || 
              participantInfo.user?.name ||
                participantInfo.user?.full_name ||
                otherParticipant.name ||
                otherParticipant.username ||
              (isArabic ? 'مستخدم' : 'User'),
        profession: participantInfo.profession || participantInfo.business_description || (isArabic ? 'محترف' : 'Professional'),
        rating: participantInfo.average_rating,
        isVerified: participantInfo.is_verified,
          avatar: participantInfo.profile_image || participantInfo.user?.profile_picture || otherParticipant.profile_picture,
          phone: participantInfo.user?.phone_number || participantInfo.phone_number || otherParticipant.phone_number,
          email: participantInfo.user?.email || otherParticipant.email,
          location: participantInfo.business_address || participantInfo.location,
          userId: otherParticipant.id,
          professionalId: participantInfo.id || participantInfo.alistpro_id || participantInfo.profile_id, // Add professional profile ID
          alistpro_id: participantInfo.id || participantInfo.alistpro_id || participantInfo.profile_id
      };
    }
    
      // Return basic participant info if no detailed info is available
    return {
        name: otherParticipant.name ||
              otherParticipant.username ||
              otherParticipant.email?.split('@')[0] ||
            (isArabic ? 'مستخدم' : 'User'),
      profession: isArabic ? 'مستخدم' : 'User',
      rating: null,
      isVerified: false,
      avatar: otherParticipant.profile_picture,
      phone: otherParticipant.phone_number,
        email: otherParticipant.email,
        location: null,
        userId: otherParticipant.id,
        professionalId: otherParticipant.alistpro_id || otherParticipant.professional_id,
        alistpro_id: otherParticipant.alistpro_id
      };
    }
    
    console.log('🔍 DEBUG: No participant details found - all methods failed');
    return null;
  };

  // Handle quote creation
  const handleCreateQuote = () => {
    console.log('🎯 Starting quote creation process...');
    
    if (!activeConversation) {
      console.error('❌ No active conversation');
      alert(isArabic ? 'لا توجد محادثة نشطة' : 'No active conversation');
      return;
    }
    
    console.log('🔍 Active conversation:', activeConversation);
    
    const participantDetails = getParticipantDetails(activeConversation);
    console.log('👤 Participant details:', participantDetails);
    
    if (!participantDetails) {
      console.error('❌ Could not get participant details');
      alert(isArabic ? 'خطأ في الحصول على بيانات المشارك' : 'Error getting participant details');
      return;
    }
    
    if (!participantDetails.userId) {
      console.error('❌ No participant userId found');
      alert(isArabic ? 'لا يمكن تحديد العميل' : 'Cannot identify client');
      return;
    }
    
    // Determine the correct dashboard path based on user role
    let dashboardPath = '/pro-dashboard';
    if (currentUser?.role === 'specialist') {
      dashboardPath = '/specialist-dashboard';
    } else if (currentUser?.role === 'crew') {
      dashboardPath = '/crew-dashboard';
    }
    
    const quotePath = `${dashboardPath}/quotes/create`;
    
    console.log('✅ Navigating to quote creation with data:', {
      path: quotePath,
      clientId: participantDetails.userId,
      clientName: participantDetails.name,
      conversationId: activeConversation.id
    });
    
    // Navigate to quote creation page with conversation context
    navigate(quotePath, {
      state: {
        clientId: participantDetails.userId,
        clientName: participantDetails.name,
        conversationId: activeConversation.id
      }
    });
  };

  // NEW: Handle creating quote with installments directly in chat
  const handleCreateQuoteWithInstallments = async (quoteData) => {
    try {
      setCreatingServiceRequest(true);
      const token = localStorage.getItem('token');
      
      const participantDetails = getParticipantDetails(activeConversation);
      if (!participantDetails || !participantDetails.userId) {
        throw new Error('Cannot identify client for quote');
      }
      
      const response = await fetch(`/api/alistpros_profiles/quotes/create-with-installments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...quoteData,
          client_id: participantDetails.userId,
          conversation_id: activeConversation.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show success message in chat
        const successMessage = {
          id: 'quote_success_' + Date.now(),
          content: language === 'ar' 
            ? `✅ تم إنشاء عرض الأسعار بنجاح!\n💰 المبلغ الإجمالي: $${result.quote.total_price}\n📊 نظام دفع مقسط: 50% + 50%\n🏦 معرف الحساب المضمون: ${result.escrow_id}\n\n🔄 يمكن للعميل الآن دفع الدفعة الأولى لبدء العمل.`
            : `✅ Quote created successfully!\n💰 Total Amount: $${result.quote.total_price}\n📊 Installment Payment: 50% + 50%\n🏦 Escrow Account ID: ${result.escrow_id}\n\n🔄 Client can now pay the first installment to start work.`,
          sender: { id: currentUser.id, name: currentUser.name },
          created_at: new Date().toISOString(),
          message_type: 'system',
          is_quote: true,
          quote_data: result.quote,
          escrow_id: result.escrow_id
        };

        setMessages(prev => [...prev, successMessage]);
        setShowQuoteModal(false);

        // Send actual system message to backend
        await messageService.sendMessage(token, activeConversation.id, {
          content: successMessage.content,
          message_type: 'SYSTEM'
        });

      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create quote');
      }
    } catch (error) {
      console.error('Error creating quote with installments:', error);
      alert((language === 'ar' ? 'فشل في إنشاء عرض الأسعار: ' : 'Failed to create quote: ') + error.message);
    } finally {
      setCreatingServiceRequest(false);
    }
  };

  // Handle service request creation
  const handleCreateServiceRequest = () => {
    console.log('🎯 Preparing to create service request...');
    
    if (!activeConversation) {
      console.error('❌ No active conversation');
      alert(isArabic ? 'لا توجد محادثة نشطة' : 'No active conversation');
      return;
    }
    
    console.log('🔍 Active conversation:', activeConversation);
    
    const participantDetails = getParticipantDetails(activeConversation);
    console.log('👤 Professional details:', participantDetails);
    
    if (!participantDetails) {
      console.error('❌ Could not get professional details');
      alert(isArabic ? 'خطأ في الحصول على بيانات مقدم الخدمة' : 'Error getting professional details');
      return;
    }
    
    if (!participantDetails.userId) {
      console.error('❌ No professional userId found');
      alert(isArabic ? 'لا يمكن تحديد مقدم الخدمة' : 'Cannot identify professional');
      return;
    }
    
    console.log('✅ Professional identified:', participantDetails.name, 'ID:', participantDetails.userId);
    
    setServiceRequestData(prev => ({
      ...prev,
      title: isArabic ? `طلب خدمة من ${participantDetails.name}` : `Service request for ${participantDetails.name}`,
      description: ''
    }));
    setShowServiceRequestModal(true);
  };

  // Submit service request
  const handleSubmitServiceRequest = async (e) => {
    e.preventDefault();
    if (creatingServiceRequest) return;

    console.log('🎯 Starting service request creation process...');
    console.log('🔍 Active conversation:', activeConversation);

    const participantDetails = getParticipantDetails(activeConversation);
    console.log('👤 Participant details for professional:', participantDetails);
    
    if (!participantDetails || !participantDetails.userId) {
      console.error('❌ Could not get professional details');
      alert(isArabic ? 'خطأ في البيانات - لا يمكن تحديد مقدم الخدمة' : 'Error in data - cannot identify professional');
      return;
    }

    setCreatingServiceRequest(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert(isArabic ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
        return;
      }

      // Create a basic service address
      const serviceAddress = {
        street_address: 'Service location to be determined',
        city: 'TBD',
        state: 'TBD',
        zip_code: '00000',
        country: 'Egypt'
      };

      const requestData = {
        title: serviceRequestData.title,
        description: serviceRequestData.description,
        budget_max: parseFloat(serviceRequestData.budget_max) || null,
        urgency: serviceRequestData.urgency,
        flexible_schedule: serviceRequestData.flexible_schedule,
        is_public: false, // Private request between these two users
        service_address: serviceAddress,
        // Use professional_id field that the serializer accepts
        professional_id: participantDetails.userId
      };

      console.log('📤 Creating service request with professional:', requestData);

      // Create service request via API
      const response = await alistProsService.createServiceRequest(requestData);
      
      console.log('✅ Service request created successfully:', response.data);

      // Send a system message to the conversation
      const systemMessage = {
        content: isArabic 
          ? `تم إنشاء طلب خدمة جديد: ${serviceRequestData.title}\nمقدم الخدمة: ${participantDetails.name}\nالميزانية القصوى: ${serviceRequestData.budget_max ? '$' + serviceRequestData.budget_max : 'غير محددة'}\nالأولوية: ${serviceRequestData.urgency}`
          : `New service request created: ${serviceRequestData.title}\nAssigned to: ${participantDetails.name}\nMax Budget: ${serviceRequestData.budget_max ? '$' + serviceRequestData.budget_max : 'Not specified'}\nUrgency: ${serviceRequestData.urgency}`,
        message_type: 'SYSTEM'
      };

      await messageService.sendMessage(token, activeConversation.id, systemMessage);

      // Reset form and close modal
      setServiceRequestData({
        title: '',
        description: '',
        budget_max: '',
        urgency: 'medium',
        flexible_schedule: true
      });
      setShowServiceRequestModal(false);

      alert(isArabic ? `تم إنشاء طلب الخدمة بنجاح وتم ربطه بـ ${participantDetails.name}! يمكنه الآن إرسال عرض سعر.` : `Service request created successfully and assigned to ${participantDetails.name}! They can now send you a quote.`);

      // Refresh messages to show the system message
      if (activeConversation) {
        await fetchMessages(activeConversation.id);
      }

    } catch (error) {
      console.error('❌ Error creating service request:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || error.message;
      alert(isArabic ? `فشل في إنشاء طلب الخدمة: ${errorMessage}` : `Failed to create service request: ${errorMessage}`);
    } finally {
      setCreatingServiceRequest(false);
    }
  };

  // Handle input changes for service request form
  const handleServiceRequestInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setServiceRequestData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle appointment booking
  const handleBookAppointment = () => {
    console.log('🗓️ Starting appointment booking...');
    
    if (!activeConversation) {
      console.error('❌ No active conversation');
      alert(isArabic ? 'لا توجد محادثة نشطة' : 'No active conversation');
      return;
    }
    
    const participantDetails = getParticipantDetails(activeConversation);
    if (!participantDetails) {
      console.error('❌ Could not get professional details');
      alert(isArabic ? 'خطأ في الحصول على بيانات مقدم الخدمة' : 'Error getting professional details');
      return;
    }
    
    // Get professional ID - try multiple ways to get it
    let professionalId = null;
    console.log('🔍 Participant details for professional ID detection:', participantDetails);
    
    if (participantDetails.professionalId) {
      professionalId = participantDetails.professionalId;
      console.log('✅ Using professionalId:', professionalId);
    } else if (participantDetails.alistpro_id) {
      professionalId = participantDetails.alistpro_id;
      console.log('✅ Using alistpro_id:', professionalId);
    } else if (participantDetails.userId) {
      professionalId = participantDetails.userId;
      console.log('⚠️ Using userId as fallback:', professionalId);
    }
    
    console.log('🔍 Final Professional ID for appointment:', professionalId);
    
    setAppointmentData(prev => ({
      ...prev,
      description: isArabic ? `موعد مع ${participantDetails.name}` : `Appointment with ${participantDetails.name}`,
      professionalId: professionalId
    }));
    setShowAppointmentModal(true);
    setShowClientActionsMenu(false);
  };

  // Try to find professional profile ID from user ID
  const findProfessionalProfileId = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/alistpros-profiles/profiles/?user=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          console.log('✅ Found professional profile:', data.results[0]);
          return data.results[0].id;
        }
      }
    } catch (error) {
      console.error('Error finding professional profile:', error);
    }
    return null;
  };

  // Fetch availability slots for professional
  const fetchAvailabilitySlots = async (professionalId) => {
    console.log('🚀 fetchAvailabilitySlots called with professionalId:', professionalId);
    
    if (!professionalId) {
      console.error('❌ No professionalId provided');
      return;
    }
    
    setLoadingAvailability(true);
    let finalProfessionalId = professionalId;
    
    try {
      const token = localStorage.getItem('token');
      let url = `http://127.0.0.1:8000/api/scheduling/availability-slots/for_professional/?alistpro=${professionalId}`;
      console.log('📡 Fetching availability from URL:', url);
      
      let response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);
      
      // If 404 or no results, try to find the professional profile ID
      if (!response.ok || response.status === 404) {
        console.log('🔍 First attempt failed, trying to find professional profile ID...');
        const profileId = await findProfessionalProfileId(professionalId);
        
        if (profileId) {
          finalProfessionalId = profileId;
          url = `http://127.0.0.1:8000/api/scheduling/availability-slots/for_professional/?alistpro=${profileId}`;
          console.log('📡 Retrying with profile ID:', profileId, 'URL:', url);
          
          response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('📅 Availability slots fetched:', data);
        console.log('📅 Number of slots:', data.results ? data.results.length : 0);
        
        if (data.results && data.results.length > 0) {
          console.log('✅ Found availability slots:', data.results);
          setAvailabilitySlots(data.results);
        } else {
          console.log('⚠️ No availability slots found');
          setAvailabilitySlots([]);
        }
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to fetch availability slots. Status:', response.status);
        console.error('❌ Error response:', errorData);
        setAvailabilitySlots([]);
      }
    } catch (error) {
      console.error('❌ Error fetching availability slots:', error);
      setAvailabilitySlots([]);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Handle time slot selection from availability calendar
  const handleTimeSlotSelected = (selectedSlot) => {
    console.log('🕐 Time slot selected:', selectedSlot);
    setAppointmentData(prev => ({
      ...prev,
      date: selectedSlot.formattedDate,
      time: selectedSlot.formattedTime,
      selectedSlot: selectedSlot
    }));
  };

  // Generate available dates from availability slots
  const getAvailableDates = () => {
    if (availabilitySlots.length === 0) return [];
    
    const dates = [];
    const today = new Date();
    
    // Generate next 30 days and check availability
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
      
      // Check if professional is available on this day
      const hasAvailability = availabilitySlots.some(slot => slot.day_of_week === dayOfWeek);
      
      if (hasAvailability) {
        dates.push({
          date: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString(isArabic ? 'ar' : 'en', { weekday: 'short' }),
          day: date.getDate(),
          month: date.toLocaleDateString(isArabic ? 'ar' : 'en', { month: 'short' })
        });
      }
    }
    
    return dates.slice(0, 14); // Limit to 14 available dates
  };

  // Get available times for selected date
  const getAvailableTimesForDate = (selectedDate) => {
    if (!selectedDate || availabilitySlots.length === 0) return [];
    
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
    
    // Find available slots for this day of week
    const daySlots = availabilitySlots.filter(slot => slot.day_of_week === dayOfWeek);
    
    // Convert to time options
    const times = [];
    daySlots.forEach(slot => {
      const startTime = slot.start_time;
      const endTime = slot.end_time;
      
      // Generate hourly slots between start and end time
      let current = startTime;
      while (current < endTime) {
        times.push({
          value: current.substring(0, 5), // HH:MM format
          label: current.substring(0, 5)
        });
        
        // Add 1 hour
        const [hours, minutes] = current.split(':');
        const nextHour = (parseInt(hours) + 1).toString().padStart(2, '0');
        current = `${nextHour}:${minutes}`;
        
        if (current >= endTime) break;
      }
    });
    
    return times;
  };

  // Submit appointment booking
  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    if (creatingAppointment) return;

    console.log('🗓️ Creating appointment...');
    const participantDetails = getParticipantDetails(activeConversation);
    
    if (!participantDetails || !participantDetails.userId) {
      console.error('❌ Could not get professional details');
      alert(isArabic ? 'خطأ في البيانات - لا يمكن تحديد مقدم الخدمة' : 'Error in data - cannot identify professional');
      return;
    }

    setCreatingAppointment(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert(isArabic ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
        return;
      }

      const appointmentPayload = {
        alistpro: participantDetails.professionalId || participantDetails.userId,
        appointment_date: appointmentData.date,
        start_time: appointmentData.time + ':00',
        end_time: addHourToTime(appointmentData.time) + ':00',
        notes: appointmentData.description || '',
        location: appointmentData.address || 'عنوان سيتم تحديده'
      };

      console.log('📋 Appointment payload being sent:', appointmentPayload);
      console.log('👤 Participant details:', participantDetails);

      const response = await fetch('http://127.0.0.1:8000/api/scheduling/appointments/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentPayload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Appointment booked successfully:', result);
        console.log('✅ Appointment ID:', result.id);
        console.log('✅ Appointment client:', result.client);
        console.log('✅ Appointment alistpro:', result.alistpro);

        // Send message to conversation
        const appointmentMessage = isArabic 
          ? `📅 تم حجز موعد!\n🕐 التاريخ والوقت: ${appointmentData.date} في ${appointmentData.time}\n📍 المكان: ${appointmentData.address || 'سيتم تحديده'}\n📝 الوصف: ${appointmentData.description}`
          : `📅 Appointment booked!\n🕐 Date & Time: ${appointmentData.date} at ${appointmentData.time}\n📍 Location: ${appointmentData.address || 'To be determined'}\n📝 Description: ${appointmentData.description}`;

        await messageService.sendMessage(token, activeConversation.id, {
          content: appointmentMessage,
          message_type: 'SYSTEM'
        });

        // Close modal and reset form
        setShowAppointmentModal(false);
        setAppointmentData({ date: '', time: '', description: '', address: '' });

        alert(isArabic ? `تم حجز الموعد بنجاح مع ${participantDetails.name}!` : `Appointment booked successfully with ${participantDetails.name}!`);

        // Refresh messages to show the appointment message
        fetchMessages(activeConversation.id);

      } else {
        const errorData = await response.json();
        console.log('❌ Error response status:', response.status);
        console.log('❌ Error response data:', errorData);
        console.log('❌ Non-field errors:', errorData.non_field_errors);
        console.log('❌ All error details:', JSON.stringify(errorData, null, 2));
        
        // Extract the actual error message
        let errorMessage = 'Failed to book appointment';
        if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
          errorMessage = errorData.non_field_errors[0];
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error booking appointment:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
      alert(isArabic ? `فشل في حجز الموعد: ${errorMessage}` : `Failed to book appointment: ${errorMessage}`);
    } finally {
      setCreatingAppointment(false);
    }
  };

  // Helper function to add one hour to time
  const addHourToTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const nextHour = (parseInt(hours) + 1) % 24;
    return `${nextHour.toString().padStart(2, '0')}:${minutes}`;
  };

  // Handle input changes for appointment form
  const handleAppointmentInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({
      ...prev,
      [name]: value
    }));
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
                              
                              {/* Show email and conversation date dynamically */}
                              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                <div className="flex items-center flex-1 min-w-0">
                                  <FaEnvelope className="h-2 w-2 mr-1 flex-shrink-0" />
                                  <span className="truncate">
                                    {/* Use other_participant data from API */}
                                    {conversation.other_participant?.email || 
                                     conversation.participants?.find(p => p.id !== currentUser?.id)?.email ||
                                     (isArabic ? 'لا يوجد بريد' : 'No email')}
                                  </span>
                                </div>
                                <div className="flex items-center ml-2 flex-shrink-0">
                                  <FaCalendarAlt className="h-2 w-2 mr-1" />
                                  <span>{getConversationDate(conversation)}</span>
                                </div>
                              </div>
                              
                              {/* Show profession and rating if available */}
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
                                <FaShieldAlt className="h-2 w-2 text-white" />
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
                    {/* Quote Buttons for Professionals */}
                    {isProfessional && (
                      <div className="flex space-x-2">
                      <button
                        onClick={handleCreateQuote}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          title={isArabic ? 'إنشاء عرض سعر عادي' : 'Create Regular Quote'}
                      >
                        <FaFileInvoiceDollar className="h-4 w-4 mr-2" />
                          {isArabic ? 'عرض عادي' : 'Regular Quote'}
                      </button>
                        <button
                          onClick={() => setShowInstallmentQuoteModal(true)}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          title={isArabic ? 'إنشاء عرض سعر مقسط' : 'Create Installment Quote'}
                        >
                          <FaHandshake className="h-4 w-4 mr-2" />
                          {isArabic ? 'عرض مقسط' : 'Installment Quote'}
                        </button>
                      </div>
                    )}

                    {/* Client Actions Menu */}
                    {!isProfessional && (
                      <div className="relative client-actions-menu">
                      <button
                          onClick={() => setShowClientActionsMenu(!showClientActionsMenu)}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          title={isArabic ? 'إجراءات العميل' : 'Client Actions'}
                      >
                        <FaHandshake className="h-4 w-4 mr-2" />
                          {isArabic ? 'إجراءات' : 'Actions'}
                          <FaEllipsisV className="h-3 w-3 ml-2" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {showClientActionsMenu && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  handleCreateServiceRequest();
                                  setShowClientActionsMenu(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                              >
                                <FaTools className="h-4 w-4 mr-3 text-blue-500" />
                        {isArabic ? 'طلب خدمة' : 'Request Service'}
                      </button>
                              <button
                                onClick={handleBookAppointment}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                              >
                                <FaCalendarAlt className="h-4 w-4 mr-3 text-green-500" />
                                {isArabic ? 'حجز موعد' : 'Book Appointment'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
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
                              
                              {/* Show Payment Milestones if this message has escrow_id */}
                              {message.escrow_id && (
                                <div className={`mt-3 p-3 rounded-md ${
                                  isCurrentUserMessage ? 'bg-blue-100' : 'bg-gray-50'
                                }`}>
                                  <div className="text-gray-900">
                                    <PaymentMilestones 
                                      escrowId={message.escrow_id}
                                      onMilestoneUpdate={() => {
                                        // Refresh messages to show updated status
                                        if (activeConversation) {
                                          fetchMessages(activeConversation.id);
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
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

        {/* Service Request Modal */}
        <AnimatePresence>
          {showServiceRequestModal && (
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isArabic ? 'طلب خدمة جديد' : 'New Service Request'}
                  </h3>
                  <button
                    onClick={() => setShowServiceRequestModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmitServiceRequest} className="p-6 space-y-4">
                  {/* Service Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? 'عنوان الخدمة' : 'Service Title'} *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={serviceRequestData.title}
                      onChange={handleServiceRequestInputChange}
                      placeholder={isArabic ? 'مثال: صيانة السباكة' : 'e.g., Plumbing Repair'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? 'وصف المشكلة' : 'Description'} *
                    </label>
                    <textarea
                      name="description"
                      value={serviceRequestData.description}
                      onChange={handleServiceRequestInputChange}
                      placeholder={isArabic ? 'اشرح التفاصيل والمشكلة المطلوب حلها...' : 'Describe the details and problem to be solved...'}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? 'الحد الأقصى للميزانية (اختياري)' : 'Maximum Budget (Optional)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="budget_max"
                        value={serviceRequestData.budget_max}
                        onChange={handleServiceRequestInputChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {isArabic ? 'سيتم حجز هذا المبلغ عند الموافقة على العرض' : 'This amount will be reserved when accepting a quote'}
                    </p>
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? 'الأولوية' : 'Urgency'}
                    </label>
                    <select
                      name="urgency"
                      value={serviceRequestData.urgency}
                      onChange={handleServiceRequestInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">{isArabic ? 'منخفضة' : 'Low'}</option>
                      <option value="medium">{isArabic ? 'متوسطة' : 'Medium'}</option>
                      <option value="high">{isArabic ? 'عالية' : 'High'}</option>
                      <option value="emergency">{isArabic ? 'طارئة' : 'Emergency'}</option>
                    </select>
                  </div>

                  {/* Flexible Schedule */}
            <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="flexible_schedule"
                      checked={serviceRequestData.flexible_schedule}
                      onChange={handleServiceRequestInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      {isArabic ? 'لدي مرونة في المواعيد' : 'I have flexible schedule'}
                    </label>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                      type="button"
                      onClick={() => setShowServiceRequestModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      {isArabic ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={creatingServiceRequest || !serviceRequestData.title || !serviceRequestData.description}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      {creatingServiceRequest ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          {isArabic ? 'جاري الإنشاء...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <FaHandshake className="h-4 w-4 mr-2" />
                          {isArabic ? 'إنشاء طلب الخدمة' : 'Create Service Request'}
                        </>
                      )}
              </button>
            </div>
                </form>
              </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Appointment Booking Modal */}
        <AnimatePresence>
          {showAppointmentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isArabic ? 'حجز موعد' : 'Book Appointment'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAppointmentModal(false);
                      setAppointmentData({ date: '', time: '', description: '', address: '', professionalId: null, selectedSlot: null });
                      setAvailabilitySlots([]);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {loadingAvailability ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">
                        {isArabic ? 'جاري تحميل المواعيد المتاحة...' : 'Loading available appointments...'}
                      </p>
                    </div>
                  ) : availabilitySlots.length === 0 ? (
                    <div className="text-center py-8">
                      <FaCalendarAlt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {isArabic ? 'لا توجد مواعيد متاحة' : 'No Available Appointments'}
                      </h4>
                      <p className="text-gray-600">
                        {isArabic 
                          ? 'مقدم الخدمة لم يحدد أوقات عمل بعد. يرجى المحاولة مرة أخرى لاحقاً أو التواصل مباشرة.'
                          : 'The professional has not set working hours yet. Please try again later or contact directly.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Available Dates */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                          <FaCalendarAlt className="h-4 w-4 mr-2 text-blue-500" />
                          {isArabic ? 'اختر التاريخ المناسب' : 'Select Available Date'}
                        </h4>
                        <div className="grid grid-cols-7 gap-2 max-h-32 overflow-y-auto">
                          {getAvailableDates().map((dateOption, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setAppointmentData(prev => ({ ...prev, date: dateOption.date, time: '' }))}
                              className={`p-2 rounded-lg text-center transition-colors border ${
                                appointmentData.date === dateOption.date
                                  ? 'bg-blue-500 text-white border-blue-500'
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border-gray-200'
                              }`}
                            >
                              <div className="text-xs font-medium">{dateOption.dayName}</div>
                              <div className="text-sm">{dateOption.day}</div>
                              <div className="text-xs text-gray-500">{dateOption.month}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Available Times */}
                      {appointmentData.date && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                            <FaClock className="h-4 w-4 mr-2 text-green-500" />
                            {isArabic ? 'اختر الوقت المناسب' : 'Select Available Time'}
                          </h4>
                          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                            {getAvailableTimesForDate(appointmentData.date).map((timeOption, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => setAppointmentData(prev => ({ ...prev, time: timeOption.value }))}
                                className={`py-2 px-3 rounded-lg text-center transition-colors text-sm ${
                                  appointmentData.time === timeOption.value
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                }`}
                              >
                                {timeOption.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Appointment Form */}
                      {appointmentData.date && appointmentData.time && (
                        <form onSubmit={handleSubmitAppointment} className="space-y-4 border-t pt-4">
                          {/* Selected DateTime Display */}
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h5 className="font-medium text-blue-900 mb-1">
                              {isArabic ? 'الموعد المحدد:' : 'Selected Appointment:'}
                            </h5>
                            <p className="text-blue-700">
                              📅 {appointmentData.date} | 🕐 {appointmentData.time}
                            </p>
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {isArabic ? 'وصف الموعد' : 'Appointment Description'} *
                            </label>
                            <textarea
                              name="description"
                              value={appointmentData.description}
                              onChange={handleAppointmentInputChange}
                              placeholder={isArabic ? 'اكتب تفاصيل الموعد...' : 'Write appointment details...'}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>

                          {/* Address */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {isArabic ? 'العنوان (اختياري)' : 'Address (Optional)'}
                            </label>
                            <input
                              type="text"
                              name="address"
                              value={appointmentData.address}
                              onChange={handleAppointmentInputChange}
                              placeholder={isArabic ? 'أدخل عنوان الموعد...' : 'Enter appointment address...'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          {/* Modal Footer */}
                          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                              type="button"
                              onClick={() => {
                                setShowAppointmentModal(false);
                                setAppointmentData({ date: '', time: '', description: '', address: '', professionalId: null, selectedSlot: null });
                                setAvailabilitySlots([]);
                              }}
                              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              {isArabic ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                              type="submit"
                              disabled={creatingAppointment || !appointmentData.date || !appointmentData.time || !appointmentData.description}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                            >
                              {creatingAppointment ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                  {isArabic ? 'جاري الحجز...' : 'Booking...'}
                                </>
                              ) : (
                                <>
                                  <FaCalendarAlt className="h-4 w-4 mr-2" />
                                  {isArabic ? 'حجز الموعد' : 'Book Appointment'}
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Installment Quote Modal */}
        <InstallmentQuoteModal
          isOpen={showInstallmentQuoteModal}
          onClose={() => setShowInstallmentQuoteModal(false)}
          onSubmit={handleCreateQuoteWithInstallments}
          loading={creatingServiceRequest}
        />

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