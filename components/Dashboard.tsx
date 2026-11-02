"use client";

import { useState } from "react";
import { FileText, Image, KeyRound, Mail, Plus, Search, Smartphone, Wifi, LogOut, X, ShieldCheck } from "lucide-react";
import { getSupabase } from "../lib/supabase";

const types: any[] = [
  ["password", "Passwords", KeyRound],
  ["email", "Email", Mail],
  ["phone", "Numbers", Smartphone],
  ["wifi", "WiFi", Wifi],
  ["photo", "Photos", Image],
  ["text", "Notes", FileText]
];

export function Dashboard() {
  const [add, setAdd] = useState(false);
  const [type, setType] = useState("password");
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<any[]>([]);

  function save() {
    if (!title.trim()) return;
    setItems([{ title, type }, ...items]);
    setTitle("");
    setAdd(false);
  }

  async function logout() {
    try { await getSupabase().auth.signOut(); } catch {}
  }

  return (
    <main className="min-h-screen bg-black px-4 pb-28 pt-6">
      <div className="mx-auto max-w-md">
        <header className="flex items-center justify-between">
          <div>
            <div className="text-[11px] text-white/35">FeriVault</div>
            <h1 className="mt-1 text-[27px] font-medium tracking-[-.03em]">Keep your life safe 🔒</h1>
          </div>
          <button onClick={logout} className="rounded-full bg-[#171717] p-3"><LogOut size={17} /></button>
        </header>

        <div className="card mt-5 p-4">
          <div className="flex items-center gap-3 text-white/35"><Search size={17} /><span className="text-[12px]">Search your vault</span></div>
        </div>

        <div className="card mt-4 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#242424] p-3"><ShieldCheck size={18} /></div>
            <div className="flex-1"><div className="text-xs text-white/40">Vault security</div><div className="mt-1 text-sm">Protected</div></div>
            <div className="h-2 w-20 rounded-full bg-[#292929]"><div className="h-2 w-[78%] rounded-full bg-white" /></div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {types.map(([key, name, Icon]) => (
            <button key={key} onClick={() => { setType(key); setAdd(true); }} className="card p-4 text-left">
              <div className="mb-8 flex items-center justify-between"><Icon size={19} /><Plus size={15} className="text-white/25" /></div>
              <div className="text-sm">{name}</div>
              <div className="mt-1 text-[11px] text-white/30">{items.filter(x => x.type === key).length} saved</div>
            </button>
          ))}
        </div>

        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between"><b className="text-sm">Today</b><span className="text-[11px] text-white/30">See all</span></div>
          {items.length === 0 ? (
            <div className="card p-7 text-center text-xs text-white/30">Your vault is empty.<br />Add your first item below.</div>
          ) : items.map((item, index) => {
            const Icon = (types.find(t => t[0] === item.type) || types[0])[2];
            return <div key={index} className="card mb-2 flex items-center gap-3 p-4"><div className="rounded-2xl bg-[#242424] p-3"><Icon size={16} /></div><div><b className="text-sm">{item.title}</b><div className="text-[11px] text-white/30">{item.type}</div></div></div>;
          })}
        </div>
      </div>

      <button onClick={() => setAdd(true)} className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-6 py-4 text-[13px] font-semibold text-black shadow-2xl"><Plus size={18} /> Add</button>

      {add && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-3">
          <div className="w-full max-w-md rounded-[30px] border border-[#292929] bg-[#111] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div><b>Add {types.find(t => t[0] === type)?.[1]}</b><div className="mt-1 text-[11px] text-white/35">Choose how long to keep it.</div></div>
              <button onClick={() => setAdd(false)} className="rounded-full bg-[#202020] p-2"><X size={18} /></button>
            </div>
            <input className="input" placeholder="Name / title" value={title} onChange={e => setTitle(e.target.value)} />
            <div className="mt-3 grid grid-cols-3 gap-2">{types.map(([key, name]) => <button key={key} onClick={() => setType(key)} className={"rounded-2xl p-3 text-[11px] " + (type === key ? "bg-white text-black" : "bg-[#191919] text-white/50")}>{name}</button>)}</div>
            <div className="mt-4 grid grid-cols-3 gap-2">{["1 Day","7 Days","30 Days","90 Days","1 Year","Lifetime"].map(x => <button key={x} className="rounded-2xl bg-[#191919] p-3 text-[11px] text-white/55">{x}</button>)}</div>
            <button onClick={save} className="mt-4 w-full rounded-full bg-white py-4 text-sm font-semibold text-black">Save securely</button>
          </div>
        </div>
      )}
    </main>
  );
}