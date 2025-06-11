import api from './api';

/**
 * خدمة المحترفين الجديدة للتعامل مع النظام المطور
 * Enhanced Professional service for the new system
 */
class ProfessionalService {
  // ================== Professional Profiles ==================
  
  /**
   * البحث عن المحترفين بالفلاتر المتقدمة
   * Search professionals with advanced filters
   */
  async searchProfessionals(filters = {}) {
    try {
      const params = {
        ...filters,
        ordering: filters.ordering || '-average_rating,-total_jobs'
      };
      
      const response = await api.get('/alistpros-profiles/professionals/', { params });
      return response;
    } catch (error) {
      console.error('Error searching professionals:', error);
      throw error;
    }
  }

  /**
   * جلب تفاصيل محترف محدد
   * Get professional details by user ID
   */
  async getProfessionalDetails(userId) {
    try {
      const response = await api.get(`/alistpros-profiles/professionals/${userId}/`);
      return response;
    } catch (error) {
      console.error('Error getting professional details:', error);
      throw error;
    }
  }

  /**
   * جلب البروفايل الشخصي للمحترف الحالي
   * Get current professional's profile
   */
  async getMyProfile() {
    try {
      const response = await api.get('/alistpros-profiles/my-profile/');
      return response;
    } catch (error) {
      console.error('Error getting my profile:', error);
      throw error;
    }
  }

