"use client";

import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Mail,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  Circle,
  Search,
  ArrowUpRight,
  Sparkles,
  Inbox,
  Trash2,
  RefreshCw,
  MoreHorizontal,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/* ─── Mock data ─────────────────────────────────────────────── */

const DONUT_DATA = [
  { name: "Normal", value: 38, color: "#6366f1" },
  { name: "Newsletter", value: 27, color: "#a855f7" },
  { name: "Spam", value: 12, color: "#ec4899" },
  { name: "Bills", value: 13, color: "#8b5cf6" },
  { name: "Promotions", value: 10, color: "#c084fc" },
];

const FLOW_DATA = [
  { day: "Mon", normal: 42, newsletter: 18, spam: 4 },
  { day: "Tue", normal: 55, newsletter: 22, spam: 6 },
  { day: "Wed", normal: 38, newsletter: 14, spam: 3 },
  { day: "Thu", normal: 61, newsletter: 30, spam: 8 },
  { day: "Fri", normal: 48, newsletter: 20, spam: 5 },
  { day: "Sat", normal: 29, newsletter: 10, spam: 2 },
  { day: "Sun", normal: 33, newsletter: 12, spam: 3 },
];

const BAR_DATA = [
  { cat: "Spam", value: 12, color: "#ec4899" },
  { cat: "Promos", value: 28, color: "#a855f7" },
  { cat: "Updates", value: 19, color: "#6366f1" },
  { cat: "Social", value: 8, color: "#8b5cf6" },
  { cat: "Personal", value: 41, color: "#c084fc" },
];

const TASKS = [
  { id: 1, label: "Review Junk Emails", done: true, count: 7, icon: ShieldAlert, color: "text-pink-400" },
  { id: 2, label: "Check new Subscriptions", done: false, count: 3, icon: CreditCard, color: "text-violet-400" },
  { id: 3, label: "Review Bills", done: false, count: 2, icon: Mail, color: "text-indigo-400" },
  { id: 4, label: "Clean old Promotions", done: false, count: 18, icon: Trash2, color: "text-purple-400" },
  { id: 5, label: "Sync Inbox", done: true, count: 0, icon: RefreshCw, color: "text-emerald-400" },
];

const EMAILS = [
  {
    id: 1,
    name: "Amazon",
    initials: "AM",
    subject: "Your order has shipped!",
    tag: "Billing",
    tagColor: "bg-indigo-500/20 text-indigo-300",
    gradient: "from-orange-500 to-amber-600",
    time: "2m ago",
  },
  {
    id: 2,
    name: "Netflix",
    initials: "NF",
    subject: "New arrivals this week",
    tag: "Newsletter",
    tagColor: "bg-violet-500/20 text-violet-300",
    gradient: "from-red-600 to-rose-700",
    time: "18m ago",
  },
  {
    id: 3,
    name: "GitHub",
    initials: "GH",
    subject: "Security alert on your repo",
    tag: "Alert",
    tagColor: "bg-pink-500/20 text-pink-300",
    gradient: "from-slate-600 to-slate-700",
    time: "1h ago",
  },
  {
    id: 4,
    name: "Spotify",
    initials: "SP",
    subject: "Your monthly recap is ready",
    tag: "Promo",
    tagColor: "bg-emerald-500/20 text-emerald-300",
    gradient: "from-green-500 to-emerald-600",
    time: "3h ago",
  },
];

const SUBS = [
  { name: "Spotify", price: "€9.99", interval: "/ month", icon: "🎵", color: "bg-green-500/10 border-green-500/20" },
  { name: "Netflix", price: "€15.99", interval: "/ month", icon: "🎬", color: "bg-red-500/10 border-red-500/20" },
  { name: "GitHub Pro", price: "€4.00", interval: "/ month", icon: "💻", color: "bg-slate-500/10 border-slate-500/20" },
  { name: "Figma", price: "€12.00", interval: "/ month", icon: "🎨", color: "bg-purple-500/10 border-purple-500/20" },
];

