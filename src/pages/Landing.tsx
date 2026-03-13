import { Link } from 'react-router-dom';
import { BookOpen, Dumbbell, ShieldCheck, Wallet, Sparkles, CheckCircle2, ArrowRight, FileUp, Download, Github, Twitter, Mail } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import Logo from '@/components/Logo';

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex flex-col gap-4 p-8 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all group">
    <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-foreground text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-x-hidden selection:bg-primary/20">
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <Logo size={34} className="transition-transform duration-200 group-hover:scale-110" />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">MyDiary</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link to="/login" className="text-sm font-semibold text-foreground hover:text-primary transition-colors hidden sm:block">
              Log in
            </Link>
            <Link to="/register" className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-8 py-24 lg:py-32 flex flex-col items-center text-center max-w-5xl mx-auto z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-8 border border-primary/20 ring-1 ring-primary/10">
            <Sparkles size={14} className="animate-pulse" />
            <span>The All-In-One Personal Ledger</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-8">
            Master your day. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-indigo-600">Log your life.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            A beautiful, fully private daily journal, budget tracker, and fitness ledger built exclusively to help you reflect, analyze, and grow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <Link to="/register" className="px-8 py-4 rounded-full bg-primary text-primary-foreground text-base font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              Start your journey <ArrowRight size={18} />
            </Link>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 rounded-full bg-card border border-border text-foreground text-base font-bold hover:bg-muted transition-all flex items-center justify-center">
              Explore Features
            </button>
          </div>

          {/* Hero App Mockup */}
          <div className="mt-20 w-full max-w-5xl mx-auto relative group perspective-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-70 transition duration-1000 -z-10"></div>
            
            <div className="relative bg-background/95 backdrop-blur-xl border border-border rounded-[2rem] shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-700 hover:scale-[1.01]">
              
              {/* Mock Window Header */}
              <div className="h-14 border-b border-border bg-muted/30 flex items-center px-5 gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/80 shadow-[0_0_8px_rgba(var(--destructive),0.4)]"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.4)]"></div>
                  <div className="w-3 h-3 rounded-full bg-success/80 shadow-[0_0_8px_rgba(var(--success),0.4)]"></div>
                </div>
                <div className="ml-4 w-64 h-7 bg-background rounded-md border border-border/50 flex items-center px-4">
                  <div className="w-full text-[10px] text-muted-foreground/60 font-medium truncate">app.mydiary.com/dashboard</div>
                </div>
              </div>
              
              {/* Mock Window Content */}
              <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* Mock Card 1: Daily Spend */}
                <div className="md:col-span-2 bg-card rounded-2xl border border-border p-6 flex flex-col gap-5 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Wallet size={24} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-muted-foreground mb-1 uppercase tracking-widest">Today's Spend</div>
                        <div className="text-2xl font-black text-foreground">₹2,363</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-success/10 text-success text-[10px] font-black tracking-widest uppercase rounded-full border border-success/20">
                      Healthy
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                       <span>Daily limit: ₹5,000</span>
                       <span>47%</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[47%] bg-primary rounded-full shadow-inner"></div>
                    </div>
                  </div>
                </div>
                
                {/* Mock Card 2: Gym */}
                <div className="bg-card rounded-2xl border border-border p-6 flex flex-col justify-center items-center gap-3 shadow-sm relative overflow-hidden group/item">
                   <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                   <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mb-1 relative z-10 border border-success/20 shadow-lg shadow-success/10">
                     <CheckCircle2 size={32} />
                   </div>
                   <div className="text-base font-black text-foreground relative z-10 uppercase tracking-tight">Gym Time</div>
                   <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest relative z-10">Session Logged</div>
                </div>
                
                {/* Mock Journal Entry */}
                <div className="md:col-span-3 bg-card rounded-2xl border border-border p-6 flex flex-col gap-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                        <BookOpen size={20} />
                      </div>
                      <div>
                         <div className="text-sm font-black text-foreground uppercase tracking-tight">Daily Reflection</div>
                         <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">March 12, 2026</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-[10px]">✨</div>
                       <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-[10px]">🏠</div>
                    </div>
                  </div>
                  <div className="space-y-3 py-1">
                    <div className="w-full h-2.5 bg-muted rounded-full opacity-60"></div>
                    <div className="w-[90%] h-2.5 bg-muted rounded-full opacity-60"></div>
                    <div className="w-[95%] h-2.5 bg-muted rounded-full opacity-60"></div>
                    <div className="w-[40%] h-2.5 bg-primary/20 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/30 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Everything you need, nothing you don't.</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Replaces three different apps by thoughtfully combining exactly what you need to track each day effectively.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                icon={<BookOpen size={28} />} 
                title="Daily Journal" 
                desc="A calm, distraction-free space to reflect on your day, write notes securely, and keep memories alive." 
              />
              <FeatureCard 
                icon={<Wallet size={28} />} 
                title="Budget Tracker" 
                desc="Set monthly limits, separate precise needs vs wants, and monitor your spending visually." 
              />
              <FeatureCard 
                icon={<Dumbbell size={28} />} 
                title="Gym Ledger" 
                desc="Never miss a workout. Keep yourself strictly accountable for your fitness goals." 
              />
              <FeatureCard 
                icon={<ShieldCheck size={28} />} 
                title="Privacy First" 
                desc="Extremely secure. Isolated tenant architecture means absolutely nobody else sees your entries." 
              />
            </div>
          </div>
        </section>

        {/* CSV Import Showcase Section */}
        <section className="py-24 relative overflow-hidden bg-background">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-8 grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-80 transition animate-pulse"></div>
                
                <div className="relative bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                         <FileUp size={20} />
                      </div>
                      <div className="text-sm font-bold text-foreground">Migration_Data.csv</div>
                    </div>
                    <div className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20">Ready to Import</div>
                  </div>

                  {/* CSV Rows Decoration */}
                  <div className="space-y-3 opacity-40">
                    <div className="h-3 w-full bg-muted rounded-full flex gap-2 p-1">
                      <div className="w-1/4 h-full bg-primary/30 rounded-full"></div>
                      <div className="w-1/2 h-full bg-muted-foreground/10 rounded-full"></div>
                      <div className="w-1/4 h-full bg-primary/20 rounded-full"></div>
                    </div>
                    <div className="h-3 w-full bg-muted rounded-full flex gap-2 p-1">
                      <div className="w-1/5 h-full bg-primary/30 rounded-full"></div>
                      <div className="w-3/5 h-full bg-muted-foreground/10 rounded-full"></div>
                      <div className="w-1/5 h-full bg-primary/20 rounded-full"></div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col items-center gap-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30">
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground">Fast & Secure Bulk Import</div>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto leading-relaxed">Automatically maps your history to journal entries and fitness logs.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                Smooth Migration
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-[1.1]">
                Switch seamlessly. <br/>
                <span className="text-primary italic">Keep your history.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Import thousands of entries from Google Sheets or Excel in seconds. Our intelligent parser preserves every memory and every expense group.
              </p>
              
              <div className="space-y-6 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                    <Download size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Try the Format</h4>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">Download our standard template to see how to organize your data for a perfect import.</p>
                    <a 
                      href="/sample_diary.csv" 
                      download 
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90 transition-all group shadow-lg"
                    >
                      Download Sample CSV
                      <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-success/20 text-success flex items-center justify-center font-bold text-sm shrink-0">✓</div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Validates duplicates & errors</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Multi-Tenant / Pricing Pitch */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-8 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              Enterprise-grade privacy.<br/>
              <span className="text-primary">100% Free Forever.</span>
            </h2>
            <ul className="space-y-4">
              {[
                'Unlimited daily entries',
                'Unlimited expense tracking',
                'Advanced monthly statistics',
                'End-to-end secure database',
                'Dark & Light mode support'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary flex-shrink-0" size={24} />
                  <span className="text-lg text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/register" className="inline-block px-8 py-4 rounded-full bg-foreground text-background text-base font-bold hover:bg-foreground/90 transition-all shadow-lg text-center">
              Create Free Account
            </Link>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="bg-gradient-to-br from-card to-background border border-border rounded-3xl p-4 sm:p-8 relative overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] shadow-primary/20 flex flex-col gap-6">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
               
               {/* Mock App Window */}
               <div className="bg-background w-full rounded-2xl border border-border shadow-2xl relative z-10 overflow-hidden flex flex-col transform transition-transform duration-700 hover:scale-[1.02]">
                  {/* Mock App Header */}
                  <div className="h-12 border-b border-border bg-card flex items-center px-4 justify-between">
                    <div className="flex items-center gap-2">
                      <Logo size={18} />
                      <div className="w-16 h-3 bg-muted rounded-full"></div>
                    </div>
                    <div className="flex gap-2 items-center">
                       <div className="w-4 h-4 rounded-full bg-muted"></div>
                       <div className="w-4 h-4 rounded-full bg-muted"></div>
                       <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30"></div>
                    </div>
                  </div>
                  
                  {/* Mock App Body */}
                  <div className="p-5 flex flex-col gap-4 bg-background/50">
                     <div className="flex items-end justify-between">
                        <div>
                           <div className="w-24 h-3 bg-muted rounded-full mb-2"></div>
                           <div className="w-32 h-6 bg-foreground opacity-90 rounded-md"></div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                           <Dumbbell size={20} className="text-primary" />
                        </div>
                     </div>
                     
                     {/* Progress Bar Mock */}
                     <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                           <div className="w-20 h-3 bg-muted rounded-full"></div>
                           <div className="w-12 h-3 bg-primary/50 rounded-full"></div>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                           <div className="w-[65%] h-full bg-primary rounded-full"></div>
                        </div>
                     </div>
                     
                     {/* Journal Entry Mock */}
                     <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col gap-2.5 relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
                        <div className="flex items-center gap-2 mb-1">
                           <BookOpen size={14} className="text-muted-foreground" />
                           <div className="w-16 h-2 bg-muted rounded-full"></div>
                        </div>
                        <div className="w-[90%] h-2 bg-foreground/20 rounded-full"></div>
                        <div className="w-[75%] h-2 bg-foreground/20 rounded-full"></div>
                        <div className="w-[40%] h-2 bg-foreground/20 rounded-full"></div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card pt-24 pb-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            {/* Brand Column */}
            <div className="space-y-8">
              <div className="flex items-center gap-2 group">
                <Logo size={32} className="transition-transform duration-200 group-hover:scale-110" />
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent uppercase">MyDiary</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                The complete daily journal and budget ledger designed for individuals who value privacy and progress above all else.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-sm">
                  <Twitter size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-sm">
                  <Github size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-sm">
                  <Mail size={18} />
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="font-black text-foreground uppercase tracking-widest text-xs mb-8">Product</h4>
              <ul className="space-y-4">
                <li><a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold tracking-tight">Core Features</a></li>
                <li><Link to="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold tracking-tight">Free Tier</Link></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold tracking-tight">Migration Tools</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold tracking-tight">Security Protocol</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="font-black text-foreground uppercase tracking-widest text-xs mb-8">Resources</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold tracking-tight">Community Forum</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold tracking-tight">Help Center</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold tracking-tight">Privacy Guarantees</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="font-black text-foreground uppercase tracking-widest text-xs mb-8">Legal</h4>
              <ul className="space-y-4">
                <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold tracking-tight">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold tracking-tight">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} MyDiary Open Source. Built for Progress.
            </p>
            <div className="flex gap-8">
              <div className="flex items-center gap-2 text-[10px] font-black text-success uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                All Systems Operational
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
