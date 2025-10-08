import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Navigation Component
const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Tableau de bord', icon: '🏠' },
    { path: '/lotissements', label: 'Lotissements', icon: '🏘️' },
    { path: '/lots', label: 'Lots', icon: '📦' },
    { path: '/clients', label: 'Clients', icon: '👥' },
    { path: '/ventes', label: 'Ventes', icon: '💼' },
    { path: '/paiements', label: 'Paiements', icon: '💰' },
  ];

  return (
    <nav className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 shadow-2xl border-b border-slate-700">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            🏗️ Gestion Lotissements BTP
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-slate-700 hover:scale-105 ${
                location.pathname === item.path 
                  ? 'bg-gradient-to-r from-blue-600 to-emerald-600 shadow-lg' 
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/rapports/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Tableau de bord</h2>
        <Button onClick={fetchDashboardData} variant="outline">
          🔄 Actualiser
        </Button>
      </div>

      {dashboardData && (
        <>
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Lotissements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {dashboardData.statistiques.total_lotissements}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700">Lots Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-900">
                  {dashboardData.statistiques.lots_disponibles}
                </div>
                <div className="text-xs text-emerald-600 mt-1">
                  Sur {dashboardData.statistiques.total_lots} lots
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Lots Vendus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">
                  {dashboardData.statistiques.lots_vendus}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  {dashboardData.statistiques.total_clients}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informations financières */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700">💰 Chiffre d'Affaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(dashboardData.finances.chiffre_affaires_total)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
              <CardHeader>
                <CardTitle className="text-teal-700">💳 Montant Encaissé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-teal-900">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(dashboardData.finances.montant_encaisse)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700">⏳ Reste à Encaisser</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-900">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(dashboardData.finances.reste_a_encaisser)}
                </div>
                <div className="text-sm text-red-600 mt-2">
                  {dashboardData.statistiques.ventes_partielles} ventes partielles
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

// Lotissements Management
const LotissementsPage = () => {
  const [lotissements, setLotissements] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLotissement, setNewLotissement] = useState({ nom: '', localisation: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLotissements();
  }, []);

  const fetchLotissements = async () => {
    try {
      const response = await axios.get(`${API}/lotissements`);
      setLotissements(response.data);
    } catch (error) {
      toast.error('Erreur lors de la récupération des lotissements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLotissement = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/lotissements`, newLotissement);
      toast.success('Lotissement créé avec succès');
      setNewLotissement({ nom: '', localisation: '', description: '' });
      setIsDialogOpen(false);
      fetchLotissements();
    } catch (error) {
      toast.error('Erreur lors de la création du lotissement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Gestion des Lotissements</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700">
              ➕ Nouveau Lotissement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau lotissement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateLotissement} className="space-y-4">
              <div>
                <Label htmlFor="nom">Nom du lotissement</Label>
                <Input
                  id="nom"
                  value={newLotissement.nom}
                  onChange={(e) => setNewLotissement({...newLotissement, nom: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="localisation">Localisation</Label>
                <Input
                  id="localisation"
                  value={newLotissement.localisation}
                  onChange={(e) => setNewLotissement({...newLotissement, localisation: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  value={newLotissement.description}
                  onChange={(e) => setNewLotissement({...newLotissement, description: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full">
                Créer le lotissement
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lotissements.map((lotissement) => (
            <Card key={lotissement.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{lotissement.nom}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-slate-600">📍 {lotissement.localisation}</p>
                  {lotissement.description && (
                    <p className="text-sm text-slate-500">{lotissement.description}</p>
                  )}
                  <p className="text-xs text-slate-400">
                    Créé le {new Date(lotissement.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Simple pages for other sections (will be expanded)
const LotsPage = () => {
  const [lots, setLots] = useState([]);
  const [lotissements, setLotissements] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLot, setNewLot] = useState({
    lotissement_id: '',
    numero_lot: '',
    numero_ilot: '',
    superficie_m2: '',
    prix_m2: ''
  });

  useEffect(() => {
    fetchLots();
    fetchLotissements();
  }, []);

  const fetchLots = async () => {
    try {
      const response = await axios.get(`${API}/lots`);
      setLots(response.data);
    } catch (error) {
      toast.error('Erreur lors de la récupération des lots');
    }
  };

  const fetchLotissements = async () => {
    try {
      const response = await axios.get(`${API}/lotissements`);
      setLotissements(response.data);
    } catch (error) {
      toast.error('Erreur lors de la récupération des lotissements');
    }
  };

  const handleCreateLot = async (e) => {
    e.preventDefault();
    try {
      const lotData = {
        ...newLot,
        superficie_m2: parseFloat(newLot.superficie_m2),
        prix_m2: parseFloat(newLot.prix_m2)
      };
      await axios.post(`${API}/lots`, lotData);
      toast.success('Lot créé avec succès');
      setNewLot({ lotissement_id: '', numero_lot: '', numero_ilot: '', superficie_m2: '', prix_m2: '' });
      setIsDialogOpen(false);
      fetchLots();
    } catch (error) {
      toast.error('Erreur lors de la création du lot');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Gestion des Lots</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              ➕ Nouveau Lot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau lot</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateLot} className="space-y-4">
              <div>
                <Label htmlFor="lotissement_id">Lotissement</Label>
                <Select value={newLot.lotissement_id} onValueChange={(value) => setNewLot({...newLot, lotissement_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un lotissement" />
                  </SelectTrigger>
                  <SelectContent>
                    {lotissements.map((lotissement) => (
                      <SelectItem key={lotissement.id} value={lotissement.id}>
                        {lotissement.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero_lot">Numéro de Lot</Label>
                  <Input
                    id="numero_lot"
                    value={newLot.numero_lot}
                    onChange={(e) => setNewLot({...newLot, numero_lot: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="numero_ilot">Numéro d'Îlot</Label>
                  <Input
                    id="numero_ilot"
                    value={newLot.numero_ilot}
                    onChange={(e) => setNewLot({...newLot, numero_ilot: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="superficie_m2">Superficie (m²)</Label>
                  <Input
                    id="superficie_m2"
                    type="number"
                    step="0.01"
                    value={newLot.superficie_m2}
                    onChange={(e) => setNewLot({...newLot, superficie_m2: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prix_m2">Prix au m²</Label>
                  <Input
                    id="prix_m2"
                    type="number"
                    step="0.01"
                    value={newLot.prix_m2}
                    onChange={(e) => setNewLot({...newLot, prix_m2: e.target.value})}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Créer le lot
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lot</TableHead>
                <TableHead>Îlot</TableHead>
                <TableHead>Superficie</TableHead>
                <TableHead>Prix/m²</TableHead>
                <TableHead>Prix Total</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lots.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell className="font-medium">{lot.numero_lot}</TableCell>
                  <TableCell>{lot.numero_ilot}</TableCell>
                  <TableCell>{lot.superficie_m2} m²</TableCell>
                  <TableCell>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(lot.prix_m2)}</TableCell>
                  <TableCell className="font-medium">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(lot.prix_total)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={lot.statut === 'disponible' ? 'default' : lot.statut === 'vendu' ? 'destructive' : 'secondary'}
                    >
                      {lot.statut}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    nom_complet: '',
    date_naissance: '',
    lieu_naissance: '',
    numero_cni: '',
    telephone: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API}/clients`);
      setClients(response.data);
    } catch (error) {
      toast.error('Erreur lors de la récupération des clients');
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/clients`, newClient);
      toast.success('Client créé avec succès');
      setNewClient({ nom_complet: '', date_naissance: '', lieu_naissance: '', numero_cni: '', telephone: '' });
      setIsDialogOpen(false);
      fetchClients();
    } catch (error) {
      toast.error('Erreur lors de la création du client');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Gestion des Clients</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              ➕ Nouveau Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer un nouveau client</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <Label htmlFor="nom_complet">Nom Complet</Label>
                <Input
                  id="nom_complet"
                  value={newClient.nom_complet}
                  onChange={(e) => setNewClient({...newClient, nom_complet: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_naissance">Date de Naissance</Label>
                  <Input
                    id="date_naissance"
                    type="date"
                    value={newClient.date_naissance}
                    onChange={(e) => setNewClient({...newClient, date_naissance: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lieu_naissance">Lieu de Naissance</Label>
                  <Input
                    id="lieu_naissance"
                    value={newClient.lieu_naissance}
                    onChange={(e) => setNewClient({...newClient, lieu_naissance: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero_cni">Numéro CNI</Label>
                  <Input
                    id="numero_cni"
                    value={newClient.numero_cni}
                    onChange={(e) => setNewClient({...newClient, numero_cni: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    value={newClient.telephone}
                    onChange={(e) => setNewClient({...newClient, telephone: e.target.value})}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Enregistrer le client
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom Complet</TableHead>
                <TableHead>Date de Naissance</TableHead>
                <TableHead>Lieu de Naissance</TableHead>
                <TableHead>CNI</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Date d'Enregistrement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.nom_complet}</TableCell>
                  <TableCell>{new Date(client.date_naissance).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>{client.lieu_naissance}</TableCell>
                  <TableCell>{client.numero_cni}</TableCell>
                  <TableCell>{client.telephone}</TableCell>
                  <TableCell>{new Date(client.created_at).toLocaleDateString('fr-FR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {clients.length === 0 && (
            <div className="flex items-center justify-center h-32">
              <p className="text-slate-500">Aucun client enregistré</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const VentesPage = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-slate-800">Gestion des Ventes</h2>
    <Card>
      <CardContent className="flex items-center justify-center h-64">
        <p className="text-slate-500">Module en développement...</p>
      </CardContent>
    </Card>
  </div>
);

const PaiementsPage = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-slate-800">Gestion des Paiements</h2>
    <Card>
      <CardContent className="flex items-center justify-center h-64">
        <p className="text-slate-500">Module en développement...</p>
      </CardContent>
    </Card>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <BrowserRouter>
        <Navigation />
        <main className="max-w-7xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lotissements" element={<LotissementsPage />} />
            <Route path="/lots" element={<LotsPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/ventes" element={<VentesPage />} />
            <Route path="/paiements" element={<PaiementsPage />} />
          </Routes>
        </main>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;