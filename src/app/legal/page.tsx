'use client';

import { motion } from 'framer-motion';

export default function LegalPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="container mx-auto max-w-4xl px-4 py-8 sm:py-12 lg:py-16"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8 lg:p-10 prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-gray-700">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Last updated: May 12, 2025
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            At AI Mental Health, your privacy is our top priority. This Privacy
            Policy explains how we collect, use, and protect your personal
            information when you use our platform. Our mission is to provide
            supportive and empathetic mental wellness guidance through AI, while
            safeguarding your confidentiality at all times.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">
            What Information We Collect
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            When you use our services, we collect basic information that helps us
            provide a personalized and safe experience. If you choose to register
            with Google, we collect your name, email address, and profile picture.
            We also collect usage information such as session length and
            interactions with the AI.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Conversations with our AI companion, Maria, are encrypted and
            anonymized. We never associate your identity with what you share in the
            chat.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">
            How We Use Your Information
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Your information is used only to provide and improve our service. We use
            it to provide access to the platform, improve AI performance, and ensure
            security. We do not sell or share your personal information with third
            parties for marketing purposes.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            María is an AI designed to provide general emotional support and
            wellness strategies. It is not a substitute for professional therapy or
            diagnosis. If you are experiencing a mental health crisis or need a
            clinical diagnosis, we strongly recommend that you speak with a
            qualified healthcare provider.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">
            Privacy and Confidentiality of Conversations
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            All conversations are end-to-end encrypted and fully anonymized. This
            means that not even our team can access the content of your sessions. We
            are committed to creating a safe space where you can speak freely,
            knowing your privacy is fully respected.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">
            Third-Party Services
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            We use trusted third-party providers to support core functions of our
            platform. These include Google for secure sign-in and hosting services
            that help keep the platform fast and reliable. All partners meet high
            standards of data protection.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">
            Your Rights and Contact
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            You have the right to access, correct, or delete your personal
            information at any time. You can also withdraw your consent or ask
            questions about how we handle your data. If you'd like to reach out,
            please contact us at:
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md text-sm mb-4">
            <p className="text-gray-800 dark:text-gray-200">
              <strong>Address:</strong>
              <br />
              2093 Philadelphia Pike #9001
              <br />
              Claymont, DE, 19703
              <br />
              United States
            </p>
            <p className="mt-2 text-gray-800 dark:text-gray-200">
              <strong>Phone:</strong>
              <br />
              +1 (347) 654 4961
            </p>
          </div>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">
            Updates to This Policy
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            We may update this Privacy Policy from time to time to reflect changes
            in our services or legal requirements. Any significant updates will be
            posted on this page.
          </p>
        </div>
      </div>
    </motion.div>
  );
} 