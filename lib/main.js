(function() {
  const YEAR_START = 2025;
  const YEAR_END = 2006;
  const PASSING_GRADE = 4.75;
  const DEFAULT_GENERAL_MAX_POINTS = 36;
  const MAX_POINTS = {
    mathematik: 36,
    deutsch: 48,
    'deutsch-aufsatz': 20
  };
  const EXAM_FILES = [
    { suffix: 'mathematik_aufgaben_lg', zipName: 'mathematik_aufgaben.pdf' },
    { suffix: 'mathematik_loesungen_lg', zipName: 'mathematik_loesungen.pdf' },
    { suffix: 'textblatt_lg', zipName: 'textblatt.pdf' },
    { suffix: 'sprachpruefung_aufgaben_lg', zipName: 'sprachpruefung.pdf' },
    { suffix: 'aufsatzthemen_lg', zipName: 'aufsatzthemen.pdf' },
    { suffix: 'sprachpruefung_loesungen_lg', zipName: 'sprachpruefung_loesungen.pdf' }
  ];
  const NOTE_MAPPING = {
    mathematik: [
      { min: 0, max: 0, note: 1 },
      { min: 1, max: 2, note: 1.25 },
      { min: 3, max: 3, note: 1.5 },
      { min: 4, max: 5, note: 1.75 },
      { min: 6, max: 7, note: 2 },
      { min: 8, max: 8, note: 2.25 },
      { min: 9, max: 10, note: 2.5 },
      { min: 11, max: 11, note: 2.75 },
      { min: 12, max: 13, note: 3 },
      { min: 14, max: 15, note: 3.25 },
      { min: 16, max: 16, note: 3.5 },
      { min: 17, max: 18, note: 3.75 },
      { min: 19, max: 19, note: 4 },
      { min: 20, max: 21, note: 4.25 },
      { min: 22, max: 23, note: 4.5 },
      { min: 24, max: 24, note: 4.75 },
      { min: 25, max: 26, note: 5 },
      { min: 27, max: 27, note: 5.25 },
      { min: 28, max: 29, note: 5.5 },
      { min: 30, max: 31, note: 5.75 },
      { min: 32, max: 36, note: 6 }
    ],
    deutsch: [
      { min: 0, max: 2, note: 1 },
      { min: 3, max: 4, note: 1.25 },
      { min: 5, max: 6, note: 1.5 },
      { min: 7, max: 8, note: 1.75 },
      { min: 9, max: 10, note: 2 },
      { min: 11, max: 11, note: 2.25 },
      { min: 12, max: 13, note: 2.5 },
      { min: 14, max: 15, note: 2.75 },
      { min: 16, max: 17, note: 3 },
      { min: 18, max: 19, note: 3.25 },
      { min: 20, max: 20, note: 3.5 },
      { min: 21, max: 22, note: 3.75 },
      { min: 23, max: 24, note: 4 },
      { min: 25, max: 26, note: 4.25 },
      { min: 27, max: 28, note: 4.5 },
      { min: 29, max: 29, note: 4.75 },
      { min: 30, max: 31, note: 5 },
      { min: 32, max: 33, note: 5.25 },
      { min: 34, max: 35, note: 5.5 },
      { min: 36, max: 37, note: 5.75 },
      { min: 38, max: 48, note: 6 }
    ]
  };

  let notenskalaChart;

  function translate(key, options) {
    const i18n = window.i18nextify && window.i18nextify.i18next;
    if (!i18n) {
      return key.replace(/\{\{\s*(\w+)\s*\}\}/g, function(match, token) {
        return options && token in options ? options[token] : match;
      });
    }
    return i18n.t(key, options);
  }

  function getCssVariable(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function getYears() {
    const years = [];
    for (let year = YEAR_START; year >= YEAR_END; year -= 1) {
      years.push(year);
    }
    return years;
  }

  function getStatusElement() {
    return document.getElementById('download-status');
  }

  function setStatus(message, type) {
    const statusElement = getStatusElement();
    if (!statusElement) return;

    statusElement.textContent = message || '';
    statusElement.className = type ? 'download-status is-' + type : 'download-status';
  }

  function clearStatus() {
    setStatus('');
  }

  function initializeButtonLabel(button, label) {
    if (!button) return;

    button.dataset.defaultLabel = label;
    const labelElement = button.querySelector('[data-button-label]');
    if (labelElement && !button.classList.contains('is-loading')) {
      labelElement.textContent = label;
    }
  }

  function setButtonLoading(button, isLoading) {
    if (!button) return;

    const labelElement = button.querySelector('[data-button-label]');
    const label = isLoading ? translate('Wird heruntergeladen...') : button.dataset.defaultLabel;

    button.disabled = isLoading;
    button.classList.toggle('is-loading', isLoading);
    button.setAttribute('aria-busy', isLoading ? 'true' : 'false');

    if (labelElement && label) {
      labelElement.textContent = label;
    }
  }

  function downloadBlob(filename, content, type) {
    const blob = typeof content === 'string' ? new Blob([content], { type: type || 'application/octet-stream' }) : content;
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);

    link.style.display = 'none';
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  async function fetchFile(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch ' + url + ' (' + response.status + ')');
    }

    return response.blob();
  }

  async function download(url, name) {
    const filename = name || url.split('/').pop();

    try {
      const blob = await fetchFile(url);
      const type = url.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream';
      downloadBlob(filename, blob, type);
      clearStatus();
    } catch (error) {
      console.error('Download failed:', error);
      setStatus(translate('Download fehlgeschlagen: {{name}}', { name: filename }), 'error');
    }
  }

  async function addYearFilesToZip(year, zipTarget) {
    await Promise.all(
      EXAM_FILES.map(async function(file) {
        const url = 'archiv/' + year + '/' + year + '_' + file.suffix + '.pdf';
        const blob = await fetchFile(url);
        zipTarget.file(file.zipName, blob);
      })
    );
  }

  async function downloadYearAsZip(year, button) {
    setButtonLoading(button, true);
    setStatus(translate('Wird heruntergeladen...'));

    try {
      const zip = new JSZip();
      await addYearFilesToZip(year, zip);
      const content = await zip.generateAsync({ type: 'blob' });
      downloadBlob(year + '.zip', content, 'application/zip');
      clearStatus();
    } catch (error) {
      console.error('ZIP download failed for ' + year + ':', error);
      setStatus(translate('Download fehlgeschlagen für {{year}}.', { year: year }), 'error');
    } finally {
      setButtonLoading(button, false);
    }
  }

  async function downloadAllYearsAsZip(button) {
    setButtonLoading(button, true);
    setStatus(translate('Wird heruntergeladen...'));

    try {
      const zip = new JSZip();

      await Promise.all(
        getYears().map(async function(year) {
          const folder = zip.folder(String(year));
          await addYearFilesToZip(year, folder);
        })
      );

      const content = await zip.generateAsync({ type: 'blob' });
      downloadBlob(YEAR_END + '-' + YEAR_START + '.zip', content, 'application/zip');
      clearStatus();
    } catch (error) {
      console.error('Download all failed:', error);
      setStatus(translate('Download fehlgeschlagen.'), 'error');
    } finally {
      setButtonLoading(button, false);
    }
  }

  function createIconElement(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');

    svg.classList.add('icon');
    use.setAttribute('href', '#icon-' + (name || 'download'));
    svg.appendChild(use);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');

    return svg;
  }

  function createDownloadButton(label, handler, classes) {
    const button = document.createElement('button');
    const labelElement = document.createElement('span');

    button.type = 'button';
    button.className = ['download-link'].concat(classes || []).join(' ');
    button.appendChild(createIconElement());

    labelElement.setAttribute('data-button-label', '');
    labelElement.textContent = label;
    button.appendChild(labelElement);
    initializeButtonLabel(button, label);
    button.addEventListener('click', handler);

    return button;
  }

  function createDownloadElement(year, filenameSuffix, title) {
    const listItem = document.createElement('li');
    const url = 'archiv/' + year + '/' + year + '_' + filenameSuffix + '.pdf';
    const button = createDownloadButton(translate(title), function() {
      download(url);
    }, ['download-item']);

    listItem.appendChild(button);
    return listItem;
  }

  function createSectionTitle(text) {
    const title = document.createElement('h4');
    title.textContent = translate(text);
    return title;
  }

  function createYearCard(year) {
    const card = document.createElement('div');
    const header = document.createElement('div');
    const title = document.createElement('h3');
    const zipButtonLabel = translate('ZIP herunterladen');
    const zipButton = createDownloadButton(zipButtonLabel, function() {
      downloadYearAsZip(year, zipButton);
    }, ['card-zip-btn']);
    const documentsList = document.createElement('ul');
    const solutionsList = document.createElement('ul');

    card.className = 'card';
    header.className = 'card-header';

    title.textContent = year;
    header.appendChild(title);
    header.appendChild(zipButton);
    card.appendChild(header);

    card.appendChild(createSectionTitle('Prüfungsunterlagen:'));
    documentsList.appendChild(createDownloadElement(year, 'mathematik_aufgaben_lg', 'Mathematik Aufgaben'));
    documentsList.appendChild(createDownloadElement(year, 'textblatt_lg', 'Sprachprüfung Textblatt'));
    documentsList.appendChild(createDownloadElement(year, 'sprachpruefung_aufgaben_lg', 'Sprachprüfung Aufgaben'));
    documentsList.appendChild(createDownloadElement(year, 'aufsatzthemen_lg', 'Aufsatzthemen'));
    card.appendChild(documentsList);

    card.appendChild(createSectionTitle('Lösungen:'));
    solutionsList.appendChild(createDownloadElement(year, 'mathematik_loesungen_lg', 'Mathematik Lösungen'));
    solutionsList.appendChild(createDownloadElement(year, 'sprachpruefung_loesungen_lg', 'Sprachprüfung Lösungen'));
    card.appendChild(solutionsList);

    return card;
  }

  function renderYearCards() {
    const grid = document.getElementById('pruefungs-grid');
    if (!grid) return;

    grid.replaceChildren();
    getYears().forEach(function(year) {
      grid.appendChild(createYearCard(year));
    });
  }

  function updateDynamicYears() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const learnYear = currentMonth < 3 ? currentYear : currentYear + 1;
    const footerYear = document.getElementById('footer-year');
    const learnYearElement = document.getElementById('learn-year');
    const rangeYearsElement = document.getElementById('range-years');

    if (footerYear) {
      footerYear.textContent = currentYear;
    }

    if (learnYearElement) {
      learnYearElement.setAttribute('i18next-options', JSON.stringify({ year: String(learnYear) }));
    }

    if (rangeYearsElement) {
      rangeYearsElement.setAttribute('i18next-options', JSON.stringify({ fromYear: String(YEAR_END), toYear: String(YEAR_START) }));
    }
  }

  function toggleTable(button) {
    const table = document.getElementById(button.dataset.toggle);
    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    if (!table) return;

    button.setAttribute('aria-expanded', String(!isExpanded));
    table.hidden = isExpanded;
  }

  function bindCollapsibles() {
    document.querySelectorAll('.collapsible-toggle').forEach(function(button) {
      button.addEventListener('click', function() {
        toggleTable(button);
      });
    });
  }

  function getCalculatedNoteElement(subject) {
    return document.getElementById('calculated-note-' + subject);
  }

  function renderCalculatedNote(subject, message, isError) {
    const calculatedNote = getCalculatedNoteElement(subject);
    if (!calculatedNote) return;

    calculatedNote.textContent = message;
    calculatedNote.classList.toggle('is-error', Boolean(isError));
    calculatedNote.classList.toggle('is-success', !isError && Boolean(message));
  }

  function getInvalidPointsMessage(max) {
    return translate('Punkte nicht gültig. Bitte gib eine Punktezahl zwischen 0 und {{max}} an.', { max: max });
  }

  function calculateGrade(points, maxPoints) {
    return 1 + (points * 5) / maxPoints;
  }

  function findMappedNote(subject, points) {
    const ranges = NOTE_MAPPING[subject];
    if (!ranges) return NaN;

    const result = ranges.find(function(range) {
      return points >= range.min && points <= range.max;
    });

    return result ? result.note : NaN;
  }

  function formatCalculatedNote(note, fixedDigits) {
    const formatted = typeof fixedDigits === 'number' ? note.toFixed(fixedDigits) : String(note);
    return translate('Note') + ': ' + formatted;
  }

  function calculateNote(subject) {
    const input = document.getElementById('points-input-' + subject);
    const maxPoints = MAX_POINTS[subject];
    const points = Number.parseInt(input.value, 10);

    if (!Number.isFinite(points) || points < 0 || points > maxPoints) {
      renderCalculatedNote(subject, getInvalidPointsMessage(maxPoints), true);
      return;
    }

    const mappedNote = findMappedNote(subject, points);
    const note = Number.isFinite(mappedNote) ? mappedNote : calculateGrade(points, maxPoints);

    if (!Number.isFinite(note)) {
      renderCalculatedNote(subject, getInvalidPointsMessage(maxPoints), true);
      return;
    }

    renderCalculatedNote(subject, formatCalculatedNote(note), false);
  }

  function calculateGeneralNote() {
    const points = Number.parseInt(document.getElementById('points-input-generell').value, 10);
    const enteredMaxPoints = Number.parseInt(document.getElementById('points-input-generell-max').value, 10);
    const maxPoints = Number.isFinite(enteredMaxPoints) ? enteredMaxPoints : DEFAULT_GENERAL_MAX_POINTS;

    if (!Number.isFinite(points) || !Number.isFinite(maxPoints) || maxPoints <= 0 || points < 0 || points > maxPoints) {
      renderCalculatedNote('generell', getInvalidPointsMessage(maxPoints), true);
      return;
    }

    renderCalculatedNote('generell', formatCalculatedNote(calculateGrade(points, maxPoints), 2), false);
  }

  function readGradeValue(id) {
    const value = Number.parseFloat(document.getElementById(id).value);
    return Number.isFinite(value) ? value : 0;
  }

  function calculateGesamtNote() {
    const mathTest = readGradeValue('mathTest');
    const mathReport = readGradeValue('mathReport');
    const germanEssay = readGradeValue('germanEssay');
    const germanTest = readGradeValue('germanTest');
    const germanReport = readGradeValue('germanReport');
    const mathAvg = Number.parseFloat(((mathTest + mathReport) / 2).toFixed(3));
    const germanAvgP = Number.parseFloat(((germanEssay + germanTest) / 2).toFixed(3));
    const germanAvg = Number.parseFloat(((germanAvgP + germanReport) / 2).toFixed(3));
    const finalGrade = Number.parseFloat(((mathAvg + germanAvg) / 2).toFixed(2));
    const resultElement = document.getElementById('result');
    const passed = finalGrade >= PASSING_GRADE;

    document.getElementById('mathAvg').textContent = mathAvg;
    document.getElementById('germanAvgP').textContent = germanAvgP;
    document.getElementById('germanAvg').textContent = germanAvg;
    document.getElementById('finalGrade').textContent = finalGrade;

    resultElement.textContent = passed ? translate('bestanden') : translate('nichtBestanden');
    resultElement.classList.toggle('is-pass', passed);
    resultElement.classList.toggle('is-fail', !passed);
  }

  function createTableRow(item) {
    const row = document.createElement('tr');
    [item.min, item.max, item.note].forEach(function(value) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });
    return row;
  }

  function populateTable(tableId, data) {
    const tableBody = document.getElementById(tableId);
    if (!tableBody) return;

    tableBody.replaceChildren.apply(tableBody, data.map(createTableRow));
  }

  function createGradeSeries(subject, maxPoints) {
    return Array.from({ length: maxPoints + 1 }, function(_, point) {
      return findMappedNote(subject, point);
    });
  }

  function buildChart() {
    const canvas = document.getElementById('notenskalaChart');
    if (!canvas) return;

    const primary = getCssVariable('--color-primary', '#4A90E2');
    const primaryRgb = getCssVariable('--color-primary-rgb', '74, 144, 226');
    const accent = getCssVariable('--color-accent', '#FF7A59');
    const accentRgb = getCssVariable('--color-accent-rgb', '255, 122, 89');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const labels = Array.from({ length: MAX_POINTS.deutsch + 1 }, function(_, point) {
      return point;
    });
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: translate('Deutsch'),
          data: createGradeSeries('deutsch', MAX_POINTS.deutsch),
          borderColor: primary,
          backgroundColor: 'rgba(' + primaryRgb + ', 0.12)',
          fill: true
        },
        {
          label: translate('Mathematik'),
          data: labels.map(function(point) {
            return point <= MAX_POINTS.mathematik ? findMappedNote('mathematik', point) : null;
          }),
          borderColor: accent,
          backgroundColor: 'rgba(' + accentRgb + ', 0.12)',
          fill: true,
          spanGaps: false
        }
      ]
    };

    if (notenskalaChart) {
      notenskalaChart.destroy();
    }

    notenskalaChart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        animation: reducedMotion ? false : undefined,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.raw + ' (' + context.dataset.label + ')';
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: translate('Punkte')
            }
          },
          y: {
            title: {
              display: true,
              text: translate('Note')
            },
            ticks: {
              reverse: true
            }
          }
        }
      }
    });
  }

  function bindCalculatorButtons() {
    document.querySelectorAll('[data-calculate]').forEach(function(button) {
      button.addEventListener('click', function() {
        calculateNote(button.dataset.calculate);
      });
    });

    document.getElementById('calculateGenerellBtn').addEventListener('click', calculateGeneralNote);
    document.getElementById('calculateGesamtBtn').addEventListener('click', calculateGesamtNote);
  }

  function bindDownloadAllButton() {
    const downloadAllButton = document.getElementById('downloadAll');
    if (!downloadAllButton) return;

    initializeButtonLabel(downloadAllButton, translate('Alles herunterladen'));
    downloadAllButton.addEventListener('click', function() {
      downloadAllYearsAsZip(downloadAllButton);
    });
  }

  function renderReferenceData() {
    populateTable('notenskala-mathematik', NOTE_MAPPING.mathematik);
    populateTable('notenskala-deutsch', NOTE_MAPPING.deutsch);
    buildChart();
  }

  function handleLanguageChanged() {
    initializeButtonLabel(document.getElementById('downloadAll'), translate('Alles herunterladen'));
    renderYearCards();
    renderReferenceData();
    clearStatus();
  }

  function init() {
    updateDynamicYears();
    renderYearCards();
    bindDownloadAllButton();
    bindCollapsibles();
    bindCalculatorButtons();
    renderReferenceData();

    if (window.i18nextify && window.i18nextify.i18next) {
      window.i18nextify.i18next.on('languageChanged', handleLanguageChanged);
    }
  }

  init();
})();