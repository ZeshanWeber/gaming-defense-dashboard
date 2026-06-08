let surveyData = [];
const numberOfParticipants = 10000;

const ageGroups = ["16-20", "21-25", "26-30", "31+"];
const frequencies = ["Nie", "Selten", "Gelegentlich", "Häufig", "Sehr häufig"];
const games = ["Call of Duty", "Battlefield", "Arma", "Squad", "Escape from Tarkov"];
const militaryViews = ["Sehr positiv", "Eher positiv", "Neutral", "Eher negativ", "Sehr negativ"];
const bundeswehrViews = ["Sehr positiv", "Eher positiv", "Neutral", "Eher kritisch", "Sehr kritisch"];
const influenceValues = [1, 2, 3, 4, 5];

const openAnswers = [
  "Militärspiele können Konflikte stark vereinfachen.",
  "Ich sehe solche Spiele hauptsächlich als Unterhaltung.",
  "Realistische Shooter können die Wahrnehmung von Soldaten beeinflussen.",
  "Ein Bundeswehr-Spiel würde ich eher kritisch betrachten.",
  "Teamplay und Realismus machen militärische Spiele besonders attraktiv.",
  "Spiele können bestimmte Sichtweisen auf Konflikte langfristig verstärken.",
  "Es kommt darauf an, ob ein Spiel kritisch oder glorifizierend erzählt.",
  "Militärische Spiele können gesellschaftliche Meinungen beeinflussen.",
  "Ich finde problematisch, wenn Games für Imagebildung genutzt werden.",
  "Solche Spiele können Interesse an politischen und militärischen Themen wecken."
];

const frequencyFilter = document.getElementById("frequencyFilter");
const ageFilter = document.getElementById("ageFilter");
const gameFilter = document.getElementById("gameFilter");
const searchInput = document.getElementById("searchInput");

const resetFilters = document.getElementById("resetFilters");
const randomizeData = document.getElementById("randomizeData");
const exportCsv = document.getElementById("exportCsv");
const darkModeToggle = document.getElementById("darkModeToggle");

const totalParticipants = document.getElementById("totalParticipants");
const avgInfluence = document.getElementById("avgInfluence");
const positiveMilitaryView = document.getElementById("positiveMilitaryView");
const criticalBundeswehrView = document.getElementById("criticalBundeswehrView");

const interpretationText = document.getElementById("interpretationText");
const openAnswersContainer = document.getElementById("openAnswers");
const detailAnalysis = document.getElementById("detailAnalysis");

let frequencyChart;
let militaryViewChart;
let influenceChart;
let bundeswehrChart;

function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item.value;
    }
  }
}

function generateData() {
  surveyData = [];

  for (let i = 0; i < numberOfParticipants; i++) {
    const frequency = weightedRandom([
      { value: "Nie", weight: 5 },
      { value: "Selten", weight: 15 },
      { value: "Gelegentlich", weight: 35 },
      { value: "Häufig", weight: 30 },
      { value: "Sehr häufig", weight: 15 }
    ]);

    const influence = weightedRandom([
      { value: 1, weight: 5 },
      { value: 2, weight: 10 },
      { value: 3, weight: 25 },
      { value: 4, weight: 35 },
      { value: 5, weight: 25 }
    ]);

    surveyData.push({
      ageGroup: weightedRandom([
        { value: "16-20", weight: 30 },
        { value: "21-25", weight: 40 },
        { value: "26-30", weight: 20 },
        { value: "31+", weight: 10 }
      ]),
      frequency: frequency,
      game: games[Math.floor(Math.random() * games.length)],
      militaryView: weightedRandom([
        { value: "Sehr positiv", weight: 10 },
        { value: "Eher positiv", weight: 25 },
        { value: "Neutral", weight: 35 },
        { value: "Eher negativ", weight: 20 },
        { value: "Sehr negativ", weight: 10 }
      ]),
      influence: influence,
      bundeswehrGame: weightedRandom([
        { value: "Sehr positiv", weight: 5 },
        { value: "Eher positiv", weight: 10 },
        { value: "Neutral", weight: 25 },
        { value: "Eher kritisch", weight: 35 },
        { value: "Sehr kritisch", weight: 25 }
      ]),
      openAnswer: openAnswers[Math.floor(Math.random() * openAnswers.length)]
    });
  }
}

