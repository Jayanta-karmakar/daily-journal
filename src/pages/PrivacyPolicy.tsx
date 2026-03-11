import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Lock, EyeOff, Database, History } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <ArrowLeft size={20} />
            <span className="font-bold tracking-tight text-foreground">Back to MyDiary</span>
          </Link>
        </div>
      </header>

      <main className="pt-32 pb-24 px-4 sm:px-8 max-w-4xl mx-auto">
        <div className="space-y-12">
          {/* Hero Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
              <Shield size={12} />
              <span>Trust & Safety</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">
              Last Updated: March 12, 2026
            </p>
          </div>

          {/* Intro Section */}
          <section className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <p className="text-lg text-foreground leading-relaxed">
              At <strong className="text-primary">MyDiary</strong>, we believe your personal thoughts and financial records belong to exactly one person: <strong className="underline decoration-primary">you</strong>. This Privacy Policy outlines how we handle your data with absolute transparency and rigorous security.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 pt-8">
              <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <h3 className="font-black text-foreground uppercase tracking-tight text-sm">No Third-Party Sales</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">We never have, and never will, sell your personal journal entries or budget data to advertisers or data brokers.</p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <EyeOff size={20} />
                </div>
                <h3 className="font-black text-foreground uppercase tracking-tight text-sm">Isolated Storage</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Your data is stored in isolated tenant architectures, ensuring it cannot be accessed by other users.</p>
              </div>
            </div>
          </section>

          {/* Detailed Content */}
          <section className="space-y-10 border-t border-border pt-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-foreground tracking-tight">1. Data We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">
                We only collect data that is essential for the application to function:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Authentication:</strong> Email and password for account security.</li>
                <li><strong className="text-foreground">Entries:</strong> Journal text, expense labels, and amounts you explicitly save.</li>
                <li><strong className="text-foreground">Metadata:</strong> Timestamps and gym attendance logs to provide historical summaries.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-foreground tracking-tight">2. How We Use Data</h2>
              <p className="text-muted-foreground leading-relaxed">
                Data is processed exclusively to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Render your dashboard and history.</li>
                <li>Calculate your monthly budget vs. spend ratios.</li>
                <li>Generate your fitness accountability logs.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-foreground tracking-tight">3. Data Retention & Deletion</h2>
              <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20 flex gap-4 items-start">
                <History className="text-destructive shrink-0" size={20} />
                <div>
                  <h4 className="font-black text-destructive uppercase tracking-widest text-[10px] mb-1">User Control</h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    You have the right to delete any specific entry or your entire account at any time. Once deleted, your data is scrubbed from our active databases and cannot be recovered.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-foreground tracking-tight">4. Security Infrastructure</h2>
              <p className="text-muted-foreground leading-relaxed">
                We utilize <strong className="text-foreground">Supabase</strong> for secure database management, featuring Row Level Security (RLS) which acts as a virtual firewall between your data and everyone else.
              </p>
            </div>
          </section>

          {/* Footer of the policy */}
          <div className="pt-12 text-center border-t border-border flex flex-col items-center gap-6">
            <p className="text-sm text-muted-foreground italic">
              Questions about our privacy practices? Reach out to our security team.
            </p>
            <Link to="/" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
              <ArrowLeft size={16} /> Return to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
