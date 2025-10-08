from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date
from decimal import Decimal
import shutil
import pandas as pd
import openpyxl
from io import BytesIO
import csv


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Create uploads directory
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

# Helper functions for MongoDB serialization
def prepare_for_mongo(data):
    """Convert Python objects to MongoDB-compatible format"""
    if isinstance(data, dict):
        result = {}
        for key, value in data.items():
            if isinstance(value, date):
                result[key] = value.isoformat()
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, Decimal):
                result[key] = float(value)
            elif isinstance(value, dict):
                result[key] = prepare_for_mongo(value)
            elif isinstance(value, list):
                result[key] = [prepare_for_mongo(item) if isinstance(item, dict) else item for item in value]
            else:
                result[key] = value
        return result
    return data

def parse_from_mongo(item):
    """Convert MongoDB data back to proper Python types"""
    if isinstance(item, dict):
        result = {}
        for key, value in item.items():
            if key.endswith('_date') and isinstance(value, str):
                try:
                    result[key] = datetime.fromisoformat(value).date()
                except:
                    result[key] = value
            elif key == 'created_at' and isinstance(value, str):
                try:
                    result[key] = datetime.fromisoformat(value)
                except:
                    result[key] = value
            elif isinstance(value, dict):
                result[key] = parse_from_mongo(value)
            elif isinstance(value, list):
                result[key] = [parse_from_mongo(item) if isinstance(item, dict) else item for item in value]
            else:
                result[key] = value
        return result
    return item

# Pydantic Models
class Lotissement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nom: str
    localisation: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LotissementCreate(BaseModel):
    nom: str
    localisation: str
    description: Optional[str] = None