function getFilteredData() {
  return surveyData.filter(item => {
    return (
      (frequencyFilter.value === "all" || item.frequency === frequencyFilter.value) &&
      (ageFilter.value === "all" || item.ageGroup === ageFilter.value) &&
      (gameFilter.value === "all" || item.game === gameFilter.value)
    );
  });
}

function countValues(data, key, labels) {
  return labels.map(label => data.filter(item => item[key] === label).length);
}

function animateNumber(element, targetValue, decimals = 0, suffix = "") {
  const duration = 700;
  const startValue = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = startValue + (targetValue - startValue) * progress;

    let displayedValue;

    if (decimals > 0) {
      displayedValue = currentValue.toFixed(decimals);
    } else {
      displayedValue = Math.round(currentValue).toLocaleString("de-DE");
    }

    element.textContent = displayedValue + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function updateKPIs(data) {
  const total = data.length;

  const avg = data.length
    ? data.reduce((sum, item) => sum + item.influence, 0) / data.length
    : 0;

  const positive = data.filter(item =>
    item.militaryView === "Sehr positiv" || item.militaryView === "Eher positiv"
  ).length;

  const critical = data.filter(item =>
    item.bundeswehrGame === "Eher kritisch" || item.bundeswehrGame === "Sehr kritisch"
  ).length;

  const positivePercent = data.length
    ? Math.round((positive / data.length) * 100)
    : 0;

  const criticalPercent = data.length
    ? Math.round((critical / data.length) * 100)
    : 0;

  animateNumber(totalParticipants, total, 0);
  animateNumber(avgInfluence, avg, 1);
  animateNumber(positiveMilitaryView, positivePercent, 0, "%");
  animateNumber(criticalBundeswehrView, criticalPercent, 0, "%");
}

function createChart(ctx, type, labels, values, title) {
  return new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        label: title,
        data: values,
        backgroundColor: [
          "#2563eb",
          "#38bdf8",
          "#22c55e",
          "#f97316",
          "#ef4444"
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      onClick: function(event, elements) {
        if (elements.length > 0) {
          const index = elements[0].index;
          const label = this.data.labels[index];
          const value = this.data.datasets[0].data[index];
          const total = this.data.datasets[0].data.reduce((a, b) => a + b, 0);
          const percent = total ? Math.round((value / total) * 100) : 0;

          updateDetailAnalysis(title, label, value, percent, total);
        }
      },
      plugins: {
        legend: {
          position: type === "doughnut" ? "bottom" : "top"
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const value = context.raw;
              const percent = total ? Math.round((value / total) * 100) : 0;
              return `${context.label}: ${value.toLocaleString("de-DE")} Fälle (${percent}%)`;
            }
          }
        }
      },
      scales: type === "bar" ? {
        y: {
          beginAtZero: true
        }
      } : {}
    }
  });
}

function updateDetailAnalysis(chartTitle, label, value, percent, total) {
  let interpretation = "";

  if (percent >= 50) {
    interpretation = "Diese Kategorie dominiert die aktuelle Auswahl deutlich.";
  } else if (percent >= 30) {
    interpretation = "Diese Kategorie ist in der aktuellen Auswahl stark vertreten.";
  } else if (percent >= 15) {
    interpretation = "Diese Kategorie ist sichtbar vertreten, aber nicht dominant.";
  } else {
    interpretation = "Diese Kategorie spielt in der aktuellen Auswahl eine eher kleinere Rolle.";
  }

  detailAnalysis.innerHTML = `
    <h3>${chartTitle}: ${label}</h3>

    <p>
      Du hast im Diagramm die Kategorie <strong>${label}</strong> ausgewählt.
      Sie gehört zur Auswertung <strong>${chartTitle}</strong>.
    </p>

    <div class="detail-grid">
      <div class="detail-metric">
        <span>Anzahl</span>
        <strong>${value.toLocaleString("de-DE")}</strong>
      </div>

      <div class="detail-metric">
        <span>Anteil</span>
        <strong>${percent}%</strong>
      </div>

      <div class="detail-metric">
        <span>Grundgesamtheit</span>
        <strong>${total.toLocaleString("de-DE")}</strong>
      </div>
    </div>

    <p>
      <strong>Interpretation:</strong> ${interpretation}
    </p>
  `;
}

