# Conception fonctionnelle et technique — Plateforme foncière ETAMY Construction

## 1. Vision du produit

La plateforme ETAMY Construction est une application web centralisée destinée à gérer tout le cycle de vie des opérations foncières : création des lotissements, découpage en îlots et lots, réservation, vente, encaissement, archivage documentaire, suivi financier, pilotage statistique et contrôle des accès.

Elle doit réduire les risques opérationnels suivants :

- perte ou dispersion des dossiers clients et fonciers ;
- double attribution ou double vente d'un même lot ;
- erreurs de calcul des reliquats et échéances ;
- absence de traçabilité des actions administratives ;
- difficulté de production des rapports commerciaux et financiers.

## 2. Acteurs et rôles

| Profil | Responsabilités principales | Accès recommandé |
| --- | --- | --- |
| Administrateur | Paramétrage, utilisateurs, rôles, sauvegardes, supervision | Accès complet |
| Directeur | Pilotage, rapports, validation commerciale et financière | Lecture globale, validation, exports |
| Commercial | Clients, réservations, suivi des prospects et ventes | Lotissements/lots en lecture, clients/ventes en écriture limitée |
| Caissier | Encaissements, reçus, situation de paiement | Paiements en écriture, ventes en lecture |
| Géomètre | Plans, îlots, lots, coordonnées GPS, superficies | Lotissements/lots/documents techniques |
| Consultation simple | Consultation contrôlée des informations | Lecture seule selon périmètre |

## 3. Modules fonctionnels

### 3.1 Tableau de bord

Indicateurs à afficher en temps réel :

- total des lotissements ;
- total des lots ;
- lots disponibles, réservés, vendus, en litige et suspendus ;
- chiffre d'affaires signé ;
- montant encaissé ;
- reliquat total ;
- clients débiteurs ;
- ventes et encaissements par période ;
- statistiques par lotissement.

### 3.2 Gestion des lotissements

Fonctionnalités :

- créer, modifier, consulter et archiver un lotissement ;
- enregistrer la localisation administrative et GPS ;
- gérer la superficie globale ;
- joindre les plans et documents fonciers ;
- visualiser la synthèse des îlots et lots associés.

Champs principaux :

- code unique ;
- nom ;
- commune/quartier/localisation ;
- latitude et longitude ;
- superficie globale ;
- description ;
- statut administratif ;
- documents associés.

### 3.3 Gestion des îlots

Fonctionnalités :

- créer des îlots rattachés à un lotissement ;
- renseigner numéro, superficie et observation ;
- consulter les lots par îlot ;
- importer des plans liés à l'îlot.

### 3.4 Gestion des lots

Chaque lot est rattaché à un îlot et possède un statut métier contrôlé.

Statuts autorisés :

- `DISPONIBLE` : lot vendable ;
- `RESERVE` : lot verrouillé pendant une période définie ;
- `VENDU` : lot définitivement attribué ;
- `EN_LITIGE` : lot bloqué pour traitement ;
- `SUSPENDU` : lot non commercialisable temporairement.

Champs principaux :

- numéro de lot ;
- îlot ;
- superficie ;
- prix au mètre carré ;
- prix total ;
- statut ;
- coordonnées GPS ;
- images et documents associés.

Règles de gestion :

- un lot `VENDU`, `EN_LITIGE` ou `SUSPENDU` ne peut pas être réservé ou vendu ;
- un lot `RESERVE` est verrouillé jusqu'à expiration, annulation ou transformation en vente ;
- chaque changement de statut doit être historisé ;
- le numéro de lot doit être unique dans un même îlot.

### 3.5 Gestion des clients

Types de clients :

- personne physique ;
- entreprise ou personne morale.

Champs pour personne physique :

- nom ;
- prénoms ;
- téléphone ;
- email ;
- adresse ;
- profession ;
- type et numéro de pièce d'identité ;
- photo ;
- documents associés.

Champs pour personne morale :

- raison sociale ;
- registre de commerce ou identifiant fiscal ;
- représentant légal ;
- téléphone ;
- email ;
- adresse ;
- documents administratifs.

### 3.6 Réservations

Fonctionnalités :

- réserver un lot disponible pour un client ;
- définir une date d'expiration ;
- enregistrer éventuellement des frais de réservation ;
- annuler ou convertir la réservation en vente ;
- notifier les réservations proches de l'expiration.

