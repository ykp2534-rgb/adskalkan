import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Shield, Users, Globe, Eye, Activity, BarChart3, PieChart, TrendingUp,
  Download, Filter, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Calendar, RefreshCw, Settings, LogOut, User, Layers, Ban, FileText,
  AlertTriangle, CheckCircle, Clock, Smartphone, Laptop, Tablet,
  MapPin, MousePointer, Timer, Package, Megaphone, Server, Home,
  ArrowUpRight, ArrowDownRight, Zap, Target, Database, BarChart2,
  TrendingDown, AlertCircle, ShieldCheck, ShieldX, Crosshair, Hash
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

// ==================== MOCK DATA - DAHA FAZLA VERİ ====================
const CITIES = ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Kayseri', 'Eskisehir', 'Diyarbakir'];
const COUNTRIES = ['Türkiye', 'Türkiye', 'Türkiye', 'Türkiye', 'Türkiye', 'Türkiye', 'Türkiye', 'Türkiye', 'Türkiye', 'Türkiye', 'Türkiye', 'Türkiye'];
const DEVICES = ['desktop', 'mobile', 'tablet'];
const BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'Samsung Internet', 'UC Browser'];
const OS_LIST = ['Windows 11', 'Windows 10', 'macOS', 'Android 13', 'Android 12', 'iOS 17', 'iOS 16', 'Linux'];
const SITES = [
  { id: 's1', name: 'Istanbul Tesisat', domain: 'istanbul-tesisat.com', pool: 'Istanbul Tesisatçılar' },
  { id: 's2', name: 'Ankara Su Tesisatı', domain: 'ankara-su.com', pool: 'Ankara Tesisatçılar' },
  { id: 's3', name: 'Izmir Elektrik', domain: 'izmir-elektrik.com', pool: 'Izmir Elektrikçiler' },
  { id: 's4', name: 'Bursa Tesisat', domain: 'bursa-tesisat.com', pool: 'Bursa Tesisatçılar' },
  { id: 's5', name: 'Antalya Klima', domain: 'antalya-klima.com', pool: 'Antalya Klimacılar' },
  { id: 's6', name: 'Konya Elektrik', domain: 'konya-elektrik.com', pool: 'Konya Elektrikçiler' },
  { id: 's7', name: 'Adana Tesisat', domain: 'adana-tesisat.com', pool: 'Adana Tesisatçılar' },
  { id: 's8', name: 'Gaziantep Su', domain: 'gaziantep-su.com', pool: 'Gaziantep Tesisatçılar' },
];
const IP_TYPES = ['residential', 'datacenter', 'vpn', 'proxy', 'tor'];
const RISK_REASONS = [
  'Datacenter IP tespit edildi',
  'VPN/Proxy kullanımı',
  'Çok kısa sayfa süresi',
  'Mouse hareketi yok',
  'Bot User-Agent',
  'Tekrarlı IP ziyareti',
  'Şüpheli tıklama paterni',
  'Headless browser',
  'Aynı IP farklı cihazlar',
  'TOR ağı tespit edildi'
];

