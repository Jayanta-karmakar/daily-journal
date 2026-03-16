import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, Globe, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import FireCanvas from '@/components/FireCanvas';
import Logo from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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

const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return '🌐';
  if (countryCode.toLowerCase() === 'eu') return '🇪🇺';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return '🌐';
  }
};

const plans = [
  {
    name: 'Free Plan',
    description: 'A lightweight way to try MyDiary. No cost, no card, no hassle.',
    price: 0,
    features: [
      // 'Unlimited journal entries',
      // 'Basic budget tracking',
      // 'Daily workout logs',
      // 'PWA & Offline support',
    ],
    buttonText: 'Get started',
    popular: true,
  },
  {
    name: 'Hobby',
    description: 'Great for side projects and personal growth. Fast, simple, no fuss.',
    price: 10,
    features: [
      // 'Everything in Free',
      // 'Biometric lock (Mobile)',
      // 'Export to PDF/CSV',
      // 'Advanced monthly analytics',
      // 'Custom categories',
    ],
    buttonText: 'Coming Soon',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'Scaling with less effort. Trusted, dependable, and powerful.',
    price: 20,
    features: [
      // 'Everything in Hobby',
      // 'Priority cloud sync',
      // 'Unlimited storage',
      // 'AI-powered reflection',
      // 'Multi-device sync',
      // 'Family sharing (up to 3)',
    ],
    buttonText: 'Coming Soon',
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
      <Navbar />

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
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-card border border-border hover:border-primary/50 transition-all font-semibold text-sm shadow-sm hover:shadow-md group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">{getFlagEmoji(selectedCurrency.flag)}</span>
                <span className="text-muted-foreground font-medium">Currency:</span>
                <span>{selectedCurrency.code}</span>
                <ChevronDown size={14} className={cn("transition-transform text-muted-foreground", showCurrencyDropdown && "rotate-180")} />
              </button>

              {showCurrencyDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCurrencyDropdown(false)}
                  />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl z-20 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="px-3 py-2 border-b border-border mb-1 flex items-center gap-2">
                      <Search size={14} className="text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search currency..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-xs focus:outline-none py-1"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                      {(searchQuery ? filteredCurrencies : featuredCurrencies).map((curr) => (
                        <button
                          key={curr.code}
                          onClick={() => {
                            setSelectedCurrency(curr);
                            setShowCurrencyDropdown(false);
                            setSearchQuery('');
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-primary/10 transition-colors",
                            selectedCurrency.code === curr.code ? "text-primary font-bold bg-primary/5" : "text-foreground"
                          )}
                        >
                          <span className="flex gap-3 items-center">
                            <span className="text-base w-6 text-center">{getFlagEmoji(curr.flag)}</span>
                            <span className="font-mono text-[10px] w-8 opacity-60 uppercase">{curr.code}</span>
                            <span className="truncate max-w-[150px]">{curr.name}</span>
                          </span>
                          <span className="text-muted-foreground font-medium">{curr.symbol}</span>
                        </button>
                      ))}
                      {searchQuery && filteredCurrencies.length === 0 && (
                        <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                          No currencies found.
                        </div>
                      )}
                    </div>
                  </div>
                </>
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
                  <div className="absolute inset-x-0 bottom-0 h-[65%] z-0 pointer-events-none opacity-90">
                    <FireCanvas className="w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-foreground/95"></div>
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
          <div className="mt-32">
            <div className="relative max-w-5xl mx-auto p-8 sm:p-16 rounded-[3rem] bg-foreground text-background overflow-hidden shadow-2xl">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/5 border border-background/10 text-[10px] font-black uppercase tracking-[0.2em] text-background/60 mb-8">
                    <Globe size={16} className="text-primary animate-pulse" />
                    Global Launching Soon
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight leading-[1.1]">
                    Pricing is on its way. <br />
                    <span className="text-primary">Start for free today.</span>
                  </h2>
                  <p className="text-background/50 text-sm sm:text-lg max-w-xl font-medium leading-relaxed">
                    We're currently scaling our payment infrastructure to support over 150+ currencies.
                    Register today to lock in early-bird access and all standard features at no cost.
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-center gap-6">
                  <Link
                    to="/register"
                    className="group relative px-10 py-5 bg-background text-foreground rounded-2xl font-black text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20 flex items-center gap-3"
                  >
                    Claim Free Access
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <div className="flex items-center gap-2 text-[10px] font-black text-success uppercase tracking-[0.3em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    No credit card required
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
