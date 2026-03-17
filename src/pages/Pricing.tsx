import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, Globe, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import FireCanvas from '@/components/FireCanvas';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { currencies } from '@/data/currencies';
import { PRICING, DATABASE, DEFAULTS } from '@/config/constants';

// Filtered list for the switcher (most common ones)
const featuredCurrencies = currencies.filter(c =>
  PRICING.FEATURED_CURRENCY_CODES.includes(c.code)
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

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
}

export default function Pricing() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedCurrency, setSelectedCurrency] = useState(featuredCurrencies.find(c => c.code === DEFAULTS.CURRENCY) || featuredCurrencies[0]);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from(DATABASE.TABLES.PRICING_PLANS)
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (!error && data) {
      setPlans(data as PricingPlan[]);
    }
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return '0';
    // The price in DB is assumed to be in the plan's default currency (usually INR or USD)
    // For this demo, we'll treat the DB price as USD for conversion logic
    const rate = PRICING.EXCHANGE_RATES[selectedCurrency.code] || 1;
    const converted = price * rate;
    if (converted >= 1000) {
      return (converted / 1000).toFixed(1) + 'k';
    }
    return Math.round(converted).toLocaleString();
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

            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={cn("text-sm font-bold", billingCycle === 'monthly' ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
              <button
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-14 h-7 rounded-full bg-muted border border-border p-1 transition-colors hover:border-primary/50"
              >
                <div className={cn(
                  "absolute top-1 left-1 w-5 h-5 rounded-full bg-primary transition-all duration-300 shadow-sm",
                  billingCycle === 'yearly' && "translate-x-7"
                )} />
              </button>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-bold", billingCycle === 'yearly' ? "text-foreground" : "text-muted-foreground")}>Yearly</span>
                <span className="px-2 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-black uppercase tracking-wider">Save 20%</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className={cn(
              "grid gap-6 items-stretch mx-auto",
              plans.length === 1 && "max-w-md grid-cols-1",
              plans.length === 2 && "max-w-4xl grid-cols-1 md:grid-cols-2",
              plans.length === 3 && "max-w-6xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
              plans.length >= 4 && "max-w-7xl grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            )}>
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col p-8 rounded-[2rem] border transition-all duration-300 group overflow-hidden min-h-[500px]",
                    plan.is_popular
                      ? "bg-white text-slate-900 border-primary shadow-2xl scale-[1.02] z-10 border-2"
                      : "bg-card text-foreground border-border hover:border-primary/50 shadow-sm"
                  )}
                >
                  {/* Fire Background for Popular Plan */}
                  {plan.is_popular && (
                    <div className="absolute inset-x-0 bottom-0 h-[40%] z-0 pointer-events-none opacity-90">
                      <FireCanvas className="w-full h-full" />
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/50 to-white"></div>
                    </div>
                  )}


                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-xl">{plan.name}</h3>
                      {plan.is_popular && (
                        <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20">
                          Most popular
                        </span>
                      )}
                    </div>

                    <p className={cn("text-xs mb-8 leading-relaxed", plan.is_popular ? "text-slate-500" : "text-muted-foreground")}>
                      {plan.description}
                    </p>

                    <div className="mb-8 flex items-baseline gap-1">
                      <span className="text-4xl font-black">
                        {selectedCurrency.symbol}{formatPrice(billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly)}
                      </span>
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest", plan.is_popular ? "text-slate-400" : "text-muted-foreground")}>
                        {plan.price_monthly === 0 ? 'one-time' : `/ ${billingCycle}`}
                      </span>
                    </div>

                    <Link
                      to={plan.price_monthly === 0 ? "/register" : "#"}
                      className={cn(
                        "w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mb-8",
                        plan.is_popular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-foreground hover:bg-primary hover:text-primary-foreground"
                      )}
                    >
                      {plan.price_monthly === 0 ? 'Get Started' : 'Coming Soon'}
                      <ArrowRight size={16} />
                    </Link>

                    <div className="flex flex-col gap-4 mt-auto">
                      {Array.isArray(plan.features) && plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${idx * 100}ms` }}>
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                            "bg-primary/10 text-primary"
                          )}>
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className={cn("text-xs font-medium", plan.is_popular ? "text-slate-600" : "text-muted-foreground")}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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
