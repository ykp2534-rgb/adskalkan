import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Shield, Users, Globe, Eye, Activity, BarChart3, PieChart, TrendingUp,
  Download, Filter, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Calendar, RefreshCw, Settings, LogOut, User, Layers, Ban, FileText,
  AlertTriangle, CheckCircle, XCircle, Clock, Smartphone, Laptop, Tablet,
  MapPin, MousePointer, Timer, Package, Megaphone, Server, Home, MoreHorizontal,
  ArrowUpRight, ArrowDownRight, X, Check
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

// ==================== MOCK DATA ====================
const generateMockVisitors = (count) => {
  const cities = ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Frankfurt', 'Amsterdam', 'London', 'New York'];
  const countries = ['Turkey', 'Turkey', 'Turkey', 'Turkey', 'Turkey', 'Turkey', 'Germany', 'Netherlands', 'UK', 'USA'];
  const devices = ['desktop', 'mobile', 'tablet'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
  const os = ['Windows', 'macOS', 'Android', 'iOS', 'Linux'];
  const sites = ['demo-tesisatci.com', 'example-plumber.com', 'istanbul-tesisat.com', 'ankara-su.com'];
  const siteNames = ['Demo Tesisatci', 'Example Plumber', 'Istanbul Tesisat', 'Ankara Su'];
  const riskLevels = ['low', 'medium', 'high', 'critical'];
  
  return Array.from({ length: count }, (_, i) => {
    const siteIdx = Math.floor(Math.random() * sites.length);
    const cityIdx = Math.floor(Math.random() * cities.length);
    const riskScore = Math.floor(Math.random() * 100);
    const riskLevel = riskScore >= 70 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 30 ? 'medium' : 'low';
    const isBlocked = riskScore >= 50;
    
    return {
      id: `visitor-${i}`,
      ip_address: `${Math.floor(Math.random() * 200) + 50}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      site_id: `site-${siteIdx}`,
      site_name: siteNames[siteIdx],
      domain: sites[siteIdx],
      city: cities[cityIdx],
      country: countries[cityIdx],
      device_type: devices[Math.floor(Math.random() * devices.length)],
      device_brand: ['Samsung', 'Apple', 'Dell', 'HP', 'Lenovo'][Math.floor(Math.random() * 5)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      os: os[Math.floor(Math.random() * os.length)],
      time_on_page: Math.floor(Math.random() * 120) + 1,
      scroll_depth: Math.floor(Math.random() * 100),
      mouse_movements: Math.floor(Math.random() * 500),
      click_count: Math.floor(Math.random() * 20),
      risk_score: riskScore,
      risk_level: riskLevel,
      is_blocked: isBlocked,
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

const MOCK_VISITORS = generateMockVisitors(500);

const MOCK_SITES = [
  { id: 'site-0', name: 'Demo Tesisatci', domain: 'demo-tesisatci.com', pool: 'Istanbul Tesisatçılar', total_visitors: 1250, blocked_visitors: 380, protection_rate: 30.4, last_activity: '2024-01-15T14:30:00Z', is_active: true },
  { id: 'site-1', name: 'Example Plumber', domain: 'example-plumber.com', pool: 'Ankara Tesisatçılar', total_visitors: 890, blocked_visitors: 156, protection_rate: 17.5, last_activity: '2024-01-15T12:15:00Z', is_active: true },
  { id: 'site-2', name: 'Istanbul Tesisat', domain: 'istanbul-tesisat.com', pool: 'Istanbul Tesisatçılar', total_visitors: 2100, blocked_visitors: 720, protection_rate: 34.3, last_activity: '2024-01-15T13:45:00Z', is_active: true },
  { id: 'site-3', name: 'Ankara Su', domain: 'ankara-su.com', pool: 'Ankara Tesisatçılar', total_visitors: 650, blocked_visitors: 98, protection_rate: 15.1, last_activity: '2024-01-14T18:20:00Z', is_active: false },
];

const MOCK_POOLS = [
  { id: 'pool-1', name: 'Istanbul Tesisatçılar', sector: 'Tesisatçılık', city: 'Istanbul', sites_count: 12, blocked_ips: 1250, blocked_clicks: 4800, is_active: true },
  { id: 'pool-2', name: 'Ankara Tesisatçılar', sector: 'Tesisatçılık', city: 'Ankara', sites_count: 8, blocked_ips: 680, blocked_clicks: 2100, is_active: true },
  { id: 'pool-3', name: 'Izmir Elektrikçiler', sector: 'Elektrik', city: 'Izmir', sites_count: 15, blocked_ips: 920, blocked_clicks: 3500, is_active: true },
  { id: 'pool-4', name: 'Istanbul Avukatlar', sector: 'Hukuk', city: 'Istanbul', sites_count: 22, blocked_ips: 1800, blocked_clicks: 6200, is_active: true },
];

const MOCK_USERS = [
  { id: 'user-1', full_name: 'Ahmet Yılmaz', email: 'ahmet@example.com', company: 'ABC Tesisat', role: 'customer', status: 'approved', sites_count: 3, created_at: '2024-01-01T10:00:00Z' },
  { id: 'user-2', full_name: 'Mehmet Demir', email: 'mehmet@example.com', company: 'XYZ Elektrik', role: 'customer', status: 'approved', sites_count: 5, created_at: '2024-01-05T14:30:00Z' },
  { id: 'user-3', full_name: 'Ayşe Kaya', email: 'ayse@example.com', company: 'Kaya Hukuk', role: 'customer', status: 'pending', sites_count: 0, created_at: '2024-01-14T09:15:00Z' },
  { id: 'user-4', full_name: 'Super Admin', email: 'ykp2534@gmail.com', company: 'AdsKalkan', role: 'super_admin', status: 'approved', sites_count: 0, created_at: '2024-01-01T00:00:00Z' },
];

// Generate daily stats for charts
const generateDailyStats = (days) => {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const visitors = Math.floor(Math.random() * 500) + 200;
    const blocked = Math.floor(visitors * (Math.random() * 0.3 + 0.1));
    return {
      date: date.toISOString().split('T')[0],
      visitors,
      blocked,
      allowed: visitors - blocked,
    };
  });
};

const DAILY_STATS = generateDailyStats(30);

// ==================== UTILITY FUNCTIONS ====================
const formatNumber = (num) => num?.toLocaleString('tr-TR') || '0';
const formatDate = (date) => new Date(date).toLocaleString('tr-TR');
const formatDateShort = (date) => new Date(date).toLocaleDateString('tr-TR');

// ==================== COMPONENTS ====================

// KPI Card
const KPICard = ({ title, value, change, changeType, icon: Icon, color, subtitle }) => {
  const colors = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-400' },
    green: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', icon: 'text-red-400' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: 'text-orange-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-400' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: 'text-cyan-400' },
  };
  const c = colors[color] || colors.blue;
  
  return (
    <div className={`${c.bg} ${c.border} border rounded-lg p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg ${c.bg}`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${changeType === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
          {changeType === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          <span>{change}% vs last period</span>
        </div>
      )}
    </div>
  );
};

// Mini Line Chart
const MiniLineChart = ({ data, dataKey, color = '#8b5cf6', height = 200 }) => {
  if (!data || data.length === 0) return null;
  
  const maxVal = Math.max(...data.map(d => d[dataKey]));
  const minVal = Math.min(...data.map(d => d[dataKey]));
  const range = maxVal - minVal || 1;
  
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - ((d[dataKey] - minVal) / range) * 80 - 10,
  }));
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L 100 100 L 0 100 Z`;
  
  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#gradient-${dataKey})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={color} />
      ))}
    </svg>
  );
};