  /**
   * إنشاء أو تحديث البروفايل المهني
   * Create or update professional profile
   */
  async updateMyProfile(profileData) {
    try {
      const response = await api.put('/alistpros-profiles/my-profile/', profileData);
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // ================== Service Requests ==================

  /**
   * جلب طلبات الخدمة
   * Get service requests
   */
  async getServiceRequests(filters = {}) {
    try {
      const response = await api.get('/alistpros-profiles/requests/', { params: filters });
      return response;
    } catch (error) {
      console.error('Error getting service requests:', error);
      throw error;
    }
  }

  /**
   * إنشاء طلب خدمة جديد (للعملاء)
   * Create new service request (for clients)
   */
  async createServiceRequest(requestData) {
    try {
      const response = await api.post('/alistpros-profiles/requests/', requestData);
      return response;
    } catch (error) {
      console.error('Error creating service request:', error);
      throw error;
    }
  }

  /**
   * تحديث طلب خدمة
   * Update service request
   */
  async updateServiceRequest(requestId, requestData) {
    try {
      const response = await api.put(`/alistpros-profiles/requests/${requestId}/`, requestData);
      return response;
    } catch (error) {
      console.error('Error updating service request:', error);
      throw error;
    }
  }

  /**
   * حذف طلب خدمة
   * Delete service request
   */
  async deleteServiceRequest(requestId) {
    try {
      const response = await api.delete(`/alistpros-profiles/requests/${requestId}/`);
      return response;
    } catch (error) {
      console.error('Error deleting service request:', error);
      throw error;
    }
  }

  // ================== Service Quotes ==================

  /**
   * جلب العروض
   * Get service quotes
   */
  async getServiceQuotes(filters = {}) {
    try {
      const response = await api.get('/alistpros-profiles/quotes/', { params: filters });
      return response;
    } catch (error) {
      console.error('Error getting service quotes:', error);
      throw error;
    }
  }

  /**
   * إنشاء عرض سعر (للمحترفين)
   * Create service quote (for professionals)
   */
  async createServiceQuote(quoteData) {
    try {
      const response = await api.post('/alistpros-profiles/quotes/', quoteData);
      return response;
    } catch (error) {
      console.error('Error creating service quote:', error);
      throw error;
    }
  }

  /**
   * تحديث عرض سعر
   * Update service quote
   */
  async updateServiceQuote(quoteId, quoteData) {
    try {
      const response = await api.put(`/alistpros-profiles/quotes/${quoteId}/`, quoteData);
      return response;
    } catch (error) {
      console.error('Error updating service quote:', error);
      throw error;
    }
  }

  /**
   * قبول عرض سعر (للعملاء)
   * Accept service quote (for clients)
   */
  async acceptServiceQuote(quoteId, acceptanceData = {}) {
    try {
      const response = await api.post(`/alistpros-profiles/quotes/${quoteId}/accept/`, acceptanceData);
      return response;
    } catch (error) {
      console.error('Error accepting service quote:', error);
      throw error;
    }
  }

  /**
   * رفض عرض سعر (للعملاء)
   * Reject service quote (for clients)
   */
  async rejectServiceQuote(quoteId, rejectionData = {}) {
    try {
      const response = await api.post(`/alistpros-profiles/quotes/${quoteId}/reject/`, rejectionData);
      return response;
    } catch (error) {
      console.error('Error rejecting service quote:', error);
      throw error;
    }
  }

  // ================== Job Assignments ==================

  /**
   * جلب المهام المكلف بها
   * Get job assignments
   */
  async getJobAssignments(filters = {}) {
    try {
      const response = await api.get('/alistpros-profiles/jobs/', { params: filters });
      return response;
    } catch (error) {
      console.error('Error getting job assignments:', error);
      throw error;
    }
  }

  /**
   * تحديث حالة المهمة
   * Update job assignment status
   */
  async updateJobAssignment(jobId, updateData) {
    try {
      const response = await api.put(`/alistpros-profiles/jobs/${jobId}/`, updateData);
      return response;
    } catch (error) {
      console.error('Error updating job assignment:', error);
      throw error;
    }
  }

  // ================== Availability Management ==================

  /**
   * جلب جدول التوفر
   * Get availability schedule
   */
  async getAvailability() {
    try {
      const response = await api.get('/alistpros-profiles/availability/');
      return response;
    } catch (error) {
      console.error('Error getting availability:', error);
      throw error;
    }
  }

  /**
   * إضافة فترة توفر
   * Add availability slot
   */
  async addAvailability(availabilityData) {
    try {
      const response = await api.post('/alistpros-profiles/availability/', availabilityData);
      return response;
    } catch (error) {
      console.error('Error adding availability:', error);
      throw error;
    }
  }

  /**
   * تحديث فترة توفر
   * Update availability slot
   */
  async updateAvailability(availabilityId, availabilityData) {
    try {
      const response = await api.put(`/alistpros-profiles/availability/${availabilityId}/`, availabilityData);
      return response;
    } catch (error) {
      console.error('Error updating availability:', error);
      throw error;
    }
  }

  /**
   * حذف فترة توفر
   * Delete availability slot
   */
  async deleteAvailability(availabilityId) {
    try {
      const response = await api.delete(`/alistpros-profiles/availability/${availabilityId}/`);
      return response;
    } catch (error) {
      console.error('Error deleting availability:', error);
      throw error;
    }
  }

  // ================== Time Off Management ==================

  /**
   * جلب فترات الإجازة
   * Get time off periods
   */
  async getTimeOff() {
    try {
      const response = await api.get('/alistpros-profiles/time-off/');
      return response;
    } catch (error) {
      console.error('Error getting time off:', error);
      throw error;
    }
  }

  /**
   * إضافة فترة إجازة
   * Add time off period
   */
  async addTimeOff(timeOffData) {
    try {
      const response = await api.post('/alistpros-profiles/time-off/', timeOffData);
      return response;
    } catch (error) {
      console.error('Error adding time off:', error);
      throw error;
    }
  }

  /**
   * حذف فترة إجازة
   * Delete time off period
   */
  async deleteTimeOff(timeOffId) {
    try {
      const response = await api.delete(`/alistpros-profiles/time-off/${timeOffId}/`);
      return response;
    } catch (error) {
      console.error('Error deleting time off:', error);
      throw error;
    }
  }

  // ================== Reviews Management ==================

  /**
   * جلب التقييمات
   * Get reviews
   */
  async getReviews(professionalId = null) {
    try {
      const url = professionalId 
        ? `/alistpros-profiles/professionals/${professionalId}/reviews/`
        : '/alistpros-profiles/reviews/';
      
      const response = await api.get(url);
      return response;
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  }

  /**
   * إنشاء تقييم (للعملاء)
   * Create review (for clients)
   */
  async createReview(professionalId, reviewData) {
    try {
      const response = await api.post(`/alistpros-profiles/professionals/${professionalId}/reviews/`, reviewData);
      return response;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * الرد على تقييم (للمحترفين)
   * Respond to review (for professionals)
   */
  async respondToReview(reviewId, responseData) {
    try {
      const response = await api.post(`/alistpros-profiles/reviews/${reviewId}/respond/`, responseData);
      return response;
    } catch (error) {
      console.error('Error responding to review:', error);
      throw error;
    }
  }

  // ================== Dashboard Data ==================

  /**
   * جلب بيانات لوحة تحكم المحترف
   * Get professional dashboard data
   */
  async getProfessionalDashboard() {
    try {
      const response = await api.get('/alistpros-profiles/dashboard/professional/');
      return response;
    } catch (error) {
      console.error('Error getting professional dashboard:', error);
      throw error;
    }
  }

  /**
   * جلب بيانات لوحة تحكم العميل
   * Get client dashboard data
   */
  async getClientDashboard() {
    try {
      const response = await api.get('/alistpros-profiles/dashboard/client/');
      return response;
    } catch (error) {
      console.error('Error getting client dashboard:', error);
      throw error;
    }
  }

  // ================== Service Categories ==================

  /**
   * جلب فئات الخدمات
   * Get service categories
   */
  async getServiceCategories() {
    try {
      const response = await api.get('/alistpros-profiles/categories/');
      return response;
    } catch (error) {
      console.error('Error getting service categories:', error);
      throw error;
    }
  }

  // ================== Search & Filters ==================

  /**
   * البحث المتقدم بفلاتر متعددة
   * Advanced search with multiple filters
   */
  async advancedSearch(filters = {}) {
    const searchParams = {
      // Role-based filters
      role: filters.role,
      
      // Experience filters
      min_experience: filters.minExperience,
      max_experience: filters.maxExperience,
      
      // Rating filters
      min_rating: filters.minRating,
      max_rating: filters.maxRating,
      
      // Price filters
      min_rate: filters.minRate,
      max_rate: filters.maxRate,
      
      // Location filters
      city: filters.city,
      state: filters.state,
      zip_code: filters.zipCode,
      lat: filters.latitude,
      lng: filters.longitude,
      radius: filters.radius,
      
      // Category filters
      category: filters.categoryId,
      categories: filters.categoryIds,
      
      // Availability filters
      is_available: filters.isAvailable,
      is_verified: filters.isVerified,
      is_featured: filters.isFeatured,
      has_license: filters.hasLicense,
      
      // Search terms
      search: filters.searchTerm,
      
      // Pagination
      page: filters.page || 1,
      page_size: filters.pageSize || 12,
      
      // Ordering
      ordering: filters.ordering || '-average_rating,-total_jobs'
    };

    // Remove empty/null values
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] === null || searchParams[key] === undefined || searchParams[key] === '') {
        delete searchParams[key];
      }
    });

    return this.searchProfessionals(searchParams);
  }

  // ================== Role-Specific Methods ==================

  /**
   * البحث عن المحترفين حسب الدور
   * Search professionals by role
   */
  async getProfessionalsByRole(role, filters = {}) {
    return this.searchProfessionals({
      ...filters,
      role: role
    });
  }

  /**
   * جلب المتخصصين A-List
   * Get A-List Specialists
   */
  async getSpecialists(filters = {}) {
    return this.getProfessionalsByRole('specialist', filters);
  }

  /**
   * جلب مقدمي الخدمة Home Pros
   * Get Home Pros
   */
  async getContractors(filters = {}) {
    return this.getProfessionalsByRole('contractor', filters);
  }

  /**
   * جلب أعضاء الطاقم Crew Members
   * Get Crew Members
   */
  async getCrewMembers(filters = {}) {
    return this.getProfessionalsByRole('crew', filters);
  }

  // ================== Statistics & Analytics ==================

  /**
   * جلب إحصائيات المحترف
   * Get professional statistics
   */
  async getProfessionalStats(professionalId = null) {
    try {
      const dashboard = professionalId 
        ? await this.getProfessionalDetails(professionalId)
        : await this.getProfessionalDashboard();
      
      return {
        totalJobs: dashboard.data.total_jobs || 0,
        completedJobs: dashboard.data.jobs_completed || 0,
        averageRating: dashboard.data.average_rating || 0,
        successRate: dashboard.data.success_rate || 0,
        responseTime: dashboard.data.response_time_hours || 24
      };
    } catch (error) {
      console.error('Error getting professional stats:', error);
      throw error;
    }
  }
}

export default new ProfessionalService();
export { ProfessionalService }; 