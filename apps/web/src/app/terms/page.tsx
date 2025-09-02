import { Container } from '@/components/container'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Crove',
}

export default function TermsPage() {
  return (
    <main className="overflow-hidden">
      <Container>
        <Navbar />
        <div className="max-w-4xl mx-auto py-16 px-6">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <p className="text-gray-600 mb-8">Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>By accessing or using Crove's services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p>Crove provides a customer engagement platform that enables businesses to manage conversations across multiple channels. Our services include:</p>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                <li>Multi-channel messaging platform</li>
                <li>Customer support tools</li>
                <li>Team collaboration features</li>
                <li>Analytics and reporting</li>
                <li>AI-powered assistants (Captain AI)</li>
                <li>Workflow automation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p>To use our services, you must:</p>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Promptly notify us of any unauthorized use</li>
                <li>Be responsible for all activities under your account</li>
                <li>Be at least 18 years old or have legal capacity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit malicious code, viruses, or harmful content</li>
                <li>Engage in spamming, phishing, or harassment</li>
                <li>Attempt unauthorized access to systems or data</li>
                <li>Interfere with service operations or other users</li>
                <li>Use the service for illegal or harmful purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
              <p>All content, features, and functionality of our service are owned by Crove and protected by intellectual property laws.</p>
              <p className="mt-4">You retain ownership of content you submit but grant us a license to use, store, and process it to provide our services.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Payment Terms</h2>
              <p>For paid services:</p>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                <li>Fees are billed in advance on a subscription basis</li>
                <li>All payments are non-refundable unless otherwise stated</li>
                <li>You authorize automatic renewal and charging</li>
                <li>We may change fees with 30 days advance notice</li>
                <li>Overdue accounts may be suspended or terminated</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Processing</h2>
              <p>You are responsible for:</p>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                <li>Obtaining necessary consents from your users</li>
                <li>Complying with applicable data protection laws</li>
                <li>Ensuring lawful basis for data processing</li>
                <li>Respecting user privacy rights</li>
              </ul>
              <p className="mt-4">We process data according to our Privacy Policy and applicable data processing agreements.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Service Level Agreement</h2>
              <p>We strive for 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be announced when possible.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law:</p>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                <li>Services are provided "as is" without warranties</li>
                <li>We are not liable for indirect or consequential damages</li>
                <li>Our total liability is limited to fees paid in the last 12 months</li>
                <li>We are not responsible for third-party services or content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
              <p>You agree to indemnify and hold Crove harmless from claims arising from:</p>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                <li>Your use of the service</li>
                <li>Violation of these terms</li>
                <li>Infringement of any rights</li>
                <li>Your content or data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
              <p>Either party may terminate:</p>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                <li>At any time with 30 days written notice</li>
                <li>Immediately for material breach</li>
                <li>Immediately for violation of acceptable use</li>
              </ul>
              <p className="mt-4">Upon termination, your access will be disabled and data may be deleted after 30 days.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Modifications</h2>
              <p>We may modify these terms with 30 days notice for material changes. Continued use constitutes acceptance.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
              <p>These terms are governed by the laws of the jurisdiction where Crove operates, without regard to conflict of law provisions.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Dispute Resolution</h2>
              <p>Disputes will be resolved through binding arbitration, except where prohibited by law.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
              <p>For questions about these Terms:</p>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                <li>Email: legal@crove.com</li>
                <li>Support: support@crove.com</li>
              </ul>
            </section>
          </div>
        </div>
      </Container>
      <Footer />
    </main>
  )
}