// Bar Chart
const BarChart = ({ data, labelKey, valueKey, color = '#8b5cf6', height = 200 }) => {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d[valueKey]));
  
  return (
    <div className="flex items-end gap-2 justify-between" style={{ height }}>
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs text-gray-400">{item[valueKey]}</span>
          <div 
            className="w-full rounded-t transition-all"
            style={{ 
              height: `${(item[valueKey] / maxVal) * (height - 40)}px`,
              backgroundColor: color,
              minHeight: 4
            }}
          />
          <span className="text-xs text-gray-500 truncate max-w-full">{item[labelKey]}</span>
        </div>
      ))}
    </div>
  );
};

// Donut Chart
const DonutChart = ({ data, size = 160 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <div className="text-gray-600 text-center py-8">No data</div>;
  
  let currentAngle = -90;
  const r = 40, cx = 50, cy = 50;
  
  return (
    <div className="flex items-center gap-6">
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
          return <path key={idx} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={item.color} className="hover:opacity-80 transition-opacity" />;
        })}
        <circle cx={cx} cy={cy} r="28" fill="#0f172a" />
        <text x={cx} y={cy - 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{total}</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="#64748b" fontSize="6">Total</text>
      </svg>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
            <span className="text-gray-400">{item.label}</span>
            <span className="text-white font-medium">{item.value}</span>
            <span className="text-gray-500">({((item.value / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Status Badge
const StatusBadge = ({ status, size = 'sm' }) => {
  const styles = {
    blocked: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Blocked' },
    allowed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Allowed' },
    critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Critical' },
    high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'High' },
    medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Medium' },
    low: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Low' },
    approved: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Approved' },
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Pending' },
    active: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Active' },
    inactive: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Inactive' },
  };
  const s = styles[status] || styles.low;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  
  return (
    <span className={`${s.bg} ${s.text} ${s.border} border rounded ${sizeClass} font-medium`}>
      {s.label}
    </span>
  );
};

// Risk Score Badge
const RiskScoreBadge = ({ score }) => {
  const getColor = () => {
    if (score >= 70) return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
    if (score >= 50) return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' };
    if (score >= 30) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
  };
  const c = getColor();
  return (
    <span className={`${c.bg} ${c.text} ${c.border} border rounded px-2 py-0.5 text-xs font-mono font-bold`}>
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

// Advanced Data Table
const DataTable = ({ 
  columns, 
  data, 
  title, 
  onExport,
  pagination = true,
  pageSize = 20,
  filters,
  onFilterChange 
}) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };
  
  const filtered = useMemo(() => {
    let result = [...data];
    if (search) {
      result = result.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(search.toLowerCase())
        )
      );
    }
    return result;
  }, [data, search]);
  
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const mod = sortDir === 'asc' ? 1 : -1;
      if (typeof aVal === 'number') return (aVal - bVal) * mod;
      return String(aVal).localeCompare(String(bVal)) * mod;
    });
  }, [filtered, sortKey, sortDir]);
  
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginatedData = pagination ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sorted;
  
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-white">{title}</h3>
          <span className="text-sm text-gray-500">{formatNumber(sorted.length)} records</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white w-64 focus:border-purple-500 outline-none"
            />
          </div>
          {onExport && (
            <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium text-white">
              <Download className="h-4 w-4" /> Export
            </button>
          )}
        </div>
      </div>
      
      {/* Filters */}
      {filters && (
        <div className="p-4 border-b border-slate-700/50 flex items-center gap-4 flex-wrap bg-slate-800/30">
          <Filter className="h-4 w-4 text-gray-500" />
          {filters}
        </div>
      )}
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap ${col.sortable !== false ? 'cursor-pointer hover:text-gray-200' : ''}`}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {paginatedData.map((row, rowIdx) => (
              <tr key={row.id || rowIdx} className="hover:bg-slate-800/30 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {paginatedData.length === 0 && (
        <div className="p-8 text-center text-gray-500">No data found</div>
      )}
      
      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="p-4 border-t border-slate-700/50 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded-lg text-sm ${currentPage === pageNum ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-gray-300'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Select Component
const Select = ({ options, value, onChange, placeholder, className = '' }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-purple-500 outline-none ${className}`}
  >
    <option value="">{placeholder}</option>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

