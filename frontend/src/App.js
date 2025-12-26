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
  Check, AlertOctagon, Gauge, Radio, Server, Cloud, Ban
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
    if (start === end) return;
    
    const incrementTime = duration / end;
    const timer = setInterval(() => {
      start += Math.ceil(end / 50);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 20);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Risk Gauge Component
const RiskGauge = ({ score, size = 120 }) => {
  const radius = size / 2 - 10;
  const circumference = radius * Math.PI;
  const progress = (score / 100) * circumference;
  
  const getColor = () => {
    if (score >= 70) return "#ef4444";
    if (score >= 50) return "#f97316";
    if (score >= 30) return "#eab308";
    return "#22c55e";
  };
  
  return (
    <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
      <svg width={size} height={size / 2 + 10} className="transform -rotate-0">
        <path
          d={`M ${10} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke="#1f2937"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={`M ${10} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <span className="text-2xl font-bold" style={{ color: getColor() }}>{score}</span>
        <span className="text-xs text-gray-400">Risk Skoru</span>
      </div>
    </div>
  );
};

// Live Pulse Indicator
const LivePulse = ({ active = true }) => (
  <span className="relative flex h-3 w-3">
    {active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
    <span className={`relative inline-flex rounded-full h-3 w-3 ${active ? 'bg-red-500' : 'bg-gray-500'}`}></span>
  </span>
);

// Stat Card
const StatCard = ({ title, value, icon: Icon, change, changeType, color = "blue", onClick }) => {
  const colors = {
    blue: "from-blue-600 to-blue-800",
    green: "from-emerald-600 to-emerald-800",
    red: "from-red-600 to-red-800",
    orange: "from-orange-600 to-orange-800",
    purple: "from-purple-600 to-purple-800",
    cyan: "from-cyan-600 to-cyan-800",
  };
  
  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors[color]} p-6 shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer group`}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all"></div>
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="rounded-xl bg-white/20 p-3">
            <Icon className="h-6 w-6 text-white" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center text-sm ${changeType === 'up' ? 'text-green-300' : 'text-red-300'}`}>
              {changeType === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {change}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-3xl font-bold text-white">
            <AnimatedCounter value={value} />
          </h3>
          <p className="text-sm text-white/70 mt-1">{title}</p>
        </div>
      </div>
    </div>
  );
};

// Mini Chart (Sparkline)
const MiniChart = ({ data, color = "#3b82f6", height = 40 }) => {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ');
  
  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`url(#gradient-${color})`}
      />
    </svg>
  );
};

