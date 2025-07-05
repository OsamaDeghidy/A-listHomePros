import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';
//const API_URL =  'https://alisthomepros.com/api';

/**
 * خدمة الرسائل للتعامل مع طلبات API المتعلقة بالمحادثات والرسائل
 * Message service for handling conversations and messages API requests
 */
class MessageService {
  /**
   * جلب جميع المحادثات للمستخدم
   * Get all user conversations
   * @param {string} token - رمز المصادقة (authentication token)
   * @returns {Promise} وعد يحتوي على قائمة المحادثات
   */
  getUserConversations(token) {
    return axios.get(`${API_URL}/messaging/conversations/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * جلب محادثة محددة
   * Get a specific conversation
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} conversationId - معرف المحادثة (conversation ID)
   * @returns {Promise} وعد يحتوي على تفاصيل المحادثة
   */
  getConversation(token, conversationId) {
    return axios.get(`${API_URL}/messaging/conversations/${conversationId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * جلب رسائل محادثة
   * Get conversation messages
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} conversationId - معرف المحادثة (conversation ID)
   * @param {Object} params - معلمات البحث (search parameters)
   * @returns {Promise} وعد يحتوي على رسائل المحادثة
   */
  getMessages(token, conversationId, params = {}) {
    return axios.get(`${API_URL}/messaging/conversations/${conversationId}/messages/`, {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
  }

  /**
   * إنشاء محادثة جديدة
   * Create a new conversation
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {Object} conversationData - بيانات المحادثة (conversation data)
   * @returns {Promise} وعد يحتوي على المحادثة المنشأة
   */
  createConversation(token, conversationData) {
    return axios.post(`${API_URL}/messaging/conversations/`, conversationData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * إرسال رسالة
   * Send a message
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} conversationId - معرف المحادثة (conversation ID)
   * @param {Object} messageData - بيانات الرسالة (message data)
   * @returns {Promise} وعد يحتوي على الرسالة المرسلة
   */
  sendMessage(token, conversationId, messageData) {
    return axios.post(`${API_URL}/messaging/conversations/${conversationId}/messages/`, messageData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * وضع علامة على رسالة كمقروءة
   * Mark a message as read
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} conversationId - معرف المحادثة (conversation ID)
   * @param {string} messageId - معرف الرسالة (message ID)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  markMessageAsRead(token, conversationId, messageId) {
    return axios.post(`${API_URL}/messaging/conversations/${conversationId}/messages/${messageId}/mark_read/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * وضع علامة على محادثة كمقروءة
   * Mark a conversation as read
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} conversationId - معرف المحادثة (conversation ID)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  markConversationAsRead(token, conversationId) {
    return axios.post(`${API_URL}/messaging/conversations/${conversationId}/mark_read/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * حذف رسالة
   * Delete a message
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} conversationId - معرف المحادثة (conversation ID)
   * @param {string} messageId - معرف الرسالة (message ID)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  deleteMessage(token, conversationId, messageId) {
    return axios.delete(`${API_URL}/messaging/conversations/${conversationId}/messages/${messageId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * جلب عدد الرسائل غير المقروءة
   * Get unread messages count
   * @param {string} token - رمز المصادقة (authentication token)
   * @returns {Promise} وعد يحتوي على عدد الرسائل غير المقروءة
   */
  getUnreadMessagesCount(token) {
    return axios.get(`${API_URL}/messaging/notifications/unread_count/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * إرسال رسالة مع مرفق
   * Send a message with attachment
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} conversationId - معرف المحادثة (conversation ID)
   * @param {Object} messageData - بيانات الرسالة (message data)
   * @param {File} file - الملف المرفق (attachment file)
   * @returns {Promise} وعد يحتوي على الرسالة المرسلة
   */
  sendMessageWithAttachment(token, conversationId, messageData, file) {
    const formData = new FormData();
    formData.append('content', messageData.content);
    if (file) {
      formData.append('attachment', file);
    }
    
    return axios.post(`${API_URL}/messaging/conversations/${conversationId}/messages/`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * البحث عن المستخدمين
   * Search for users
   * @param {string} token - رمز المصادقة (authentication token) 
   * @param {string} query - نص البحث (search query)
   * @returns {Promise} وعد يحتوي على نتائج البحث
   */
  searchUsers(token, query) {
    return axios.get(`${API_URL}/messaging/users/search/`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query }
    });
  }

  /**
   * أرشفة محادثة
   * Archive conversation
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} conversationId - معرف المحادثة (conversation ID)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  archiveConversation(token, conversationId) {
    return axios.post(`${API_URL}/messaging/conversations/${conversationId}/archive/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * إضافة تفاعل على رسالة
   * Add reaction to message
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} conversationId - معرف المحادثة (conversation ID)
   * @param {string} messageId - معرف الرسالة (message ID)
   * @param {string} reactionType - نوع التفاعل (reaction type)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  addReaction(token, conversationId, messageId, reactionType) {
    return axios.post(`${API_URL}/messaging/conversations/${conversationId}/messages/${messageId}/react/`, {
      reaction_type: reactionType
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * تعديل رسالة
   * Edit message
   * @param {string} token - رمز المصادقة (authentication token)
   * @param {string} conversationId - معرف المحادثة (conversation ID)
   * @param {string} messageId - معرف الرسالة (message ID)
   * @param {string} newContent - المحتوى الجديد (new content)
   * @returns {Promise} وعد يحتوي على نتيجة العملية
   */
  editMessage(token, conversationId, messageId, newContent) {
    return axios.patch(`${API_URL}/messaging/conversations/${conversationId}/messages/${messageId}/edit/`, {
      content: newContent
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

export default new MessageService(); 