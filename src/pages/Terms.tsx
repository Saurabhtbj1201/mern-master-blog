import { Helmet } from 'react-helmet-async';

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - NotePath</title>
        <meta name="description" content="Read NotePath's Terms of Service to understand the rules and guidelines for using our platform." />
        <meta name="keywords" content="NotePath, terms of service, user agreement, platform rules" />
        <link rel="canonical" href="https://notepath-np.lovable.app/terms" />
        <meta property="og:title" content="Terms of Service - NotePath" />
        <meta property="og:description" content="Read NotePath's Terms of Service to understand the rules and guidelines for using our platform." />
        <meta property="og:url" content="https://notepath-np.lovable.app/terms" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Terms of Service - NotePath" />
        <meta name="twitter:description" content="Read NotePath's Terms of Service and user agreement." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <h1 className="font-serif text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using NotePath, you agree to be bound by these Terms of Service. If you do not 
              agree to these terms, please do not use our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              NotePath is a publishing platform that allows users to create, share, and discover articles 
              and stories. We provide tools for writing, publishing, and engaging with content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground mb-4">To use certain features, you must create an account. You agree to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
            <p className="text-muted-foreground mb-4">You retain ownership of content you create. By posting content, you grant us a license to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Display, distribute, and promote your content on our platform</li>
              <li>Allow other users to view and share your public content</li>
            </ul>
            <p className="text-muted-foreground mt-4">You are responsible for ensuring your content does not violate any laws or third-party rights.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Prohibited Conduct</h2>
            <p className="text-muted-foreground mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Post illegal, harmful, or offensive content</li>
              <li>Infringe on intellectual property rights</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Use the platform for spam or unauthorized advertising</li>
              <li>Attempt to breach security or access unauthorized areas</li>
              <li>Impersonate others or misrepresent your identity</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground">
              The NotePath platform, including its design, features, and branding, is our intellectual property. 
              You may not copy, modify, or distribute our platform without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account if you violate these terms. 
              You may also delete your account at any time through your profile settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimers</h2>
            <p className="text-muted-foreground">
              NotePath is provided "as is" without warranties of any kind. We do not guarantee the accuracy 
              of user-generated content or uninterrupted service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, NotePath shall not be liable for any indirect, 
              incidental, or consequential damages arising from your use of the platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these terms from time to time. Continued use of the platform after changes 
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact the site administrator.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default Terms;