function updateCharts(data) {
  if (frequencyChart) frequencyChart.destroy();
  if (militaryViewChart) militaryViewChart.destroy();
  if (influenceChart) influenceChart.destroy();
  if (bundeswehrChart) bundeswehrChart.destroy();

  frequencyChart = createChart(
    document.getElementById("frequencyChart"),
    "bar",
    frequencies,
    countValues(data, "frequency", frequencies),
    "Spielhäufigkeit"
  );

  militaryViewChart = createChart(
    document.getElementById("militaryViewChart"),
    "doughnut",
    militaryViews,
    countValues(data, "militaryView", militaryViews),
    "Soldatenbild"
  );

  influenceChart = createChart(
    document.getElementById("influenceChart"),
    "bar",
    influenceValues,
    countValues(data, "influence", influenceValues),
    "Gesellschaftlicher Einfluss"
  );

  bundeswehrChart = createChart(
    document.getElementById("bundeswehrChart"),
    "doughnut",
    bundeswehrViews,
    countValues(data, "bundeswehrGame", bundeswehrViews),
    "Bewertung Bundeswehr-Spiel"
  );
}

function updateInterpretation(data) {
  if (data.length === 0) {
    interpretationText.textContent = "Für die aktuelle Filterauswahl liegen keine Daten vor.";
    return;
  }

  const avg = data.reduce((sum, item) => sum + item.influence, 0) / data.length;

  const critical = data.filter(item =>
    item.bundeswehrGame === "Eher kritisch" || item.bundeswehrGame === "Sehr kritisch"
  ).length;

  const criticalPercent = Math.round((critical / data.length) * 100);

  interpretationText.textContent =
    `In der aktuellen Auswahl mit ${data.length.toLocaleString("de-DE")} Fällen liegt der durchschnittlich wahrgenommene gesellschaftliche Einfluss bei ${avg.toFixed(1)} von 5. Gleichzeitig bewerten ${criticalPercent}% ein mögliches Bundeswehr-Spiel eher oder sehr kritisch.`;
}

function renderOpenAnswers(data) {
  const searchTerm = searchInput.value.toLowerCase();

  const answers = data
    .filter(item => item.openAnswer.toLowerCase().includes(searchTerm))
    .slice(0, 30);

  openAnswersContainer.innerHTML = "";

  answers.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("answer-card");

    card.innerHTML = `
      <p>${item.openAnswer}</p>
      <small>
        Altersgruppe: ${item.ageGroup} |
        Spielhäufigkeit: ${item.frequency} |
        Spiel: ${item.game}
      </small>
    `;

    openAnswersContainer.appendChild(card);
  });
}

function updateDashboard() {
  const filteredData = getFilteredData();

  updateKPIs(filteredData);
  updateCharts(filteredData);
  updateInterpretation(filteredData);
  renderOpenAnswers(filteredData);
}

function exportFilteredCsv() {
  const data = getFilteredData();

  let csv = "Altersgruppe,Spielhäufigkeit,Spiel,Soldatenbild,Einfluss,Bundeswehr-Spiel,Offene Antwort\n";

  data.forEach(item => {
    csv += `"${item.ageGroup}","${item.frequency}","${item.game}","${item.militaryView}","${item.influence}","${item.bundeswehrGame}","${item.openAnswer}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "gaming-defense-dashboard-daten.csv";
  link.click();

  URL.revokeObjectURL(url);
}

frequencyFilter.addEventListener("change", updateDashboard);
ageFilter.addEventListener("change", updateDashboard);
gameFilter.addEventListener("change", updateDashboard);
searchInput.addEventListener("input", updateDashboard);

resetFilters.addEventListener("click", () => {
  frequencyFilter.value = "all";
  ageFilter.value = "all";
  gameFilter.value = "all";
  searchInput.value = "";

  detailAnalysis.innerHTML = `
    <h3>Noch keine Kategorie ausgewählt</h3>
    <p>
      Klicke auf einen Balken oder ein Segment in einem Diagramm,
      um hier eine genauere Analyse zu sehen.
    </p>
  `;

  updateDashboard();
});

randomizeData.addEventListener("click", () => {
  generateData();

  detailAnalysis.innerHTML = `
    <h3>Neue Zufallsdaten generiert</h3>
    <p>
      Die simulierten Daten wurden neu erzeugt. Klicke auf ein Diagramm,
      um eine Detailanalyse zu öffnen.
    </p>
  `;

  updateDashboard();
});

exportCsv.addEventListener("click", exportFilteredCsv);

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    darkModeToggle.textContent = "☀️ Light Mode";
  } else {
    darkModeToggle.textContent = "🌙 Dark Mode";
  }
});

generateData();
updateDashboard();