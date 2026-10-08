// Renders the Archive page from Archive/archive.json.
// To publish a new issue, add an entry to "issues" in that file — no HTML changes needed.
(function () {
  const DATA_URL = 'Archive/archive.json';
  const root = document.getElementById('archiveRoot');
  const nav = document.getElementById('issueNav');

  const ICON_PDF = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>';
  const ICON_DOWNLOAD = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>';
  const ICON_CHEVRON = '<svg class="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>';

  // ---------- helpers ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const href = (p) => encodeURI(p || '');
  const issueId = (i) => i.id || `v${i.volume}-i${i.issue}`;
  const issueLabel = (i) => `Volume ${i.volume}, Issue ${i.issue}`;
  const issueDate = (i) => [i.month, i.year].filter(Boolean).join(' ');

  function pages(p) {
    if (!p || p.start == null) return '';
    return p.end == null || p.start === p.end ? `p. ${p.start}` : `pp. ${p.start}&ndash;${p.end}`;
  }
  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return isNaN(d) ? esc(iso) : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  const fmtSize = (n) => (n ? `PDF &middot; ${(n / 1048576).toFixed(1)} MB` : 'PDF');

  // ---------- renderers ----------
  function renderNav(issues, activeId) {
    if (!nav) return;
    nav.innerHTML = issues.map((i) => {
      const active = issueId(i) === activeId;
      return `<a href="#${issueId(i)}" class="shrink-0 px-4 py-3 text-sm font-semibold tracking-wide uppercase border-b-2 transition ${active ? 'text-white border-brand-400' : 'text-navy-200 border-transparent hover:text-white'}">Vol ${esc(i.volume)} &middot; Issue ${esc(i.issue)}${i.year ? ` <span class="font-normal normal-case text-navy-300">(${esc(i.year)})</span>` : ''}</a>`;
    }).join('');
  }

  function renderCover(issue) {
    const link = issue.cover && issue.cover.pdf;
    const inner = issue.cover && issue.cover.image
      ? `<img src="${href(issue.cover.image)}" alt="Cover of ${esc(issueLabel(issue))}" class="w-full rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition" />`
      : `<div class="aspect-[3/4] rounded-lg bg-gradient-to-br from-navy-900 to-navy-700 text-white flex flex-col items-center justify-center text-center p-4 shadow-md">
           <span class="font-serif text-2xl font-bold">CJIAR</span>
           <span class="mt-2 text-sm text-navy-100">${esc(issueLabel(issue))}</span>
           <span class="text-xs text-navy-200">${esc(issueDate(issue))}</span>
         </div>`;
    return link
      ? `<a href="${href(link)}" target="_blank" rel="noopener" class="block mx-auto w-48 md:w-full">${inner}</a>`
      : `<div class="mx-auto w-48 md:w-full">${inner}</div>`;
  }

  function renderFrontMatter(items) {
    if (!items || !items.length) return '';
    return `
      <h3 class="font-serif text-xl font-bold text-navy-900 mb-4">Front Matter</h3>
      <div class="bg-white border border-slate-100 rounded-2xl shadow-soft overflow-hidden mb-10">
        <ul class="divide-y divide-slate-100 text-sm">
          ${items.map((fm) => `
          <li>
            <a href="${href(fm.pdf)}" target="_blank" rel="noopener" class="flex items-center justify-between gap-4 px-5 py-3 hover:bg-brand-50 transition group">
              <span class="flex items-center gap-3 text-navy-900 group-hover:text-brand-700"><span class="text-brand-500">${ICON_PDF}</span>${esc(fm.title)}</span>
              <span class="text-xs text-slate-400 whitespace-nowrap">${pages(fm.pages)}</span>
            </a>
          </li>`).join('')}
        </ul>
      </div>`;
  }

  function renderArticle(a, n) {
    const authors = a.authors || [];
    const multi = authors.length > 1;
    const names = authors.map((au, i) => esc(au.name) + (multi ? `<sup>${i + 1}</sup>` : '')).join(', ');
    const affils = authors.filter((au) => au.affiliation)
      .map((au) => `<li>${multi ? `<sup>${authors.indexOf(au) + 1}</sup> ` : ''}${esc(au.affiliation)}</li>`).join('');
    const meta = [
      a.received && `<span>Received: <span class="text-slate-700">${fmtDate(a.received)}</span></span>`,
      a.accepted && `<span>Accepted: <span class="text-slate-700">${fmtDate(a.accepted)}</span></span>`,
      a.published && `<span>Published: <span class="text-slate-700">${fmtDate(a.published)}</span></span>`,
      a.jel && a.jel.length && `<span>JEL: <span class="text-slate-700">${esc(a.jel.join(', '))}</span></span>`,
      a.doi && `<span>DOI: <a href="https://doi.org/${esc(a.doi)}" target="_blank" rel="noopener" class="text-brand-700 hover:underline">${esc(a.doi)}</a></span>`,
    ].filter(Boolean).join('');
    const keywords = (a.keywords || []).map((k) => `<span class="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">${esc(k)}</span>`).join('');
    const pdf = href(a.pdf);

    return `
      <article id="${esc(a.id || '')}" class="scroll-mt-24 bg-white border border-slate-100 rounded-2xl shadow-soft p-6 sm:p-8">
        <div class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide mb-3">
          <span class="text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">${esc(a.type || 'Research Article')}</span>
          <span class="text-slate-400">${pages(a.pages)}</span>
        </div>
        <h3 class="font-serif text-xl font-bold text-navy-900 leading-snug">
          ${a.pdf ? `<a href="${pdf}" target="_blank" rel="noopener" class="hover:text-brand-600 transition">${esc(a.title)}</a>` : esc(a.title)}
        </h3>
        ${names ? `<p class="mt-2 text-sm font-medium text-slate-700">${names}</p>` : ''}
        ${affils ? `<ul class="mt-1 text-xs text-slate-500 space-y-0.5">${affils}</ul>` : ''}
        ${meta ? `<div class="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">${meta}</div>` : ''}
        ${keywords ? `<div class="mt-4 flex flex-wrap gap-2">${keywords}</div>` : ''}
        ${a.abstract ? `
        <details class="group mt-5 border-t border-slate-100 pt-4">
          <summary class="cursor-pointer list-none inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-brand-600">${ICON_CHEVRON}Abstract</summary>
          <p class="mt-3 text-sm leading-relaxed text-slate-600 text-justify">${esc(a.abstract)}</p>
        </details>` : ''}
        <div class="mt-5 flex flex-wrap items-center gap-3">
          ${a.pdf ? `
          <a href="${pdf}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-4 py-2 rounded-md transition">${ICON_PDF}View PDF</a>
          <a href="${pdf}" download class="inline-flex items-center gap-2 border border-slate-300 hover:border-brand-400 hover:text-brand-700 text-slate-700 text-sm font-semibold px-4 py-2 rounded-md transition">${ICON_DOWNLOAD}Download</a>
          <span class="text-xs text-slate-400">${fmtSize(a.fileSizeBytes)}</span>`
          : '<span class="text-xs text-slate-400 italic">PDF coming soon</span>'}
        </div>
      </article>`;
  }

  function renderIssue(issue, journal, isLatest) {
    const articles = issue.articles || [];
    const info = [
      ['Published by', journal.publisher],
      ['Country', journal.location && journal.location.split(',').pop().trim()],
      ['Medium', journal.medium],
      ['e-ISSN', journal.eissn],
      ['Access', journal.access],
      ['Articles', String(articles.length)],
    ].filter(([, v]) => v);
    const toc = (issue.frontMatter || []).find((f) => f.type === 'toc');

    return `
      <section id="issue-${esc(issueId(issue))}">
        <div class="grid md:grid-cols-[220px_1fr] gap-8 bg-white border border-slate-100 rounded-2xl shadow-soft p-6 sm:p-8 mb-10">
          ${renderCover(issue)}
          <div>
            <div class="flex items-center justify-between flex-wrap gap-3 mb-1">
              <h2 class="font-serif text-2xl font-bold text-navy-900">${esc(issueLabel(issue))}${issueDate(issue) ? ` &middot; ${esc(issueDate(issue))}` : ''}</h2>
              ${isLatest ? '<span class="inline-flex items-center text-xs font-semibold uppercase tracking-wide text-brand-700 bg-brand-50 px-3 py-1 rounded-full">Current Issue</span>' : ''}
            </div>
            <p class="text-slate-500 text-sm mb-6">${esc(journal.title)}${issue.description ? ` &middot; ${esc(issue.description)}` : ''}</p>
            <div class="grid sm:grid-cols-2 gap-x-8 text-sm mb-6">
              ${info.map(([k, v]) => `<div class="flex justify-between gap-4 border-b border-slate-100 py-2"><span class="text-slate-500">${esc(k)}</span><span class="font-medium text-navy-900 text-right">${esc(v)}</span></div>`).join('')}
            </div>
            ${toc ? `<a href="${href(toc.pdf)}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold px-4 py-2 rounded-md transition shadow">${ICON_PDF}Table of Contents</a>` : ''}
          </div>
        </div>

        ${renderFrontMatter(issue.frontMatter)}

        <h3 class="font-serif text-xl font-bold text-navy-900 mb-4">Articles</h3>
        ${articles.length
          ? `<div class="space-y-6">${articles.map(renderArticle).join('')}</div>`
          : '<p class="text-slate-500 text-sm bg-white border border-slate-100 rounded-2xl p-6">Articles for this issue will be published here soon.</p>'}
      </section>`;
  }

  function renderError(msg) {
    root.innerHTML = `<div class="bg-white border border-slate-100 rounded-2xl shadow-soft p-8 text-center text-slate-600">${msg}</div>`;
  }

  // ---------- boot ----------
  let data, issues, latestId;

  function show(fromNav) {
    const wanted = location.hash.slice(1);
    // An article anchor (e.g. #v1-i1-a2) selects its parent issue.
    const issue = issues.find((i) => issueId(i) === wanted)
      || issues.find((i) => (i.articles || []).some((a) => a.id === wanted))
      || issues.find((i) => issueId(i) === latestId);
    renderNav(issues, issueId(issue));
    root.innerHTML = renderIssue(issue, data.journal || {}, issueId(issue) === latestId);
    const target = wanted && document.getElementById(wanted);
    if (target && target.tagName === 'ARTICLE') target.scrollIntoView();
    else if (fromNav) nav.scrollIntoView();
  }

  fetch(DATA_URL, { cache: 'no-cache' })
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((json) => {
      data = json;
      // Newest first: highest volume, then highest issue number.
      issues = (data.issues || []).slice().sort((a, b) => (b.volume - a.volume) || (b.issue - a.issue));
      if (!issues.length) return renderError('No issues have been published yet.');
      latestId = issueId(issues.find((i) => i.current) || issues[0]);
      show();
      window.addEventListener('hashchange', () => show(true));
    })
    .catch(() => renderError(
      location.protocol === 'file:'
        ? 'The archive is loaded from <code>Archive/archive.json</code>, which browsers block when a page is opened directly from disk. Please view the site through a web server.'
        : 'The archive could not be loaded. Please try again later, or contact the editorial office.'
    ));
})();