Règles de gestion :

- une réservation ne peut être créée que sur un lot `DISPONIBLE` ;
- à la création d'une réservation active, le lot passe à `RESERVE` ;
- à l'annulation ou à l'expiration, le lot repasse à `DISPONIBLE` si aucune vente n'existe ;
- la conversion en vente passe le lot à `VENDU`.

### 3.7 Ventes

Fonctionnalités :

- enregistrer une vente à partir d'un lot disponible ou réservé au même client ;
- définir le prix de vente, la remise éventuelle et les frais ;
- générer le contrat ;
- suivre l'historique complet ;
- imprimer les documents commerciaux.

Règles de gestion :

- un lot vendu ne peut plus être attribué ;
- une vente ne peut être validée que si le lot est éligible ;
- la validation d'une vente met automatiquement le lot au statut `VENDU` ;
- toute modification de vente doit être tracée dans le journal d'audit ;
- l'annulation d'une vente doit être réservée à des profils habilités.

### 3.8 Paiements et échéanciers

Modes de paiement :

- espèces ;
- chèque ;
- virement ;
- Mobile Money.

Fonctionnalités :

- enregistrer les avances, échéances et soldes ;
- calculer automatiquement le montant encaissé et le reliquat ;
- générer et imprimer les reçus ;
- produire l'état des clients débiteurs ;
- gérer les échéanciers prévisionnels ;
- suivre les retards de paiement.

Règles de gestion :

- un paiement est toujours rattaché à une vente ;
- le total payé ne doit pas dépasser le prix net de vente, sauf validation spéciale ;
- un reçu unique est généré pour chaque paiement validé ;
- une suppression physique de paiement est interdite : utiliser une annulation tracée.

### 3.9 Gestion documentaire

Documents clients :

- carte nationale d'identité ;
- passeport ;
- contrat signé ;
- reçus ;
- procurations.

Documents fonciers :

- ACD ;
- plan de masse ;
- plan de bornage ;
- arrêté d'approbation ;
- images terrain ;
- rapports techniques.

Formats acceptés : PDF, Word, Excel, JPG et PNG.

Bonnes pratiques :

- stocker les fichiers dans un espace privé, non public par défaut ;
- enregistrer les métadonnées en base de données ;
- générer un nom technique unique pour chaque fichier ;
- contrôler la taille, le type MIME et l'extension ;
- journaliser les consultations et téléchargements sensibles.

## 4. Modèle de données cible PostgreSQL

### 4.1 Tables principales

```text
users
- id
- name
- email
- password_hash
- role_id
- is_active
- last_login_at
- created_at
- updated_at

roles
- id
- code
- name
- description

permissions
- id
- code
- name
- module

role_permission
- role_id
- permission_id

lotissements
- id
- code
- nom
- localisation
- commune
- latitude
- longitude
- superficie_globale
- description
- statut
- created_by
- created_at
- updated_at

ilots
- id
- lotissement_id
- numero
- superficie
- observation
- created_at
- updated_at

lots
- id
- lotissement_id
- ilot_id
- numero
- superficie
- prix_m2
- prix_total
- statut
- latitude
- longitude
- observation
- created_at
- updated_at

clients
- id
- type_client
- nom
- prenoms
- raison_sociale
- telephone
- email
- adresse
- profession
- type_piece
- numero_piece
- representant_legal
- photo_path
- created_at
- updated_at

reservations
- id
- lot_id
- client_id
- date_reservation
- date_expiration
- montant_frais
- statut
- created_by
- created_at
- updated_at

ventes
- id
- lot_id
- client_id
- reservation_id
- reference
- prix_vente
- remise
- frais_annexes
- prix_net
- statut
- date_vente
- created_by
- created_at
- updated_at

paiements
- id
- vente_id
- reference_recu
- montant
- mode_paiement
- type_paiement
- date_paiement
- reference_transaction
- observation
- statut
- created_by
- created_at
- updated_at

echeances
- id
- vente_id
- montant_prevu
- date_echeance
- montant_paye
- statut
- created_at
- updated_at

documents
- id
- owner_type
- owner_id
- categorie
- nom_original
- nom_stockage
- chemin
- mime_type
- taille_octets
- uploaded_by
- created_at

audit_logs
- id
- user_id
- action
- module
- entity_type
- entity_id
- old_values
- new_values
- ip_address
- user_agent
- created_at
```

