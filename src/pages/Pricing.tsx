import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import FireCanvas from '@/components/FireCanvas';
import Logo from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';

import { currencies } from '@/data/currencies';

// Sample conversion rates relative to USD (1.0)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  INR: 83.2,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150.5,
  CAD: 1.35,
  AED: 3.67,
  AUD: 1.54,
  SGD: 1.34,
};

// Filtered list for the switcher (most common ones)
const featuredCurrencies = currencies.filter(c => 
  ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AED', 'AUD', 'SGD'].includes(c.code)
);

const plans = [
  {
    name: 'Free Plan',
    description: 'A lightweight way to try MyDiary. No cost, no card, no hassle.',
    price: 0,
    features: [
      'Unlimited journal entries',
      'Basic budget tracking',
      'Daily workout logs',
      'PWA & Offline support',
    ],
    buttonText: 'Get started',
    popular: false,
  },
  {
    name: 'Hobby',
    description: 'Great for side projects and personal growth. Fast, simple, no fuss.',
    price: 5,
    features: [
      'Everything in Free',
      'Biometric lock (Mobile)',
      'Export to PDF/CSV',
      'Advanced monthly analytics',
      'Custom categories',
    ],
    buttonText: 'Subscribe',
    popular: true,
  },
  {
    name: 'Pro',
    description: 'Scaling with less effort. Trusted, dependable, and powerful.',
    price: 15,
    features: [
      'Everything in Hobby',
      'Priority cloud sync',
      'Unlimited storage',
      'AI-powered reflection',
      'Multi-device sync',
      'Family sharing (up to 3)',
    ],
    buttonText: 'Subscribe',
    popular: false,
  },
  // {
  //   name: 'Growth',
  //   description: 'Built for high volume and speed. MyDiary at full force.',
  //   price: 49,
  //   features: [
  //     'Everything in Pro',
  //     'Enterprise-grade security',
  //     'API access',
  //     'Dedicated support',
  //     'Custom data migration',
  //     'Early access to features',
  //   ],
  //   buttonText: 'Subscribe',
  //   popular: false,
  // },
];

export default function Pricing() {
  const [selectedCurrency, setSelectedCurrency] = useState(featuredCurrencies.find(c => c.code === 'INR') || featuredCurrencies[0]);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const formatPrice = (price: number) => {
    if (price === 0) return '0';
    const rate = EXCHANGE_RATES[selectedCurrency.code] || 1;
    const converted = price * rate;
    if (converted >= 1000) {
      return (converted / 1000).toFixed(1) + 'k';
    }
    return Math.round(converted).toString();
  };

  const filteredCurrencies = currencies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 50); // Limit results for performance


  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Logo size={34} className="transition-transform duration-200 group-hover:scale-110" />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">MyDiary</span>
          </Link>
          <div className="flex items-center gap-4">
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

      <main className="flex-1 pt-32 pb-24">
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6 border border-primary/20">
              <Sparkles size={14} />
              <span>Simple, Transparent Pricing</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-6">
              Choose the plan that's <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">right for you</span>
            </h1>
            
            {/* Currency Selector */}
            <div className="relative inline-block mt-4">
              <button 
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:border-primary/50 transition-all font-semibold text-sm"
              >
                <Globe size={16} className="text-muted-foreground" />
                <span>IN {selectedCurrency.code}</span>
                <ChevronDown size={14} className={cn("transition-transform", showCurrencyDropdown && "rotate-180")} />
              </button>
              
              {showCurrencyDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-20 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="px-3 py-1 border-b border-border mb-1">
                    <input 
                      type="text" 
                      placeholder="Search currency..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs focus:outline-none py-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {(searchQuery ? filteredCurrencies : featuredCurrencies).map((curr) => (
                      <button
                        key={curr.code}
                        onClick={() => {
                          setSelectedCurrency(curr);
                          setShowCurrencyDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-primary/10 transition-colors",
                          selectedCurrency.code === curr.code ? "text-primary font-bold bg-primary/5" : "text-foreground"
                        )}
                      >
                        <span className="flex gap-2 items-center">
                          <span className="font-mono text-[10px] w-6 opacity-60">{curr.code}</span>
                          <span className="truncate max-w-[100px]">{curr.name}</span>
                        </span>
                        <span className="text-muted-foreground text-xs">{curr.symbol}</span>
                      </button>
                    ))}
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* Pricing Grid */}
          <div className={cn(
            "grid gap-6 items-stretch mx-auto",
            plans.length === 1 && "max-w-md grid-cols-1",
            plans.length === 2 && "max-w-4xl grid-cols-1 md:grid-cols-2",
            plans.length === 3 && "max-w-6xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            plans.length >= 4 && "max-w-7xl grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}>
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={cn(
                  "relative flex flex-col p-8 rounded-[2rem] border transition-all duration-300 group overflow-hidden",
                  plan.popular 
                    ? "bg-foreground text-background border-transparent shadow-2xl scale-[1.02] z-10" 
                    : "bg-card text-foreground border-border hover:border-primary/50 shadow-sm"
                )}
              >
                {/* Fire Background for Popular Plan */}
                {plan.popular && (
                  <div className="absolute inset-x-0 bottom-0 h-[60%] z-0 pointer-events-none opacity-60 group-hover:opacity-80 transition-opacity">
                    <FireCanvas className="w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-foreground/20 to-foreground"></div>
                  </div>
                )}


                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl">{plan.name}</h3>
                    {plan.popular && (
                      <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20">
                        Most popular
                      </span>
                    )}
                  </div>
                  
                  <p className={cn("text-xs mb-8 leading-relaxed", plan.popular ? "text-background/70" : "text-muted-foreground")}>
                    {plan.description}
                  </p>
                  
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-4xl font-black">{selectedCurrency.symbol}{formatPrice(plan.price)}</span>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", plan.popular ? "text-background/50" : "text-muted-foreground")}>
                      {plan.price === 0 ? 'one-time' : '/ monthly'}
                    </span>
                  </div>

                  <Link 
                    to={plan.price === 0 ? "/register" : "#"}
                    className={cn(
                      "w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mb-8",
                      plan.popular 
                        ? "bg-background text-foreground hover:bg-background/90" 
                        : "bg-muted text-foreground hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    {plan.buttonText}
                    <ArrowRight size={16} />
                  </Link>

                  <div className="flex flex-col gap-4 mt-auto">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                          plan.popular ? "bg-background/10 text-background" : "bg-primary/10 text-primary"
                        )}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span className={cn("text-xs font-medium", plan.popular ? "text-background/80" : "text-muted-foreground")}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Pitch */}
          {/* <div className="mt-20 text-center">
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
              <Globe size={16} className="text-primary" />
              Extra features are available via auto-recharge packs. <Link to="#" className="text-primary font-bold hover:underline">Enable ↗</Link>
            </p>
          </div> */}
        </section>
      </main>

      {/* Simplified Footer for Pricing Page */}
      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 group">
            <Logo size={24} />
            <span className="font-black text-foreground uppercase tracking-tight">MyDiary</span>
          </div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            © {new Date().getFullYear()} MyDiary. All Rights Reserved.
          </p>
          <div className="flex gap-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