class Lot(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lotissement_id: str
    numero_lot: str
    numero_ilot: str
    superficie_m2: float
    prix_m2: float
    prix_total: float
    statut: str = "disponible"  # disponible, vendu, reservé
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LotCreate(BaseModel):
    lotissement_id: str
    numero_lot: str
    numero_ilot: str
    superficie_m2: float
    prix_m2: float

class Client(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nom_complet: str
    date_naissance: date
    lieu_naissance: str
    numero_cni: str
    telephone: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientCreate(BaseModel):
    nom_complet: str
    date_naissance: date
    lieu_naissance: str
    numero_cni: str
    telephone: str

class Temoin(BaseModel):
    nom_complet: str
    telephone: str

class Vente(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lot_id: str
    client_id: str
    prix_vente: float
    avance_payee: float
    reste_a_payer: float
    date_vente: date
    temoin: Temoin
    statut_paiement: str = "partiel"  # complet, partiel
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VenteCreate(BaseModel):
    lot_id: str
    client_id: str
    prix_vente: float
    avance_payee: float
    date_vente: date
    temoin: Temoin

class Paiement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vente_id: str
    montant: float
    date_paiement: date
    type_paiement: str = "echeance"  # avance, echeance, solde
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaiementCreate(BaseModel):
    vente_id: str
    montant: float
    date_paiement: date
    type_paiement: str = "echeance"

# Routes pour les Lotissements
@api_router.post("/lotissements", response_model=Lotissement)
async def create_lotissement(lotissement: LotissementCreate):
    lotissement_obj = Lotissement(**lotissement.model_dump())
    doc = prepare_for_mongo(lotissement_obj.model_dump())
    await db.lotissements.insert_one(doc)
    return lotissement_obj

@api_router.get("/lotissements", response_model=List[Lotissement])
async def get_lotissements():
    lotissements = await db.lotissements.find({}, {"_id": 0}).to_list(1000)
    return [Lotissement(**parse_from_mongo(lot)) for lot in lotissements]

@api_router.get("/lotissements/{lotissement_id}", response_model=Lotissement)
async def get_lotissement(lotissement_id: str):
    lotissement = await db.lotissements.find_one({"id": lotissement_id}, {"_id": 0})
    if not lotissement:
        raise HTTPException(status_code=404, detail="Lotissement non trouvé")
    return Lotissement(**parse_from_mongo(lotissement))

# Routes pour les Lots
@api_router.post("/lots", response_model=Lot)
async def create_lot(lot: LotCreate):
    # Calculer le prix total
    prix_total = lot.superficie_m2 * lot.prix_m2
    lot_obj = Lot(**lot.model_dump(), prix_total=prix_total)
    doc = prepare_for_mongo(lot_obj.model_dump())
    await db.lots.insert_one(doc)
    return lot_obj

@api_router.get("/lots", response_model=List[Lot])
async def get_lots(lotissement_id: Optional[str] = None, statut: Optional[str] = None):
    filter_query = {}
    if lotissement_id:
        filter_query["lotissement_id"] = lotissement_id
    if statut:
        filter_query["statut"] = statut
    
    lots = await db.lots.find(filter_query, {"_id": 0}).to_list(1000)
    return [Lot(**parse_from_mongo(lot)) for lot in lots]

@api_router.get("/lots/{lot_id}", response_model=Lot)
async def get_lot(lot_id: str):
    lot = await db.lots.find_one({"id": lot_id}, {"_id": 0})
    if not lot:
        raise HTTPException(status_code=404, detail="Lot non trouvé")
    return Lot(**parse_from_mongo(lot))

# Routes pour les Clients
@api_router.post("/clients", response_model=Client)
async def create_client(client: ClientCreate):
    client_obj = Client(**client.model_dump())
    doc = prepare_for_mongo(client_obj.model_dump())
    await db.clients.insert_one(doc)
    return client_obj

@api_router.get("/clients", response_model=List[Client])
async def get_clients():
    clients = await db.clients.find({}, {"_id": 0}).to_list(1000)
    return [Client(**parse_from_mongo(client)) for client in clients]

@api_router.get("/clients/{client_id}", response_model=Client)
async def get_client(client_id: str):
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    return Client(**parse_from_mongo(client))

# Routes pour les Ventes
@api_router.post("/ventes", response_model=Vente)
async def create_vente(vente: VenteCreate):
    # Vérifier que le lot existe et est disponible
    lot = await db.lots.find_one({"id": vente.lot_id})
    if not lot or lot["statut"] != "disponible":
        raise HTTPException(status_code=400, detail="Lot non disponible")
    
    # Calculer le reste à payer
    reste_a_payer = vente.prix_vente - vente.avance_payee
    statut_paiement = "complet" if reste_a_payer <= 0 else "partiel"
    
    vente_obj = Vente(**vente.model_dump(), reste_a_payer=reste_a_payer, statut_paiement=statut_paiement)
    doc = prepare_for_mongo(vente_obj.model_dump())
    await db.ventes.insert_one(doc)
    
    # Marquer le lot comme vendu
    await db.lots.update_one({"id": vente.lot_id}, {"$set": {"statut": "vendu"}})
    
    # Créer le paiement d'avance
    if vente.avance_payee > 0:
        paiement_avance = Paiement(
            vente_id=vente_obj.id,
            montant=vente.avance_payee,
            date_paiement=vente.date_vente,
            type_paiement="avance"
        )
        paiement_doc = prepare_for_mongo(paiement_avance.model_dump())
        await db.paiements.insert_one(paiement_doc)
    
    return vente_obj

@api_router.get("/ventes", response_model=List[Vente])
async def get_ventes():
    ventes = await db.ventes.find({}, {"_id": 0}).to_list(1000)
    return [Vente(**parse_from_mongo(vente)) for vente in ventes]

@api_router.get("/ventes/{vente_id}", response_model=Vente)
async def get_vente(vente_id: str):
    vente = await db.ventes.find_one({"id": vente_id}, {"_id": 0})
    if not vente:
        raise HTTPException(status_code=404, detail="Vente non trouvée")
    return Vente(**parse_from_mongo(vente))

# Routes pour les Paiements
@api_router.post("/paiements", response_model=Paiement)
async def create_paiement(paiement: PaiementCreate):
    # Vérifier que la vente existe
    vente = await db.ventes.find_one({"id": paiement.vente_id})
    if not vente:
        raise HTTPException(status_code=404, detail="Vente non trouvée")
    
    paiement_obj = Paiement(**paiement.model_dump())
    doc = prepare_for_mongo(paiement_obj.model_dump())
    await db.paiements.insert_one(doc)
    
    # Mettre à jour le reste à payer de la vente
    nouveau_reste = vente["reste_a_payer"] - paiement.montant
    statut_paiement = "complet" if nouveau_reste <= 0 else "partiel"
    
    await db.ventes.update_one(
        {"id": paiement.vente_id},
        {"$set": {"reste_a_payer": max(0, nouveau_reste), "statut_paiement": statut_paiement}}
    )
    
    return paiement_obj

@api_router.get("/paiements", response_model=List[Paiement])
async def get_paiements(vente_id: Optional[str] = None):
    filter_query = {}
    if vente_id:
        filter_query["vente_id"] = vente_id
    
    paiements = await db.paiements.find(filter_query, {"_id": 0}).to_list(1000)
    return [Paiement(**parse_from_mongo(paiement)) for paiement in paiements]

# Routes pour les rapports
@api_router.get("/rapports/dashboard")
async def get_dashboard_data():
    # Statistiques générales
    total_lotissements = await db.lotissements.count_documents({})
    total_lots = await db.lots.count_documents({})
    lots_disponibles = await db.lots.count_documents({"statut": "disponible"})
    lots_vendus = await db.lots.count_documents({"statut": "vendu"})
    total_clients = await db.clients.count_documents({})
    total_ventes = await db.ventes.count_documents({})
    
    # Chiffre d'affaires et montant encaissé total
    ventes_pipeline = [
        {"$group": {"_id": None, "total_ca": {"$sum": "$prix_vente"}}}
    ]
    ca_result = await db.ventes.aggregate(ventes_pipeline).to_list(1)
    total_ca = ca_result[0]["total_ca"] if ca_result else 0
    
    # Calculer le montant total encaissé à partir de tous les paiements
    paiements_pipeline = [
        {"$group": {"_id": None, "total_encaisse": {"$sum": "$montant"}}}
    ]
    paiements_result = await db.paiements.aggregate(paiements_pipeline).to_list(1)
    total_encaisse = paiements_result[0]["total_encaisse"] if paiements_result else 0
    
    ca_data = {"total_ca": total_ca, "total_encaisse": total_encaisse}
    
    # Paiements en attente
    ventes_partielles = await db.ventes.count_documents({"statut_paiement": "partiel"})
    
    return {
        "statistiques": {
            "total_lotissements": total_lotissements,
            "total_lots": total_lots,
            "lots_disponibles": lots_disponibles,
            "lots_vendus": lots_vendus,
            "total_clients": total_clients,
            "total_ventes": total_ventes,
            "ventes_partielles": ventes_partielles
        },
        "finances": {
            "chiffre_affaires_total": ca_data["total_ca"],
            "montant_encaisse": ca_data["total_encaisse"],
            "reste_a_encaisser": ca_data["total_ca"] - ca_data["total_encaisse"]
        }
    }

# Routes détaillées avec jointures côté application
@api_router.get("/ventes-detaillees")
async def get_ventes_detaillees():
    # Récupérer les ventes
    ventes = await db.ventes.find({}, {"_id": 0}).to_list(1000)
    
    # Récupérer tous les lots, clients et lotissements
    lots = await db.lots.find({}, {"_id": 0}).to_list(1000)
    clients = await db.clients.find({}, {"_id": 0}).to_list(1000)
    lotissements = await db.lotissements.find({}, {"_id": 0}).to_list(1000)
    
    # Créer des dictionnaires pour un accès rapide
    lots_dict = {lot["id"]: lot for lot in lots}
    clients_dict = {client["id"]: client for client in clients}
    lotissements_dict = {lotissement["id"]: lotissement for lotissement in lotissements}
    
    # Enrichir chaque vente avec les informations liées
    ventes_enrichies = []
    for vente in ventes:
        vente_parsed = parse_from_mongo(vente)
        
        # Ajouter les infos du lot
        if vente["lot_id"] in lots_dict:
            lot_info = lots_dict[vente["lot_id"]]
            vente_parsed["lot_info"] = [parse_from_mongo(lot_info)]
            
            # Ajouter les infos du lotissement
            if lot_info["lotissement_id"] in lotissements_dict:
                lotissement_info = lotissements_dict[lot_info["lotissement_id"]]
                vente_parsed["lotissement_info"] = [parse_from_mongo(lotissement_info)]
        
        # Ajouter les infos du client
        if vente["client_id"] in clients_dict:
            client_info = clients_dict[vente["client_id"]]
            vente_parsed["client_info"] = [parse_from_mongo(client_info)]
        
        ventes_enrichies.append(vente_parsed)
    
    return ventes_enrichies

# Routes d'export
@api_router.get("/export/excel")
async def export_excel():
    """Exporte toutes les données vers un fichier Excel multi-feuilles"""
    try:
        # Créer un fichier Excel avec plusieurs feuilles
        output = BytesIO()
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            # Export des lotissements
            lotissements = await db.lotissements.find({}, {"_id": 0}).to_list(1000)
            if lotissements:
                lotissements_processed = []
                for lot in lotissements:
                    lot_processed = parse_from_mongo(lot)
                    # Convertir datetime en string pour Excel
                    if 'created_at' in lot_processed:
                        lot_processed['created_at'] = lot_processed['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                    lotissements_processed.append(lot_processed)
                df_lotissements = pd.DataFrame(lotissements_processed)
                df_lotissements.to_excel(writer, sheet_name='Lotissements', index=False)
            
            # Export des lots
            lots = await db.lots.find({}, {"_id": 0}).to_list(1000)
            if lots:
                lots_processed = []
                for lot in lots:
                    lot_processed = parse_from_mongo(lot)
                    if 'created_at' in lot_processed:
                        lot_processed['created_at'] = lot_processed['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                    lots_processed.append(lot_processed)
                df_lots = pd.DataFrame(lots_processed)
                df_lots.to_excel(writer, sheet_name='Lots', index=False)
            
            # Export des clients
            clients = await db.clients.find({}, {"_id": 0}).to_list(1000)
            if clients:
                clients_processed = []
                for client in clients:
                    client_processed = parse_from_mongo(client)
                    if 'created_at' in client_processed:
                        client_processed['created_at'] = client_processed['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                    if 'date_naissance' in client_processed and isinstance(client_processed['date_naissance'], date):
                        client_processed['date_naissance'] = client_processed['date_naissance'].strftime('%Y-%m-%d')
                    clients_processed.append(client_processed)
                df_clients = pd.DataFrame(clients_processed)
                df_clients.to_excel(writer, sheet_name='Clients', index=False)
            
            # Export des ventes
            ventes = await db.ventes.find({}, {"_id": 0}).to_list(1000)
            if ventes:
                ventes_processed = []
                for vente in ventes:
                    vente_processed = parse_from_mongo(vente)
                    if 'created_at' in vente_processed:
                        vente_processed['created_at'] = vente_processed['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                    if 'date_vente' in vente_processed and isinstance(vente_processed['date_vente'], date):
                        vente_processed['date_vente'] = vente_processed['date_vente'].strftime('%Y-%m-%d')
                    # Aplatir l'objet témoin
                    if 'temoin' in vente_processed:
                        vente_processed['temoin_nom'] = vente_processed['temoin']['nom_complet']
                        vente_processed['temoin_telephone'] = vente_processed['temoin']['telephone']
                        del vente_processed['temoin']
                    ventes_processed.append(vente_processed)
                df_ventes = pd.DataFrame(ventes_processed)
                df_ventes.to_excel(writer, sheet_name='Ventes', index=False)
            
            # Export des paiements
            paiements = await db.paiements.find({}, {"_id": 0}).to_list(1000)
            if paiements:
                paiements_processed = []
                for paiement in paiements:
                    paiement_processed = parse_from_mongo(paiement)
                    if 'created_at' in paiement_processed:
                        paiement_processed['created_at'] = paiement_processed['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                    if 'date_paiement' in paiement_processed and isinstance(paiement_processed['date_paiement'], date):
                        paiement_processed['date_paiement'] = paiement_processed['date_paiement'].strftime('%Y-%m-%d')
                    paiements_processed.append(paiement_processed)
                df_paiements = pd.DataFrame(paiements_processed)
                df_paiements.to_excel(writer, sheet_name='Paiements', index=False)
            
            # Export des ventes détaillées (avec jointures)
            ventes_detaillees = await get_ventes_detaillees()
            if ventes_detaillees:
                ventes_det_processed = []
                for vente in ventes_detaillees:
                    vente_flat = {
                        'vente_id': vente['id'],
                        'prix_vente': vente['prix_vente'],
                        'avance_payee': vente['avance_payee'],
                        'reste_a_payer': vente['reste_a_payer'],
                        'date_vente': vente['date_vente'],
                        'statut_paiement': vente['statut_paiement'],
                        'temoin_nom': vente['temoin']['nom_complet'],
                        'temoin_telephone': vente['temoin']['telephone'],
                        # Infos client
                        'client_nom': vente.get('client_info', [{}])[0].get('nom_complet', ''),
                        'client_telephone': vente.get('client_info', [{}])[0].get('telephone', ''),
                        'client_cni': vente.get('client_info', [{}])[0].get('numero_cni', ''),
                        # Infos lot
                        'lot_numero': vente.get('lot_info', [{}])[0].get('numero_lot', ''),
                        'lot_ilot': vente.get('lot_info', [{}])[0].get('numero_ilot', ''),
                        'lot_superficie': vente.get('lot_info', [{}])[0].get('superficie_m2', ''),
                        # Infos lotissement
                        'lotissement_nom': vente.get('lotissement_info', [{}])[0].get('nom', ''),
                        'lotissement_localisation': vente.get('lotissement_info', [{}])[0].get('localisation', '')
                    }
                    ventes_det_processed.append(vente_flat)
                df_ventes_det = pd.DataFrame(ventes_det_processed)
                df_ventes_det.to_excel(writer, sheet_name='Ventes_Detaillees', index=False)\n        \n        output.seek(0)\n        \n        # Sauvegarder le fichier\n        filename = f\"export_lotissements_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx\"\n        filepath = uploads_dir / filename\n        \n        with open(filepath, 'wb') as f:\n            f.write(output.getvalue())\n        \n        return FileResponse(\n            path=filepath,\n            filename=filename,\n            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'\n        )\n    \n    except Exception as e:\n        logger.error(f\"Erreur lors de l'export Excel: {e}\")\n        raise HTTPException(status_code=500, detail=f\"Erreur lors de l'export: {str(e)}\")\n\n@api_router.get(\"/export/csv/{table_name}\")\nasync def export_csv(table_name: str):\n    \"\"\"Exporte une table spécifique vers un fichier CSV\"\"\"\n    try:\n        valid_tables = ['lotissements', 'lots', 'clients', 'ventes', 'paiements']\n        if table_name not in valid_tables:\n            raise HTTPException(status_code=400, detail=f\"Table non valide. Tables disponibles: {valid_tables}\")\n        \n        # Récupérer les données selon la table\n        collection = db[table_name]\n        data = await collection.find({}, {\"_id\": 0}).to_list(1000)\n        \n        if not data:\n            raise HTTPException(status_code=404, detail=\"Aucune donnée trouvée\")\n        \n        # Traiter les données\n        processed_data = []\n        for item in data:\n            item_processed = parse_from_mongo(item)\n            # Convertir les dates et datetime en string\n            for key, value in item_processed.items():\n                if isinstance(value, datetime):\n                    item_processed[key] = value.strftime('%Y-%m-%d %H:%M:%S')\n                elif isinstance(value, date):\n                    item_processed[key] = value.strftime('%Y-%m-%d')\n                elif isinstance(value, dict):  # Pour l'objet témoin dans les ventes\n                    for sub_key, sub_value in value.items():\n                        item_processed[f\"{key}_{sub_key}\"] = sub_value\n                    del item_processed[key]\n            processed_data.append(item_processed)\n        \n        # Créer le CSV\n        filename = f\"export_{table_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv\"\n        filepath = uploads_dir / filename\n        \n        df = pd.DataFrame(processed_data)\n        df.to_csv(filepath, index=False, encoding='utf-8-sig')  # utf-8-sig pour Excel\n        \n        return FileResponse(\n            path=filepath,\n            filename=filename,\n            media_type='text/csv'\n        )\n    \n    except Exception as e:\n        logger.error(f\"Erreur lors de l'export CSV: {e}\")\n        raise HTTPException(status_code=500, detail=f\"Erreur lors de l'export: {str(e)}\")\n\n# Route de base\n@api_router.get(\"/\")\nasync def root():\n    return {\"message\": \"API de Gestion de Lotissements BTP\"}"

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()