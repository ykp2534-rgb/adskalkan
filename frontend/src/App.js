import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Shield, ShieldCheck, ShieldX, Users, Globe,
  TrendingUp, TrendingDown, Activity, Eye,
  BarChart3, Zap, AlertTriangle, CheckCircle,
  XCircle, Clock, Calendar, Filter, Download, RefreshCw, Settings,
  ChevronRight, ChevronDown, ChevronUp, Menu, LogOut, User,
  Plus, Trash2, Search, Layers,
  Smartphone, Laptop, Tablet, MapPin,
  MousePointer, Timer, MoreVertical,
  Ban, Bot, CircleDollarSign, ShieldBan, Play, Phone,
  ArrowUpRight, ArrowDownRight, Monitor,
  LayoutDashboard, ChevronLeft, PieChart
} from "lucide-react";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ==================== COMPONENTS ====================

// Animated Number
const AnimatedNumber = ({ value, prefix = "", suffix = "" }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = parseFloat(value) || 0;
    let current = 0;
    const step = target / 25;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setDisplay(target); clearInterval(timer); }
      else { setDisplay(Math.floor(current)); }
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display.toLocaleString('tr-TR')}{suffix}</span>;
};

// Live Pulse
const LivePulse = () => (
  <span className="relative flex h-2.5 w-2.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
  </span>
);

// KPI Card with Mini Bar Chart
const KPICard = ({ title, value, prefix = "", suffix = "", change, changeType, icon: Icon, color, chartData = [] }) => {
  const colors = {
    red: { bg: "#dc262615", border: "#dc262630", icon: "#dc2626", chart: "#dc2626" },
    orange: { bg: "#ea580c15", border: "#ea580c30", icon: "#ea580c", chart: "#ea580c" },
    green: { bg: "#16a34a15", border: "#16a34a30", icon: "#16a34a", chart: "#16a34a" },
    purple: { bg: "#9333ea15", border: "#9333ea30", icon: "#9333ea", chart: "#9333ea" },
    blue: { bg: "#2563eb15", border: "#2563eb30", icon: "#2563eb", chart: "#2563eb" },
    cyan: { bg: "#0891b215", border: "#0891b230", icon: "#0891b2", chart: "#0891b2" },
  };
  const c = colors[color] || colors.blue;
  const maxVal = Math.max(...chartData, 1);
  
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${c.icon}20` }}>
          <Icon className="h-5 w-5" style={{ color: c.icon }} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${changeType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {changeType === 'up' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {change}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
      </div>
      <div className="text-sm text-gray-500">{title}</div>
      {chartData.length > 0 && (
        <div className="flex items-end gap-1 h-8 mt-3">
          {chartData.map((val, i) => (
            <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${(val / maxVal) * 100}%`, backgroundColor: c.chart, opacity: 0.5 + (i / chartData.length) * 0.5 }} />
          ))}
        </div>
      )}
    </div>
  );
};

