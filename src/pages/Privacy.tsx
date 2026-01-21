import { Helmet } from 'react-helmet-async';

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - NotePath</title>
        <meta name="description" content="Read NotePath's Privacy Policy to understand how we collect, use, and protect your personal information." />
        <meta name="keywords" content="NotePath, privacy policy, data protection, personal information" />
        <link rel="canonical" href="https://notepath-np.lovable.app/privacy" />
        <meta property="og:title" content="Privacy Policy - NotePath" />
        <meta property="og:description" content="Read NotePath's Privacy Policy to understand how we collect, use, and protect your personal information." />
        <meta property="og:url" content="https://notepath-np.lovable.app/privacy" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Privacy Policy - NotePath" />
        <meta name="twitter:description" content="Read NotePath's Privacy Policy to understand how we handle your data." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <h1 className="font-serif text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to NotePath. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">We may collect the following types of information:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Account Information:</strong> Email address, username, and profile details you provide during registration.</li>
              <li><strong>Content:</strong> Articles, comments, and other content you create on our platform.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our platform, including pages viewed and features used.</li>
              <li><strong>Device Information:</strong> Browser type, IP address, and device identifiers.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide and maintain our services</li>
              <li>Personalize your experience on the platform</li>
              <li>Communicate with you about updates and features</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal information. We may share your data with service providers who help us 
              operate our platform, or when required by law. Your public profile and published articles are visible 
              to other users as part of the platform's functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your personal information. However, no method 
              of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Withdraw consent where applicable</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to enhance your experience, analyze usage, and deliver 
              personalized content. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us through our platform or 
              reach out to the site administrator.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default Privacy;
