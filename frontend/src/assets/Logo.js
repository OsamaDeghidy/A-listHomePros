import React from 'react';

// استخدام صورة اللوجو الخاصة بـ A-List Home Pros
const Logo = ({ width = '200px', height = 'auto', className = '' }) => {
  // استخدام ملف الصورة الموجود بالفعل في المجلد العام
  const logoSrc = '/Logo.png';
  
  return (
    <img 
      src={logoSrc}
      alt="A-List Home Pros Logo"
      width={width}
      height={height}
      className={`${className}`}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default Logo;