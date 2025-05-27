import React from 'react';
import { Helmet } from 'react-helmet';

const TermsPage = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | A-List Home Pros</title>
        <meta name="description" content="Terms of Service for A-List Home Pros. Read about our user agreement, platform policies, and legal terms." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-lg text-blue-100">
              Last Updated: May 15, 2023
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">
            <div className="prose prose-lg max-w-none">
              <p>Please read these Terms of Service ("Terms") carefully before using the A-List Home Pros platform operated by A-List Home Pros, Inc.</p>
              
              <p>By accessing or using our platform, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access our platform.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">1. Definitions</h2>
              <p><strong>"Platform"</strong> refers to the A-List Home Pros website, mobile applications, and related services.</p>
              <p><strong>"Service Professional"</strong> refers to individuals or businesses who offer home services through our Platform.</p>
              <p><strong>"User"</strong> or <strong>"you"</strong> refers to any individual who accesses or uses our Platform.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">2. Acceptance of Terms</h2>
              <p>By creating an account, accessing, or using our Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you are using the Platform on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these Terms.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. Platform Services</h2>
              <p>A-List Home Pros provides a platform connecting homeowners with service professionals. We do not provide home services directly. We facilitate the connection and booking process between users and service professionals.</p>
              
              <p>We make efforts to verify the credentials and background of Service Professionals, but we do not guarantee their quality, safety, or legality. Users are responsible for making their own evaluations of Service Professionals.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">4. User Accounts</h2>
              <p>To use certain features of our Platform, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
              
              <p>You are responsible for safeguarding the password that you use to access the Platform and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. User Content</h2>
              <p>Our Platform may allow you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content you post, including its legality, reliability, and appropriateness.</p>
              
              <p>By posting content on our Platform, you grant us the right to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through the Platform. You retain any and all of your rights to any content you submit, post, or display on or through the Platform and you are responsible for protecting those rights.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">6. Service Professional Terms</h2>
              <p>Service Professionals must comply with all applicable laws, regulations, and professional standards. This includes obtaining and maintaining all required licenses, permits, and insurance coverage for the services they provide.</p>
              
              <p>Service Professionals are independent contractors and not employees or agents of A-List Home Pros. They are solely responsible for their interactions with Users and the quality of their services.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">7. Booking and Payments</h2>
              <p>Users may book services through our Platform and pay for such services using our payment processing system. By using our payment system, you agree to our Payment Terms, which are incorporated by reference into these Terms.</p>
              
              <p>A-List Home Pros charges a service fee for facilitating bookings through the Platform. Service Professionals pay a commission on completed bookings. All applicable fees are displayed before booking confirmation.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">8. Cancellations and Refunds</h2>
              <p>Cancellation and refund policies may vary depending on the Service Professional and the type of service. Specific cancellation terms will be displayed at the time of booking.</p>
              
              <p>If a Service Professional fails to provide the agreed-upon services or provides services that substantially fail to meet the description, you may be eligible for a refund in accordance with our Refund Policy.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">9. Prohibited Uses</h2>
              <p>You agree not to use the Platform:</p>
              <ul>
                <li>In any way that violates any applicable law or regulation</li>
                <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," or "spam"</li>
                <li>To impersonate or attempt to impersonate A-List Home Pros, an employee, another user, or any other person</li>
                <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Platform</li>
                <li>To attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Platform</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">10. Intellectual Property</h2>
              <p>The Platform and its original content, features, and functionality are and will remain the exclusive property of A-List Home Pros and its licensors. The Platform is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of A-List Home Pros.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">11. Limitation of Liability</h2>
              <p>In no event shall A-List Home Pros, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:</p>
              <ul>
                <li>Your access to or use of or inability to access or use the Platform</li>
                <li>Any conduct or content of any third party on the Platform</li>
                <li>Any content obtained from the Platform</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">12. Indemnification</h2>
              <p>You agree to defend, indemnify, and hold harmless A-List Home Pros, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Platform.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">13. Governing Law</h2>
              <p>These Terms shall be governed by and construed in accordance with the laws of the State of Massachusetts, without regard to its conflict of law provisions. Any dispute arising from these Terms shall be subject to the exclusive jurisdiction of the state and federal courts located in Boston, Massachusetts.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">14. Changes to Terms</h2>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">15. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us at:</p>
              <p>
                A-List Home Pros, Inc.<br />
                123 Main Street, Suite 500<br />
                Boston, MA 02108<br />
                Email: legal@alisthomepros.com<br />
                Phone: (555) 123-4567
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TermsPage; 