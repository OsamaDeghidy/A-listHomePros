/**
 * بيانات احتياطية للاستخدام في حالة فشل الاتصال بالخادم
 * هذه البيانات تساعد في تطوير الواجهة دون الحاجة للاعتماد على الخادم الخلفي
 */

import { format } from 'date-fns';

// دالة مساعدة لتكييف البيانات حسب اللغة
export const getLocalizedData = (isArabic) => {
  return {
    // بيانات المحترفين المميزين
    featuredPros: [
      {
        id: 1,
        user: {
          first_name: isArabic ? 'جون' : 'John',
          last_name: isArabic ? 'ويلسون' : 'Wilson'
        },
        profile_image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
        services: [isArabic ? 'سباكة' : 'Plumbing', isArabic ? 'كهرباء' : 'Electrical'],
        rating: 4.9,
        reviews_count: 127,
        location: isArabic ? 'نيويورك، نيويورك' : 'New York, NY',
        bio: isArabic ? 'سباك ذو خبرة مع أكثر من 10 سنوات من الخبرة في المجال.' : 'Experienced plumber with over 10 years of industry expertise.'
      },
      {
        id: 2,
        user: {
          first_name: isArabic ? 'سارة' : 'Sarah',
          last_name: isArabic ? 'جونسون' : 'Johnson'
        },
        profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
        services: [isArabic ? 'تنظيف' : 'Cleaning', isArabic ? 'تنظيم' : 'Organization'],
        rating: 4.8,
        reviews_count: 98,
        location: isArabic ? 'شيكاغو، إلينوي' : 'Chicago, IL',
        bio: isArabic ? 'متخصصة في تنظيف المنازل مكرسة لجعل مساحتك نظيفة تمامًا.' : 'Professional house cleaner dedicated to making your space spotless.'
      },
      {
        id: 3,
        user: {
          first_name: isArabic ? 'مايكل' : 'Michael',
          last_name: isArabic ? 'تشين' : 'Chen'
        },
        profile_image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
        services: [isArabic ? 'نجارة' : 'Carpentry', isArabic ? 'تجميع أثاث' : 'Furniture Assembly'],
        rating: 4.7,
        reviews_count: 76,
        location: isArabic ? 'سان فرانسيسكو، كاليفورنيا' : 'San Francisco, CA',
        bio: isArabic ? 'نجار ماهر مع الاهتمام بالتفاصيل وجودة العمل.' : 'Skilled carpenter with attention to detail and quality craftsmanship.'
      },
      {
        id: 4,
        user: {
          first_name: isArabic ? 'ديفيد' : 'David',
          last_name: isArabic ? 'رودريغيز' : 'Rodriguez'
        },
        profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
        services: [isArabic ? 'طلاء' : 'Painting', isArabic ? 'إصلاح الجدران الجافة' : 'Drywall Repair'],
        rating: 4.9,
        reviews_count: 112,
        location: isArabic ? 'ميامي، فلوريدا' : 'Miami, FL',
        bio: isArabic ? 'رسام محترف يحول المنازل باللون والدقة.' : 'Professional painter transforming homes with color and precision.'
      }
    ],

    // بيانات الخدمات الشائعة
    popularServices: [
      {
        id: 1,
        name: isArabic ? 'سباكة' : 'Plumbing',
        icon: '🔧',
        description: isArabic ? 'خدمات سباكة احترافية لمنزلك' : 'Professional plumbing services for your home',
        image_url: 'https://images.unsplash.com/photo-1585704032915-c3400305e979?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        service_count: 24
      },
      {
        id: 2,
        name: isArabic ? 'كهرباء' : 'Electrical',
        icon: '⚡',
        description: isArabic ? 'إصلاح وتركيب كهربائي خبير' : 'Expert electrical repair and installation',
        image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        service_count: 19
      },
      {
        id: 3,
        name: isArabic ? 'تنظيف المنازل' : 'House Cleaning',
        icon: '🧹',
        description: isArabic ? 'حافظ على نظافة مساحتك مع خدمات التنظيف لدينا' : 'Keep your space spotless with our cleaning services',
        image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        service_count: 31
      },
      {
        id: 4,
        name: isArabic ? 'نجارة' : 'Carpentry',
        icon: '🔨',
        description: isArabic ? 'حلول مخصصة للأعمال الخشبية والأثاث' : 'Custom woodworking and furniture solutions',
        image_url: 'https://images.unsplash.com/photo-1601612628452-9e99ced43524?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        service_count: 15
      },
      {
        id: 5,
        name: isArabic ? 'طلاء' : 'Painting',
        icon: '🖌️',
        description: isArabic ? 'خدمات طلاء احترافية لأي سطح' : 'Professional painting services for any surface',
        image_url: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        service_count: 22
      },
      {
        id: 6,
        name: isArabic ? 'إصلاح الأجهزة' : 'Appliance Repair',
        icon: '🔌',
        description: isArabic ? 'إصلاح أجهزتك المنزلية بسرعة وكفاءة' : 'Fix your home appliances quickly and efficiently',
        image_url: 'https://images.unsplash.com/photo-1581092921461-39b9884e8331?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        service_count: 17
      },
      {
        id: 7,
        name: isArabic ? 'البستنة' : 'Gardening',
        icon: '🌱',
        description: isArabic ? 'خدمات تنسيق الحدائق وصيانتها' : 'Landscaping and garden maintenance services',
        image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        service_count: 13
      },
      {
        id: 8,
        name: isArabic ? 'خدمات النقل' : 'Moving Services',
        icon: '📦',
        description: isArabic ? 'مساعدة احترافية لاحتياجات النقل الخاصة بك' : 'Professional help for your moving needs',
        image_url: 'https://images.unsplash.com/photo-1600518464441-7212cda107e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        service_count: 11
      }
    ],

    // بيانات المقالات الشائعة
    blogPosts: [
      {
        id: 1,
        title: isArabic 
          ? "كيفية اختيار السباك المناسب لمنزلك" 
          : "How to Choose the Right Plumber for Your Home",
        excerpt: isArabic 
          ? "نصائح مهمة لاختيار سباك محترف وموثوق لإصلاح مشاكل السباكة دون إضاعة المال والوقت." 
          : "Important tips for choosing a professional and reliable plumber to fix your plumbing issues without wasting money and time.",
        imageUrl: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        category: isArabic ? "نصائح منزلية" : "Home Tips",
        date: new Date("2023-05-10").toISOString(),
        readTime: isArabic ? "7 دقائق" : "7 min"
      },
      {
        id: 2,
        title: isArabic 
          ? "10 مشكلات كهربائية شائعة وكيفية إصلاحها" 
          : "10 Common Electrical Faults and How to Fix Them",
        excerpt: isArabic 
          ? "تعرف على أكثر المشكلات الكهربائية شيوعًا في المنازل وكيفية التعامل معها بأمان قبل وصول الكهربائي." 
          : "Learn about the most common electrical problems in homes and how to safely handle them before the electrician arrives.",
        imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        category: isArabic ? "صيانة" : "Maintenance",
        date: new Date("2023-06-02").toISOString(),
        readTime: isArabic ? "5 دقائق" : "5 min"
      },
      {
        id: 3,
        title: isArabic 
          ? "نصائح لتجديد منزلك بميزانية محدودة" 
          : "Tips for Renovating Your Home on a Budget",
        excerpt: isArabic 
          ? "أفكار إبداعية لتغيير ديكور منزلك ومنحه مظهرًا جديدًا دون إنفاق الكثير من المال." 
          : "Creative ideas to change your home decor and give it a new look without spending a lot of money.",
        imageUrl: "https://images.unsplash.com/photo-1615529328331-f8917597711f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        category: isArabic ? "ديكور" : "Decor",
        date: new Date("2023-07-17").toISOString(),
        readTime: isArabic ? "8 دقائق" : "8 min"
      }
    ],

    // بيانات فئات الخدمات
    serviceCategories: [
      { id: 'plumbing', name: isArabic ? 'سباكة' : 'Plumbing' },
      { id: 'electrical', name: isArabic ? 'كهرباء' : 'Electrical' },
      { id: 'carpentry', name: isArabic ? 'نجارة' : 'Carpentry' },
      { id: 'painting', name: isArabic ? 'طلاء' : 'Painting' },
      { id: 'cleaning', name: isArabic ? 'تنظيف' : 'Cleaning' },
      { id: 'furniture_moving', name: isArabic ? 'نقل أثاث' : 'Furniture Moving' },
      { id: 'air_conditioning', name: isArabic ? 'تكييف' : 'Air Conditioning' },
      { id: 'metalwork', name: isArabic ? 'أعمال معدنية' : 'Metalwork' }
    ],

    // دوال مساعدة
    formatDate: (dateString) => {
      try {
        const date = new Date(dateString);
        return format(date, 'PP', { locale: isArabic ? require('date-fns/locale/ar-SA') : require('date-fns/locale/en-US') });
      } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
      }
    }
  };
};

export default getLocalizedData; 