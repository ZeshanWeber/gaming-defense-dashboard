/* ============================================================
   Gaming × Defense — Data Story
   ============================================================ */

// ── Constants ────────────────────────────────────────────────
const N = 10_000;

const AGE_GROUPS  = ['16-20', '21-25', '26-30', '31+'];
const FREQUENCIES = ['Nie', 'Selten', 'Gelegentlich', 'Häufig', 'Sehr häufig'];
const GAMES       = ['Call of Duty', 'Battlefield', 'Arma', 'Squad', 'Escape from Tarkov'];
const MIL_VIEWS   = ['Sehr positiv', 'Eher positiv', 'Neutral', 'Eher negativ', 'Sehr negativ'];
const BW_VIEWS    = ['Sehr positiv', 'Eher positiv', 'Neutral', 'Eher kritisch', 'Sehr kritisch'];
const INF_VALUES  = [1, 2, 3, 4, 5];

const OPEN_ANSWERS = [
  'Militärspiele können Konflikte stark vereinfachen.',
  'Ich sehe solche Spiele hauptsächlich als Unterhaltung.',
  'Realistische Shooter können die Wahrnehmung von Soldaten beeinflussen.',
  'Ein Bundeswehr-Spiel würde ich eher kritisch betrachten.',
  'Teamplay und Realismus machen militärische Spiele besonders attraktiv.',
  'Spiele können bestimmte Sichtweisen auf Konflikte langfristig verstärken.',
  'Es kommt darauf an, ob ein Spiel kritisch oder glorifizierend erzählt.',
  'Militärische Spiele können gesellschaftliche Meinungen beeinflussen.',
  'Ich finde problematisch, wenn Games für Imagebildung genutzt werden.',
  'Solche Spiele können Interesse an politischen und militärischen Themen wecken.'
];

// Sky-Blue palette — primary to lightest
const PALETTE = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'];

// ── Weighted random ──────────────────────────────────────────
function pick(items) {
  const total = items.reduce((s, i) => s + i.w, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.w;
    if (r <= 0) return item.v;
  }
  return items[items.length - 1].v;
}

// ── Generate fixed dataset (called once) ─────────────────────
function generateData() {
  const data = [];
  for (let i = 0; i < N; i++) {
    data.push({
      ageGroup: pick([
        { v: '16-20', w: 30 },
        { v: '21-25', w: 40 },
        { v: '26-30', w: 20 },
        { v: '31+',   w: 10 }
      ]),
      frequency: pick([
        { v: 'Nie',          w: 5  },
        { v: 'Selten',       w: 15 },
        { v: 'Gelegentlich', w: 35 },
        { v: 'Häufig',       w: 30 },
        { v: 'Sehr häufig',  w: 15 }
      ]),
      game: GAMES[Math.floor(Math.random() * GAMES.length)],
      militaryView: pick([
        { v: 'Sehr positiv', w: 10 },
        { v: 'Eher positiv', w: 25 },
        { v: 'Neutral',      w: 35 },
        { v: 'Eher negativ', w: 20 },
        { v: 'Sehr negativ', w: 10 }
      ]),
      influence: pick([
        { v: 1, w: 5  },
        { v: 2, w: 10 },
        { v: 3, w: 25 },
        { v: 4, w: 35 },
        { v: 5, w: 25 }
      ]),
      bundeswehrGame: pick([
        { v: 'Sehr positiv', w: 5  },
        { v: 'Eher positiv', w: 10 },
        { v: 'Neutral',      w: 25 },
        { v: 'Eher kritisch',w: 35 },
        { v: 'Sehr kritisch',w: 25 }
      ]),
      openAnswer: OPEN_ANSWERS[Math.floor(Math.random() * OPEN_ANSWERS.length)]
    });
  }
  return data;
}

// ── Count occurrences per label ──────────────────────────────
function countValues(data, key, labels) {
  return labels.map(l => data.filter(d => d[key] === l).length);
}

// ── Animated counter ─────────────────────────────────────────
function animateValue(el, target, decimals = 0, suffix = '') {
  const duration = 900;
  const start = performance.now();
  (function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    el.textContent = (decimals > 0
      ? current.toFixed(decimals)
      : Math.round(current).toLocaleString('de-DE')
    ) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  })(start);
}