// ==================== PAGES ====================

// Login Page
const LoginPage = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onSuccess(res.data.user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-10 w-10 text-purple-500" />
            <span className="text-2xl font-bold text-white">AdsKalkan</span>
          </div>
          <p className="text-gray-400">Admin Dashboard</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Sign In</h2>
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg font-medium text-white disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Admin Dashboard
const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('7d');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Filter states
  const [visitorFilters, setVisitorFilters] = useState({
    site: '',
    city: '',
    device: '',
    riskLevel: '',
    status: '',
  });
  
  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'admin_helper';
  
  // Calculate stats
  const stats = useMemo(() => {
    const totalVisitors = MOCK_VISITORS.length;
    const blockedVisitors = MOCK_VISITORS.filter(v => v.is_blocked).length;
    const protectionRate = ((blockedVisitors / totalVisitors) * 100).toFixed(1);
    const activeSites = MOCK_SITES.filter(s => s.is_active).length;
    const activePools = MOCK_POOLS.filter(p => p.is_active).length;
    const blockedIPs = new Set(MOCK_VISITORS.filter(v => v.is_blocked).map(v => v.ip_address)).size;
    
    return { totalVisitors, blockedVisitors, protectionRate, activeSites, activePools, blockedIPs };
  }, []);
  
  // Risk distribution
  const riskDistribution = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    MOCK_VISITORS.forEach(v => counts[v.risk_level]++);
    return [
      { label: 'Low', value: counts.low, color: '#22c55e' },
      { label: 'Medium', value: counts.medium, color: '#eab308' },
      { label: 'High', value: counts.high, color: '#f97316' },
      { label: 'Critical', value: counts.critical, color: '#ef4444' },
    ];
  }, []);
  
  // City stats
  const cityStats = useMemo(() => {
    const counts = {};
    MOCK_VISITORS.filter(v => v.is_blocked).forEach(v => {
      counts[v.city] = (counts[v.city] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([city, count]) => ({ city, count }));
  }, []);
  
  // Device stats
  const deviceStats = useMemo(() => {
    const counts = { desktop: 0, mobile: 0, tablet: 0 };
    MOCK_VISITORS.forEach(v => counts[v.device_type]++);
    return [
      { device: 'Desktop', count: counts.desktop },
      { device: 'Mobile', count: counts.mobile },
      { device: 'Tablet', count: counts.tablet },
    ];
  }, []);
  
  // Filtered visitors
  const filteredVisitors = useMemo(() => {
    return MOCK_VISITORS.filter(v => {
      if (visitorFilters.site && v.site_id !== visitorFilters.site) return false;
      if (visitorFilters.city && v.city !== visitorFilters.city) return false;
      if (visitorFilters.device && v.device_type !== visitorFilters.device) return false;
      if (visitorFilters.riskLevel && v.risk_level !== visitorFilters.riskLevel) return false;
      if (visitorFilters.status === 'blocked' && !v.is_blocked) return false;
      if (visitorFilters.status === 'allowed' && v.is_blocked) return false;
      return true;
    });
  }, [visitorFilters]);
  
  const handleExport = () => {
    alert('Export functionality - CSV/Excel download would be triggered here');
  };
  
  // Visitor table columns
  const visitorColumns = [
    { key: 'created_at', label: 'Date & Time', sortable: true, width: '140px', render: (v) => <span className="text-gray-400 text-xs">{formatDate(v)}</span> },
    { key: 'site_name', label: 'Site', sortable: true, render: (v) => <span className="text-purple-400 font-medium">{v}</span> },
    { key: 'domain', label: 'Domain', sortable: true, render: (v) => <span className="text-gray-400">{v}</span> },
    { key: 'ip_address', label: 'IP Address', sortable: true, render: (v) => <span className="font-mono text-white">{v}</span> },
    { key: 'city', label: 'City', sortable: true, render: (v, r) => <span className="text-gray-400">{v}, {r.country}</span> },
    { key: 'device_type', label: 'Device', sortable: true, render: (v) => <div className="flex items-center gap-2"><DeviceIcon type={v} /><span className="text-gray-400 capitalize">{v}</span></div> },
    { key: 'browser', label: 'Browser', sortable: true, render: (v, r) => <span className="text-gray-400">{v} / {r.os}</span> },
    { key: 'time_on_page', label: 'Time', sortable: true, render: (v) => <span className="text-gray-400">{v}s</span> },
    { key: 'risk_score', label: 'Risk Score', sortable: true, render: (v) => <RiskScoreBadge score={v} /> },
    { key: 'risk_level', label: 'Risk Level', sortable: true, render: (v) => <StatusBadge status={v} /> },
    { key: 'is_blocked', label: 'Status', sortable: true, render: (v) => <StatusBadge status={v ? 'blocked' : 'allowed'} /> },
  ];
  
  // Site table columns
  const siteColumns = [
    { key: 'name', label: 'Site Name', sortable: true, render: (v) => <span className="text-white font-medium">{v}</span> },
    { key: 'domain', label: 'Domain', sortable: true, render: (v) => <span className="text-purple-400">{v}</span> },
    { key: 'pool', label: 'Pool', sortable: true, render: (v) => <span className="text-gray-400">{v}</span> },
    { key: 'total_visitors', label: 'Total Visitors', sortable: true, render: (v) => <span className="text-white">{formatNumber(v)}</span> },
    { key: 'blocked_visitors', label: 'Blocked', sortable: true, render: (v) => <span className="text-red-400">{formatNumber(v)}</span> },
    { key: 'protection_rate', label: 'Protection %', sortable: true, render: (v) => <span className={`font-medium ${v > 25 ? 'text-red-400' : v > 15 ? 'text-orange-400' : 'text-emerald-400'}`}>{v}%</span> },
    { key: 'last_activity', label: 'Last Activity', sortable: true, render: (v) => <span className="text-gray-500 text-xs">{formatDateShort(v)}</span> },
    { key: 'is_active', label: 'Status', sortable: true, render: (v) => <StatusBadge status={v ? 'active' : 'inactive'} /> },
  ];
  
  // Pool table columns
  const poolColumns = [
    { key: 'name', label: 'Pool Name', sortable: true, render: (v) => <span className="text-white font-medium">{v}</span> },
    { key: 'sector', label: 'Sector', sortable: true, render: (v) => <span className="text-purple-400">{v}</span> },
    { key: 'city', label: 'City', sortable: true, render: (v) => <span className="text-gray-400">{v}</span> },
    { key: 'sites_count', label: 'Sites', sortable: true, render: (v) => <span className="text-white">{v}</span> },
    { key: 'blocked_ips', label: 'Blocked IPs', sortable: true, render: (v) => <span className="text-orange-400">{formatNumber(v)}</span> },
    { key: 'blocked_clicks', label: 'Blocked Clicks', sortable: true, render: (v) => <span className="text-red-400">{formatNumber(v)}</span> },
    { key: 'is_active', label: 'Status', sortable: true, render: (v) => <StatusBadge status={v ? 'active' : 'inactive'} /> },
  ];
  
  // User table columns
  const userColumns = [
    { key: 'full_name', label: 'Name', sortable: true, render: (v, r) => <div><span className="text-white font-medium">{v}</span><br/><span className="text-gray-500 text-xs">{r.email}</span></div> },
    { key: 'company', label: 'Company', sortable: true, render: (v) => <span className="text-gray-400">{v}</span> },
    { key: 'role', label: 'Role', sortable: true, render: (v) => <span className={`px-2 py-1 rounded text-xs ${v === 'super_admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{v === 'super_admin' ? 'Super Admin' : 'Customer'}</span> },
    { key: 'sites_count', label: 'Sites', sortable: true, render: (v) => <span className="text-white">{v}</span> },
    { key: 'status', label: 'Status', sortable: true, render: (v) => <StatusBadge status={v} /> },
    { key: 'created_at', label: 'Joined', sortable: true, render: (v) => <span className="text-gray-500 text-xs">{formatDateShort(v)}</span> },
  ];
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'sites', label: 'Sites', icon: Globe },
    { id: 'pools', label: 'Pools', icon: Layers },
    { id: 'visitors', label: 'Visitors', icon: Eye },
    { id: 'blocked', label: 'Blocked IPs', icon: Ban },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  
  const superAdminMenuItems = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'system', label: 'System Logs', icon: Server },
  ];
  
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-60'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 flex-shrink-0`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Shield className="h-8 w-8 text-purple-500 flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-lg font-bold">AdsKalkan</span>}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/30'
                  : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
          
          {isSuperAdmin && (
            <>
              <div className="pt-4 pb-2">
                {!sidebarCollapsed && <span className="text-xs text-gray-500 uppercase tracking-wider px-3">Super Admin</span>}
              </div>
              {superAdminMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/30'
                      : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                </button>
              ))}
            </>
          )}
        </nav>
        
        {/* Collapse Button */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">{menuItems.find(m => m.id === activeTab)?.label || superAdminMenuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}</h1>
            <span className={`px-2 py-1 rounded text-xs font-medium ${isSuperAdmin ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent text-sm text-white outline-none"
              >
                <option value="today">Today</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            
            {/* Refresh */}
            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700">
              <RefreshCw className="h-4 w-4" />
            </button>
            
            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-6 gap-4">
                <KPICard title="Total Visitors" value={formatNumber(stats.totalVisitors)} icon={Eye} color="blue" change={12.5} changeType="up" />
                <KPICard title="Blocked Clicks" value={formatNumber(stats.blockedVisitors)} icon={Ban} color="red" change={8.3} changeType="up" />
                <KPICard title="Protection Rate" value={`${stats.protectionRate}%`} icon={Shield} color="green" subtitle="of traffic blocked" />
                <KPICard title="Active Sites" value={stats.activeSites} icon={Globe} color="purple" />
                <KPICard title="Active Pools" value={stats.activePools} icon={Layers} color="cyan" />
                <KPICard title="Blocked IPs" value={formatNumber(stats.blockedIPs)} icon={AlertTriangle} color="orange" />
              </div>
              
              {/* Charts Row */}
              <div className="grid grid-cols-3 gap-6">
                {/* Line Chart - Visitors vs Blocked */}
                <div className="col-span-2 bg-slate-900/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-400" />
                      Visitors vs Blocked (Last 30 Days)
                    </h3>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-500"></div>Visitors</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500"></div>Blocked</div>
                    </div>
                  </div>
                  <div className="relative">
                    <MiniLineChart data={DAILY_STATS} dataKey="visitors" color="#a855f7" height={200} />
                    <div className="absolute inset-0">
                      <MiniLineChart data={DAILY_STATS} dataKey="blocked" color="#ef4444" height={200} />
                    </div>
                  </div>
                </div>
                
                {/* Risk Distribution */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <PieChart className="h-5 w-5 text-orange-400" />
                    Risk Distribution
                  </h3>
                  <DonutChart data={riskDistribution} size={140} />
                </div>
              </div>
              
              {/* Bar Charts Row */}
              <div className="grid grid-cols-2 gap-6">
                {/* Top Cities */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-cyan-400" />
                    Top Cities by Blocked Clicks
                  </h3>
                  <BarChart data={cityStats} labelKey="city" valueKey="count" color="#06b6d4" height={180} />
                </div>
                
                {/* Device Types */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <Laptop className="h-5 w-5 text-blue-400" />
                    Device Types
                  </h3>
                  <BarChart data={deviceStats} labelKey="device" valueKey="count" color="#3b82f6" height={180} />
                </div>
              </div>
              
              {/* Recent Visitors Table */}
              <DataTable
                title="Recent Visitors"
                columns={visitorColumns}
                data={MOCK_VISITORS.slice(0, 50)}
                pageSize={10}
                onExport={handleExport}
              />
            </div>
          )}
          
          {/* Sites Page */}
          {activeTab === 'sites' && (
            <DataTable
              title="Sites Overview"
              columns={siteColumns}
              data={MOCK_SITES}
              pageSize={20}
              onExport={handleExport}
            />
          )}
          
          {/* Pools Page */}
          {activeTab === 'pools' && (
            <DataTable
              title="Pools (Sector + City)"
              columns={poolColumns}
              data={MOCK_POOLS}
              pageSize={20}
              onExport={handleExport}
            />
          )}
          
          {/* Visitors Page */}
          {activeTab === 'visitors' && (
            <DataTable
              title="All Visitors"
              columns={visitorColumns}
              data={filteredVisitors}
              pageSize={20}
              onExport={handleExport}
              filters={
                <div className="flex items-center gap-3 flex-wrap">
                  <Select
                    options={MOCK_SITES.map(s => ({ value: s.id, label: s.name }))}
                    value={visitorFilters.site}
                    onChange={(v) => setVisitorFilters({ ...visitorFilters, site: v })}
                    placeholder="All Sites"
                    className="w-40"
                  />
                  <Select
                    options={['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Frankfurt', 'Amsterdam'].map(c => ({ value: c, label: c }))}
                    value={visitorFilters.city}
                    onChange={(v) => setVisitorFilters({ ...visitorFilters, city: v })}
                    placeholder="All Cities"
                    className="w-36"
                  />
                  <Select
                    options={[{ value: 'desktop', label: 'Desktop' }, { value: 'mobile', label: 'Mobile' }, { value: 'tablet', label: 'Tablet' }]}
                    value={visitorFilters.device}
                    onChange={(v) => setVisitorFilters({ ...visitorFilters, device: v })}
                    placeholder="All Devices"
                    className="w-36"
                  />
                  <Select
                    options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }]}
                    value={visitorFilters.riskLevel}
                    onChange={(v) => setVisitorFilters({ ...visitorFilters, riskLevel: v })}
                    placeholder="All Risk Levels"
                    className="w-40"
                  />
                  <Select
                    options={[{ value: 'blocked', label: 'Blocked' }, { value: 'allowed', label: 'Allowed' }]}
                    value={visitorFilters.status}
                    onChange={(v) => setVisitorFilters({ ...visitorFilters, status: v })}
                    placeholder="All Status"
                    className="w-36"
                  />
                  <button
                    onClick={() => setVisitorFilters({ site: '', city: '', device: '', riskLevel: '', status: '' })}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              }
            />
          )}
          
          {/* Blocked IPs Page */}
          {activeTab === 'blocked' && (
            <DataTable
              title="Blocked IP Addresses"
              columns={visitorColumns}
              data={MOCK_VISITORS.filter(v => v.is_blocked)}
              pageSize={20}
              onExport={handleExport}
            />
          )}
          
          {/* Users Page (Super Admin Only) */}
          {activeTab === 'users' && isSuperAdmin && (
            <DataTable
              title="User Management"
              columns={userColumns}
              data={MOCK_USERS}
              pageSize={20}
              onExport={handleExport}
            />
          )}
          
          {/* Reports Page */}
          {activeTab === 'reports' && (
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 text-center">
              <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Reports</h3>
              <p className="text-gray-500">Report generation and export features coming soon.</p>
            </div>
          )}
          
          {/* Settings Page */}
          {activeTab === 'settings' && (
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 text-center">
              <Settings className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Settings</h3>
              <p className="text-gray-500">System settings and configuration options.</p>
            </div>
          )}
          
          {/* Packages Page (Super Admin Only) */}
          {activeTab === 'packages' && isSuperAdmin && (
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 text-center">
              <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Package Management</h3>
              <p className="text-gray-500">Manage subscription packages and pricing.</p>
            </div>
          )}
          
          {/* Campaigns Page (Super Admin Only) */}
          {activeTab === 'campaigns' && isSuperAdmin && (
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 text-center">
              <Megaphone className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Campaign Management</h3>
              <p className="text-gray-500">Manage promotional campaigns and discounts.</p>
            </div>
          )}
          
          {/* System Logs Page (Super Admin Only) */}
          {activeTab === 'system' && isSuperAdmin && (
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 text-center">
              <Server className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">System Logs</h3>
              <p className="text-gray-500">View system logs and audit trails.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Main App
function App() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  
  const handleLogin = (userData) => {
    setUser(userData);
  };
  
  if (!user) {
    return <LoginPage onSuccess={handleLogin} />;
  }
  
  return <AdminDashboard user={user} onLogout={handleLogout} />;
}

export default App;
