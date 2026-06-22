import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, CreditCard, Ban, CheckCircle, Edit, Save, Trash2, ArrowLeft, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAppContext } from '@/context/AppContext';
import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { APP_ROUTES, AUTH_ROLES } from '@/config/constants';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: string;
  is_banned: boolean;
  created_at: string;
}

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

export default function Admin() {
  const navigate = useNavigate();
  const { session } = useAppContext();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'users' | 'pricing'>('users');

  // Users State
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Pricing State
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);

  useEffect(() => {
    checkAdmin();
  }, [session]);

  const checkAdmin = async () => {
    if (!session || !session.user || !session.user.id) {
      setLoading(false);
      navigate(APP_ROUTES.LOGIN);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      if (error || !data || data.role !== AUTH_ROLES.ADMIN) {
        toast.error('Access denied. Administrator privileges required.');
        setLoading(false);
        navigate(APP_ROUTES.HOME);
        return;
      }
      setIsAdmin(true);
      fetchProfiles();
      fetchPricingPlans();
    } catch (err) {
      toast.error('Failed to verify admin status.');
      setLoading(false);
      navigate(APP_ROUTES.HOME);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) setProfiles(data);
  };

  const fetchPricingPlans = async () => {
    const { data, error } = await supabase.from('pricing_plans').select('*').order('created_at', { ascending: false });
    if (!error && data) setPricingPlans(data);
  };

  const toggleBan = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update user status.');
    } else {
      toast.success(`User successfully ${!currentStatus ? 'banned' : 'unbanned'}.`);
      setProfiles(profiles.map(p => p.id === id ? { ...p, is_banned: !currentStatus } : p));
    }
  };

  const savePricingPlan = async () => {
    if (!editingPlan) return;

    let error;
    if (editingPlan.id === 'new') {
      const { id, ...newPlan } = editingPlan;
      const { error: insertError } = await supabase.from('pricing_plans').insert([newPlan]);
      error = insertError;
    } else {
      const { error: updateError } = await supabase
        .from('pricing_plans')
        .update(editingPlan)
        .eq('id', editingPlan.id);
      error = updateError;
    }

    if (error) {
      toast.error('Failed to save pricing plan.');
    } else {
      toast.success('Pricing plan saved successfully.');
      setEditingPlan(null);
      fetchPricingPlans();
    }
  };

  const filteredProfiles = profiles.filter(p => p.email.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Verifying credentials...</div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
      <SEO
        title="Admin Control Center"
        robots="noindex, nofollow"
      />
      <TopNav />

      <main className="flex-1 pt-24 pb-16 max-w-7xl mx-auto w-full px-4 sm:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider mb-2 border border-destructive/20">
              <ShieldAlert size={12} />
              <span>Admin Privileges Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">Center</span>
            </h1>
          </div>
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-semibold flex items-center gap-2 hover:bg-muted transition-all shadow-sm w-fit h-[40px]">
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'users' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted/30 text-muted-foreground hover:bg-muted'}`}
          >
            <Users size={16} /> Manage Users
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'pricing' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted/30 text-muted-foreground hover:bg-muted'}`}
          >
            <CreditCard size={16} /> Configure Pricing
          </button>
        </div>

        {/* Content */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative max-w-sm mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm text-sm font-medium"
              />
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                      <th className="px-5 py-3.5">User Details</th>
                      <th className="px-5 py-3.5">Contact</th>
                      <th className="px-5 py-3.5">Role</th>
                      <th className="px-5 py-3.5">Joined</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                     {filteredProfiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground/80">{profile.full_name || 'N/A'}</span>
                            <span className="text-[10px] text-muted-foreground font-medium">{profile.email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-medium text-foreground/70">{profile.phone || '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${profile.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {profile.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground font-medium">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5">
                          {profile.is_banned ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-wider">
                              <Ban size={10} /> Banned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-wider">
                              <CheckCircle size={10} /> Active
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {profile.role !== 'admin' && (
                            <button
                              onClick={() => toggleBan(profile.id, profile.is_banned)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${profile.is_banned ? 'bg-success/10 text-success hover:bg-success hover:text-white' : 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-white'}`}
                            >
                              {profile.is_banned ? 'Unban' : 'Ban'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredProfiles.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-end">
              <button
                onClick={() => setEditingPlan({ id: 'new', name: '', description: '', price_monthly: 0, price_yearly: 0, currency: 'INR', features: [], is_active: true, is_popular: false })}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
              >
                + Create New Plan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Pricing Cards */}
              {pricingPlans.map(plan => (
                <div key={plan.id} className="bg-card border border-border rounded-2xl p-6 shadow-xl shadow-black/5 hover:border-primary/50 transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-2xl">{plan.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${plan.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {plan.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6 flex-1">{plan.description}</p>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black">{plan.currency} {plan.price_monthly}</span>
                      <span className="text-xs text-muted-foreground font-bold">/mo</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="w-full py-3 rounded-xl bg-muted text-foreground font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <Edit size={16} /> Edit Plan
                  </button>
                </div>
              ))}
            </div>

            {/* Editor Modal Overlay */}
            {editingPlan && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                <div className="bg-card border border-border rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  <h3 className="text-2xl font-black mb-6">{editingPlan.id === 'new' ? 'Create Pricing Plan' : 'Edit Pricing Plan'}</h3>

                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Plan Name</span>
                      <input
                        type="text"
                        value={editingPlan.name}
                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Description</span>
                      <textarea
                        value={editingPlan.description || ''}
                        onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium resize-none h-24"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Monthly Price</span>
                        <input
                          type="number"
                          value={editingPlan.price_monthly}
                          onChange={(e) => setEditingPlan({ ...editingPlan, price_monthly: Number(e.target.value) })}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Yearly Price</span>
                        <input
                          type="number"
                          value={editingPlan.price_yearly}
                          onChange={(e) => setEditingPlan({ ...editingPlan, price_yearly: Number(e.target.value) })}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Currency (e.g., USD, INR)</span>
                      <input
                        type="text"
                        value={editingPlan.currency}
                        onChange={(e) => setEditingPlan({ ...editingPlan, currency: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium uppercase"
                        maxLength={3}
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Features (comma separated)</span>
                      <textarea
                        value={Array.isArray(editingPlan.features) ? editingPlan.features.join(', ') : ''}
                        onChange={(e) => setEditingPlan({ ...editingPlan, features: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium resize-none h-24"
                        placeholder="Feature 1, Feature 2, Feature 3"
                      />
                    </label>

                    <div className="flex items-center gap-6 py-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={editingPlan.is_active}
                          onChange={(e) => setEditingPlan({ ...editingPlan, is_active: e.target.checked })}
                          className="w-5 h-5 rounded text-primary focus:ring-primary border-border bg-background"
                        />
                        <label htmlFor="isActive" className="font-bold text-sm">Active</label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isPopular"
                          checked={editingPlan.is_popular}
                          onChange={(e) => setEditingPlan({ ...editingPlan, is_popular: e.target.checked })}
                          className="w-5 h-5 rounded text-primary focus:ring-primary border-border bg-background"
                        />
                        <label htmlFor="isPopular" className="font-bold text-sm">Popular Plan</label>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4 mt-6 border-t border-border">
                      <button
                        onClick={() => setEditingPlan(null)}
                        className="flex-1 py-3 px-6 rounded-xl font-bold bg-muted text-foreground hover:bg-muted/80 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={savePricingPlan}
                        className="flex-1 py-3 px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                      >
                        <Save size={18} /> Save Plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