### 4.2 Contraintes recommandées

- `lotissements.code` unique ;
- `lots(lotissement_id, ilot_id, numero)` unique ;
- `ventes.lot_id` unique pour les ventes actives ;
- `paiements.reference_recu` unique ;
- clés étrangères entre lotissement, îlot, lot, client, vente et paiement ;
- contraintes `CHECK` sur les statuts et modes de paiement ;
- index sur `lots.statut`, `ventes.date_vente`, `paiements.date_paiement` et `clients.telephone`.

## 5. API backend Laravel proposée

Préfixe recommandé : `/api/v1`.

| Domaine | Méthode | Endpoint | Usage |
| --- | --- | --- | --- |
| Auth | POST | `/auth/login` | Connexion |
| Auth | POST | `/auth/logout` | Déconnexion |
| Auth | GET | `/auth/me` | Profil connecté |
| Lotissements | GET | `/lotissements` | Liste paginée |
| Lotissements | POST | `/lotissements` | Création |
| Lotissements | GET | `/lotissements/{id}` | Détail |
| Lotissements | PUT | `/lotissements/{id}` | Modification |
| Îlots | POST | `/lotissements/{id}/ilots` | Création d'îlot |
| Lots | GET | `/lots` | Recherche de lots |
| Lots | POST | `/lots` | Création de lot |
| Lots | PATCH | `/lots/{id}/statut` | Changement de statut contrôlé |
| Clients | GET | `/clients` | Liste/recherche |
| Clients | POST | `/clients` | Création |
| Réservations | POST | `/reservations` | Réserver un lot |
| Réservations | POST | `/reservations/{id}/annuler` | Annuler une réservation |
| Ventes | POST | `/ventes` | Enregistrer une vente |
| Ventes | GET | `/ventes/{id}` | Dossier de vente |
| Paiements | POST | `/paiements` | Encaisser un paiement |
| Paiements | GET | `/ventes/{id}/paiements` | Paiements d'une vente |
| Documents | POST | `/documents` | Téléverser un document |
| Documents | GET | `/documents/{id}/download` | Télécharger |
| Rapports | GET | `/rapports/dashboard` | Statistiques globales |
| Rapports | GET | `/rapports/clients-debiteurs` | Liste des débiteurs |

## 6. Architecture technique recommandée

```text
Navigateur web/mobile
        |
        v
React.js + Tailwind CSS
        |
        v
API REST Laravel
        |
        +--> PostgreSQL : données métier
        |
        +--> Stockage privé : documents numériques
        |
        +--> File/Queue Laravel : génération de documents, notifications, exports
        |
        +--> Scheduler Laravel : sauvegardes, expiration réservations, relances
```

### 6.1 Frontend React

Pages recommandées :

- connexion ;
- tableau de bord ;
- liste et fiche lotissement ;
- carte/liste des lots ;
- clients ;
- réservations ;
- ventes ;
- paiements ;
- documents ;
- rapports ;
- administration utilisateurs et rôles.

Composants réutilisables :

- tableau paginé et filtrable ;
- formulaire de recherche ;
- badge de statut de lot ;
- upload de documents ;
- modal de confirmation ;
- carte statistique ;
- générateur de reçu/contrat imprimable.

### 6.2 Backend Laravel

Éléments recommandés :

- Laravel Sanctum pour l'authentification API ;
- Policies/Gates pour les autorisations ;
- Form Requests pour valider les entrées ;
- Eloquent Models et migrations PostgreSQL ;
- Observers ou Events pour l'audit ;
- Jobs/Queues pour les exports et documents ;
- Scheduler pour les tâches automatiques.

### 6.3 Sécurité

Mesures minimales :

- HTTPS obligatoire en production ;
- mots de passe hachés avec l'algorithme Laravel par défaut ;
- expiration des sessions/tokens ;
- protection CSRF si cookies de session ;
- limitation des tentatives de connexion ;
- contrôle strict des rôles et permissions ;
- validation serveur de toutes les données ;
- stockage privé des fichiers ;
- sauvegardes automatiques chiffrées ;
- journal d'audit non modifiable par les utilisateurs standards.

