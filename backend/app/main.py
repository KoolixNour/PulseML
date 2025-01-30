from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import pandas as pd

app = FastAPI()
# Charger les données
data = pd.read_csv("database/framingham_cleaned.csv")

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

@app.get("/framingham-data")
async def get_framingham_data():
    return data.to_dict(orient="records")