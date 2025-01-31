
// Scripts

window.addEventListener('DOMContentLoaded', event => {

    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
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




document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 Script chargé.");
    let charts = {}; // Stockage des graphiques actifs
    /**
     * Nettoie les graphiques existants avant d'en charger de nouveaux
     */
    function clearCharts() {
        console.log("🧹 Suppression des anciens graphiques...");
        Object.values(charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        charts = {}; // Réinitialisation
    }
    /**
     * Charge dynamiquement un chapitre en fonction du lien cliqué
     */
    // Fonction générique pour charger un chapitre
    const loadChapter = async (chapterLinkSelector, endpoint) => {
        const chapterLink = document.querySelector(chapterLinkSelector);

        if (chapterLink) {
            chapterLink.addEventListener("click", async (event) => {
                event.preventDefault();
                console.log(`🚀 Changement de chapitre : Nettoyage et chargement de ${endpoint}...`);

                clearCharts(); // Supprime les anciens graphiques

                try {
                    const response = await fetch(endpoint);
                    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

                    const content = await response.text();
                    const mainElement = document.querySelector("main#dash");
                    if (!mainElement) {
                        console.error("❌ Erreur : L'élément <main> n'a pas été trouvé !");
                        return;
                    }

                    mainElement.innerHTML = content;
                    console.log(`✅ Contenu du ${endpoint} chargé avec succès.`);

                    // Vérification que tous les graphiques du chapitre sont bien dans le DOM avant initialisation
                    setTimeout(() => {
                        console.log("🕒 Vérification des éléments Canvas avant d'initialiser les graphiques...");

                        initializeCharts(endpoint);
                    }, 500);
                } catch (error) {
                    console.error(`❌ Erreur lors du chargement de ${endpoint} :`, error);
                }
            });
        } else {
            console.error(`⚠️ Le lien pour ${chapterLinkSelector} n'a pas été trouvé.`);
        }
    };
    /**
     * Initialise les graphiques selon le chapitre affiché
     */
    async function initializeCharts(endpoint) {
        try {
            console.log("📡 Récupération des données...");
            const response = await fetch("/framingham-data");
            if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

            const data = await response.json();
            console.log("📊 Données reçues :", data);

            // 🔹 Détection du chapitre en cours
            let chapterNumber = endpoint.match(/\d+/)[0];

            if (chapterNumber === "1") {
                console.log("📌 Initialisation des graphiques du Chapitre 1...");
                initializeChapter1Charts(data);
            } else if (chapterNumber === "2") {
                console.log("📌 Initialisation des graphiques du Chapitre 2...");
                initializeChapter2Charts(data);
            }else if (chapterNumber === "4") {
                console.log("📌 Initialisation des graphiques du Chapitre 2...");
                initializeChapter4Charts(data);
            }


        } catch (error) {
            console.error("❌ Erreur lors du chargement des graphiques :", error);
        }
    }

    /**
     * Initialise les graphiques spécifiques au Chapitre 1
     */

    function initializeChapter1Charts(data) {
        // Histogramme âge   Graphe1
        const histogramCanvas = document.getElementById("histogramCanvas");
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
        if (histogramCanvas) {
            charts["histogramCanvas"] = new Chart(histogramCanvas.getContext('2d'), {
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
        }

        // Répartition genre Graphe2
        let sexField = Object.keys(data[0]).find(key =>
            key.toLowerCase().includes('sex') ||
            key.toLowerCase().includes('gender') ||
            key.toLowerCase().includes('male')
        );

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

        const genderCanvas = document.getElementById("genderPieChart");
        if (genderCanvas) {
            charts["genderPieChart"] = new Chart(genderCanvas.getContext('2d'), {
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
                                label: function (context) {
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
        //graphe 3 
        const smokersCtx = document.getElementById('smokersPieChart').getContext('2d');
        const smokersData = {
            smokers: data.filter(item => item.currentSmoker === 1).length,
            nonSmokers: data.filter(item => item.currentSmoker === 0).length
        };
        const totalSmokers = smokersData.smokers + smokersData.nonSmokers;
        const smokersPercentage = ((smokersData.smokers / totalSmokers) * 100).toFixed(1);
        const nonSmokersPercentage = ((smokersData.nonSmokers / totalSmokers) * 100).toFixed(1);
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
                            label: function (context) {
                                const value = context.raw;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        //graphe4 
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
                labels: Object.keys(smokerGroups).map(k => `${k}-${parseInt(k) + 5}`),
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

        // graphe 5
        const barChartCanvas = document.getElementById("barChartCanvas");
        const educationLevels = [...new Set(data.map(item => item.education))].sort((a, b) => a - b);
        const smokersByEducation = educationLevels.map(level => {
            return data.filter(item => item.education === level && item.currentSmoker === 1).length;
        });
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

        // graphe 6 
        const ages = [...new Set(data.map(item => item.age))].sort((a, b) => a - b);
        const avgCholesterol = ages.map(age => {
            const filtered = data.filter(item => item.age === age);
            const avg = filtered.reduce((sum, item) => sum + item.totChol, 0) / filtered.length;
            return avg.toFixed(2);
        });
        const areaChartCanvas = document.getElementById("areaChartCanvas");
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
    }

    /**
     * Initialise les graphiques spécifiques au Chapitre 2
     */
    function initializeChapter2Charts(data) {
        const diabetesByAge = document.getElementById("diabetesByAge");
        if (diabetesByAge) {
            charts["diabetesByAge"] = new Chart(diabetesByAge.getContext('2d'), {
                type: "line",
                data: prepareLineData(data, "age", "diabetes"),
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: "top" },
                    },
                    scales: {
                        x: { title: { display: true, text: "Âge" } },
                        y: { title: { display: true, text: "Taux de Diabète" } },
                    },
                }
            });
        }

        const diabetesBySex = document.getElementById("diabetesBySex");
        const pieData = preparePieData(data, "male", "diabetes");
        if (diabetesBySex) {
            charts["diabetesBySex"] = new Chart(diabetesBySex.getContext('2d'), {
                type: "pie",
                data: pieData,
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: "top" },
                    },
                }
            });
        }

        const avgBPBySex = document.getElementById("avgBPBySex");
        if (avgBPBySex) {
            charts["avgBPBySex"] = new Chart(avgBPBySex.getContext('2d'), {
                type: "bar",
                data: prepareBarData(data, "male", "sysBP"),
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: "top" },
                    },
                    scales: {
                        x: { title: { display: true, text: "Sexe" } },
                        y: { title: { display: true, text: "Moyenne de la Tension" } },
                    },
                }
            });
        }
        const scatterSysDiaBP = document.getElementById("scatterSysDiaBP");
        if (scatterSysDiaBP) {
            charts["scatterSysDiaBP"] = new Chart(scatterSysDiaBP.getContext('2d'), {
                type: "scatter",
                data: prepareScatterData(data, "sysBP", "diaBP"),
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: "top" },
                    },
                    scales: {
                        x: { title: { display: true, text: "SysBP" } },
                        y: { title: { display: true, text: "DiaBP" } },
                    },
                }
            });
        }
        const boxPlotCanvas = document.getElementById("boxPlotSysBP");
        if (boxPlotCanvas) {
            charts["boxPlotSysBP"] = new Chart(boxPlotCanvas.getContext('2d'), {
                type: "bar",
                data: prepareHistogramData(data, "sysBP"),
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                    },
                    scales: {
                        x: {
                            title: { display: true, text: "Tension Artérielle Systolique (mmHg)" },
                            beginAtZero: true,
                        },
                        y: {
                            title: { display: true, text: "Nombre de Patients" },
                            beginAtZero: true,
                        },
                    },
                }

            });
        }
        function prepareHistogramData(data, field) {
            const bins = 10; // Nombre de classes
            const min = Math.min(...data.map(item => item[field]).filter(value => value !== null && !isNaN(value)));
            const max = Math.max(...data.map(item => item[field]).filter(value => value !== null && !isNaN(value)));
            const binSize = (max - min) / bins;

            // Initialiser les classes
            const histogram = Array(bins).fill(0);
            data.forEach(item => {
                const value = item[field];
                if (value !== null && !isNaN(value)) {
                    const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
                    histogram[binIndex]++;
                }
            });

            // Préparer les labels et les données
            const labels = Array.from({ length: bins }, (_, i) => {
                const lower = (min + i * binSize).toFixed(1);
                const upper = (min + (i + 1) * binSize).toFixed(1);
                return `${lower} - ${upper}`;
            });

            return {
                labels: labels,
                datasets: [{
                    label: "Distribution de SysBP",
                    data: histogram,
                    backgroundColor: "rgba(75, 192, 192, 0.5)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                }],
            };
        }



        function prepareLineData(data, xField, yField) {
            const grouped = data.reduce((acc, item) => {
                const key = item[xField];
                if (!acc[key]) acc[key] = { total: 0, count: 0 };
                acc[key].total += item[yField]; // Accumule les cas de diabète
                acc[key].count += 1;           // Compte le nombre total d'entrées pour cet âge
                return acc;
            }, {});

            const labels = Object.keys(grouped).sort((a, b) => a - b);
            const values = labels.map(label => grouped[label].total / grouped[label].count);

            return {
                labels: labels,
                datasets: [{
                    label: `Taux de Diabète par ${xField}`,
                    data: values,
                    borderColor: "rgba(75, 192, 192, 1)",
                    fill: false,
                }],
            };
        }


        function preparePieData(data, groupField, targetField) {
            const grouped = data.reduce((acc, item) => {
                acc[item[groupField]] = acc[item[groupField]] || 0;
                acc[item[groupField]] += item[targetField] === 1 ? 1 : 0;
                return acc;
            }, {});

            console.log("Données regroupées pour le pie chart :", grouped);

            return {
                labels: ["Homme", "Femme"],
                datasets: [{
                    label: `Répartition par ${groupField}`,
                    data: [grouped[1] || 0, grouped[0] || 0], // Homme = 1, Femme = 0
                    backgroundColor: ["#FF6384", "#36A2EB"],
                }],
            };
        }

        function prepareBarData(data, groupField, targetField) {
            const grouped = data.reduce((acc, item) => {
                const group = item[groupField]; // e.g., 1 for male, 0 for female
                if (!acc[group]) acc[group] = [];
                acc[group].push(item[targetField]);
                return acc;
            }, {});

            // Calculer la moyenne pour chaque groupe
            const averages = Object.keys(grouped).map(key => {
                const values = grouped[key];
                return values.reduce((sum, val) => sum + val, 0) / values.length;
            });

            return {
                labels: ["Homme", "Femme"], // Adapter en fonction des valeurs dans `groupField`
                datasets: [{
                    label: `Moyenne de ${targetField}`,
                    data: averages,
                    backgroundColor: "rgba(75, 192, 192, 0.5)",
                }]
            };
        }

        function prepareScatterData(data, xField, yField) {
            return {
                datasets: [{
                    label: "Corrélation",
                    data: data.map(item => ({ x: item[xField], y: item[yField] })),
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                }],
            };
        }

        function groupBy(data, key, value) {
            return data.reduce((acc, item) => {
                const group = item[key];
                acc[group] = acc[group] || [];
                acc[group].push(item[value]);
                return acc;
            }, {});
        }
    }
    
    function initializeChapter4Charts(data) { 
        const scatterSysBPvsDiaBP = document.getElementById("scatterSysBPvsDiaBP");
        const scatterAgeVsBMI = document.getElementById("scatterAgeVsBMI");
        const cholesterolCanvas =document.getElementById("cholesterolCanvas")
       console.log("Initialisation des graphiques pour le chapitre 4...");
   
       // Graphique de l'histogramme (à remplir comme précédemment)
       const ageData = data.map(item => item.age);
       const cholesterolData = data.map(item => item.totChol);
       const tenYearCHDColors1 = data.map(item => item.TenYearCHD === 1 ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)');
   
       new Chart(cholesterolCanvas, {
           type: 'scatter',
           data: {
               datasets: [{
                   label: 'TenYearCHD = 0 (Pas de risque)', // Label pour TenYearCHD = 0
                   data: data.filter(item => item.TenYearCHD === 0).map(item => ({
                       x: item.age,
                       y: item.totChol
                   })),
                   backgroundColor: 'rgba(54, 162, 235, 1)', // Couleur bleu pour TenYearCHD = 0
                   borderColor: 'rgba(54, 162, 235, 1)',  // Bord bleu pour cohérence
                   pointRadius: 3,
                   pointHoverRadius: 8,
               },
               {
                   label: 'TenYearCHD = 1 (Risque)', // Label pour TenYearCHD = 1
                   data: data.filter(item => item.TenYearCHD === 1).map(item => ({
                       x: item.age,
                       y: item.totChol
                   })),
                   backgroundColor: 'rgba(255, 99, 132, 1)', // Couleur rouge pour TenYearCHD = 1
                   borderColor: 'rgba(255, 99, 132, 1)',  // Bord rouge pour cohérence
                   pointRadius: 3,
                   pointHoverRadius: 8,
               }]
           },
           options: {
               responsive: true,
               plugins: {
                   legend: {
                       display: true,
                       position: 'top',
                   },
                   title: {
                       display: false // Supprimer le titre
                   }
               },
               scales: {
                   x: {
                       title: {
                           display: true,
                           text: 'Âge'
                       }
                   },
                   y: {
                       title: {
                           display: true,
                           text: 'Cholestérol'
                       }
                   }
               }
           }
       });
       
   
       // Autres graphiques du chapitre 3 (nuages de points, violin plots, etc.)
       // Nuage de points sysBP vs. diaBP
       // Créer le graphique en nuage de points
       const sysBP = data.map(item => item.sysBP);
       const diaBP = data.map(item => item.diaBP);
   
       // Colorier les points en fonction de TenYearCHD (1 ou 0)
       const tenYearCHDColors = data.map(item => item.TenYearCHD === 1 ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)');
   
       new Chart(scatterSysBPvsDiaBP, {
           type: 'scatter',
           data: {
               datasets: [{
                   label: 'TenYearCHD = 0',
                   data: data.filter(item => item.TenYearCHD === 0).map(item => ({ x: item.sysBP, y: item.diaBP })),
                   backgroundColor: 'rgba(54, 162, 235, 1)', // Couleur pour TenYearCHD = 0 (bleu)
                   borderColor: 'rgba(54, 162, 235, 1)',  // Même couleur pour le bord
                   pointRadius: 3,
                   pointHoverRadius: 8,
               },
               {
                   label: 'TenYearCHD = 1',
                   data: data.filter(item => item.TenYearCHD === 1).map(item => ({ x: item.sysBP, y: item.diaBP })),
                   backgroundColor: 'rgba(255, 206, 86, 1)', // Couleur pour TenYearCHD = 1 (jaune)
                   borderColor: 'rgba(255, 206, 86, 1)',  // Même couleur pour le bord
                   pointRadius: 3,
                   pointHoverRadius: 8,
               }]
           },
           options: {
               responsive: true,
               plugins: {
                   legend: {
                       display: true,
                       position: 'top',  // Légende en haut
                       labels: {
                           usePointStyle: true,  // Utilisation de points dans la légende
                           pointStyle: 'circle',  // Les points dans la légende seront des cercles
                           color: 'rgb(0, 0, 0)',  // Couleur du texte
                           font: {
                               size: 14  // Taille de la police
                           },
                           padding: 10  // Espacement entre les éléments de la légende
                       }
                   },
                   title: {
                       display: true,
                       text: 'sysBP vs. diaBP',  // Titre du graphique
                       font: {
                           size: 14
                       },
                       padding: {
                           top: 20,
                           bottom: 20
                       }
                   }
               },
               scales: {
                   x: {
                       title: {
                           display: true,
                           text: 'Pression systolique (sysBP)'  // Titre de l'axe X
                       },
                       ticks: {
                           stepSize: 15  // Espacement plus grand des ticks sur l'axe X
                       }
                   },
                   y: {
                       title: {
                           display: true,
                           text: 'Pression diastolique (diaBP)'  // Titre de l'axe Y
                       },
                       ticks: {
                           stepSize: 15  // Espacement plus grand des ticks sur l'axe Y
                       }
                   }
               }
           }
       });
      
       // Nuage de points âge vs. BMI
       new Chart(scatterAgeVsBMI, {
           type: 'scatter',
           data: {
               datasets: [{
                   label: 'TenYearCHD = 0',
                   data: data.filter(item => item.TenYearCHD === 0).map(item => ({ x: item.age, y: item.BMI })),
                   backgroundColor: 'rgba(54, 162, 235, 1)', // Couleur pour TenYearCHD = 0 (bleu)
                   borderColor: 'rgba(54, 162, 235, 1)',  // Même couleur pour le bord
                   pointRadius: 3,  // Réduire la taille des points
                   pointHoverRadius: 5
               },
               {
                   label: 'TenYearCHD = 1',
                   data: data.filter(item => item.TenYearCHD === 1).map(item => ({ x: item.age, y: item.BMI })),
                   backgroundColor: 'rgba(255, 206, 86, 1)', // Couleur pour TenYearCHD = 1 (jaune)
                   borderColor: 'rgba(255, 206, 86, 1)',  // Même couleur pour le bord
                   pointRadius: 3,  // Réduire la taille des points
                   pointHoverRadius: 5
               }]
           },
           options: {
               responsive: true,
               plugins: {
                   legend: {
                       display: true,
                       position: 'top',
                       labels: {
                           usePointStyle: true,
                           pointStyle: 'circle',
                           color: 'rgb(0, 0, 0)',
                           font: {
                               size: 14
                           }
                       }
                   },
                   title: {
                       display: true,
                       text: 'Relation entre l\'Âge et le BMI',
                       font: {
                           size: 16
                       },
                       padding: {
                           top: 20,
                           bottom: 20
                       }
                   }
               },
               scales: {
                   x: {
                       title: {
                           display: true,
                           text: 'Âge'
                       },
                       ticks: {
                           stepSize: 5  // Augmenter l'espacement des ticks sur l'axe X
                       }
                   },
                   y: {
                       title: {
                           display: true,
                           text: 'BMI'
                       },
                       ticks: {
                           stepSize: 5  // Augmenter l'espacement des ticks sur l'axe Y
                       }
                   }
               }
           }
       });
    }

    // Observer les changements DOM pour les liens des chapitres
    const observer = new MutationObserver(() => {
        const links = ["#chapitre1-link", "#chapitre2-link", "#chapitre3-link", "#chapitre4-link"];
        if (links.every(selector => document.querySelector(selector))) {
            console.log("Les liens des chapitres ont été trouvés.");
            links.forEach((link, index) => loadChapter(link, `/chapitre${index + 1}`));
            observer.disconnect(); // Arrêter l'observation
        }
    });

    // Démarrer l'observation des changements dans le DOM
    observer.observe(document.body, { childList: true, subtree: true });

    // Vérifier immédiatement si les liens sont déjà dans le DOM
    ["#chapitre1-link", "#chapitre2-link", "#chapitre3-link", "#chapitre4-link"].forEach((link, index) =>
        loadChapter(link, `/chapitre${index + 1}`)
    );
});


// Exécuter l'attachement des événements après le chargement du DOM
document.addEventListener("DOMContentLoaded", attachChapterEvents);

// -------tableau --------

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