const generateVisitors = (count) => {
  return Array.from({ length: count }, (_, i) => {
    const site = SITES[Math.floor(Math.random() * SITES.length)];
    const cityIdx = Math.floor(Math.random() * CITIES.length);
    const riskScore = Math.floor(Math.random() * 100);
    const riskLevel = riskScore >= 70 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 30 ? 'medium' : 'low';
    const isBlocked = riskScore >= 50;
    const ipType = IP_TYPES[Math.floor(Math.random() * IP_TYPES.length)];
    const timeOnPage = Math.floor(Math.random() * 180);
    const scrollDepth = Math.floor(Math.random() * 100);
    const mouseMovements = Math.floor(Math.random() * 500);
    const clickCount = Math.floor(Math.random() * 15);
    
    const riskFactors = [];
    if (ipType !== 'residential') riskFactors.push(RISK_REASONS[Math.floor(Math.random() * 3)]);
    if (timeOnPage < 5) riskFactors.push('Çok kısa sayfa süresi');
    if (mouseMovements < 10) riskFactors.push('Mouse hareketi yok');
    if (Math.random() > 0.7) riskFactors.push(RISK_REASONS[Math.floor(Math.random() * RISK_REASONS.length)]);
    
    return {
      id: `v${i}`,
      ip_address: `${Math.floor(Math.random() * 200) + 50}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      site_id: site.id,
      site_name: site.name,
      domain: site.domain,
      pool: site.pool,
      city: CITIES[cityIdx],
      country: COUNTRIES[cityIdx],
      device_type: DEVICES[Math.floor(Math.random() * DEVICES.length)],
      device_brand: ['Samsung', 'Apple', 'Dell', 'HP', 'Lenovo', 'Xiaomi', 'Huawei', 'Asus'][Math.floor(Math.random() * 8)],
      device_model: ['Galaxy S23', 'iPhone 15', 'XPS 15', 'EliteBook', 'ThinkPad', 'Mi 13', 'P60', 'ZenBook'][Math.floor(Math.random() * 8)],
      browser: BROWSERS[Math.floor(Math.random() * BROWSERS.length)],
      browser_version: `${Math.floor(Math.random() * 50) + 80}.0.${Math.floor(Math.random() * 9999)}`,
      os: OS_LIST[Math.floor(Math.random() * OS_LIST.length)],
      screen_resolution: ['1920x1080', '1366x768', '2560x1440', '1536x864', '390x844', '412x915'][Math.floor(Math.random() * 6)],
      ip_type: ipType,
      isp: ['Türk Telekom', 'Turkcell', 'Vodafone', 'Superonline', 'Google Cloud', 'AWS', 'DigitalOcean', 'NordVPN'][Math.floor(Math.random() * 8)],
      time_on_page: timeOnPage,
      scroll_depth: scrollDepth,
      mouse_movements: mouseMovements,
      click_count: clickCount,
      page_views: Math.floor(Math.random() * 8) + 1,
      referer: ['google.com', 'direct', 'facebook.com', 'instagram.com', 'twitter.com', 'bing.com'][Math.floor(Math.random() * 6)],
      gclid: Math.random() > 0.3 ? `CL${Math.random().toString(36).substr(2, 20)}` : null,
      risk_score: riskScore,
      risk_level: riskLevel,
      risk_factors: riskFactors,
      is_blocked: isBlocked,
      blocked_reason: isBlocked ? riskFactors[0] || 'Yüksek risk skoru' : null,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      session_id: `sess_${Math.random().toString(36).substr(2, 12)}`,
    };
  });
};

const MOCK_VISITORS = generateVisitors(2000);

const MOCK_SITES = SITES.map((s, i) => {
  const visitors = MOCK_VISITORS.filter(v => v.site_id === s.id);
  const blocked = visitors.filter(v => v.is_blocked);
  return {
    ...s,
    total_visitors: visitors.length,
    blocked_visitors: blocked.length,
    allowed_visitors: visitors.length - blocked.length,
    protection_rate: visitors.length > 0 ? ((blocked.length / visitors.length) * 100).toFixed(1) : 0,
    avg_risk_score: visitors.length > 0 ? (visitors.reduce((sum, v) => sum + v.risk_score, 0) / visitors.length).toFixed(1) : 0,
    last_activity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    is_active: Math.random() > 0.1,
    tracker_installed: Math.random() > 0.05,
    daily_limit: 10000,
    monthly_limit: 300000,
  };
});

const MOCK_POOLS = [
  { id: 'p1', name: 'Istanbul Tesisatçılar', sector: 'Tesisatçılık', city: 'Istanbul', sites_count: 45, blocked_ips: 12500, blocked_clicks: 48000, shared_threats: 3200, is_active: true, created_at: '2024-01-01' },
  { id: 'p2', name: 'Ankara Tesisatçılar', sector: 'Tesisatçılık', city: 'Ankara', sites_count: 28, blocked_ips: 6800, blocked_clicks: 21000, shared_threats: 1800, is_active: true, created_at: '2024-01-05' },
  { id: 'p3', name: 'Izmir Elektrikçiler', sector: 'Elektrik', city: 'Izmir', sites_count: 35, blocked_ips: 9200, blocked_clicks: 35000, shared_threats: 2400, is_active: true, created_at: '2024-01-10' },
  { id: 'p4', name: 'Bursa Tesisatçılar', sector: 'Tesisatçılık', city: 'Bursa', sites_count: 18, blocked_ips: 4200, blocked_clicks: 15000, shared_threats: 980, is_active: true, created_at: '2024-01-12' },
  { id: 'p5', name: 'Antalya Klimacılar', sector: 'Klima', city: 'Antalya', sites_count: 22, blocked_ips: 5100, blocked_clicks: 18500, shared_threats: 1200, is_active: true, created_at: '2024-01-15' },
  { id: 'p6', name: 'Konya Elektrikçiler', sector: 'Elektrik', city: 'Konya', sites_count: 15, blocked_ips: 3400, blocked_clicks: 12000, shared_threats: 750, is_active: true, created_at: '2024-01-18' },
  { id: 'p7', name: 'Istanbul Avukatlar', sector: 'Hukuk', city: 'Istanbul', sites_count: 68, blocked_ips: 18500, blocked_clicks: 72000, shared_threats: 4800, is_active: true, created_at: '2024-01-02' },
  { id: 'p8', name: 'Ankara Diş Klinikleri', sector: 'Sağlık', city: 'Ankara', sites_count: 42, blocked_ips: 11200, blocked_clicks: 42000, shared_threats: 2900, is_active: true, created_at: '2024-01-08' },
];

const MOCK_BLOCKED_IPS = MOCK_VISITORS.filter(v => v.is_blocked).slice(0, 500).map((v, i) => ({
  id: `ip${i}`,
  ip_address: v.ip_address,
  ip_type: v.ip_type,
  city: v.city,
  country: v.country,
  isp: v.isp,
  total_visits: Math.floor(Math.random() * 50) + 1,
  blocked_count: Math.floor(Math.random() * 30) + 1,
  first_seen: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
  last_seen: v.created_at,
  risk_score: v.risk_score,
  risk_level: v.risk_level,
  blocked_reason: v.blocked_reason,
  is_global: Math.random() > 0.7,
  affected_sites: Math.floor(Math.random() * 5) + 1,
  pool_id: MOCK_POOLS[Math.floor(Math.random() * MOCK_POOLS.length)].id,
}));

const MOCK_USERS = [
  { id: 'u1', full_name: 'Ahmet Yılmaz', email: 'ahmet@example.com', company: 'ABC Tesisat Ltd.', phone: '+90 532 111 2233', role: 'customer', status: 'approved', package: 'Professional', sites_count: 3, monthly_visitors: 15000, created_at: '2024-01-01T10:00:00Z', last_login: '2024-01-15T14:30:00Z' },
  { id: 'u2', full_name: 'Mehmet Demir', email: 'mehmet@example.com', company: 'XYZ Elektrik A.Ş.', phone: '+90 533 222 3344', role: 'customer', status: 'approved', package: 'Enterprise', sites_count: 8, monthly_visitors: 45000, created_at: '2024-01-05T14:30:00Z', last_login: '2024-01-15T09:15:00Z' },
  { id: 'u3', full_name: 'Ayşe Kaya', email: 'ayse@example.com', company: 'Kaya Hukuk Bürosu', phone: '+90 534 333 4455', role: 'customer', status: 'pending', package: 'Starter', sites_count: 0, monthly_visitors: 0, created_at: '2024-01-14T09:15:00Z', last_login: null },
  { id: 'u4', full_name: 'Fatma Öz', email: 'fatma@example.com', company: 'Öz Klima Sistemleri', phone: '+90 535 444 5566', role: 'customer', status: 'approved', package: 'Professional', sites_count: 2, monthly_visitors: 8500, created_at: '2024-01-08T11:20:00Z', last_login: '2024-01-14T16:45:00Z' },
  { id: 'u5', full_name: 'Ali Çelik', email: 'ali@example.com', company: 'Çelik Otomotiv', phone: '+90 536 555 6677', role: 'customer', status: 'suspended', package: 'Starter', sites_count: 1, monthly_visitors: 2000, created_at: '2024-01-10T08:45:00Z', last_login: '2024-01-12T10:00:00Z' },
  { id: 'u6', full_name: 'Super Admin', email: 'ykp2534@gmail.com', company: 'AdsKalkan', phone: '+90 537 666 7788', role: 'super_admin', status: 'approved', package: 'System', sites_count: 0, monthly_visitors: 0, created_at: '2024-01-01T00:00:00Z', last_login: '2024-01-15T15:00:00Z' },
];

const generateDailyStats = (days) => Array.from({ length: days }, (_, i) => {
  const date = new Date(); date.setDate(date.getDate() - (days - 1 - i));
  const visitors = Math.floor(Math.random() * 2000) + 500;
  const blocked = Math.floor(visitors * (Math.random() * 0.35 + 0.15));
  return { date: date.toISOString().split('T')[0], visitors, blocked, allowed: visitors - blocked, savings: (blocked * 2.5).toFixed(0) };
});
const DAILY_STATS = generateDailyStats(30);

const generateHourlyStats = () => Array.from({ length: 24 }, (_, h) => ({
  hour: `${h.toString().padStart(2, '0')}:00`,
  visitors: Math.floor(Math.random() * 200) + 20,
  blocked: Math.floor(Math.random() * 80) + 5,
}));
const HOURLY_STATS = generateHourlyStats();

// ==================== UTILITIES ====================
const formatNumber = (n) => n?.toLocaleString('tr-TR') || '0';
const formatDate = (d) => new Date(d).toLocaleString('tr-TR');
const formatDateShort = (d) => new Date(d).toLocaleDateString('tr-TR');
const formatCurrency = (n) => `₺${formatNumber(n)}`;

// ==================== COMPONENTS ====================

// Compact KPI Card
const KPICard = ({ label, value, subValue, icon: Icon, color, trend, trendValue, small }) => {
  const colors = {
    blue: 'border-blue-500/30 bg-blue-500/5',
    green: 'border-emerald-500/30 bg-emerald-500/5',
    red: 'border-red-500/30 bg-red-500/5',
    orange: 'border-orange-500/30 bg-orange-500/5',
    purple: 'border-purple-500/30 bg-purple-500/5',
    cyan: 'border-cyan-500/30 bg-cyan-500/5',
    yellow: 'border-yellow-500/30 bg-yellow-500/5',
  };
  const iconColors = {
    blue: 'text-blue-400', green: 'text-emerald-400', red: 'text-red-400',
    orange: 'text-orange-400', purple: 'text-purple-400', cyan: 'text-cyan-400', yellow: 'text-yellow-400',
  };
  
  return (
    <div className={`border rounded-lg ${colors[color]} ${small ? 'p-3' : 'p-4'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-gray-400 truncate ${small ? 'text-xs' : 'text-xs uppercase tracking-wide'}`}>{label}</p>
          <p className={`font-bold text-white ${small ? 'text-lg mt-0.5' : 'text-2xl mt-1'}`}>{value}</p>
          {subValue && <p className="text-xs text-gray-500 mt-0.5">{subValue}</p>}
        </div>
        <Icon className={`${small ? 'h-4 w-4' : 'h-5 w-5'} ${iconColors[color]} flex-shrink-0`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
};

// Mini Stat
const MiniStat = ({ label, value, color = 'gray' }) => {
  const colors = { gray: 'text-gray-400', green: 'text-emerald-400', red: 'text-red-400', orange: 'text-orange-400', blue: 'text-blue-400' };
  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${colors[color]}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
};

// Progress Bar
const ProgressBar = ({ value, max, color = '#8b5cf6', showLabel = true, height = 6 }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full">
      <div className="bg-slate-700 rounded-full overflow-hidden" style={{ height }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
      </div>
      {showLabel && <p className="text-xs text-gray-500 mt-1">{pct.toFixed(1)}%</p>}
    </div>
  );
};

// Status Badge
const Badge = ({ type, size = 'sm' }) => {
  const styles = {
    blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
    allowed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    datacenter: 'bg-red-500/20 text-red-400 border-red-500/30',
    vpn: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    proxy: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    tor: 'bg-red-500/20 text-red-400 border-red-500/30',
    residential: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
  const labels = {
    blocked: 'Engellendi', allowed: 'İzin', critical: 'Kritik', high: 'Yüksek', medium: 'Orta', low: 'Düşük',
    approved: 'Onaylı', pending: 'Bekliyor', suspended: 'Askıda', active: 'Aktif', inactive: 'Pasif',
    datacenter: 'Datacenter', vpn: 'VPN', proxy: 'Proxy', tor: 'TOR', residential: 'Residential',
  };
  const sizeClass = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';
  return <span className={`${styles[type] || styles.low} border rounded font-medium ${sizeClass}`}>{labels[type] || type}</span>;
};

// Risk Score
const RiskScore = ({ score }) => {
  const color = score >= 70 ? 'text-red-400' : score >= 50 ? 'text-orange-400' : score >= 30 ? 'text-yellow-400' : 'text-emerald-400';
  const bg = score >= 70 ? 'bg-red-500/20' : score >= 50 ? 'bg-orange-500/20' : score >= 30 ? 'bg-yellow-500/20' : 'bg-emerald-500/20';
  return <span className={`${bg} ${color} px-2 py-0.5 rounded text-xs font-mono font-bold`}>{score}</span>;
};

// Device Icon
const DeviceIcon = ({ type }) => {
  if (type === 'mobile') return <Smartphone className="h-3.5 w-3.5 text-gray-500" />;
  if (type === 'tablet') return <Tablet className="h-3.5 w-3.5 text-gray-500" />;
  return <Laptop className="h-3.5 w-3.5 text-gray-500" />;
};

// Mini Chart
const MiniBarChart = ({ data, height = 60 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div className="w-full rounded-t" style={{ height: `${(d.value / max) * 100}%`, backgroundColor: d.color || '#8b5cf6', minHeight: 2 }} />
        </div>
      ))}
    </div>
  );
};

// Donut Chart
const DonutChart = ({ data, size = 100 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  let angle = -90;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      {data.map((d, i) => {
        if (d.value === 0) return null;
        const pct = d.value / total;
        const a = pct * 360;
        const start = angle;
        angle += a;
        const r = 40, cx = 50, cy = 50;
        const rad1 = (start * Math.PI) / 180;
        const rad2 = ((start + a) * Math.PI) / 180;
        const x1 = cx + r * Math.cos(rad1), y1 = cy + r * Math.sin(rad1);
        const x2 = cx + r * Math.cos(rad2), y2 = cy + r * Math.sin(rad2);
        const large = a > 180 ? 1 : 0;
        return <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} fill={d.color} />;
      })}
      <circle cx="50" cy="50" r="25" fill="#0f172a" />
    </svg>
  );
};

// Data Table
const DataTable = ({ columns, data, title, filters, onExport, pageSize = 25, compact = false }) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(search.toLowerCase())));
  }, [data, search]);
  
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const m = sortDir === 'asc' ? 1 : -1;
      return typeof av === 'number' ? (av - bv) * m : String(av).localeCompare(String(bv)) * m;
    });
  }, [filtered, sortKey, sortDir]);
  
  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageData = sorted.slice((page - 1) * pageSize, page * pageSize);
  
  const cellClass = compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm';
  const headerClass = compact ? 'px-2 py-2 text-[10px]' : 'px-3 py-2 text-xs';
  
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg overflow-hidden">
      <div className="p-3 border-b border-slate-700/50 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          <span className="text-xs text-gray-500 bg-slate-800 px-2 py-0.5 rounded">{formatNumber(sorted.length)} kayıt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            <input type="text" placeholder="Ara..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-7 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white w-44 focus:border-purple-500 outline-none" />
          </div>
          {onExport && (
            <button onClick={onExport} className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 rounded text-xs font-medium">
              <Download className="h-3 w-3" /> Export
            </button>
          )}
        </div>
      </div>
      
      {filters && <div className="p-2 border-b border-slate-700/50 flex items-center gap-2 flex-wrap bg-slate-800/30">{filters}</div>}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              {columns.map(col => (
                <th key={col.key} onClick={() => col.sortable !== false && (setSortKey(col.key), setSortDir(sortKey === col.key && sortDir === 'desc' ? 'asc' : 'desc'))}
                  className={`${headerClass} text-left font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap ${col.sortable !== false ? 'cursor-pointer hover:text-gray-200' : ''}`} style={{ width: col.width }}>
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {pageData.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-slate-800/30">
                {columns.map(col => (
                  <td key={col.key} className={`${cellClass} whitespace-nowrap`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {pageData.length === 0 && <div className="p-6 text-center text-gray-500 text-sm">Veri bulunamadı</div>}
      
      {totalPages > 1 && (
        <div className="p-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
          <span className="text-gray-500">{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sorted.length)} / {sorted.length}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 bg-slate-800 rounded disabled:opacity-50">«</button>
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-2 py-1 bg-slate-800 rounded disabled:opacity-50">‹</button>
            <span className="px-3 text-gray-400">{page}/{totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="px-2 py-1 bg-slate-800 rounded disabled:opacity-50">›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2 py-1 bg-slate-800 rounded disabled:opacity-50">»</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Select
const Select = ({ options, value, onChange, placeholder, className = '' }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    className={`px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:border-purple-500 outline-none ${className}`}>
    <option value="">{placeholder}</option>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ==================== PUBLIC WEBSITE - PROFESSIONAL SAAS LANDING ====================
const PublicWebsite = ({ onLogin }) => {
  // Mock dashboard data for preview
  const mockTableData = [
    { date: '15.01.2025 14:32', site: 'istanbul-tesisat.com', ip: '185.42.xxx.xxx', city: 'Istanbul', device: 'Mobile', time: '2s', risk: 87, status: 'blocked' },
    { date: '15.01.2025 14:31', site: 'ankara-su.com', ip: '31.145.xxx.xxx', city: 'Ankara', device: 'Desktop', time: '45s', risk: 12, status: 'allowed' },
    { date: '15.01.2025 14:30', site: 'izmir-elektrik.com', ip: '104.21.xxx.xxx', city: 'Frankfurt', device: 'Desktop', time: '1s', risk: 94, status: 'blocked' },
    { date: '15.01.2025 14:29', site: 'bursa-tesisat.com', ip: '88.234.xxx.xxx', city: 'Bursa', device: 'Mobile', time: '32s', risk: 18, status: 'allowed' },
    { date: '15.01.2025 14:28', site: 'istanbul-tesisat.com', ip: '34.102.xxx.xxx', city: 'USA', device: 'Desktop', time: '0s', risk: 98, status: 'blocked' },
  ];

  const chartBars = [
    { label: 'Pzt', blocked: 45, allowed: 120 },
    { label: 'Sal', blocked: 52, allowed: 135 },
    { label: 'Çar', blocked: 38, allowed: 142 },
    { label: 'Per', blocked: 65, allowed: 128 },
    { label: 'Cum', blocked: 71, allowed: 156 },
    { label: 'Cmt', blocked: 42, allowed: 98 },
    { label: 'Paz', blocked: 35, allowed: 87 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-lg opacity-50" />
              <Shield className="relative h-9 w-9 text-purple-400" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">AdsKalkan</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white text-sm transition-colors">Özellikler</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white text-sm transition-colors">Nasıl Çalışır</a>
            <a href="#dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">Dashboard</a>
            <a href="#pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Fiyatlar</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onLogin} className="px-4 py-2 text-gray-300 hover:text-white text-sm transition-colors">
              Giriş Yap
            </button>
            <button onClick={onLogin} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-500/25">
              Ücretsiz Başla
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm mb-8 backdrop-blur-sm">
                <Zap className="h-4 w-4" />
                <span>Yapay Zeka Destekli Koruma</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-white">Google Ads</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Sahte Tıklama
                </span>
                <br />
                <span className="text-white">Koruma Sistemi</span>
              </h1>
              
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Bot trafiğini, click farm saldırılarını ve sahte tıklamaları 
                <span className="text-white font-medium"> gerçek zamanlı </span>
                tespit edip engelleyin. Reklam bütçenizi koruyun.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <button onClick={onLogin} className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl text-lg font-medium transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Ücretsiz Deneyin
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
                <button onClick={onLogin} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-lg font-medium transition-all backdrop-blur-sm flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Dashboard Görüntüle
                </button>
              </div>
              
              {/* Trust badges */}
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">10M+</p>
                  <p className="text-sm text-gray-500">Engellenen Bot</p>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">%99.9</p>
                  <p className="text-sm text-gray-500">Tespit Oranı</p>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">500+</p>
                  <p className="text-sm text-gray-500">Aktif Müşteri</p>
                </div>
              </div>
            </div>
            
            {/* Right - Dashboard Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-3xl" />
              <div className="relative bg-[#12121a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
                {/* Mini header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-400" />
                    <span className="text-sm font-medium">AdsKalkan Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-emerald-400">Canlı</span>
                  </div>
                </div>
                
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: 'Bugün Engellenen', value: '247', color: 'text-red-400', bg: 'bg-red-500/10' },
                    { label: 'Toplam Ziyaretçi', value: '1,842', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Koruma Oranı', value: '%28.4', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'Tasarruf', value: '₺618', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} rounded-lg p-2`}>
                      <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-[10px] text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
                
                {/* Mini chart */}
                <div className="bg-black/30 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Haftalık Trafik</span>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-500" />Engellenen</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500" />İzin</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-1 h-16">
                    {chartBars.map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-0.5">
                        <div className="flex-1 flex flex-col justify-end gap-0.5">
                          <div className="bg-purple-500 rounded-t" style={{ height: `${(bar.blocked / 80) * 100}%` }} />
                          <div className="bg-emerald-500/60 rounded-b" style={{ height: `${(bar.allowed / 200) * 100}%` }} />
                        </div>
                        <span className="text-[8px] text-gray-600 text-center">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Mini table */}
                <div className="bg-black/30 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Son Engellenenler</span>
                    <Activity className="h-3 w-3 text-red-400" />
                  </div>
                  <table className="w-full text-[10px]">
                    <thead className="bg-white/5">
                      <tr className="text-gray-500">
                        <th className="px-2 py-1.5 text-left">IP</th>
                        <th className="px-2 py-1.5 text-left">Şehir</th>
                        <th className="px-2 py-1.5 text-left">Cihaz</th>
                        <th className="px-2 py-1.5 text-left">Risk</th>
                        <th className="px-2 py-1.5 text-left">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {mockTableData.slice(0, 4).map((row, i) => (
                        <tr key={i} className="hover:bg-white/5">
                          <td className="px-2 py-1.5 font-mono text-gray-300">{row.ip}</td>
                          <td className="px-2 py-1.5 text-gray-400">{row.city}</td>
                          <td className="px-2 py-1.5 text-gray-400">{row.device}</td>
                          <td className="px-2 py-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${row.risk >= 70 ? 'bg-red-500/20 text-red-400' : row.risk >= 30 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {row.risk}
                            </span>
                          </td>
                          <td className="px-2 py-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${row.status === 'blocked' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {row.status === 'blocked' ? 'Engel' : 'İzin'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-400 text-sm font-medium uppercase tracking-wider">Özellikler</span>
            <h2 className="text-4xl font-bold mt-4 mb-4">Neden AdsKalkan?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Rakiplerden farklı olarak, çok katmanlı analiz motorumuz sahte trafiği %99.9 doğrulukla tespit eder.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Gerçek Zamanlı Bot Tespiti", desc: "Yapay zeka ile bot trafiğini anında tespit edin. Datacenter IP, VPN, Proxy ve TOR çıkışlarını otomatik engelleyin.", color: "purple", gradient: "from-purple-600/20 to-purple-600/0" },
              { icon: Hash, title: "IP & Cihaz Parmak İzi", desc: "Canvas, WebGL, font listesi ve 50+ parametre ile benzersiz cihaz kimliği oluşturun. Sahte cihazları tespit edin.", color: "blue", gradient: "from-blue-600/20 to-blue-600/0" },
              { icon: Layers, title: "Havuz Tabanlı Koruma", desc: "Sektör ve şehir bazlı havuzlarda tehdit bilgisi paylaşımı. Bir sitede tespit edilen IP, tüm havuzda engellenir.", color: "cyan", gradient: "from-cyan-600/20 to-cyan-600/0" },
              { icon: Target, title: "Google Ads GCLID Doğrulama", desc: "Google Ads tıklama ID'lerini doğrulayın. Manipüle edilmiş veya eksik GCLID'leri tespit edin.", color: "orange", gradient: "from-orange-600/20 to-orange-600/0" },
              { icon: Zap, title: "Otomatik Engelleme", desc: "Risk skoru eşiğini aşan trafik otomatik engellenir. Manuel müdahale gerektirmez, 7/24 koruma sağlar.", color: "green", gradient: "from-emerald-600/20 to-emerald-600/0" },
              { icon: BarChart3, title: "Detaylı Analitik", desc: "Şehir, cihaz, saat bazlı detaylı raporlar. PDF ve Excel formatında indirilebilir analizler.", color: "pink", gradient: "from-pink-600/20 to-pink-600/0" },
            ].map((feature, i) => (
              <div key={i} className={`group relative overflow-hidden bg-[#12121a]/50 backdrop-blur-sm border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className={`inline-flex p-3 rounded-xl bg-${feature.color}-500/10 text-${feature.color}-400 mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-400 text-sm font-medium uppercase tracking-wider">Nasıl Çalışır</span>
            <h2 className="text-4xl font-bold mt-4 mb-4">4 Adımda Koruma</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Tek satır kod ile entegre edin, gerisini biz halledelim.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Tracker Kurulumu", desc: "Sitenize tek satır JavaScript kodu ekleyin. 5 dakikada kurulum tamamlanır.", icon: Globe, color: "purple" },
              { step: "02", title: "Trafik Analizi", desc: "Her ziyaretçinin IP, cihaz, davranış ve fingerprint verilerini analiz ediyoruz.", icon: Activity, color: "blue" },
              { step: "03", title: "Risk Skorlama", desc: "5 katmanlı AI motoru ile 0-100 arası risk skoru hesaplıyoruz.", icon: AlertTriangle, color: "orange" },
              { step: "04", title: "Otomatik Engelleme", desc: "Yüksek riskli trafik anında engellenir, reklam bütçeniz korunur.", icon: ShieldCheck, color: "green" },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className={`text-6xl font-bold text-${item.color}-500/10 absolute -top-4 -left-2`}>{item.step}</div>
                <div className="relative bg-[#12121a]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 h-full">
                  <div className={`inline-flex p-3 rounded-xl bg-${item.color}-500/10 text-${item.color}-400 mb-4`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="dashboard" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-400 text-sm font-medium uppercase tracking-wider">Dashboard</span>
            <h2 className="text-4xl font-bold mt-4 mb-4">Güçlü Analitik Paneli</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Tüm verileri tek bir yerden izleyin, analiz edin ve raporlayın.
            </p>
          </div>
          
          {/* Full Dashboard Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10 rounded-3xl blur-3xl" />
            <div className="relative bg-[#0d0d14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/30">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-purple-400" />
                    <span className="font-bold">AdsKalkan</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-400">Canlı İzleme</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Son 7 Gün</span>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg hover:bg-white/10">
                    <Download className="h-4 w-4" /> Export
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* KPI Row */}
                <div className="grid grid-cols-6 gap-4 mb-6">
                  {[
                    { label: 'Toplam Ziyaretçi', value: '24,847', change: '+12.5%', up: true, icon: Eye, color: 'blue' },
                    { label: 'Engellenen', value: '6,218', change: '+8.3%', up: true, icon: Ban, color: 'red' },
                    { label: 'İzin Verilen', value: '18,629', change: '+15.2%', up: true, icon: CheckCircle, color: 'green' },
                    { label: 'Koruma Oranı', value: '%25.0', change: '-2.1%', up: false, icon: Shield, color: 'purple' },
                    { label: 'Engelli IP', value: '1,842', change: '+5.7%', up: true, icon: AlertTriangle, color: 'orange' },
                    { label: 'Tahmini Tasarruf', value: '₺15,545', change: '+18.4%', up: true, icon: TrendingUp, color: 'cyan' },
                  ].map((kpi, i) => (
                    <div key={i} className={`bg-${kpi.color}-500/5 border border-${kpi.color}-500/20 rounded-xl p-4`}>
                      <div className="flex items-start justify-between mb-2">
                        <kpi.icon className={`h-5 w-5 text-${kpi.color}-400`} />
                        <span className={`text-xs ${kpi.up ? 'text-emerald-400' : 'text-red-400'}`}>{kpi.change}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{kpi.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
                    </div>
                  ))}
                </div>
                
                {/* Charts Row */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                  {/* Traffic Chart */}
                  <div className="col-span-2 bg-black/30 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium flex items-center gap-2"><BarChart3 className="h-4 w-4 text-purple-400" /> Günlük Trafik</h3>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500" />Engellenen</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" />İzin Verilen</span>
                      </div>
                    </div>
                    <div className="flex items-end gap-2 h-40">
                      {Array.from({ length: 14 }, (_, i) => {
                        const blocked = Math.floor(Math.random() * 400) + 100;
                        const allowed = Math.floor(Math.random() * 800) + 400;
                        return (
                          <div key={i} className="flex-1 flex flex-col gap-1">
                            <div className="flex-1 flex flex-col justify-end gap-0.5">
                              <div className="bg-red-500 rounded-t" style={{ height: `${(blocked / 500) * 100}%` }} />
                              <div className="bg-emerald-500/70 rounded-b" style={{ height: `${(allowed / 1200) * 100}%` }} />
                            </div>
                            <span className="text-[9px] text-gray-600 text-center">{i + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Risk Distribution */}
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                    <h3 className="font-medium flex items-center gap-2 mb-4"><PieChart className="h-4 w-4 text-orange-400" /> Risk Dağılımı</h3>
                    <div className="flex items-center justify-center gap-6">
                      <svg viewBox="0 0 100 100" className="w-28 h-28">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="20" strokeDasharray="62.8 188.4" transform="rotate(-90 50 50)" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#eab308" strokeWidth="20" strokeDasharray="50.2 188.4" strokeDashoffset="-62.8" transform="rotate(-90 50 50)" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="20" strokeDasharray="37.7 188.4" strokeDashoffset="-113" transform="rotate(-90 50 50)" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray="37.7 188.4" strokeDashoffset="-150.7" transform="rotate(-90 50 50)" />
                        <circle cx="50" cy="50" r="25" fill="#0d0d14" />
                      </svg>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500" />Düşük: 8,420</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-yellow-500" />Orta: 6,842</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-orange-500" />Yüksek: 5,124</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-500" />Kritik: 4,461</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Data Table */}
                <div className="bg-black/30 border border-white/5 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-medium flex items-center gap-2"><Eye className="h-4 w-4 text-blue-400" /> Son Ziyaretçiler</h3>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />
                        <input type="text" placeholder="Ara..." className="pl-7 pr-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs w-40" />
                      </div>
                      <button className="flex items-center gap-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs">
                        <Filter className="h-3 w-3" /> Filtre
                      </button>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 text-xs text-gray-500 uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left">Tarih</th>
                        <th className="px-4 py-3 text-left">Website</th>
                        <th className="px-4 py-3 text-left">IP Adresi</th>
                        <th className="px-4 py-3 text-left">Şehir</th>
                        <th className="px-4 py-3 text-left">Cihaz</th>
                        <th className="px-4 py-3 text-left">Süre</th>
                        <th className="px-4 py-3 text-left">Risk</th>
                        <th className="px-4 py-3 text-left">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {mockTableData.map((row, i) => (
                        <tr key={i} className="hover:bg-white/5">
                          <td className="px-4 py-3 text-gray-400 text-xs">{row.date}</td>
                          <td className="px-4 py-3 text-purple-400">{row.site}</td>
                          <td className="px-4 py-3 font-mono text-white">{row.ip}</td>
                          <td className="px-4 py-3 text-gray-400">{row.city}</td>
                          <td className="px-4 py-3 text-gray-400">{row.device}</td>
                          <td className="px-4 py-3 text-gray-400">{row.time}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${row.risk >= 70 ? 'bg-red-500/20 text-red-400' : row.risk >= 30 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {row.risk}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${row.status === 'blocked' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {row.status === 'blocked' ? 'Engellendi' : 'İzin'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 px-6 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-400 text-sm font-medium uppercase tracking-wider">Fiyatlandırma</span>
            <h2 className="text-4xl font-bold mt-4 mb-4">Şeffaf Fiyatlar</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              İhtiyacınıza uygun paketi seçin. Tüm paketlerde 7 gün ücretsiz deneme.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { 
                name: "Starter", 
                price: "₺499", 
                period: "/ay", 
                desc: "Küçük işletmeler için",
                features: ["3 site", "10.000 ziyaretçi/ay", "Temel koruma", "Email destek", "7 gün veri saklama"],
                popular: false,
                cta: "Başla"
              },
              { 
                name: "Professional", 
                price: "₺999", 
                period: "/ay",
                desc: "Büyüyen işletmeler için", 
                features: ["10 site", "50.000 ziyaretçi/ay", "Gelişmiş koruma", "Havuz erişimi", "Öncelikli destek", "30 gün veri saklama", "API erişimi"],
                popular: true,
                cta: "Ücretsiz Dene"
              },
              { 
                name: "Enterprise", 
                price: "₺2.499", 
                period: "/ay",
                desc: "Kurumsal şirketler için", 
                features: ["Sınırsız site", "Sınırsız ziyaretçi", "Tam koruma", "Özel havuz", "7/24 destek", "90 gün veri saklama", "Tam API erişimi", "SLA garantisi"],
                popular: false,
                cta: "İletişime Geç"
              },
            ].map((plan, i) => (
              <div key={i} className={`relative rounded-2xl p-6 ${plan.popular ? 'bg-gradient-to-b from-purple-600/20 to-blue-600/10 border-2 border-purple-500/50' : 'bg-[#12121a]/50 border border-white/5'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-xs font-medium">
                    En Popüler
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{plan.desc}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button onClick={onLogin} className={`w-full py-3 rounded-xl font-medium transition-all ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 border border-white/10 rounded-3xl p-12 text-center">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            <div className="relative">
              <h2 className="text-4xl font-bold mb-4">Reklam Bütçenizi Korumaya Başlayın</h2>
              <p className="text-gray-400 mb-8 text-lg">
                7 gün ücretsiz deneme ile AdsKalkan'ı test edin. Kredi kartı gerekmez.
              </p>
              <div className="flex gap-4 justify-center">
                <button onClick={onLogin} className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl text-lg font-medium shadow-lg shadow-purple-500/25 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Ücretsiz Başla
                </button>
                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-lg font-medium flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Demo Randevusu
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-16 px-6 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-8 w-8 text-purple-500" />
                <span className="text-xl font-bold">AdsKalkan</span>
              </div>
              <p className="text-gray-400 text-sm mb-6 max-w-xs">
                Google Ads sahte tıklama koruma platformu. Yapay zeka destekli gerçek zamanlı tehdit tespiti.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors">
                  <Globe className="h-5 w-5 text-gray-400" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors">
                  <Mail className="h-5 w-5 text-gray-400" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Ürün</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Özellikler</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Fiyatlar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Dokümantasyonu</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Entegrasyonlar</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Şirket</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kariyer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Basın</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">İletişim</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>info@adskalkan.com</li>
                <li>+90 212 123 45 67</li>
                <li>Istanbul, Türkiye</li>
                <li><button onClick={onLogin} className="text-purple-400 hover:text-purple-300 transition-colors">Giriş Yap →</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2025 AdsKalkan. Tüm hakları saklıdır.</p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a>
              <a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a>
              <a href="#" className="hover:text-white transition-colors">KVKK</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Mail icon for footer
const Mail = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

// ==================== LOGIN ====================
const LoginPage = ({ onSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onSuccess(res.data.user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Giriş başarısız');
    } finally { setLoading(false); }
  };
  
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Shield className="h-10 w-10 text-purple-500 mx-auto mb-2" />
          <h1 className="text-xl font-bold text-white">AdsKalkan</h1>
          <p className="text-sm text-gray-500">Yönetim Paneli</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          {onBack && (
            <button onClick={onBack} className="text-gray-500 hover:text-white mb-4 flex items-center gap-1 text-sm">
              <ChevronLeft className="h-4 w-4" /> Geri
            </button>
          )}
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-purple-500 outline-none" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Şifre"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-purple-500 outline-none" required />
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded font-medium text-white text-sm disabled:opacity-50">
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN DASHBOARD ====================
const AdminDashboard = ({ user, onLogout }) => {
  const [tab, setTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('7d');
  const [collapsed, setCollapsed] = useState(false);
  const [filters, setFilters] = useState({ site: '', city: '', device: '', risk: '', status: '', ipType: '' });
  
  const isSuperAdmin = user?.role === 'super_admin';
  
  // Stats
  const stats = useMemo(() => {
    const total = MOCK_VISITORS.length;
    const blocked = MOCK_VISITORS.filter(v => v.is_blocked).length;
    const uniqueIPs = new Set(MOCK_VISITORS.map(v => v.ip_address)).size;
    const blockedIPs = new Set(MOCK_VISITORS.filter(v => v.is_blocked).map(v => v.ip_address)).size;
    const avgRisk = (MOCK_VISITORS.reduce((s, v) => s + v.risk_score, 0) / total).toFixed(1);
    const savings = blocked * 2.5;
    const critical = MOCK_VISITORS.filter(v => v.risk_level === 'critical').length;
    const high = MOCK_VISITORS.filter(v => v.risk_level === 'high').length;
    const medium = MOCK_VISITORS.filter(v => v.risk_level === 'medium').length;
    const low = MOCK_VISITORS.filter(v => v.risk_level === 'low').length;
    const datacenter = MOCK_VISITORS.filter(v => v.ip_type === 'datacenter').length;
    const vpn = MOCK_VISITORS.filter(v => v.ip_type === 'vpn' || v.ip_type === 'proxy').length;
    const poolThreats = MOCK_POOLS.reduce((s, p) => s + p.shared_threats, 0);
    return { total, blocked, allowed: total - blocked, rate: ((blocked / total) * 100).toFixed(1), uniqueIPs, blockedIPs, avgRisk, savings, critical, high, medium, low, datacenter, vpn, poolThreats };
  }, []);
  
  // Risk distribution for chart
  const riskDist = [
    { label: 'Düşük', value: stats.low, color: '#22c55e' },
    { label: 'Orta', value: stats.medium, color: '#eab308' },
    { label: 'Yüksek', value: stats.high, color: '#f97316' },
    { label: 'Kritik', value: stats.critical, color: '#ef4444' },
  ];
  
  // City stats
  const cityStats = useMemo(() => {
    const counts = {};
    MOCK_VISITORS.filter(v => v.is_blocked).forEach(v => counts[v.city] = (counts[v.city] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([city, count]) => ({ city, count }));
  }, []);
  
  // Device stats
  const deviceStats = useMemo(() => {
    const counts = { desktop: 0, mobile: 0, tablet: 0 };
    MOCK_VISITORS.forEach(v => counts[v.device_type]++);
    return [
      { label: 'Desktop', value: counts.desktop, color: '#3b82f6' },
      { label: 'Mobile', value: counts.mobile, color: '#8b5cf6' },
      { label: 'Tablet', value: counts.tablet, color: '#06b6d4' },
    ];
  }, []);
  
  // IP Type stats
  const ipTypeStats = useMemo(() => {
    const counts = {};
    MOCK_VISITORS.forEach(v => counts[v.ip_type] = (counts[v.ip_type] || 0) + 1);
    return [
      { label: 'Residential', value: counts.residential || 0, color: '#22c55e' },
      { label: 'Datacenter', value: counts.datacenter || 0, color: '#ef4444' },
      { label: 'VPN', value: counts.vpn || 0, color: '#f97316' },
      { label: 'Proxy', value: counts.proxy || 0, color: '#eab308' },
      { label: 'TOR', value: counts.tor || 0, color: '#dc2626' },
    ];
  }, []);
  
  // Hourly chart data
  const hourlyChartData = HOURLY_STATS.map(h => ({ value: h.blocked, color: '#8b5cf6' }));
  
  // Filtered visitors
  const filteredVisitors = useMemo(() => {
    return MOCK_VISITORS.filter(v => {
      if (filters.site && v.site_id !== filters.site) return false;
      if (filters.city && v.city !== filters.city) return false;
      if (filters.device && v.device_type !== filters.device) return false;
      if (filters.risk && v.risk_level !== filters.risk) return false;
      if (filters.status === 'blocked' && !v.is_blocked) return false;
      if (filters.status === 'allowed' && v.is_blocked) return false;
      if (filters.ipType && v.ip_type !== filters.ipType) return false;
      return true;
    });
  }, [filters]);
  
  // Table columns
  const visitorCols = [
    { key: 'created_at', label: 'Tarih', width: '130px', render: v => <span className="text-gray-400 text-[11px]">{formatDate(v)}</span> },
    { key: 'site_name', label: 'Site', render: v => <span className="text-purple-400 font-medium text-xs">{v}</span> },
    { key: 'ip_address', label: 'IP Adresi', render: v => <span className="font-mono text-white text-xs">{v}</span> },
    { key: 'ip_type', label: 'IP Tipi', render: v => <Badge type={v} size="xs" /> },
    { key: 'city', label: 'Şehir', render: (v, r) => <span className="text-gray-400 text-xs">{v}</span> },
    { key: 'device_type', label: 'Cihaz', render: v => <div className="flex items-center gap-1"><DeviceIcon type={v} /><span className="text-gray-400 text-xs capitalize">{v}</span></div> },
    { key: 'browser', label: 'Tarayıcı', render: (v, r) => <span className="text-gray-400 text-xs">{v}</span> },
    { key: 'os', label: 'OS', render: v => <span className="text-gray-400 text-xs">{v}</span> },
    { key: 'time_on_page', label: 'Süre', render: v => <span className="text-gray-400 text-xs">{v}s</span> },
    { key: 'mouse_movements', label: 'Mouse', render: v => <span className={`text-xs ${v < 10 ? 'text-red-400' : 'text-gray-400'}`}>{v}</span> },
    { key: 'risk_score', label: 'Risk', render: v => <RiskScore score={v} /> },
    { key: 'risk_level', label: 'Seviye', render: v => <Badge type={v} size="xs" /> },
    { key: 'is_blocked', label: 'Durum', render: v => <Badge type={v ? 'blocked' : 'allowed'} size="xs" /> },
  ];
  
  const siteCols = [
    { key: 'name', label: 'Site Adı', render: v => <span className="text-white font-medium text-xs">{v}</span> },
    { key: 'domain', label: 'Domain', render: v => <span className="text-purple-400 text-xs">{v}</span> },
    { key: 'pool', label: 'Havuz', render: v => <span className="text-gray-400 text-xs">{v}</span> },
    { key: 'total_visitors', label: 'Toplam', render: v => <span className="text-white text-xs">{formatNumber(v)}</span> },
    { key: 'blocked_visitors', label: 'Engellenen', render: v => <span className="text-red-400 text-xs">{formatNumber(v)}</span> },
    { key: 'allowed_visitors', label: 'İzin', render: v => <span className="text-emerald-400 text-xs">{formatNumber(v)}</span> },
    { key: 'protection_rate', label: 'Koruma %', render: v => <span className={`text-xs font-medium ${parseFloat(v) > 25 ? 'text-red-400' : 'text-emerald-400'}`}>{v}%</span> },
    { key: 'avg_risk_score', label: 'Ort. Risk', render: v => <span className="text-gray-400 text-xs">{v}</span> },
    { key: 'is_active', label: 'Durum', render: v => <Badge type={v ? 'active' : 'inactive'} size="xs" /> },
  ];
  
  const poolCols = [
    { key: 'name', label: 'Havuz Adı', render: v => <span className="text-white font-medium text-xs">{v}</span> },
    { key: 'sector', label: 'Sektör', render: v => <span className="text-purple-400 text-xs">{v}</span> },
    { key: 'city', label: 'Şehir', render: v => <span className="text-gray-400 text-xs">{v}</span> },
    { key: 'sites_count', label: 'Site', render: v => <span className="text-white text-xs">{v}</span> },
    { key: 'blocked_ips', label: 'Engelli IP', render: v => <span className="text-orange-400 text-xs">{formatNumber(v)}</span> },
    { key: 'blocked_clicks', label: 'Engelli Tık', render: v => <span className="text-red-400 text-xs">{formatNumber(v)}</span> },
    { key: 'shared_threats', label: 'Paylaşılan', render: v => <span className="text-cyan-400 text-xs">{formatNumber(v)}</span> },
    { key: 'is_active', label: 'Durum', render: v => <Badge type={v ? 'active' : 'inactive'} size="xs" /> },
  ];
  
  const blockedIPCols = [
    { key: 'ip_address', label: 'IP Adresi', render: v => <span className="font-mono text-white text-xs">{v}</span> },
    { key: 'ip_type', label: 'IP Tipi', render: v => <Badge type={v} size="xs" /> },
    { key: 'isp', label: 'ISP', render: v => <span className="text-gray-400 text-xs">{v}</span> },
    { key: 'city', label: 'Şehir', render: v => <span className="text-gray-400 text-xs">{v}</span> },
    { key: 'total_visits', label: 'Ziyaret', render: v => <span className="text-white text-xs">{v}</span> },
    { key: 'blocked_count', label: 'Engel', render: v => <span className="text-red-400 text-xs">{v}</span> },
    { key: 'risk_score', label: 'Risk', render: v => <RiskScore score={v} /> },
    { key: 'blocked_reason', label: 'Sebep', render: v => <span className="text-gray-400 text-xs truncate max-w-[150px] block">{v}</span> },
    { key: 'affected_sites', label: 'Etkilenen', render: v => <span className="text-orange-400 text-xs">{v} site</span> },
    { key: 'is_global', label: 'Global', render: v => v ? <Badge type="active" size="xs" /> : <Badge type="inactive" size="xs" /> },
    { key: 'last_seen', label: 'Son Görülme', render: v => <span className="text-gray-500 text-[11px]">{formatDateShort(v)}</span> },
  ];
  
  const userCols = [
    { key: 'full_name', label: 'Ad Soyad', render: (v, r) => <div><span className="text-white text-xs font-medium">{v}</span><br/><span className="text-gray-500 text-[10px]">{r.email}</span></div> },
    { key: 'company', label: 'Şirket', render: v => <span className="text-gray-400 text-xs">{v}</span> },
    { key: 'phone', label: 'Telefon', render: v => <span className="text-gray-400 text-xs">{v}</span> },
    { key: 'role', label: 'Rol', render: v => <span className={`px-2 py-0.5 rounded text-[10px] ${v === 'super_admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{v === 'super_admin' ? 'Süper Admin' : 'Müşteri'}</span> },
    { key: 'package', label: 'Paket', render: v => <span className="text-cyan-400 text-xs">{v}</span> },
    { key: 'sites_count', label: 'Site', render: v => <span className="text-white text-xs">{v}</span> },
    { key: 'monthly_visitors', label: 'Aylık Ziyaret', render: v => <span className="text-gray-400 text-xs">{formatNumber(v)}</span> },
    { key: 'status', label: 'Durum', render: v => <Badge type={v} size="xs" /> },
    { key: 'last_login', label: 'Son Giriş', render: v => <span className="text-gray-500 text-[10px]">{v ? formatDateShort(v) : '-'}</span> },
  ];
  
  const menu = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'sites', label: 'Siteler', icon: Globe },
    { id: 'pools', label: 'Havuzlar', icon: Layers },
    { id: 'visitors', label: 'Ziyaretçiler', icon: Eye },
    { id: 'blocked', label: 'Engelli IPler', icon: Ban },
    { id: 'analytics', label: 'Analitik', icon: BarChart3 },
    { id: 'reports', label: 'Raporlar', icon: FileText },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];
  
  const superMenu = [
    { id: 'users', label: 'Kullanıcılar', icon: Users },
    { id: 'packages', label: 'Paketler', icon: Package },
    { id: 'campaigns', label: 'Kampanyalar', icon: Megaphone },
    { id: 'system', label: 'Sistem Logları', icon: Server },
  ];
  
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-14' : 'w-48'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all flex-shrink-0`}>
        <div className="p-3 border-b border-slate-800 flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-500 flex-shrink-0" />
          {!collapsed && <span className="font-bold text-sm">AdsKalkan</span>}
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {menu.map(m => (
            <button key={m.id} onClick={() => setTab(m.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${tab === m.id ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:bg-slate-800 hover:text-white border border-transparent'}`}>
              <m.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{m.label}</span>}
            </button>
          ))}
          {isSuperAdmin && (
            <>
              <div className="pt-3 pb-1">{!collapsed && <span className="text-[10px] text-gray-600 uppercase px-2">Süper Admin</span>}</div>
              {superMenu.map(m => (
                <button key={m.id} onClick={() => setTab(m.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs transition-all ${tab === m.id ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:bg-slate-800 hover:text-white border border-transparent'}`}>
                  <m.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>{m.label}</span>}
                </button>
              ))}
            </>
          )}
        </nav>
        <div className="p-2 border-t border-slate-800">
          <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-white rounded hover:bg-slate-800">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>
      
      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-sm">{menu.find(m => m.id === tab)?.label || superMenu.find(m => m.id === tab)?.label}</h1>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${isSuperAdmin ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
              {isSuperAdmin ? 'Süper Admin' : 'Admin'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded border border-slate-700">
              <Calendar className="h-3 w-3 text-gray-400" />
              <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="bg-transparent text-xs text-white outline-none">
                <option value="today">Bugün</option>
                <option value="7d">Son 7 Gün</option>
                <option value="30d">Son 30 Gün</option>
                <option value="90d">Son 90 Gün</option>
              </select>
            </div>
            <button className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded border border-slate-700 text-xs">
              <Download className="h-3 w-3" /> Export
            </button>
            <button className="p-1.5 bg-slate-800 rounded border border-slate-700"><RefreshCw className="h-3 w-3" /></button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
              <div className="text-right">
                <p className="text-xs font-medium">{user?.full_name}</p>
                <p className="text-[10px] text-gray-500">{user?.email}</p>
              </div>
              <button onClick={onLogout} className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-red-500/10">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-auto p-4">
          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <div className="space-y-4">
              {/* Row 1: Primary KPIs */}
              <div className="grid grid-cols-8 gap-3">
                <KPICard label="Toplam Ziyaretçi" value={formatNumber(stats.total)} icon={Eye} color="blue" trend="up" trendValue="+12.5%" small />
                <KPICard label="Engellenen" value={formatNumber(stats.blocked)} icon={Ban} color="red" trend="up" trendValue="+8.3%" small />
                <KPICard label="İzin Verilen" value={formatNumber(stats.allowed)} icon={CheckCircle} color="green" small />
                <KPICard label="Koruma Oranı" value={`${stats.rate}%`} icon={Shield} color="purple" small />
                <KPICard label="Benzersiz IP" value={formatNumber(stats.uniqueIPs)} icon={Hash} color="cyan" small />
                <KPICard label="Engelli IP" value={formatNumber(stats.blockedIPs)} icon={ShieldX} color="orange" small />
                <KPICard label="Ort. Risk" value={stats.avgRisk} icon={AlertTriangle} color="yellow" small />
                <KPICard label="Tasarruf" value={formatCurrency(stats.savings)} icon={TrendingUp} color="green" trend="up" trendValue="+₺1.2K" small />
              </div>
              
              {/* Row 2: Secondary Stats */}
              <div className="grid grid-cols-6 gap-3">
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Kritik Risk</span>
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  </div>
                  <p className="text-xl font-bold text-red-400">{formatNumber(stats.critical)}</p>
                  <ProgressBar value={stats.critical} max={stats.total} color="#ef4444" showLabel={false} height={4} />
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Yüksek Risk</span>
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                  </div>
                  <p className="text-xl font-bold text-orange-400">{formatNumber(stats.high)}</p>
                  <ProgressBar value={stats.high} max={stats.total} color="#f97316" showLabel={false} height={4} />
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Datacenter IP</span>
                    <Server className="h-4 w-4 text-red-400" />
                  </div>
                  <p className="text-xl font-bold text-red-400">{formatNumber(stats.datacenter)}</p>
                  <ProgressBar value={stats.datacenter} max={stats.total} color="#ef4444" showLabel={false} height={4} />
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">VPN/Proxy</span>
                    <Zap className="h-4 w-4 text-orange-400" />
                  </div>
                  <p className="text-xl font-bold text-orange-400">{formatNumber(stats.vpn)}</p>
                  <ProgressBar value={stats.vpn} max={stats.total} color="#f97316" showLabel={false} height={4} />
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Havuz Tehditleri</span>
                    <Layers className="h-4 w-4 text-cyan-400" />
                  </div>
                  <p className="text-xl font-bold text-cyan-400">{formatNumber(stats.poolThreats)}</p>
                  <span className="text-[10px] text-gray-500">{MOCK_POOLS.length} havuzdan</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Aktif Site</span>
                    <Globe className="h-4 w-4 text-purple-400" />
                  </div>
                  <p className="text-xl font-bold text-purple-400">{MOCK_SITES.filter(s => s.is_active).length}</p>
                  <span className="text-[10px] text-gray-500">{MOCK_SITES.length} toplam</span>
                </div>
              </div>
              
              {/* Row 3: Charts */}
              <div className="grid grid-cols-4 gap-4">
                {/* Risk Distribution */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                  <h3 className="text-xs font-semibold mb-3 flex items-center gap-2"><PieChart className="h-4 w-4 text-purple-400" /> Risk Dağılımı</h3>
                  <div className="flex items-center gap-4">
                    <DonutChart data={riskDist} size={80} />
                    <div className="space-y-1">
                      {riskDist.map(d => (
                        <div key={d.label} className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded" style={{ backgroundColor: d.color }} />
                          <span className="text-gray-400">{d.label}:</span>
                          <span className="text-white font-medium">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Device Distribution */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                  <h3 className="text-xs font-semibold mb-3 flex items-center gap-2"><Laptop className="h-4 w-4 text-blue-400" /> Cihaz Dağılımı</h3>
                  <div className="flex items-center gap-4">
                    <DonutChart data={deviceStats} size={80} />
                    <div className="space-y-1">
                      {deviceStats.map(d => (
                        <div key={d.label} className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded" style={{ backgroundColor: d.color }} />
                          <span className="text-gray-400">{d.label}:</span>
                          <span className="text-white font-medium">{formatNumber(d.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* IP Type Distribution */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                  <h3 className="text-xs font-semibold mb-3 flex items-center gap-2"><Database className="h-4 w-4 text-orange-400" /> IP Tipi Dağılımı</h3>
                  <div className="flex items-center gap-4">
                    <DonutChart data={ipTypeStats} size={80} />
                    <div className="space-y-1">
                      {ipTypeStats.slice(0, 4).map(d => (
                        <div key={d.label} className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded" style={{ backgroundColor: d.color }} />
                          <span className="text-gray-400">{d.label}:</span>
                          <span className="text-white font-medium">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Hourly Activity */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                  <h3 className="text-xs font-semibold mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-cyan-400" /> Saatlik Engelleme</h3>
                  <MiniBarChart data={hourlyChartData} height={80} />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
                  </div>
                </div>
              </div>
              
              {/* Row 4: City Stats */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                <h3 className="text-xs font-semibold mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan-400" /> Şehir Bazlı Engelleme</h3>
                <div className="grid grid-cols-8 gap-4">
                  {cityStats.map((c, i) => (
                    <div key={c.city} className="text-center">
                      <p className="text-lg font-bold text-white">{formatNumber(c.count)}</p>
                      <p className="text-xs text-gray-400">{c.city}</p>
                      <ProgressBar value={c.count} max={cityStats[0].count} color={['#8b5cf6', '#3b82f6', '#06b6d4', '#22c55e', '#eab308', '#f97316', '#ef4444', '#ec4899'][i]} showLabel={false} height={3} />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Row 5: Tables */}
              <div className="grid grid-cols-2 gap-4">
                <DataTable title="Son Engellenenler" columns={visitorCols.slice(0, 8)} data={MOCK_VISITORS.filter(v => v.is_blocked).slice(0, 50)} pageSize={8} compact />
                <DataTable title="Site Performansı" columns={siteCols} data={MOCK_SITES} pageSize={8} compact />
              </div>
              
              {/* Row 6: Pools */}
              <DataTable title="Havuz Performansı" columns={poolCols} data={MOCK_POOLS} pageSize={10} compact />
            </div>
          )}
          
          {/* SITES */}
          {tab === 'sites' && <DataTable title="Tüm Siteler" columns={siteCols} data={MOCK_SITES} pageSize={25} onExport={() => alert('Export')} />}
          
          {/* POOLS */}
          {tab === 'pools' && <DataTable title="Tüm Havuzlar (Sektör + Şehir)" columns={poolCols} data={MOCK_POOLS} pageSize={25} onExport={() => alert('Export')} />}
          
          {/* VISITORS */}
          {tab === 'visitors' && (
            <DataTable title="Tüm Ziyaretçiler" columns={visitorCols} data={filteredVisitors} pageSize={25} onExport={() => alert('Export')}
              filters={
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="h-3 w-3 text-gray-500" />
                  <Select options={SITES.map(s => ({ value: s.id, label: s.name }))} value={filters.site} onChange={v => setFilters({ ...filters, site: v })} placeholder="Tüm Siteler" className="w-32" />
                  <Select options={CITIES.map(c => ({ value: c, label: c }))} value={filters.city} onChange={v => setFilters({ ...filters, city: v })} placeholder="Tüm Şehirler" className="w-28" />
                  <Select options={DEVICES.map(d => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) }))} value={filters.device} onChange={v => setFilters({ ...filters, device: v })} placeholder="Tüm Cihazlar" className="w-28" />
                  <Select options={IP_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))} value={filters.ipType} onChange={v => setFilters({ ...filters, ipType: v })} placeholder="Tüm IP Tipleri" className="w-32" />
                  <Select options={[{ value: 'critical', label: 'Kritik' }, { value: 'high', label: 'Yüksek' }, { value: 'medium', label: 'Orta' }, { value: 'low', label: 'Düşük' }]} value={filters.risk} onChange={v => setFilters({ ...filters, risk: v })} placeholder="Tüm Risk" className="w-24" />
                  <Select options={[{ value: 'blocked', label: 'Engellendi' }, { value: 'allowed', label: 'İzin' }]} value={filters.status} onChange={v => setFilters({ ...filters, status: v })} placeholder="Tüm Durum" className="w-28" />
                  <button onClick={() => setFilters({ site: '', city: '', device: '', risk: '', status: '', ipType: '' })} className="px-2 py-1 bg-slate-700 rounded text-xs">Temizle</button>
                </div>
              }
            />
          )}
          
          {/* BLOCKED IPS */}
          {tab === 'blocked' && <DataTable title="Engelli IP Adresleri" columns={blockedIPCols} data={MOCK_BLOCKED_IPS} pageSize={25} onExport={() => alert('Export')} />}
          
          {/* ANALYTICS */}
          {tab === 'analytics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {cityStats.map((c, i) => (
                  <div key={c.city} className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{c.city}</span>
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-purple-400">{formatNumber(c.count)}</p>
                    <p className="text-xs text-gray-500">Engellenen tıklama</p>
                    <ProgressBar value={c.count} max={cityStats[0].count} color="#8b5cf6" showLabel={false} height={4} />
                  </div>
                ))}
              </div>
              <DataTable title="Detaylı Analiz" columns={visitorCols} data={filteredVisitors} pageSize={30} onExport={() => alert('Export')} />
            </div>
          )}
          
          {/* USERS (Super Admin) */}
          {tab === 'users' && isSuperAdmin && <DataTable title="Kullanıcı Yönetimi" columns={userCols} data={MOCK_USERS} pageSize={25} onExport={() => alert('Export')} />}
          
          {/* Other tabs */}
          {['reports', 'settings', 'packages', 'campaigns', 'system'].includes(tab) && (
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-8 text-center">
              <Settings className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">{menu.find(m => m.id === tab)?.label || superMenu.find(m => m.id === tab)?.label}</h3>
              <p className="text-gray-500 text-sm">Bu bölüm geliştirme aşamasında...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// ==================== APP ====================
function App() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    if (token && saved) setUser(JSON.parse(saved));
  }, []);
  
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); };
  const handleLogin = (u) => setUser(u);
  
  if (!user) return <LoginPage onSuccess={handleLogin} />;
  return <AdminDashboard user={user} onLogout={handleLogout} />;
}

export default App;
