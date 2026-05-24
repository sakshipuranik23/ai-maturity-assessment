/* ═══════════════════════════════════════════════════════════════
   AIT — views/report.js  |  Assessment Report with Heatmap
   ═══════════════════════════════════════════════════════════════ */
AIT.Views.Report = {

  render: function(container, params){
    var self = this;
    var client = AIT.DB.Clients.byId(params.clientId);
    var asmt   = AIT.DB.Assessments.byClient(params.clientId);
    if(!client || !asmt){ container.innerHTML = '<div class="alert alert--red">Assessment not found.</div>'; return; }

    var slots  = AIT.DB.Slots.byAssessment(asmt.id);
    var s1 = slots.find(function(s){ return s.slotNumber === 1; });
    var s2 = slots.find(function(s){ return s.slotNumber === 2; });
    var s3 = slots.find(function(s){ return s.slotNumber === 3; });
    var recon = asmt.reconciledScores || {};
    var overrides = AIT.DB.Overrides.byAssessment(asmt.id);
    var approvedOvrs = {};
    overrides.filter(function(o){ return o.status === 'approved'; }).forEach(function(o){
      if(!approvedOvrs[o.slotId]) approvedOvrs[o.slotId] = {};
      approvedOvrs[o.slotId][o.subDimId] = o.requestedScore;
    });

    /* Compute D6 blocking */
    var d6Blocked = false;
    AIT.DIMENSIONS.find(function(d){ return d.id === 'd6'; }).subDimensions.forEach(function(sd){
      [s1,s2,s3].forEach(function(sl){
        if(!sl) return;
        var sc = self._getScore(sl, sd.id, approvedOvrs);
        if(sc && sc <= 2) d6Blocked = true;
      });
    });

    /* Dimension averages per slot */
    function dimAvg(slot, dimId){
      var d = AIT.DIMENSIONS.find(function(x){ return x.id === dimId; });
      if(!d || !slot) return null;
      var scores = d.subDimensions.map(function(sd){ return self._getScore(slot, sd.id, approvedOvrs); }).filter(function(v){ return v; });
      return scores.length ? (scores.reduce(function(a,b){ return a+b; },0)/scores.length) : null;
    }

    /* Perception gap list */
    var perceptionGaps = [];
    AIT.DIMENSIONS.forEach(function(d){
      d.subDimensions.forEach(function(sd){
        var sc1 = s1 && self._getScore(s1, sd.id, approvedOvrs);
        var sc2 = s2 && self._getScore(s2, sd.id, approvedOvrs);
        var sc3 = s3 && self._getScore(s3, sd.id, approvedOvrs);
        if(sc1 && sc2 && Math.abs(sc1 - sc2) >= 2){
          var flag = sc1 > sc2 ? 'Perception Gap (Leader > Team Lead)' : 'Implementation Gap (Team Lead > Leader)';
          perceptionGaps.push({ dim:d, sd:sd, sc1:sc1, sc2:sc2, sc3:sc3, flag:flag });
        } else if(sc3 && sc1 && sc2 && sc3 < sc1 && sc3 < sc2){
          perceptionGaps.push({ dim:d, sd:sd, sc1:sc1, sc2:sc2, sc3:sc3, flag:'Reality Gap (Independent below both)' });
        }
      });
    });

    container.innerHTML =
      '<div class="report-header">' +
        '<div>' +
          '<div class="report-breadcrumb"><a href="#" id="rpt-back">← Back to Assessment</a></div>' +
          '<h2 class="report-title">' + client.name + ' — Maturity Report</h2>' +
          '<div class="report-meta">' + AIT.Utils.statusBadge('completed') + ' &nbsp; Generated: ' + AIT.Utils.formatDate(asmt.reportGeneratedAt) + '</div>' +
        '</div>' +
        '<button class="btn btn--ghost" onclick="window.print()">⎙ Print / Export PDF</button>' +
      '</div>' +

      (d6Blocked ? '<div class="alert alert--red alert--lg"><strong>⚠ D6 Blocking Finding Active</strong><br>One or more Governance &amp; Compliance sub-dimensions scored at Level 1 or 2. The overall maturity level is capped at <strong>Level 2</strong> until all D6 gaps are resolved. Governance gaps in a financial services context create regulatory risk regardless of performance in other dimensions.</div>' : '') +

      /* ─ Score Summary Cards ─ */
      '<div class="score-summary">' +
        AIT.DIMENSIONS.map(function(d){
          var a1 = dimAvg(s1, d.id), a2 = dimAvg(s2, d.id), a3 = dimAvg(s3, d.id);
          var avg = AIT.Utils.avg([a1,a2,a3]);
          var avgScore = avg ? Math.round(avg) : null;
          return '<div class="score-card" style="border-top:3px solid ' + d.color + '">' +
            '<div class="score-card__code">' + d.code + '</div>' +
            '<div class="score-card__name">' + d.name + '</div>' +
            '<div class="score-card__scores">' +
              '<div class="score-pip" style="background:' + AIT.scoreColor(a1&&Math.round(a1)) + '" title="Leadership">E1: ' + (a1?a1.toFixed(1):'—') + '</div>' +
              '<div class="score-pip" style="background:' + AIT.scoreColor(a2&&Math.round(a2)) + '" title="Tech Lead">E2: ' + (a2?a2.toFixed(1):'—') + '</div>' +
              '<div class="score-pip" style="background:' + AIT.scoreColor(a3&&Math.round(a3)) + '" title="Independent">E3: ' + (a3?a3.toFixed(1):'—') + '</div>' +
            '</div>' +
            '<div class="score-card__avg" style="color:' + AIT.scoreColor(avgScore) + '">' + (avg ? avg.toFixed(1) : '—') + '</div>' +
          '</div>';
        }).join('') +
      '</div>' +

      /* ─ Heatmap ─ */
      '<div class="card mt-4">' +
        '<div class="card-header"><h3>Current State Heatmap</h3><p class="text-sm text-secondary">Scores per sub-dimension across all three evaluators. Target: Level 4 (default).</p></div>' +
        '<div class="heatmap-wrap">' +
          '<table class="heatmap-table">' +
            '<thead><tr>' +
              '<th class="hm-dim">Dimension</th>' +
              '<th class="hm-sd">Sub-dimension</th>' +
              '<th class="hm-score">E1<br><span class="hm-sub">Leadership</span></th>' +
              '<th class="hm-score">E2<br><span class="hm-sub">Tech Lead</span></th>' +
              '<th class="hm-score">E3<br><span class="hm-sub">Independent</span></th>' +
              '<th class="hm-score">Avg</th>' +
              '<th class="hm-recon">Reconciled<br><span class="hm-sub">Manual</span></th>' +
              '<th class="hm-target">Target</th>' +
              '<th class="hm-gap">Gap</th>' +
            '</tr></thead>' +
            '<tbody id="heatmap-body"></tbody>' +
          '</table>' +
        '</div>' +
        '<div class="heatmap-save-row">' +
          '<button class="btn btn--primary" id="btn-save-recon">💾 Save Reconciled Scores</button>' +
          '<span class="text-sm text-secondary ml-2">Enter reconciled scores in the table above and save.</span>' +
        '</div>' +
      '</div>' +

      /* ─ Perception Gap Report ─ */
      '<div class="card mt-4">' +
        '<div class="card-header"><h3>Perception Gap Report</h3><p class="text-sm text-secondary">Sub-dimensions where Leader and Team Lead scores diverge by 2 or more points, or where the Independent Evaluator scores below both.</p></div>' +
        '<div class="card-body">' +
          (perceptionGaps.length === 0 ? '<div class="empty-state">No significant perception gaps detected.</div>' :
            '<table class="data-table">' +
              '<thead><tr><th>Dimension</th><th>Sub-dimension</th><th>E1</th><th>E2</th><th>E3</th><th>Flag</th></tr></thead>' +
              '<tbody>' + perceptionGaps.map(function(g){
                return '<tr class="gap-row">' +
                  '<td><span class="dim-tag" style="color:' + g.dim.color + ';background:' + g.dim.color + '22">' + g.dim.code + '</span></td>' +
                  '<td><strong>' + g.sd.name + '</strong></td>' +
                  '<td>' + self._scoreBadge(g.sc1, false) + '</td>' +
                  '<td>' + self._scoreBadge(g.sc2, false) + '</td>' +
                  '<td>' + self._scoreBadge(g.sc3, false) + '</td>' +
                  '<td><span class="flag-badge ' + (g.flag.includes('Reality') ? 'flag--red' : g.flag.includes('Implementation') ? 'flag--orange' : 'flag--yellow') + '">' + g.flag + '</span></td>' +
                '</tr>';
              }).join('') +
              '</tbody></table>') +
        '</div>' +
      '</div>' +

      /* ─ ROI Scenario ─ */
      '<div class="card mt-4 card--disabled">' +
        '<div class="card-header"><h3>ROI Scenario <span class="badge badge--gray ml-2">Coming Soon</span></h3><p class="text-sm text-secondary">Cost saving and throughput improvement estimates based on gap analysis and Section 4 benchmarks. Requires benchmark dataset — coming in a future release.</p></div>' +
      '</div>';

    /* Render heatmap body */
    var tbody = document.getElementById('heatmap-body');
    AIT.DIMENSIONS.forEach(function(d){
      var sdCount = d.subDimensions.length;
      d.subDimensions.forEach(function(sd, sIdx){
        var sc1 = s1 && self._getScore(s1, sd.id, approvedOvrs);
        var sc2 = s2 && self._getScore(s2, sd.id, approvedOvrs);
        var sc3 = s3 && self._getScore(s3, sd.id, approvedOvrs);
        var avg = AIT.Utils.avg([sc1,sc2,sc3]);
        var reconVal = recon[sd.id] || '';
        var target = 4;
        var gapBase = reconVal || (avg ? Math.round(avg) : null);
        var gap = gapBase ? target - gapBase : null;

        var isOvr1 = approvedOvrs[s1&&s1.id] && approvedOvrs[s1.id][sd.id];
        var isOvr2 = approvedOvrs[s2&&s2.id] && approvedOvrs[s2.id][sd.id];
        var isOvr3 = approvedOvrs[s3&&s3.id] && approvedOvrs[s3.id][sd.id];

        var tr = document.createElement('tr');
        tr.className = (d.blocking && (sc1 <= 2 || sc2 <= 2 || sc3 <= 2)) ? 'hm-row hm-row--blocking' : 'hm-row';
        tr.innerHTML =
          (sIdx === 0 ? '<td class="hm-dim-cell" rowspan="' + sdCount + '" style="border-left:4px solid ' + d.color + '"><span class="dim-code-tag">' + d.code + '</span><br>' + d.name + '</td>' : '') +
          '<td class="hm-sd-cell">' + sd.name + '</td>' +
          '<td class="hm-score-cell">' + self._scoreBadge(sc1, isOvr1) + '</td>' +
          '<td class="hm-score-cell">' + self._scoreBadge(sc2, isOvr2) + '</td>' +
          '<td class="hm-score-cell">' + self._scoreBadge(sc3, isOvr3) + '</td>' +
          '<td class="hm-score-cell">' + self._scoreBadge(avg ? Math.round(avg*10)/10 : null, false) + '</td>' +
          '<td class="hm-recon-cell">' +
            '<input type="number" class="recon-input" data-sdid="' + sd.id + '" min="1" max="5" value="' + (reconVal||'') + '" placeholder="—">' +
          '</td>' +
          '<td class="hm-target-cell">' + self._scoreBadge(target, false) + '</td>' +
          '<td class="hm-gap-cell ' + (gap === null ? '' : gap <= 0 ? 'gap--met' : gap === 1 ? 'gap--close' : 'gap--far') + '">' +
            (gap === null ? '—' : gap <= 0 ? '✓ Met' : '+' + gap) +
          '</td>';
        tbody.appendChild(tr);
      });
    });

    /* Save reconciled scores */
    document.getElementById('btn-save-recon').addEventListener('click', function(){
      var inputs = document.querySelectorAll('.recon-input');
      var newRecon = Object.assign({}, recon);
      inputs.forEach(function(inp){
        var val = parseInt(inp.value);
        if(val >= 1 && val <= 5) newRecon[inp.dataset.sdid] = val;
        else if(inp.value === '') delete newRecon[inp.dataset.sdid];
      });
      AIT.DB.Assessments.update(asmt.id, { reconciledScores: newRecon });
      AIT.Utils.toast('Reconciled scores saved.', 'success');
    });

    document.getElementById('rpt-back').addEventListener('click', function(e){
      e.preventDefault();
      AIT.Views.COE._renderAssessmentStatus(client, asmt);
    });
  },

  _getScore: function(slot, subDimId, approvedOvrs){
    if(!slot) return null;
    /* check override first */
    if(approvedOvrs && approvedOvrs[slot.id] && approvedOvrs[slot.id][subDimId]) return approvedOvrs[slot.id][subDimId];
    var sc = slot.scores && slot.scores[subDimId];
    return sc && sc.score ? sc.score : null;
  },

  _scoreBadge: function(score, isOverride){
    if(!score) return '<span class="score-badge score-badge--empty">—</span>';
    var rounded = Math.round(score);
    return '<span class="score-badge ' + (isOverride ? 'score-badge--override' : '') + '" style="background:' + AIT.scoreColor(rounded) + '" title="' + (isOverride ? 'Score overridden by COE + Admin' : '') + '">' + score + '</span>';
  }
};
