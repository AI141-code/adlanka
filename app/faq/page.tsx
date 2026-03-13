'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const FAQ_ITEMS = [
  {
    id: 'how-to-post',
    question: 'How to post ads?',
    answer: `1. Register using your Sri Lankan phone number (+94)
2. Login using the OTP sent to your Telegram
3. Top up your account balance by transferring money to our bank account
4. Send the payment receipt via Telegram
5. Admin will verify and update your balance
6. Click "Post Ad" and fill in the details
7. Submit your ad for review
8. Admin will review and approve your ad
9. Once approved, your ad will be live!`,
  },
  {
    id: 'how-to-login',
    question: 'How to login with OTP?',
    answer: `1. Go to the Login page
2. Enter your Sri Lankan phone number (9 digits after +94)
3. Click Continue
4. You will receive an OTP code via Telegram (for testing, use 123456)
5. Enter the OTP code to verify
6. You will be logged in automatically

Note: You must have Telegram installed to receive OTP codes.`,
  },
  {
    id: 'how-to-topup',
    question: 'How to top up account?',
    answer: `1. Transfer money to our bank account
2. Take a screenshot of the payment receipt
3. Send the receipt via Telegram to @AdLanka
4. Include your registered phone number in the message
5. Admin will verify the payment
6. Your balance will be updated within 24 hours
7. You will see the updated balance in your dashboard`,
  },
  {
    id: 'ad-types',
    question: 'What are the ad types and prices?',
    answer: `Normal Ad - Rs 500
• Grey border
• 3 days duration
• Listed after Super and VIP ads

Super Ad - Rs 1,000
• Yellow border with "Super Ad" label
• 4 days duration
• Listed after VIP ads

VIP Ad - Rs 2,000
• Green border with "VIP Ad" label
• 5 days duration
• Priority listing (shown first)`,
  },
  {
    id: 'ad-duration',
    question: 'How long do ads stay live?',
    answer: `Ad duration depends on the ad type you choose:

• Normal Ad: 3 days
• Super Ad: 4 days
• VIP Ad: 5 days

After the duration expires, your ad will be automatically removed. You can extend your ad by paying for a new ad type.`,
  },
  {
    id: 'payment-methods',
    question: 'What payment methods are accepted?',
    answer: `We currently accept bank transfers only. Direct online payment is not available.

Steps:
1. Transfer the amount to our bank account
2. Send payment receipt via Telegram
3. Wait for admin verification
4. Your balance will be updated

Contact: @AdLanka (Telegram only)`,
  },
  {
    id: 'ad-moderation',
    question: 'What content is not allowed?',
    answer: `The following content is strictly prohibited:

• Explicit or adult content
• Illegal products or services
• Fake or misleading information
• Spam or duplicate ads
• Hate speech or discrimination
• Personal information of others
• Copyrighted content without permission

Ads violating these rules will be rejected or removed.`,
  },
  {
    id: 'report-ad',
    question: 'How to report an ad?',
    answer: `If you find an ad that violates our guidelines:

1. Click on the ad to view details
2. Click the "Report Ad" button
3. Select a reason for reporting
4. Submit the report

Our admin team will review the report and take appropriate action.`,
  },
]

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold">Frequently Asked Questions</h1>
            <p className="text-muted-foreground">
              Find answers to common questions about AdLanka
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {FAQ_ITEMS.map((item) => (
                  <AccordionItem key={item.id} value={item.id} id={item.id}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <pre className="whitespace-pre-wrap font-sans text-muted-foreground">
                        {item.answer}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Quick Contact */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Still have questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Contact us via Telegram at{' '}
                <span className="font-semibold text-foreground">@AdLanka</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
