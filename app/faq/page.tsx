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
    id: 'how-to-login',
    question: 'How to login or register?',
    answer: `1. Search for @adlanka_otp_bot on Telegram and click "Start".
2. Share your phone number with the bot using the button provided in Telegram.
3. Come back to AdLanka and enter your 9-digit phone number.
4. You will receive a 6-digit OTP code instantly in the Telegram bot.
5. Enter the code here to log in.

Note: Registration and Login follow the same steps. Once you've started the bot, future logins only require entering your number here.`,
  },
  {
    id: 'how-to-post',
    question: 'How to post ads?',
    answer: `1. Login/Register using the Telegram bot method.
2. Go to your Dashboard and check your balance.
3. If your balance is low, follow the "Top Up" steps.
4. Click the "Post Ad" button on the header or dashboard.
5. Fill in your ad details (Title, Price, Description, Images).
6. Choose your Ad Type (Normal, Super, or VIP).
7. Submit for review. Our team usually approves ads within 1-2 hours.`,
  },
  {
    id: 'how-to-topup',
    question: 'How to top up account?',
    answer: `1. Transfer the desired amount to our bank account.
2. Take a clear screenshot or photo of the payment receipt.
3. Send the receipt to our official support handle @AdLanka on Telegram.
4. Mention your registered phone number in the message.
5. Once verified, your balance will be updated (usually within 24 hours).`,
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