## 7. Workflows métier clés

### 7.1 Réservation d'un lot

1. Le commercial recherche un lot.
2. Le système vérifie que le statut est `DISPONIBLE`.
3. Le commercial sélectionne ou crée le client.
4. Le système crée la réservation.
5. Le lot passe à `RESERVE`.
6. L'opération est inscrite dans `audit_logs`.

### 7.2 Transformation d'une réservation en vente

1. Le commercial ouvre la réservation active.
2. Le système vérifie que le lot est encore réservé pour ce client.
3. Le prix net, les frais et les conditions sont confirmés.
4. La vente est créée.
5. Le lot passe à `VENDU`.
6. Le contrat est généré.
7. L'opération est historisée.

### 7.3 Encaissement d'un paiement

1. Le caissier ouvre la vente.
2. Le système affiche prix net, total payé et reliquat.
3. Le caissier saisit montant, mode et référence.
4. Le système vérifie que le paiement ne dépasse pas le reliquat.
5. Le paiement est validé.
6. Le reçu est généré.
7. Le solde et les échéances sont recalculés.

## 8. Génération documentaire

Documents générés automatiquement :

- reçu de paiement ;
- fiche client ;
- fiche lot ;
- contrat de réservation ;
- contrat de vente ;
- état des paiements ;
- rapport des clients débiteurs.

Approche recommandée :

- modèles HTML/Blade versionnés ;
- génération PDF côté backend ;
- numérotation automatique des contrats et reçus ;
- archivage du PDF généré dans le dossier numérique de la vente.

## 9. Plan de réalisation à partir de zéro

### Phase 1 — Cadrage et maquettes

Livrables :

- validation des rôles ;
- validation du modèle de données ;
- maquettes des écrans principaux ;
- règles de gestion finales ;
- stratégie de migration des données existantes.

### Phase 2 — Socle technique

Livrables :

- projet Laravel configuré avec PostgreSQL ;
- projet React configuré ;
- authentification ;
- rôles et permissions ;
- structure de stockage documentaire ;
- journal d'audit.

### Phase 3 — Modules fonciers

Livrables :

- lotissements ;
- îlots ;
- lots ;
- statuts ;
- import/export de lots ;
- pièces foncières.

### Phase 4 — Clients, réservations et ventes

Livrables :

- fichier clients ;
- réservation avec verrouillage ;
- vente avec prévention double attribution ;
- génération des contrats ;
- historique des opérations.

### Phase 5 — Paiements et rapports

Livrables :

- paiements ;
- échéanciers ;
- reçus ;
- clients débiteurs ;
- tableau de bord ;
- exports Excel/PDF.

### Phase 6 — Stabilisation et déploiement

Livrables :

- tests fonctionnels ;
- tests de sécurité ;
- sauvegardes automatiques ;
- documentation utilisateur ;
- formation ;
- mise en production.

## 10. Critères d'acceptation prioritaires

Le système est acceptable si :

- un lot vendu ne peut pas être revendu ;
- une réservation verrouille réellement le lot ;
- les paiements recalculent automatiquement le reliquat ;
- les documents peuvent être déposés et retrouvés par client, lotissement, lot ou vente ;
- les profils n'accèdent qu'aux fonctionnalités autorisées ;
- les actions sensibles sont historisées ;
- le tableau de bord affiche des chiffres cohérents avec les données ;
- les sauvegardes peuvent être restaurées lors d'un test.

## 11. Backlog initial conseillé

| Priorité | Fonctionnalité | Résultat attendu |
| --- | --- | --- |
| P0 | Authentification et rôles | Connexion sécurisée et permissions de base |
| P0 | Lotissements/îlots/lots | Référentiel foncier opérationnel |
| P0 | Statuts de lots | Prévention des doubles ventes |
| P0 | Clients | Dossiers clients centralisés |
| P0 | Ventes | Attribution contrôlée des lots |
| P0 | Paiements | Suivi des encaissements et reliquats |
| P1 | Documents | Archivage numérique structuré |
| P1 | Rapports | Pilotage commercial et financier |
| P1 | Exports | Excel/PDF pour la direction |
| P2 | Notifications | Alertes échéances et réservations expirées |
| P2 | Cartographie | Visualisation GPS des lots |
