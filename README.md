# PulseML - Analyse Interactive des Données Médicales

PulseML est une plateforme web interactive dédiée à l'analyse et la visualisation des données de l'étude Framingham sur les maladies cardiovasculaires. Cette application permet aux utilisateurs d'explorer et de comprendre les facteurs de risque cardiovasculaires à travers des visualisations dynamiques et des analyses statistiques.

## 📊 Caractéristiques Principales

- **Dashboard Interactif** : Visualisations dynamiques des données de santé
- **Analyses Multidimensionnelles** :
  - Distribution des âges
  - Taux de cholestérol par groupe d'âge
  - Répartition par genre
  - Analyse des habitudes tabagiques ...
- **Interface Intuitive** : Navigation fluide et responsive
- **Visualisations Avancées** : Graphiques interactifs basés sur Chart.js

## 🛠️ Technologies Utilisées

### Backend
- Python 3.9+
- FastAPI
- Pandas pour l'analyse de données

### Frontend
- HTML5 / CSS3
- JavaScript ES6+
- Chart.js pour les visualisations
- Bootstrap 5 pour l'interface utilisateur

## ⚡️ Installation Rapide

1. Cloner le repository :
```bash
git clone https://github.com/KoolixNour/PulseML.git
cd PulseML
```

2. Créer et activer l'environnement virtuel :
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

3. Installer les dépendances :
```bash
pip install -r requirements.txt
```

4. Lancer l'application :
```bash
uvicorn main:app --reload
```

L'application sera accessible à : `http://localhost:8000`

## 📁 Structure du Projet

```
PulseML/
├── backend/
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   ├── templates/
│   │   ├── index.html
│   │   ├── dashboard.html
│   │   └── chapitre1.html
│   └── main.py
├── database/
│   └── framingham_cleaned.csv
└── requirements.txt
```

## 🔍 Fonctionnalités Détaillées

### 1. Visualisations Interactives
- Histogramme de distribution des âges
- Graphique en aires du taux de cholestérol
- Diagramme circulaire de la répartition par genre
- Analyse détaillée des habitudes tabagiques

### 2. Analyses Statistiques
- Corrélations entre facteurs de risque
- Tendances par groupe d'âge
- Statistiques descriptives

### 3. Interface Utilisateur
- Navigation intuitive
- Design responsive
- Filtres dynamiques

## 💻 Guide d'Utilisation

### Dashboard
1. Accédez à la page d'accueil
2. Naviguez entre les différentes sections via le menu latéral
3. Interagissez avec les graphiques pour plus de détails
4. Utilisez les filtres pour affiner les données

### API Endpoints
```
GET /                   # Page d'accueil
GET /dashboard          # Dashboard principal
GET /chapitre1         # Analyses détaillées
GET /framingham-data   # Données brutes (JSON)
```

## 📝 Licence

Ce projet est sous licence MIT.

## 👥 Équipe

- **CHAMI Nour**
- **ALAOUI Dounya**
- **BOUIKIOUCH Meryem**

