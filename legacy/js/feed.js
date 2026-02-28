// ─── GROUNDFLOOR FEED ENGINE (Redesign) ─────────────────────────────────────

(function () {
  const { PITCHES, WEEKLY_DROP, SAMPLE_COMMENTS, STAGES, INDUSTRIES } = window.GROUNDFLOOR_DATA;

  /* STATE */
  let state = {
    activeTab: 'today',
    activeIndustry: 'all',
    activeStage: 'all',
    votes: new Set(),
  };

  /* HELPERS */
  function timeAgo(date) {
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return `${Math.round(diff)}s`;
    if (diff < 3600) return `${Math.round(diff / 60)}m`;
    if (diff < 86400) return `${Math.round(diff / 3600)}h`;
    return `${Math.round(diff / 86400)}d`;
  }

  function scoreClass(s) {
    if (s >= 85) return 's-elite';
    if (s >= 70) return 's-strong';
    if (s >= 55) return 's-mid';
    return 's-weak';
  }

  function scoreFill(s) {
    if (s >= 85) return 'var(--score-elite)';
    if (s >= 70) return 'var(--score-strong)';
    if (s >= 55) return 'var(--score-mid)';
    return 'var(--score-weak)';
  }

  function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getFiltered() {
    let p = [...PITCHES];
    if (state.activeTab === 'today') p.sort((a, b) => a.todayRank - b.todayRank);
    else if (state.activeTab === 'rising') p = p.filter(x => x.risingScore > 70).sort((a, b) => b.risingScore - a.risingScore);
    else if (state.activeTab === 'hof') p = p.filter(x => x.hallOfFame).sort((a, b) => b.aiScore.overall - a.aiScore.overall);
    if (state.activeIndustry !== 'all') p = p.filter(x => x.industry === state.activeIndustry);
    if (state.activeStage !== 'all') p = p.filter(x => x.stage === state.activeStage);
    return p;
  }

  /* PITCH CARD */
  function renderCard(pitch, idx) {
    const voted = state.votes.has(pitch.id);
    const sc = scoreClass(pitch.aiScore.overall);
    const age = timeAgo(pitch.postedAt);

    return `
<article class="pitch-card" data-id="${pitch.id}" tabindex="0" role="button" aria-label="View pitch by ${esc(pitch.founder.name)}">
  <div class="pitch-card__num">${String(idx + 1).padStart(2, '0')}</div>
  <div class="pitch-card__body">
    <div class="pitch-card__top">
      <div class="founder-row">
        <div class="avatar" style="background:${pitch.founder.color};" aria-hidden="true">${esc(pitch.founder.initials)}</div>
        <div class="founder-meta">
          <div class="founder-name">${esc(pitch.founder.name)}</div>
          <div class="founder-tags">
            <span class="tag">${esc(pitch.industry)}</span>
            <span class="tag-dot tag">·</span>
            <span class="tag">${esc(pitch.stage)}</span>
            <span class="tag-dot tag">·</span>
            <span class="tag">${age}</span>
          </div>
        </div>
      </div>
      <button class="score-badge" data-score-id="${pitch.id}" aria-label="AI Score: ${pitch.aiScore.overall}. Click for breakdown.">
        <span class="score-badge__num ${sc}">${pitch.aiScore.overall}</span>
        <span class="score-badge__label">AI</span>
      </button>
    </div>

    <div style="margin-bottom:8px;">
      <div class="pitch-problem-label">Problem</div>
      <p class="pitch-problem">${esc(pitch.problem)}</p>
    </div>
    <div>
      <div class="pitch-solution-label">Solution</div>
      <p class="pitch-solution">${esc(pitch.solution)}</p>
    </div>

    <div class="pitch-actions">
      <button class="act-btn${voted ? ' upvoted' : ''}" data-upvote="${pitch.id}" aria-label="${voted ? 'Remove upvote' : 'Upvote'}" aria-pressed="${voted}">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
          <path d="M5.5 1L10 5H7.5v5h-4V5H1L5.5 1z" fill="${voted ? 'var(--red)' : 'none'}" stroke="${voted ? 'var(--red)' : 'currentColor'}" stroke-width="1.2" stroke-linejoin="round"/>
        </svg>
        <span data-vote="${pitch.id}">${(pitch.upvotes + (voted ? 1 : 0)).toLocaleString()}</span>
      </button>
      <div class="act-sep" aria-hidden="true"></div>
      <button class="act-btn" data-comment="${pitch.id}" aria-label="${pitch.comments} comments">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
          <path d="M9 1H2C1.4 1 1 1.4 1 2v6c0 .6.4 1 1 1h2l2 2 2-2h1c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" fill="none"/>
        </svg>
        ${pitch.comments}
      </button>
      <div class="act-sep" aria-hidden="true"></div>
      <button class="act-btn" aria-label="Share">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
          <path d="M8.5 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-5 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm5 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" stroke="currentColor" stroke-width="1.1" fill="none"/>
          <path d="M4 6l3-1.5M4 7l3 1.5" stroke="currentColor" stroke-width="1.1"/>
        </svg>
        Share
      </button>
      ${pitch.trending ? `<div class="trending-pill" aria-label="Trending">↑ Trending</div>` : ''}
    </div>
  </div>
</article>`;
  }

  /* MODAL */
  const DIMS = [
    { label: 'Clarity', key: 'clarity' },
    { label: 'Market Size', key: 'marketSize' },
    { label: 'Differentiation', key: 'differentiation' },
    { label: 'Founder–Market Fit', key: 'founderMarketFit' },
    { label: 'Conviction', key: 'conviction' },
  ];

  const ROLES = ['Founder', 'Operator', 'Potential Customer', 'Investor', 'Builder'];
  const ROLE_COLORS = { Founder: '#a855f7', Operator: '#e85d04', 'Potential Customer': '#16a34a', Investor: '#d97706', Builder: '#2563eb' };

  function openScoreModal(pitch) {
    const dimsHTML = DIMS.map(d => {
      const v = pitch.aiScore[d.key];
      return `
<div class="score-dim">
  <span class="score-dim__label">${d.label}</span>
  <div class="score-dim__bar"><div class="score-dim__fill" style="width:${v}%; background:${scoreFill(v)};"></div></div>
  <span class="score-dim__val ${scoreClass(v)}">${v}</span>
</div>`;
    }).join('');

    const comments = (SAMPLE_COMMENTS[pitch.id] || []).map(c => {
      const initials = c.author.split(' ').map(n => n[0]).join('');
      const color = c.roleColor;
      return `
<div class="comment">
  <div class="avatar avatar--sm" style="background:${color};">${initials}</div>
  <div class="comment__body">
    <div class="comment__header">
      <span class="comment__author">${esc(c.author)}</span>
      <span class="role-pill" style="background:${color}18; color:${color}; border-color:${color}30;">${esc(c.role)}</span>
      <span class="comment__time">${c.time}</span>
    </div>
    <p class="comment__text">${esc(c.text)}</p>
  </div>
</div>`;
    }).join('');

    const roleOpts = ROLES.map(r => `<option value="${r}">${r}</option>`).join('');

    document.getElementById('modal-title').textContent = `${pitch.founder.name} · AI Score ${pitch.aiScore.overall}`;
    document.getElementById('modal-body').innerHTML = `
<div style="display:flex; align-items:center; gap:12px; margin-bottom:18px; padding-bottom:18px; border-bottom:1px solid var(--border);">
  <div class="avatar avatar--lg" style="background:${pitch.founder.color};">${esc(pitch.founder.initials)}</div>
  <div style="flex:1; min-width:0;">
    <div style="font-size:0.9rem; font-weight:700;">${esc(pitch.founder.name)}</div>
    <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">${esc(pitch.founder.location)}</div>
    <div style="font-size:0.72rem; color:var(--text-muted); margin-top:1px;">${esc(pitch.founder.bio)}</div>
  </div>
  <div class="score-badge" style="cursor:default; width:56px; height:48px;">
    <span class="score-badge__num ${scoreClass(pitch.aiScore.overall)}" style="font-size:1.2rem;">${pitch.aiScore.overall}</span>
    <span class="score-badge__label">AI Score</span>
  </div>
</div>

<div style="margin-bottom:16px;">
  <div style="font-size:0.62rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--text-muted); margin-bottom:10px;">Score Breakdown</div>
  ${dimsHTML}
</div>

<div style="margin-bottom:18px;">
  <div class="insight insight--flaw"><div class="insight__label">⚡ Fatal Flaw</div>${esc(pitch.aiScore.fatalFlaw)}</div>
  <div class="insight insight--signal"><div class="insight__label">✦ Strongest Signal</div>${esc(pitch.aiScore.strongestSignal)}</div>
  <div class="insight insight--question"><div class="insight__label">? Investor's First Question</div>${esc(pitch.aiScore.investorQuestion)}</div>
</div>

<div style="border-top:1px solid var(--border); padding-top:18px;">
  <div style="font-size:0.62rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--text-muted); margin-bottom:12px;">Community Feedback (${pitch.comments})</div>
  <div id="comments-list">${comments || '<p style="font-size:0.8rem; color:var(--text-muted); padding:12px 0;">No comments yet — be the first.</p>'}</div>
  <div style="margin-top:14px; padding-top:14px; border-top:1px solid var(--border);">
    <select id="c-role" class="form-select" style="margin-bottom:8px; font-size:0.8rem; padding:8px 10px;">
      <option value="">Select your role…</option>
      ${roleOpts}
    </select>
    <textarea id="c-text" class="form-textarea" rows="2" placeholder="What do you actually think? Be specific." maxlength="280" style="margin-bottom:8px; font-size:0.82rem;"></textarea>
    <button id="c-submit" class="btn btn--secondary btn--sm" data-pid="${pitch.id}">Post feedback</button>
  </div>
</div>`;

    document.getElementById('modal-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';

    // Animate bars
    setTimeout(() => {
      document.querySelectorAll('.score-dim__fill').forEach(f => {
        const w = f.style.width;
        f.style.width = '0';
        setTimeout(() => f.style.width = w, 30);
      });
    }, 80);
  }

  /* WEEKLY DROP */
  function renderWeeklyDrop() {
    const html = WEEKLY_DROP.map((p, i) => `
<div class="drop-item" data-id="${p.id}" role="listitem" tabindex="0" aria-label="${esc(p.founder.name)}, ${esc(p.industry)}">
  <span class="drop-item__rank">${i + 1}</span>
  <div class="avatar avatar--sm" style="background:${p.founder.color};">${esc(p.founder.initials)}</div>
  <div class="drop-item__info">
    <div class="drop-item__name">${esc(p.founder.name)}</div>
    <div class="drop-item__sub">${esc(p.industry)} · ${esc(p.stage)}</div>
  </div>
  <span class="drop-item__score ${scoreClass(p.aiScore.overall)}">${p.aiScore.overall}</span>
</div>`).join('');
    const el = document.getElementById('weekly-drop-list');
    if (el) el.innerHTML = html;
  }

  /* COUNTDOWN */
  function tick() {
    const now = new Date();
    const mid = new Date(now); mid.setHours(24, 0, 0, 0);
    const d = mid - now;
    const h = String(Math.floor(d / 3600000)).padStart(2, '0');
    const m = String(Math.floor((d % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((d % 60000) / 1000)).padStart(2, '0');
    const el = document.getElementById('daily-countdown');
    if (el) el.textContent = `Resets ${h}:${m}:${s}`;
  }

  /* RENDER FEED */
  function renderFeed() {
    const pitches = getFiltered();
    const list = document.getElementById('pitch-list');
    if (!pitches.length) {
      list.innerHTML = `<div style="padding:48px 0; text-align:center; color:var(--text-muted); font-size:0.85rem;">No pitches match your filters.</div>`;
      return;
    }
    list.innerHTML = pitches.map((p, i) => renderCard(p, i)).join('');
    // update tab counts
    const cnt = (tab) => {
      if (tab === 'today') return PITCHES.length;
      if (tab === 'rising') return PITCHES.filter(x => x.risingScore > 70).length;
      if (tab === 'hof') return PITCHES.filter(x => x.hallOfFame).length;
      return 0;
    };
    ['today', 'rising', 'hof'].forEach(t => {
      const el = document.querySelector(`[data-tab="${t}"] .tab-count`);
      if (el) el.textContent = cnt(t);
    });
  }

  /* HOF FILTERS */
  function renderHofFilters() {
    const c = document.getElementById('hof-filters');
    if (!c) return;
    c.innerHTML = `
<select class="hof-sel" id="hof-ind"><option value="all">All Industries</option>${INDUSTRIES.map(i => `<option value="${i}"${i === state.activeIndustry ? ' selected' : ''}>${i}</option>`).join('')}</select>
<select class="hof-sel" id="hof-stg"><option value="all">All Stages</option>${STAGES.map(s => `<option value="${s}"${s === state.activeStage ? ' selected' : ''}>${s}</option>`).join('')}</select>`;
    document.getElementById('hof-ind').addEventListener('change', e => { state.activeIndustry = e.target.value; renderFeed(); });
    document.getElementById('hof-stg').addEventListener('change', e => { state.activeStage = e.target.value; renderFeed(); });
  }

  /* CLOSE MODAL */
  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* EVENTS */
  function bindEvents() {
    // Tabs
    document.querySelectorAll('.feed-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const t = tab.dataset.tab;
        state.activeTab = t;
        state.activeIndustry = 'all';
        state.activeStage = 'all';
        document.querySelectorAll('.feed-tab').forEach(el => {
          el.classList.remove('active');
          el.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const hof = document.getElementById('hof-filters');
        if (hof) hof.style.display = t === 'hof' ? 'flex' : 'none';
        renderFeed();
        if (t === 'hof') renderHofFilters();
      });
    });

    // Chips
    document.querySelectorAll('.chip[data-industry]').forEach(chip => {
      chip.addEventListener('click', () => {
        state.activeIndustry = chip.dataset.industry;
        document.querySelectorAll('.chip[data-industry]').forEach(c => {
          c.classList.remove('active');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');
        renderFeed();
      });
    });

    // Feed delegation
    document.getElementById('pitch-list').addEventListener('click', e => {
      // Upvote
      const upvBtn = e.target.closest('[data-upvote]');
      if (upvBtn) {
        e.stopPropagation();
        const id = upvBtn.dataset.upvote;
        const pitch = PITCHES.find(p => p.id === id);
        if (!pitch) return;
        if (state.votes.has(id)) { state.votes.delete(id); pitch.upvotes--; upvBtn.classList.remove('upvoted'); upvBtn.setAttribute('aria-pressed', 'false'); }
        else { state.votes.add(id); pitch.upvotes++; upvBtn.classList.add('upvoted'); upvBtn.setAttribute('aria-pressed', 'true'); }
        const disp = document.querySelector(`[data-vote="${id}"]`);
        if (disp) disp.textContent = pitch.upvotes.toLocaleString();
        // restyle arrow
        const path = upvBtn.querySelector('path');
        if (path) {
          const voted = state.votes.has(id);
          path.setAttribute('fill', voted ? 'var(--red)' : 'none');
          path.setAttribute('stroke', voted ? 'var(--red)' : 'currentColor');
        }
        return;
      }

      // Score badge
      const scoreBtn = e.target.closest('[data-score-id]');
      if (scoreBtn) {
        e.stopPropagation();
        const pitch = PITCHES.find(p => p.id === scoreBtn.dataset.scoreId);
        if (pitch) openScoreModal(pitch);
        return;
      }

      // Comment btn
      const commentBtn = e.target.closest('[data-comment]');
      if (commentBtn) {
        e.stopPropagation();
        const pitch = PITCHES.find(p => p.id === commentBtn.dataset.comment);
        if (pitch) openScoreModal(pitch);
        return;
      }

      // Card click
      const card = e.target.closest('.pitch-card');
      if (card) {
        const pitch = PITCHES.find(p => p.id === card.dataset.id);
        if (pitch) openScoreModal(pitch);
      }
    });

    // Keyboard on cards
    document.getElementById('pitch-list').addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.pitch-card');
        if (card) { e.preventDefault(); card.click(); }
      }
    });

    // Weekly Drop
    document.getElementById('weekly-drop-list').addEventListener('click', e => {
      const item = e.target.closest('[data-id]');
      if (item) {
        const pitch = PITCHES.find(p => p.id === item.dataset.id);
        if (pitch) openScoreModal(pitch);
      }
    });

    // Modal close
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', e => {
      if (e.target === document.getElementById('modal-overlay')) closeModal();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    // Comment submit
    document.getElementById('modal-body').addEventListener('click', e => {
      const btn = e.target.closest('#c-submit');
      if (!btn) return;
      const role = document.getElementById('c-role')?.value;
      const text = document.getElementById('c-text')?.value.trim();
      if (!role) { alert('Please select your role.'); return; }
      if (!text) { alert('Please write your feedback.'); return; }
      const pitchId = btn.dataset.pid;
      const pitch = PITCHES.find(p => p.id === pitchId);
      if (!pitch) return;
      if (!SAMPLE_COMMENTS[pitchId]) SAMPLE_COMMENTS[pitchId] = [];
      SAMPLE_COMMENTS[pitchId].push({
        id: 'tmp' + Date.now(), author: 'You', role,
        roleColor: ROLE_COLORS[role] || '#888', text, time: 'now', upvotes: 0
      });
      pitch.comments++;
      // Re-render comments section
      const cl = document.getElementById('comments-list');
      if (cl) {
        const c = SAMPLE_COMMENTS[pitchId].map(c => {
          const init = c.author.split(' ').map(n => n[0]).join('');
          return `<div class="comment">
  <div class="avatar avatar--sm" style="background:${c.roleColor};">${init}</div>
  <div class="comment__body">
    <div class="comment__header">
      <span class="comment__author">${esc(c.author)}</span>
      <span class="role-pill" style="background:${c.roleColor}18; color:${c.roleColor}; border-color:${c.roleColor}30;">${esc(c.role)}</span>
      <span class="comment__time">${c.time}</span>
    </div>
    <p class="comment__text">${esc(c.text)}</p>
  </div>
</div>`;
        }).join('');
        cl.innerHTML = c;
      }
      document.getElementById('c-text').value = '';
    });
  }

  /* LIVE COUNTS */
  function simulateLive() {
    setInterval(() => {
      const idx = Math.floor(Math.random() * PITCHES.length);
      const p = PITCHES[idx];
      p.upvotes += Math.random() > 0.6 ? 1 : 0;
      const disp = document.querySelector(`[data-vote="${p.id}"]`);
      if (disp && !state.votes.has(p.id)) disp.textContent = p.upvotes.toLocaleString();
    }, 10000);
  }

  /* INIT */
  document.addEventListener('DOMContentLoaded', () => {
    renderFeed();
    renderWeeklyDrop();
    tick();
    setInterval(tick, 1000);
    bindEvents();
    simulateLive();
    const hof = document.getElementById('hof-filters');
    if (hof) hof.style.display = 'none';
  });
})();
