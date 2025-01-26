from fastapi import APIRouter
import plotly.express as px
import pandas as pd

router = APIRouter()

# Charger un dataset
data = pd.read_csv("PulseMLdatabase/framingham_cleaned.csv")

@router.get("/graphs")
async def render_graphs():
    fig = px.histogram(data, x="age", title="Distribution des âges")
    return fig.to_json()
