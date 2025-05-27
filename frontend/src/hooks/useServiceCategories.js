import { useState, useEffect } from 'react';
import { alistProsService } from '../services/api';

export function useServiceCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // وظيفة لجلب فئات الخدمات
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await alistProsService.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching service categories:', err);
      setError(err.response?.data?.message || 'فشل في جلب فئات الخدمات. يرجى المحاولة مرة أخرى.');
      
      // بيانات وهمية للعرض التجريبي
      setCategories(generateMockCategories());
    } finally {
      setLoading(false);
    }
  };
  
  // جلب تفاصيل فئة خدمة محددة
  const fetchCategoryDetails = async (categoryId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await alistProsService.getCategory(categoryId);
      return response.data;
    } catch (err) {
      console.error(`Error fetching category details for ID ${categoryId}:`, err);
      setError(err.response?.data?.message || 'فشل في جلب تفاصيل الفئة. يرجى المحاولة مرة أخرى.');
      
      // بيانات وهمية للعرض التجريبي
      const mockCategories = generateMockCategories();
      return mockCategories.find(cat => cat.id === parseInt(categoryId)) || {
        id: categoryId,
        name: 'فئة غير معروفة',
        description: 'لا يوجد وصف متاح لهذه الفئة',
        icon: 'wrench',
        image: 'https://images.unsplash.com/photo-1621905252472-943afaa20e20?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        professionals_count: 0
      };
    } finally {
      setLoading(false);
    }
  };
  
  // توليد بيانات وهمية للعرض التجريبي
  const generateMockCategories = () => {
    return [
      {
        id: 1,
        name: 'سباكة',
        description: 'خدمات السباكة تشمل إصلاح التسريبات، تركيب وإصلاح المراحيض والحنفيات، وتسليك المجاري.',
        icon: 'wrench',
        image: 'https://images.unsplash.com/photo-1621905252472-943afaa20e20?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        professionals_count: 42
      },
      {
        id: 2,
        name: 'كهرباء',
        description: 'خدمات الكهرباء تشمل إصلاح الأعطال، تركيب وإصلاح المصابيح والمفاتيح، وتمديد الأسلاك الكهربائية.',
        icon: 'bolt',
        image: 'https://images.unsplash.com/photo-1621905252002-1297900cc612?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        professionals_count: 38
      },
      {
        id: 3,
        name: 'نجارة',
        description: 'خدمات النجارة تشمل إصلاح وتصنيع الأثاث، تركيب الأبواب والنوافذ، وأعمال النجارة العامة.',
        icon: 'hammer',
        image: 'https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        professionals_count: 25
      },
      {
        id: 4,
        name: 'دهان',
        description: 'خدمات الدهان تشمل دهان المنازل والشقق من الداخل والخارج، وإزالة ورق الجدران، وإصلاح الشقوق.',
        icon: 'paint-roller',
        image: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        professionals_count: 31
      },
      {
        id: 5,
        name: 'تنظيف',
        description: 'خدمات التنظيف تشمل تنظيف المنازل والشقق والمكاتب، وتنظيف السجاد والمفروشات، وتنظيف النوافذ.',
        icon: 'broom',
        image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        professionals_count: 50
      },
      {
        id: 6,
        name: 'تكييف وتبريد',
        description: 'خدمات التكييف والتبريد تشمل تركيب وإصلاح مكيفات الهواء، والثلاجات، وأنظمة التبريد.',
        icon: 'snowflake',
        image: 'https://images.unsplash.com/photo-1581275868691-8685cc48cad0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        professionals_count: 22
      }
    ];
  };
  
  // جلب فئات الخدمات عند تحميل المكون
  useEffect(() => {
    fetchCategories();
  }, []);
  
  return {
    categories,
    loading,
    error,
    fetchCategories,
    fetchCategoryDetails
  };
}

export default useServiceCategories; 