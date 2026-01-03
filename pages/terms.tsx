import React from 'react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-gray-600">Last Updated: January 1, 2025</p>
          </div>

          <div className="prose max-w-none space-y-8">
            {/* 1. Acceptance of Terms */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By installing, accessing, or using PreOrder Pro (the "App"), you agree to be bound by these Terms of Service ("Terms").
                If you do not agree to these Terms, do not install or use the App.
              </p>
              <p className="text-gray-700">
                These Terms constitute a legally binding agreement between you (the "Merchant" or "you") and PreOrder Pro
                (the "Provider", "we", "us", or "our").
              </p>
            </section>

            {/* 2. Service Description */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                PreOrder Pro is a Shopify application that enables merchants to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Accept pre-orders for out-of-stock or upcoming products</li>
                <li>Manage pre-order campaigns with different payment modes</li>
                <li>Track inventory and automate pre-order workflows</li>
                <li>Send automated notifications to customers</li>
              </ul>
              <p className="text-gray-700 mt-4">
                We reserve the right to modify, suspend, or discontinue any part of the App at any time with or without notice.
              </p>
            </section>

            {/* 3. License and Usage Rights */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. License and Usage Rights</h2>
              <p className="text-gray-700 mb-4">
                Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable,
                revocable license to access and use the App solely for your internal business purposes.
              </p>
              <p className="text-gray-700 font-semibold mb-2">You agree NOT to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Copy, modify, or create derivative works of the App</li>
                <li>Reverse engineer, decompile, or disassemble the App</li>
                <li>Rent, lease, sell, or sublicense the App to third parties</li>
                <li>Use the App for any illegal or unauthorized purpose</li>
                <li>Interfere with or disrupt the App's functionality or servers</li>
              </ul>
            </section>

            {/* 4. Pricing and Payment */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Pricing and Payment</h2>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">4.1 Subscription Plans</h3>
              <p className="text-gray-700 mb-4">
                The App offers various subscription plans with different features and pricing. Current pricing is available
                on our pricing page and may be changed at any time with 30 days' notice.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">4.2 Billing</h3>
              <p className="text-gray-700 mb-4">
                Subscription fees are billed in advance on a monthly or annual basis, depending on your selected plan.
                All fees are non-refundable except as expressly stated in these Terms.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">4.3 Payment Processing</h3>
              <p className="text-gray-700 mb-4">
                Payments are processed through Shopify's billing system or our designated payment processor.
                You authorize us to charge your payment method for all fees incurred.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">4.4 Failed Payments</h3>
              <p className="text-gray-700">
                If a payment fails, we may suspend or terminate your access to the App until payment is received.
                You remain responsible for any uncollected amounts.
              </p>
            </section>

            {/* 5. Refund Policy */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Refund Policy</h2>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">5.1 General Policy</h3>
              <p className="text-gray-700 mb-4">
                All subscription fees are non-refundable except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Technical Issues:</strong> If the App experiences critical technical failures that prevent
                  normal operation for more than 72 consecutive hours, and we are unable to resolve the issue,
                  you may request a pro-rated refund for the affected period.</li>
                <li><strong>Billing Errors:</strong> If you are charged incorrectly due to our error, we will refund
                  the incorrect amount within 14 business days.</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">5.2 Refund Requests</h3>
              <p className="text-gray-700 mb-4">
                Refund requests must be submitted in writing to <strong>arinoach@gmail.com</strong> within 30 days
                of the charge. We will review and respond to refund requests within 14 business days.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">5.3 No Refunds For</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Change of mind or dissatisfaction with features</li>
                <li>Failure to use the App during the subscription period</li>
                <li>Voluntary cancellation mid-billing cycle</li>
                <li>Account termination due to Terms violation</li>
              </ul>
            </section>

            {/* 6. Intellectual Property Rights */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Intellectual Property Rights</h2>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">6.1 Our Intellectual Property</h3>
              <p className="text-gray-700 mb-4">
                The App, including all software, code, designs, graphics, logos, and documentation, is owned by
                PreOrder Pro and protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">6.2 Your Content</h3>
              <p className="text-gray-700 mb-4">
                You retain all rights to your store data, product information, and customer data ("Your Content").
                By using the App, you grant us a limited license to access and process Your Content solely to provide
                the App's services.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">6.3 Feedback</h3>
              <p className="text-gray-700">
                If you provide us with feedback, suggestions, or ideas about the App, you grant us a perpetual,
                irrevocable, royalty-free license to use and incorporate such feedback into the App without
                compensation to you.
              </p>
            </section>

            {/* 7. Limitation of Liability */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">7.1 Disclaimer of Warranties</h3>
              <p className="text-gray-700 mb-4 uppercase font-semibold">
                THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
                INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                OR NON-INFRINGEMENT.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">7.2 Limitation of Damages</h3>
              <p className="text-gray-700 mb-4 uppercase font-semibold">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL PREORDER PRO BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS,
                DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Your use or inability to use the App</li>
                <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
                <li>Any interruption or cessation of transmission to or from the App</li>
                <li>Any bugs, viruses, or other harmful code transmitted through the App</li>
                <li>Any errors or omissions in any content or for any loss or damage incurred as a result of your use of any content</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">7.3 Maximum Liability</h3>
              <p className="text-gray-700">
                Our total liability to you for all claims arising from or related to the App shall not exceed the
                amount you paid us in the 12 months preceding the claim, or $100 USD, whichever is greater.
              </p>
            </section>

            {/* 8. Indemnification */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Indemnification</h2>
              <p className="text-gray-700 mb-4">
                You agree to indemnify, defend, and hold harmless PreOrder Pro, its officers, directors, employees,
                and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable
                legal fees, arising out of or in any way connected with:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Your access to or use of the App</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights, including intellectual property rights</li>
                <li>Your Content or any data you submit through the App</li>
              </ul>
            </section>

            {/* 9. Data Privacy and Security */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Data Privacy and Security</h2>
              <p className="text-gray-700 mb-4">
                Our collection and use of personal information is governed by our Privacy Policy, which is incorporated
                into these Terms by reference. By using the App, you consent to our Privacy Policy.
              </p>
              <p className="text-gray-700">
                We implement reasonable security measures to protect your data, but we cannot guarantee absolute security.
                You are responsible for maintaining the confidentiality of your Shopify account credentials.
              </p>
            </section>

            {/* 10. Termination */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Termination</h2>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">10.1 Termination by You</h3>
              <p className="text-gray-700 mb-4">
                You may cancel your subscription at any time through your Shopify admin panel. Cancellation will be
                effective at the end of your current billing period. No refunds will be provided for partial billing periods.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">10.2 Termination by Us</h3>
              <p className="text-gray-700 mb-4">
                We may suspend or terminate your access to the App immediately, without prior notice, if:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>You breach these Terms</li>
                <li>Your payment fails and remains unpaid for 7 days</li>
                <li>We suspect fraudulent, abusive, or illegal activity</li>
                <li>We discontinue the App entirely</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">10.3 Effect of Termination</h3>
              <p className="text-gray-700">
                Upon termination, your right to use the App will immediately cease. We will delete your data within
                30 days of termination unless legally required to retain it. You remain liable for all fees incurred
                prior to termination.
              </p>
            </section>

            {/* 11. Dispute Resolution */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Dispute Resolution</h2>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">11.1 Informal Resolution</h3>
              <p className="text-gray-700 mb-4">
                Before filing a formal claim, you agree to contact us at <strong>arinoach@gmail.com</strong> and
                attempt to resolve the dispute informally. We will attempt to resolve the dispute within 30 days.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">11.2 Governing Law</h3>
              <p className="text-gray-700 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of Hong Kong,
                without regard to its conflict of law provisions.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">11.3 Jurisdiction</h3>
              <p className="text-gray-700 mb-4">
                Any legal action or proceeding arising under these Terms will be brought exclusively in the courts
                located in Hong Kong, and you irrevocably consent to the personal jurisdiction and venue therein.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">11.4 Arbitration (Optional)</h3>
              <p className="text-gray-700">
                If informal resolution fails, either party may elect to resolve the dispute through binding arbitration
                in accordance with the rules of the Hong Kong International Arbitration Centre (HKIAC).
                The arbitration shall be conducted in English.
              </p>
            </section>

            {/* 12. Modifications to Terms */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Modifications to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Posting the updated Terms on this page with a new "Last Updated" date</li>
                <li>Sending an email notification to your registered email address</li>
                <li>Displaying an in-app notification</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Your continued use of the App after the effective date of the updated Terms constitutes your acceptance
                of the changes. If you do not agree to the updated Terms, you must stop using the App and cancel your subscription.
              </p>
            </section>

            {/* 13. General Provisions */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">13. General Provisions</h2>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">13.1 Entire Agreement</h3>
              <p className="text-gray-700 mb-4">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and PreOrder Pro
                regarding the App and supersede all prior agreements and understandings.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">13.2 Severability</h3>
              <p className="text-gray-700 mb-4">
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will
                remain in full force and effect.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">13.3 Waiver</h3>
              <p className="text-gray-700 mb-4">
                Our failure to enforce any right or provision of these Terms will not be deemed a waiver of such right or provision.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">13.4 Assignment</h3>
              <p className="text-gray-700 mb-4">
                You may not assign or transfer these Terms or your rights hereunder without our prior written consent.
                We may assign these Terms without restriction.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4">13.5 Force Majeure</h3>
              <p className="text-gray-700">
                We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable
                control, including acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities,
                fire, floods, accidents, pandemics, strikes, or shortages of transportation, facilities, fuel, energy,
                labor, or materials.
              </p>
            </section>

            {/* 14. Contact Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> arinoach@gmail.com
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Address:</strong> 3/F, 230 Ki Lung Street, Sham Shui Po, Kowloon, Hong Kong
                </p>
                <p className="text-gray-700">
                  <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM HKT
                </p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="border-t-2 border-gray-200 pt-6 mt-8">
              <p className="text-gray-700 font-semibold mb-4">
                BY INSTALLING OR USING THE APP, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND
                BY THESE TERMS OF SERVICE.
              </p>
              <p className="text-gray-600 text-sm italic">
                Last Updated: January 1, 2025
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
