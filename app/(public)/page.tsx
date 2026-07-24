import Link from "next/link";
import { Metadata } from "next";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Send Signal | WhatsApp Outreach Automation",
};

export default function PublicLandingPage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <Logo size={32} />
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-body-large hover:opacity-80 transition-opacity">Features</a>
          <a href="#use-cases" className="text-body-large hover:opacity-80 transition-opacity">Use Cases</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-body-large font-medium hover:opacity-80 hidden sm:block">Log in</Link>
          <Link href="/sign-up" className="btn-primary">Get Started</Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="px-8 py-24 md:py-32 max-w-5xl mx-auto text-center flex flex-col items-center gap-8">
          <h1 className="text-display-large leading-tight text-balance">
            Turn cold leads into warm conversations on WhatsApp
          </h1>
          <p className="text-headline-small text-balance max-w-3xl opacity-80 text-neutral-variant">
            Automatically send personalized WhatsApp messages to new leads acquired from social platforms. Bridge the gap between lead generation and real-time personal engagement.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <Link href="/sign-up" className="btn-primary text-title-medium px-8 py-4">
              Get Started for Free
            </Link>
            <Link href="#features" className="btn-outline text-title-medium px-8 py-4">
              See how it works
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-neutral">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-display-medium mb-4">Everything you need to scale engagement</h2>
              <p className="text-headline-small opacity-80 max-w-2xl mx-auto">A seamless platform for marketing, sales, and support outreach.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-surface flex flex-col gap-4">
                <div className="icon-container-primary mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                </div>
                <h3 className="text-title-large">Seamless Lead Import</h3>
                <p className="text-body-large opacity-80">Easily upload CSVs to import context-rich lead profiles. Auto-deduplication ensures high-quality data.</p>
              </div>

              <div className="card-surface flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2 bg-success-container text-success">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                </div>
                <h3 className="text-title-large">Personalized Templates</h3>
                <p className="text-body-large opacity-80">Use dynamic placeholders like {"{first_name}"} and {"{source}"} to craft one-on-one experiences at scale.</p>
              </div>

              <div className="card-surface flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2 bg-warning-container text-warning">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                </div>
                <h3 className="text-title-large">Campaign Analytics</h3>
                <p className="text-body-large opacity-80">Track delivery rates, open rates, read receipts, and replies all from an intuitive operational dashboard.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="py-24 px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="text-display-medium">Built for any workflow</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-1.5 rounded-full bg-sys-primary"></div>
                  <div>
                    <h4 className="text-title-large mb-1">Immediate Welcome Messages</h4>
                    <p className="text-body-large opacity-80">Instantly greet new sign-ups or prospects via WhatsApp, increasing their likelihood to convert.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-1.5 rounded-full bg-sys-primary"></div>
                  <div>
                    <h4 className="text-title-large mb-1">Personal Lead Nurturing</h4>
                    <p className="text-body-large opacity-80">Follow up with webinar attendees or event participants to start sales dialogues seamlessly.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-1.5 rounded-full bg-sys-primary"></div>
                  <div>
                    <h4 className="text-title-large mb-1">Cart Recovery</h4>
                    <p className="text-body-large opacity-80">Recover potentially lost sales by offering discounts or reminders to users who abandoned their cart.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="aspect-[4/3] rounded-3xl w-full flex flex-col justify-end overflow-hidden shadow-2xl bg-gradient-to-br from-[var(--sys-primitive-color-collection-key-color-group-primary-key-color)] to-[var(--sys-primitive-color-collection-key-color-group-secondary-key-color)] relative">
                 {/* Decorative elements */}
                 <div className="absolute top-8 left-8 w-16 h-16 rounded-full bg-white/10 blur-2xl"></div>
                 <div className="absolute bottom-24 right-12 w-24 h-24 rounded-full bg-white/5 blur-3xl"></div>
                 
                 <div className="p-8 pb-0 relative z-10">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl rounded-b-none shadow-[0_-12px_40px_rgba(0,0,0,0.15)] border-x border-t border-white/20 p-6 space-y-5 max-w-sm ml-auto transform transition-transform hover:-translate-y-1 duration-500">
                       <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--sys-primitive-color-collection-key-color-group-primary-key-color)] flex items-center justify-center text-white font-semibold text-sm shadow-inner">
                               JD
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 leading-tight">Jane Doe</div>
                              <div className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                online
                              </div>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600" aria-label="Menu">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" /></svg>
                          </button>
                       </div>
                       
                       <div className="relative">
                         <div className="p-4 rounded-2xl rounded-tr-sm ml-6 text-sm shadow-sm bg-[var(--sys-color-roles-success-roles-success-container-color-role)]/80 backdrop-blur-sm text-gray-800 border border-green-200/50 leading-relaxed">
                            Hi Jane, thanks for signing up from TikTok! Here is your 10% off code.
                            <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-60">
                               <span>10:24 AM</span>
                               <svg viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-blue-500">
                                 <path d="M1 5L5 9L14 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                 <path d="M5 5L9 9L18 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="translate-x-1"/>
                               </svg>
                            </div>
                         </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-8 text-center bg-primary-container text-on-primary-container">
          <h2 className="text-display-medium mb-6">Ready to scale your outreach?</h2>
          <p className="text-headline-small max-w-2xl mx-auto mb-10 opacity-90">Join the businesses prioritizing direct, personalized, and compliant communication through WhatsApp.</p>
          <Link href="/sign-up" className="btn-primary text-title-medium px-10 py-5 inline-flex shadow-lg shadow-blue-500/20">
            Get Started Now
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-8 border-t text-center">
        <div className="text-body-medium opacity-60">
          © {new Date().getFullYear()} Send Signal. Built for automation and engagement.
        </div>
      </footer>
    </div>
  );
}