// ── Chart.js global defaults ─────────────────────────────────
Chart.defaults.font.family = "'Inter', ui-sans-serif, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#828282';
Chart.defaults.animation.duration = 500;

// ── Bar chart factory ────────────────────────────────────────
function makeBar(canvasId, labels, values, onClickCb) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: PALETTE,
        borderWidth: 0,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct   = total ? Math.round((ctx.raw / total) * 100) : 0;
              return `${ctx.raw.toLocaleString('de-DE')} Fälle (${pct}%)`;
            }
          }
        }
      },
      scales: {
        x: {
          grid:   { display: false },
          border: { display: false },
          ticks:  { color: '#828282' }
        },
        y: {
          beginAtZero: true,
          grid:   { color: '#e8e8e8' },
          border: { display: false },
          ticks: {
            color: '#828282',
            callback: v => v.toLocaleString('de-DE')
          }
        }
      },
      onClick: onClickCb
        ? (evt, els) => { if (els.length) onClickCb(els[0].index, labels, values); }
        : undefined
    }
  });
}

// ── Donut chart factory ──────────────────────────────────────
function makeDonut(canvasId, labels, values, onClickCb) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  return new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: PALETTE,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      cutout: '72%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 14,
            usePointStyle: true,
            pointStyleWidth: 8,
            font: { size: 12 }
          }
        },
        tooltip: {
          callbacks: {
            label(ctx) {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct   = total ? Math.round((ctx.raw / total) * 100) : 0;
              return `${ctx.label}: ${ctx.raw.toLocaleString('de-DE')} (${pct}%)`;
            }
          }
        }
      },
      onClick: onClickCb
        ? (evt, els) => { if (els.length) onClickCb(els[0].index, labels, values); }
        : undefined
    }
  });
}

// ── KPI tiles (Chapter 2 — static, full data) ────────────────
function renderKPIs(data) {
  const total    = data.length;
  const avg      = data.reduce((s, d) => s + d.influence, 0) / total;
  const positive = data.filter(d => d.militaryView === 'Sehr positiv' || d.militaryView === 'Eher positiv').length;
  const critical = data.filter(d => d.bundeswehrGame === 'Eher kritisch' || d.bundeswehrGame === 'Sehr kritisch').length;

  animateValue(document.getElementById('kpi-total'),    total,                              0);
  animateValue(document.getElementById('kpi-avg'),      avg,                                1);
  animateValue(document.getElementById('kpi-positive'), Math.round(positive / total * 100), 0, '%');
  animateValue(document.getElementById('kpi-critical'), Math.round(critical / total * 100), 0, '%');
}

// ── Narrative charts + callouts (Chapters 3–6, full data) ────
function renderNarrativeCharts(data) {
  const freqCounts = countValues(data, 'frequency',     FREQUENCIES);
  const milCounts  = countValues(data, 'militaryView',  MIL_VIEWS);
  const infCounts  = countValues(data, 'influence',     INF_VALUES);
  const bwCounts   = countValues(data, 'bundeswehrGame',BW_VIEWS);

  makeBar  ('narrative-frequency', FREQUENCIES,              freqCounts);
  makeDonut('narrative-military',  MIL_VIEWS,                milCounts);
  makeBar  ('narrative-influence', INF_VALUES.map(String),   infCounts);
  makeDonut('narrative-bundeswehr',BW_VIEWS,                 bwCounts);

  // Callout: Spielhäufigkeit
  const activePct = Math.round((freqCounts[2] + freqCounts[3] + freqCounts[4]) / data.length * 100);
  document.getElementById('callout-frequency').innerHTML =
    `<strong>${activePct} % der Befragten</strong> spielen gelegentlich bis sehr häufig — ` +
    `Militärspiele sind für die überwiegende Mehrheit ein regulärer Teil des medialen Alltags.`;

  // Callout: Soldatenbild
  const posMil     = Math.round((milCounts[0] + milCounts[1]) / data.length * 100);
  const neutralMil = Math.round( milCounts[2]                 / data.length * 100);
  document.getElementById('callout-military').innerHTML =
    `<strong>Befund:</strong> ${neutralMil} % antworten neutral, ${posMil} % haben ` +
    `ein positives Soldatenbild. Weder Glorifizierung noch klare Ablehnung dominiert — ` +
    `die Befragten zeigen eine differenzierte, mediensozialisierte Haltung.`;

  // Callout: Gesellschaftlicher Einfluss
  const highInfPct = Math.round((infCounts[3] + infCounts[4]) / data.length * 100);
  const avgInf     = (data.reduce((s, d) => s + d.influence, 0) / data.length).toFixed(1);
  document.getElementById('callout-influence').innerHTML =
    `<strong>${highInfPct} %</strong> vergeben einen Wert von 4 oder 5. ` +
    `Der Durchschnittswert liegt bei <strong>${avgInf} / 5</strong> — ` +
    `ein klares Votum für die gesellschaftliche Relevanz medialer Framingprozesse.`;

  // Callout: Bundeswehr-Spiel
  const critBW = Math.round((bwCounts[3] + bwCounts[4]) / data.length * 100);
  const posBW  = Math.round((bwCounts[0] + bwCounts[1]) / data.length * 100);
  document.getElementById('callout-bundeswehr').innerHTML =
    `<strong>${critBW} % der Befragten</strong> stehen einem Bundeswehr-Spiel ` +
    `eher oder sehr kritisch gegenüber — nur ${posBW} % befürworten die Idee. ` +
    `Staatliches Imagemanagement via Gaming stößt auf breite gesellschaftliche Skepsis.`;
}

