# PulseML 

[![GitHub release (latest by date)](https://img.shields.io/badge/release-v0.1-blue)](https://github.com/KoolixNour/PulseML/releases/latest)
[![GitHub tag](https://img.shields.io/badge/tag-v0.1-blue)](https://github.com/KoolixNour/PulseML/tags)
![Status](https://img.shields.io/badge/Status-In%20Development-orange)
![Python](https://img.shields.io/badge/python-3.10-blue.svg)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-005571?logo=fastapi)](https://fastapi.tiangolo.com)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4.0-FF6384?logo=chart.js&logoColor=white)](https://www.chartjs.org)
[![Tests](https://github.com/KoolixNour/PulseML/actions/workflows/tests.yml/badge.svg)](https://github.com/KoolixNour/PulseML/actions)
[![License](https://img.shields.io/badge/license-Apache_2.0-green)](https://github.com/KoolixNour/PulseML/blob/main/LICENSE)


PulseML est une plateforme web interactive dédiée à l'analyse et la visualisation des données de l'étude Framingham sur les maladies cardiovasculaires. Cette application permet aux utilisateurs d'explorer et de comprendre les facteurs de risque cardiovasculaires à travers des visualisations dynamiques, des analyses statistiques et des prédictions basées sur le machine learning.

## 📊 Caractéristiques Principales

- **Dashboard Interactif** : Visualisations dynamiques des données de santé
- **Analyses Multidimensionnelles** :
  - Distribution des âges
  - Taux de cholestérol par groupe d'âge
  - Répartition par genre
  - Analyse des habitudes tabagiques ...
- **Prédiction des Maladies Cardiovasculaires** : Modèle de machine learning pour prédire le risque de maladie cardiaque dans les 10 ans
- **Interface Intuitive** : Navigation fluide et responsive
- **Visualisations Avancées** : Graphiques interactifs basés sur Chart.js

## 🛠️ Technologies Utilisées

### Backend
- Python 3.9+
- FastAPI
- Pandas pour l'analyse de données
- Scikit-learn pour le machine learning

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
├── models/
│   └── heart_disease_model.pkl 
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

### 3. Prédiction des Maladies Cardiovasculaires
- Modèle de Machine Learning : Utilisation d'un modèle entraîné pour prédire le risque de maladie cardiaque dans les 10 ans
- Entrée Utilisateur : Les utilisateurs peuvent saisir leurs données médicales pour obtenir une prédiction personnalisée
- Résultats : Affichage du risque de maladie cardiaque
  
### 4. Interface Utilisateur
- Navigation intuitive
- Design responsive
- Filtres dynamiques


## 💻 Guide d'Utilisation

### Dashboard
1. Accédez à la page d'accueil
2. Naviguez entre les différentes sections via le menu latéral
3. Interagissez avec les graphiques pour plus de détails
4. Utilisez les filtres pour affiner les données

### Prédiction des Maladies Cardiovasculaires
1. Accédez à la section "Application" depuis le menu
2. Saisissez vos données médicales dans le formulaire
3. Cliquez sur "Prédire" pour obtenir le risque de maladie cardiaque dans les 10 ans


### API Endpoints
```
GET /                   # Page d'accueil
GET /dashboard          # Dashboard principal
GET /chapitre1         # Analyses détaillées
GET /framingham-data   # Données brutes (JSON)
POST /predict          # Prédiction des maladies cardiovasculaires
```

## Machine Learning - Prédiction des Maladies Cardiovasculaires
### Modèle de Prédiction
Le modèle de machine learning utilisé pour prédire le risque de maladie cardiaque dans les 10 ans est basé sur l'algorithme de forêts aléatoires. Ce modèle a été entraîné sur les données de l'étude Framingham, en utilisant des caractéristiques telles que l'âge, le sexe, le taux de cholestérol, la pression artérielle, le tabagisme, etc.

### Fonctionnement du Modèle
1. Entraînement : Le modèle est entraîné sur un ensemble de données historiques pour apprendre les patterns associés aux maladies cardiovasculaires.
2. Prédiction : Une fois entraîné, le modèle peut prédire le risque de maladie cardiaque pour un nouvel individu en fonction de ses caractéristiques médicales.
3. Évaluation : Le modèle est évalué en utilisant des métriques telles que l'accuracy, la précision, le rappel et l'AUC-ROC pour s'assurer de sa fiabilité.

### Utilisation dans l'Application
- Les utilisateurs peuvent saisir leurs données médicales via un formulaire interactif.
- Le modèle traite ces données en temps réel et retourne une prédiction du risque de maladie cardiaque dans les 10 ans.

### Améliorations Futures
- Intégration de modèles plus avancés comme les réseaux de neurones.


## 📝 Licence

Ce projet est sous licence MIT.

## 👥 Équipe

- **CHAMI Nour**
- **ALAOUI Dounya**
- **BOUIKIOUCH Meryem**

