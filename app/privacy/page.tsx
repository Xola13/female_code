// ============================================================
// Luna Beauty — Privacy Policy Page
// ============================================================

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Luna Beauty handles your data — transparent, anonymous, and consent-first.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-luna-blush/10 to-luna-champagne/10 py-12">
        <div className="container max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-display font-semibold mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: March 2026</p>
        </div>
      </div>

      <div className="container max-w-3xl py-12 prose prose-neutral dark:prose-invert">
        <div className="space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-display font-semibold mb-3">1. Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              Luna Beauty is committed to protecting your privacy. We collect minimal data, use it
              only to improve your experience, and never sell it. This policy explains what we
              collect, why, and how you control it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-3">
              2. Passive Behavioral Profiling (Luna Mind)
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Luna Beauty uses a technology called <strong>Luna Mind</strong> — an AI-powered
              behavioral profiling system designed to make product recommendations feel personally
              tailored. Here is exactly what it does:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                On your first visit, a <strong>random anonymous UUID</strong> is generated and stored
                in your browser&apos;s localStorage. This UUID contains no personally identifying
                information.
              </li>
              <li>
                As you browse, we passively track: which products you view, how long you spend on
                each page, how far you scroll, and whether you zoom into product images.
              </li>
              <li>
                This data builds an <strong>Interest Vector</strong> — a mathematical representation
                of your beauty preferences (categories you like, price range, tags like
                &ldquo;hydrating&rdquo; or &ldquo;long-wear&rdquo;).
              </li>
              <li>
                All profiling data is stored <strong>locally in your browser</strong> (localStorage)
                by default. No data is sent to our servers unless you explicitly enable Cloud Sync.
              </li>
              <li>
                If you enable <strong>Cloud Sync</strong> (via the toggle in the chat panel), your
                anonymized profile is stored in Supabase under your anonymous UUID only. No email,
                no name, no IP address is stored.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-3">3. Amazon Affiliate Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Luna Beauty is a participant in the <strong>Amazon Services LLC Associates Program</strong>,
              an affiliate advertising program designed to provide a means for us to earn fees by
              linking to Amazon.com. When you click an affiliate link and make a purchase, we may
              earn a commission at no additional cost to you.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              When you click an Amazon link, Amazon&apos;s own privacy policy applies. Amazon may
              set cookies or track your behaviour on their platform independently of Luna Beauty.
              Please review <a href="https://www.amazon.com/privacy" className="text-primary hover:underline">Amazon&apos;s Privacy Policy</a> for more information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-3">4. Analytics Events</h2>
            <p className="text-muted-foreground leading-relaxed">
              We track anonymous events (page views, affiliate clicks, chat messages) to understand
              which products are popular and improve our recommendations. Events are associated with
              your anonymous UUID only — never with personal information.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We use <strong>Vercel Analytics</strong> for aggregate site metrics. Vercel may collect
              IP-derived region data for geographic analytics, but does not store full IP addresses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-3">5. AI Chat (Luna AI)</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you use Luna AI chat, your messages are sent to the <strong>Anthropic Claude API</strong>
              along with your anonymized behavioral profile. Anthropic processes your messages to
              generate responses. By using the chat feature, you agree to Anthropic&apos;s usage
              policies. We do not store chat history on our servers — it exists only in your
              browser session.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-3">6. Your Rights & Controls</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong>Delete your profile:</strong> Clear your browser&apos;s localStorage to
                remove all Luna Beauty data from your device.
              </li>
              <li>
                <strong>Disable Cloud Sync:</strong> Toggle it off in the Luna chat panel. Your
                profile will only be stored locally.
              </li>
              <li>
                <strong>Data deletion request:</strong> If you enabled Cloud Sync and want your
                anonymous profile deleted from our servers, contact us with your UUID (visible in
                your browser console under <code>localStorage.getItem(&apos;luna_uuid&apos;)</code>).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-3">7. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Luna Beauty uses <strong>no tracking cookies</strong> of its own. We use localStorage
              for profile storage and sessionStorage for session identifiers — these are not cookies
              and are not shared with third parties. Amazon and Vercel may use their own cookies
              governed by their respective privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-3">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about your privacy? Contact us at{' '}
              <a href="mailto:privacy@lunabeauty.shop" className="text-primary hover:underline">
                privacy@lunabeauty.shop
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
