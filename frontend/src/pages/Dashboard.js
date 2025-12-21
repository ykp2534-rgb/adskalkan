import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Shield, 
  MousePointerClick, 
  AlertTriangle, 
  Ban, 
  Users, 
  TrendingUp,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentThreats, setRecentThreats] = useState([]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setStats(response.data);
      
      const threatsResponse = await api.get('/analytics/recent-threats?limit=5');
      setRecentThreats(threatsResponse.data);
    } catch (error) {
      toast.error('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6" data-testid="dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Hoş Geldiniz, {user?.full_name}!
          </h1>
          <p className="text-gray-600 mt-1">Google Ads koruma sisteminiz aktif çalışıyor</p>
        </div>
        <Button 
          onClick={fetchDashboard} 
          variant="outline" 
          size="sm"
          data-testid="refresh-dashboard-button"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Toplam Tıklama" 
          value={stats?.total_clicks || 0}
          icon={MousePointerClick}
          color="text-blue-500"
          subtitle="Tüm kampanyalar"
        />
        <StatCard 
          title="Şüpheli Tıklama" 
          value={stats?.suspicious_clicks || 0}
          icon={AlertTriangle}
          color="text-yellow-500"
          subtitle={`${stats?.fraud_percentage || 0}% fraud oranı`}
        />
        <StatCard 
          title="Engellenen Tıklama" 
          value={stats?.blocked_clicks || 0}
          icon={Ban}
          color="text-red-500"
          subtitle={`~${stats?.money_saved_estimate || 0} TL tasarruf`}
        />
        <StatCard 
          title="Havuz Üyeliği" 
          value={stats?.pools_joined || 0}
          icon={Users}
          color="text-green-500"
          subtitle="Kollektif koruma"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Threats */}
        <Card data-testid="recent-threats-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
              Son Tehditler
            </CardTitle>
            <CardDescription>Son 24 saatte tespit edilen şüpheli tıklamalar</CardDescription>
          </CardHeader>
          <CardContent>
            {recentThreats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>Tehdit tespit edilmedi!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentThreats.map((threat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-sm">{threat.ip_address}</p>
                      <p className="text-xs text-gray-600">Risk Skoru: {threat.fraud_score}</p>
                    </div>
                    <Ban className="w-4 h-4 text-red-500" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pools */}
        <Card data-testid="pools-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-500" />
              Havuzlarınız
            </CardTitle>
            <CardDescription>Üye olduğunuz koruma havuzları</CardDescription>
          </CardHeader>
          <CardContent>
            {!stats?.pool_details || stats.pool_details.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500 mb-3">Henüz havuza katılmadınız</p>
                <Button 
                  onClick={() => window.location.href = '/pools'}
                  className="bg-gradient-to-r from-orange-500 to-red-500"
                  data-testid="join-pool-button"
                >
                  Havuza Katıl
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.pool_details.map((pool) => (
                  <div key={pool.pool_code} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{pool.sector_name || `Havuz ${pool.pool_code}`}</p>
                        <p className="text-xs text-gray-600">
                          {pool.member_count} üye • {pool.total_blocked_ips} IP engellendi
                        </p>
                      </div>
                      <Shield className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card data-testid="performance-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Performans Özeti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Koruma Oranı</span>
                <span className="text-sm font-bold text-green-600">
                  {100 - (stats?.fraud_percentage || 0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                  style={{ width: `${100 - (stats?.fraud_percentage || 0)}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats?.total_campaigns || 0}</p>
                <p className="text-xs text-gray-600">Aktif Kampanya</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats?.clean_clicks || 0}</p>
                <p className="text-xs text-gray-600">Temiz Tıklama</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats?.recent_threats_24h || 0}</p>
                <p className="text-xs text-gray-600">Bugünkü Tehdit</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
