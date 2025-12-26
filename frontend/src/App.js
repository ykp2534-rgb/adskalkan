import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Shield, ShieldAlert, ShieldCheck, ShieldX, Users, Globe, Monitor,
  TrendingUp, TrendingDown, Activity, Eye, EyeOff, Lock, Unlock,
  BarChart3, PieChart, LineChart, Map, Zap, AlertTriangle, CheckCircle,
  XCircle, Clock, Calendar, Filter, Download, RefreshCw, Settings,
  ChevronRight, ChevronDown, ChevronUp, Menu, X, LogOut, User, Building,
  Plus, Edit, Trash2, Search, Bell, Target, Layers, Database,
  Smartphone, Laptop, Tablet, MapPin, Navigation, Wifi, WifiOff,
  MousePointer, Timer, Scroll, MoreVertical, ExternalLink, Copy,
  Check, AlertOctagon, Gauge, Radio, Server, Cloud, Ban, DollarSign,
  Bot, Skull, CircleDollarSign, ShieldBan, Crosshair, Play, Phone,
  ArrowUpRight, ArrowDownRight, Package, CreditCard, Mail, Hash,
  LayoutDashboard, FileText, Home, ChevronLeft, MoreHorizontal
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
const AnimatedNumber = ({ value, prefix = "", suffix = "", decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const target = parseFloat(value) || 0;
    const duration = 800;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayValue(target);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{prefix}{displayValue.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
};

// Stat Card with Mini Chart
const StatCard = ({ title, value, prefix = "", suffix = "", change, changeType, icon: Icon, chartData = [], color = "blue" }) => {
  const colors = {
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", chart: "#3b82f6" },
    green: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", chart: "#10b981" },
    red: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", chart: "#ef4444" },
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", chart: "#f97316" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", chart: "#a855f7" },
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400", chart: "#06b6d4" },
  };
  const c = colors[color];
  
  const maxVal = Math.max(...chartData, 1);
  
  return (
    <div className={`rounded-2xl ${c.bg} border ${c.border} p-5 relative overflow-hidden`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl bg-black/30 ${c.text}`}>
          <Icon className="h-5 w-5" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${changeType === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
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
        <div className="flex items-end gap-0.5 h-10 mt-3">
          {chartData.map((val, i) => (
            <div
              key={i}
              className="flex-1 rounded-t transition-all"
              style={{
                height: `${(val / maxVal) * 100}%`,
                backgroundColor: c.chart,
                opacity: 0.6 + (i / chartData.length) * 0.4
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Donut Chart
const DonutChart = ({ data, size = 160 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <div className="text-gray-600 text-center py-8">Veri yok</div>;
  
  let currentAngle = -90;
  const radius = 40;
  const center = 50;
  
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {data.map((item, index) => {
          if (item.value === 0) return null;
          const percentage = item.value / total;
          const angle = percentage * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          currentAngle = endAngle;
          
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          
          const x1 = center + radius * Math.cos(startRad);
          const y1 = center + radius * Math.sin(startRad);
          const x2 = center + radius * Math.cos(endRad);
          const y2 = center + radius * Math.sin(endRad);
          
          const largeArc = angle > 180 ? 1 : 0;
          
          const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
          
          return <path key={index} d={path} fill={item.color} className="hover:opacity-80 transition-opacity cursor-pointer" />;
        })}
        <circle cx={center} cy={center} r="25" fill="#0a0a0a" />
        <text x={center} y={center - 5} textAnchor="middle" className="fill-white text-lg font-bold" style={{fontSize: '14px'}}>{total.toLocaleString()}</text>
        <text x={center} y={center + 10} textAnchor="middle" className="fill-gray-500" style={{fontSize: '6px'}}>Toplam</text>
      </svg>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4 text-sm">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-gray-400">{item.label}:</span>
            <span className="text-white font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Progress Bar
const ProgressBar = ({ label, value, total, color = "#3b82f6" }) => {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{value.toLocaleString('tr-TR')} <span className="text-gray-500">({Math.round(percent)}%)</span></span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

// Data Table
const DataTable = ({ columns, data, title, actions }) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };
  
  const filteredData = data.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const sortedData = sortKey ? [...filteredData].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    const modifier = sortDir === 'asc' ? 1 : -1;
    if (typeof aVal === 'number') return (aVal - bVal) * modifier;
    return String(aVal).localeCompare(String(bVal)) * modifier;
  }) : filteredData;
  
  return (
    <div className="bg-[#0d0d0d] border border-gray-800/50 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-gray-800/50 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-black/50 border border-gray-800 rounded-lg text-sm focus:border-blue-500 outline-none text-white w-48"
            />
          </div>
          {actions}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black/40">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:text-gray-300' : ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {sortedData.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-white/[0.02] transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-4 text-sm">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedData.length === 0 && (
        <div className="p-8 text-center text-gray-500">Veri bulunamadı</div>
      )}
    </div>
  );
};

// Live Pulse
const LivePulse = () => (
  <span className="relative flex h-2.5 w-2.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
  </span>
);

// Risk Badge
const RiskBadge = ({ level, score }) => {
  const styles = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${styles[level] || styles.low}`}>
      {score}
    </span>
  );
};

// Device Icon
const DeviceIcon = ({ type }) => {
  if (type === 'mobile') return <Smartphone className="h-4 w-4 text-gray-400" />;
  if (type === 'tablet') return <Tablet className="h-4 w-4 text-gray-400" />;
  return <Laptop className="h-4 w-4 text-gray-400" />;
};

// ==================== PAGES ====================

// Landing Page
const LandingPage = ({ onLogin, onRegister }) => (
  <div className="min-h-screen bg-[#050505] text-white">
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[150px]"></div>
    </div>
    
    <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Shield className="h-9 w-9 text-blue-500" />
        <span className="text-xl font-bold">AdsKalkan</span>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={onLogin} className="px-5 py-2 text-gray-400 hover:text-white">Giriş</button>
        <button onClick={onRegister} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium">Başla</button>
      </div>
    </nav>
    
    <header className="relative z-10 max-w-6xl mx-auto px-8 py-20 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm mb-8">
        <Zap className="h-4 w-4" /> AI Koruma <LivePulse />
      </div>
      <h1 className="text-5xl md:text-6xl font-bold mb-6">
        Google Ads Bütçenizi<br/>
        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Sahte Tıklamalardan</span><br/>
        Koruyun
      </h1>
      <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
        Gelişmiş AI ile bot trafiğini, click farm saldırılarını gerçek zamanlı tespit edin.
      </p>
      <div className="flex gap-4 justify-center">
        <button onClick={onRegister} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium flex items-center gap-2">
          <Play className="h-4 w-4" /> Canlı Demo
        </button>
        <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium flex items-center gap-2">
          <Phone className="h-4 w-4" /> İletişim
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-6 max-w-3xl mx-auto mt-16">
        {[
          { icon: Bot, value: "10M+", label: "Engellenen Bot", color: "text-red-400" },
          { icon: Users, value: "500+", label: "Müşteri", color: "text-blue-400" },
          { icon: Target, value: "%99.9", label: "Doğruluk", color: "text-emerald-400" },
          { icon: CircleDollarSign, value: "₺2.5M", label: "Tasarruf", color: "text-yellow-400" },
        ].map((s, i) => (
          <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/10">
            <s.icon className={`h-7 w-7 ${s.color} mb-2 mx-auto`} />
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
    </header>
  </div>
);

// Login
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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8">
        <button onClick={onBack} className="text-gray-500 hover:text-white mb-6 flex items-center gap-1 text-sm">
          <ChevronLeft className="h-4 w-4" /> Geri
        </button>
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold text-white">AdsKalkan</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Giriş Yap</h1>
        <p className="text-gray-500 mb-6">Hesabınıza giriş yapın</p>
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
            className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:border-blue-500 outline-none text-white" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifre" required
            className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:border-blue-500 outline-none text-white" />
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-white disabled:opacity-50">
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Register
const RegisterPage = ({ onBack }) => {
  const [formData, setFormData] = useState({ email: "", password: "", full_name: "", company_name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/auth/register`, formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Kayıt başarısız");
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="text-center bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8 max-w-md">
          <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Kayıt Başarılı!</h2>
          <p className="text-gray-400 mb-6">Yönetici onayından sonra giriş yapabilirsiniz.</p>
          <button onClick={onBack} className="px-6 py-3 bg-blue-600 rounded-lg font-medium text-white">Giriş'e Dön</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8">
        <button onClick={onBack} className="text-gray-500 hover:text-white mb-6 flex items-center gap-1 text-sm">
          <ChevronLeft className="h-4 w-4" /> Geri
        </button>
        <h1 className="text-2xl font-bold text-white mb-2">Kayıt Ol</h1>
        <p className="text-gray-500 mb-6">7 gün ücretsiz</p>
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} placeholder="Ad Soyad *" required className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:border-blue-500 outline-none text-white" />
          <input type="text" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} placeholder="Şirket" className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:border-blue-500 outline-none text-white" />
          <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Email *" required className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:border-blue-500 outline-none text-white" />
          <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Şifre *" required minLength={6} className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg focus:border-blue-500 outline-none text-white" />
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-white disabled:opacity-50 mt-2">
            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ==================== ADMIN DASHBOARD ====================
const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [users, setUsers] = useState([]);
  const [pools, setPools] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchAll = useCallback(async () => {
    try {
      const [dashRes, visitorsRes, usersRes, poolsRes, sitesRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/visitors?limit=200"),
        api.get("/admin/users"),
        api.get("/admin/pools"),
        api.get("/admin/sites"),
      ]);
      setDashboardData(dashRes.data);
      setVisitors(visitorsRes.data.visitors || []);
      setUsers(usersRes.data || []);
      setPools(poolsRes.data || []);
      setSites(sitesRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);
  
  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "sites", label: "Siteler", icon: Globe },
    { id: "visitors", label: "Ziyaretçiler", icon: Eye },
    { id: "live", label: "Canlı İzleme", icon: Activity },
    { id: "users", label: "Kullanıcılar", icon: Users },
    { id: "pools", label: "Havuzlar", icon: Layers },
    { id: "blocked", label: "Engellenenler", icon: Ban },
    { id: "settings", label: "Ayarlar", icon: Settings },
  ];
  
  const riskData = dashboardData ? [
    { label: "Düşük", value: dashboardData.risk_distribution?.low || 0, color: "#22c55e" },
    { label: "Orta", value: dashboardData.risk_distribution?.medium || 0, color: "#eab308" },
    { label: "Yüksek", value: dashboardData.risk_distribution?.high || 0, color: "#f97316" },
    { label: "Kritik", value: dashboardData.risk_distribution?.critical || 0, color: "#ef4444" },
  ] : [];
  
  const totalBlocked = pools.reduce((sum, p) => sum + (p.blocked_ips?.length || 0), 0);
  const estimatedSavings = dashboardData ? (dashboardData.blocked_visitors * 2.5) : 0;
  
  // Prepare site stats
  const siteStats = sites.map(site => ({
    id: site.id,
    name: site.name,
    domain: site.domain,
    total_visitors: site.total_visitors || 0,
    blocked_clicks: site.blocked_clicks || 0,
    block_rate: site.total_visitors > 0 ? ((site.blocked_clicks / site.total_visitors) * 100).toFixed(1) : 0,
    status: site.is_active ? 'Aktif' : 'Pasif',
  }));
  
  // Visitor columns
  const visitorColumns = [
    { key: 'ip_address', label: 'IP Adresi', sortable: true, render: (val) => <span className="font-mono text-white">{val}</span> },
    { key: 'city', label: 'Şehir', sortable: true, render: (val) => <span className="text-gray-400">{val || '-'}</span> },
    { key: 'country', label: 'Ülke', sortable: true, render: (val) => <span className="text-gray-400">{val || '-'}</span> },
    { key: 'device_type', label: 'Cihaz', sortable: true, render: (val) => <div className="flex items-center gap-2"><DeviceIcon type={val} /><span className="text-gray-400">{val || '-'}</span></div> },
    { key: 'device_brand', label: 'Marka/Model', sortable: true, render: (val, row) => <span className="text-gray-400">{val || '-'} {row.device_model || ''}</span> },
    { key: 'browser', label: 'Tarayıcı', sortable: true, render: (val) => <span className="text-gray-400">{val || '-'}</span> },
    { key: 'os', label: 'İşletim Sistemi', sortable: true, render: (val) => <span className="text-gray-400">{val || '-'}</span> },
    { key: 'time_on_page', label: 'Süre', sortable: true, render: (val) => <span className="text-gray-400">{val || 0}s</span> },
    { key: 'risk_score', label: 'Risk', sortable: true, render: (val, row) => <RiskBadge level={row.risk_level} score={Math.round(val)} /> },
    { key: 'is_blocked', label: 'Durum', sortable: true, render: (val) => val ? <span className="text-red-400 flex items-center gap-1"><Ban className="h-3.5 w-3.5" />Engellendi</span> : <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" />İzin</span> },
    { key: 'created_at', label: 'Tarih', sortable: true, render: (val) => <span className="text-gray-500 text-xs">{new Date(val).toLocaleString('tr-TR')}</span> },
  ];
  
  // Site columns
  const siteColumns = [
    { key: 'name', label: 'Site Adı', sortable: true, render: (val) => <span className="text-white font-medium">{val}</span> },
    { key: 'domain', label: 'Domain', sortable: true, render: (val) => <span className="text-blue-400">{val}</span> },
    { key: 'total_visitors', label: 'Toplam Tıklama', sortable: true, render: (val) => <span className="text-white">{val.toLocaleString('tr-TR')}</span> },
    { key: 'blocked_clicks', label: 'Engellenen', sortable: true, render: (val) => <span className="text-red-400">{val.toLocaleString('tr-TR')}</span> },
    { key: 'block_rate', label: 'Engel Oranı', sortable: true, render: (val) => <span className={`${parseFloat(val) > 50 ? 'text-red-400' : parseFloat(val) > 20 ? 'text-orange-400' : 'text-emerald-400'}`}>%{val}</span> },
    { key: 'status', label: 'Durum', sortable: true, render: (val) => <span className={`px-2 py-1 rounded text-xs ${val === 'Aktif' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>{val}</span> },
  ];
  
  const handleApproveUser = async (userId) => {
    try { await api.put(`/admin/users/${userId}/approve`); fetchAll(); } catch (err) { console.error(err); }
  };
  
  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-56'} bg-[#0a0a0a] border-r border-gray-800/50 flex flex-col transition-all duration-300 flex-shrink-0`}>
        <div className="p-4 border-b border-gray-800/50 flex items-center gap-2">
          <Shield className="h-7 w-7 text-blue-500 flex-shrink-0" />
          {!sidebarCollapsed && <span className="font-bold">AdsKalkan</span>}
        </div>
        
        <nav className="flex-1 p-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                activeTab === item.id 
                  ? 'bg-blue-600/20 text-blue-400' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        
        <div className="p-2 border-t border-gray-800/50">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-white/5">
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 mt-1">
            <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">Çıkış</span>}
          </button>
        </div>
      </aside>
      
      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-800/50 px-6 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">{menuItems.find(m => m.id === activeTab)?.label}</h1>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={fetchAll} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white">
                <RefreshCw className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full">
                <LivePulse />
                <span className="text-xs text-red-400">Canlı</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-300">{user?.full_name}</span>
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Dashboard */}
              {activeTab === "dashboard" && dashboardData && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Bugün Engellenen Bot" value={dashboardData.today_blocked} icon={Bot} color="red" change={12} changeType="up" chartData={dashboardData.daily_stats?.slice(-7).map(d => d.blocked) || []} />
                    <StatCard title="Havuzdan Gelen Tehdit" value={totalBlocked} icon={Layers} color="orange" chartData={[3, 5, 8, 6, 9, 7, 10]} />
                    <StatCard title="Tahmini Tasarruf" value={estimatedSavings} prefix="₺" icon={CircleDollarSign} color="green" change={8} changeType="up" chartData={dashboardData.daily_stats?.slice(-7).map(d => d.blocked * 2.5) || []} />
                    <StatCard title="Aktif Engelli IP" value={dashboardData.total_blocked_ips} icon={ShieldBan} color="purple" chartData={[5, 8, 12, 15, 18, 22, dashboardData.total_blocked_ips]} />
                  </div>
                  
                  {/* Secondary Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-[#0d0d0d] border border-gray-800/50 rounded-xl p-4 flex items-center gap-3">
                      <Eye className="h-5 w-5 text-blue-400" />
                      <div>
                        <div className="text-xl font-bold">{dashboardData.total_visitors.toLocaleString('tr-TR')}</div>
                        <div className="text-xs text-gray-500">Toplam Ziyaretçi</div>
                      </div>
                    </div>
                    <div className="bg-[#0d0d0d] border border-gray-800/50 rounded-xl p-4 flex items-center gap-3">
                      <Users className="h-5 w-5 text-emerald-400" />
                      <div>
                        <div className="text-xl font-bold">{dashboardData.total_users}</div>
                        <div className="text-xs text-gray-500">Toplam Müşteri</div>
                      </div>
                    </div>
                    <div className="bg-[#0d0d0d] border border-gray-800/50 rounded-xl p-4 flex items-center gap-3">
                      <Globe className="h-5 w-5 text-cyan-400" />
                      <div>
                        <div className="text-xl font-bold">{dashboardData.total_sites}</div>
                        <div className="text-xs text-gray-500">Aktif Site</div>
                      </div>
                    </div>
                    <div className="bg-[#0d0d0d] border border-gray-800/50 rounded-xl p-4 flex items-center gap-3">
                      <Clock className="h-5 w-5 text-orange-400" />
                      <div>
                        <div className="text-xl font-bold">{dashboardData.pending_users}</div>
                        <div className="text-xs text-gray-500">Onay Bekleyen</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Charts Row */}
                  <div className="grid grid-cols-3 gap-6">
                    {/* Product Activity - Donut */}
                    <div className="bg-[#0d0d0d] border border-gray-800/50 rounded-2xl p-6">
                      <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-purple-400" />
                        Risk Dağılımı
                      </h3>
                      <DonutChart data={riskData} size={150} />
                    </div>
                    
                    {/* City Distribution */}
                    <div className="bg-[#0d0d0d] border border-gray-800/50 rounded-2xl p-6">
                      <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-cyan-400" />
                        Şehir Dağılımı
                      </h3>
                      <div className="space-y-3">
                        {(dashboardData.city_distribution || []).slice(0, 5).map((city, i) => (
                          <ProgressBar
                            key={i}
                            label={city._id || 'Bilinmiyor'}
                            value={city.count}
                            total={dashboardData.city_distribution[0]?.count || 1}
                            color={['#3b82f6', '#a855f7', '#06b6d4', '#22c55e', '#f97316'][i]}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Device Distribution */}
                    <div className="bg-[#0d0d0d] border border-gray-800/50 rounded-2xl p-6">
                      <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-blue-400" />
                        Cihaz Dağılımı
                      </h3>
                      <div className="space-y-3">
                        {(dashboardData.device_distribution || []).slice(0, 5).map((device, i) => (
                          <ProgressBar
                            key={i}
                            label={device._id || 'Bilinmiyor'}
                            value={device.count}
                            total={dashboardData.device_distribution[0]?.count || 1}
                            color={['#22c55e', '#3b82f6', '#f97316'][i] || '#6b7280'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Sites Table */}
                  <DataTable
                    title="Site Performansı"
                    columns={siteColumns}
                    data={siteStats}
                    actions={
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm">
                        <Download className="h-4 w-4" /> Excel
                      </button>
                    }
                  />
                  
                  {/* Recent Visitors Table */}
                  <DataTable
                    title="Son Ziyaretçiler"
                    columns={visitorColumns}
                    data={visitors.slice(0, 10)}
                    actions={
                      <button onClick={() => setActiveTab('visitors')} className="text-blue-400 hover:text-blue-300 text-sm">
                        Tümünü Gör →
                      </button>
                    }
                  />
                </div>
              )}
              
              {/* Sites Tab */}
              {activeTab === "sites" && (
                <DataTable
                  title="Tüm Siteler"
                  columns={siteColumns}
                  data={siteStats}
                  actions={
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm">
                      <Download className="h-4 w-4" /> Excel İndir
                    </button>
                  }
                />
              )}
              
              {/* Visitors Tab */}
              {activeTab === "visitors" && (
                <DataTable
                  title="Tüm Ziyaretçiler"
                  columns={visitorColumns}
                  data={visitors}
                  actions={
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm">
                      <Download className="h-4 w-4" /> Excel İndir
                    </button>
                  }
                />
              )}
              
              {/* Live Tab */}
              {activeTab === "live" && (
                <div className="bg-[#0d0d0d] border border-gray-800/50 rounded-2xl">
                  <div className="p-5 border-b border-gray-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <LivePulse />
                      <h3 className="text-lg font-semibold">Canlı Saldırı Akışı</h3>
                    </div>
                    <span className="text-sm text-gray-500">Son 100 ziyaret</span>
                  </div>
                  <div className="divide-y divide-gray-800/50 max-h-[calc(100vh-250px)] overflow-y-auto">
                    {visitors.slice(0, 50).map((v, i) => (
                      <div key={v.id || i} className="flex items-center gap-4 p-4 hover:bg-white/[0.02]">
                        <div className={`w-2 h-2 rounded-full ${v.risk_level === 'critical' || v.risk_level === 'high' ? 'bg-red-500' : v.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'}`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-white">{v.ip_address}</span>
                            {v.is_blocked && <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">ENGELLENDİ</span>}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.city || '-'}</span>
                            <span className="flex items-center gap-1"><DeviceIcon type={v.device_type} />{v.device_type || '-'}</span>
                            <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{v.time_on_page || 0}s</span>
                            <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{v.browser || '-'}</span>
                          </div>
                        </div>
                        <RiskBadge level={v.risk_level} score={Math.round(v.risk_score)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="space-y-6">
                  {users.filter(u => u.status === 'pending').length > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5">
                      <h3 className="text-base font-semibold text-orange-400 mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Onay Bekleyenler ({users.filter(u => u.status === 'pending').length})
                      </h3>
                      <div className="space-y-2">
                        {users.filter(u => u.status === 'pending').map((u) => (
                          <div key={u.id} className="flex items-center justify-between p-3 bg-black/30 rounded-xl">
                            <div>
                              <p className="font-medium text-white">{u.full_name}</p>
                              <p className="text-sm text-gray-500">{u.email}</p>
                            </div>
                            <button onClick={() => handleApproveUser(u.id)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" /> Onayla
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <DataTable
                    title="Tüm Kullanıcılar"
                    columns={[
                      { key: 'full_name', label: 'Ad Soyad', sortable: true, render: (val, row) => <div><p className="text-white font-medium">{val}</p><p className="text-xs text-gray-500">{row.email}</p></div> },
                      { key: 'company_name', label: 'Şirket', sortable: true, render: (val) => <span className="text-gray-400">{val || '-'}</span> },
                      { key: 'role', label: 'Rol', sortable: true, render: (val) => <span className={`px-2 py-1 rounded text-xs ${val === 'super_admin' ? 'bg-purple-500/20 text-purple-400' : val === 'admin_helper' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>{val === 'super_admin' ? 'Süper Admin' : val === 'admin_helper' ? 'Admin' : 'Müşteri'}</span> },
                      { key: 'status', label: 'Durum', sortable: true, render: (val) => <span className={`px-2 py-1 rounded text-xs ${val === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : val === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{val === 'approved' ? 'Onaylı' : val === 'pending' ? 'Bekliyor' : 'Reddedildi'}</span> },
                      { key: 'created_at', label: 'Kayıt', sortable: true, render: (val) => <span className="text-gray-500 text-xs">{new Date(val).toLocaleDateString('tr-TR')}</span> },
                    ]}
                    data={users}
                  />
                </div>
              )}
              
              {/* Pools Tab */}
              {activeTab === "pools" && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm">
                      <Plus className="h-4 w-4" /> Yeni Havuz
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {pools.map((pool) => (
                      <div key={pool.id} className="bg-[#0d0d0d] border border-gray-800/50 rounded-2xl p-5 hover:border-gray-700 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2.5 bg-blue-500/20 rounded-xl">
                            <Layers className="h-5 w-5 text-blue-400" />
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${pool.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {pool.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{pool.name}</h3>
                        <p className="text-sm text-gray-500 mb-3">{pool.sector} - {pool.city}</p>
                        <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-800">
                          <span className="text-gray-400">{pool.sites?.length || 0} site</span>
                          <span className="text-red-400 font-medium">{pool.blocked_ips?.length || 0} engelli IP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Blocked Tab */}
              {activeTab === "blocked" && (
                <DataTable
                  title="Engellenen IP'ler"
                  columns={[
                    { key: 'ip_address', label: 'IP Adresi', sortable: true, render: (val) => <span className="font-mono text-white">{val}</span> },
                    { key: 'city', label: 'Şehir', sortable: true, render: (val, row) => <span className="text-gray-400">{row.city || '-'}</span> },
                    { key: 'risk_score', label: 'Risk Skoru', sortable: true, render: (val, row) => <RiskBadge level={row.risk_level} score={Math.round(val)} /> },
                    { key: 'risk_factors', label: 'Engel Sebepleri', render: (val) => <span className="text-gray-400 text-xs">{Array.isArray(val) ? val.slice(0, 2).join(', ') : '-'}</span> },
                    { key: 'created_at', label: 'Tarih', sortable: true, render: (val) => <span className="text-gray-500 text-xs">{new Date(val).toLocaleString('tr-TR')}</span> },
                  ]}
                  data={visitors.filter(v => v.is_blocked)}
                />
              )}
              
              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="bg-[#0d0d0d] border border-gray-800/50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Sistem Ayarları</h3>
                  <p className="text-gray-500">Bu bölüm geliştirme aşamasında...</p>
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
  useEffect(() => {
    api.get("/dashboard").then(res => setData(res.data)).catch(console.error);
  }, []);
  
  if (!data) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div></div>;
  
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="bg-[#0a0a0a] border-b border-gray-800/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2"><Shield className="h-7 w-7 text-blue-500" /><span className="font-bold">AdsKalkan</span></div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">{user?.full_name}</span>
          <button onClick={onLogout} className="p-2 hover:bg-white/5 rounded-lg"><LogOut className="h-5 w-5" /></button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        {user?.status === 'pending' ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-8 text-center">
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Hesabınız Onay Bekliyor</h2>
            <p className="text-gray-400">Yönetici onayından sonra erişebilirsiniz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <StatCard title="Toplam Ziyaretçi" value={data.total_visitors} icon={Eye} color="blue" />
            <StatCard title="Engellenen" value={data.blocked_visitors} icon={ShieldX} color="red" />
            <StatCard title="Koruma Oranı" value={data.protection_rate} suffix="%" icon={ShieldCheck} color="green" />
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
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setPage("dashboard");
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("landing");
  };
  
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setPage("dashboard");
  };
  
  if (page === "landing") return <LandingPage onLogin={() => setPage("login")} onRegister={() => setPage("register")} />;
  if (page === "login") return <LoginPage onBack={() => setPage("landing")} onSuccess={handleLoginSuccess} />;
  if (page === "register") return <RegisterPage onBack={() => setPage("landing")} />;
  
  if (page === "dashboard" && user) {
    return user.role === "super_admin" || user.role === "admin_helper" 
      ? <AdminDashboard user={user} onLogout={handleLogout} />
      : <CustomerDashboard user={user} onLogout={handleLogout} />;
  }
  
  return <LandingPage onLogin={() => setPage("login")} onRegister={() => setPage("register")} />;
}

export default App;
