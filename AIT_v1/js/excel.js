/* ═══════════════════════════════════════════════════════════════
   AIT — excel.js  |  Template generation & parsing via SheetJS
   ═══════════════════════════════════════════════════════════════ */
AIT.Excel = (function(){

  /* ─── GENERATE TEMPLATE ─── */
  function generateTemplate(coeName, coeEmail){
    var rows = [
      ['AI MATURITY ASSESSMENT — CLIENT ONBOARDING TEMPLATE', ''],
      [''],
      ['COE MEMBER (Pre-filled — Do not edit)', ''],
      ['COE Member Name', coeName  || ''],
      ['COE Member Email', coeEmail || ''],
      [''],
      ['SECTION 1: COMPANY INFORMATION', ''],
      ['Company Name', ''],
      ['Company Type', '(Private / Public / Partnership / LLP / Joint Venture / Other)'],
      ['Sector', '(e.g. Banking, FinTech, Insurance, Payments, etc.)'],
      ['Products / Services', ''],
      ['Company Size', '(Small < 50 / Medium 50–250 / Large 250–1000 / XL 1000–5000 / MNC 5000+)'],
      [''],
      ['SECTION 2: COMPANY POINT OF CONTACT', ''],
      ['POC Name', ''],
      ['POC Phone', ''],
      ['POC Email', ''],
      ['POC Designation', ''],
      [''],
      ['SECTION 3: EVALUATOR 1 NOMINEES — Leadership (select 3 nominees)', ''],
      ['NOMINEE 1A', ''],
      ['  Name', ''],
      ['  Phone', ''],
      ['  Email', ''],
      ['  Designation', ''],
      ['  Business Vertical', ''],
      ['NOMINEE 1B', ''],
      ['  Name', ''],
      ['  Phone', ''],
      ['  Email', ''],
      ['  Designation', ''],
      ['  Business Vertical', ''],
      ['NOMINEE 1C', ''],
      ['  Name', ''],
      ['  Phone', ''],
      ['  Email', ''],
      ['  Designation', ''],
      ['  Business Vertical', ''],
      [''],
      ['SECTION 4: EVALUATOR 2 NOMINEES — Tech Lead / PM (select 3 nominees)', ''],
      ['Note: Please indicate if nominee reports to or directly works with Evaluator 1', ''],
      ['NOMINEE 2A', ''],
      ['  Name', ''],
      ['  Phone', ''],
      ['  Email', ''],
      ['  Designation', ''],
      ['  Business Vertical', ''],
      ['  Reports to / works directly with Evaluator 1?', '(Yes / No)'],
      ['NOMINEE 2B', ''],
      ['  Name', ''],
      ['  Phone', ''],
      ['  Email', ''],
      ['  Designation', ''],
      ['  Business Vertical', ''],
      ['  Reports to / works directly with Evaluator 1?', '(Yes / No)'],
      ['NOMINEE 2C', ''],
      ['  Name', ''],
      ['  Phone', ''],
      ['  Email', ''],
      ['  Designation', ''],
      ['  Business Vertical', ''],
      ['  Reports to / works directly with Evaluator 1?', '(Yes / No)'],
      [''],
      ['SECTION 5: EVALUATOR 3 NOMINEES — Independent Evaluator (select 3 nominees)', ''],
      ['DECLARATION: By completing this section, the client confirms that the nominees below', ''],
      ['do NOT report to, nor work directly with, Evaluator 1 or Evaluator 2.', ''],
      ['NOMINEE 3A', ''],
      ['  Name', ''],
      ['  Phone', ''],
      ['  Email', ''],
      ['  Designation', ''],
      ['  Business Vertical', ''],
      ['  Declaration confirmed (Yes / No)', '(Yes / No)'],
      ['NOMINEE 3B', ''],
      ['  Name', ''],
      ['  Phone', ''],
      ['  Email', ''],
      ['  Designation', ''],
      ['  Business Vertical', ''],
      ['  Declaration confirmed (Yes / No)', '(Yes / No)'],
      ['NOMINEE 3C', ''],
      ['  Name', ''],
      ['  Phone', ''],
      ['  Email', ''],
      ['  Designation', ''],
      ['  Business Vertical', ''],
      ['  Declaration confirmed (Yes / No)', '(Yes / No)'],
      [''],
      ['SECTION 6: REQUEST FOR INDEPENDENT COE EVALUATOR', ''],
      ['If your organisation cannot nominate an eligible independent evaluator,', ''],
      ['a COE member will conduct Evaluator 3 interviews on your behalf.', ''],
      ['Request COE member as Evaluator 3? (Yes / No)', '(Yes / No)'],
    ];

    var ws = XLSX.utils.aoa_to_sheet(rows);
    /* Column widths */
    ws['!cols'] = [{ wch:58 }, { wch:52 }];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Onboarding Template');
    XLSX.writeFile(wb, 'AIT_Onboarding_Template.xlsx');
  }

  /* ─── PARSE UPLOADED TEMPLATE ─── */
  function parseTemplate(file, callback){
    var reader = new FileReader();
    reader.onload = function(e){
      try {
        var data = new Uint8Array(e.target.result);
        var wb   = XLSX.read(data, { type:'array' });
        var ws   = wb.Sheets[wb.SheetNames[0]];
        var rows = XLSX.utils.sheet_to_json(ws, { header:1, defval:'' });

        /* Build a label→value map from column A → column B */
        var map = {};
        rows.forEach(function(row){
          var label = (row[0] || '').toString().trim().toLowerCase().replace(/\s+/g,' ');
          var val   = (row[1] || '').toString().trim();
          if(label && val && !val.startsWith('(')) map[label] = val;
        });

        function v(label){ return map[label.toLowerCase().replace(/\s+/g,' ')] || ''; }

        /* Extract nominees — helper */
        function getNominee(prefix, rptKey){
          var nom = {
            name:       v(prefix + 'name'),
            phone:      v(prefix + 'phone'),
            email:      v(prefix + 'email'),
            designation: v(prefix + 'designation'),
            vertical:   v(prefix + 'business vertical'),
          };
          if(rptKey !== undefined){
            nom.reportsToE1 = (v(prefix + rptKey)).toLowerCase() === 'yes';
          }
          if(prefix.includes('3')){
            nom.declarationSigned = (v(prefix + 'declaration confirmed (yes / no)')).toLowerCase() === 'yes';
          }
          return nom;
        }

        var parsed = {
          companyName:     v('company name'),
          companyType:     v('company type'),
          sector:          v('sector'),
          productsServices: v('products / services'),
          size:            v('company size'),
          poc: {
            name:        v('poc name'),
            phone:       v('poc phone'),
            email:       v('poc email'),
            designation: v('poc designation'),
          },
          nominees: {
            evaluator1: [
              getNominee('nominee 1a  '),
              getNominee('nominee 1b  '),
              getNominee('nominee 1c  '),
            ],
            evaluator2: [
              getNominee('nominee 2a  ', 'reports to / works directly with evaluator 1?'),
              getNominee('nominee 2b  ', 'reports to / works directly with evaluator 1?'),
              getNominee('nominee 2c  ', 'reports to / works directly with evaluator 1?'),
            ],
            evaluator3: [
              getNominee('nominee 3a  '),
              getNominee('nominee 3b  '),
              getNominee('nominee 3c  '),
            ],
          },
          requestCOEAsE3: (v('request coe member as evaluator 3? (yes / no)')).toLowerCase() === 'yes',
        };

        callback(null, parsed);
      } catch(err){
        callback('Failed to parse template: ' + err.message, null);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  return { generateTemplate, parseTemplate };
})();
