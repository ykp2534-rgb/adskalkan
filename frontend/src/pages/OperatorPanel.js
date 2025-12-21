import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Users, Shield, BarChart3, RefreshCw } from 'lucide-react';

const OperatorPanel = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [cities, setCities] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  
  // Yeni havuz formu
  const [selectedCity, setSelectedCity] = useState('');
  const [sectorName, setSectorName] = useState('');
  const [membershipPrice, setMembershipPrice] = useState(99);

  useEffect(() => {
    if (user?.role !== 'operator' && user?.role !== 'admin') {
      toast.error('Bu sayfaya erişim yetkiniz yok');
      window.location.href = '/dashboard';
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsRes, citiesRes] = await Promise.all([
        api.get('/pools/operator/stats'),
        api.get('/pools/operator/cities')
      ]);
      setStats(statsRes.data);
      setCities(citiesRes.data);
    } catch (error) {
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePool = async (e) => {
    e.preventDefault();
    
    if (!selectedCity || !sectorName) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      await api.post('/pools/operator/create-pool', {
        city_plate_code: selectedCity,
        sector_name: sectorName,
        membership_price: membershipPrice
      });
      
      toast.success(`Havuz başarıyla oluşturuldu! ${sectorName} - ${cities.find(c => c.code === selectedCity)?.name}`);
      setOpenDialog(false);
      setSectorName('');
      setSelectedCity('');
      setMembershipPrice(99);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Havuz oluşturulamadı');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="operator-panel">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Operatör Paneli
          </h1>
          <p className="text-gray-600 mt-1">Havuz yönetimi ve istatistikler</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500" data-testid="create-pool-button">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Havuz Oluştur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Havuz Oluştur</DialogTitle>
              <DialogDescription>
                Şehir ve sektör seçerek yeni havuz oluşturun
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePool} className="space-y-4">
              <div>
                <Label htmlFor="city">Şehir Seçin</Label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger data-testid="city-select">
                    <SelectValue placeholder="Şehir seçin..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {cities.map((city) => (
                      <SelectItem key={city.code} value={city.code}>
                        {city.name} ({city.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sector">Sektör Adı</Label>
                <Input
                  id="sector"
                  value={sectorName}
                  onChange={(e) => setSectorName(e.target.value)}
                  placeholder="Örn: Tesisatçı, Avukat, Emlak"
                  required
                  data-testid="sector-name-input"
                />
              </div>
              
              <div>
                <Label htmlFor="price">Aylık Üyelik Ücreti (TL)</Label>
                <Input
                  id="price"
                  type="number"
                  value={membershipPrice}
                  onChange={(e) => setMembershipPrice(parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
                  data-testid="membership-price-input"
                />
              </div>
              
              <Button type="submit" className="w-full" data-testid="submit-create-pool">
                Havuz Oluştur
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Havuz</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_pools || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Aktif havuz sayısı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Üye</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_members || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Havuz üyeleri</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engellenen IP</CardTitle>
            <BarChart3 className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_blocked_ips || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Toplam engelleme</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Cities */}
      <Card>
        <CardHeader>
          <CardTitle>Popüler Şehirler</CardTitle>
          <CardDescription>En çok havuzu olan şehirler</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.top_cities && stats.top_cities.length > 0 ? (
            <div className="space-y-2">
              {stats.top_cities.map((city, idx) => {
                const cityData = cities.find(c => c.code === city._id);
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-orange-500 mr-3">{idx + 1}</span>
                      <span className="font-medium">{cityData?.name || city._id}</span>
                    </div>
                    <span className="text-sm text-gray-600">{city.count} havuz</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">Henüz veri yok</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OperatorPanel;
