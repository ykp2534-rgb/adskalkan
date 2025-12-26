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

// ==================== PUBLIC WEBSITE ====================
const PublicWebsite = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-purple-500" />
            <span className="text-xl font-bold">AdsKalkan</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-gray-400 hover:text-white text-sm">Özellikler</a>
            <a href="#pricing" className="text-gray-400 hover:text-white text-sm">Fiyatlar</a>
            <a href="#contact" className="text-gray-400 hover:text-white text-sm">İletişim</a>
            <button onClick={onLogin} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium">
              Giriş Yap
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm mb-8">
            <Zap className="h-4 w-4" />
            Yapay Zeka Destekli Koruma
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Google Ads Bütçenizi
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Sahte Tıklamalardan
            </span>
            <br />
            Koruyun
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            Gelişmiş yapay zeka ile bot trafiğini, click farm saldırılarını ve sahte tıklamaları
            gerçek zamanlı tespit edip engelleyin.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={onLogin} className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl text-lg font-medium">
              Ücretsiz Deneyin
            </button>
            <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-lg font-medium">
              Demo İzle
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-400">10M+</p>
              <p className="text-gray-400 mt-2">Engellenen Bot</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-400">500+</p>
              <p className="text-gray-400 mt-2">Aktif Müşteri</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-emerald-400">%99.9</p>
              <p className="text-gray-400 mt-2">Tespit Oranı</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-400">₺2.5M+</p>
              <p className="text-gray-400 mt-2">Tasarruf</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Neden AdsKalkan?</h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Çok Katmanlı Koruma", desc: "IP, cihaz, davranış, fingerprint ve pattern analizi ile 5 katmanlı koruma.", color: "purple" },
              { icon: Layers, title: "Havuz Sistemi", desc: "Sektördeki sitelerle tehdit bilgisi paylaşımı. Bir sitede tespit, hepsinde engel.", color: "blue" },
              { icon: Activity, title: "Gerçek Zamanlı İzleme", desc: "Canlı dashboard ile anlık saldırı tespiti ve otomatik engelleme.", color: "cyan" },
              { icon: BarChart3, title: "Detaylı Analitik", desc: "Şehir, cihaz, saat bazlı detaylı raporlar ve indirilebilir analizler.", color: "orange" },
              { icon: Zap, title: "Kolay Entegrasyon", desc: "Tek satır kod ile sitenize entegre edin. 5 dakikada koruma başlasın.", color: "green" },
              { icon: Target, title: "Google Ads Entegrasyonu", desc: "Tespit edilen IP'leri otomatik olarak Google Ads'e gönderin.", color: "red" },
            ].map((f, i) => (
              <div key={i} className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-all">
                <f.icon className={`h-10 w-10 text-${f.color}-400 mb-4`} />
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Fiyatlandırma</h2>
          <p className="text-gray-400 text-center mb-12">İhtiyacınıza uygun paketi seçin</p>
          <div className="grid grid-cols-3 gap-8">
            {[
              { name: "Starter", price: "₺499", period: "/ay", features: ["3 site", "10.000 ziyaretçi/ay", "Temel koruma", "Email destek"], popular: false },
              { name: "Professional", price: "₺999", period: "/ay", features: ["10 site", "50.000 ziyaretçi/ay", "Gelişmiş koruma", "Havuz erişimi", "Öncelikli destek"], popular: true },
              { name: "Enterprise", price: "₺2.499", period: "/ay", features: ["Sınırsız site", "Sınırsız ziyaretçi", "Tam koruma", "API erişimi", "Özel destek", "SLA garantisi"], popular: false },
            ].map((p, i) => (
              <div key={i} className={`p-6 rounded-xl border ${p.popular ? 'bg-purple-600/10 border-purple-500/50' : 'bg-slate-900 border-slate-800'}`}>
                {p.popular && <span className="text-xs text-purple-400 font-medium">EN POPÜLER</span>}
                <h3 className="text-xl font-bold mt-2">{p.name}</h3>
                <p className="text-3xl font-bold mt-4">{p.price}<span className="text-sm text-gray-400">{p.period}</span></p>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={onLogin} className={`w-full mt-6 py-3 rounded-lg font-medium ${p.popular ? 'bg-purple-600 hover:bg-purple-500' : 'bg-slate-800 hover:bg-slate-700'}`}>
                  Başla
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Reklam Bütçenizi Korumaya Başlayın</h2>
          <p className="text-gray-400 mb-8">7 gün ücretsiz deneme ile AdsKalkan'ı test edin. Kredi kartı gerekmez.</p>
          <button onClick={onLogin} className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl text-lg font-medium">
            Ücretsiz Başla
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-slate-800 py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-purple-500" />
                <span className="font-bold">AdsKalkan</span>
              </div>
              <p className="text-sm text-gray-400">Google Ads sahte tıklama koruma platformu.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ürün</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Özellikler</a></li>
                <li><a href="#" className="hover:text-white">Fiyatlar</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Şirket</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Kariyer</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">İletişim</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>info@adskalkan.com</li>
                <li>+90 212 123 45 67</li>
                <li>Istanbul, Türkiye</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-gray-500">
            © 2024 AdsKalkan. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
};

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
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded text-white text-sm" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Şifre"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded text-white text-sm" required />
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