// Live Attack Item
const LiveAttackItem = ({ attack, isNew }) => {
  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };
  
  const getDeviceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Laptop;
    }
  };
  
  const DeviceIcon = getDeviceIcon(attack.device_type);
  
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all ${isNew ? 'animate-pulse-once' : ''}`}>
      <div className={`w-2 h-2 rounded-full ${getRiskColor(attack.risk_level)}`}></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-gray-300 truncate">{attack.ip_address}</span>
          {attack.is_blocked && <Ban className="h-4 w-4 text-red-400" />}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {attack.city || 'Bilinmiyor'}
          </span>
          <span className="flex items-center gap-1">
            <DeviceIcon className="h-3 w-3" />
            {attack.device_type || 'Bilinmiyor'}
          </span>
          <span className="flex items-center gap-1">
            <Timer className="h-3 w-3" />
            {attack.time_on_page || 0}s
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-white">{attack.risk_score}</div>
        <div className="text-xs text-gray-500">Risk</div>
      </div>
    </div>
  );
};

// Donut Chart
const DonutChart = ({ data, size = 150 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        {data.map((item, index) => {
          const percentage = item.value / total;
          const angle = percentage * 360;
          const startAngle = currentAngle;
          currentAngle += angle;
          
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = ((startAngle + angle) * Math.PI) / 180;
          
          const x1 = 50 + 40 * Math.cos(startRad);
          const y1 = 50 + 40 * Math.sin(startRad);
          const x2 = 50 + 40 * Math.cos(endRad);
          const y2 = 50 + 40 * Math.sin(endRad);
          
          const largeArc = angle > 180 ? 1 : 0;
          
          return (
            <path
              key={index}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={item.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}
        <circle cx="50" cy="50" r="25" fill="#111827" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{total}</div>
          <div className="text-xs text-gray-400">Toplam</div>
        </div>
      </div>
    </div>
  );
};

// Progress Bar
const ProgressBar = ({ value, max, label, color = "blue" }) => {
  const percentage = (value / max) * 100;
  const colors = {
    blue: "bg-blue-500",
    green: "bg-emerald-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
  };
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colors[color]} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

// ==================== PAGES ====================

// Landing Page
const LandingPage = ({ onLogin, onRegister }) => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"></div>
        </div>
        
        <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="h-10 w-10 text-blue-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AdsKalkan
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Giriş Yap
            </button>
            <button 
              onClick={onRegister}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors"
            >
              Ücretsiz Başla
            </button>
          </div>
        </nav>
        
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm mb-8">
            <Zap className="h-4 w-4" />
            Yapay Zeka Destekli Koruma
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Google Ads Bütçenizi
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Sahte Tıklamalardan
            </span>
            <br />
            Koruyun
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
            Gelişmiş yapay zeka algoritmaları ile bot trafiğini, click farm saldırılarını ve 
            sahte tıklamaları gerçek zamanlı tespit edip engelleyin.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onRegister}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-medium text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              Ücretsiz Deneyin
            </button>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-medium text-lg transition-all">
              Demo İzle
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            {[
              { value: "10M+", label: "Engellenen Tıklama" },
              { value: "500+", label: "Aktif Müşteri" },
              { value: "%99.9", label: "Tespit Oranı" },
              { value: "7/24", label: "Canlı Koruma" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                <div className="text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>
      
      {/* Features */}
      <section className="py-24 px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Neden AdsKalkan?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Rakiplerden farklı olarak, çok katmanlı analiz motorumuz sahte trafiği %99.9 doğrulukla tespit eder.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Çok Katmanlı Koruma",
                description: "IP, cihaz, davranış, fingerprint ve pattern analizi ile 5 katmanlı koruma.",
                color: "blue"
              },
              {
                icon: Users,
                title: "Havuz Sistemi",
                description: "Sektördeki diğer sitelerle tehdit bilgisi paylaşımı. Bir sitede tespit, hepsinde engelleme.",
                color: "purple"
              },
              {
                icon: Activity,
                title: "Gerçek Zamanlı İzleme",
                description: "Canlı dashboard ile anlık saldırı tespiti ve otomatik engelleme.",
                color: "green"
              },
              {
                icon: BarChart3,
                title: "Detaylı Analitik",
                description: "Şehir, cihaz, saat bazlı detaylı raporlar ve indirilebilir analizler.",
                color: "orange"
              },
              {
                icon: Zap,
                title: "Hızlı Entegrasyon",
                description: "Tek satır kod ile sitenize entegre edin. 5 dakikada koruma başlasın.",
                color: "yellow"
              },
              {
                icon: Lock,
                title: "Google Ads Entegrasyonu",
                description: "Tespit edilen IP'leri otomatik olarak Google Ads'e gönderin.",
                color: "red"
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="p-8 rounded-2xl bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all group"
              >
                <div className={`inline-flex p-3 rounded-xl bg-${feature.color}-500/20 text-${feature.color}-400 mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-24 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Reklam Bütçenizi Korumaya Başlayın
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            7 gün ücretsiz deneme ile AdsKalkan'ı test edin. Kredi kartı gerekmez.
          </p>
          <button 
            onClick={onRegister}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-medium text-lg transition-all transform hover:scale-105"
          >
            Ücretsiz Başla
          </button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-500" />
            <span className="font-bold">AdsKalkan</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 AdsKalkan. Tüm hakları saklıdır.
          </p>
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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]"></div>
      </div>
      
      <div className="relative w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl">
          <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2">
            <ChevronRight className="h-4 w-4 rotate-180" />
            Geri
          </button>
          
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-10 w-10 text-blue-500" />
            <span className="text-2xl font-bold">AdsKalkan</span>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Hoş Geldiniz</h1>
          <p className="text-gray-400 mb-8">Hesabınıza giriş yapın</p>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white"
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
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-medium transition-all disabled:opacity-50"
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
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    company_name: "",
    phone: ""
  });
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Kayıt Başarılı!</h2>
          <p className="text-gray-400 mb-6">
            Hesabınız oluşturuldu. Yönetici onayından sonra giriş yapabilirsiniz.
          </p>
          <button onClick={onBack} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-all">
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
      </div>
      
      <div className="relative w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl">
          <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2">
            <ChevronRight className="h-4 w-4 rotate-180" />
            Geri
          </button>
          
          <h1 className="text-2xl font-bold mb-2">Hesap Oluştur</h1>
          <p className="text-gray-400 mb-8">7 gün ücretsiz deneme</p>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Ad Soyad *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-blue-500 outline-none text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Şirket Adı</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-blue-500 outline-none text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-blue-500 outline-none text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-blue-500 outline-none text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Şifre *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-blue-500 outline-none text-white"
                required
                minLength={6}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-medium transition-all disabled:opacity-50 mt-6"
            >
              {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [users, setUsers] = useState([]);
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveAttacks, setLiveAttacks] = useState([]);
  
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setDashboardData(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);
  
  const fetchVisitors = useCallback(async () => {
    try {
      const res = await api.get("/admin/visitors?limit=100");
      setVisitors(res.data.visitors || []);
      setLiveAttacks(res.data.visitors?.slice(0, 10) || []);
    } catch (err) {
      console.error(err);
    }
  }, []);
  
  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);
  
  const fetchPools = useCallback(async () => {
    try {
      const res = await api.get("/admin/pools");
      setPools(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchVisitors(), fetchUsers(), fetchPools()]);
      setLoading(false);
    };
    loadData();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboard();
      fetchVisitors();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchDashboard, fetchVisitors, fetchUsers, fetchPools]);
  
  const handleApproveUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/approve`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleRejectUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/reject`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
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
  
  const riskDistributionData = dashboardData ? [
    { label: "Düşük", value: dashboardData.risk_distribution?.low || 0, color: "#22c55e" },
    { label: "Orta", value: dashboardData.risk_distribution?.medium || 0, color: "#eab308" },
    { label: "Yüksek", value: dashboardData.risk_distribution?.high || 0, color: "#f97316" },
    { label: "Kritik", value: dashboardData.risk_distribution?.critical || 0, color: "#ef4444" },
  ] : [];
  
  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-500 flex-shrink-0" />
            {sidebarOpen && <span className="text-xl font-bold">AdsKalkan</span>}
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Çıkış</span>}
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-800 rounded-lg">
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button onClick={() => { fetchDashboard(); fetchVisitors(); }} className="p-2 hover:bg-gray-800 rounded-lg">
                <RefreshCw className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <LivePulse active={true} />
                <span className="text-sm text-gray-400">Canlı</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-800 rounded-xl">
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
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && dashboardData && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      title="Toplam Ziyaretçi"
                      value={dashboardData.total_visitors}
                      icon={Eye}
                      color="blue"
                    />
                    <StatCard
                      title="Engellenen"
                      value={dashboardData.blocked_visitors}
                      icon={ShieldX}
                      color="red"
                    />
                    <StatCard
                      title="Bugün Ziyaretçi"
                      value={dashboardData.today_visitors}
                      icon={Activity}
                      color="green"
                    />
                    <StatCard
                      title="Bugün Engellenen"
                      value={dashboardData.today_blocked}
                      icon={Ban}
                      color="orange"
                    />
                  </div>
                  
                  {/* Second Row Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      title="Toplam Kullanıcı"
                      value={dashboardData.total_users}
                      icon={Users}
                      color="purple"
                    />
                    <StatCard
                      title="Bekleyen Onay"
                      value={dashboardData.pending_users}
                      icon={Clock}
                      color="orange"
                    />
                    <StatCard
                      title="Aktif Site"
                      value={dashboardData.total_sites}
                      icon={Globe}
                      color="cyan"
                    />
                    <StatCard
                      title="Havuz Sayısı"
                      value={dashboardData.total_pools}
                      icon={Layers}
                      color="blue"
                    />
                  </div>
                  
                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Protection Rate */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Koruma Oranı</h3>
                      <div className="flex items-center justify-center">
                        <RiskGauge score={Math.round(dashboardData.protection_rate)} size={180} />
                      </div>
                      <p className="text-center text-gray-400 mt-4">
                        Toplam trafiğin %{dashboardData.protection_rate}'i engellendi
                      </p>
                    </div>
                    
                    {/* Risk Distribution */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Risk Dağılımı</h3>
                      <div className="flex items-center justify-center">
                        <DonutChart data={riskDistributionData} size={160} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {riskDistributionData.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-sm text-gray-400">{item.label}: {item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Daily Trend */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Son 30 Gün</h3>
                      <MiniChart 
                        data={dashboardData.daily_stats?.map(d => d.visitors) || []} 
                        color="#3b82f6"
                        height={100}
                      />
                      <div className="flex justify-between mt-4 text-sm text-gray-400">
                        <span>30 gün önce</span>
                        <span>Bugün</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Cities */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold mb-4">En Çok Trafik Gelen Şehirler</h3>
                      <div className="space-y-3">
                        {(dashboardData.city_distribution || []).slice(0, 5).map((city, i) => (
                          <ProgressBar
                            key={i}
                            label={city._id || 'Bilinmiyor'}
                            value={city.count}
                            max={dashboardData.city_distribution[0]?.count || 1}
                            color={i === 0 ? 'blue' : i === 1 ? 'purple' : 'green'}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Top Blocked IPs */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold mb-4">En Çok Engellenen IP'ler</h3>
                      <div className="space-y-3">
                        {(dashboardData.top_blocked_ips || []).slice(0, 5).map((ip, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                            <span className="font-mono text-sm">{ip._id}</span>
                            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                              {ip.count} engel
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Live Monitoring Tab */}
              {activeTab === "live" && (
                <div className="space-y-6">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <LivePulse />
                        <h3 className="text-lg font-semibold">Canlı Saldırı Akışı</h3>
                      </div>
                      <span className="text-sm text-gray-400">Son 100 ziyaret</span>
                    </div>
                    
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {liveAttacks.map((attack, i) => (
                        <LiveAttackItem key={attack.id || i} attack={attack} isNew={i === 0} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Visitors Tab */}
              {activeTab === "visitors" && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Tüm Ziyaretçiler</h3>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="IP, şehir ara..."
                            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:border-blue-500 outline-none text-sm"
                          />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-xl hover:bg-gray-700">
                          <Filter className="h-4 w-4" />
                          Filtrele
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-700">
                          <Download className="h-4 w-4" />
                          Dışa Aktar
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">IP Adresi</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Şehir</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Cihaz</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Süre</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Risk</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Durum</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Tarih</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {visitors.map((visitor, i) => (
                          <tr key={visitor.id || i} className="hover:bg-gray-800/50">
                            <td className="px-6 py-4 font-mono text-sm">{visitor.ip_address}</td>
                            <td className="px-6 py-4 text-sm">{visitor.city || '-'}</td>
                            <td className="px-6 py-4 text-sm">{visitor.device_type || '-'}</td>
                            <td className="px-6 py-4 text-sm">{visitor.time_on_page || 0}s</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                visitor.risk_level === 'critical' ? 'bg-red-500/20 text-red-400' :
                                visitor.risk_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                visitor.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {visitor.risk_score}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {visitor.is_blocked ? (
                                <span className="flex items-center gap-1 text-red-400 text-sm">
                                  <Ban className="h-4 w-4" /> Engellendi
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-green-400 text-sm">
                                  <CheckCircle className="h-4 w-4" /> İzin
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">
                              {new Date(visitor.created_at).toLocaleString('tr-TR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="space-y-6">
                  {/* Pending Users */}
                  {users.filter(u => u.status === 'pending').length > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Onay Bekleyen Kullanıcılar
                      </h3>
                      <div className="space-y-3">
                        {users.filter(u => u.status === 'pending').map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-xl">
                            <div>
                              <p className="font-medium">{user.full_name}</p>
                              <p className="text-sm text-gray-400">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApproveUser(user.id)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-medium flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4" /> Onayla
                              </button>
                              <button
                                onClick={() => handleRejectUser(user.id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-medium flex items-center gap-2"
                              >
                                <XCircle className="h-4 w-4" /> Reddet
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* All Users */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-gray-800">
                      <h3 className="text-lg font-semibold">Tüm Kullanıcılar</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-800/50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Kullanıcı</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Rol</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Durum</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Kayıt</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">İşlem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-800/50">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-medium">{user.full_name}</p>
                                  <p className="text-sm text-gray-400">{user.email}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.role === 'super_admin' ? 'bg-purple-500/20 text-purple-400' :
                                  user.role === 'admin_helper' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {user.role === 'super_admin' ? 'Süper Admin' : 
                                   user.role === 'admin_helper' ? 'Admin Yardımcısı' : 'Müşteri'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                  user.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {user.status === 'approved' ? 'Onaylı' : 
                                   user.status === 'pending' ? 'Bekliyor' : 'Reddedildi'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-400">
                                {new Date(user.created_at).toLocaleDateString('tr-TR')}
                              </td>
                              <td className="px-6 py-4">
                                <button className="p-2 hover:bg-gray-700 rounded-lg">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Pools Tab */}
              {activeTab === "pools" && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl">
                      <Plus className="h-4 w-4" /> Yeni Havuz
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pools.map((pool) => (
                      <div key={pool.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-blue-500/20 rounded-xl">
                            <Layers className="h-6 w-6 text-blue-400" />
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${pool.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {pool.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{pool.name}</h3>
                        <p className="text-sm text-gray-400 mb-4">{pool.sector} {pool.city && `- ${pool.city}`}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{pool.sites?.length || 0} site</span>
                          <span className="text-red-400">{pool.blocked_ips?.length || 0} engelli IP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Blocked IPs Tab */}
              {activeTab === "blocked" && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Engellenen IP'ler</h3>
                  <p className="text-gray-400">Engellenen IP listesi burada görünecek.</p>
                </div>
              )}
              
              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Sistem Ayarları</h3>
                  <p className="text-gray-400">Ayarlar burada görünecek.</p>
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold">AdsKalkan</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{user?.full_name}</span>
            <button onClick={onLogout} className="p-2 hover:bg-gray-800 rounded-lg">
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
            <p className="text-gray-400">Yönetici hesabınızı onayladığında tüm özelliklere erişebilirsiniz.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Toplam Ziyaretçi"
                value={dashboardData?.total_visitors || 0}
                icon={Eye}
                color="blue"
              />
              <StatCard
                title="Engellenen Tıklama"
                value={dashboardData?.blocked_visitors || 0}
                icon={ShieldX}
                color="red"
              />
              <StatCard
                title="Koruma Oranı"
                value={dashboardData?.protection_rate || 0}
                icon={ShieldCheck}
                color="green"
              />
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Siteleriniz</h3>
              {dashboardData?.sites?.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.sites.map((site) => (
                    <div key={site.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                      <div>
                        <p className="font-medium">{site.name}</p>
                        <p className="text-sm text-gray-400">{site.domain}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400">{site.total_visitors} ziyaretçi</p>
                        <p className="text-red-400 text-sm">{site.blocked_clicks} engellendi</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">Henüz site eklenmemiş.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// ==================== MAIN APP ====================
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
  
  if (page === "landing") {
    return <LandingPage onLogin={() => setPage("login")} onRegister={() => setPage("register")} />;
  }
  
  if (page === "login") {
    return <LoginPage onBack={() => setPage("landing")} onSuccess={handleLoginSuccess} />;
  }
  
  if (page === "register") {
    return <RegisterPage onBack={() => setPage("landing")} onSuccess={handleLoginSuccess} />;
  }
  
  if (page === "dashboard" && user) {
    if (user.role === "super_admin" || user.role === "admin_helper") {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    }
    return <CustomerDashboard user={user} onLogout={handleLogout} />;
  }
  
  return <LandingPage onLogin={() => setPage("login")} onRegister={() => setPage("register")} />;
}

export default App;
