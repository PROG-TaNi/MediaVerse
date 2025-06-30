import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsPage: React.FC = () => {
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
        <h1 className="text-3xl font-bold mb-6 text-indigo-700 dark:text-indigo-300">Terms of Service for Media Verse</h1>
        <p className="mb-4 italic">Effective Date: [Insert Date]</p>
        <p className="mb-4">Welcome to Media Verse. Please read these Terms of Service (“Terms”) carefully before using our website and services. By accessing or using Media Verse, you agree to be bound by these Terms. If you do not agree, please do not use our services.</p>

        <h2 className="text-xl font-semibold mt-8 mb-2">1. Use of Our Service</h2>
        <ul className="list-disc ml-6 mb-4">
          <li><span className="font-semibold">Eligibility.</span> You must be at least 13 years old to use Media Verse. By using our service, you represent and warrant that you meet this age requirement.</li>
          <li><span className="font-semibold">Account Registration.</span> To access certain features (e.g., posting reviews, creating watchlists), you must register for an account. You agree to provide accurate, current, and complete information, and to keep it up to date.</li>
          <li><span className="font-semibold">Account Security.</span> You are responsible for safeguarding your login credentials. You agree to notify us immediately of any unauthorized use of your account.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-2">2. User Content</h2>
        <ul className="list-disc ml-6 mb-4">
          <li><span className="font-semibold">Ownership.</span> You retain ownership of any reviews, comments, ratings, or other content you submit. By posting, you grant Media Verse a non‑exclusive, worldwide, royalty‑free license to display, distribute, and reproduce your content.</li>
          <li><span className="font-semibold">Content Standards.</span> You agree not to post anything obscene, defamatory, hateful, or infringing on third‑party rights. We reserve the right to remove or disable any content that we believe violates these standards or is otherwise objectionable.</li>
          <li><span className="font-semibold">Global Visibility.</span> All user‑submitted reviews and comments are publicly visible. Do not post personal or sensitive information.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-2">3. Intellectual Property</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>All text, graphics, logos, and software on Media Verse are our property or licensed to us and are protected by copyright, trademark, and other intellectual property laws.</li>
          <li>You may view and download Content solely for your personal, non‑commercial use. Any other use—including reproduction, modification, distribution, or republication—requires our prior written permission.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-2">4. Prohibited Conduct</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Circumvent or interfere with security or authentication measures.</li>
          <li>Use automated scripts or bots to access or scrape data.</li>
          <li>Impersonate others or provide false information.</li>
          <li>Engage in any activity that disrupts or interferes with our services.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-2">5. Third‑Party Content and Links</h2>
        <p className="mb-4">Our site may contain links to third‑party websites or services (e.g., trailers on YouTube, external podcast hosts). We do not control or endorse their content or practices, and we are not responsible for any damages or liabilities arising from your use of these third‑party services.</p>

        <h2 className="text-xl font-semibold mt-8 mb-2">6. Disclaimers and Limitation of Liability</h2>
        <ul className="list-disc ml-6 mb-4">
          <li><span className="font-semibold">“As Is” Service.</span> Media Verse is provided “as is” and “as available.” We make no warranties of any kind, express or implied, including merchantability or fitness for a particular purpose.</li>
          <li><span className="font-semibold">No Guarantee of Accuracy.</span> Recommendations, reviews, and metadata are provided for informational purposes only. We do not guarantee that our suggestions will meet your expectations.</li>
          <li><span className="font-semibold">Limitation of Liability.</span> To the fullest extent permitted by law, Media Verse and its affiliates will not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-2">7. Termination</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>We reserve the right to suspend or terminate your access—without notice—if you violate these Terms or engage in any conduct that we deem harmful to our community or operations.</li>
          <li>You may close your account at any time by following the instructions in your account settings.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-2">8. Changes to These Terms</h2>
        <p className="mb-4">We may update these Terms from time to time. When we do, we will post the revised version here with a new “Effective Date.” Your continued use after such changes constitutes acceptance of the updated Terms.</p>

        <h2 className="text-xl font-semibold mt-8 mb-2">9. Governing Law</h2>
        <p className="mb-4">These Terms are governed by the laws of [Your Jurisdiction], without regard‑of‑law principles.</p>

        <h2 className="text-xl font-semibold mt-8 mb-2">10. Contact Us</h2>
        <p className="mb-4">If you have any questions about these Terms, please contact us at <a href="mailto:tarushnigam719@gmail.com" className="text-indigo-600 underline">tarushnigam719@gmail.com</a>.</p>

        <p className="mt-8">Thank you for choosing Media Verse. We're honored to support you in your journey of discovery and discussion.</p>
      </div>
    </div>
  );
};

export default TermsPage; 