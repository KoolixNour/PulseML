from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import pandas as pd
import plotly.express as px
import plotly.io as pio

# Create FastAPI instance
app = FastAPI()

# Configure templates
templates = Jinja2Templates(directory="templates")

# Load the CSV file
df = pd.read_csv("framingham_cleaned.csv")

# Example function to generate the charts
def create_chart1():
    # Age vs Ten Years CHD
    fig = px.scatter(df, x="age", y="TenYearCHD", color="TenYearCHD", title="Age vs Ten Year CHD")
    fig.update_layout(margin=dict(l=0, r=0, t=0, b=0))
    return pio.to_html(fig, full_html=False)

def create_chart2():
    # Risk factors: Current smoker vs Ten Years Possible Heart Disease
    fig = px.histogram(df, x="currentSmoker", color="TenYearCHD", title="Current Smoker vs Ten Year CHD")
    fig.update_layout(margin=dict(l=0, r=0, t=0, b=0))
    return pio.to_html(fig, full_html=False)

def create_chart3():
    # Cholesterol vs Age
    fig = px.scatter(df, x="age", y="totChol", color="TenYearCHD", title="Cholesterol vs Age")
    fig.update_layout(margin=dict(l=0, r=0, t=0, b=0))
    return pio.to_html(fig, full_html=False)

def create_chart4():
    # Systolic Blood Pressure vs Ten Year CHD
    fig = px.box(df, x="TenYearCHD", y="sysBP", title="Systolic Blood Pressure vs Ten Year CHD")
    fig.update_layout(margin=dict(l=0, r=0, t=0, b=0))
    return pio.to_html(fig, full_html=False)

def create_chart5():
    # BMI vs Ten Year CHD
    fig = px.scatter(df, x="BMI", y="TenYearCHD", color="TenYearCHD", title="BMI vs Ten Year CHD")
    fig.update_layout(margin=dict(l=0, r=0, t=0, b=0))
    return pio.to_html(fig, full_html=False)

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    # Generate the charts
    chart1_html = create_chart1()
    chart2_html = create_chart2()
    chart3_html = create_chart3()
    chart4_html = create_chart4()
    chart5_html = create_chart5()

    # Render the template with the charts
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "chart1_html": chart1_html,
            "chart2_html": chart2_html,
            "chart3_html": chart3_html,
            "chart4_html": chart4_html,
            "chart5_html": chart5_html,
        }
    )
