import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen py-12 relative overflow-hidden">
      {/* Gradient blurred background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          filter: 'blur(32px)',
          opacity: 0.6,
        }}
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 max-w-3xl relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-100 font-medium transition-colors"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back
        </button>
        <h1 className="text-3xl font-bold mb-6 text-indigo-700 dark:text-indigo-300">Privacy Policy for Media Verse</h1>
        <p className="mb-4">At Media Verse, accessible at <span className="font-mono">[your-domain.com]</span>, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>
        <p className="mb-4">By using Media Verse, you agree to the practices described in this policy.</p>

        <h2 className="text-xl font-semibold mt-8 mb-2">1. Information We Collect</h2>
        <h3 className="font-semibold mt-4 mb-1">a. Personal Information</h3>
        <ul className="list-disc ml-6 mb-2">
          <li>Full name</li>
          <li>Email address</li>
          <li>Username</li>
          <li>Password (hashed and stored securely)</li>
        </ul>
        <h3 className="font-semibold mt-4 mb-1">b. User-Generated Content</h3>
        <ul className="list-disc ml-6 mb-2">
          <li>Public reviews, comments, and ratings you post</li>
          <li>Any media (images, links, etc.) you voluntarily submit</li>
        </ul>
        <h3 className="font-semibold mt-4 mb-1">c. Usage Data</h3>
        <ul className="list-disc ml-6 mb-2">
          <li>IP address</li>
          <li>Browser type and version</li>
          <li>Pages visited and time spent</li>
          <li>Device information and OS</li>
          <li>Referring URLs</li>
        </ul>
        <h3 className="font-semibold mt-4 mb-1">d. Cookies and Tracking</h3>
        <ul className="list-disc ml-6 mb-2">
          <li>We use cookies and similar technologies to:</li>
          <ul className="list-disc ml-8">
            <li>Enhance user experience</li>
            <li>Store session preferences</li>
            <li>Track site usage patterns</li>
          </ul>
        </ul>
        <p className="mb-4">You can disable cookies via your browser settings, but it may affect certain features.</p>

        <h2 className="text-xl font-semibold mt-8 mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Provide and personalize content recommendations</li>
          <li>Display your reviews publicly</li>
          <li>Improve website functionality and user experience</li>
          <li>Monitor and analyze site usage</li>
          <li>Respond to inquiries and support requests</li>
          <li>Send you occasional service-related updates</li>
        </ul>
        <p className="mb-4">We do not sell your personal information to third parties.</p>

        <h2 className="text-xl font-semibold mt-8 mb-2">3. Public Content</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Reviews and comments you post are publicly visible worldwide.</li>
          <li>Do not share sensitive personal information in public reviews.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-2">4. Third-Party Services</h2>
        <p className="mb-4">We may use third-party tools for analytics, hosting, and recommendation engines (e.g., MovieLens, Spotify, GoodBooks, etc.). These tools may collect anonymized data as per their privacy policies.</p>
        <p className="mb-4">We are not responsible for the privacy practices of third-party websites or services linked from Media Verse.</p>

        <h2 className="text-xl font-semibold mt-8 mb-2">5. Data Security</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>SSL encryption</li>
          <li>Hashed passwords</li>
          <li>Regular server monitoring</li>
        </ul>
        <p className="mb-4">However, no method of transmission over the internet is 100% secure. Use Media Verse at your own discretion.</p>

        <h2 className="text-xl font-semibold mt-8 mb-2">6. Children's Privacy</h2>
        <p className="mb-4">Media Verse is not intended for individuals under the age of 13. We do not knowingly collect personal data from children. If you are a parent or guardian and believe your child has used our site, please contact us immediately.</p>

        <h2 className="text-xl font-semibold mt-8 mb-2">7. Your Rights and Choices</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>View or update your personal information</li>
          <li>Delete your account</li>
          <li>Request removal of specific content</li>
          <li>Opt out of cookies (via browser settings)</li>
        </ul>
        <p className="mb-4">For account or data-related requests, contact us at: <a href="mailto:tarushnigam719@gmail.com" className="text-indigo-600 underline">tarushnigam719@gmail.com</a></p>

        <h2 className="text-xl font-semibold mt-8 mb-2">8. Changes to This Policy</h2>
        <p className="mb-4">We may update this Privacy Policy occasionally. Changes will be posted on this page with an updated effective date. You are advised to review it periodically.</p>

        <h2 className="text-xl font-semibold mt-8 mb-2">9. Contact Us</h2>
        <p className="mb-2">For questions or concerns about this Privacy Policy, contact:</p>
        <ul className="list-disc ml-6 mb-4">
          <li>Media Verse Team</li>
          <li>Email: <a href="mailto:tarushnigam719@gmail.com" className="text-indigo-600 underline">tarushnigam719@gmail.com</a></li>
          <li>Website: <span className="font-mono">[your-domain.com]</span></li>
        </ul>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage; 