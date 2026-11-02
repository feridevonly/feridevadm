"use client";

import { useEffect, useState } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles, Settings2 } from "lucide-react";
import { Auth } from "../components/Auth";
import { Dashboard } from "../components/Dashboard";
import { AdminPanel } from "../components/AdminPanel";
import { getSupabase } from "../lib/supabase";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openAuth, setOpenAuth] = useState(false);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    try {
      const supabase = getSupabase();
      const load = async () => {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        if (data.session?.user) {
          const { data: p } = await supabase.from("profiles").select("id,email,role").eq("id", data.session.user.id).maybeSingle();
          setProfile(p);
        }
        setLoading(false);
      };
      load();
      const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); if (!nextSession) { setProfile(null); setAdmin(false); } });
      return () => data.subscription.unsubscribe();
    } catch { setLoading(false); }
  }, []);

  if (loading) return <main className="min-h-screen bg-black" />;
  if (session && profile?.role === "admin" && admin) return <AdminPanel onClose={() => setAdmin(false)} />;
  if (session) return <><Dashboard />{profile?.role === "admin" && <button onClick={()=>setAdmin(true)} className="fixed right-4 top-4 z-40 rounded-full bg-[#171717] p-3 text-white/60"><Settings2 size={16}/></button>}</>;

  return <main className="min-h-screen bg-black px-5 py-6"><div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-md flex-col justify-between">
    <header className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#191919]"><LockKeyhole size={19}/></div><div><b className="text-sm">FeriVault</b><div className="text-[11px] text-white/35">Private vault</div></div></header>
    <section className="py-10"><div className="mb-5 flex items-center gap-2 text-[11px] text-white/45"><ShieldCheck size={14}/> Secure personal storage</div><h1 className="text-[45px] font-light leading-[1.02] tracking-[-.045em]">Your data,<br/><span className="text-white/45">safely secured.</span></h1><p className="mt-5 max-w-[310px] text-[13px] leading-6 text-white/45">Store, manage, and protect your private data in one place.</p><button onClick={()=>setOpenAuth(true)} className="mt-8 flex w-full items-center justify-between rounded-full bg-white px-5 py-4 text-[13px] font-semibold text-black">Get Started <ArrowRight size={17}/></button></section>
    <div className="card p-5"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#252525] p-3"><Sparkles size={17}/></div><div><b className="text-xs">Private by design</b><div className="mt-1 text-[11px] text-white/35">Built for your personal vault.</div></div></div></div>
  </div>{openAuth && <Auth onClose={()=>setOpenAuth(false)}/>}</main>;
}
