
// Scripts

window.addEventListener('DOMContentLoaded', event => {

    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        // Uncomment Below to persist sidebar toggle between refreshes
        // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        //     document.body.classList.toggle('sb-sidenav-toggled');
        // }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }

});


document.addEventListener("DOMContentLoaded", () => {
    // Sélectionner le lien "Tableau" dans le menu
    const tableLink = document.querySelector("#table-link");
    
    // Ajouter un gestionnaire d'événement pour le clic
    tableLink.addEventListener("click", async (event) => {
        event.preventDefault(); // Empêcher le chargement complet de la page

        // Charger le contenu de `/table_content` depuis le serveur
        try {
            const response = await fetch("/table_content");
            const content = await response.text();

            // Remplacer le contenu de la section `main`
            document.querySelector("main").innerHTML = content;
        } catch (error) {
            console.error("Erreur lors du chargement du tableau :", error);
        }
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const dashboardLink = document.querySelector("#dashboard-link");

    dashboardLink.addEventListener("click", async (event) => {
        event.preventDefault();

        try {
            const response = await fetch("/dashboard");
            if (response.ok) {
                const content = await response.text();
                document.querySelector("main").innerHTML = content;
            } else {
                console.error("Erreur HTTP :", response.status);
            }
        } catch (error) {
            console.error("Erreur lors du chargement du tableau de bord :", error);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const chapitre1Link = document.querySelector("#chapitre1-link");
    if (chapitre1Link) {
        chapitre1Link.addEventListener("click", async () => {
            await new Promise(resolve => setTimeout(resolve, 100)); // Petit délai pour s'assurer que le DOM est mis à jour
            initializeCharts();
        });
    }
});

function attachChapterEvents() {
    const chapitre1Link = document.querySelector("#chapitre1-link");

    if (chapitre1Link) {
        chapitre1Link.addEventListener("click", async (event) => {
            event.preventDefault(); // Empêche le rechargement de la page

            try {
                // Charger le contenu de /chapitre1 via l'API
                const response = await fetch("/chapitre1");
                if (response.ok) {
                    const content = await response.text();

                    // Injecter le contenu dans <main id="dash">
                    const mainElement = document.querySelector("main#dash");
                    if (mainElement) {
                        mainElement.innerHTML = content; // Remplace le contenu existant par celui chargé
                        console.log("Contenu du chapitre 1 chargé avec succès !");
                    } else {
                        console.error("Erreur : L'élément <main id='dash'> n'existe pas !");
                    }
                } else {
                    console.error("Erreur HTTP lors de la récupération de /chapitre1 :", response.status);
                }
            } catch (error) {
                console.error("Erreur lors du chargement du chapitre 1 :", error);
            }
        });
    }
}

// Appeler la fonction pour attacher les événements après le chargement de la page
document.addEventListener("DOMContentLoaded", attachChapterEvents);

// Réattacher les événements après le chargement de "dashboard.html"
document.addEventListener("DOMContentLoaded", () => {
    const dashboardLink = document.querySelector("#dashboard-link");

    if (dashboardLink) {
        dashboardLink.addEventListener("click", async (event) => {
            event.preventDefault();

            try {
                const response = await fetch("/dashboard");
                if (response.ok) {
                    const content = await response.text();
                    document.querySelector("main").innerHTML = content;

                    // Réattacher les événements pour les nouveaux contenus
                    attachChapterEvents();
                } else {
                    console.error("Erreur HTTP :", response.status);
                }
            } catch (error) {
                console.error("Erreur lors du chargement du tableau de bord :", error);
            }
        });
    }
});

// Fonction pour attendre que Chart.js soit chargé
function waitForChartJS() {
    return new Promise((resolve, reject) => {
        if (typeof Chart !== 'undefined') {
            resolve();
        } else {
            // Attendre au maximum 5 secondes
            let attempts = 0;
            const interval = setInterval(() => {
                if (typeof Chart !== 'undefined') {
                    clearInterval(interval);
                    resolve();
                } else if (attempts >= 50) { // 5 secondes (100ms * 50)
                    clearInterval(interval);
                    reject(new Error("Chart.js n'a pas pu être chargé"));
                }
                attempts++;
            }, 100);
        }
    });
}

// Fonction pour charger les données avec retry
async function loadFraminghamData(retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch("/framingham-data");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log("Données chargées avec succès:", data.length, "enregistrements");
            return data;
        } catch (error) {
            console.warn(`Tentative ${i + 1}/${retries} échouée:`, error);
            if (i === retries - 1) throw error;
            // Attendre avant de réessayer (temps d'attente exponentiell)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
}

async function initializeCharts() {
    try {
        // 1. Attendre que Chart.js soit chargé
        await waitForChartJS();
        console.log("Chart.js chargé avec succès");

        // 2. Vérifier si le canvas existe
        const canvas = document.getElementById('genderPieChart');
        if (!canvas) {
            throw new Error("Canvas 'genderPieChart' non trouvé dans le DOM");
        }
        console.log("Canvas trouvé");

        console.log("Chargement des données depuis l'API...");

        // Récupérer les données depuis l'API
        const response = await fetch("/framingham-data");
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        console.log("Données reçues :", data);

        // Vérifiez si les éléments <canvas> existent
        const areaChartCanvas = document.getElementById("areaChartCanvas");
        const barChartCanvas = document.getElementById("barChartCanvas");

        if (!areaChartCanvas || !barChartCanvas) {
            console.error("Les éléments <canvas> ne sont pas trouvés dans le DOM !");
            return;
        }

        // Préparer les données pour le graphique en aires
        const ages = [...new Set(data.map(item => item.age))].sort((a, b) => a - b);
        const avgCholesterol = ages.map(age => {
            const filtered = data.filter(item => item.age === age);
            const avg = filtered.reduce((sum, item) => sum + item.totChol, 0) / filtered.length;
            return avg.toFixed(2);
        });

        // Graphique en aires
        new Chart(areaChartCanvas, {
            type: "line",
            data: {
                labels: ages,
                datasets: [{
                    label: "Taux de Cholestérol Moyen",
                    data: avgCholesterol,
                    fill: true,
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top",
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Âge"
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Taux de Cholestérol Moyen"
                        }
                    }
                }
            }
        });

        // Préparer les données pour le graphique en barres
        const educationLevels = [...new Set(data.map(item => item.education))].sort((a, b) => a - b);
        const smokersByEducation = educationLevels.map(level => {
            return data.filter(item => item.education === level && item.currentSmoker === 1).length;
        });

        // Graphique en barres
        new Chart(barChartCanvas, {
            type: "bar",
            data: {
                labels: educationLevels,
                datasets: [{
                    label: "Nombre de Fumeurs",
                    data: smokersByEducation,
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top",
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Niveau d'Éducation"
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Nombre de Fumeurs"
                        }
                    }
                }
            }
        });
        // Age Histogram
        const histogramCanvas = document.getElementById("histogramCanvas");
        if (!histogramCanvas) {
            console.error("Canvas histogramCanvas not found");
            return;
        }

        const ctx = histogramCanvas.getContext('2d');
        
        const ageValues = data.map(item => item.age);
        const minAge = Math.min(...ageValues);
        const maxAge = Math.max(...ageValues);
        const binWidth = 5;
        const bins = Math.ceil((maxAge - minAge) / binWidth);
        
        const histogramData = Array(bins).fill(0);
        ageValues.forEach(age => {
            const binIndex = Math.floor((age - minAge) / binWidth);
            if (binIndex >= 0 && binIndex < bins) {
                histogramData[binIndex]++;
            }
        });
        
        const histogramLabels = Array(bins).fill(0).map((_, i) => minAge + (i * binWidth));
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: histogramLabels,
                datasets: [{
                    label: 'Distribution par âge',
                    data: histogramData,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }, {
                    label: 'Tendance',
                    type: 'line',
                    data: histogramData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Distribution de l\'âge'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Âge'
                        },
                        grid: {
                            display: true
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Nombre de patients'
                        },
                        beginAtZero: true,
                        grid: {
                            display: true
                        }
                    }
                }
            }
        });
        
        console.log("Premier enregistrement:", data[0]);
        console.log("Noms des colonnes:", Object.keys(data[0]));
        
        let sexField = Object.keys(data[0]).find(key => 
            key.toLowerCase().includes('sex') || 
            key.toLowerCase().includes('gender') || 
            key.toLowerCase().includes('male')
        );
        
        console.log("Champ identifié pour le sexe:", sexField);
        
        const genderStats = data.reduce((acc, item) => {
            const sexValue = item[sexField]; 
            console.log("Valeur trouvée pour le sexe:", sexValue, typeof sexValue);
            
            let gender;
            if (typeof sexValue === 'number') {
                gender = sexValue === 1 ? 'Hommes' : 'Femmes';
            } else if (typeof sexValue === 'string') {
                gender = sexValue.toLowerCase().includes('m') ? 'Hommes' : 'Femmes';
            }
            
            if (gender) {
                acc[gender] = (acc[gender] || 0) + 1;
            }
            return acc;
        }, { 'Hommes': 0, 'Femmes': 0 });
        
        // Calculer les pourcentages
        const total = Object.values(genderStats).reduce((a, b) => a + b, 0);
        const malePercentage = ((genderStats['Hommes'] / total) * 100).toFixed(1);
        const femalePercentage = ((genderStats['Femmes'] / total) * 100).toFixed(1);
        
        // Créer les labels avec pourcentages
        const labels = [
            `Hommes (${malePercentage}%)`,
            `Femmes (${femalePercentage}%)`
        ];
        
        const genderCanvas = document.getElementById('genderPieChart');
        if (genderCanvas) {
            const ctx = genderCanvas.getContext('2d');
            ctx.clearRect(0, 0, genderCanvas.width, genderCanvas.height);
        
            new Chart(genderCanvas, {
                type: 'doughnut',
                data: {
                    labels: labels,  // Utiliser les labels avec pourcentages
                    datasets: [{
                        data: [genderStats['Hommes'], genderStats['Femmes']],
                        backgroundColor: ['#7CB9E8', '#FFB6C1'],
                        borderColor: ['#0066b2', '#FF69B4'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                font: {
                                    size: 14
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${context.label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

    // Smokers percentage pie chart
    const smokersCtx = document.getElementById('smokersPieChart').getContext('2d');
    const smokersData = {
        smokers: data.filter(item => item.currentSmoker === 1).length,
        nonSmokers: data.filter(item => item.currentSmoker === 0).length
    };

    // Calculer les pourcentages
    const totalSmokers = smokersData.smokers + smokersData.nonSmokers;
    const smokersPercentage = ((smokersData.smokers / totalSmokers) * 100).toFixed(1);
    const nonSmokersPercentage = ((smokersData.nonSmokers / totalSmokers) * 100).toFixed(1);

    // Créer les labels avec pourcentages
    const labelsSmokers = [
        `Fumeurs (${smokersPercentage}%)`,
        `Non-fumeurs (${nonSmokersPercentage}%)`
    ];

    new Chart(smokersCtx, {
        type: 'pie',
        data: {
            labels: labelsSmokers,
            datasets: [{
                data: [smokersData.smokers, smokersData.nonSmokers],
                backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(75, 192, 192, 0.8)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Average cigarettes per day bar chart
    const cigarettesCtx = document.getElementById('cigarettesBarChart').getContext('2d');
    const smokerGroups = data.reduce((acc, item) => {
        if (item.cigsPerDay) {
            const group = Math.floor(item.cigsPerDay / 5) * 5;
            acc[group] = (acc[group] || 0) + 1;
        }
        return acc;
    }, {});

    new Chart(cigarettesCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(smokerGroups).map(k => `${k}-${parseInt(k)+5}`),
            datasets: [{
                label: 'Nombre de fumeurs',
                data: Object.values(smokerGroups),
                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nombre de personnes'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Cigarettes par jour'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    } catch (error) {
        console.error("Erreur lors du chargement des graphiques :", error);
    }
}

function attachChapterEvents() {
    const chapitre1Link = document.querySelector("#chapitre1-link");

    if (chapitre1Link) {
        chapitre1Link.addEventListener("click", async (event) => {
            event.preventDefault();

            try {
                const response = await fetch("/chapitre1");
                if (response.ok) {
                    const content = await response.text();
                    const mainElement = document.querySelector("main#dash");
                    if (mainElement) {
                        mainElement.innerHTML = content;

                        // Réinitialiser les graphiques après l'injection du contenu
                        initializeCharts();
                    } else {
                        console.error("L'élément <main id='dash'> n'existe pas !");
                    }
                } else {
                    console.error("Erreur HTTP lors de la récupération de /chapitre1 :", response.status);
                }
            } catch (error) {
                console.error("Erreur lors du chargement du chapitre 1 :", error);
            }
        });
    }
}

// Exécuter l'attachement des événements après le chargement du DOM
document.addEventListener("DOMContentLoaded", attachChapterEvents);



document.addEventListener("DOMContentLoaded", () => {
    console.log("Le script est exécuté.");

    const table = document.getElementById("dataTable");
    if (!table) {
        console.error("L'élément 'dataTable' n'a pas été trouvé dans le DOM.");
        return;
    }
    console.log("Table:", table);

    const rowsPerPageSelect = document.getElementById("rowsPerPage");
    if (!rowsPerPageSelect) {
        console.error("L'élément 'rowsPerPage' n'a pas été trouvé dans le DOM.");
        return;
    }
    console.log("Sélecteur de lignes par page:", rowsPerPageSelect);

    const pagination = document.getElementById("pagination");
    if (!pagination) {
        console.error("L'élément 'pagination' n'a pas été trouvé dans le DOM.");
        return;
    }
    console.log("Pagination:", pagination);

    const rows = Array.from(table.querySelector("tbody").rows);
    console.log("Lignes de la table :", rows);

    let currentPage = 1;

    const updateTable = () => {
        const rowsPerPage = parseInt(rowsPerPageSelect.value, 10);
        const totalRows = rows.length;
        const totalPages = Math.ceil(totalRows / rowsPerPage);

        console.log(`Total Rows: ${totalRows}, Rows Per Page: ${rowsPerPage}, Total Pages: ${totalPages}, Current Page: ${currentPage}`);

        // Afficher les lignes correspondantes à la page actuelle
        rows.forEach((row, index) => {
            row.style.display =
                index >= (currentPage - 1) * rowsPerPage && index < currentPage * rowsPerPage
                    ? ""
                    : "none";
        });

        // Mettre à jour la pagination
        pagination.innerHTML = "";

        // Bouton Précédent
        const prevButton = document.createElement("button");
        prevButton.textContent = "Précédent";
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                updateTable();
            }
        });
        pagination.appendChild(prevButton);

        // Boutons de pages
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.className = i === currentPage ? "active" : "";
            button.disabled = i === currentPage;
            button.addEventListener("click", () => {
                currentPage = i;
                updateTable();
            });
            pagination.appendChild(button);
        }

        // Bouton Suivant
        const nextButton = document.createElement("button");
        nextButton.textContent = "Suivant";
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateTable();
            }
        });
        pagination.appendChild(nextButton);
    };

    // Mettre à jour le tableau lorsque le nombre de lignes par page change
    rowsPerPageSelect.addEventListener("change", () => {
        console.log("Changement du nombre de lignes par page.");
        currentPage = 1; // Réinitialiser à la première page
        updateTable();
    });

    // Initialisation
    console.log("Initialisation du tableau avec pagination.");
    updateTable();
});
