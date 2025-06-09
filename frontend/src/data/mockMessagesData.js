// بيانات تجريبية للرسائل والمحادثات
// Mock data for messages and conversations testing

export const mockConversations = [
  {
    id: 1,
    participants: [
      {
        id: 1,
        name: 'أحمد العميل',
        first_name: 'أحمد',
        last_name: 'العميل',
        email: 'client@test.com',
        profile_picture: null
      },
      {
        id: 101,
        name: 'محمد السباك',
        first_name: 'محمد',
        last_name: 'السباك',
        email: 'plumber@test.com',
        profile_picture: '/avatars/plumber.jpg'
      }
    ],
    last_message: {
      id: 105,
      content: 'متى يمكنك القدوم لإصلاح الحنفية؟',
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      sender: {
        id: 101,
        name: 'محمد السباك'
      }
    },
    unread_count: 2,
    title: 'إصلاح سباكة المطبخ',
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 2,
    participants: [
      {
        id: 1,
        name: 'أحمد العميل',
        first_name: 'أحمد',
        last_name: 'العميل',
        email: 'client@test.com'
      },
      {
        id: 102,
        name: 'سارة الكهربائية',
        first_name: 'سارة',
        last_name: 'الكهربائية',
        email: 'electrician@test.com',
        profile_picture: '/avatars/electrician.jpg'
      }
    ],
    last_message: {
      id: 205,
      content: 'تم الانتهاء من تركيب المراوح، شكراً لك',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      sender: {
        id: 1,
        name: 'أحمد العميل'
      }
    },
    unread_count: 0,
    title: 'تركيب مراوح السقف',
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 3,
    participants: [
      {
        id: 1,
        name: 'أحمد العميل',
        first_name: 'أحمد',
        last_name: 'العميل',
        email: 'client@test.com'
      },
      {
        id: 103,
        name: 'خالد النجار',
        first_name: 'خالد',
        last_name: 'النجار',
        email: 'carpenter@test.com',
        profile_picture: '/avatars/carpenter.jpg'
      }
    ],
    last_message: {
      id: 305,
      content: 'سأكون عندكم غداً الساعة 10 صباحاً',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      sender: {
        id: 103,
        name: 'خالد النجار'
      }
    },
    unread_count: 0,
    title: 'صنع خزانة مطبخ',
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

export const mockMessages = {
  1: [ // Messages for conversation 1 (السباك)
    {
      id: 101,
      conversation_id: 1,
      content: 'مرحباً، أنا بحاجة إلى إصلاح حنفية المطبخ',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      sender: {
        id: 1,
        name: 'أحمد العميل',
        first_name: 'أحمد',
        last_name: 'العميل'
      },
      is_read: true
    },
    {
      id: 102,
      conversation_id: 1,
      content: 'أهلاً وسهلاً، ما نوع المشكلة بالتحديد؟',
      created_at: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
      sender: {
        id: 101,
        name: 'محمد السباك',
        first_name: 'محمد',
        last_name: 'السباك'
      },
      is_read: true
    },
    {
      id: 103,
      conversation_id: 1,
      content: 'الحنفية تسرب مياه والضغط ضعيف جداً',
      created_at: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
      sender: {
        id: 1,
        name: 'أحمد العميل',
        first_name: 'أحمد',
        last_name: 'العميل'
      },
      is_read: true
    },
    {
      id: 104,
      conversation_id: 1,
      content: 'حسناً، أحتاج لرؤية المشكلة. هل يمكنني القدوم غداً؟',
      created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      sender: {
        id: 101,
        name: 'محمد السباك',
        first_name: 'محمد',
        last_name: 'السباك'
      },
      is_read: true
    },
    {
      id: 105,
      conversation_id: 1,
      content: 'متى يمكنك القدوم لإصلاح الحنفية؟',
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      sender: {
        id: 101,
        name: 'محمد السباك',
        first_name: 'محمد',
        last_name: 'السباك'
      },
      is_read: false
    }
  ],
  2: [ // Messages for conversation 2 (الكهربائية)
    {
      id: 201,
      conversation_id: 2,
      content: 'مرحباً، أريد تركيب مراوح سقف في غرفتين',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      sender: {
        id: 1,
        name: 'أحمد العميل',
        first_name: 'أحمد',
        last_name: 'العميل'
      },
      is_read: true
    },
    {
      id: 202,
      conversation_id: 2,
      content: 'أهلاً بك، ما حجم الغرف وهل تريد مراوح مع إضاءة؟',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      sender: {
        id: 102,
        name: 'سارة الكهربائية',
        first_name: 'سارة',
        last_name: 'الكهربائية'
      },
      is_read: true
    },
    {
      id: 203,
      conversation_id: 2,
      content: 'الغرف متوسطة الحجم، ونعم أريد مراوح مع إضاءة LED',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      sender: {
        id: 1,
        name: 'أحمد العميل',
        first_name: 'أحمد',
        last_name: 'العميل'
      },
      is_read: true
    },
    {
      id: 204,
      conversation_id: 2,
      content: 'ممتاز، سأحضر المراوح وأقوم بالتركيب اليوم',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      sender: {
        id: 102,
        name: 'سارة الكهربائية',
        first_name: 'سارة',
        last_name: 'الكهربائية'
      },
      is_read: true
    },
    {
      id: 205,
      conversation_id: 2,
      content: 'تم الانتهاء من تركيب المراوح، شكراً لك',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      sender: {
        id: 1,
        name: 'أحمد العميل',
        first_name: 'أحمد',
        last_name: 'العميل'
      },
      is_read: true
    }
  ],
  3: [ // Messages for conversation 3 (النجار)
    {
      id: 301,
      conversation_id: 3,
      content: 'مرحباً، أريد صنع خزانة مطبخ مخصصة',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      sender: {
        id: 1,
        name: 'أحمد العميل',
        first_name: 'أحمد',
        last_name: 'العميل'
      },
      is_read: true
    },
    {
      id: 302,
      conversation_id: 3,
      content: 'أهلاً، ما المقاسات المطلوبة ونوع الخشب المفضل؟',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      sender: {
        id: 103,
        name: 'خالد النجار',
        first_name: 'خالد',
        last_name: 'النجار'
      },
      is_read: true
    },
    {
      id: 303,
      conversation_id: 3,
      content: 'الخزانة بطول 3 أمتار وارتفاع 2.5 متر، أريد خشب البلوط',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      sender: {
        id: 1,
        name: 'أحمد العميل',
        first_name: 'أحمد',
        last_name: 'العميل'
      },
      is_read: true
    },
    {
      id: 304,
      conversation_id: 3,
      content: 'ممتاز، سأحتاج لأسبوع لإنجاز العمل. هل هذا مناسب؟',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
      sender: {
        id: 103,
        name: 'خالد النجار',
        first_name: 'خالد',
        last_name: 'النجار'
      },
      is_read: true
    },
    {
      id: 305,
      conversation_id: 3,
      content: 'سأكون عندكم غداً الساعة 10 صباحاً',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      sender: {
        id: 103,
        name: 'خالد النجار',
        first_name: 'خالد',
        last_name: 'النجار'
      },
      is_read: true
    }
  ]
};

export const mockProfessionals = {
  101: { // السباك
    id: 101,
    user: {
      id: 101,
      name: 'محمد السباك',
      first_name: 'محمد',
      last_name: 'السباك',
      email: 'plumber@test.com',
      phone_number: '+966501234567',
      profile_picture: '/avatars/plumber.jpg'
    },
    business_name: 'خدمات السباكة المحترفة',
    business_description: 'خدمات سباكة شاملة للمنازل والمباني التجارية',
    profession: 'سباك محترف',
    experience_years: 8,
    average_rating: 4.8,
    review_count: 127,
    service_area: 'الرياض والمناطق المحيطة',
    hourly_rate: 75.00,
    is_verified: true,
    is_featured: true,
    profile_image: '/avatars/plumber.jpg',
    skills: ['إصلاح الأنابيب', 'تركيب الحنفيات', 'صيانة المراحيض'],
    languages: ['العربية', 'الإنجليزية']
  },
  102: { // الكهربائية
    id: 102,
    user: {
      id: 102,
      name: 'سارة الكهربائية',
      first_name: 'سارة',
      last_name: 'الكهربائية',
      email: 'electrician@test.com',
      phone_number: '+966501234568',
      profile_picture: '/avatars/electrician.jpg'
    },
    business_name: 'سارة للأعمال الكهربائية',
    business_description: 'خدمات كهربائية آمنة وموثوقة للمنازل والمكاتب',
    profession: 'كهربائية معتمدة',
    experience_years: 6,
    average_rating: 4.9,
    review_count: 98,
    service_area: 'الرياض وجدة',
    hourly_rate: 85.00,
    is_verified: true,
    is_featured: true,
    profile_image: '/avatars/electrician.jpg',
    skills: ['تركيب الإضاءة', 'صيانة المراوح', 'أعمال التوصيلات'],
    languages: ['العربية', 'الإنجليزية']
  },
  103: { // النجار
    id: 103,
    user: {
      id: 103,
      name: 'خالد النجار',
      first_name: 'خالد',
      last_name: 'النجار',
      email: 'carpenter@test.com',
      phone_number: '+966501234569',
      profile_picture: '/avatars/carpenter.jpg'
    },
    business_name: 'ورشة خالد للنجارة',
    business_description: 'أعمال نجارة مخصصة وأثاث منزلي عالي الجودة',
    profession: 'نجار ماهر',
    experience_years: 12,
    average_rating: 4.7,
    review_count: 156,
    service_area: 'الرياض والدمام',
    hourly_rate: 90.00,
    is_verified: true,
    is_featured: false,
    profile_image: '/avatars/carpenter.jpg',
    skills: ['صنع الأثاث', 'تركيب الخزائن', 'أعمال الديكور'],
    languages: ['العربية']
  }
};

// Helper functions for mock data
export const getMockConversation = (conversationId) => {
  return mockConversations.find(conv => conv.id === parseInt(conversationId));
};

export const getMockMessages = (conversationId) => {
  return mockMessages[conversationId] || [];
};

export const getMockProfessional = (professionalId) => {
  return mockProfessionals[professionalId];
};

// Generate a new message for testing auto-refresh
export const generateNewMockMessage = (conversationId, senderId, content) => {
  const newId = Date.now();
  const sender = senderId === 1 
    ? { id: 1, name: 'أحمد العميل', first_name: 'أحمد', last_name: 'العميل' }
    : mockProfessionals[senderId]?.user || { id: senderId, name: 'مستخدم', first_name: 'مستخدم', last_name: '' };

  return {
    id: newId,
    conversation_id: conversationId,
    content: content,
    created_at: new Date().toISOString(),
    sender: sender,
    is_read: false
  };
};

export default {
  mockConversations,
  mockMessages,
  mockProfessionals,
  getMockConversation,
  getMockMessages,
  getMockProfessional,
  generateNewMockMessage
}; 