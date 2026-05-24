/* ═══════════════════════════════════════════════════════════════
   AIT — views/coe.js  |  COE Dashboard (full)
   ═══════════════════════════════════════════════════════════════ */
AIT.Views.COE = {

  _filter: 'all',
  _selectedClientId: null,
  _subView: 'welcome',   /* welcome | onboarding | assessment | report */

  render: function(container){
    var self = this;
    var sess = AIT.Auth.current();

    container.innerHTML =
      '<aside class="sidebar" id="sidebar">' +
        '<div class="sidebar-header">' +
          '<span class="logo-icon">◈</span>' +
          '<span class="sidebar-brand">AI Maturity Tool</span>' +
        '</div>' +
        '<nav class="sidebar-nav">' +
          '<a class="sidebar-nav-item active" data-nav="clients" href="#"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zm0 4a1 1 0 000 2h5a1 1 0 000-2H3zm0 4a1 1 0 100 2h4a1 1 0 100-2H3z"/></svg>Client Dashboard</a>' +
          '<a class="sidebar-nav-item" data-nav="about" href="#"><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>Assessment Framework</a>' +
        '</nav>' +
        '<div class="sidebar-section-label">MY CLIENTS</div>' +
        '<div class="sidebar-filter">' +
          '<button class="filter-btn active" data-filter="all">All</button>' +
          '<button class="filter-btn" data-filter="active">Ongoing</button>' +
          '<button class="filter-btn" data-filter="completed">Completed</button>' +
        '</div>' +
        '<div class="sidebar-client-list" id="sidebar-clients"></div>' +
        '<div class="sidebar-footer">' +
          '<button class="btn btn--primary btn--sm btn--full" id="btn-new-client">+ Onboard New Client</button>' +
          '<div class="sidebar-user"><div class="user-avatar">' + sess.name[0] + '</div><div class="user-info"><span class="user-name">' + sess.name + '</span><span class="user-role">COE Member</span></div>' +
          '<button class="btn-icon logout-btn" title="Sign out" id="btn-logout">↩</button></div>' +
        '</div>' +
      '</aside>' +
      '<main class="main-content" id="main-content">' +
        '<div class="main-inner" id="main-inner"></div>' +
      '</main>';

    this._renderSidebar();
    this._renderWelcome();
    this._bindNav(container, sess);
  },

  _bindNav: function(container, sess){
    var self = this;
    /* sidebar nav */
    container.querySelectorAll('.sidebar-nav-item').forEach(function(a){
      a.addEventListener('click', function(e){
        e.preventDefault();
        container.querySelectorAll('.sidebar-nav-item').forEach(function(x){ x.classList.remove('active'); });
        a.classList.add('active');
        if(a.dataset.nav === 'about') AIT.Views.About.render(document.getElementById('main-inner'));
        if(a.dataset.nav === 'clients'){
          self._selectedClientId = null;
          self._renderWelcome();
          self._renderSidebar();
        }
      });
    });
    /* filters */
    container.querySelectorAll('.filter-btn').forEach(function(b){
      b.addEventListener('click', function(){
        container.querySelectorAll('.filter-btn').forEach(function(x){ x.classList.remove('active'); });
        b.classList.add('active');
        self._filter = b.dataset.filter;
        self._renderSidebar();
      });
    });
    /* new client */
    document.getElementById('btn-new-client').addEventListener('click', function(){
      self._renderOnboarding(null);
    });
    /* logout */
    document.getElementById('btn-logout').addEventListener('click', function(){
      AIT.Auth.logout();
      AIT.Router.go(null);
    });
  },

  _renderSidebar: function(){
    var self = this;
    var sess = AIT.Auth.current();
    var clients = AIT.DB.Clients.byCoe(sess.userId);
    var el = document.getElementById('sidebar-clients');
    if(!el) return;

    var filtered = clients.filter(function(c){
      if(self._filter === 'all') return true;
      if(self._filter === 'active') return c.status !== 'completed';
      if(self._filter === 'completed') return c.status === 'completed';
      return true;
    });

    if(!filtered.length){
      el.innerHTML = '<div class="sidebar-empty">No clients found.</div>';
      return;
    }
    el.innerHTML = filtered.map(function(c){
      var asmt = AIT.DB.Assessments.byClient(c.id);
      var activeClass = c.id === self._selectedClientId ? ' selected' : '';
      var statusDot = { active:'dot--blue', completed:'dot--green', onboarding_template:'dot--yellow', onboarding_review:'dot--orange' }[c.status] || 'dot--gray';
      return '<div class="sidebar-client-item' + activeClass + '" data-cid="' + c.id + '">' +
               '<div class="client-item-dot ' + statusDot + '"></div>' +
               '<div class="client-item-info">' +
                 '<span class="client-item-name">' + c.name + '</span>' +
                 '<span class="client-item-meta">' + c.sector + ' · ' + (asmt ? (asmt.status === 'completed' ? 'Completed' : 'Active') : 'Onboarding') + '</span>' +
               '</div>' +
             '</div>';
    }).join('');

    el.querySelectorAll('.sidebar-client-item').forEach(function(item){
      item.addEventListener('click', function(){
        self._selectedClientId = item.dataset.cid;
        self._renderSidebar();
        self._renderClientView(item.dataset.cid);
        /* reset nav highlight */
        document.querySelectorAll('.sidebar-nav-item').forEach(function(a){ a.classList.remove('active'); });
        document.querySelector('[data-nav="clients"]').classList.add('active');
      });
    });
  },

  _renderWelcome: function(){
    var sess = AIT.Auth.current();
    var clients = AIT.DB.Clients.byCoe(sess.userId);
    var active    = clients.filter(function(c){ return c.status === 'active'; }).length;
    var completed = clients.filter(function(c){ return c.status === 'completed'; }).length;
    var pending   = clients.filter(function(c){ return c.status !== 'active' && c.status !== 'completed'; }).length;

    var main = document.getElementById('main-inner');
    if(!main) return;
    main.innerHTML =
      '<div class="welcome-header">' +
        '<div>' +
          '<h2>Welcome back, ' + sess.name.split(' ')[0] + '</h2>' +
          '<p class="text-secondary">Manage your client assessments and onboard new clients.</p>' +
        '</div>' +
      '</div>' +
      '<div class="stats-row">' +
        '<div class="stat-card"><div class="stat-card__num">' + clients.length + '</div><div class="stat-card__label">Total Clients</div></div>' +
        '<div class="stat-card"><div class="stat-card__num stat-card__num--blue">' + active + '</div><div class="stat-card__label">Active Assessments</div></div>' +
        '<div class="stat-card"><div class="stat-card__num stat-card__num--green">' + completed + '</div><div class="stat-card__label">Completed</div></div>' +
        '<div class="stat-card"><div class="stat-card__num stat-card__num--yellow">' + pending + '</div><div class="stat-card__label">Onboarding</div></div>' +
      '</div>' +
      '<div class="card mt-4">' +
        '<div class="card-header"><h3>All Clients</h3></div>' +
        '<table class="data-table">' +
          '<thead><tr><th>Client</th><th>Sector</th><th>Status</th><th>Created</th><th>Deadline</th><th>Action</th></tr></thead>' +
          '<tbody>' + clients.map(function(c){
            var asmt = AIT.DB.Assessments.byClient(c.id);
            var slots = asmt ? AIT.DB.Slots.byAssessment(asmt.id) : [];
            var subCount = slots.filter(function(s){ return s.status==='submitted'; }).length;
            return '<tr>' +
              '<td><strong>' + c.name + '</strong><br><span class="text-xs text-secondary">' + c.type + '</span></td>' +
              '<td>' + c.sector + '</td>' +
              '<td>' + AIT.Utils.statusBadge(c.status, asmt && asmt.deadline) + (asmt && c.status==='active' ? ' <span class="text-xs text-secondary">(' + subCount + '/3 submitted)</span>' : '') + '</td>' +
              '<td class="text-sm">' + AIT.Utils.formatDate(c.createdAt) + '</td>' +
              '<td class="text-sm">' + (asmt && asmt.deadline ? AIT.Utils.formatDate(asmt.deadline) : '—') + '</td>' +
              '<td><button class="btn btn--ghost btn--sm" data-action="view" data-cid="' + c.id + '">View →</button></td>' +
            '</tr>';
          }).join('') +
          '</tbody>' +
        '</table>' +
      '</div>';

    main.querySelectorAll('[data-action="view"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        AIT.Views.COE._selectedClientId = btn.dataset.cid;
        AIT.Views.COE._renderSidebar();
        AIT.Views.COE._renderClientView(btn.dataset.cid);
      });
    });
  },

  _renderClientView: function(clientId){
    var client = AIT.DB.Clients.byId(clientId);
    if(!client) return;
    var asmt = AIT.DB.Assessments.byClient(clientId);

    if(client.status === 'onboarding_template' || client.status === 'onboarding_review' || !asmt){
      this._renderOnboarding(client);
    } else {
      this._renderAssessmentStatus(client, asmt);
    }
  },

  /* ─── ONBOARDING ─── */
  _renderOnboarding: function(client){
    var self = this;
    var sess = AIT.Auth.current();
    var main = document.getElementById('main-inner');
    var isNew = !client;

    if(isNew){
      main.innerHTML =
        '<div class="page-header">' +
          '<h2>Onboard New Client</h2>' +
          '<p class="text-secondary">Download the onboarding template, share it with the client, then upload the completed file to begin review.</p>' +
        '</div>' +
        '<div class="onboarding-steps">' +
          '<div class="step-card step-card--active">' +
            '<div class="step-num">1</div>' +
            '<div class="step-body"><h4>Download Template</h4><p>Download the pre-filled onboarding template stamped with your details. Share with the client.</p>' +
            '<button class="btn btn--primary" id="btn-download-tpl">⬇ Download Template</button></div>' +
          '</div>' +
          '<div class="step-card">' +
            '<div class="step-num">2</div>' +
            '<div class="step-body"><h4>Upload Completed Template</h4><p>Once the client returns the filled template, upload it here to auto-populate the review form.</p>' +
            '<div class="upload-zone" id="upload-zone">' +
              '<input type="file" id="upload-input" accept=".xlsx,.xls" style="display:none">' +
              '<p>Drag & drop the filled template here, or</p>' +
              '<button class="btn btn--ghost" id="btn-browse">Browse File</button>' +
            '</div>' +
          '</div>' +
        '</div>';

      document.getElementById('btn-download-tpl').addEventListener('click', function(){
        AIT.Excel.generateTemplate(sess.name, sess.email);
      });
      document.getElementById('btn-browse').addEventListener('click', function(){
        document.getElementById('upload-input').click();
      });
      var uploadZone = document.getElementById('upload-zone');
      uploadZone.addEventListener('dragover', function(e){ e.preventDefault(); uploadZone.classList.add('dragover'); });
      uploadZone.addEventListener('dragleave', function(){ uploadZone.classList.remove('dragover'); });
      uploadZone.addEventListener('drop', function(e){
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        var file = e.dataTransfer.files[0];
        if(file) self._handleUpload(file, sess);
      });
      document.getElementById('upload-input').addEventListener('change', function(){
        if(this.files[0]) self._handleUpload(this.files[0], sess);
      });
    } else {
      /* review screen */
      self._renderReviewForm(client, sess);
    }
  },

  _handleUpload: function(file, sess){
    var self = this;
    AIT.Excel.parseTemplate(file, function(err, parsed){
      if(err){ AIT.Utils.toast(err, 'error'); return; }
      /* create a draft client record */
      var clientId = AIT.DB.generateId('c');
      AIT.DB.Clients.create({
        id: clientId,
        name: parsed.companyName || 'Unnamed Client',
        type: parsed.companyType,
        sector: parsed.sector,
        productsServices: parsed.productsServices,
        size: parsed.size,
        poc: parsed.poc,
        coeId: sess.userId,
        status: 'onboarding_review',
        createdAt: new Date().toISOString().slice(0,10),
        nominees: parsed.nominees,
        requestCOEAsE3: parsed.requestCOEAsE3,
      });
      AIT.Views.COE._selectedClientId = clientId;
      AIT.Views.COE._renderSidebar();
      AIT.Views.COE._renderReviewForm(AIT.DB.Clients.byId(clientId), sess);
      AIT.Utils.toast('Template parsed successfully. Please review and approve.', 'success');
    });
  },

  _renderReviewForm: function(client, sess){
    var self = this;
    var main = document.getElementById('main-inner');
    var nominees = client.nominees || {};

    function nomineeBlock(evalNum, label, list){
      var rKey = evalNum === 2 ? 'reportsToE1' : null;
      return '<div class="card mb-3">' +
        '<div class="card-header"><h4>Evaluator ' + evalNum + ' — ' + label + '</h4></div>' +
        '<div class="card-body">' +
        (list || []).map(function(nom, i){
          var letter = ['A','B','C'][i];
          var extra = '';
          if(rKey) extra = '<div class="nominee-badge ' + (nom[rKey] ? 'badge--red' : 'badge--green') + '">' + (nom[rKey] ? '⚠ Reports to E1' : '✓ Independent of E1') + '</div>';
          if(evalNum === 3) extra = '<div class="nominee-badge ' + (nom.declarationSigned ? 'badge--green' : 'badge--red') + '">' + (nom.declarationSigned ? '✓ Declaration signed' : '⚠ Declaration not signed') + '</div>';
          return '<div class="nominee-card" data-eval="' + evalNum + '" data-idx="' + i + '">' +
            '<div class="nominee-letter">' + letter + '</div>' +
            '<div class="nominee-info">' +
              '<strong>' + (nom.name || '—') + '</strong> · ' + (nom.designation || '—') + '<br>' +
              '<span class="text-xs text-secondary">' + (nom.email || '') + ' · ' + (nom.vertical || '') + '</span>' +
              extra +
            '</div>' +
            '<div class="nominee-actions">' +
              '<label class="radio-select"><input type="radio" name="eval' + evalNum + '" value="' + i + '" ' + (i===0?'checked':'') + '> <span>Select</span></label>' +
            '</div>' +
          '</div>';
        }).join('') +
        '</div></div>';
    }

    main.innerHTML =
      '<div class="page-header">' +
        '<h2>' + client.name + '<span class="badge badge--yellow ml-2">Under Review</span></h2>' +
        '<p class="text-secondary">Review the parsed client information, select evaluators from nominees, then approve to start the assessment.</p>' +
      '</div>' +
      '<div class="two-col">' +
        '<div>' +
          '<div class="card mb-3">' +
            '<div class="card-header"><h4>Company Details</h4></div>' +
            '<div class="card-body">' +
              '<div class="info-grid">' +
                '<span class="info-label">Name</span><span class="info-val">' + (client.name||'—') + '</span>' +
                '<span class="info-label">Type</span><span class="info-val">' + (client.type||'—') + '</span>' +
                '<span class="info-label">Sector</span><span class="info-val">' + (client.sector||'—') + '</span>' +
                '<span class="info-label">Size</span><span class="info-val">' + (client.size||'—') + '</span>' +
                '<span class="info-label">Products / Services</span><span class="info-val">' + (client.productsServices||'—') + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="card mb-3">' +
            '<div class="card-header"><h4>Point of Contact</h4></div>' +
            '<div class="card-body">' +
              '<div class="info-grid">' +
                '<span class="info-label">Name</span><span class="info-val">' + (client.poc && client.poc.name||'—') + '</span>' +
                '<span class="info-label">Email</span><span class="info-val">' + (client.poc && client.poc.email||'—') + '</span>' +
                '<span class="info-label">Phone</span><span class="info-val">' + (client.poc && client.poc.phone||'—') + '</span>' +
                '<span class="info-label">Designation</span><span class="info-val">' + (client.poc && client.poc.designation||'—') + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          (client.requestCOEAsE3 ? '<div class="alert alert--yellow"><strong>Client has requested a COE member as Evaluator 3.</strong> You or another COE member will need to conduct the independent evaluation.</div>' : '') +
        '</div>' +
        '<div>' +
          nomineeBlock(1, 'Leadership',    nominees.evaluator1) +
          nomineeBlock(2, 'Tech Lead / PM', nominees.evaluator2) +
          nomineeBlock(3, 'Independent',   nominees.evaluator3) +
        '</div>' +
      '</div>' +
      '<div class="action-bar">' +
        '<button class="btn btn--ghost" id="btn-cancel-onboard">Cancel</button>' +
        '<button class="btn btn--primary" id="btn-approve-onboard">✓ Approve & Start Assessment</button>' +
      '</div>';

    document.getElementById('btn-cancel-onboard').addEventListener('click', function(){
      self._renderWelcome();
    });
    document.getElementById('btn-approve-onboard').addEventListener('click', function(){
      self._approveOnboarding(client);
    });
  },

  _approveOnboarding: function(client){
    var self = this;
    /* pick selected nominee for each evaluator */
    function getSelected(evalNum){
      var radio = document.querySelector('input[name="eval' + evalNum + '"]:checked');
      var idx   = radio ? parseInt(radio.value) : 0;
      var nom   = (client.nominees && client.nominees['evaluator' + evalNum] || [])[idx] || {};
      return nom;
    }

    function genCode(prefix){ return prefix + String(Math.floor(100 + Math.random()*900)); }

    var asmtId  = AIT.DB.generateId('a');
    var asmt    = AIT.DB.Assessments.create({ id:asmtId, clientId:client.id, status:'in_progress', createdAt:new Date().toISOString().slice(0,10), deadline:null, reportGenerated:false, reportGeneratedAt:null, reconciledScores:{} });

    var baseCode = Date.now().toString().slice(-5);
    [1,2,3].forEach(function(num){
      var roles = { 1:'leadership', 2:'tech_lead', 3:'independent' };
      var nom   = getSelected(num);
      AIT.DB.Slots.create({ id:AIT.DB.generateId('s'), assessmentId:asmtId, clientId:client.id, slotNumber:num, role:roles[num], selectedNominee: nom, loginCode: baseCode + num, status:'pending', scores:{}, submittedAt:null, overriddenScores:{} });
    });

    AIT.DB.Clients.update(client.id, { status:'active' });
    AIT.Utils.toast('Assessment started! Evaluator codes generated.', 'success');
    self._renderSidebar();
    self._renderAssessmentStatus(AIT.DB.Clients.byId(client.id), asmt);
  },

  /* ─── ASSESSMENT STATUS ─── */
  _renderAssessmentStatus: function(client, asmt){
    var self = this;
    var slots = AIT.DB.Slots.byAssessment(asmt.id);
    var allSubmitted = slots.length === 3 && slots.every(function(s){ return s.status === 'submitted'; });
    var overrides = AIT.DB.Overrides.byAssessment(asmt.id);
    var pendingOverrides = overrides.filter(function(o){ return o.status === 'pending'; });
    var main = document.getElementById('main-inner');

    var d6Block = '';
    if(asmt.reportGenerated){
      /* check D6 blocking rule */
      var d6Blocked = false;
      var d6Dim = AIT.DIMENSIONS.find(function(d){ return d.id === 'd6'; });
      d6Dim.subDimensions.forEach(function(sd){
        slots.forEach(function(sl){
          var sc = sl.scores && sl.scores[sd.id];
          if(sc && sc.score <= 2) d6Blocked = true;
        });
      });
      if(d6Blocked) d6Block = '<div class="alert alert--red"><strong>⚠ D6 Blocking Finding:</strong> One or more D6 sub-dimensions scored at Level 1 or 2. Overall maturity is capped at Level 2 until all D6 gaps are resolved.</div>';
    }

    main.innerHTML =
      '<div class="page-header">' +
        '<div>' +
          '<h2>' + client.name + '</h2>' +
          '<div class="page-meta">' +
            AIT.Utils.statusBadge(asmt.status, asmt.deadline) +
            ' <span class="text-sm text-secondary">' + client.sector + ' · ' + (client.size || '') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="page-actions">' +
          (allSubmitted && !asmt.reportGenerated ? '<button class="btn btn--primary" id="btn-gen-report">⬡ Generate Report</button>' : '') +
          (asmt.reportGenerated ? '<button class="btn btn--primary" id="btn-view-report">View Report →</button>' : '') +
          '<button class="btn btn--ghost btn--disabled" title="Email automation — Future scope">🔔 Reminder</button>' +
        '</div>' +
      '</div>' +
      d6Block +
      (pendingOverrides.length ? '<div class="alert alert--yellow"><strong>' + pendingOverrides.length + ' pending override request(s)</strong> awaiting Admin approval.</div>' : '') +
      '<div class="evaluator-cards" id="eval-cards"></div>' +
      '<div class="two-col mt-4">' +
        '<div class="card">' +
          '<div class="card-header"><h4>Client Details</h4></div>' +
          '<div class="card-body">' +
            '<div class="info-grid">' +
              '<span class="info-label">Type</span><span class="info-val">' + (client.type||'—') + '</span>' +
              '<span class="info-label">Sector</span><span class="info-val">' + (client.sector||'—') + '</span>' +
              '<span class="info-label">Size</span><span class="info-val">' + (client.size||'—') + '</span>' +
              '<span class="info-label">POC</span><span class="info-val">' + (client.poc && client.poc.name||'—') + '</span>' +
              '<span class="info-label">POC Email</span><span class="info-val">' + (client.poc && client.poc.email||'—') + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="card-header"><h4>Assessment Timeline</h4></div>' +
          '<div class="card-body">' +
            '<div class="info-grid">' +
              '<span class="info-label">Started</span><span class="info-val">' + AIT.Utils.formatDate(asmt.createdAt) + '</span>' +
              '<span class="info-label">Deadline</span><span class="info-val">' + (asmt.deadline ? AIT.Utils.formatDate(asmt.deadline) : '<span class="text-secondary">Not set</span>') + '</span>' +
              '<span class="info-label">Report</span><span class="info-val">' + (asmt.reportGenerated ? AIT.Utils.formatDate(asmt.reportGeneratedAt) : '<span class="text-secondary">Not generated</span>') + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    /* Evaluator cards */
    var cardsEl = document.getElementById('eval-cards');
    var roleLabels = { leadership:'Leadership (E1)', tech_lead:'Tech Lead / PM (E2)', independent:'Independent (E3)' };
    slots.forEach(function(slot){
      var scoreCount = Object.keys(slot.scores || {}).length;
      var total = 37;
      var pct = Math.round(scoreCount / total * 100);
      var overrideList = overrides.filter(function(o){ return o.slotId === slot.id; });

      var card = document.createElement('div');
      card.className = 'eval-card eval-card--' + slot.status;
      card.innerHTML =
        '<div class="eval-card__header">' +
          '<div class="eval-card__role">' + (roleLabels[slot.role]||slot.role) + '</div>' +
          '<div class="eval-status">' + AIT.Utils.statusBadge(slot.status) + '</div>' +
        '</div>' +
        '<div class="eval-card__name">' + (slot.selectedNominee && slot.selectedNominee.name || '—') + '</div>' +
        '<div class="eval-card__desig text-secondary text-sm">' + (slot.selectedNominee && slot.selectedNominee.designation || '') + '</div>' +
        '<div class="eval-card__code"><span class="code-label">Access Code</span><span class="code-val">' + slot.loginCode + '</span></div>' +
        (slot.status === 'submitted' ? '<div class="eval-card__progress"><div class="progress-bar"><div class="progress-fill" style="width:100%"></div></div><span class="progress-label">Submitted · ' + AIT.Utils.formatDate(slot.submittedAt) + '</span></div>' : slot.status === 'in_progress' ? '<div class="eval-card__progress"><div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div><span class="progress-label">' + pct + '% complete</span></div>' : '') +
        (slot.status === 'submitted' ? '<div class="eval-card__actions"><button class="btn btn--ghost btn--sm" data-action="override" data-slotid="' + slot.id + '">Request Score Override</button><button class="btn btn--ghost btn--sm" data-action="change" data-slotid="' + slot.id + '">Change Evaluator</button></div>' : '<div class="eval-card__actions"><button class="btn btn--ghost btn--sm" data-action="change" data-slotid="' + slot.id + '">Change Evaluator</button></div>') +
        (overrideList.length ? '<div class="override-list"><strong>Override Requests:</strong>' + overrideList.map(function(o){ return '<span class="badge ' + (o.status==='approved'?'badge--green':o.status==='rejected'?'badge--red':'badge--yellow') + '">' + (AIT.SUB_DIM_MAP[o.subDimId]||{}).name + ': ' + o.originalScore + '→' + o.requestedScore + ' (' + o.status + ')</span>'; }).join('') + '</div>' : '');

      cardsEl.appendChild(card);
    });

    /* bind buttons */
    cardsEl.querySelectorAll('[data-action="override"]').forEach(function(btn){
      btn.addEventListener('click', function(){ self._showOverrideModal(btn.dataset.slotid, asmt, client); });
    });
    cardsEl.querySelectorAll('[data-action="change"]').forEach(function(btn){
      btn.addEventListener('click', function(){ self._showChangeEvaluatorModal(btn.dataset.slotid, client); });
    });

    var genBtn = document.getElementById('btn-gen-report');
    if(genBtn) genBtn.addEventListener('click', function(){
      AIT.DB.Assessments.update(asmt.id, { reportGenerated:true, reportGeneratedAt:new Date().toISOString(), status:'completed' });
      AIT.DB.Clients.update(client.id, { status:'completed' });
      AIT.Utils.toast('Report generated!', 'success');
      self._renderSidebar();
      AIT.Views.Report.render(document.getElementById('main-inner'), { clientId: client.id });
    });

    var viewBtn = document.getElementById('btn-view-report');
    if(viewBtn) viewBtn.addEventListener('click', function(){
      AIT.Views.Report.render(document.getElementById('main-inner'), { clientId: client.id });
    });
  },

  _showOverrideModal: function(slotId, asmt, client){
    var slot = AIT.DB.Slots.byId(slotId);
    if(!slot) return;

    var dimOptions = '';
    AIT.DIMENSIONS.forEach(function(d){
      d.subDimensions.forEach(function(sd){
        var sc = slot.scores && slot.scores[sd.id];
        if(sc) dimOptions += '<option value="' + sd.id + '" data-orig="' + sc.score + '">[' + d.code + '] ' + sd.name + ' (Current: L' + sc.score + ')</option>';
      });
    });

    var form = document.createElement('div');
    form.innerHTML =
      '<div class="form-group"><label>Sub-dimension to Override</label>' +
        '<select id="ovr-subdim">' + dimOptions + '</select>' +
      '</div>' +
      '<div class="form-group"><label>Original Score</label><input id="ovr-orig" type="text" readonly></div>' +
      '<div class="form-group"><label>Requested Score (1–5)</label>' +
        '<div class="score-radio-row">' + [1,2,3,4,5].map(function(n){ return '<label class="score-radio-opt"><input type="radio" name="ovr-score" value="' + n + '"> <span style="background:' + AIT.scoreColor(n) + '">L' + n + '</span></label>'; }).join('') + '</div>' +
      '</div>' +
      '<div class="form-group"><label>Reasoning <span class="text-secondary">(required)</span></label><textarea id="ovr-reason" rows="4" placeholder="Provide detailed justification for this override request..."></textarea></div>';

    /* sync orig score when subdim changes */
    setTimeout(function(){
      var sel = document.getElementById('ovr-subdim');
      var origEl = document.getElementById('ovr-orig');
      function syncOrig(){ origEl.value = 'Level ' + (sel.selectedOptions[0] && sel.selectedOptions[0].dataset.orig || ''); }
      sel.addEventListener('change', syncOrig);
      syncOrig();
    }, 50);

    AIT.Modal.show({
      title: 'Request Score Override — ' + (slot.selectedNominee && slot.selectedNominee.name || ''),
      body: form,
      confirmLabel: 'Submit Request',
      onConfirm: function(modal){
        var subdim  = document.getElementById('ovr-subdim').value;
        var reason  = document.getElementById('ovr-reason').value.trim();
        var scoreEl = document.querySelector('input[name="ovr-score"]:checked');
        var origSc  = slot.scores && slot.scores[subdim] && slot.scores[subdim].score;
        if(!reason || !scoreEl){ AIT.Utils.toast('Please fill all fields.', 'error'); return; }
        var sess = AIT.Auth.current();
        AIT.DB.Overrides.create({
          id: AIT.DB.generateId('ov'), clientId: client.id, assessmentId: asmt.id,
          slotId: slot.id, slotNumber: slot.slotNumber, subDimId: subdim,
          originalScore: origSc, requestedScore: parseInt(scoreEl.value),
          reasoning: reason, requestedBy: sess.userId, requestedByName: sess.name,
          requestedAt: new Date().toISOString(), status:'pending', adminNote:'', reviewedAt:null, reviewedBy:null
        });
        AIT.Modal.close(modal);
        AIT.Utils.toast('Override request submitted for Admin approval.', 'success');
        AIT.Views.COE._renderAssessmentStatus(client, asmt);
      }
    });
  },

  _showChangeEvaluatorModal: function(slotId, client){
    var slot = AIT.DB.Slots.byId(slotId);
    if(!slot) return;

    var form = document.createElement('div');
    form.innerHTML =
      '<div class="alert alert--yellow">Changing an evaluator who has already submitted will <strong>discard their scores</strong>. This action cannot be undone.</div>' +
      '<div class="form-group"><label>New Evaluator Name</label><input type="text" id="ch-name" placeholder="Full name"></div>' +
      '<div class="form-group"><label>Email</label><input type="email" id="ch-email" placeholder="email@company.com"></div>' +
      '<div class="form-group"><label>Designation</label><input type="text" id="ch-desig" placeholder="Designation"></div>';

    AIT.Modal.show({
      title: 'Change Evaluator — Slot ' + slot.slotNumber,
      body: form,
      confirmLabel: 'Update Evaluator',
      onConfirm: function(modal){
        var name  = document.getElementById('ch-name').value.trim();
        var email = document.getElementById('ch-email').value.trim();
        var desig = document.getElementById('ch-desig').value.trim();
        if(!name || !email){ AIT.Utils.toast('Name and email are required.', 'error'); return; }
        var newCode = String(Date.now()).slice(-6);
        AIT.DB.Slots.update(slot.id, { selectedNominee:{ name:name, email:email, designation:desig }, status:'pending', scores:{}, submittedAt:null, loginCode:newCode });
        AIT.Modal.close(modal);
        AIT.Utils.toast('Evaluator updated. New code: ' + newCode, 'success');
        var asmt = AIT.DB.Assessments.byClient(client.id);
        AIT.Views.COE._renderAssessmentStatus(client, asmt);
      }
    });
  }
};