// Donut Chart
const DonutChart = ({ data, size = 140 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <div className="text-gray-600 text-center py-8">Veri yok</div>;
  
  let currentAngle = -90;
  const r = 40, cx = 50, cy = 50;
  
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {data.map((item, idx) => {
          if (item.value === 0) return null;
          const pct = item.value / total;
          const angle = pct * 360;
          const start = currentAngle;
          currentAngle += angle;
          const startRad = (start * Math.PI) / 180;
          const endRad = ((start + angle) * Math.PI) / 180;
          const x1 = cx + r * Math.cos(startRad);
          const y1 = cy + r * Math.sin(startRad);
          const x2 = cx + r * Math.cos(endRad);
          const y2 = cy + r * Math.sin(endRad);
          const largeArc = angle > 180 ? 1 : 0;
          return <path key={idx} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={item.color} />;
        })}
        <circle cx={cx} cy={cy} r="28" fill="#0a0a0a" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="12" fontWeight="bold">{total}</text>
      </svg>
      <div className="flex flex-wrap justify-center gap-3 mt-3 text-xs">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-gray-400">{item.label}:</span>
            <span className="text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Progress Bar
const ProgressBar = ({ label, value, total, color }) => {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{value} <span className="text-gray-600">({Math.round(pct)}%)</span></span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

// Risk Badge
const RiskBadge = ({ level, score }) => {
  const styles = {
    critical: { bg: "#dc262620", color: "#dc2626", border: "#dc262640" },
    high: { bg: "#ea580c20", color: "#ea580c", border: "#ea580c40" },
    medium: { bg: "#ca8a0420", color: "#ca8a04", border: "#ca8a0440" },
    low: { bg: "#16a34a20", color: "#16a34a", border: "#16a34a40" },
  };
  const s = styles[level] || styles.low;
  return (
    <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {score}
    </span>
  );
};

// Device Icon
const DeviceIcon = ({ type }) => {
  if (type === 'mobile') return <Smartphone className="h-4 w-4 text-gray-500" />;
  if (type === 'tablet') return <Tablet className="h-4 w-4 text-gray-500" />;
  return <Laptop className="h-4 w-4 text-gray-500" />;
};

// Data Table
const DataTable = ({ columns, data, title, actions, onRowAction }) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');
  
  const filtered = data.filter(row => Object.values(row).some(val => String(val).toLowerCase().includes(search.toLowerCase())));
  const sorted = sortKey ? [...filtered].sort((a, b) => {
    const aVal = a[sortKey], bVal = b[sortKey];
    const mod = sortDir === 'asc' ? 1 : -1;
    return typeof aVal === 'number' ? (aVal - bVal) * mod : String(aVal).localeCompare(String(bVal)) * mod;
  }) : filtered;
  
  return (
    <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="font-semibold text-white">{title}</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
            <input type="text" placeholder="Ara..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-black border border-gray-800 rounded-lg text-sm text-white w-48 focus:border-gray-700 outline-none" />
          </div>
          {actions}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black/50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} onClick={() => col.sortable && (setSortKey(col.key), setSortDir(sortKey === col.key && sortDir === 'desc' ? 'asc' : 'desc'))}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase ${col.sortable ? 'cursor-pointer hover:text-gray-400' : ''}`}>
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {sorted.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm">
                    {col.render ? col.render(row[col.key], row, onRowAction) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length === 0 && <div className="p-8 text-center text-gray-600">Veri bulunamadı</div>}
    </div>
  );
};

// ==================== PAGES ====================

// Landing Page - Siyah
const LandingPage = ({ onLogin, onRegister }) => (
  <div className="min-h-screen bg-black text-white">
    <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <Shield className="h-8 w-8 text-blue-500" />
        <span className="text-xl font-bold">AdsKalkan</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onLogin} className="px-4 py-2 text-gray-400 hover:text-white">Giriş</button>
        <button onClick={onRegister} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium">Başla</button>
      </div>
    </nav>
    
    <header className="max-w-5xl mx-auto px-8 py-16 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-blue-600/30 rounded-full text-blue-400 text-sm mb-6">
        <Zap className="h-4 w-4" /> AI Koruma <LivePulse />
      </div>
      <h1 className="text-5xl font-bold mb-5">
        Google Ads Bütçenizi<br/>
        <span className="text-blue-500">Sahte Tıklamalardan</span> Koruyun
      </h1>
      <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
        Gelişmiş AI ile bot trafiğini, click farm saldırılarını gerçek zamanlı tespit edin.
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={onRegister} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium flex items-center gap-2">
          <Play className="h-4 w-4" /> Canlı Demo
        </button>
        <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-gray-800 rounded-lg font-medium flex items-center gap-2">
          <Phone className="h-4 w-4" /> İletişim
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto mt-12">
        {[
          { icon: Bot, value: "10M+", label: "Engellenen Bot", color: "#dc2626" },
          { icon: Users, value: "500+", label: "Müşteri", color: "#2563eb" },
          { icon: ShieldCheck, value: "%99.9", label: "Doğruluk", color: "#16a34a" },
          { icon: CircleDollarSign, value: "₺2.5M", label: "Tasarruf", color: "#ca8a04" },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
            <s.icon className="h-6 w-6 mb-2 mx-auto" style={{ color: s.color }} />
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
    </header>
  </div>
);

// Login Page
const LoginPage = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onSuccess(res.data.user);
    } catch (err) {
      setError(err.response?.data?.detail || "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-gray-800 rounded-xl p-6">
        <button onClick={onBack} className="text-gray-500 hover:text-white mb-4 flex items-center gap-1 text-sm">
          <ChevronLeft className="h-4 w-4" /> Geri
        </button>
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-7 w-7 text-blue-500" />
          <span className="text-lg font-bold text-white">AdsKalkan</span>
        </div>
        <h1 className="text-xl font-bold text-white mb-1">Giriş Yap</h1>
        <p className="text-gray-500 text-sm mb-5">Hesabınıza giriş yapın</p>
        {error && <div className="bg-red-600/10 border border-red-600/30 text-red-500 px-3 py-2 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
            className="w-full px-4 py-2.5 bg-black border border-gray-800 rounded-lg text-white text-sm focus:border-gray-700 outline-none" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifre" required
            className="w-full px-4 py-2.5 bg-black border border-gray-800 rounded-lg text-white text-sm focus:border-gray-700 outline-none" />
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-white text-sm disabled:opacity-50">
            {loading ? "..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Register Page
const RegisterPage = ({ onBack }) => {
  const [form, setForm] = useState({ email: "", password: "", full_name: "", company_name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/auth/register`, form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Kayıt başarısız");
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 max-w-md">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Kayıt Başarılı!</h2>
          <p className="text-gray-500 text-sm mb-4">Yönetici onayından sonra giriş yapabilirsiniz.</p>
          <button onClick={onBack} className="px-5 py-2 bg-blue-600 rounded-lg text-sm text-white">Giriş'e Dön</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-gray-800 rounded-xl p-6">
        <button onClick={onBack} className="text-gray-500 hover:text-white mb-4 flex items-center gap-1 text-sm">
          <ChevronLeft className="h-4 w-4" /> Geri
        </button>
        <h1 className="text-xl font-bold text-white mb-1">Kayıt Ol</h1>
        <p className="text-gray-500 text-sm mb-5">7 gün ücretsiz</p>
        {error && <div className="bg-red-600/10 border border-red-600/30 text-red-500 px-3 py-2 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} placeholder="Ad Soyad *" required className="w-full px-4 py-2.5 bg-black border border-gray-800 rounded-lg text-white text-sm focus:border-gray-700 outline-none" />
          <input type="text" value={form.company_name} onChange={(e) => setForm({...form, company_name: e.target.value})} placeholder="Şirket" className="w-full px-4 py-2.5 bg-black border border-gray-800 rounded-lg text-white text-sm focus:border-gray-700 outline-none" />
          <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="Email *" required className="w-full px-4 py-2.5 bg-black border border-gray-800 rounded-lg text-white text-sm focus:border-gray-700 outline-none" />
          <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="Şifre *" required minLength={6} className="w-full px-4 py-2.5 bg-black border border-gray-800 rounded-lg text-white text-sm focus:border-gray-700 outline-none" />
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-white text-sm disabled:opacity-50">
            {loading ? "..." : "Kayıt Ol"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ==================== ADMIN DASHBOARD ====================
const AdminDashboard = ({ user, onLogout }) => {
  const [tab, setTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [users, setUsers] = useState([]);
  const [pools, setPools] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters for live monitoring
  const [filters, setFilters] = useState({ site: '', city: '', riskLevel: '', blocked: '' });
  
  const fetchAll = useCallback(async () => {
    try {
      const [d, v, u, p, s] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/visitors?limit=200"),
        api.get("/admin/users"),
        api.get("/admin/pools"),
        api.get("/admin/sites"),
      ]);
      setData(d.data);
      setVisitors(v.data.visitors || []);
      setUsers(u.data || []);
      setPools(p.data || []);
      setSites(s.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);
  
  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);
  
  // Block IP manually
  const handleBlockIP = async (ip, siteId) => {
    try {
      await api.post("/admin/blocked-ips", { ip_address: ip, reason: "Manuel engel", is_global: true });
      alert(`${ip} engellendi!`);
      fetchAll();
    } catch (err) {
      alert("Hata: " + (err.response?.data?.detail || err.message));
    }
  };
  
  const handleApproveUser = async (id) => {
    try { await api.put(`/admin/users/${id}/approve`); fetchAll(); } catch (err) { console.error(err); }
  };
  
  const menu = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "sites", label: "Siteler", icon: Globe },
    { id: "visitors", label: "Ziyaretçiler", icon: Eye },
    { id: "live", label: "Canlı İzleme", icon: Activity },
    { id: "users", label: "Kullanıcılar", icon: Users },
    { id: "pools", label: "Havuzlar", icon: Layers },
    { id: "blocked", label: "Engellenenler", icon: Ban },
    { id: "settings", label: "Ayarlar", icon: Settings },
  ];
  
  const riskData = data ? [
    { label: "Düşük", value: data.risk_distribution?.low || 0, color: "#16a34a" },
    { label: "Orta", value: data.risk_distribution?.medium || 0, color: "#ca8a04" },
    { label: "Yüksek", value: data.risk_distribution?.high || 0, color: "#ea580c" },
    { label: "Kritik", value: data.risk_distribution?.critical || 0, color: "#dc2626" },
  ] : [];
  
  const totalPoolBlocked = pools.reduce((s, p) => s + (p.blocked_ips?.length || 0), 0);
  const savings = data ? (data.blocked_visitors * 2.5) : 0;
  
  // Filter visitors for live view
  const filteredVisitors = visitors.filter(v => {
    if (filters.site && v.site_id !== filters.site) return false;
    if (filters.city && !v.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.riskLevel && v.risk_level !== filters.riskLevel) return false;
    if (filters.blocked === 'true' && !v.is_blocked) return false;
    if (filters.blocked === 'false' && v.is_blocked) return false;
    return true;
  });
  
  // Get site name by ID
  const getSiteName = (siteId) => {
    const site = sites.find(s => s.id === siteId);
    return site ? site.name : '-';
  };
  
  // Visitor columns with site info
  const visitorCols = [
    { key: 'ip_address', label: 'IP', sortable: true, render: (v) => <span className="font-mono text-white text-xs">{v}</span> },
    { key: 'site_id', label: 'Site', sortable: true, render: (v) => <span className="text-blue-400 text-xs">{getSiteName(v)}</span> },
    { key: 'city', label: 'Şehir', sortable: true, render: (v) => <span className="text-gray-400 text-xs">{v || '-'}</span> },
    { key: 'country', label: 'Ülke', sortable: true, render: (v) => <span className="text-gray-400 text-xs">{v || '-'}</span> },
    { key: 'device_type', label: 'Cihaz', sortable: true, render: (v) => <div className="flex items-center gap-1"><DeviceIcon type={v} /><span className="text-gray-400 text-xs">{v || '-'}</span></div> },
    { key: 'device_brand', label: 'Marka', sortable: true, render: (v, r) => <span className="text-gray-400 text-xs">{v || '-'} {r.device_model || ''}</span> },
    { key: 'browser', label: 'Tarayıcı', sortable: true, render: (v) => <span className="text-gray-400 text-xs">{v || '-'}</span> },
    { key: 'os', label: 'OS', sortable: true, render: (v) => <span className="text-gray-400 text-xs">{v || '-'}</span> },
    { key: 'time_on_page', label: 'Süre', sortable: true, render: (v) => <span className="text-gray-400 text-xs">{v || 0}s</span> },
    { key: 'risk_score', label: 'Risk', sortable: true, render: (v, r) => <RiskBadge level={r.risk_level} score={Math.round(v)} /> },
    { key: 'is_blocked', label: 'Durum', sortable: true, render: (v) => v ? <span className="text-red-500 text-xs flex items-center gap-1"><Ban className="h-3 w-3" />Engel</span> : <span className="text-green-500 text-xs flex items-center gap-1"><CheckCircle className="h-3 w-3" />İzin</span> },
    { key: 'created_at', label: 'Tarih', sortable: true, render: (v) => <span className="text-gray-600 text-xs">{new Date(v).toLocaleString('tr-TR')}</span> },
    { key: 'actions', label: '', render: (_, r, onAction) => !r.is_blocked && (
      <button onClick={() => onAction && onAction('block', r)} className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded text-xs flex items-center gap-1">
        <Ban className="h-3 w-3" /> Engelle
      </button>
    )},
  ];
  
  const siteCols = [
    { key: 'name', label: 'Site Adı', sortable: true, render: (v) => <span className="text-white font-medium">{v}</span> },
    { key: 'domain', label: 'Domain', sortable: true, render: (v) => <span className="text-blue-400">{v}</span> },
    { key: 'total_visitors', label: 'Tıklama', sortable: true, render: (v) => <span className="text-white">{v}</span> },
    { key: 'blocked_clicks', label: 'Engellenen', sortable: true, render: (v) => <span className="text-red-400">{v}</span> },
    { key: 'block_rate', label: 'Oran', sortable: true, render: (v) => <span className={parseFloat(v) > 50 ? 'text-red-400' : parseFloat(v) > 20 ? 'text-orange-400' : 'text-green-400'}>%{v}</span> },
  ];
  
  const siteStats = sites.map(s => ({
    ...s,
    block_rate: s.total_visitors > 0 ? ((s.blocked_clicks / s.total_visitors) * 100).toFixed(1) : '0',
  }));
  
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-14' : 'w-52'} bg-[#0a0a0a] border-r border-gray-800 flex flex-col transition-all flex-shrink-0`}>
        <div className="p-3 border-b border-gray-800 flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-500 flex-shrink-0" />
          {!collapsed && <span className="font-bold text-sm">AdsKalkan</span>}
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {menu.map((m) => (
            <button key={m.id} onClick={() => setTab(m.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${tab === m.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
              <m.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{m.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-800">
          <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-white/5">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-600/10 mt-1">
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Çıkış</span>}
          </button>
        </div>
      </aside>
      
      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-[#0a0a0a]/90 backdrop-blur border-b border-gray-800 px-5 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold">{menu.find(m => m.id === tab)?.label}</h1>
            <div className="flex items-center gap-3">
              <button onClick={fetchAll} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white">
                <RefreshCw className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600/10 border border-red-600/30 rounded-full">
                <LivePulse />
                <span className="text-xs text-red-400">Canlı</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-300 text-xs">{user?.full_name}</span>
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Dashboard */}
              {tab === "dashboard" && data && (
                <div className="space-y-5">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    <KPICard title="Bugün Engellenen Bot" value={data.today_blocked} icon={Bot} color="red" change={12} changeType="up" chartData={data.daily_stats?.slice(-7).map(d => d.blocked) || [1,2,3,4,5,6,7]} />
                    <KPICard title="Havuzdan Gelen Tehdit" value={totalPoolBlocked} icon={Layers} color="orange" chartData={[3, 5, 8, 6, 9, 7, 10]} />
                    <KPICard title="Tahmini Tasarruf" value={savings} prefix="₺" icon={CircleDollarSign} color="green" change={8} changeType="up" chartData={data.daily_stats?.slice(-7).map(d => d.blocked * 2.5) || []} />
                    <KPICard title="Aktif Engelli IP" value={data.total_blocked_ips} icon={ShieldBan} color="purple" chartData={[5, 8, 12, 15, 18, 22, data.total_blocked_ips]} />
                  </div>
                  
                  {/* Mini Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { icon: Eye, value: data.total_visitors, label: "Toplam Ziyaretçi", color: "#2563eb" },
                      { icon: Users, value: data.total_users, label: "Toplam Müşteri", color: "#16a34a" },
                      { icon: Globe, value: data.total_sites, label: "Aktif Site", color: "#0891b2" },
                      { icon: Clock, value: data.pending_users, label: "Onay Bekleyen", color: "#ea580c" },
                    ].map((s, i) => (
                      <div key={i} className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 flex items-center gap-3">
                        <s.icon className="h-5 w-5" style={{ color: s.color }} />
                        <div>
                          <div className="text-lg font-bold text-white">{s.value.toLocaleString('tr-TR')}</div>
                          <div className="text-xs text-gray-500">{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Charts */}
                  <div className="grid grid-cols-3 gap-5">
                    <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5">
                      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-purple-500" /> Risk Dağılımı
                      </h3>
                      <DonutChart data={riskData} size={130} />
                    </div>
                    <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5">
                      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-cyan-500" /> Şehir Dağılımı
                      </h3>
                      <div className="space-y-2.5">
                        {(data.city_distribution || []).slice(0, 5).map((c, i) => (
                          <ProgressBar key={i} label={c._id || 'Bilinmiyor'} value={c.count} total={data.city_distribution[0]?.count || 1} color={['#2563eb', '#9333ea', '#0891b2', '#16a34a', '#ea580c'][i]} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5">
                      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-blue-500" /> Cihaz Dağılımı
                      </h3>
                      <div className="space-y-2.5">
                        {(data.device_distribution || []).slice(0, 4).map((d, i) => (
                          <ProgressBar key={i} label={d._id || 'Bilinmiyor'} value={d.count} total={data.device_distribution[0]?.count || 1} color={['#16a34a', '#2563eb', '#ea580c', '#9333ea'][i]} />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Site Performance */}
                  <DataTable title="Site Performansı" columns={siteCols} data={siteStats}
                    actions={<button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs flex items-center gap-1"><Download className="h-3 w-3" /> Excel</button>} />
                  
                  {/* Recent Visitors */}
                  <DataTable title="Son Ziyaretçiler" columns={visitorCols.slice(0, -1)} data={visitors.slice(0, 8)}
                    actions={<button onClick={() => setTab('visitors')} className="text-blue-400 hover:text-blue-300 text-xs">Tümü →</button>} />
                </div>
              )}
              
              {/* Sites */}
              {tab === "sites" && (
                <DataTable title="Tüm Siteler" columns={siteCols} data={siteStats}
                  actions={<button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs flex items-center gap-1"><Download className="h-3 w-3" /> Excel</button>} />
              )}
              
              {/* Visitors */}
              {tab === "visitors" && (
                <DataTable title="Tüm Ziyaretçiler" columns={visitorCols} data={visitors}
                  onRowAction={(action, row) => action === 'block' && handleBlockIP(row.ip_address, row.site_id)}
                  actions={<button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs flex items-center gap-1"><Download className="h-3 w-3" /> Excel</button>} />
              )}
              
              {/* Live Monitoring */}
              {tab === "live" && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-400">Filtreler:</span>
                      </div>
                      <select value={filters.site} onChange={(e) => setFilters({...filters, site: e.target.value})}
                        className="px-3 py-1.5 bg-black border border-gray-800 rounded-lg text-sm text-white">
                        <option value="">Tüm Siteler</option>
                        {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <input type="text" placeholder="Şehir" value={filters.city} onChange={(e) => setFilters({...filters, city: e.target.value})}
                        className="px-3 py-1.5 bg-black border border-gray-800 rounded-lg text-sm text-white w-32" />
                      <select value={filters.riskLevel} onChange={(e) => setFilters({...filters, riskLevel: e.target.value})}
                        className="px-3 py-1.5 bg-black border border-gray-800 rounded-lg text-sm text-white">
                        <option value="">Tüm Risk</option>
                        <option value="critical">Kritik</option>
                        <option value="high">Yüksek</option>
                        <option value="medium">Orta</option>
                        <option value="low">Düşük</option>
                      </select>
                      <select value={filters.blocked} onChange={(e) => setFilters({...filters, blocked: e.target.value})}
                        className="px-3 py-1.5 bg-black border border-gray-800 rounded-lg text-sm text-white">
                        <option value="">Tüm Durum</option>
                        <option value="true">Engellenen</option>
                        <option value="false">İzin Verilen</option>
                      </select>
                      <button onClick={() => setFilters({ site: '', city: '', riskLevel: '', blocked: '' })}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-400">
                        Temizle
                      </button>
                    </div>
                  </div>
                  
                  {/* Live Feed */}
                  <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl">
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LivePulse />
                        <h3 className="font-semibold">Canlı Saldırı Akışı</h3>
                        <span className="text-xs text-gray-500">({filteredVisitors.length} sonuç)</span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-800/50 max-h-[calc(100vh-280px)] overflow-y-auto">
                      {filteredVisitors.slice(0, 50).map((v, i) => (
                        <div key={v.id || i} className="flex items-center gap-4 p-4 hover:bg-white/[0.02]">
                          <div className={`w-2 h-2 rounded-full ${v.risk_level === 'critical' || v.risk_level === 'high' ? 'bg-red-500' : v.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm text-white">{v.ip_address}</span>
                              <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded text-xs">{getSiteName(v.site_id)}</span>
                              {v.is_blocked && <span className="px-2 py-0.5 bg-red-600/20 text-red-400 rounded text-xs">ENGELLENDİ</span>}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.city || '-'}, {v.country || '-'}</span>
                              <span className="flex items-center gap-1"><DeviceIcon type={v.device_type} />{v.device_brand || '-'}</span>
                              <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{v.time_on_page || 0}s</span>
                              <span className="flex items-center gap-1"><MousePointer className="h-3 w-3" />{v.mouse_movements || 0} hareket</span>
                              <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{v.browser || '-'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <RiskBadge level={v.risk_level} score={Math.round(v.risk_score)} />
                            {!v.is_blocked && (
                              <button onClick={() => handleBlockIP(v.ip_address, v.site_id)}
                                className="px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs flex items-center gap-1">
                                <Ban className="h-3 w-3" /> Engelle
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Users */}
              {tab === "users" && (
                <div className="space-y-5">
                  {users.filter(u => u.status === 'pending').length > 0 && (
                    <div className="bg-orange-600/10 border border-orange-600/30 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Onay Bekleyenler ({users.filter(u => u.status === 'pending').length})
                      </h3>
                      <div className="space-y-2">
                        {users.filter(u => u.status === 'pending').map((u) => (
                          <div key={u.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                            <div>
                              <p className="font-medium text-white text-sm">{u.full_name}</p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </div>
                            <button onClick={() => handleApproveUser(u.id)} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Onayla
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <DataTable title="Tüm Kullanıcılar" columns={[
                    { key: 'full_name', label: 'Ad Soyad', sortable: true, render: (v, r) => <div><p className="text-white text-sm">{v}</p><p className="text-xs text-gray-500">{r.email}</p></div> },
                    { key: 'company_name', label: 'Şirket', sortable: true, render: (v) => <span className="text-gray-400 text-sm">{v || '-'}</span> },
                    { key: 'role', label: 'Rol', sortable: true, render: (v) => <span className={`px-2 py-1 rounded text-xs ${v === 'super_admin' ? 'bg-purple-600/20 text-purple-400' : v === 'admin_helper' ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-600/20 text-gray-400'}`}>{v === 'super_admin' ? 'Süper Admin' : v === 'admin_helper' ? 'Admin' : 'Müşteri'}</span> },
                    { key: 'status', label: 'Durum', sortable: true, render: (v) => <span className={`px-2 py-1 rounded text-xs ${v === 'approved' ? 'bg-green-600/20 text-green-400' : v === 'pending' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-red-600/20 text-red-400'}`}>{v === 'approved' ? 'Onaylı' : v === 'pending' ? 'Bekliyor' : 'Reddedildi'}</span> },
                    { key: 'created_at', label: 'Kayıt', sortable: true, render: (v) => <span className="text-gray-500 text-xs">{new Date(v).toLocaleDateString('tr-TR')}</span> },
                  ]} data={users} />
                </div>
              )}
              
              {/* Pools */}
              {tab === "pools" && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm flex items-center gap-1">
                      <Plus className="h-4 w-4" /> Yeni Havuz
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {pools.map((p) => (
                      <div key={p.id} className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5 hover:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-blue-600/20 rounded-lg">
                            <Layers className="h-5 w-5 text-blue-400" />
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${p.is_active ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}`}>
                            {p.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-white mb-1">{p.name}</h3>
                        <p className="text-sm text-gray-500 mb-3">{p.sector} - {p.city}</p>
                        <div className="flex justify-between text-sm pt-3 border-t border-gray-800">
                          <span className="text-gray-400">{p.sites?.length || 0} site</span>
                          <span className="text-red-400">{p.blocked_ips?.length || 0} engelli IP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Blocked */}
              {tab === "blocked" && (
                <DataTable title="Engellenen IP'ler" columns={[
                  { key: 'ip_address', label: 'IP', sortable: true, render: (v) => <span className="font-mono text-white text-sm">{v}</span> },
                  { key: 'site_id', label: 'Site', sortable: true, render: (v) => <span className="text-blue-400 text-sm">{getSiteName(v)}</span> },
                  { key: 'city', label: 'Şehir', render: (_, r) => <span className="text-gray-400 text-sm">{r.city || '-'}</span> },
                  { key: 'risk_score', label: 'Risk', sortable: true, render: (v, r) => <RiskBadge level={r.risk_level} score={Math.round(v)} /> },
                  { key: 'risk_factors', label: 'Sebep', render: (v) => <span className="text-gray-400 text-xs">{Array.isArray(v) ? v.slice(0, 2).join(', ') : '-'}</span> },
                  { key: 'created_at', label: 'Tarih', sortable: true, render: (v) => <span className="text-gray-500 text-xs">{new Date(v).toLocaleString('tr-TR')}</span> },
                ]} data={visitors.filter(v => v.is_blocked)} />
              )}
              
              {/* Settings */}
              {tab === "settings" && (
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-3">Sistem Ayarları</h3>
                  <p className="text-gray-500 text-sm">Bu bölüm geliştirme aşamasında...</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// Customer Dashboard
const CustomerDashboard = ({ user, onLogout }) => {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/dashboard").then(r => setData(r.data)).catch(console.error); }, []);
  
  if (!data) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div></div>;
  
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-[#0a0a0a] border-b border-gray-800 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><Shield className="h-6 w-6 text-blue-500" /><span className="font-bold">AdsKalkan</span></div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">{user?.full_name}</span>
          <button onClick={onLogout} className="p-1.5 hover:bg-white/5 rounded-lg"><LogOut className="h-4 w-4" /></button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-5">
        {user?.status === 'pending' ? (
          <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-xl p-6 text-center">
            <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">Hesabınız Onay Bekliyor</h2>
            <p className="text-gray-500">Yönetici onayından sonra erişebilirsiniz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <KPICard title="Toplam Ziyaretçi" value={data.total_visitors} icon={Eye} color="blue" />
            <KPICard title="Engellenen" value={data.blocked_visitors} icon={ShieldX} color="red" />
            <KPICard title="Koruma Oranı" value={data.protection_rate} suffix="%" icon={ShieldCheck} color="green" />
          </div>
        )}
      </main>
    </div>
  );
};

// Main App
function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    const saved = localStorage.getItem("user");
    if (token && saved) { setUser(JSON.parse(saved)); setPage("dashboard"); }
  }, []);
  
  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); setPage("landing"); };
  const handleLogin = (u) => { setUser(u); setPage("dashboard"); };
  
  if (page === "landing") return <LandingPage onLogin={() => setPage("login")} onRegister={() => setPage("register")} />;
  if (page === "login") return <LoginPage onBack={() => setPage("landing")} onSuccess={handleLogin} />;
  if (page === "register") return <RegisterPage onBack={() => setPage("landing")} />;
  if (page === "dashboard" && user) return user.role === "super_admin" || user.role === "admin_helper" ? <AdminDashboard user={user} onLogout={handleLogout} /> : <CustomerDashboard user={user} onLogout={handleLogout} />;
  return <LandingPage onLogin={() => setPage("login")} onRegister={() => setPage("register")} />;
}

export default App;