/* ─── Custom tooltip ─────────────────────────────────────────── */

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d1a]/90 backdrop-blur-md px-3 py-2 text-xs shadow-xl">
      {label && <p className="mb-1 font-medium text-white/60">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

/* ─── Glass card wrapper ────────────────────────────────────── */

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm shadow-xl shadow-black/30 overflow-hidden transition-all duration-300 hover:border-violet-500/20 hover:shadow-violet-900/20 ${className}`}
    >
      {/* subtle inner glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent" />
      {children}
    </div>
  );
}

/* ─── KPI strip ─────────────────────────────────────────────── */

function KpiStrip({ stats }: { stats: { newsletters: number; spam: number; subs: number; total: number } }) {
  const items = [
    { label: "Newsletter", value: stats.newsletters, icon: Mail, color: "from-violet-500 to-indigo-600", glow: "shadow-violet-900/40" },
    { label: "Spam Risks", value: stats.spam, icon: ShieldAlert, color: "from-pink-500 to-rose-600", glow: "shadow-pink-900/40" },
    { label: "Subscriptions", value: stats.subs, icon: CreditCard, color: "from-purple-500 to-violet-600", glow: "shadow-purple-900/40" },
    { label: "Total Mails", value: stats.total, icon: TrendingUp, color: "from-indigo-500 to-blue-600", glow: "shadow-indigo-900/40" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <GlassCard key={item.label} className="p-4 group cursor-default">
            <div className="flex items-start justify-between mb-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-lg ${item.glow}`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-white tabular-nums">{item.value}</p>
            <p className="text-xs text-white/40 mt-0.5">{item.label}</p>
          </GlassCard>
        );
      })}
    </div>
  );
}

/* ─── Donut card ─────────────────────────────────────────────── */

