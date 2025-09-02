import { Container } from '@/components/container'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Crove - Learn how we protect your data',
}

export default function PrivacyPage() {
  return (
    <main className="overflow-hidden">
      <Container>
        <Navbar />
        <div className="max-w-4xl mx-auto py-16 px-6">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-medium mb-3 mt-4">Information You Provide</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, password, company name, phone number</li>
                <li><strong>Profile Information:</strong> Avatar, display name, job title, timezone preferences</li>
                <li><strong>Communication Data:</strong> Messages, conversations, attachments shared through our platform</li>
                <li><strong>Payment Information:</strong> Billing address, payment method details (processed by our payment providers)</li>
              </ul>
              
              <h3 className="text-xl font-medium mb-3 mt-4">Information We Collect Automatically</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Usage Data:</strong> Features accessed, actions taken, time spent on platform</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Log Data:</strong> Access times, pages viewed, app crashes, system activity</li>
                <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>Provide, operate, and maintain the Crove platform</li>
                <li>Create and manage user accounts, authenticate users</li>
                <li>Send service updates, security alerts, support messages</li>
                <li>Analyze usage patterns to improve features and user experience</li>
                <li>Detect and prevent fraud, abuse, and security incidents</li>
                <li>Comply with legal obligations and enforce our terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
              <p>We implement comprehensive security measures to protect your data:</p>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                <li>TLS/SSL encryption for data in transit</li>
                <li>AES-256 encryption for data at rest</li>
                <li>Role-based access controls and multi-factor authentication</li>
                <li>Regular security audits and penetration testing</li>
                <li>24/7 security monitoring and incident response procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
              <p>We do not sell your personal information. We share data only with:</p>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                <li>Service providers who assist in operating our platform (hosting, payments, analytics)</li>
                <li>Legal authorities when required by law or legal process</li>
                <li>Business partners with your explicit consent</li>
                <li>Successors in the event of a merger or acquisition (with notice)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                <li>Access your personal information</li>
                <li>Correct or update inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data in a portable format</li>
                <li>Object to certain uses of your information</li>
                <li>Withdraw consent where processing is consent-based</li>
              </ul>
              <p className="mt-4">To exercise these rights, contact us at privacy@crove.com</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
              <p>We use cookies to:</p>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                <li>Keep you logged in</li>
                <li>Remember your preferences</li>
                <li>Understand usage patterns</li>
                <li>Improve our services</li>
              </ul>
              <p className="mt-4">You can control cookies through your browser settings.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>Active account data: Retained while account is active</li>
                <li>Closed accounts: Basic data retained for 90 days</li>
                <li>Legal requirements: As required by applicable laws</li>
                <li>Backups: Deleted data may persist in backups for up to 90 days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. International Transfers</h2>
              <p>Your data may be processed in countries with different data protection laws. We ensure appropriate safeguards through:</p>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                <li>Standard contractual clauses</li>
                <li>Data processing agreements</li>
                <li>Compliance with transfer regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p>Our services are not directed to children under 16. We do not knowingly collect data from children under 16.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Updates</h2>
              <p>We may update this policy periodically. We'll notify you of material changes via email or in-app notification.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p>For privacy questions or requests:</p>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                <li>Email: privacy@crove.com</li>
                <li>Data Protection Officer: dpo@crove.com</li>
              </ul>
            </section>
          </div>
        </div>
      </Container>
      <Footer />
    </main>
  )
}