// ── Detail panel handler (Chapter 7 only) ───────────────────
function handleDetailClick(index, labels, values) {
  const label = labels[index];
  const value = values[index];
  const total = values.reduce((a, b) => a + b, 0);
  const pct   = total ? Math.round((value / total) * 100) : 0;

  let note = '';
  if      (pct >= 50) note = 'Diese Kategorie dominiert die aktuelle Auswahl deutlich.';
  else if (pct >= 30) note = 'Diese Kategorie ist stark vertreten.';
  else if (pct >= 15) note = 'Diese Kategorie ist sichtbar, aber nicht dominant.';
  else                note = 'Diese Kategorie spielt eine kleinere Rolle in der Auswahl.';

  document.getElementById('detail-panel').innerHTML = `
    <p class="detail-panel__heading">${label}</p>
    <p class="detail-panel__text">${note}</p>
    <div class="detail-grid">
      <div class="detail-metric">
        <span class="detail-metric__label">Anzahl</span>
        <span class="detail-metric__value">${value.toLocaleString('de-DE')}</span>
      </div>
      <div class="detail-metric">
        <span class="detail-metric__label">Anteil</span>
        <span class="detail-metric__value">${pct} %</span>
      </div>
      <div class="detail-metric">
        <span class="detail-metric__label">Gesamt</span>
        <span class="detail-metric__value">${total.toLocaleString('de-DE')}</span>
      </div>
    </div>
  `;
}

// ── Interactive charts (Chapter 7, filtered) ─────────────────
let ixCharts = { freq: null, mil: null, inf: null, bw: null };

function renderInteractiveCharts(data) {
  Object.values(ixCharts).forEach(c => c && c.destroy());

  const freqCounts = countValues(data, 'frequency',     FREQUENCIES);
  const milCounts  = countValues(data, 'militaryView',  MIL_VIEWS);
  const infCounts  = countValues(data, 'influence',     INF_VALUES);
  const bwCounts   = countValues(data, 'bundeswehrGame',BW_VIEWS);

  ixCharts.freq = makeBar  ('ix-frequency', FREQUENCIES,            freqCounts, handleDetailClick);
  ixCharts.mil  = makeDonut('ix-military',  MIL_VIEWS,              milCounts,  handleDetailClick);
  ixCharts.inf  = makeBar  ('ix-influence', INF_VALUES.map(String), infCounts,  handleDetailClick);
  ixCharts.bw   = makeDonut('ix-bundeswehr',BW_VIEWS,               bwCounts,   handleDetailClick);
}

// ── Dynamic interpretation (Chapter 7) ──────────────────────
function updateInterpretation(data) {
  const el = document.getElementById('interpretation-text');
  if (!data.length) {
    el.innerHTML = 'Für diese Filterauswahl liegen keine Daten vor.';
    return;
  }
  const avg     = (data.reduce((s, d) => s + d.influence, 0) / data.length).toFixed(1);
  const critPct = Math.round(
    data.filter(d => d.bundeswehrGame === 'Eher kritisch' || d.bundeswehrGame === 'Sehr kritisch').length
    / data.length * 100
  );
  el.innerHTML =
    `<strong>${data.length.toLocaleString('de-DE')} Befragte</strong> in dieser Auswahl — ` +
    `durchschnittlicher wahrgenommener Einfluss: <strong>${avg} / 5</strong>. ` +
    `${critPct} % stehen einem Bundeswehr-Spiel kritisch gegenüber.`;
}

