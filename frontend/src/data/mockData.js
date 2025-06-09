// 🎭 Mock Data for Testing | بيانات وهمية للاختبار
// A-List Home Pros - Mock Data

export const mockAppointments = {
  "1": {
    id: 1,
    status: "pending",
    service_category: {
      id: "plumbing",
      name: "Plumbing Services",
      name_ar: "خدمات السباكة"
    },
    appointment_date: "2024-01-20",
    start_time: "10:00:00",
    end_time: "12:00:00",
    estimated_cost: 150.00,
    location: "123 Main Street, Riyadh, Saudi Arabia",
    service_description: "Fix kitchen sink leak and replace faucet. The kitchen sink has been leaking for about a week and needs immediate attention.",
    service_description_ar: "إصلاح تسريب حوض المطبخ واستبدال الصنبور. حوض المطبخ يتسرب منذ حوالي أسبوع ويحتاج إلى اهتمام فوري.",
    notes: "Please use the back entrance. Park in the driveway.",
    notes_ar: "يرجى استخدام المدخل الخلفي. الوقوف في الممر.",
    alistpro: 101,
    professional_id: 101,
    client: {
      id: 201,
      name: "Ahmed Al-Rashid",
      name_ar: "أحمد الراشد",
      email: "ahmed.rashid@email.com",
      phone_number: "+966-50-123-4567",
      address: "123 Main Street, Riyadh, Saudi Arabia",
      address_ar: "123 الشارع الرئيسي، الرياض، المملكة العربية السعودية"
    },
    conversation_id: null,
    payment_id: null,
    created_at: "2024-01-15T08:30:00Z",
    updated_at: "2024-01-15T08:30:00Z"
  },
  "2": {
    id: 2,
    status: "confirmed",
    service_category: {
      id: "electrical",
      name: "Electrical Services",
      name_ar: "الخدمات الكهربائية"
    },
    appointment_date: "2024-01-22",
    start_time: "14:00:00",
    end_time: "16:00:00",
    estimated_cost: 200.00,
    location: "456 Oak Avenue, Jeddah, Saudi Arabia",
    service_description: "Install new ceiling fan in living room and fix flickering lights.",
    service_description_ar: "تركيب مروحة سقف جديدة في غرفة المعيشة وإصلاح الأضواء المتذبذبة.",
    notes: "Electrician should bring a 52-inch ceiling fan.",
    notes_ar: "يجب على الكهربائي إحضار مروحة سقف بقياس 52 بوصة.",
    alistpro: 102,
    professional_id: 102,
    client: {
      id: 202,
      name: "Fatima Al-Zahra",
      name_ar: "فاطمة الزهراء",
      email: "fatima.zahra@email.com",
      phone_number: "+966-55-987-6543",
      address: "456 Oak Avenue, Jeddah, Saudi Arabia",
      address_ar: "456 شارع البلوط، جدة، المملكة العربية السعودية"
    },
    conversation_id: 301,
    payment_id: null,
    created_at: "2024-01-16T10:15:00Z",
    updated_at: "2024-01-17T09:22:00Z"
  },
  "3": {
    id: 3,
    status: "paid",
    service_category: {
      id: "carpentry",
      name: "Carpentry Services",
      name_ar: "خدمات النجارة"
    },
    appointment_date: "2024-01-25",
    start_time: "09:00:00",
    end_time: "17:00:00",
    estimated_cost: 500.00,
    location: "789 Pine Street, Dammam, Saudi Arabia",
    service_description: "Build custom kitchen cabinets and install new countertops.",
    service_description_ar: "بناء خزائن مطبخ مخصصة وتركيب أسطح عمل جديدة.",
    notes: "Materials will be provided by the client.",
    notes_ar: "سيتم توفير المواد من قبل العميل.",
    alistpro: 103,
    professional_id: 103,
    client: {
      id: 203,
      name: "Omar Al-Saudi",
      name_ar: "عمر السعودي",
      email: "omar.saudi@email.com",
      phone_number: "+966-50-555-1234",
      address: "789 Pine Street, Dammam, Saudi Arabia",
      address_ar: "789 شارع الصنوبر، الدمام، المملكة العربية السعودية"
    },
    conversation_id: 302,
    payment_id: 401,
    created_at: "2024-01-10T14:20:00Z",
    updated_at: "2024-01-18T11:45:00Z"
  },
  "4": {
    id: 4,
    status: "completed",
    service_category: {
      id: "painting",
      name: "Painting Services",
      name_ar: "خدمات الدهان"
    },
    appointment_date: "2024-01-18",
    start_time: "08:00:00",
    end_time: "16:00:00",
    estimated_cost: 300.00,
    location: "321 Cedar Lane, Mecca, Saudi Arabia",
    service_description: "Paint living room and dining room with premium paint.",
    service_description_ar: "دهان غرفة المعيشة وغرفة الطعام بدهان ممتاز.",
    notes: "Use neutral colors as discussed.",
    notes_ar: "استخدام ألوان محايدة كما تم الاتفاق عليه.",
    alistpro: 104,
    professional_id: 104,
    client: {
      id: 204,
      name: "Aisha Al-Harbi",
      name_ar: "عائشة الحربي",
      email: "aisha.harbi@email.com",
      phone_number: "+966-56-777-8888",
      address: "321 Cedar Lane, Mecca, Saudi Arabia",
      address_ar: "321 شارع الأرز، مكة المكرمة، المملكة العربية السعودية"
    },
    conversation_id: 303,
    payment_id: 402,
    created_at: "2024-01-12T16:30:00Z",
    updated_at: "2024-01-18T17:00:00Z"
  }
};

