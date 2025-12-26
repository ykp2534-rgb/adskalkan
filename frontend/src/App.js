import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Shield, ShieldAlert, ShieldCheck, ShieldX, Users, Globe, Monitor,
  TrendingUp, TrendingDown, Activity, Eye, EyeOff, Lock, Unlock,
  BarChart3, PieChart, LineChart, Map, Zap, AlertTriangle, CheckCircle,
  XCircle, Clock, Calendar, Filter, Download, RefreshCw, Settings,
  ChevronRight, ChevronDown, Menu, X, LogOut, User, Building,
  Plus, Edit, Trash2, Search, Bell, Target, Layers, Database,
  Smartphone, Laptop, Tablet, MapPin, Navigation, Wifi, WifiOff,
  MousePointer, Timer, Scroll, MoreVertical, ExternalLink, Copy,
  Check, AlertOctagon, Gauge, Radio, Server, Cloud, Ban, DollarSign,
  Bot, Skull, CircleDollarSign, ShieldBan, Crosshair, Play, Phone
} from "lucide-react";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Axios instance with auth
const api = axios.create({ baseURL: API });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ==================== COMPONENTS ====================

// Animated Counter
const AnimatedCounter = ({ value, duration = 1000, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (start === end) {
      setCount(end);
      return;
    }
    
    const incrementTime = duration / Math.max(end, 1);
    const timer = setInterval(() => {
      start += Math.ceil(end / 30);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 30);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span>{prefix}{count.toLocaleString('tr-TR')}{suffix}</span>;
};

// Live Pulse
const LivePulse = ({ active = true, size = "default" }) => {
  const sizeClass = size === "large" ? "h-4 w-4" : "h-2.5 w-2.5";
  return (
    <span className="relative flex items-center">
      {active && <span className={`animate-ping absolute inline-flex rounded-full bg-red-500 opacity-75 ${sizeClass}`}></span>}
      <span className={`relative inline-flex rounded-full ${active ? 'bg-red-500' : 'bg-gray-600'} ${sizeClass}`}></span>
    </span>
  );
};

// KPI Card - Yeni tasarım
const KPICard = ({ icon: Icon, value, label, sublabel, color = "blue", trend, trendValue }) => {
  const colorClasses = {
    red: "bg-red-500/10 text-red-500 border-red-500/20",
    orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    green: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    cyan: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  };
  
  const iconBgClasses = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    green: "bg-emerald-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    cyan: "bg-cyan-500",
    yellow: "bg-yellow-500",
  };
  
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black/40 border ${colorClasses[color]} backdrop-blur-sm p-5 hover:bg-black/50 transition-all group`}>
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-white">
          <AnimatedCounter value={value} />
        </div>
        <div className="text-sm text-gray-400 mt-1">{label}</div>
        {sublabel && <div className="text-xs text-gray-500 mt-0.5">{sublabel}</div>}
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${iconBgClasses[color]} opacity-50`}></div>
    </div>
  );
};

// Mini Stat Card
const MiniStatCard = ({ icon: Icon, value, label, color = "gray" }) => {
  const colors = {
    red: "text-red-400",
    green: "text-emerald-400",
    blue: "text-blue-400",
    orange: "text-orange-400",
    gray: "text-gray-400",
  };
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-gray-800">
      <Icon className={`h-5 w-5 ${colors[color]}`} />
      <div>
        <div className="text-lg font-semibold text-white">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
};

// Risk Gauge - Yarım daire
const RiskGauge = ({ score, size = 160, label = "Risk Skoru" }) => {
  const radius = (size / 2) - 15;
  const circumference = radius * Math.PI;
  const progress = (Math.min(score, 100) / 100) * circumference;
  
  const getColor = () => {
    if (score >= 70) return { stroke: "#ef4444", text: "text-red-500", bg: "rgba(239,68,68,0.1)" };
    if (score >= 50) return { stroke: "#f97316", text: "text-orange-500", bg: "rgba(249,115,22,0.1)" };
    if (score >= 30) return { stroke: "#eab308", text: "text-yellow-500", bg: "rgba(234,179,8,0.1)" };
    return { stroke: "#22c55e", text: "text-emerald-500", bg: "rgba(34,197,94,0.1)" };
  };
  
  const color = getColor();
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
        <svg width={size} height={size / 2 + 20} className="overflow-visible">
          {/* Background arc */}
          <path
            d={`M 15 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 15} ${size / 2}`}
            fill="none"
            stroke="#1f2937"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={`M 15 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 15} ${size / 2}`}
            fill="none"
            stroke={color.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${color.stroke})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
          <span className={`text-4xl font-bold ${color.text}`}>{Math.round(score)}</span>
          <span className="text-xs text-gray-500 mt-1">{label}</span>
        </div>
      </div>
    </div>
  );
};

