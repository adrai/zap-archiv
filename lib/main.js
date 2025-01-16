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
  var yearEnd = 2007;
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