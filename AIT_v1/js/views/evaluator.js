/* ═══════════════════════════════════════════════════════════════
   AIT — views/evaluator.js  |  Evaluator Assessment Form
   ═══════════════════════════════════════════════════════════════ */
AIT.Views.Evaluator = {

  _dimIndex: 0,
  _sess: null,
  _slot: null,
  _container: null,

  render: function(container, sess){
    var self = this;
    this._sess = sess;
    this._slot = AIT.DB.Slots.byId(sess.slotId);
    this._container = container;
    var client = AIT.DB.Clients.byId(sess.clientId);
    var isIndependent = (sess.evaluatorRole === 'independent');

    /* Find first incomplete dimension */
    var slot = this._slot;
    var firstIncompleteDim = 0;
    AIT.DIMENSIONS.forEach(function(d, idx){
      if(firstIncompleteDim === 0 || firstIncompleteDim === idx) return;
      var allDone = d.subDimensions.every(function(sd){ return slot.scores && slot.scores[sd.id] && slot.scores[sd.id].score; });
      if(!allDone && firstIncompleteDim === 0) firstIncompleteDim = idx;
    });
    this._dimIndex = firstIncompleteDim;

    container.innerHTML =
      '<div class="eval-shell">' +
        '<div class="eval-topbar">' +
          '<div class="eval-topbar__left">' +
            '<span class="logo-icon">◈</span>' +
            '<div>' +
              '<div class="eval-client-name">' + (client && client.name || 'Assessment') + '</div>' +
              '<div class="eval-role-tag">' + (AIT.EVAL_ROLES[sess.slotNumber] || {}).title + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="eval-topbar__right">' +
            '<div class="eval-progress-wrap">' +
              '<div class="eval-dim-dots" id="dim-dots"></div>' +
              '<span class="eval-progress-label" id="progress-label"></span>' +
            '</div>' +
            '<button class="btn btn--ghost btn--sm" id="btn-eval-logout">↩ Exit</button>' +
          '</div>' +
        '</div>' +
        (this._slot.status === 'submitted' ?
          '<div class="eval-submitted-banner"><div class="submitted-icon">✓</div><h2>Assessment Submitted</h2><p>Your responses have been recorded. Thank you for completing the assessment for <strong>' + (client&&client.name||'') + '</strong>.</p><p class="text-secondary">Your COE coordinator will review all three evaluator responses and generate a consolidated report.</p></div>' :
          '<div class="eval-main" id="eval-main"></div>'
        ) +
      '</div>';

    //if(this._slot.status === 'submitted'){ return; }

    document.getElementById('btn-eval-logout').addEventListener('click', function(){
      AIT.Auth.logout();
      AIT.Router.go(null);
    });

    if(this._slot.status === 'submitted'){ return; }

    this._renderDimension(this._dimIndex);
    this._updateProgress();
  },

  _updateProgress: function(){
    var self = this;
    var slot = AIT.DB.Slots.byId(this._sess.slotId);
    var dotsEl = document.getElementById('dim-dots');
    var labelEl = document.getElementById('progress-label');
    if(!dotsEl) return;

    var totalAnswered = 0;
    var total = 0;
    AIT.DIMENSIONS.forEach(function(d, idx){
      total += d.subDimensions.length;
      var dimDone = d.subDimensions.filter(function(sd){ return slot.scores && slot.scores[sd.id] && slot.scores[sd.id].score; }).length;
      totalAnswered += dimDone;
    });

    dotsEl.innerHTML = AIT.DIMENSIONS.map(function(d, idx){
      var done = d.subDimensions.every(function(sd){ return slot.scores && slot.scores[sd.id] && slot.scores[sd.id].score; });
      var active = idx === self._dimIndex;
      return '<div class="dim-dot ' + (done ? 'dim-dot--done' : active ? 'dim-dot--active' : '') + '" title="' + d.name + '" data-dim="' + idx + '"></div>';
    }).join('');

    dotsEl.querySelectorAll('.dim-dot').forEach(function(dot){
      dot.addEventListener('click', function(){
        self._dimIndex = parseInt(dot.dataset.dim);
        self._renderDimension(self._dimIndex);
        self._updateProgress();
      });
    });

    if(labelEl) labelEl.textContent = totalAnswered + ' / ' + total + ' answered';
  },

  _renderDimension: function(dimIdx){
    var self  = this;
    var dim   = AIT.DIMENSIONS[dimIdx];
    var slot  = AIT.DB.Slots.byId(this._sess.slotId);
    var isE3  = this._sess.evaluatorRole === 'independent';
    var main  = document.getElementById('eval-main');
    if(!main) return;

    var isFirst = dimIdx === 0;
    var isLast  = dimIdx === AIT.DIMENSIONS.length - 1;
    var allCurrent = dim.subDimensions.every(function(sd){ return slot.scores && slot.scores[sd.id] && slot.scores[sd.id].score; });

    main.innerHTML =
      '<div class="eval-dim-header" style="border-left:4px solid ' + dim.color + '">' +
        '<div class="eval-dim-badge" style="background:' + dim.color + '22;color:' + dim.color + '">' + dim.code + '</div>' +
        '<div>' +
          '<h2 class="eval-dim-title">' + dim.name + '</h2>' +
          '<p class="eval-dim-desc">' + dim.description + '</p>' +
        '</div>' +
        (dim.blocking ? '<div class="blocking-note"><strong>⚠ Governance & Compliance</strong> — Any score below Level 3 is a blocking finding that caps the overall maturity level at L2.</div>' : '') +
      '</div>' +
      '<div class="eval-subdims" id="eval-subdims"></div>' +
      '<div class="eval-nav">' +
        '<button class="btn btn--ghost" id="btn-prev-dim" ' + (isFirst ? 'disabled' : '') + '>← Previous</button>' +
        '<button class="btn btn--ghost btn--save" id="btn-save-dim">Save Progress</button>' +
        (!isLast ? '<button class="btn btn--primary" id="btn-next-dim">Next →</button>' : '<button class="btn btn--success" id="btn-submit-eval">Submit Assessment</button>') +
      '</div>';

    var subdimContainer = document.getElementById('eval-subdims');
    dim.subDimensions.forEach(function(sd){
      var existing = slot.scores && slot.scores[sd.id] || {};
      var sdCard = document.createElement('div');
      sdCard.className = 'subdim-card';
      sdCard.dataset.sdid = sd.id;

      var anchorsHtml = Object.keys(sd.anchors).map(function(lvl){
        return '<div class="anchor-item"><span class="anchor-level" style="background:' + AIT.scoreColor(parseInt(lvl)) + '">L' + lvl + '</span><span class="anchor-text">' + sd.anchors[lvl] + '</span></div>';
      }).join('');

      var evalNoteHtml = (isE3 && sd.evaluatorNote) ?
        '<div class="eval-note"><div class="eval-note__label">📋 Evaluator Note</div><div class="eval-note__text">' + sd.evaluatorNote + '</div></div>' : '';

      sdCard.innerHTML =
        '<div class="subdim-header">' +
          '<h4 class="subdim-name">' + sd.name + '</h4>' +
          '<span class="subdim-type-badge">' + (sd.levelType === 'full' ? 'All levels defined' : 'L1 / L3 / L5 anchored') + '</span>' +
        '</div>' +
        '<p class="subdim-desc">' + sd.description + '</p>' +
        '<div class="score-selector">' +
          '<div class="score-selector__label">Score</div>' +
          '<div class="score-options">' +
            [1,2,3,4,5].map(function(n){
              return '<label class="score-opt ' + (existing.score === n ? 'score-opt--selected' : '') + '" data-score="' + n + '" style="--sc:' + AIT.scoreColor(n) + '">' +
                '<input type="radio" name="score_' + sd.id + '" value="' + n + '" ' + (existing.score === n ? 'checked' : '') + '>' +
                '<span class="score-opt__num">L' + n + '</span>' +
              '</label>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="anchor-list ' + (existing.score ? '' : 'collapsed') + '" id="anchors_' + sd.id + '">' + anchorsHtml + '</div>' +
        evalNoteHtml +
        '<div class="form-group mt-2">' +
          '<label class="text-sm text-secondary">Evidence / Comments <span class="optional">(optional)</span></label>' +
          '<textarea class="comments-field" name="comments_' + sd.id + '" rows="2" placeholder="Describe the specific evidence you observed...">' + (existing.comments || '') + '</textarea>' +
        '</div>';

      /* live: reveal anchors when score selected */
      sdCard.querySelectorAll('.score-opt').forEach(function(opt){
        opt.addEventListener('click', function(){
          sdCard.querySelectorAll('.score-opt').forEach(function(o){ o.classList.remove('score-opt--selected'); });
          opt.classList.add('score-opt--selected');
          var anchorsEl = document.getElementById('anchors_' + sd.id);
          if(anchorsEl) anchorsEl.classList.remove('collapsed');
          /* auto-save score */
          var scoreVal = parseInt(opt.dataset.score);
          var comments = sdCard.querySelector('.comments-field').value;
          AIT.DB.Slots.saveScore(slot.id, sd.id, scoreVal, comments);
          self._updateProgress();
        });
      });

      subdimContainer.appendChild(sdCard);
    });

    document.getElementById('btn-prev-dim').addEventListener('click', function(){
      self._saveCurrentScores(dimIdx);
      self._dimIndex = dimIdx - 1;
      self._renderDimension(self._dimIndex);
      self._updateProgress();
      window.scrollTo(0, 0);
    });

    var nextBtn = document.getElementById('btn-next-dim');
    if(nextBtn) nextBtn.addEventListener('click', function(){
      self._saveCurrentScores(dimIdx);
      self._dimIndex = dimIdx + 1;
      self._renderDimension(self._dimIndex);
      self._updateProgress();
      window.scrollTo(0, 0);
    });

    var saveBtn = document.getElementById('btn-save-dim');
    if(saveBtn) saveBtn.addEventListener('click', function(){
      self._saveCurrentScores(dimIdx);
      AIT.Utils.toast('Progress saved.', 'success');
    });

    var submitBtn = document.getElementById('btn-submit-eval');
    if(submitBtn) submitBtn.addEventListener('click', function(){
      self._saveCurrentScores(dimIdx);
      self._showSubmitConfirm();
    });
  },

  _saveCurrentScores: function(dimIdx){
    var dim  = AIT.DIMENSIONS[dimIdx];
    var slot = AIT.DB.Slots.byId(this._sess.slotId);
    dim.subDimensions.forEach(function(sd){
      var radio = document.querySelector('input[name="score_' + sd.id + '"]:checked');
      var comments = document.querySelector('textarea[name="comments_' + sd.id + '"]');
      if(radio){
        AIT.DB.Slots.saveScore(slot.id, sd.id, parseInt(radio.value), comments ? comments.value : '');
        /* update status to in_progress */
        if(slot.status === 'pending') AIT.DB.Slots.update(slot.id, { status:'in_progress' });
      }
    });
  },

  _showSubmitConfirm: function(){
    var self = this;
    var slot = AIT.DB.Slots.byId(this._sess.slotId);
    var answered = Object.keys(slot.scores || {}).filter(function(k){ return slot.scores[k].score; }).length;
    var total = 37;
    var missing = total - answered;

    AIT.Modal.show({
      title: 'Submit Assessment',
      body: '<p>' + (missing > 0 ? '<strong class="text-warn">⚠ ' + missing + ' sub-dimension(s) have not been scored.</strong> You can still submit, but unanswered items will be recorded as blank.' : '<strong>✓ All ' + total + ' sub-dimensions have been scored.</strong>') + '</p><p class="mt-2">Once submitted, you will not be able to modify your scores. Do you want to submit?</p>',
      confirmLabel: 'Submit Assessment',
      onConfirm: function(modal){
        AIT.DB.Slots.update(slot.id, { status:'submitted', submittedAt: new Date().toISOString() });
        AIT.Modal.close(modal);
        AIT.Utils.toast('Assessment submitted. Thank you!', 'success');
        /* re-render as submitted */
        AIT.Views.Evaluator.render(self._container, self._sess);
      }
    });
  }
};
