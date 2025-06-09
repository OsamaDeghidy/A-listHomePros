import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import {
  FaTools,
  FaAward,
  FaGraduationCap,
  FaBuilding,
  FaPlus,
  FaMinus,
  FaTrash,
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaDollarSign,
  FaClock,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaFileAlt,
  FaCertificate,
  FaUsers,
  FaHeadset
} from 'react-icons/fa';

const UserTypeSpecificFields = ({ userType, profileData, handleInputChange }) => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const [newItem, setNewItem] = useState('');

  const addArrayItem = (fieldPath, value) => {
    if (!value.trim()) return;
    
    const currentArray = getFieldValue(fieldPath) || [];
    const updatedArray = [...currentArray, value.trim()];
    handleInputChange(fieldPath, updatedArray);
    setNewItem('');
  };

  const removeArrayItem = (fieldPath, index) => {
    const currentArray = getFieldValue(fieldPath) || [];
    const updatedArray = currentArray.filter((_, i) => i !== index);
    handleInputChange(fieldPath, updatedArray);
  };

  const getFieldValue = (fieldPath) => {
    const keys = fieldPath.split('.');
    let value = profileData;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) break;
    }
    return value;
  };

  const ArrayFieldInput = ({ fieldPath, label, placeholder, icon: Icon }) => {
    const currentArray = getFieldValue(fieldPath) || [];
    
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          <Icon className="inline mr-2" />
          {label}
        </label>
        
        {/* Display existing items */}
        <div className="space-y-2">
          {currentArray.map((item, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-700">{item}</span>
              <button
                type="button"
                onClick={() => removeArrayItem(fieldPath, index)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
        
        {/* Add new item */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => addArrayItem(fieldPath, newItem)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
          </button>
        </div>
      </div>
    );
  };

  const renderContractorFields = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <FaTools className="mr-2 text-green-600" />
        {isArabic ? 'معلومات المقاول' : 'Contractor Information'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'ولاية الترخيص' : 'License State'}
          </label>
          <input
            type="text"
            value={getFieldValue('contractor_details.license_state') || ''}
            onChange={(e) => handleInputChange('contractor_details.license_state', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={isArabic ? 'أدخل ولاية الترخيص' : 'Enter license state'}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'تاريخ انتهاء الترخيص' : 'License Expiry'}
          </label>
          <input
            type="date"
            value={getFieldValue('contractor_details.license_expiry') || ''}
            onChange={(e) => handleInputChange('contractor_details.license_expiry', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'شركة التأمين' : 'Insurance Provider'}
          </label>
          <input
            type="text"
            value={getFieldValue('contractor_details.insurance_provider') || ''}
            onChange={(e) => handleInputChange('contractor_details.insurance_provider', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={isArabic ? 'أدخل شركة التأمين' : 'Enter insurance provider'}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'رقم بوليصة التأمين' : 'Insurance Policy'}
          </label>
          <input
            type="text"
            value={getFieldValue('contractor_details.insurance_policy') || ''}
            onChange={(e) => handleInputChange('contractor_details.insurance_policy', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={isArabic ? 'أدخل رقم البوليصة' : 'Enter policy number'}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'تاريخ انتهاء التأمين' : 'Insurance Expiry'}
          </label>
          <input
            type="date"
            value={getFieldValue('contractor_details.insurance_expiry') || ''}
            onChange={(e) => handleInputChange('contractor_details.insurance_expiry', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'حجم الفريق' : 'Crew Size'}
          </label>
          <input
            type="number"
            min="1"
            value={getFieldValue('contractor_details.crew_size') || 1}
            onChange={(e) => handleInputChange('contractor_details.crew_size', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'نوع التوفر' : 'Availability Schedule'}
          </label>
          <select
            value={getFieldValue('contractor_details.availability_schedule') || 'full_time'}
            onChange={(e) => handleInputChange('contractor_details.availability_schedule', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="full_time">{isArabic ? 'دوام كامل' : 'Full Time'}</option>
            <option value="part_time">{isArabic ? 'دوام جزئي' : 'Part Time'}</option>
            <option value="weekends">{isArabic ? 'عطل نهاية الأسبوع' : 'Weekends Only'}</option>
            <option value="emergency">{isArabic ? 'طوارئ فقط' : 'Emergency Only'}</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="bonded"
          checked={getFieldValue('contractor_details.bonded') || false}
          onChange={(e) => handleInputChange('contractor_details.bonded', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="bonded" className="text-sm font-medium text-gray-700">
          <FaShieldAlt className="inline mr-2 text-green-600" />
          {isArabic ? 'مؤمن ومضمون' : 'Bonded & Insured'}
        </label>
      </div>
      
      <ArrayFieldInput
        fieldPath="contractor_details.equipment_owned"
        label={isArabic ? 'المعدات المملوكة' : 'Equipment Owned'}
        placeholder={isArabic ? 'أدخل نوع المعدة' : 'Enter equipment type'}
        icon={FaTools}
      />
      
      <ArrayFieldInput
        fieldPath="contractor_details.project_types"
        label={isArabic ? 'أنواع المشاريع' : 'Project Types'}
        placeholder={isArabic ? 'أدخل نوع المشروع' : 'Enter project type'}
        icon={FaFileAlt}
      />
    </div>
  );

  const renderSpecialistFields = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <FaAward className="mr-2 text-purple-600" />
        {isArabic ? 'معلومات الأخصائي' : 'Specialist Information'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'سعر الاستشارة' : 'Consultation Rate'}
          </label>
          <div className="relative">
            <FaDollarSign className="absolute left-3 top-3 text-gray-400" />
            <input
              type="number"
              min="0"
              step="0.01"
              value={getFieldValue('specialist_details.consultation_rate') || 0}
              onChange={(e) => handleInputChange('specialist_details.consultation_rate', parseFloat(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'الحد الأدنى لحجم المشروع' : 'Minimum Project Size'}
          </label>
          <div className="relative">
            <FaDollarSign className="absolute left-3 top-3 text-gray-400" />
            <input
              type="number"
              min="0"
              value={getFieldValue('specialist_details.minimum_project_size') || 0}
              onChange={(e) => handleInputChange('specialist_details.minimum_project_size', parseInt(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isArabic ? 'الخلفية التعليمية' : 'Education Background'}
        </label>
        <textarea
          value={getFieldValue('specialist_details.education_background') || ''}
          onChange={(e) => handleInputChange('specialist_details.education_background', e.target.value)}
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          placeholder={isArabic ? 'أدخل خلفيتك التعليمية' : 'Enter your education background'}
        />
      </div>
      
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="remote_consultation"
          checked={getFieldValue('specialist_details.remote_consultation') || false}
          onChange={(e) => handleInputChange('specialist_details.remote_consultation', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="remote_consultation" className="text-sm font-medium text-gray-700">
          <FaHeadset className="inline mr-2 text-blue-600" />
          {isArabic ? 'استشارة عن بُعد متاحة' : 'Remote Consultation Available'}
        </label>
      </div>
      
      <ArrayFieldInput
        fieldPath="specialist_details.certifications"
        label={isArabic ? 'الشهادات المهنية' : 'Professional Certifications'}
        placeholder={isArabic ? 'أدخل اسم الشهادة' : 'Enter certification name'}
        icon={FaCertificate}
      />
      
      <ArrayFieldInput
        fieldPath="specialist_details.specialization_areas"
        label={isArabic ? 'مجالات التخصص' : 'Specialization Areas'}
        placeholder={isArabic ? 'أدخل مجال التخصص' : 'Enter specialization area'}
        icon={FaAward}
      />
      
      <ArrayFieldInput
        fieldPath="specialist_details.professional_associations"
        label={isArabic ? 'الجمعيات المهنية' : 'Professional Associations'}
        placeholder={isArabic ? 'أدخل اسم الجمعية' : 'Enter association name'}
        icon={FaUsers}
      />
      
      <ArrayFieldInput
        fieldPath="specialist_details.speaking_languages"
        label={isArabic ? 'اللغات المتحدثة' : 'Speaking Languages'}
        placeholder={isArabic ? 'أدخل اللغة' : 'Enter language'}
        icon={FaGraduationCap}
      />
    </div>
  );

  const renderConsultantFields = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <FaGraduationCap className="mr-2 text-orange-600" />
        {isArabic ? 'معلومات الاستشاري' : 'Consultant Information'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'وقت تسليم التقرير' : 'Report Delivery Time'}
          </label>
          <select
            value={getFieldValue('consultant_details.report_delivery_time') || ''}
            onChange={(e) => handleInputChange('consultant_details.report_delivery_time', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{isArabic ? 'اختر الوقت' : 'Select timeframe'}</option>
            <option value="24_hours">{isArabic ? '24 ساعة' : '24 Hours'}</option>
            <option value="2_days">{isArabic ? 'يومين' : '2 Days'}</option>
            <option value="1_week">{isArabic ? 'أسبوع واحد' : '1 Week'}</option>
            <option value="2_weeks">{isArabic ? 'أسبوعين' : '2 Weeks'}</option>
            <option value="1_month">{isArabic ? 'شهر واحد' : '1 Month'}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'سعر الزيارة الميدانية' : 'Site Visit Rate'}
          </label>
          <div className="relative">
            <FaDollarSign className="absolute left-3 top-3 text-gray-400" />
            <input
              type="number"
              min="0"
              step="0.01"
              value={getFieldValue('consultant_details.site_visit_rate') || 0}
              onChange={(e) => handleInputChange('consultant_details.site_visit_rate', parseFloat(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'تفضيل مدة المشروع' : 'Project Duration Preference'}
          </label>
          <select
            value={getFieldValue('consultant_details.project_duration_preference') || ''}
            onChange={(e) => handleInputChange('consultant_details.project_duration_preference', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{isArabic ? 'اختر التفضيل' : 'Select preference'}</option>
            <option value="short_term">{isArabic ? 'قصير المدى (أقل من شهر)' : 'Short-term (< 1 month)'}</option>
            <option value="medium_term">{isArabic ? 'متوسط المدى (1-6 أشهر)' : 'Medium-term (1-6 months)'}</option>
            <option value="long_term">{isArabic ? 'طويل المدى (أكثر من 6 أشهر)' : 'Long-term (> 6 months)'}</option>
            <option value="flexible">{isArabic ? 'مرن' : 'Flexible'}</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="follow_up_included"
          checked={getFieldValue('consultant_details.follow_up_included') || false}
          onChange={(e) => handleInputChange('consultant_details.follow_up_included', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="follow_up_included" className="text-sm font-medium text-gray-700">
          <FaHeadset className="inline mr-2 text-orange-600" />
          {isArabic ? 'متابعة مجانية مشمولة' : 'Free Follow-up Included'}
        </label>
      </div>
      
      <ArrayFieldInput
        fieldPath="consultant_details.consultation_types"
        label={isArabic ? 'أنواع الاستشارات' : 'Consultation Types'}
        placeholder={isArabic ? 'أدخل نوع الاستشارة' : 'Enter consultation type'}
        icon={FaGraduationCap}
      />
      
      <ArrayFieldInput
        fieldPath="consultant_details.consultation_methods"
        label={isArabic ? 'طرق الاستشارة' : 'Consultation Methods'}
        placeholder={isArabic ? 'أدخل طريقة الاستشارة' : 'Enter consultation method'}
        icon={FaHeadset}
      />
      
      <ArrayFieldInput
        fieldPath="consultant_details.expertise_areas"
        label={isArabic ? 'مجالات الخبرة' : 'Expertise Areas'}
        placeholder={isArabic ? 'أدخل مجال الخبرة' : 'Enter expertise area'}
        icon={FaAward}
      />
      
      <ArrayFieldInput
        fieldPath="consultant_details.client_types"
        label={isArabic ? 'أنواع العملاء' : 'Client Types'}
        placeholder={isArabic ? 'أدخل نوع العميل' : 'Enter client type'}
        icon={FaUsers}
      />
    </div>
  );

  const renderAgencyFields = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <FaBuilding className="mr-2 text-red-600" />
        {isArabic ? 'معلومات الوكالة' : 'Agency Information'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'حجم الشركة' : 'Company Size'}
          </label>
          <select
            value={getFieldValue('agency_details.company_size') || ''}
            onChange={(e) => handleInputChange('agency_details.company_size', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{isArabic ? 'اختر الحجم' : 'Select size'}</option>
            <option value="2-10">{isArabic ? '2-10 موظفين' : '2-10 employees'}</option>
            <option value="11-50">{isArabic ? '11-50 موظف' : '11-50 employees'}</option>
            <option value="51-200">{isArabic ? '51-200 موظف' : '51-200 employees'}</option>
            <option value="200+">{isArabic ? 'أكثر من 200 موظف' : '200+ employees'}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'سنة التأسيس' : 'Established Year'}
          </label>
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={getFieldValue('agency_details.established_year') || ''}
            onChange={(e) => handleInputChange('agency_details.established_year', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="2020"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'رخصة الأعمال' : 'Business License'}
          </label>
          <input
            type="text"
            value={getFieldValue('agency_details.business_license') || ''}
            onChange={(e) => handleInputChange('agency_details.business_license', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={isArabic ? 'أدخل رقم رخصة الأعمال' : 'Enter business license number'}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'وقت الاستجابة' : 'Response Time'}
          </label>
          <select
            value={getFieldValue('agency_details.response_time') || ''}
            onChange={(e) => handleInputChange('agency_details.response_time', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{isArabic ? 'اختر وقت الاستجابة' : 'Select response time'}</option>
            <option value="immediate">{isArabic ? 'فوري (خلال ساعة)' : 'Immediate (within 1 hour)'}</option>
            <option value="same_day">{isArabic ? 'نفس اليوم' : 'Same day'}</option>
            <option value="24_hours">{isArabic ? 'خلال 24 ساعة' : 'Within 24 hours'}</option>
            <option value="48_hours">{isArabic ? 'خلال 48 ساعة' : 'Within 48 hours'}</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="emergency_services"
          checked={getFieldValue('agency_details.emergency_services') || false}
          onChange={(e) => handleInputChange('agency_details.emergency_services', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="emergency_services" className="text-sm font-medium text-gray-700">
          <FaClock className="inline mr-2 text-red-600" />
          {isArabic ? 'خدمات الطوارئ متاحة 24/7' : '24/7 Emergency Services Available'}
        </label>
      </div>
      
      <ArrayFieldInput
        fieldPath="agency_details.service_areas"
        label={isArabic ? 'مناطق الخدمة' : 'Service Areas'}
        placeholder={isArabic ? 'أدخل منطقة الخدمة' : 'Enter service area'}
        icon={FaMapMarkerAlt}
      />
      
      <ArrayFieldInput
        fieldPath="agency_details.team_members"
        label={isArabic ? 'أعضاء الفريق' : 'Team Members'}
        placeholder={isArabic ? 'أدخل اسم عضو الفريق' : 'Enter team member name'}
        icon={FaUsers}
      />
      
      <ArrayFieldInput
        fieldPath="agency_details.quality_guarantees"
        label={isArabic ? 'ضمانات الجودة' : 'Quality Guarantees'}
        placeholder={isArabic ? 'أدخل ضمان الجودة' : 'Enter quality guarantee'}
        icon={FaShieldAlt}
      />
    </div>
  );

  // Render the appropriate fields based on user type
  switch (userType) {
    case 'contractor':
      return renderContractorFields();
    case 'specialist':
      return renderSpecialistFields();
    case 'consultant':
      return renderConsultantFields();
    case 'agency':
      return renderAgencyFields();
    default:
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {isArabic ? 'لا توجد حقول إضافية لهذا النوع من المستخدمين' : 'No additional fields for this user type'}
          </p>
        </div>
      );
  }
};

export default UserTypeSpecificFields; 