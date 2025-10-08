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

// Fonction utilitaire pour l'export CSV
const exportCSV = async (tableName, displayName = null) => {
  try {
    const response = await axios.get(`${API}/export/csv/${tableName}`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${displayName || tableName}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Export CSV ${displayName || tableName} terminé !`);
  } catch (error) {
    toast.error('Erreur lors de l\'export CSV');
    console.error('Export error:', error);
  }
};

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
  const [exporting, setExporting] = useState(false);

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

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API}/export/excel`, {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export_lotissements_${new Date().toISOString().slice(0,10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Export Excel terminé avec succès !');
    } catch (error) {
      toast.error('Erreur lors de l\'export Excel');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
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
        <div className="flex gap-3">
          <Button onClick={fetchDashboardData} variant="outline">
            🔄 Actualiser
          </Button>
          <Button 
            onClick={handleExportExcel} 
            disabled={exporting}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {exporting ? '⏳ Export en cours...' : '📊 Exporter Excel'}
          </Button>
        </div>
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

  // Utiliser la fonction utilitaire

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
        <div className="flex gap-3">
          <Button onClick={() => exportCSV('lotissements')} variant="outline">
            📄 Export CSV
          </Button>
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
        <div className="flex gap-3">
          <Button onClick={() => exportCSV('lots')} variant="outline">
            📄 Export CSV
          </Button>
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
        <div className="flex gap-3">
          <Button onClick={() => exportCSV('clients')} variant="outline">
            📄 Export CSV
          </Button>
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

const VentesPage = () => {
  const [ventes, setVentes] = useState([]);
  const [lots, setLots] = useState([]);
  const [clients, setClients] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newVente, setNewVente] = useState({
    lot_id: '',
    client_id: '',
    prix_vente: '',
    avance_payee: '',
    date_vente: new Date().toISOString().split('T')[0],
    temoin: {
      nom_complet: '',
      telephone: ''
    }
  });

  useEffect(() => {
    fetchVentes();
    fetchLotsDisponibles();
    fetchClients();
  }, []);

  const fetchVentes = async () => {
    try {
      const response = await axios.get(`${API}/ventes-detaillees`);
      setVentes(response.data);
    } catch (error) {
      toast.error('Erreur lors de la récupération des ventes');
    }
  };

  const fetchLotsDisponibles = async () => {
    try {
      const response = await axios.get(`${API}/lots?statut=disponible`);
      setLots(response.data);
    } catch (error) {
      toast.error('Erreur lors de la récupération des lots');
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API}/clients`);
      setClients(response.data);
    } catch (error) {
      toast.error('Erreur lors de la récupération des clients');
    }
  };

  const handleCreateVente = async (e) => {
    e.preventDefault();
    try {
      const venteData = {
        ...newVente,
        prix_vente: parseFloat(newVente.prix_vente),
        avance_payee: parseFloat(newVente.avance_payee)
      };
      await axios.post(`${API}/ventes`, venteData);
      toast.success('Vente enregistrée avec succès');
      setNewVente({
        lot_id: '',
        client_id: '',
        prix_vente: '',
        avance_payee: '',
        date_vente: new Date().toISOString().split('T')[0],
        temoin: { nom_complet: '', telephone: '' }
      });
      setIsDialogOpen(false);
      fetchVentes();
      fetchLotsDisponibles();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement de la vente');
    }
  };

  const selectedLot = lots.find(lot => lot.id === newVente.lot_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Gestion des Ventes</h2>
        <div className="flex gap-3">
          <Button onClick={() => exportCSV('ventes')} variant="outline">
            📄 Export CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                ➕ Nouvelle Vente
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enregistrer une nouvelle vente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateVente} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lot_id">Lot à vendre</Label>
                  <Select value={newVente.lot_id} onValueChange={(value) => setNewVente({...newVente, lot_id: value, prix_vente: lots.find(l => l.id === value)?.prix_total || ''})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un lot" />
                    </SelectTrigger>
                    <SelectContent>
                      {lots.map((lot) => (
                        <SelectItem key={lot.id} value={lot.id}>
                          Lot {lot.numero_lot} - Îlot {lot.numero_ilot} ({lot.superficie_m2}m² - {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(lot.prix_total)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="client_id">Client</Label>
                  <Select value={newVente.client_id} onValueChange={(value) => setNewVente({...newVente, client_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nom_complet} ({client.telephone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedLot && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Prix suggéré:</strong> {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(selectedLot.prix_total)}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="prix_vente">Prix de Vente</Label>
                  <Input
                    id="prix_vente"
                    type="number"
                    step="0.01"
                    value={newVente.prix_vente}
                    onChange={(e) => setNewVente({...newVente, prix_vente: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="avance_payee">Avance Payée</Label>
                  <Input
                    id="avance_payee"
                    type="number"
                    step="0.01"
                    value={newVente.avance_payee}
                    onChange={(e) => setNewVente({...newVente, avance_payee: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date_vente">Date de Vente</Label>
                  <Input
                    id="date_vente"
                    type="date"
                    value={newVente.date_vente}
                    onChange={(e) => setNewVente({...newVente, date_vente: e.target.value})}
                    required
                  />
                </div>
              </div>

              {newVente.prix_vente && newVente.avance_payee && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Reste à payer:</strong> {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(parseFloat(newVente.prix_vente) - parseFloat(newVente.avance_payee))}
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="text-lg font-medium mb-3">Informations du Témoin</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="temoin_nom">Nom du Témoin</Label>
                    <Input
                      id="temoin_nom"
                      value={newVente.temoin.nom_complet}
                      onChange={(e) => setNewVente({...newVente, temoin: {...newVente.temoin, nom_complet: e.target.value}})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="temoin_telephone">Téléphone du Témoin</Label>
                    <Input
                      id="temoin_telephone"
                      value={newVente.temoin.telephone}
                      onChange={(e) => setNewVente({...newVente, temoin: {...newVente.temoin, telephone: e.target.value}})}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Enregistrer la vente
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
                <TableHead>Client</TableHead>
                <TableHead>Prix de Vente</TableHead>
                <TableHead>Avance</TableHead>
                <TableHead>Reste à Payer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ventes.map((vente) => (
                <TableRow key={vente.id}>
                  <TableCell className="font-medium">
                    {vente.lot_info?.[0]?.numero_lot || 'N/A'} - Îlot {vente.lot_info?.[0]?.numero_ilot || 'N/A'}
                  </TableCell>
                  <TableCell>{vente.client_info?.[0]?.nom_complet || 'N/A'}</TableCell>
                  <TableCell>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(vente.prix_vente)}</TableCell>
                  <TableCell>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(vente.avance_payee)}</TableCell>
                  <TableCell className="font-medium text-red-600">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(vente.reste_a_payer)}
                  </TableCell>
                  <TableCell>{new Date(vente.date_vente).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    <Badge variant={vente.statut_paiement === 'complet' ? 'default' : 'destructive'}>
                      {vente.statut_paiement}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {ventes.length === 0 && (
            <div className="flex items-center justify-center h-32">
              <p className="text-slate-500">Aucune vente enregistrée</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const PaiementsPage = () => {
  const [paiements, setPaiements] = useState([]);
  const [ventes, setVentes] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPaiement, setNewPaiement] = useState({
    vente_id: '',
    montant: '',
    date_paiement: new Date().toISOString().split('T')[0],
    type_paiement: 'echeance'
  });

  useEffect(() => {
    fetchPaiements();
    fetchVentesPartielles();
  }, []);

  const fetchPaiements = async () => {
    try {
      const response = await axios.get(`${API}/paiements`);
      setPaiements(response.data);
    } catch (error) {
      toast.error('Erreur lors de la récupération des paiements');
    }
  };

  const fetchVentesPartielles = async () => {
    try {
      const response = await axios.get(`${API}/ventes-detaillees`);
      // Filtrer seulement les ventes avec un reste à payer
      const ventesPartielles = response.data.filter(vente => vente.reste_a_payer > 0);
      setVentes(ventesPartielles);
    } catch (error) {
      toast.error('Erreur lors de la récupération des ventes');
    }
  };

  const handleCreatePaiement = async (e) => {
    e.preventDefault();
    try {
      const paiementData = {
        ...newPaiement,
        montant: parseFloat(newPaiement.montant)
      };
      await axios.post(`${API}/paiements`, paiementData);
      toast.success('Paiement enregistré avec succès');
      setNewPaiement({
        vente_id: '',
        montant: '',
        date_paiement: new Date().toISOString().split('T')[0],
        type_paiement: 'echeance'
      });
      setIsDialogOpen(false);
      fetchPaiements();
      fetchVentesPartielles();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement du paiement');
    }
  };

  const selectedVente = ventes.find(vente => vente.id === newPaiement.vente_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Gestion des Paiements</h2>
        <div className="flex gap-3">
          <Button onClick={() => exportCSV('paiements')} variant="outline">
            📄 Export CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
                ➕ Nouveau Paiement
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer un nouveau paiement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePaiement} className="space-y-4">
              <div>
                <Label htmlFor="vente_id">Vente en cours</Label>
                <Select value={newPaiement.vente_id} onValueChange={(value) => setNewPaiement({...newPaiement, vente_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une vente" />
                  </SelectTrigger>
                  <SelectContent>
                    {ventes.map((vente) => (
                      <SelectItem key={vente.id} value={vente.id}>
                        {vente.client_info?.[0]?.nom_complet} - Lot {vente.lot_info?.[0]?.numero_lot} 
                        (Reste: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(vente.reste_a_payer)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedVente && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="space-y-2 text-sm text-blue-800">
                    <p><strong>Client:</strong> {selectedVente.client_info?.[0]?.nom_complet}</p>
                    <p><strong>Lot:</strong> {selectedVente.lot_info?.[0]?.numero_lot} - Îlot {selectedVente.lot_info?.[0]?.numero_ilot}</p>
                    <p><strong>Prix total:</strong> {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(selectedVente.prix_vente)}</p>
                    <p><strong>Reste à payer:</strong> {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(selectedVente.reste_a_payer)}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="montant">Montant du Paiement</Label>
                  <Input
                    id="montant"
                    type="number"
                    step="0.01"
                    value={newPaiement.montant}
                    onChange={(e) => setNewPaiement({...newPaiement, montant: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date_paiement">Date de Paiement</Label>
                  <Input
                    id="date_paiement"
                    type="date"
                    value={newPaiement.date_paiement}
                    onChange={(e) => setNewPaiement({...newPaiement, date_paiement: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type_paiement">Type de Paiement</Label>
                <Select value={newPaiement.type_paiement} onValueChange={(value) => setNewPaiement({...newPaiement, type_paiement: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="echeance">Échéance</SelectItem>
                    <SelectItem value="solde">Solde</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedVente && newPaiement.montant && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Nouveau reste à payer:</strong> {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(Math.max(0, selectedVente.reste_a_payer - parseFloat(newPaiement.montant)))}
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full">
                Enregistrer le paiement
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
                <TableHead>Vente ID</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date de Paiement</TableHead>
                <TableHead>Date d'Enregistrement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paiements.map((paiement) => (
                <TableRow key={paiement.id}>
                  <TableCell className="font-medium">{paiement.vente_id}</TableCell>
                  <TableCell className="font-medium text-green-600">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(paiement.montant)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={paiement.type_paiement === 'avance' ? 'default' : paiement.type_paiement === 'solde' ? 'destructive' : 'secondary'}>
                      {paiement.type_paiement}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(paiement.date_paiement).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>{new Date(paiement.created_at).toLocaleDateString('fr-FR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {paiements.length === 0 && (
            <div className="flex items-center justify-center h-32">
              <p className="text-slate-500">Aucun paiement enregistré</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section des ventes en attente de paiement */}
      {ventes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">🔔 Ventes en attente de paiement</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Lot</TableHead>
                  <TableHead>Prix Total</TableHead>
                  <TableHead>Reste à Payer</TableHead>
                  <TableHead>Date de Vente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventes.map((vente) => (
                  <TableRow key={vente.id}>
                    <TableCell className="font-medium">{vente.client_info?.[0]?.nom_complet}</TableCell>
                    <TableCell>Lot {vente.lot_info?.[0]?.numero_lot} - Îlot {vente.lot_info?.[0]?.numero_ilot}</TableCell>
                    <TableCell>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(vente.prix_vente)}</TableCell>
                    <TableCell className="font-bold text-red-600">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(vente.reste_a_payer)}
                    </TableCell>
                    <TableCell>{new Date(vente.date_vente).toLocaleDateString('fr-FR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

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