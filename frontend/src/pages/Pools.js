import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users, Shield, Plus, MapPin, Briefcase, RefreshCw } from 'lucide-react';

const Pools = () => {
  const [allPools, setAllPools] = useState([]);
  const [myPools, setMyPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [poolCode, setPoolCode] = useState('');
  
  // YENİ: Havuz ayarları
  const [clickThreshold, setClickThreshold] = useState(1);
  const [blockDuration, setBlockDuration] = useState(7);

  const fetchPools = async () => {
    try {
      const [allPoolsRes, myPoolsRes] = await Promise.all([
        api.get('/pools?limit=50'),
        api.get('/pools/my-pools')
      ]);
      setAllPools(allPoolsRes.data);
      setMyPools(myPoolsRes.data);
    } catch (error) {
      toast.error('Havuzlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

  const handleJoinPool = async (code) => {
    try {
      await api.post('/pools/join', { 
        pool_code: code, 
        user_id: '',
        click_threshold: clickThreshold,
        block_duration_days: blockDuration
      });
      toast.success(`Havuz ${code}'a katıldınız! (${clickThreshold} tıklama, ${blockDuration} gün)`);
      setOpenDialog(false);
      setPoolCode('');
      setClickThreshold(1);
      setBlockDuration(7);
      fetchPools();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Havuza katılınamadı');
    }
  };

  const getCityName = (plateCode) => {
    const cities = {
      '01': 'Adana', '06': 'Ankara', '07': 'Antalya', '09': 'Aydın', '10': 'Balıkesir',
      '16': 'Bursa', '17': 'Çanakkale', '20': 'Denizli', '21': 'Diyarbakır', '27': 'Gaziantep',
      '34': 'İstanbul', '35': 'İzmir', '38': 'Kayseri', '41': 'Kocaeli', '42': 'Konya',
      '52': 'Ordu', '55': 'Samsun', '58': 'Sivas', '61': 'Trabzon', '63': 'Şanlıurfa'
    };
    return cities[plateCode] || `Plaka ${plateCode}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const myPoolCodes = myPools.map(p => p.pool_code);

  return (
    <div className="space-y-6" data-testid="pools-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Koruma Havuzları</h1>
          <p className="text-gray-600 mt-1">Şehir + Sektör bazlı kollektif koruma</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500" data-testid="join-pool-button">
              <Plus className="w-4 h-4 mr-2" />
              Havuza Katıl
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Havuza Katıl</DialogTitle>
              <DialogDescription>
                Havuz kodunu girerek sektör havuzuna katılabilirsiniz
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="poolCode">Havuz Kodu</Label>
                <Input
                  id="poolCode"
                  value={poolCode}
                  onChange={(e) => setPoolCode(e.target.value)}
                  placeholder="Örn: 34001 (İstanbul Tesisatçı)"
                  maxLength={5}
                  data-testid="pool-code-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: [Plaka Kodu 2 hane][Sektör Kodu 3 hane]
                </p>
              </div>
              <Button 
                onClick={() => handleJoinPool(poolCode)} 
                className="w-full"
                disabled={poolCode.length !== 5}
                data-testid="submit-join-pool-button"
              >
                Katıl
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* My Pools */}
      {myPools.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-500" />
            Üye Olduğunuz Havuzlar ({myPools.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myPools.map((pool) => (
              <Card key={pool.pool_code} className="border-2 border-green-200 bg-green-50" data-testid={`my-pool-${pool.pool_code}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{pool.sector_name || `Havuz ${pool.pool_code}`}</span>
                    <Badge className="bg-green-600">Aktif</Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {getCityName(pool.city_plate_code)} ({pool.pool_code})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Üye Sayısı</span>
                      <span className="font-bold">{pool.member_count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Engellenen IP</span>
                      <span className="font-bold text-red-600">{pool.total_blocked_ips}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Pools */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-500" />
          Mevcut Havuzlar
        </h2>
        {allPools.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Henüz havuz oluşturulmamış</h3>
              <p className="text-gray-600">Operator havuz oluşturduğunda burada görüntülenecek</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allPools.filter(p => !myPoolCodes.includes(p.pool_code)).map((pool) => (
              <Card key={pool.pool_code} className="hover:shadow-lg transition-shadow" data-testid={`pool-${pool.pool_code}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{pool.sector_name || `Havuz ${pool.pool_code}`}</span>
                    {pool.is_premium && <Badge variant="secondary">Premium</Badge>}
                  </CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {getCityName(pool.city_plate_code)} ({pool.pool_code})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Üye Sayısı</span>
                      <span className="font-bold">{pool.member_count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Engellenen IP</span>
                      <span className="font-bold text-red-600">{pool.total_blocked_ips}</span>
                    </div>
                    <Button 
                      onClick={() => handleJoinPool(pool.pool_code)}
                      className="w-full mt-2"
                      size="sm"
                      data-testid={`join-pool-${pool.pool_code}-button`}
                    >
                      Havuza Katıl
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pools;