export const mockProfessionals = {
  "101": {
    id: 101,
    user: {
      id: 1001,
      name: "Mohammed Al-Fahed",
      name_ar: "محمد الفهد",
      email: "mohammed.fahed@email.com",
      phone_number: "+966-50-111-2222",
      profile_picture: "/images/professionals/mohammed-fahed.jpg"
    },
    business_name: "Al-Fahed Plumbing Services",
    business_name_ar: "خدمات السباكة الفهد",
    business_description: "Professional plumbing services with over 10 years of experience. Specializing in residential and commercial plumbing repairs, installations, and maintenance.",
    business_description_ar: "خدمات سباكة محترفة مع أكثر من 10 سنوات من الخبرة. متخصص في إصلاحات وتركيبات وصيانة السباكة السكنية والتجارية.",
    profession: "Master Plumber",
    profession_ar: "سباك رئيسي",
    experience_years: 12,
    average_rating: 4.8,
    review_count: 156,
    service_area: "Riyadh and surrounding areas",
    service_area_ar: "الرياض والمناطق المحيطة",
    hourly_rate: 75.00,
    is_verified: true,
    is_featured: true,
    profile_image: "/images/professionals/mohammed-fahed.jpg",
    portfolio_images: [
      "/images/portfolio/plumbing-1.jpg",
      "/images/portfolio/plumbing-2.jpg",
      "/images/portfolio/plumbing-3.jpg"
    ],
    skills: ["Pipe Installation", "Leak Repair", "Drain Cleaning", "Water Heater Repair"],
    skills_ar: ["تركيب الأنابيب", "إصلاح التسريبات", "تنظيف الصرف", "إصلاح سخان المياه"],
    certifications: ["Licensed Plumber", "Gas Line Certified"],
    certifications_ar: ["سباك مرخص", "معتمد خطوط الغاز"],
    languages: ["Arabic", "English"],
    created_at: "2023-06-15T10:00:00Z",
    updated_at: "2024-01-15T08:30:00Z"
  },
  "102": {
    id: 102,
    user: {
      id: 1002,
      name: "Khalid Al-Otaibi",
      name_ar: "خالد العتيبي",
      email: "khalid.otaibi@email.com",
      phone_number: "+966-55-333-4444",
      profile_picture: "/images/professionals/khalid-otaibi.jpg"
    },
    business_name: "Elite Electrical Solutions",
    business_name_ar: "حلول الكهرباء المتميزة",
    business_description: "Certified electrician providing safe and reliable electrical services for homes and businesses.",
    business_description_ar: "كهربائي معتمد يقدم خدمات كهربائية آمنة وموثوقة للمنازل والشركات.",
    profession: "Licensed Electrician",
    profession_ar: "كهربائي مرخص",
    experience_years: 8,
    average_rating: 4.9,
    review_count: 89,
    service_area: "Jeddah Metropolitan Area",
    service_area_ar: "منطقة جدة الكبرى",
    hourly_rate: 80.00,
    is_verified: true,
    is_featured: false,
    profile_image: "/images/professionals/khalid-otaibi.jpg",
    portfolio_images: [
      "/images/portfolio/electrical-1.jpg",
      "/images/portfolio/electrical-2.jpg"
    ],
    skills: ["Wiring Installation", "Circuit Repair", "Lighting Installation", "Panel Upgrades"],
    skills_ar: ["تركيب الأسلاك", "إصلاح الدوائر", "تركيب الإضاءة", "ترقية اللوحات"],
    certifications: ["Licensed Electrician", "High Voltage Certified"],
    certifications_ar: ["كهربائي مرخص", "معتمد جهد عالي"],
    languages: ["Arabic", "English"],
    created_at: "2023-08-20T14:30:00Z",
    updated_at: "2024-01-16T10:15:00Z"
  },
  "103": {
    id: 103,
    user: {
      id: 1003,
      name: "Abdullah Al-Mansouri",
      name_ar: "عبدالله المنصوري",
      email: "abdullah.mansouri@email.com",
      phone_number: "+966-50-555-6666",
      profile_picture: "/images/professionals/abdullah-mansouri.jpg"
    },
    business_name: "Master Carpentry Works",
    business_name_ar: "أعمال النجارة الرئيسية",
    business_description: "Custom carpentry and woodworking services. Specializing in kitchen cabinets, built-in furniture, and home renovations.",
    business_description_ar: "خدمات النجارة والأعمال الخشبية المخصصة. متخصص في خزائن المطبخ والأثاث المدمج وتجديد المنازل.",
    profession: "Master Carpenter",
    profession_ar: "نجار رئيسي",
    experience_years: 15,
    average_rating: 4.7,
    review_count: 234,
    service_area: "Eastern Province",
    service_area_ar: "المنطقة الشرقية",
    hourly_rate: 65.00,
    is_verified: true,
    is_featured: true,
    profile_image: "/images/professionals/abdullah-mansouri.jpg",
    portfolio_images: [
      "/images/portfolio/carpentry-1.jpg",
      "/images/portfolio/carpentry-2.jpg",
      "/images/portfolio/carpentry-3.jpg",
      "/images/portfolio/carpentry-4.jpg"
    ],
    skills: ["Custom Cabinets", "Furniture Making", "Wood Finishing", "Kitchen Remodeling"],
    skills_ar: ["خزائن مخصصة", "صناعة الأثاث", "تشطيب الخشب", "تجديد المطابخ"],
    certifications: ["Certified Carpenter", "Wood Working Master"],
    certifications_ar: ["نجار معتمد", "خبير أعمال الخشب"],
    languages: ["Arabic", "English", "Urdu"],
    created_at: "2023-03-10T09:45:00Z",
    updated_at: "2024-01-10T14:20:00Z"
  },
  "104": {
    id: 104,
    user: {
      id: 1004,
      name: "Yusuf Al-Dosari",
      name_ar: "يوسف الدوسري",
      email: "yusuf.dosari@email.com",
      phone_number: "+966-56-777-8888",
      profile_picture: "/images/professionals/yusuf-dosari.jpg"
    },
    business_name: "Premium Painting Services",
    business_name_ar: "خدمات الدهان المتميزة",
    business_description: "Professional painting contractor specializing in interior and exterior painting with premium quality materials.",
    business_description_ar: "مقاول دهان محترف متخصص في الدهان الداخلي والخارجي بمواد عالية الجودة.",
    profession: "Painting Contractor",
    profession_ar: "مقاول دهان",
    experience_years: 10,
    average_rating: 4.6,
    review_count: 167,
    service_area: "Mecca and Holy Sites",
    service_area_ar: "مكة والمشاعر المقدسة",
    hourly_rate: 55.00,
    is_verified: true,
    is_featured: false,
    profile_image: "/images/professionals/yusuf-dosari.jpg",
    portfolio_images: [
      "/images/portfolio/painting-1.jpg",
      "/images/portfolio/painting-2.jpg",
      "/images/portfolio/painting-3.jpg"
    ],
    skills: ["Interior Painting", "Exterior Painting", "Color Consultation", "Wall Preparation"],
    skills_ar: ["الدهان الداخلي", "الدهان الخارجي", "استشارة الألوان", "تحضير الجدران"],
    certifications: ["Licensed Painting Contractor", "Color Specialist"],
    certifications_ar: ["مقاول دهان مرخص", "أخصائي ألوان"],
    languages: ["Arabic", "English"],
    created_at: "2023-07-05T11:20:00Z",
    updated_at: "2024-01-12T16:30:00Z"
  }
};

