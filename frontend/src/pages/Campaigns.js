import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Target, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', google_ads_id: '' });

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/campaigns');
      setCampaigns(response.data);
    } catch (error) {
      toast.error('Kampanyalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      await api.post('/campaigns', newCampaign);
      toast.success('Kampanya oluşturuldu!');
      setOpenDialog(false);
      setNewCampaign({ name: '', google_ads_id: '' });
      fetchCampaigns();
    } catch (error) {
      toast.error('Kampanya oluşturulamadı');
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
    <div className="space-y-6" data-testid="campaigns-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kampanyalar</h1>
          <p className="text-gray-600 mt-1">Google Ads kampanyalarınızı yönetin</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500" data-testid="create-campaign-button">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Kampanya
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Kampanya Oluştur</DialogTitle>
              <DialogDescription>Google Ads kampanyanızı sisteme ekleyin</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <Label htmlFor="name">Kampanya Adı</Label>
                <Input
                  id="name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="Örn: Yaz Kampanyası 2025"
                  required
                  data-testid="campaign-name-input"
                />
              </div>
              <div>
                <Label htmlFor="google_ads_id">Google Ads ID (Opsiyonel)</Label>
                <Input
                  id="google_ads_id"
                  value={newCampaign.google_ads_id}
                  onChange={(e) => setNewCampaign({ ...newCampaign, google_ads_id: e.target.value })}
                  placeholder="Demo mod için boş bırakabilirsiniz"
                  data-testid="google-ads-id-input"
                />
              </div>
              <Button type="submit" className="w-full" data-testid="submit-campaign-button">
                Oluştur
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {campaigns.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Henüz kampanya oluşturmadınız</h3>
            <p className="text-gray-600 mb-4">Korumaya başlamak için ilk kampanyanızı ekleyin</p>
            <Button 
              onClick={() => setOpenDialog(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              İlk Kampanyanızı Oluşturun
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow" data-testid={`campaign-${campaign.id}`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-orange-500" />
                  {campaign.name}
                </CardTitle>
                <CardDescription>
                  {campaign.google_ads_id || 'Demo Kampanya'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Toplam Tıklama</span>
                    <span className="font-bold">{campaign.total_clicks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Şüpheli</span>
                    <span className="font-bold text-yellow-600">{campaign.suspicious_clicks_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Engellenen</span>
                    <span className="font-bold text-red-600">{campaign.blocked_clicks_count}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status === 'active' ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Campaigns;
