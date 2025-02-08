from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import pandas as pd
from io import BytesIO
from fastapi.responses import StreamingResponse
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
import pickle
from pydantic import BaseModel

app = FastAPI()
# Charger les données
data = pd.read_csv("database/framingham_cleaned.csv")

#------------------------------graphe--------------
@app.get("/chart/area")
async def area_chart():
    # Données : Taux de cholestérol moyen par âge
    avg_cholesterol_by_age = data.groupby("age")["totChol"].mean()

    # Création du graphique
    plt.figure(figsize=(8, 6))
    sns.lineplot(x=avg_cholesterol_by_age.index, y=avg_cholesterol_by_age.values)
    plt.fill_between(avg_cholesterol_by_age.index, avg_cholesterol_by_age.values, alpha=0.2)
    plt.title("Taux de Cholestérol Moyen par Âge")
    plt.xlabel("Âge")
    plt.ylabel("Taux de Cholestérol Moyen")

    # Sauvegarde dans un buffer
    buf = BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    plt.close()

    return StreamingResponse(buf, media_type="image/png")

@app.get("/chart/bar")
async def bar_chart():
    # Données : Nombre de fumeurs par catégorie d'éducation
    smokers_by_education = data[data["currentSmoker"] == 1].groupby("education").size()

    # Création du graphique
    plt.figure(figsize=(8, 6))
    sns.barplot(x=smokers_by_education.index, y=smokers_by_education.values, palette="coolwarm")
    plt.title("Nombre de Fumeurs par Catégorie d'Éducation")
    plt.xlabel("Niveau d'Éducation")
    plt.ylabel("Nombre de Fumeurs")

    # Sauvegarde dans un buffer
    buf = BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    plt.close()

    return StreamingResponse(buf, media_type="image/png")

@app.get("/chart/heatmap")
async def heatmap_chart():
    # Données : Matrice de corrélation
    correlation_matrix = data.corr()

    # Création du graphique
    plt.figure(figsize=(10, 8))
    sns.heatmap(correlation_matrix, annot=True, cmap="coolwarm", fmt=".2f", linewidths=.5)
    plt.title("Carte de Corrélation des Variables")

    # Sauvegarde dans un buffer
    buf = BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    plt.close()

    return StreamingResponse(buf, media_type="image/png")

@app.get("/chart/histogram")
async def histogram_chart():
    # Données : Histogramme des taux de cholestérol
    plt.figure(figsize=(8, 6))
    sns.histplot(data["totChol"], bins=30, kde=True, color="purple")
    plt.title("Distribution du Taux de Cholestérol")
    plt.xlabel("Taux de Cholestérol")
    plt.ylabel("Fréquence")

    # Sauvegarde dans un buffer
    buf = BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    plt.close()

    return StreamingResponse(buf, media_type="image/png")
#----------------------------------------------

# Monter les fichiers statiques (CSS, JS, etc.)
app.mount("/static", StaticFiles(directory="backend/static"), name="static")
# Charger les templates HTML
templates = Jinja2Templates(directory="backend/templates")

@app.get("/", response_class=HTMLResponse)
async def read_dashboard(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/table_content", response_class=HTMLResponse)
async def get_table_content(request: Request):
     # Convertir les données en dictionnaire
    data_dict = data.to_dict(orient="records")
    return templates.TemplateResponse("table.html", {"request": request, "data": data_dict })

@app.get("/dashboard", response_class=HTMLResponse)
async def get_dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/chapitre1", response_class=HTMLResponse)
async def get_chapitre1(request: Request):
    return templates.TemplateResponse("chapitre1.html", {"request": request})

@app.get("/chapitre2", response_class=HTMLResponse)
async def get_chapitre2(request: Request):
    return templates.TemplateResponse("chapitre2.html", {"request": request})

@app.get("/chapitre3", response_class=HTMLResponse)
async def get_chapitre2(request: Request):
    return templates.TemplateResponse("chapitre3.html", {"request": request})

@app.get("/chapitre4", response_class=HTMLResponse)
async def get_chapitre2(request: Request):
    return templates.TemplateResponse("chapitre4.html", {"request": request})

@app.get("/framingham-data")
async def get_framingham_data():
    return data.to_dict(orient="records")

model = pickle.load(open('backend/static/assets/model/model.pkl', 'rb'))
scaler = pickle.load(open('backend/static/assets/model/scaler.pkl', 'rb'))

class HeartDiseaseInput(BaseModel):
    age: int
    sex: int
    cigsPerDay: float
    BPMeds: float
    prevalentStroke: int
    prevalentHyp: int
    totChol: float
    diabetes: int
    sysBP: float
    diaBP: float
    BMI: float
    heartRate: float
    glucose: float

@app.post("/predict")
async def predict(input_data: HeartDiseaseInput):
    try:
        features = pd.DataFrame({
            'male': [1 if input_data.sex == 1 else 0],
            'age': [input_data.age],
            'education' : [2],
            'currentSmoker': [1 if input_data.cigsPerDay > 0 else 0],
            'cigsPerDay': [input_data.cigsPerDay],
            'BPMeds': [1 if input_data.BPMeds == 1 else 0],
            'prevalentStroke': [1 if input_data.prevalentStroke == 1 else 0],
            'prevalentHyp': [1 if input_data.prevalentHyp == 1 else 0],
            'diabetes': [1 if input_data.diabetes == 1 else 0],
            'totChol': [input_data.totChol],
            'sysBP': [input_data.sysBP],
            'diaBP': [input_data.diaBP],
            'BMI': [input_data.BMI],
            'heartRate': [input_data.heartRate],
            'glucose': [input_data.glucose],
            
        })

        features_scaled = scaler.transform(features)
        prediction = model.predict(features_scaled)[0]
        
        return {
            "status": "success",
            "prediction": "Risque élevé" if prediction == 1 else "Risque faible"
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

@app.get("/application", response_class=HTMLResponse)
async def get_application(request: Request):
    return templates.TemplateResponse("application.html", {"request": request})
