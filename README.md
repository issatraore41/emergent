# Plateforme foncière ETAMY Construction

Ce dépôt contient les éléments de base pour concevoir et développer une plateforme web centralisée de gestion des activités foncières d'ETAMY Construction.

## Besoin couvert

La solution cible doit permettre de gérer :

- les lotissements, îlots et lots ;
- les clients physiques et moraux ;
- les réservations, ventes, paiements et échéanciers ;
- l'archivage numérique des documents clients et fonciers ;
- les tableaux de bord, statistiques et rapports ;
- les utilisateurs, rôles, permissions et journaux d'audit.

## Document de conception

Le document de conception complet se trouve dans [`docs/CONCEPTION_ETAMY.md`](docs/CONCEPTION_ETAMY.md). Il décrit :

- les acteurs et profils utilisateurs ;
- les modules fonctionnels ;
- les règles de gestion contre les doubles ventes ;
- le modèle de données PostgreSQL cible ;
- les endpoints API Laravel recommandés ;
- l'architecture React/Laravel/PostgreSQL ;
- le plan de réalisation par phases.

## Structure actuelle du dépôt

```text
backend/   API existante de démonstration
frontend/  Interface web React existante
docs/     Documentation de conception
```

> Remarque : le besoin cible recommande React.js, Laravel et PostgreSQL. Le document de conception sert de référence pour aligner progressivement l'application existante ou repartir sur un socle technique conforme.
