"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, KeyRound, LockKeyhole, MessageCircle, X } from "lucide-react";
import { getSupabase } from "../lib/supabase";

export function Auth({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const supabase = getSupabase();
      if (mode === "register") {
        const { data: tokenData, error: tokenError } = await supabase.rpc("prepare_signup", { p_code: referral.trim() });
        if (tokenError) throw tokenError;
        const signup = tokenData?.[0] ?? tokenData;
        if (!signup?.signup_token) throw new Error("Kode referral tidak valid atau sudah habis.");
        const { error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { signup_token: signup.signup_token } }
        });
        if (error) throw error;
        setMessage(signup.role === "admin" ? "Akun admin berhasil dibuat. Silakan login." : "Akun berhasil dibuat. Silakan login.");
        setMode("login");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
        if (error) throw error;
        setMessage("Link reset password sudah dikirim ke email jika akun tersebut tersedia.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (err: any) { setMessage(err?.message || "Terjadi kesalahan."); }
    finally { setBusy(false); }
  }

  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent("Halo FeriDev, saya mau minta kode referral FeriVault.")}`;

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 p-3">
    <div className="w-full max-w-md rounded-[30px] border border-[#292929] bg-[#111] p-5">
      <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#202020] p-3"><LockKeyhole size={18}/></div><div><b>{mode === "login" ? "Welcome back" : mode === "register" ? "Create account" : "Reset password"}</b><div className="text-[11px] text-white/35">FeriVault</div></div></div><button onClick={onClose} className="rounded-full bg-[#202020] p-2"><X size={18}/></button></div>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        {mode !== "reset" && <input className="input" type="password" minLength={8} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />}
        {mode === "register" && <><input className="input" placeholder="Referral" value={referral} onChange={e=>setReferral(e.target.value)} required /><a href={waUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-[#191919] p-3 text-xs text-white/65"><MessageCircle size={15}/> Get Code via WhatsApp</a></>}
        {message && <div className="rounded-2xl bg-[#191919] p-3 text-xs text-white/55">{message}</div>}
        <button disabled={busy} className="w-full rounded-full bg-white py-4 text-sm font-semibold text-black">{busy ? "Please wait..." : mode === "login" ? "Login" : mode === "register" ? "Daftar" : "Kirim Reset Link"}</button>
      </form>
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/40">{mode === "login" && <button onClick={()=>{setMode("register");setMessage("")}}>Daftar</button>}{mode === "login" && <button onClick={()=>{setMode("reset");setMessage("")}} className="flex items-center gap-1"><KeyRound size={13}/> Reset password</button>}{mode !== "login" && <button onClick={()=>{setMode("login");setMessage("")}} className="flex items-center gap-1"><ArrowLeft size={13}/> Kembali login</button>}</div>
    </div>
  </div>;
}
