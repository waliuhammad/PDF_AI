"use client";

import { 
  Cloud, 
  ShieldCheck, 
  FolderLock, 
  Lock, 
  Key, 
  Trash2, 
  CheckCircle2 
} from "lucide-react";
import { ContentPage, Section } from "@/components/marketing/content-page";
import { DraftNotice } from "@/components/marketing/draft-notice";

/* -------------------------------------------------------------------------- */
/* MAIN SECURITY PAGE                                                         */
/* -------------------------------------------------------------------------- */

const productSecurityFeatures = [
  {
    icon: Cloud,
    title: "Cloud infrastructure",
    description: "PDFAI utilizes robust cloud infrastructure partnerships for a secure and adaptable environment, ensuring resilience to meet user demands effectively.",
  },
  {
    icon: ShieldCheck,
    title: "Network communications",
    description: "We rely on a global content delivery and DDoS protection service, guaranteeing rapid access worldwide and robust security against online threats.",
  },
  {
    icon: FolderLock,
    title: "Storage",
    description: "PDFAI's cloud infrastructure is bolstered by a leading data storage provider. It's important to emphasize that PDFAI does not retain user documents.",
  },
];

export default function SecurityPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-800 dark:bg-[#13131d] dark:text-purple-100">
      <main className="flex-1">
        <ContentPage title="Security">
          <DraftNotice />

          {/* Product Security Feature Overview (Visual Cards) */}
          <div className="my-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Product Security</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-purple-200/80">
                Find details on how we secure and protect user data and document processing
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {productSecurityFeatures.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-start p-6 rounded-2xl border border-slate-200 bg-white dark:border-purple-900/30 dark:bg-[#181824]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300 mb-5">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-purple-200/70">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 1: Where files are processed */}
          <Section heading="Where files are processed">
            <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-purple-200">
              <p>
                PDFAI uses a hybrid processing architecture designed to maximize speed while safeguarding data privacy:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-purple-200/80">
                <li>
                  <strong className="text-slate-900 dark:text-white">Client-Side Processing (In Browser):</strong> Lightweight operations like page rotation, PDF merging, page extraction, and client PDF rendering run completely in WebAssembly within your web browser. Your document never leaves your machine.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Server-Side Processing:</strong> Complex operations including OCR text extraction, file format conversion (e.g., PDF to PNG), and AI-assisted chat run on secure, sandboxed serverless environments with strict memory isolation.
                </li>
              </ul>
            </div>
          </Section>

          {/* Section 2: Encryption */}
          <Section heading="Encryption">
            <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-purple-200">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Transport Encryption (In Transit)</h4>
                  <p className="mt-1 text-slate-600 dark:text-purple-200/80">
                    All data sent between your browser and our servers is encrypted using <strong>TLS 1.3</strong> protocols with HTTP Strict Transport Security (HSTS) preloaded to block unauthorized eavesdropping.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Key className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Storage Encryption (At Rest)</h4>
                  <p className="mt-1 text-slate-600 dark:text-purple-200/80">
                    Any transient file created during conversion or user workspace storage is encrypted using <strong>AES-256 bit</strong> encryption standard. Access keys are managed separately via isolated cloud KMS systems.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* Section 3: Account security */}
          <Section heading="Account security">
            <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-purple-200">
              <p>
                Your account authentication is secured by industry-leading auth infrastructure:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <li className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white dark:border-purple-900/30 dark:bg-[#181824]">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>OAuth & Social Sign-In:</strong> Secure authentication via Google and GitHub with zero plain-text password storage on our servers.</span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white dark:border-purple-900/30 dark:bg-[#181824]">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Password Hashing:</strong> Passwords created directly are salted and hashed using bcrypt/Argon2 algorithm standards.</span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white dark:border-purple-900/30 dark:bg-[#181824]">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Encrypted Password Resets:</strong> Time-limited, single-use cryptographically signed reset links.</span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white dark:border-purple-900/30 dark:bg-[#181824]">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Multi-Factor Support (MFA):</strong> Optional TOTP authenticator app support for enterprise and pro account tiers.</span>
                </li>
              </ul>
            </div>
          </Section>

          {/* Section 4: Retention and deletion */}
          <Section heading="Retention and deletion">
            <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-purple-200">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">60-Minute Auto-Purge</h4>
                  <p className="mt-1 text-slate-600 dark:text-purple-200/80">
                    Guest and temporary processed files are automatically and permanently deleted from disk and RAM within 1 hour. No residual copies remain in backup snapshots.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-purple-300/60 pl-8">
                Users can also manually trigger instant document deletion immediately after downloading converted outputs.
              </p>
            </div>
          </Section>
        </ContentPage>
      </main>
    </div>
  );
}