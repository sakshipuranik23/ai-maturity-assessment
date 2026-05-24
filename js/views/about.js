/* ═══════════════════════════════════════════════════════════════
   AIT — views/about.js  |  Assessment Framework Reference
   ═══════════════════════════════════════════════════════════════ */
AIT.Views.About = {
  render: function(container){
    container.innerHTML =
      '<div class="page-header">' +
        '<div><h2>Assessment Framework</h2><p class="text-secondary">Six dimensions, 37 sub-dimensions. Evaluated by three independent evaluators.</p></div>' +
        '<button class="btn btn--ghost" onclick="window.print()">⎙ Print Framework</button>' +
      '</div>' +

      /* Score interpretation */
      '<div class="card mb-4">' +
        '<div class="card-header"><h3>Score Interpretation</h3></div>' +
        '<div class="card-body">' +
          '<div class="score-legend">' +
            [1,2,3,4,5].map(function(n){
              var labels = {1:'Initial / Ad hoc',2:'Developing',3:'Structured',4:'Integrated',5:'Autonomous'};
              return '<div class="legend-item"><span class="score-badge" style="background:' + AIT.scoreColor(n) + '">L' + n + '</span>' +
                '<div class="legend-text"><strong>' + labels[n] + '</strong>' +
                '<p>' + ({
                  1:'No structured practice exists. Activity is ad hoc, reactive, and individually driven.',
                  2:'Early practices are emerging. Basic processes exist but are inconsistently applied.',
                  3:'Structured, repeatable practices are in place and consistently followed. A governance owner is named.',
                  4:'Practices are embedded across the delivery cycle. Metrics-driven decision making is in place.',
                  5:'Practices are self-reinforcing, continuously improving, and demonstrably effective against external benchmarks.'
                }[n]) + '</p>' +
              '</div></div>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</div>' +

      /* Dimension cards */
      AIT.DIMENSIONS.map(function(d){
        return '<div class="card mb-4 dim-card" id="dim-' + d.id + '">' +
          '<div class="card-header dim-card__header" style="border-left:4px solid ' + d.color + '">' +
            '<div>' +
              '<div class="dim-card__badge" style="background:' + d.color + '22;color:' + d.color + '">' + d.code + '</div>' +
              '<h3 class="dim-card__name">' + d.name + '</h3>' +
              (d.blocking ? '<span class="badge badge--red ml-2">⚠ Blocking — D6 gaps cap overall score at L2</span>' : '') +
            '</div>' +
            '<button class="btn-icon dim-toggle" data-dim="' + d.id + '">▾</button>' +
          '</div>' +
          '<div class="card-body dim-card__body" id="dimbody-' + d.id + '">' +
            '<p class="dim-desc">' + d.description + '</p>' +
            d.subDimensions.map(function(sd){
              return '<div class="sd-row">' +
                '<div class="sd-row__header">' +
                  '<strong class="sd-row__name">' + sd.name + '</strong>' +
                  '<span class="sd-type-tag">' + (sd.levelType === 'full' ? 'L1–L5' : 'L1/L3/L5') + '</span>' +
                '</div>' +
                '<p class="sd-row__desc">' + sd.description + '</p>' +
                '<div class="anchor-grid">' +
                  Object.keys(sd.anchors).map(function(lvl){
                    return '<div class="anchor-grid__item">' +
                      '<span class="anchor-lvl" style="background:' + AIT.scoreColor(parseInt(lvl)) + '">L' + lvl + '</span>' +
                      '<span class="anchor-txt">' + sd.anchors[lvl] + '</span>' +
                    '</div>';
                  }).join('') +
                '</div>' +
                (sd.evaluatorNote ?
                  '<div class="sd-eval-note"><span class="eval-note-icon">📋</span><strong>Evaluator Note (E3 only):</strong> ' + sd.evaluatorNote + '</div>' : '') +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>';
      }).join('') +

      /* Reconciliation rules */
      '<div class="card mb-4">' +
        '<div class="card-header"><h3>Reconciliation Rules</h3><p class="text-sm text-secondary">Applied after all three evaluators submit. The COE manually enters the reconciled score for each sub-dimension.</p></div>' +
        '<div class="card-body">' +
          '<table class="data-table">' +
            '<thead><tr><th>Pattern</th><th>Flag</th><th>Reconciliation Action</th></tr></thead>' +
            '<tbody>' +
              AIT.RECON_RULES.map(function(r){
                return '<tr><td>' + r.pattern + '</td><td><span class="flag-badge flag--yellow">' + r.flag + '</span></td><td>' + r.action + '</td></tr>';
              }).join('') +
            '</tbody>' +
          '</table>' +
          '<p class="mt-3 text-sm text-secondary"><strong>Note (v1):</strong> Reconciliation score is entered manually by the COE member. Auto-flagging based on the rules above is displayed in the Perception Gap Report. A guided reconciliation confirmation flow is planned for v2.</p>' +
        '</div>' +
      '</div>';

    /* Collapsible dims */
    container.querySelectorAll('.dim-toggle').forEach(function(btn){
      btn.addEventListener('click', function(){
        var body = document.getElementById('dimbody-' + btn.dataset.dim);
        if(body){
          body.classList.toggle('collapsed');
          btn.textContent = body.classList.contains('collapsed') ? '▸' : '▾';
        }
      });
    });
  }
};
