
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






document.addEventListener("DOMContentLoaded", () => {
    console.log("Le script est exécuté.");

    // Fonction générique pour charger un chapitre
    const loadChapter = async (chapterLinkSelector, endpoint) => {
        const chapterLink = document.querySelector(chapterLinkSelector);

        if (chapterLink) {
            chapterLink.addEventListener("click", async (event) => {
                event.preventDefault();
                console.log(`Chargement du chapitre depuis ${endpoint}...`);
                try {
                    const response = await fetch(endpoint);
                    if (response.ok) {
                        const content = await response.text();
                        const mainElement = document.querySelector("main#dash");
                        if (mainElement) {
                            mainElement.innerHTML = content;
                            console.log(`Contenu du ${endpoint} chargé avec succès.`);
                            initializeCharts(); // Réinitialiser les graphiques après chargement
                        } else {
                            console.error("Erreur : L'élément <main> n'a pas été trouvé !");
                        }
                    } else {
                        console.error(`Erreur HTTP lors de la récupération de ${endpoint} :`, response.status);
                    }
                } catch (error) {
                    console.error(`Erreur lors du chargement du ${endpoint} :`, error);
                }
            });
        } else {
            console.error(`Le lien pour ${chapterLinkSelector} n'a pas été trouvé.`);
        }
    };



    // Fonction pour initialiser les graphiques
    async function initializeCharts() {
        try {
            console.log("Chargement des données depuis l'API...");

            // Récupérer les données depuis l'API
            const response = await fetch("/framingham-data");
            if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

            const data = await response.json();
            console.log("Données reçues :", data);
            // Vérifier la présence des éléments <canvas>
            const canvases = [
                "diabetesByAge",
                "diabetesBySex",
                "avgBPBySex",
                "scatterSysDiaBP"
            ].map(id => document.getElementById(id));

            if (canvases.some(canvas => !canvas)) {
                console.error("Certains éléments <canvas> ne sont pas dans le DOM !");
                return;
            }
          
            // 1. Graphique Line : Taux de Diabète par Âge
            new Chart(canvases[0], {
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
                },
            });
              // Préparer les données pour le graphique pie
        const pieData = preparePieData(data, "male", "diabetes");
        console.log("Données pour le graphique pie :", pieData);

        // Vérifiez si les données sont valides
        if (!pieData.datasets[0].data.some(value => value > 0)) {
            console.error("Pas de données valides pour le graphique pie !");
            return;
        }
            // 2. Graphique Pie : Taux de Diabète par Sexe
            new Chart(canvases[1], {
                type: "pie",
                data: pieData,
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: "top" },
                    },
                },
            });

            // 3. Graphique Bar : Moyenne de la Tension (SysBP) par Sexe
            new Chart(canvases[2], {
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
                },
            });

            // 4. Graphique Scatter : Corrélation SysBP / DiaBP
            new Chart(canvases[3], {
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
                },
            });
            const boxPlotCanvas = document.getElementById("boxPlotSysBP");
            new Chart(boxPlotCanvas, {
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
                },
            });
            

        } catch (error) {
            console.error("Erreur lors du chargement des graphiques :", error);
        }
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
