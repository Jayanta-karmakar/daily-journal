import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, Scale, AlertCircle, Ban, HeartHandshake } from 'lucide-react';

export default function TermsOfService() {
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
              <Scale size={12} />
              <span>Legal Agreement</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">
              Last Updated: March 12, 2026
            </p>
          </div>

          {/* Accept Terms */}
          <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
              <HeartHandshake size={24} />
            </div>
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Agreement</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using <strong className="text-foreground italic tracking-tight">MyDiary</strong>, you agree to be bound by these terms. If you disagree with any part of the terms, you must discontinue use immediately.
            </p>
          </div>

          {/* Terms Content */}
          <section className="space-y-12 border-t border-border pt-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-foreground tracking-tight">1. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-foreground tracking-tight">2. Ownership of Content</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your entries, notes, and financial data are your property. <strong className="text-foreground uppercase italic tracking-tighter">MyDiary</strong> does not claim any ownership rights to the journal content you provide. We only hold the right to display this content back to you as part of our service.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-foreground tracking-tight">3. Prohibited Use</h2>
              <div className="p-6 rounded-2xl bg-muted/50 border border-border space-y-4">
                <div className="flex items-center gap-3 text-destructive">
                   <Ban size={18} />
                   <h4 className="font-black uppercase tracking-widest text-[10px]">Zero Tolerance</h4>
                </div>
                <ul className="grid gap-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground mt-2 shrink-0"></div>
                    Interfering with the security of the application or attempting to access other users' data.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground mt-2 shrink-0"></div>
                    Using the service for any illegal or unauthorized purpose according to your local laws.
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-foreground tracking-tight">4. Disclaimer of Warranty</h2>
              <div className="p-6 rounded-2xl border border-warning/30 bg-warning/5 flex gap-4">
                <AlertCircle className="text-warning shrink-0" size={20} />
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  Note: MyDiary is provided "AS IS". For budget tracking, it is intended as a personal ledger only and does not constitute professional financial advice. Always verify critical financial decisions with a certified expert.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-foreground tracking-tight">5. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall MyDiary be liable for any indirect, incidental, special, or consequential damages resulting from your use or inability to use the service.
              </p>
            </div>
          </section>

          {/* Footer of the terms */}
          <div className="pt-12 text-center border-t border-border flex flex-col items-center gap-6">
            <p className="text-sm text-muted-foreground italic">
              These terms are subject to change as the product evolves. Significant changes will be announced to registered users.
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