// ── Filter helper ────────────────────────────────────────────
function getFilteredData() {
  const freq = document.getElementById('filter-frequency').value;
  const age  = document.getElementById('filter-age').value;
  const game = document.getElementById('filter-game').value;
  return surveyData.filter(d =>
    (freq === 'all' || d.frequency === freq) &&
    (age  === 'all' || d.ageGroup  === age)  &&
    (game === 'all' || d.game      === game)
  );
}

function updateInteractiveSection() {
  const filtered = getFilteredData();
  renderInteractiveCharts(filtered);
  updateInterpretation(filtered);
}

// ── Open answers (Chapter 8, search only) ───────────────────
function renderAnswers(term = '') {
  const container = document.getElementById('open-answers-container');
  const q = term.toLowerCase();

  const results = surveyData
    .filter(d => !q || d.openAnswer.toLowerCase().includes(q))
    .slice(0, 30);

  if (!results.length) {
    container.innerHTML =
      `<p style="color:var(--text-3);font-size:15px;padding:12px 0;">Keine Treffer für diese Suche.</p>`;
    return;
  }

  container.innerHTML = results.map(d => `
    <div class="answer-card">
      <p class="answer-card__quote">${d.openAnswer}</p>
      <div class="answer-card__meta">
        <span>Alter: ${d.ageGroup}</span>
        <span>Häufigkeit: ${d.frequency}</span>
        <span>Spiel: ${d.game}</span>
      </div>
    </div>
  `).join('');
}

// ── CSV export ────────────────────────────────────────────────
function exportCsv() {
  const data = getFilteredData();
  let csv = 'Altersgruppe,Spielhäufigkeit,Spiel,Soldatenbild,Einfluss,Bundeswehr-Spiel,Offene Antwort\n';
  data.forEach(d => {
    csv += `"${d.ageGroup}","${d.frequency}","${d.game}","${d.militaryView}","${d.influence}","${d.bundeswehrGame}","${d.openAnswer}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'gaming-defense-umfrage.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Dark mode toggle ─────────────────────────────────────────
document.getElementById('themeToggle').addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    document.getElementById('themeIcon').textContent  = '🌙';
    document.getElementById('themeLabel').textContent = 'Dark Mode';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('themeIcon').textContent  = '☀️';
    document.getElementById('themeLabel').textContent = 'Light Mode';
  }
});

// ── Filter events ────────────────────────────────────────────
['filter-frequency', 'filter-age', 'filter-game'].forEach(id => {
  document.getElementById(id).addEventListener('change', updateInteractiveSection);
});

document.getElementById('reset-filters').addEventListener('click', () => {
  document.getElementById('filter-frequency').value = 'all';
  document.getElementById('filter-age').value       = 'all';
  document.getElementById('filter-game').value      = 'all';
  document.getElementById('detail-panel').innerHTML = `
    <p class="detail-panel__heading">Noch keine Kategorie ausgewählt</p>
    <p class="detail-panel__text">
      Klicke auf einen Balken oder ein Segment in einem der Diagramme,
      um eine genauere Analyse einzublenden.
    </p>
  `;
  updateInteractiveSection();
});

document.getElementById('export-csv').addEventListener('click', exportCsv);

document.getElementById('search-answers').addEventListener('input', e => {
  renderAnswers(e.target.value);
});

// ── Scroll-spy nav (Intersection Observer) ───────────────────
function initNavObserver() {
  const chapters = document.querySelectorAll('.story-chapter');
  const links    = document.querySelectorAll('.nav-pill__link');

  if (!chapters.length || !links.length) return;

  // Trigger zone: below the sticky nav pill, upper half of viewport
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { rootMargin: '-80px 0px -50% 0px', threshold: 0 });

  chapters.forEach(ch => observer.observe(ch));
}

// ── Init ─────────────────────────────────────────────────────
const surveyData = generateData();

renderKPIs(surveyData);
renderNarrativeCharts(surveyData);
renderInteractiveCharts(surveyData);
updateInterpretation(surveyData);
renderAnswers();
initNavObserver();
