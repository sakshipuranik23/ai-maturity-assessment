/* ═══════════════════════════════════════════════════════════════
   AIT — views/admin.js  |  Admin Dashboard
   ═══════════════════════════════════════════════════════════════ */
AIT.Views.Admin = {

  _activeTab: 'clients',
  _selectedClientId: null,

  render: function(container){
    var self = this;
    var sess = AIT.Auth.current();
    var pendingCount = AIT.DB.Overrides.pending().length;

    container.innerHTML =
      '<aside class="sidebar" id="sidebar">' +
        '<div class="sidebar-header">' +
          '<span class="logo-icon">◈</span>' +
          '<span class="sidebar-brand">AI Maturity Tool</span>' +
        '</div>' +
        '<nav class="sidebar-nav">' +
          '<a class="sidebar-nav-item ' + (self._activeTab==='clients'?'active':'') + '" data-nav="clients" href="#">' +
            '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zm0 4a1 1 0 000 2h5a1 1 0 000-2H3zm0 4a1 1 0 100 2h4a1 1 0 100-2H3z"/></svg>' +
            'All Clients' +
          '</a>' +
          '<a class="sidebar-nav-item ' + (self._activeTab==='approvals'?'active':'') + '" data-nav="approvals" href="#">' +
            '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' +
            'Override Approvals' +
            (pendingCount > 0 ? ' <span class="nav-badge">' + pendingCount + '</span>' : '') +
          '</a>' +
          '<a class="sidebar-nav-item" data-nav="about" href="#">' +
            '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>' +
            'Assessment Framework' +
          '</a>' +
        '</nav>' +
        '<div class="sidebar-footer">' +
          '<div class="sidebar-user">' +
            '<div class="user-avatar user-avatar--admin">' + sess.name[0] + '</div>' +
            '<div class="user-info"><span class="user-name">' + sess.name + '</span><span class="user-role">System Admin</span></div>' +
            '<button class="btn-icon logout-btn" id="btn-logout" title="Sign out">↩</button>' +
          '</div>' +
        '</div>' +
      '</aside>' +
      '<main class="main-content" id="main-content">' +
        '<div class="main-inner" id="main-inner"></div>' +
      '</main>';

    document.getElementById('btn-logout').addEventListener('click', function(){
      AIT.Auth.logout(); AIT.Router.go(null);
    });

    container.querySelectorAll('.sidebar-nav-item').forEach(function(a){
      a.addEventListener('click', function(e){
        e.preventDefault();
        container.querySelectorAll('.sidebar-nav-item').forEach(function(x){ x.classList.remove('active'); });
        a.classList.add('active');
        self._activeTab = a.dataset.nav;
        var main = document.getElementById('main-inner');
        if(a.dataset.nav === 'clients')   self._renderClients(main);
        if(a.dataset.nav === 'approvals') self._renderApprovals(main);
        if(a.dataset.nav === 'about')     AIT.Views.About.render(main);
      });
    });

    /* Default view */
    this._renderClients(document.getElementById('main-inner'));
  },

  _renderClients: function(main){
    var self = this;
    var allClients = AIT.DB.Clients.all();
    var coeMap = {};
    AIT.USERS.forEach(function(u){ coeMap[u.id] = u.name; });

    /* Summary stats */
    var total     = allClients.length;
    var active    = allClients.filter(function(c){ return c.status === 'active'; }).length;
    var completed = allClients.filter(function(c){ return c.status === 'completed'; }).length;
    var onboarding= total - active - completed;

    main.innerHTML =
      '<div class="welcome-header">' +
        '<div><h2>All Clients</h2><p class="text-secondary">System-wide view of all client assessments across all COE members.</p></div>' +
      '</div>' +
      '<div class="stats-row">' +
        '<div class="stat-card"><div class="stat-card__num">' + total + '</div><div class="stat-card__label">Total Clients</div></div>' +
        '<div class="stat-card"><div class="stat-card__num stat-card__num--blue">' + active + '</div><div class="stat-card__label">Active</div></div>' +
        '<div class="stat-card"><div class="stat-card__num stat-card__num--green">' + completed + '</div><div class="stat-card__label">Completed</div></div>' +
        '<div class="stat-card"><div class="stat-card__num stat-card__num--yellow">' + AIT.DB.Overrides.pending().length + '</div><div class="stat-card__label">Pending Overrides</div></div>' +
      '</div>' +
      '<div class="card mt-4">' +
        '<div class="card-header"><h3>Client Registry</h3></div>' +
        '<table class="data-table">' +
          '<thead><tr><th>Client</th><th>Sector</th><th>COE Member</th><th>Status</th><th>Evaluators</th><th>Action</th></tr></thead>' +
          '<tbody>' +
            allClients.map(function(c){
              var asmt  = AIT.DB.Assessments.byClient(c.id);
              var slots = asmt ? AIT.DB.Slots.byAssessment(asmt.id) : [];
              var submitted = slots.filter(function(s){ return s.status === 'submitted'; }).length;
              return '<tr>' +
                '<td><strong>' + c.name + '</strong><br><span class="text-xs text-secondary">' + (c.type||'') + ' · ' + (c.size||'') + '</span></td>' +
                '<td>' + c.sector + '</td>' +
                '<td><div class="coe-tag">' + (coeMap[c.coeId] || '—') + '</div></td>' +
                '<td>' + AIT.Utils.statusBadge(c.status, asmt && asmt.deadline) + '</td>' +
                '<td>' +
                  (slots.length ? '<div class="slot-pips">' + slots.map(function(s){ return '<span class="slot-pip slot-pip--' + s.status + '" title="E' + s.slotNumber + ': ' + s.status + '">E' + s.slotNumber + '</span>'; }).join('') + '</div>' : '<span class="text-secondary text-sm">—</span>') +
                '</td>' +
                '<td>' +
                  (asmt && asmt.reportGenerated ? '<button class="btn btn--ghost btn--sm" data-action="report" data-cid="' + c.id + '">View Report →</button>' : '<span class="text-sm text-secondary">' + (asmt ? submitted + '/3 submitted' : 'No assessment') + '</span>') +
                '</td>' +
              '</tr>';
            }).join('') +
          '</tbody>' +
        '</table>' +
      '</div>';

    main.querySelectorAll('[data-action="report"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        AIT.Views.Report.render(document.getElementById('main-inner'), { clientId: btn.dataset.cid });
      });
    });
  },

  _renderApprovals: function(main){
    var self = this;
    var overrides = AIT.DB.Overrides.all();
    var pending   = overrides.filter(function(o){ return o.status === 'pending'; });
    var resolved  = overrides.filter(function(o){ return o.status !== 'pending'; });

    function overrideCard(o, isPending){
      var client  = AIT.DB.Clients.byId(o.clientId);
      var slot    = AIT.DB.Slots.byId(o.slotId);
      var sdInfo  = AIT.SUB_DIM_MAP[o.subDimId] || {};
      var roleLabel = { 1:'E1 Leadership', 2:'E2 Tech Lead', 3:'E3 Independent' }[o.slotNumber] || '';

      return '<div class="override-card ' + (isPending ? 'override-card--pending' : 'override-card--resolved') + '" data-ovrid="' + o.id + '">' +
        '<div class="override-card__top">' +
          '<div>' +
            '<div class="override-card__client">' + (client && client.name || '—') + '</div>' +
            '<div class="override-card__meta">' + roleLabel + ' · ' + (slot && slot.selectedNominee && slot.selectedNominee.name || '—') + '</div>' +
          '</div>' +
          '<div>' + AIT.Utils.statusBadge(o.status) + '</div>' +
        '</div>' +
        '<div class="override-card__subdim">' +
          '<span class="dim-tag" style="color:' + (sdInfo.dimensionColor||'#666') + ';background:' + (sdInfo.dimensionColor||'#666') + '22">' + (sdInfo.dimensionCode||'') + '</span>' +
          ' <strong>' + (sdInfo.name || o.subDimId) + '</strong>' +
        '</div>' +
        '<div class="override-score-change">' +
          '<span class="score-badge" style="background:' + AIT.scoreColor(o.originalScore) + '">L' + o.originalScore + '</span>' +
          ' <span class="arrow">→</span> ' +
          '<span class="score-badge" style="background:' + AIT.scoreColor(o.requestedScore) + '">L' + o.requestedScore + '</span>' +
          ' <span class="text-sm text-secondary ml-2">Requested by ' + (o.requestedByName||'COE') + ' · ' + AIT.Utils.formatDate(o.requestedAt) + '</span>' +
        '</div>' +
        '<div class="override-card__reasoning"><strong>Reasoning:</strong> ' + o.reasoning + '</div>' +
        (o.adminNote ? '<div class="override-card__admin-note"><strong>Admin Note:</strong> ' + o.adminNote + '</div>' : '') +
        (isPending ?
          '<div class="override-card__actions">' +
            '<textarea class="admin-note-input" placeholder="Add a note (optional)..." rows="2"></textarea>' +
            '<div class="action-btns mt-2">' +
              '<button class="btn btn--danger btn--sm" data-action="reject" data-ovrid="' + o.id + '">✗ Reject</button>' +
              '<button class="btn btn--success btn--sm" data-action="approve" data-ovrid="' + o.id + '">✓ Approve Override</button>' +
            '</div>' +
          '</div>' :
          '<div class="override-card__resolved">Reviewed by Admin · ' + AIT.Utils.formatDate(o.reviewedAt) + '</div>'
        ) +
      '</div>';
    }

    main.innerHTML =
      '<div class="welcome-header">' +
        '<div><h2>Override Approvals</h2><p class="text-secondary">COE members can request score overrides when evaluator scores appear inflated or inconsistent with interview evidence. Approved overrides replace the original score in the report (shown in purple).</p></div>' +
      '</div>' +

      (pending.length === 0 && resolved.length === 0 ?
        '<div class="empty-state card mt-4"><div class="empty-icon">✓</div><p>No override requests yet.</p></div>' : '') +

      (pending.length > 0 ?
        '<div class="section-label">PENDING APPROVAL (' + pending.length + ')</div>' +
        '<div class="overrides-list">' + pending.map(function(o){ return overrideCard(o, true); }).join('') + '</div>' : '') +

      (resolved.length > 0 ?
        '<div class="section-label mt-4">RESOLVED (' + resolved.length + ')</div>' +
        '<div class="overrides-list">' + resolved.map(function(o){ return overrideCard(o, false); }).join('') + '</div>' : '');

    /* Bind approve / reject */
    main.querySelectorAll('[data-action="approve"], [data-action="reject"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var card    = btn.closest('.override-card');
        var ovrId   = btn.dataset.ovrid;
        var ovr     = AIT.DB.Overrides.byId(ovrId);
        var noteEl  = card && card.querySelector('.admin-note-input');
        var note    = noteEl ? noteEl.value.trim() : '';
        var action  = btn.dataset.action;
        var sess    = AIT.Auth.current();

        AIT.DB.Overrides.update(ovrId, {
          status:     action === 'approve' ? 'approved' : 'rejected',
          adminNote:  note,
          reviewedAt: new Date().toISOString(),
          reviewedBy: sess.userId
        });

        /* Apply override to slot score if approved */
        if(action === 'approve' && ovr){
          var slot = AIT.DB.Slots.byId(ovr.slotId);
          if(slot){
            var updatedOvrs = Object.assign({}, slot.overriddenScores || {});
            updatedOvrs[ovr.subDimId] = ovr.requestedScore;
            AIT.DB.Slots.update(slot.id, { overriddenScores: updatedOvrs });
          }
        }

        AIT.Utils.toast(action === 'approve' ? 'Override approved and applied.' : 'Override rejected.', action === 'approve' ? 'success' : 'info');
        /* Re-render sidebar badge then approvals */
        AIT.Views.Admin.render(document.getElementById('app').querySelector('.view-dashboard') || document.getElementById('app'));
        setTimeout(function(){
          AIT.Views.Admin._renderApprovals(document.getElementById('main-inner'));
          document.querySelectorAll('.sidebar-nav-item').forEach(function(a){ a.classList.remove('active'); });
          var approvalLink = document.querySelector('[data-nav="approvals"]');
          if(approvalLink) approvalLink.classList.add('active');
        }, 50);
      });
    });
  }
};