export const mockPayments = {
  "401": {
    id: 401,
    appointment_id: 3,
    amount: 500.00,
    currency: "SAR",
    payment_method: "Credit Card",
    payment_method_ar: "بطاقة ائتمان",
    status: "completed",
    transaction_id: "TXN_20240118_112045_KSA",
    provider_transaction_id: "stripe_ch_3M2kL3K4m5n6o7P8",
    payment_gateway: "Stripe",
    processing_fee: 15.00,
    net_amount: 485.00,
    description: "Payment for carpentry services - Custom kitchen cabinets",
    description_ar: "دفع مقابل خدمات النجارة - خزائن مطبخ مخصصة",
    created_at: "2024-01-18T11:20:45Z",
    updated_at: "2024-01-18T11:21:02Z",
    paid_at: "2024-01-18T11:21:00Z"
  },
  "402": {
    id: 402,
    appointment_id: 4,
    amount: 300.00,
    currency: "SAR",
    payment_method: "Credit Card",
    payment_method_ar: "بطاقة ائتمان",
    status: "completed",
    transaction_id: "TXN_20240118_170030_KSA",
    provider_transaction_id: "stripe_ch_3M2kL3K4m5n6o7P9",
    payment_gateway: "Stripe",
    processing_fee: 9.00,
    net_amount: 291.00,
    description: "Payment for painting services - Living and dining room",
    description_ar: "دفع مقابل خدمات الدهان - غرفة المعيشة وغرفة الطعام",
    created_at: "2024-01-18T17:00:30Z",
    updated_at: "2024-01-18T17:00:45Z",
    paid_at: "2024-01-18T17:00:40Z"
  }
};