// Donut Chart
const DonutChart = ({ data, size = 180, showLegend = true }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <div className="text-gray-500 text-center py-8">Veri yok</div>;
  
  let currentAngle = -90;
  
  const createArcPath = (startAngle, endAngle, outerRadius, innerRadius) => {
    const startOuter = polarToCartesian(size/2, size/2, outerRadius, endAngle);
    const endOuter = polarToCartesian(size/2, size/2, outerRadius, startAngle);
    const startInner = polarToCartesian(size/2, size/2, innerRadius, endAngle);
    const endInner = polarToCartesian(size/2, size/2, innerRadius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    return [
      "M", startOuter.x, startOuter.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
      "L", endInner.x, endInner.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
      "Z"
    ].join(" ");
  };
  
  const polarToCartesian = (cx, cy, radius, angle) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad)
    };
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="transform -rotate-0">
          {data.map((item, index) => {
            const percentage = item.value / total;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;
            
            if (percentage === 0) return null;
            
            return (
              <path
                key={index}
                d={createArcPath(startAngle, endAngle, size/2 - 5, size/2 - 35)}
                fill={item.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                style={{ filter: `drop-shadow(0 0 4px ${item.color}40)` }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{total}</div>
            <div className="text-xs text-gray-500">Toplam</div>
          </div>
        </div>
      </div>
      {showLegend && (
        <div className="grid grid-cols-2 gap-2 mt-4 w-full">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
              <span className="text-gray-400 truncate">{item.label}:</span>
              <span className="text-white font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Bar Chart
const BarChart = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex flex-col items-center">
            <span className="text-xs text-gray-400 mb-1">{item.value}</span>
            <div 
              className="w-full rounded-t-lg transition-all duration-500"
              style={{ 
                height: `${(item.value / maxValue) * (height - 40)}px`,
                backgroundColor: item.color || '#3b82f6',
                minHeight: '4px'
              }}
            ></div>
          </div>
          <span className="text-xs text-gray-500 truncate w-full text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// Live Attack Feed Item
const LiveAttackItem = ({ attack, isNew }) => {
  const getRiskStyles = (level) => {
    switch (level) {
      case 'critical': return { bg: 'bg-red-500/20', border: 'border-red-500/30', dot: 'bg-red-500', text: 'text-red-400' };
      case 'high': return { bg: 'bg-orange-500/20', border: 'border-orange-500/30', dot: 'bg-orange-500', text: 'text-orange-400' };
      case 'medium': return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', dot: 'bg-yellow-500', text: 'text-yellow-400' };
      default: return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', dot: 'bg-emerald-500', text: 'text-emerald-400' };
    }
  };
  
  const style = getRiskStyles(attack.risk_level);
  const DeviceIcon = attack.device_type === 'mobile' ? Smartphone : attack.device_type === 'tablet' ? Tablet : Laptop;
  
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl ${style.bg} border ${style.border} transition-all ${isNew ? 'animate-pulse' : ''}`}>
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${style.dot}`}></div>
        {attack.is_blocked && (
          <div className="absolute -top-1 -right-1">
            <Ban className="h-3 w-3 text-red-500" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-white">{attack.ip_address}</span>
          {attack.is_blocked && (
            <span className="px-2 py-0.5 text-xs bg-red-500/30 text-red-400 rounded-full">ENGELLENDİ</span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {attack.city || 'Bilinmiyor'}
          </span>
          <span className="flex items-center gap-1">
            <DeviceIcon className="h-3 w-3" />
            {attack.device_type || '-'}
          </span>
          <span className="flex items-center gap-1">
            <Timer className="h-3 w-3" />
            {attack.time_on_page || 0}s
          </span>
          <span className="flex items-center gap-1">
            <MousePointer className="h-3 w-3" />
            {attack.mouse_movements || 0}
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-2xl font-bold ${style.text}`}>{Math.round(attack.risk_score)}</div>
        <div className="text-xs text-gray-500">Risk</div>
      </div>
    </div>
  );
};

// Progress Bar
const ProgressBar = ({ value, max, label, color = "#3b82f6", showPercent = true }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">
          {value.toLocaleString('tr-TR')}
          {showPercent && <span className="text-gray-500 ml-1">({Math.round(percentage)}%)</span>}
        </span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
};

// ==================== PAGES ====================

// Landing Page
const LandingPage = ({ onLogin, onRegister }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-50"></div>
            <Shield className="relative h-10 w-10 text-blue-400" />
          </div>
          <span className="text-2xl font-bold">AdsKalkan</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onLogin} className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors">
            Giriş Yap
          </button>
          <button onClick={onRegister} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-all">
            Ücretsiz Başla
          </button>
        </div>
      </nav>
      
      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm mb-8">
          <Zap className="h-4 w-4" />
          <span>Yapay Zeka Destekli Koruma</span>
          <LivePulse size="large" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Google Ads Bütçenizi
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Sahte Tıklamalardan
          </span>
          <br />
          Koruyun
        </h1>
        
        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
          Gelişmiş yapay zeka ile bot trafiğini, click farm saldırılarını ve sahte tıklamaları 
          <span className="text-white font-medium"> gerçek zamanlı </span> 
          tespit edip engelleyin.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button onClick={onRegister} className="group px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium text-lg transition-all flex items-center justify-center gap-2">
            <Play className="h-5 w-5" />
            Canlı Demo
          </button>
          <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-lg transition-all flex items-center justify-center gap-2">
            <Phone className="h-5 w-5" />
            Satışla Görüş
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Bot, value: "10M+", label: "Engellenen Bot", color: "text-red-400" },
            { icon: Users, value: "500+", label: "Aktif Müşteri", color: "text-blue-400" },
            { icon: Target, value: "%99.9", label: "Tespit Oranı", color: "text-emerald-400" },
            { icon: CircleDollarSign, value: "₺2.5M+", label: "Tasarruf", color: "text-yellow-400" },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <stat.icon className={`h-8 w-8 ${stat.color} mb-3 mx-auto`} />
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </header>
      
      {/* Features */}
      <section className="relative z-10 py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Neden AdsKalkan?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Rakiplerden farklı olarak, çok katmanlı analiz motorumuz sahte trafiği %99.9 doğrulukla tespit eder.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Çok Katmanlı Koruma", desc: "IP, cihaz, davranış, fingerprint ve pattern analizi.", color: "blue" },
              { icon: Users, title: "Havuz Sistemi", desc: "Sektördeki sitelerle tehdit bilgisi paylaşımı.", color: "purple" },
              { icon: Activity, title: "Gerçek Zamanlı", desc: "Canlı dashboard ile anlık tespit ve engelleme.", color: "green" },
              { icon: BarChart3, title: "Detaylı Analitik", desc: "Şehir, cihaz bazlı raporlar ve analizler.", color: "orange" },
              { icon: Zap, title: "Kolay Entegrasyon", desc: "Tek satır kod ile 5 dakikada kurulum.", color: "cyan" },
              { icon: CircleDollarSign, title: "Para Tasarrufu", desc: "Ortalama %40 reklam bütçesi tasarrufu.", color: "yellow" },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group">
                <f.icon className={`h-10 w-10 text-${f.color}-400 mb-4`} />
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-400" />
            <span className="font-bold">AdsKalkan</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 AdsKalkan. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};

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
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>
      
      <div className="relative w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8">
          <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 text-sm">
            <ChevronRight className="h-4 w-4 rotate-180" /> Geri
          </button>
          
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-10 w-10 text-blue-500" />
            <span className="text-2xl font-bold text-white">AdsKalkan</span>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">Hoş Geldiniz</h1>
          <p className="text-gray-400 mb-8">Hesabınıza giriş yapın</p>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white"
                placeholder="ornek@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-all disabled:opacity-50 text-white"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Register Page
const RegisterPage = ({ onBack, onSuccess }) => {
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
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900/80 border border-gray-800 rounded-3xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Kayıt Başarılı!</h2>
          <p className="text-gray-400 mb-6">Yönetici onayından sonra giriş yapabilirsiniz.</p>
          <button onClick={onBack} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium text-white">
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>
      
      <div className="relative w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8">
          <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 text-sm">
            <ChevronRight className="h-4 w-4 rotate-180" /> Geri
          </button>
          
          <h1 className="text-2xl font-bold text-white mb-2">Hesap Oluştur</h1>
          <p className="text-gray-400 mb-6">7 gün ücretsiz deneme</p>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-blue-500 outline-none text-white" placeholder="Ad Soyad *" required />
            <input type="text" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})}
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-blue-500 outline-none text-white" placeholder="Şirket Adı" />
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-blue-500 outline-none text-white" placeholder="Email *" required />
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-blue-500 outline-none text-white" placeholder="Telefon" />
            <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-blue-500 outline-none text-white" placeholder="Şifre *" required minLength={6} />
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium text-white disabled:opacity-50 mt-2">
              {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard - YENİ TASARIM
const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [users, setUsers] = useState([]);
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setDashboardData(res.data);
    } catch (err) { console.error(err); }
  }, []);
  
  const fetchVisitors = useCallback(async () => {
    try {
      const res = await api.get("/admin/visitors?limit=100");
      setVisitors(res.data.visitors || []);
    } catch (err) { console.error(err); }
  }, []);
  
  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) { console.error(err); }
  }, []);
  
  const fetchPools = useCallback(async () => {
    try {
      const res = await api.get("/admin/pools");
      setPools(res.data || []);
    } catch (err) { console.error(err); }
  }, []);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchVisitors(), fetchUsers(), fetchPools()]);
      setLoading(false);
    };
    loadData();
    const interval = setInterval(() => { fetchDashboard(); fetchVisitors(); }, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard, fetchVisitors, fetchUsers, fetchPools]);
  
  const handleApproveUser = async (userId) => {
    try { await api.put(`/admin/users/${userId}/approve`); fetchUsers(); } catch (err) { console.error(err); }
  };
  
  const handleRejectUser = async (userId) => {
    try { await api.put(`/admin/users/${userId}/reject`); fetchUsers(); } catch (err) { console.error(err); }
  };
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "live", label: "Canlı İzleme", icon: Activity },
    { id: "visitors", label: "Ziyaretçiler", icon: Eye },
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
  
  // Tahmini tasarruf hesapla (engellenen tıklama * ortalama CPC)
  const estimatedSavings = dashboardData ? (dashboardData.blocked_visitors * 2.5).toFixed(0) : 0;
  
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-950 border-r border-gray-800/50 flex flex-col transition-all duration-300 flex-shrink-0`}>
        <div className="p-4 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-500 flex-shrink-0" />
            {sidebarOpen && <span className="text-xl font-bold">AdsKalkan</span>}
          </div>
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>
        
        <div className="p-3 border-t border-gray-800/50">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="text-sm">Çıkış</span>}
          </button>
        </div>
      </aside>
      
      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg">
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold">{menuItems.find(m => m.id === activeTab)?.label}</h1>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => { fetchDashboard(); fetchVisitors(); }} className="p-2 hover:bg-white/5 rounded-lg">
                <RefreshCw className="h-5 w-5 text-gray-400" />
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full">
                <LivePulse />
                <span className="text-sm text-red-400">Canlı</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-gray-800">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm">{user?.full_name}</span>
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Dashboard */}
              {activeTab === "dashboard" && dashboardData && (
                <div className="space-y-6">
                  {/* Top KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard icon={Bot} value={dashboardData.blocked_visitors} label="Bugün Engellenen Bot" sublabel="Otomatik tespit" color="red" trend="up" trendValue="+12%" />
                    <KPICard icon={Layers} value={pools.reduce((sum, p) => sum + (p.blocked_ips?.length || 0), 0)} label="Havuzdan Gelen Tehdit" sublabel="Paylaşılan engeller" color="orange" />
                    <KPICard icon={CircleDollarSign} value={estimatedSavings} label="Tahmini Tasarruf" sublabel="~₺2.5/tıklama" color="green" />
                    <KPICard icon={ShieldBan} value={dashboardData.total_blocked_ips} label="Aktif Engelli IP" sublabel="Global blacklist" color="purple" />
                  </div>
                  
                  {/* Secondary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MiniStatCard icon={Eye} value={dashboardData.total_visitors} label="Toplam Ziyaretçi" color="blue" />
                    <MiniStatCard icon={Users} value={dashboardData.total_users} label="Toplam Müşteri" color="green" />
                    <MiniStatCard icon={Globe} value={dashboardData.total_sites} label="Aktif Site" color="orange" />
                    <MiniStatCard icon={Clock} value={dashboardData.pending_users} label="Onay Bekleyen" color="red" />
                  </div>
                  
                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Protection Gauge */}
                    <div className="bg-gray-950 border border-gray-800/50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-400" />
                        Koruma Oranı
                      </h3>
                      <RiskGauge score={dashboardData.protection_rate || 0} size={180} label="Engelleme %" />
                      <p className="text-center text-gray-500 text-sm mt-4">
                        Trafiğin %{Math.round(dashboardData.protection_rate || 0)}'i sahte olarak tespit edildi
                      </p>
                    </div>
                    
                    {/* Risk Distribution */}
                    <div className="bg-gray-950 border border-gray-800/50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-400" />
                        Risk Dağılımı
                      </h3>
                      <DonutChart data={riskData} size={160} />
                    </div>
                    
                    {/* City Distribution */}
                    <div className="bg-gray-950 border border-gray-800/50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-cyan-400" />
                        Şehir Dağılımı
                      </h3>
                      <div className="space-y-3">
                        {(dashboardData.city_distribution || []).slice(0, 5).map((city, i) => (
                          <ProgressBar
                            key={i}
                            label={city._id || 'Bilinmiyor'}
                            value={city.count}
                            max={dashboardData.city_distribution[0]?.count || 1}
                            color={['#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#f97316'][i]}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Live Feed & Top Blocked */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Live Attack Feed */}
                    <div className="bg-gray-950 border border-gray-800/50 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Activity className="h-5 w-5 text-red-400" />
                          Canlı Saldırı Akışı
                        </h3>
                        <LivePulse />
                      </div>
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                        {visitors.slice(0, 6).map((v, i) => (
                          <LiveAttackItem key={v.id || i} attack={v} isNew={i === 0} />
                        ))}
                      </div>
                    </div>
                    
                    {/* Top Blocked IPs */}
                    <div className="bg-gray-950 border border-gray-800/50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Skull className="h-5 w-5 text-red-400" />
                        En Çok Engellenen IP'ler
                      </h3>
                      <div className="space-y-3">
                        {(dashboardData.top_blocked_ips || []).slice(0, 6).map((ip, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-black/30 border border-gray-800 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 font-bold text-sm">
                                {i + 1}
                              </div>
                              <span className="font-mono text-sm">{ip._id}</span>
                            </div>
                            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                              {ip.count} engel
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Live Monitoring */}
              {activeTab === "live" && (
                <div className="bg-gray-950 border border-gray-800/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <LivePulse size="large" />
                      <h3 className="text-xl font-semibold">Canlı Saldırı Akışı</h3>
                    </div>
                    <span className="text-sm text-gray-500">Son 100 ziyaret</span>
                  </div>
                  <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                    {visitors.map((v, i) => (
                      <LiveAttackItem key={v.id || i} attack={v} isNew={i === 0} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Visitors */}
              {activeTab === "visitors" && (
                <div className="bg-gray-950 border border-gray-800/50 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-800/50 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Tüm Ziyaretçiler</h3>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input type="text" placeholder="IP, şehir ara..." className="pl-10 pr-4 py-2 bg-black/50 border border-gray-800 rounded-xl text-sm focus:border-blue-500 outline-none w-64" />
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm">
                        <Download className="h-4 w-4" /> Dışa Aktar
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-black/30">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">IP Adresi</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Şehir</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Cihaz</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Süre</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {visitors.map((v, i) => (
                          <tr key={v.id || i} className="hover:bg-white/5">
                            <td className="px-6 py-4 font-mono text-sm">{v.ip_address}</td>
                            <td className="px-6 py-4 text-sm text-gray-400">{v.city || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-400">{v.device_type || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-400">{v.time_on_page || 0}s</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                v.risk_level === 'critical' ? 'bg-red-500/20 text-red-400' :
                                v.risk_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                v.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-emerald-500/20 text-emerald-400'
                              }`}>{Math.round(v.risk_score)}</span>
                            </td>
                            <td className="px-6 py-4">
                              {v.is_blocked ? (
                                <span className="flex items-center gap-1 text-red-400 text-sm"><Ban className="h-4 w-4" /> Engellendi</span>
                              ) : (
                                <span className="flex items-center gap-1 text-emerald-400 text-sm"><CheckCircle className="h-4 w-4" /> İzin</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(v.created_at).toLocaleString('tr-TR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Users */}
              {activeTab === "users" && (
                <div className="space-y-6">
                  {users.filter(u => u.status === 'pending').length > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5" /> Onay Bekleyenler
                      </h3>
                      <div className="space-y-3">
                        {users.filter(u => u.status === 'pending').map((u) => (
                          <div key={u.id} className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
                            <div>
                              <p className="font-medium">{u.full_name}</p>
                              <p className="text-sm text-gray-400">{u.email}</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleApproveUser(u.id)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" /> Onayla
                              </button>
                              <button onClick={() => handleRejectUser(u.id)} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-sm flex items-center gap-1">
                                <XCircle className="h-4 w-4" /> Reddet
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gray-950 border border-gray-800/50 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-gray-800/50">
                      <h3 className="text-lg font-semibold">Tüm Kullanıcılar</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-black/30">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Kayıt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                          {users.map((u) => (
                            <tr key={u.id} className="hover:bg-white/5">
                              <td className="px-6 py-4">
                                <p className="font-medium">{u.full_name}</p>
                                <p className="text-sm text-gray-500">{u.email}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  u.role === 'super_admin' ? 'bg-purple-500/20 text-purple-400' :
                                  u.role === 'admin_helper' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {u.role === 'super_admin' ? 'Süper Admin' : u.role === 'admin_helper' ? 'Admin Yardımcısı' : 'Müşteri'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  u.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                  u.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {u.status === 'approved' ? 'Onaylı' : u.status === 'pending' ? 'Bekliyor' : 'Reddedildi'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString('tr-TR')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Pools */}
              {activeTab === "pools" && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl">
                      <Plus className="h-4 w-4" /> Yeni Havuz
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pools.map((pool) => (
                      <div key={pool.id} className="bg-gray-950 border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700 transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-blue-500/20 rounded-xl">
                            <Layers className="h-6 w-6 text-blue-400" />
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs ${pool.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {pool.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{pool.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{pool.sector} {pool.city && `- ${pool.city}`}</p>
                        <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-800">
                          <span className="text-gray-400">{pool.sites?.length || 0} site</span>
                          <span className="text-red-400 font-medium">{pool.blocked_ips?.length || 0} engelli IP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Blocked */}
              {activeTab === "blocked" && (
                <div className="bg-gray-950 border border-gray-800/50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Engellenen IP'ler</h3>
                  <p className="text-gray-500">Bu bölüm geliştirme aşamasında...</p>
                </div>
              )}
              
              {/* Settings */}
              {activeTab === "settings" && (
                <div className="bg-gray-950 border border-gray-800/50 rounded-2xl p-6">
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
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard");
        setDashboardData(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-gray-950 border-b border-gray-800/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold">AdsKalkan</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{user?.full_name}</span>
            <button onClick={onLogout} className="p-2 hover:bg-white/5 rounded-lg">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6">
        {user?.status === 'pending' ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-8 text-center">
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Hesabınız Onay Bekliyor</h2>
            <p className="text-gray-400">Yönetici onayından sonra erişebilirsiniz.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KPICard icon={Eye} value={dashboardData?.total_visitors || 0} label="Toplam Ziyaretçi" color="blue" />
              <KPICard icon={ShieldX} value={dashboardData?.blocked_visitors || 0} label="Engellenen Tıklama" color="red" />
              <KPICard icon={ShieldCheck} value={`${dashboardData?.protection_rate || 0}%`} label="Koruma Oranı" color="green" />
            </div>
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
  if (page === "register") return <RegisterPage onBack={() => setPage("landing")} onSuccess={handleLoginSuccess} />;
  
  if (page === "dashboard" && user) {
    if (user.role === "super_admin" || user.role === "admin_helper") {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    }
    return <CustomerDashboard user={user} onLogout={handleLogout} />;
  }
  
  return <LandingPage onLogin={() => setPage("login")} onRegister={() => setPage("register")} />;
}

export default App;
