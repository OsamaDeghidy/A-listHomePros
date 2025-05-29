import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import messageService from '../services/messageService';

// بيانات تجريبية للمحادثات في حالة عدم توفر API
// Demo conversations data when API is not available
const demoConversations = [
  {
    id: '1',
    recipient: {
      id: '101',
      name: 'أحمد السباك',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      profession: 'سباك'
    },
    last_message: {
      content: 'متى يمكنك الحضور لإصلاح الحنفية؟',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      is_read: false,
      sender_id: '101'
    },
    unread_count: 2,
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: '2',
    recipient: {
      id: '102',
      name: 'محمد الكهربائي',
      avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
      profession: 'كهربائي'
    },
    last_message: {
      content: 'تم الانتهاء من الإصلاحات، شكراً لك',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      is_read: true,
      sender_id: 'current_user'
    },
    unread_count: 0,
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: '3',
    recipient: {
      id: '103',
      name: 'سارة المصممة',
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
      profession: 'مصممة ديكور'
    },
    last_message: {
      content: 'أرسلت لك التصاميم الجديدة للمطبخ',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      is_read: true,
      sender_id: '103'
    },
    unread_count: 0,
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

// بيانات تجريبية للرسائل في محادثة محددة
// Demo messages for a specific conversation
const getDemoMessages = (conversationId) => {
  switch(conversationId) {
    case '1':
      return [
        {
          id: '101',
          conversation_id: '1',
          content: 'مرحباً، أنا بحاجة إلى إصلاح حنفية في المطبخ',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          sender_id: 'current_user',
          is_read: true
        },
        {
          id: '102',
          conversation_id: '1',
          content: 'مرحباً، يمكنني الحضور غداً في الصباح',
          timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
          sender_id: '101',
          is_read: true
        },
        {
          id: '103',
          conversation_id: '1',
          content: 'هل الساعة 10 صباحاً مناسبة؟',
          timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
          sender_id: '101',
          is_read: true
        },
        {
          id: '104',
          conversation_id: '1',
          content: 'نعم، هذا مناسب',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          sender_id: 'current_user',
          is_read: true
        },
        {
          id: '105',
          conversation_id: '1',
          content: 'متى يمكنك الحضور لإصلاح الحنفية؟',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          sender_id: '101',
          is_read: false
        }
      ];
    case '2':
      return [
        {
          id: '201',
          conversation_id: '2',
          content: 'مرحباً، أحتاج إلى إصلاح مشكلة في الكهرباء',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          sender_id: 'current_user',
          is_read: true
        },
        {
          id: '202',
          conversation_id: '2',
          content: 'سأكون عندك خلال ساعة',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          sender_id: '102',
          is_read: true
        },
        {
          id: '203',
          conversation_id: '2',
          content: 'تم الانتهاء من الإصلاحات، شكراً لك',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          sender_id: 'current_user',
          is_read: true
        }
      ];
    case '3':
      return [
        {
          id: '301',
          conversation_id: '3',
          content: 'مرحباً، أريد تصميم جديد للمطبخ',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          sender_id: 'current_user',
          is_read: true
        },
        {
          id: '302',
          conversation_id: '3',
          content: 'بالتأكيد، سأعمل على بعض التصاميم وأرسلها لك',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
          sender_id: '103',
          is_read: true
        },
        {
          id: '303',
          conversation_id: '3',
          content: 'أرسلت لك التصاميم الجديدة للمطبخ',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          sender_id: '103',
          is_read: true
        }
      ];
    default:
      return [];
  }
};

/**
 * هوك مخصص للتعامل مع الرسائل والمحادثات
 * Custom hook for handling messages and conversations
 */
export const useMessages = () => {
  const { token, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // إضافة وضع تجريبي في حالة عدم توفر API
  // Add demo mode when API is not available
  const isDemoMode = !token || process.env.REACT_APP_USE_DEMO_DATA === 'true';

  /**
   * جلب جميع المحادثات للمستخدم
   * Fetch all user conversations
   */
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (isDemoMode) {
        // استخدام البيانات التجريبية في حالة عدم توفر API
        // Use demo data when API is not available
        await new Promise(resolve => setTimeout(resolve, 500)); // تأخير اصطناعي لمحاكاة الشبكة
        setConversations(demoConversations);
        
        // حساب عدد الرسائل غير المقروءة
        // Calculate unread messages count
        const totalUnread = demoConversations.reduce(
          (total, conversation) => total + (conversation.unread_count || 0), 
          0
        );
        setUnreadCount(totalUnread);
      } else {
        // استخدام API الحقيقي
        // Use real API
        const response = await messageService.getUserConversations(token);
        setConversations(response.data);
        
        // حساب عدد الرسائل غير المقروءة
        // Calculate unread messages count
        const totalUnread = response.data.reduce(
          (total, conversation) => total + (conversation.unread_count || 0), 
          0
        );
        setUnreadCount(totalUnread);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('فشل في جلب المحادثات. يرجى المحاولة مرة أخرى.');
      
      // في حالة الخطأ، استخدم البيانات التجريبية
      // In case of error, use demo data
      setConversations(demoConversations);
      const totalUnread = demoConversations.reduce(
        (total, conversation) => total + (conversation.unread_count || 0), 
        0
      );
      setUnreadCount(totalUnread);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, isDemoMode]);

  /**
   * جلب محادثة محددة وتحميل رسائلها
   * Fetch a specific conversation and load its messages
   * @param {string} conversationId - معرف المحادثة
   */
  const fetchConversation = useCallback(async (conversationId) => {
    if (!isAuthenticated || !conversationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (isDemoMode) {
        // استخدام البيانات التجريبية في حالة عدم توفر API
        // Use demo data when API is not available
        await new Promise(resolve => setTimeout(resolve, 300)); // تأخير اصطناعي لمحاكاة الشبكة
        
        // البحث عن المحادثة في البيانات التجريبية
        // Find conversation in demo data
        const conversation = demoConversations.find(c => c.id === conversationId);
        if (conversation) {
          setCurrentConversation(conversation);
          
          // جلب الرسائل التجريبية لهذه المحادثة
          // Get demo messages for this conversation
          const demoMessages = getDemoMessages(conversationId);
          setMessages(demoMessages);
          
          // تحديث المحادثات لتعيين المحادثة كمقروءة
          // Update conversations to mark this one as read
          setConversations(prev => 
            prev.map(c => 
              c.id === conversationId 
                ? { ...c, unread_count: 0 } 
                : c
            )
          );
          
          // تحديث عدد الرسائل غير المقروءة
          // Update unread count
          const totalUnread = demoConversations
            .filter(c => c.id !== conversationId)
            .reduce((total, c) => total + (c.unread_count || 0), 0);
          setUnreadCount(totalUnread);
        } else {
          setError('لم يتم العثور على المحادثة');
        }
      } else {
        // استخدام API الحقيقي
        // Use real API
        const conversationResponse = await messageService.getConversation(token, conversationId);
        setCurrentConversation(conversationResponse.data);
        
        const messagesResponse = await messageService.getMessages(token, conversationId);
        setMessages(messagesResponse.data);
        
        // وضع علامة على المحادثة كمقروءة
        // Mark conversation as read
        await messageService.markConversationAsRead(token, conversationId);
        
        // تحديث عدد الرسائل غير المقروءة
        // Update unread count
        fetchConversations();
      }
    } catch (err) {
      console.error(`Error fetching conversation ${conversationId}:`, err);
      setError('فشل في جلب المحادثة. يرجى المحاولة مرة أخرى.');
      
      // في حالة الخطأ، حاول استخدام البيانات التجريبية
      // In case of error, try to use demo data
      const conversation = demoConversations.find(c => c.id === conversationId);
      if (conversation) {
        setCurrentConversation(conversation);
        setMessages(getDemoMessages(conversationId));
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, fetchConversations, isDemoMode, conversations]);

  /**
   * إنشاء محادثة جديدة
   * Create a new conversation
   * @param {Object} conversationData - بيانات المحادثة
   * @returns {Promise} وعد بنتيجة العملية
   */
  const createConversation = useCallback(async (conversationData) => {
    if (!isAuthenticated) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      if (isDemoMode) {
        // استخدام البيانات التجريبية في حالة عدم توفر API
        // Use demo data when API is not available
        await new Promise(resolve => setTimeout(resolve, 500)); // تأخير اصطناعي لمحاكاة الشبكة
        
        // إنشاء محادثة جديدة باستخدام البيانات المقدمة
        // Create a new conversation using provided data
        const newConversation = {
          id: `demo_${Date.now()}`,
          recipient: {
            id: conversationData.recipient_id || `demo_recipient_${Date.now()}`,
            name: conversationData.recipient_name || 'مستخدم جديد',
            avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
            profession: conversationData.profession || 'مقدم خدمة'
          },
          last_message: {
            content: conversationData.initial_message || 'مرحباً',
            timestamp: new Date().toISOString(),
            is_read: true,
            sender_id: 'current_user'
          },
          unread_count: 0,
          updated_at: new Date().toISOString()
        };
        
        // إضافة المحادثة الجديدة إلى قائمة المحادثات
        // Add new conversation to conversations list
        setConversations(prev => [newConversation, ...prev]);
        
        return newConversation;
      } else {
        // استخدام API الحقيقي
        // Use real API
        const response = await messageService.createConversation(token, conversationData);
        await fetchConversations();
        return response.data;
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('فشل في إنشاء المحادثة. يرجى المحاولة مرة أخرى.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, fetchConversations, isDemoMode]);

  /**
   * إرسال رسالة في محادثة
   * Send a message in a conversation
   * @param {string} conversationId - معرف المحادثة
   * @param {Object} messageData - بيانات الرسالة
   * @returns {Promise} وعد بنتيجة العملية
   */
  const sendMessage = useCallback(async (conversationId, messageData) => {
    if (!isAuthenticated || !conversationId) return null;
    
    setError(null);
    
    try {
      if (isDemoMode) {
        // استخدام البيانات التجريبية في حالة عدم توفر API
        // Use demo data when API is not available
        await new Promise(resolve => setTimeout(resolve, 300)); // تأخير اصطناعي لمحاكاة الشبكة
        
        // إنشاء رسالة جديدة باستخدام البيانات المقدمة
        // Create a new message using provided data
        const newMessage = {
          id: `demo_msg_${Date.now()}`,
          conversation_id: conversationId,
          content: messageData.content || '',
          timestamp: new Date().toISOString(),
          sender_id: 'current_user',
          is_read: true
        };
        
        // تحديث قائمة الرسائل محليًا
        // Update messages list locally
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // تحديث المحادثة بآخر رسالة
        // Update conversation with last message
        setConversations(prev => 
          prev.map(c => 
            c.id === conversationId 
              ? { 
                  ...c, 
                  last_message: {
                    content: messageData.content || '',
                    timestamp: new Date().toISOString(),
                    is_read: true,
                    sender_id: 'current_user'
                  },
                  updated_at: new Date().toISOString()
                } 
              : c
          )
        );
        
        // بعد فترة قصيرة، إضافة رد تلقائي للمحادثة التجريبية
        // After a short period, add an automatic reply to the demo conversation
        if (Math.random() > 0.3) { // 70% احتمالية الرد
          setTimeout(() => {
            const conversation = demoConversations.find(c => c.id === conversationId);
            if (conversation) {
              const autoReply = {
                id: `demo_reply_${Date.now()}`,
                conversation_id: conversationId,
                content: 'شكراً لرسالتك. سأرد عليك قريباً.',
                timestamp: new Date().toISOString(),
                sender_id: conversation.recipient.id,
                is_read: true
              };
              
              setMessages(prevMessages => [...prevMessages, autoReply]);
              
              // تحديث المحادثة بآخر رسالة
              // Update conversation with last message
              setConversations(prev => 
                prev.map(c => 
                  c.id === conversationId 
                    ? { 
                        ...c, 
                        last_message: {
                          content: autoReply.content,
                          timestamp: autoReply.timestamp,
                          is_read: true,
                          sender_id: conversation.recipient.id
                        },
                        updated_at: new Date().toISOString()
                      } 
                    : c
                )
              );
            }
          }, 3000 + Math.random() * 5000); // رد بعد 3-8 ثواني
        }
        
        return newMessage;
      } else {
        // استخدام API الحقيقي
        // Use real API
        const response = await messageService.sendMessage(token, conversationId, messageData);
        
        // تحديث قائمة الرسائل محليًا
        // Update messages list locally
        setMessages(prevMessages => [...prevMessages, response.data]);
        
        return response.data;
      }
    } catch (err) {
      console.error(`Error sending message to conversation ${conversationId}:`, err);
      setError('فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.');
      return null;
    }
  }, [isAuthenticated, token, isDemoMode]);

  /**
   * إرسال رسالة مع مرفق
   * Send a message with attachment
   * @param {string} conversationId - معرف المحادثة
   * @param {Object} messageData - بيانات الرسالة
   * @param {File} file - الملف المرفق
   * @returns {Promise} وعد بنتيجة العملية
   */
  const sendMessageWithAttachment = useCallback(async (conversationId, messageData, file) => {
    if (!isAuthenticated || !conversationId) return null;
    
    setError(null);
    
    try {
      if (isDemoMode) {
        // استخدام البيانات التجريبية في حالة عدم توفر API
        // Use demo data when API is not available
        await new Promise(resolve => setTimeout(resolve, 800)); // تأخير أطول لمحاكاة تحميل ملف
        
        // إنشاء رسالة جديدة مع مرفق باستخدام البيانات المقدمة
        // Create a new message with attachment using provided data
        const newMessage = {
          id: `demo_msg_${Date.now()}`,
          conversation_id: conversationId,
          content: messageData.content || '',
          timestamp: new Date().toISOString(),
          sender_id: 'current_user',
          is_read: true,
          attachment: {
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file) // إنشاء URL مؤقت للملف
          }
        };
        
        // تحديث قائمة الرسائل محليًا
        // Update messages list locally
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // تحديث المحادثة بآخر رسالة
        // Update conversation with last message
        setConversations(prev => 
          prev.map(c => 
            c.id === conversationId 
              ? { 
                  ...c, 
                  last_message: {
                    content: `[مرفق] ${messageData.content || ''}`,
                    timestamp: new Date().toISOString(),
                    is_read: true,
                    sender_id: 'current_user'
                  },
                  updated_at: new Date().toISOString()
                } 
              : c
          )
        );
        
        return newMessage;
      } else {
        // استخدام API الحقيقي
        // Use real API
        const response = await messageService.sendMessageWithAttachment(
          token, 
          conversationId, 
          messageData, 
          file
        );
        
        // تحديث قائمة الرسائل محليًا
        // Update messages list locally
        setMessages(prevMessages => [...prevMessages, response.data]);
        
        return response.data;
      }
    } catch (err) {
      console.error(`Error sending message with attachment to conversation ${conversationId}:`, err);
      setError('فشل في إرسال الرسالة مع المرفق. يرجى المحاولة مرة أخرى.');
      return null;
    }
  }, [isAuthenticated, token, isDemoMode]);

  // تحميل المحادثات عند تهيئة الهوك
  // Load conversations when the hook is initialized
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, fetchConversations]);

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    unreadCount,
    fetchConversations,
    fetchConversation,
    createConversation,
    sendMessage,
    sendMessageWithAttachment,
    setCurrentConversation
  };
};
