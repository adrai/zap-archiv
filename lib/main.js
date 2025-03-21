(function() {
  function downloadBlob(filename, str, type = 'octet/stream') {
    var blob = typeof str === 'string' ? new Blob([str], { type }) : str;
  
    if (window.navigator.msSaveOrOpenBlob) {
      // IE 11+
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else if (window.navigator.userAgent.match('CriOS')) {
      // Chrome iOS
      var reader = new FileReader();
      reader.onloadend = function () {
        window.open(reader.result);
      };
      reader.readAsDataURL(blob);
    } else if (
      window.navigator.userAgent.match(/iPad/i) ||
      window.navigator.userAgent.match(/iPhone/i)
    ) {
      // Safari & Opera iOS
      var url = window.URL.createObjectURL(blob);
      window.location.href = url;
    } else {
      var a = document.createElement('a');
      a.style.display = 'none';
      document.body.appendChild(a);
  
      var url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }

  function fetchFile(url) {
    return fetch(url).then(function(res) {
      return res.blob();
    })
  }

  function download(url, name) {
    if (!name) name = url.split('/').pop();
    fetchFile(url).then(function(blob) {
      let type 
      if (url.indexOf('.pdf') > 0) type = 'application/pdf';
      return downloadBlob(name, blob, type);
    })
  }

  function createIconElement() {
    var i = document.createElement('i');
    i.className = 'fas fa-file-download';
    return i;
  }

  function createDownloadElement(year, fnameSuffix, title) {
    var li = document.createElement('li');
    li.addEventListener('click', function() {
      download('archiv/' + year + '/' + year + '_' + fnameSuffix + '.pdf');
    });
    var span = document.createElement('span');
    span.className = 'download-link';
    span.appendChild(createIconElement());
    span.appendChild(document.createTextNode(' ' + title));
    li.appendChild(span);
    return li;
  }

  function downloadZip(zip, year) {
    zip.generateAsync({ type: 'blob' }).then(function(content) {
      downloadBlob(year + '.zip', content, 'application/zip');
    });
  }

  function addYearCard(year) {
    var div = document.createElement('div');
    div.className = 'card';
    var h3 = document.createElement('h3');
    h3.textContent = year;
    h3.setAttribute('translated', '');
    
    var span = document.createElement('span');
    span.className = 'download-link';
    span.appendChild(createIconElement());
    span.style.float = 'right';
    span.addEventListener('click', function() {
      var toDownload = 6;
      var zip = new JSZip();

      fetchFile('archiv/' + year + '/' + year + '_mathematik_aufgaben_lg.pdf').then(function(blob) {
        zip.file('mathematik_aufgaben.pdf', blob);
        toDownload--;
        if (toDownload === 0) downloadZip(zip, year);
      });
      fetchFile('archiv/' + year + '/' + year + '_mathematik_loesungen_lg.pdf').then(function(blob) {
        zip.file('mathematik_loesungen.pdf', blob);
        toDownload--;
        if (toDownload === 0) downloadZip(zip, year);
      });
      fetchFile('archiv/' + year + '/' + year + '_textblatt_lg.pdf').then(function(blob) {
        zip.file('textblatt.pdf', blob);
        toDownload--;
        if (toDownload === 0) downloadZip(zip, year);
      });
      fetchFile('archiv/' + year + '/' + year + '_sprachpruefung_aufgaben_lg.pdf').then(function(blob) {
        zip.file('sprachpruefung.pdf', blob);
        toDownload--;
        if (toDownload === 0) downloadZip(zip, year);
      });
      fetchFile('archiv/' + year + '/' + year + '_aufsatzthemen_lg.pdf').then(function(blob) {
        zip.file('aufsatzthemen.pdf', blob);
        toDownload--;
        if (toDownload === 0) downloadZip(zip, year);
      });
      fetchFile('archiv/' + year + '/' + year + '_sprachpruefung_loesungen_lg.pdf').then(function(blob) {
        zip.file('sprachpruefung_loesungen.pdf', blob);
        toDownload--;
        if (toDownload === 0) downloadZip(zip, year);
      });
    });
    h3.appendChild(span);
    
    div.appendChild(h3);

    // Prüfungsunterlagen
    var h4P = document.createElement('h4');
    h4P.textContent = 'Prüfungsunterlagen:';
    div.appendChild(h4P);
    var ulP = document.createElement('ul');
    
    ulP.append(createDownloadElement(year, 'mathematik_aufgaben_lg', 'Mathematik Aufgaben'));
    ulP.append(createDownloadElement(year, 'textblatt_lg', 'Sprachprüfung Textblatt'));
    ulP.append(createDownloadElement(year, 'sprachpruefung_aufgaben_lg', 'Sprachprüfung Aufgaben'));
    ulP.append(createDownloadElement(year, 'aufsatzthemen_lg', 'Aufsatzthemen'));

    div.appendChild(ulP);

    // Lösungen
    var h4L = document.createElement('h4');
    h4L.textContent = 'Lösungen:';
    div.appendChild(h4L);
    var ulL = document.createElement('ul');

    ulL.append(createDownloadElement(year, 'mathematik_loesungen_lg', 'Mathematik Lösungen'));
    ulL.append(createDownloadElement(year, 'sprachpruefung_loesungen_lg', 'Sprachprüfung Lösungen'));

    div.appendChild(ulL);

    document.getElementById('pruefungs-grid').appendChild(div);
  }

  var yearStart = 2024;
  var yearEnd = 2006;
  for (var i = yearStart; i >= yearEnd; i--) {
    addYearCard(i);
  }

  document.getElementById('downloadAll').addEventListener('click', function() {
    var toDownload = (yearStart - yearEnd + 1) * 6;
    var zip = new JSZip();

    function downloadYear(year, folder) {
      fetchFile('archiv/' + year + '/' + year + '_mathematik_aufgaben_lg.pdf').then(function(blob) {
        folder.file('mathematik_aufgaben.pdf', blob);
        toDownload--;
        if (toDownload === 0) downloadZip(zip, yearEnd + '-' + yearStart);
      });
      fetchFile('archiv/' + year + '/' + year + '_mathematik_loesungen_lg.pdf').then(function(blob) {
        folder.file('mathematik_loesungen.pdf', blob);
        toDownload--;
        if (toDownload === 0) downloadZip(zip, yearEnd + '-' + yearStart);
      });
      fetchFile('archiv/' + year + '/' + year + '_textblatt_lg.pdf').then(function(blob) {
        folder.file('textblatt.pdf', blob);
        toDownload--;
        if (toDownload === 0) downloadZip(zip, yearEnd + '-' + yearStart);
      });
      fetchFile('archiv/' + year + '/' + year + '_sprachpruefung_aufgaben_lg.pdf').then(function(blob) {
        folder.file('sprachpruefung.pdf', blob);
        toDownload--;
        if (toDownload === 0) downloadZip(zip, yearEnd + '-' + yearStart);
      });
      fetchFile('archiv/' + year + '/' + year + '_aufsatzthemen_lg.pdf').then(function(blob) {
        folder.file('aufsatzthemen.pdf', blob);
        toDownload--;
        if (toDownload === 0) downloadZip(zip, yearEnd + '-' + yearStart);
      });
      fetchFile('archiv/' + year + '/' + year + '_sprachpruefung_loesungen_lg.pdf').then(function(blob) {
        folder.file('sprachpruefung_loesungen.pdf', blob);
        toDownload--;
        if (toDownload === 0) downloadZip(zip, yearEnd + '-' + yearStart);
      });
    }

    for (var year = yearStart; year >= yearEnd; year--) {
      var folder = zip.folder(year);
      downloadYear(year, folder);
    }
  });

  var currentDate = new Date();
  var currentYear = currentDate.getFullYear();
  document.getElementById('footer-year').textContent = currentYear;

  var currentMonth = currentDate.getMonth() + 1;
  document.getElementById('learn-year').setAttribute('i18next-options', '{"year": "' + (currentMonth < 3 ? currentYear : (currentYear + 1)) + '"}');
  document.getElementById('range-years').setAttribute('i18next-options', '{"fromYear": "' + yearEnd + '", "toYear": "' + yearStart + '"}');
})();

function toggleTable(tableId) {
  var table = document.getElementById(tableId);
  var title = table.previousElementSibling; // Get the corresponding <h3>

  if (table.style.display === 'none' || table.style.display === '') {
    table.style.display = 'table'; // Show the table
    title.classList.add('open'); // Rotate the arrow
  } else {
    table.style.display = 'none'; // Hide the table
    title.classList.remove('open'); // Reset the arrow
  }
}

var noteMapping = {
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

function calculateNote(what) {
  var maxPunkte = {
    mathematik: 36,
    deutsch: 48,
    'deutsch-aufsatz': 20
  };

  var punkte = parseInt(document.getElementById('punkteInput.' + what).value, 10);
  var max = maxPunkte[what];

  var noteMapping = noteMapping[what];

  var note;
  if (noteMapping) {
    var result = noteMapping.find(function(range) {
      return punkte >= range.min && punkte <= range.max;
    });
  
    note = result && result.note;
  } else {
    note = calculateGrade(punkte, max);
  }

  if (note) {
    document.getElementById(
      'calculatedNote.' + what
    ).innerText = 'Note: ' + (note || 'N/A');
  } else {
    document.getElementById('calculatedNote.' + what).innerText =
      'Punkte nicht gültig. Bitte gebe eine Punktezahl zwischen 0 und ' + max + ' an.';
  }
}

function calculateGrade(points, maxPoints) {
  if (points < 0) return 1;
  if (points > maxPoints) return 6;
  return 1 + (points * (6 - 1)) / maxPoints;
}

function calculateNoteGenerell() {
  var punkte = parseInt(document.getElementById('punkteInput.generell').value, 10);
  var maxPunkte = parseInt(document.getElementById('punkteInput.generellMax').value, 10) || 36;

  var note = calculateGrade(punkte, maxPunkte);

  if (note) {
    document.getElementById(
      'calculatedNote.generell'
    ).innerText = 'Note: ' + note.toFixed(2);
  } else {
    document.getElementById('calculatedNote.generell').innerText =
      'Punkte nicht gültig. Bitte gebe eine Punktezahl zwischen 0 und ' + maxPunkte + ' an.';
  }
}

function calculateGesamtNote() {
  var mathTest = parseFloat(document.getElementById('mathTest').value) || 0;
  var mathReport = parseFloat(document.getElementById('mathReport').value) || 0;
  var germanEssay = parseFloat(document.getElementById('germanEssay').value) || 0;
  var germanTest = parseFloat(document.getElementById('germanTest').value) || 0;
  var germanReport = parseFloat(document.getElementById('germanReport').value) || 0;
  
  var mathAvg = parseFloat(((mathTest + mathReport) / 2).toFixed(3));
  var germanAvgP = parseFloat(((germanEssay + germanTest) / 2).toFixed(3));
  
  document.getElementById('mathAvg').textContent = mathAvg;
  document.getElementById('germanAvgP').textContent = germanAvgP;

  var germanAvg = parseFloat(((germanAvgP + germanReport) / 2).toFixed(3));
  document.getElementById('germanAvg').textContent = germanAvg;

  var finalGrade = parseFloat(((mathAvg + germanAvg) / 2).toFixed(2));
  document.getElementById("finalGrade").textContent = finalGrade;

  var resultText;
  if (finalGrade >= 4.75) {
    resultText = window.i18nextify.i18next.t('bestanden');
    document.getElementById("result").style.color = 'green';
  } else {
    resultText = window.i18nextify.i18next.t('nichtBestanden');
    document.getElementById("result").style.color = 'red';
  }
  document.getElementById("result").textContent = resultText;
}


(function() {
  var ctx = document.getElementById('notenskalaChart').getContext('2d');

  var chartData = {
    labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48],
    datasets: [
      {
        label: 'Deutsch',
        data: [1, 1, 1.25, 1.25, 1.5, 1.5, 1.75, 1.75, 2, 2, 2.25, 2.5, 2.5, 2.75, 2.75, 3, 3, 3.25, 3.25, 3.5, 3.75, 3.75, 4, 4, 4.25, 4.25, 4.5, 4.5, 4.75, 4.75, 5, 5, 5.25, 5.25, 5.5, 5.5, 5.75, 5.75, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        fill: true
      },
      {
        label: 'Mathematik',
        data: [1, 1.25, 1.25, 1.5, 1.75, 1.75, 2, 2, 2.25, 2.5, 2.5, 2.75, 3, 3, 3.25, 3.25, 3.5, 3.75, 3.75, 4, 4.25, 4.25, 4.5, 4.5, 4.75, 5, 5, 5.25, 5.5, 5.5, 5.75, 5.75, 6, 6, 6, 6, 6],
        borderColor: '#FF7A59',
        backgroundColor: 'rgba(255, 122, 89, 0.1)',
        fill: true
      }
    ]
  };

  var chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.raw + ' (' + context.dataset.label + ')';
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Punkte'
        },
      },
      y: {
        title: {
          display: true,
          text: 'Note'
        },
        ticks: {
          reverse: true // Invert Y-axis for "Note" descending
        }
      }
    }
  };

  var notenskalaChart = new Chart(ctx, {
    type: 'line', // You can also try 'bar', 'scatter', etc.
    data: chartData,
    options: chartOptions
  });

  const tableM = document.getElementById("notenskala-mathematik");
  noteMapping.mathematik.forEach(function (item) {
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    td1.textContent = item.min;
    var td2 = document.createElement('td');
    td2.textContent = item.max;
    var td3 = document.createElement('td');
    td3.textContent = item.note;
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tableM.appendChild(tr);
  });
  const tableD = document.getElementById("notenskala-deutsch");
  noteMapping.deutsch.forEach(function (item) {
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    td1.textContent = item.min;
    var td2 = document.createElement('td');
    td2.textContent = item.max;
    var td3 = document.createElement('td');
    td3.textContent = item.note;
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tableD.appendChild(tr);
  });

  window.i18nextify.i18next.on('languageChanged', function() {
    notenskalaChart.options.scales.x.title.text = window.i18nextify.i18next.t('Punkte');
    notenskalaChart.options.scales.y.title.text = window.i18nextify.i18next.t('Note');
    notenskalaChart.data.datasets[0].label = window.i18nextify.i18next.t('Deutsch');
    notenskalaChart.data.datasets[1].label = window.i18nextify.i18next.t('Mathematik');
    notenskalaChart.update();
  });
})()