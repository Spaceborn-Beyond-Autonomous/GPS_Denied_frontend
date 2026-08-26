'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, Network, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'signup';

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isSignup = mode === 'signup';
  const [form, setForm] = useState({ name: '', organization: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${mode === 'signup' ? 'signup' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed.');
      router.push('/dashboard');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden border border-slate-800 bg-slate-950/70 shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden border-r border-slate-800 bg-slate-900/60 p-10 lg:flex lg:flex-col lg:justify-between">
            <Link href="/" className="flex items-center gap-3 text-white">
              <span className="flex h-9 w-9 items-center justify-center border border-cyan-400/40 bg-cyan-400/10 text-cyan-300"><Network className="h-4 w-4" /></span>
              <span className="text-sm font-bold uppercase tracking-[0.24em]">SpaceBorn</span>
            </Link>
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">NAV-TESTING PLATFORM</p>
              <h1 className="max-w-sm text-4xl font-bold tracking-tight text-white">Make every denied signal measurable.</h1>
              <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">Run repeatable autonomy evaluations across GPS-denied environments with one operational workspace.</p>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">SYSTEM // ACCESS GATEWAY</p>
          </section>

          <section className="p-7 sm:p-10">
            <div className="mb-8 lg:hidden"><span className="text-sm font-bold uppercase tracking-[0.24em] text-white">SpaceBorn</span></div>
            <div className="mb-8">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Workspace access</p>
              <h2 className="text-2xl font-bold tracking-tight text-white">{isSignup ? 'Create your operator account' : 'Sign in to SpaceBorn'}</h2>
              <p className="mt-2 text-sm text-slate-400">{isSignup ? 'Provision a workspace for your navigation team.' : 'Continue to your navigation testing workspace.'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && <><Field label="Full name" icon={<UserRound />} value={form.name} onChange={(value) => updateField('name', value)} /><Field label="Organization" icon={<Network />} value={form.organization} onChange={(value) => updateField('organization', value)} /></>}
              <Field label="Work email" type="email" icon={<Mail />} value={form.email} onChange={(value) => updateField('email', value)} />
              <Field label="Password" type="password" icon={<LockKeyhole />} value={form.password} onChange={(value) => updateField('password', value)} minLength={8} />
              {error && <p role="alert" className="border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</p>}
              <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-60">
                {isSubmitting ? 'Connecting...' : isSignup ? 'Create account' : 'Sign in'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-7 text-center text-xs text-slate-500">{isSignup ? 'Already have an account?' : 'New to SpaceBorn?'} <Link href={isSignup ? '/login' : '/signup'} className="font-bold text-slate-200 hover:text-cyan-300">{isSignup ? 'Sign in' : 'Create an account'}</Link></p>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, type = 'text', icon, value, onChange, minLength }: { label: string; type?: string; icon: React.ReactNode; value: string; onChange: (value: string) => void; minLength?: number }) {
  return <label className="block space-y-2"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span><span className="relative block"><span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-600">{icon}</span><input required type={type} value={value} minLength={minLength} onChange={(event) => onChange(event.target.value)} className="w-full border border-slate-800 bg-slate-900/80 px-3 py-3 pl-10 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30" /></span></label>;
}