function DonutCard() {
  const total = DONUT_DATA.reduce((s, d) => s + d.value, 0);

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest">AI Mail Report</p>
          <h3 className="font-semibold text-white mt-0.5">Mail Distribution</h3>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15">
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Chart */}
        <div className="relative shrink-0">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={DONUT_DATA}
                cx={55}
                cy={55}
                innerRadius={36}
                outerRadius={52}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {DONUT_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-bold text-white">{total}</span>
            <span className="text-[10px] text-white/40">mails</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {DONUT_DATA.map((d) => (
            <div key={d.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-white/60">{d.name}</span>
              </div>
              <span className="text-xs font-semibold text-white">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

/* ─── Line chart card ────────────────────────────────────────── */

function FlowCard() {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest">Weekly</p>
          <h3 className="font-semibold text-white mt-0.5">Mail Flow</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-white/40">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-400 inline-block" />Normal</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-pink-400 inline-block" />Newsletter</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-400 inline-block" />Spam</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={110}>
        <LineChart data={FLOW_DATA} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Line type="monotone" dataKey="normal" stroke="#a78bfa" strokeWidth={2} dot={false} name="Normal" />
          <Line type="monotone" dataKey="newsletter" stroke="#f472b6" strokeWidth={2} dot={false} name="Newsletter" />
          <Line type="monotone" dataKey="spam" stroke="#818cf8" strokeWidth={2} dot={false} name="Spam" />
        </LineChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}

/* ─── Bar chart card ─────────────────────────────────────────── */

function ActivityCard() {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest">Breakdown</p>
          <h3 className="font-semibold text-white mt-0.5">Email Activity</h3>
        </div>
        <Zap className="h-4 w-4 text-violet-400" />
      </div>
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={BAR_DATA} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={18}>
          <XAxis dataKey="cat" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Count">
            {BAR_DATA.map((entry) => (
              <Cell key={entry.cat} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}

/* ─── Tasks card ─────────────────────────────────────────────── */

function TasksCard() {
  const done = TASKS.filter((t) => t.done).length;

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest">Today</p>
          <h3 className="font-semibold text-white mt-0.5">Inbox Tasks</h3>
        </div>
        <span className="text-[10px] font-medium text-white/30 bg-white/5 rounded-full px-2 py-0.5">{done}/{TASKS.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/5 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-700"
          style={{ width: `${(done / TASKS.length) * 100}%` }}
        />
      </div>

      <ul className="space-y-2.5">
        {TASKS.map((task) => {
          const Icon = task.icon;
          return (
            <li key={task.id} className="flex items-center gap-3 group">
              {task.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-400" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-white/20 group-hover:text-white/40 transition-colors" />
              )}
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]`}>
                <Icon className={`h-3 w-3 ${task.color}`} />
              </div>
              <span className={`flex-1 text-xs ${task.done ? "line-through text-white/30" : "text-white/70"}`}>
                {task.label}
              </span>
              {task.count > 0 && (
                <span className="text-[10px] font-semibold text-white/30 bg-white/5 rounded-full px-1.5 py-0.5">
                  {task.count}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}

/* ─── Inbox card ─────────────────────────────────────────────── */

function InboxCard() {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">Inboxes</h3>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[9px] font-bold text-white">
            {EMAILS.length}
          </span>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
          <Inbox className="h-3.5 w-3.5 text-white/40" />
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20 pointer-events-none" />
        <input
          className="w-full h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] pl-7 pr-2 text-xs text-white/50 placeholder:text-white/20 focus:outline-none focus:border-violet-500/40"
          placeholder="Search…"
          readOnly
        />
      </div>

      <ul className="space-y-1">
        {EMAILS.map((mail) => (
          <li
            key={mail.id}
            className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-white/[0.04] cursor-pointer transition-colors group"
          >
            <div className={`h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br ${mail.gradient} flex items-center justify-center text-[10px] font-bold text-white shadow-md`}>
              {mail.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-semibold text-white/80 truncate">{mail.name}</p>
                <span className="text-[10px] text-white/25 shrink-0">{mail.time}</span>
              </div>
              <p className="text-[11px] text-white/40 truncate mt-0.5">{mail.subject}</p>
            </div>
            <span className={`shrink-0 self-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${mail.tagColor}`}>
              {mail.tag}
            </span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

/* ─── Subscriptions card ─────────────────────────────────────── */

function SubsCard() {
  const total = SUBS.reduce((s, sub) => s + parseFloat(sub.price.replace("€", "")), 0);

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest">Active</p>
          <h3 className="font-semibold text-white mt-0.5">Subscriptions</h3>
        </div>
        <MoreHorizontal className="h-4 w-4 text-white/20" />
      </div>

      {/* Total cost */}
      <div className="my-4 rounded-xl bg-gradient-to-r from-violet-600/20 to-pink-600/10 border border-violet-500/15 p-3">
        <p className="text-[10px] text-white/40 uppercase tracking-wider">Monthly total</p>
        <p className="text-2xl font-bold text-white mt-0.5">€{total.toFixed(2)}</p>
        <p className="text-[10px] text-white/30 mt-0.5">{SUBS.length} active services</p>
      </div>

      <ul className="space-y-2">
        {SUBS.map((sub) => (
          <li
            key={sub.name}
            className={`flex items-center gap-3 rounded-xl border p-2.5 ${sub.color} hover:bg-white/5 cursor-pointer transition-colors`}
          >
            <span className="text-lg leading-none">{sub.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/80">{sub.name}</p>
              <p className="text-[10px] text-white/30">{sub.interval}</p>
            </div>
            <span className="text-xs font-bold text-white/70">{sub.price}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

/* ─── Main export ────────────────────────────────────────────── */

interface DashboardOverviewProps {
  firstName: string;
  stats: {
    newsletters: number;
    spam: number;
    subs: number;
    total: number;
  };
}

export function DashboardOverview({ firstName, stats }: DashboardOverviewProps) {
  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Overview</p>
          <h1 className="text-2xl font-bold text-white">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              {firstName}
            </span>{" "}
            👋
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Badge className="bg-violet-500/10 border-violet-500/20 text-violet-300 text-[10px] px-2 py-0.5 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 mr-1.5 inline-block animate-pulse" />
            AI Analysis Active
          </Badge>
        </div>
      </div>

      {/* KPI strip */}
      <KpiStrip stats={stats} />

      {/* Row 1: Donut · Line · Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DonutCard />
        <FlowCard />
        <ActivityCard />
      </div>

      {/* Row 2: Tasks · Inbox · Subscriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TasksCard />
        <InboxCard />
        <SubsCard />
      </div>
    </div>
  );
}
