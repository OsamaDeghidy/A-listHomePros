import React from 'react';
import HeroSection from '../components/home/HeroSection';
import PopularServices from '../components/home/PopularServices';
import HowItWorks from '../components/home/HowItWorks';
import FeaturedPros from '../components/home/FeaturedPros';
import TestimonialsSection from '../components/home/TestimonialsSection';
import BlogSection from '../components/home/BlogSection';
import CtaSection from '../components/home/CtaSection';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <PopularServices />
      <HowItWorks />
      <FeaturedPros />
      <TestimonialsSection />
      <BlogSection />
      <CtaSection />
    </div>
  );
};

export default HomePage; 