export const mockConversations = {
  "301": {
    id: 301,
    appointment_id: 2,
    participants: [202, 1002], // client and professional user IDs
    title: "Electrical Service Discussion",
    title_ar: "مناقشة الخدمة الكهربائية",
    last_message: "Perfect! See you tomorrow at 2 PM.",
    last_message_ar: "ممتاز! أراك غداً في الساعة 2 مساءً.",
    last_message_at: "2024-01-17T15:30:00Z",
    unread_count: 0,
    created_at: "2024-01-16T10:30:00Z",
    updated_at: "2024-01-17T15:30:00Z"
  },
  "302": {
    id: 302,
    appointment_id: 3,
    participants: [203, 1003],
    title: "Carpentry Project Details",
    title_ar: "تفاصيل مشروع النجارة",
    last_message: "Payment confirmed. Ready to start work!",
    last_message_ar: "تم تأكيد الدفع. جاهز لبدء العمل!",
    last_message_at: "2024-01-18T11:25:00Z",
    unread_count: 1,
    created_at: "2024-01-10T14:30:00Z",
    updated_at: "2024-01-18T11:25:00Z"
  },
  "303": {
    id: 303,
    appointment_id: 4,
    participants: [204, 1004],
    title: "Painting Job Completion",
    title_ar: "اكتمال عمل الدهان",
    last_message: "Job completed successfully! Thank you!",
    last_message_ar: "تم إنجاز العمل بنجاح! شكراً لك!",
    last_message_at: "2024-01-18T17:05:00Z",
    unread_count: 0,
    created_at: "2024-01-12T16:45:00Z",
    updated_at: "2024-01-18T17:05:00Z"
  }
};

// Helper function to get mock data
export const getMockAppointment = (id) => {
  return mockAppointments[id.toString()] || null;
};

export const getMockProfessional = (id) => {
  return mockProfessionals[id.toString()] || null;
};

export const getMockPayment = (appointmentId) => {
  return Object.values(mockPayments).find(payment => 
    payment.appointment_id === parseInt(appointmentId)
  ) || null;
};

export const getMockConversation = (id) => {
  return mockConversations[id.toString()] || null;
};

// Generate mock payment data for appointment
export const generateMockPaymentForAppointment = (appointmentId) => {
  const appointment = getMockAppointment(appointmentId);
  if (!appointment) return null;

  return {
    id: Math.floor(Math.random() * 10000) + 1000,
    appointment_id: parseInt(appointmentId),
    amount: appointment.estimated_cost,
    currency: "SAR",
    payment_method: "Credit Card",
    payment_method_ar: "بطاقة ائتمان",
    status: "completed",
    transaction_id: `TXN_${new Date().toISOString().replace(/[-:\.]/g, '').slice(0, 15)}_KSA`,
    provider_transaction_id: `stripe_ch_${Math.random().toString(36).substr(2, 20)}`,
    payment_gateway: "Stripe",
    processing_fee: Math.round(appointment.estimated_cost * 0.03 * 100) / 100,
    net_amount: Math.round((appointment.estimated_cost * 0.97) * 100) / 100,
    description: `Payment for ${appointment.service_category.name}`,
    description_ar: `دفع مقابل ${appointment.service_category.name_ar || appointment.service_category.name}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    paid_at: new Date().toISOString()
  };
}; 