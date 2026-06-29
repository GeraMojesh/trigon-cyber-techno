import { SITE, getDisplayName } from './content.js';

const ICONS = {
  shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2L4 5v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V5l-8-3zm0 2.2l6 2.25V11c0 4.5-2.7 8.8-6 10-3.3-1.2-6-5.5-6-10V6.45l6-2.25z"/></svg>',
  brain: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 3a4 4 0 0 0-4 4v1H4a2 2 0 0 0-2 2v2a2 2 0 0 0 1 1.73V17a3 3 0 0 0 3 3h1v1h2v-1h1a3 3 0 0 0 3-3v-3.27A2 2 0 0 0 18 12v-2a2 2 0 0 0-2-2h-1V7a4 4 0 0 0-4-4zm0 2a2 2 0 0 1 2 2v1H7V7a2 2 0 0 1 2-2z"/></svg>',
  chain: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 7a4 4 0 0 1 5.65 0l1.41 1.41-1.41 1.42L12.24 9A2 2 0 0 0 9 12.24l-1.42 1.41L6.17 12.24A4 4 0 0 1 8 7zm8 0l1.42 1.41-1.41 1.42L14.76 9A2 2 0 0 0 18 12.24l1.41 1.41L20.83 12.24A4 4 0 0 0 16 7zm-8 10a4 4 0 0 1-5.65 0L2.93 15.59l1.41-1.41L5.76 15A2 2 0 0 0 9 11.76l1.42-1.41 1.41 1.41A4 4 0 0 1 8 17z"/></svg>',
};

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function teamAvatar(member) {
  if (member.image) {
    return `<img src="${member.image}" alt="${escapeHtml(getDisplayName(member))}" class="team-img" loading="lazy" width="280" height="320">`;
  }
  return `<div class="team-avatar team-avatar--${member.accent}" aria-hidden="true">${member.initials}</div>`;
}

export function renderAbout() {
  const text = document.getElementById('about-text');
  const pillars = document.getElementById('about-pillars');
  const metrics = document.getElementById('about-metrics');
  if (!text || !pillars || !metrics) return;

  text.innerHTML = SITE.about.map((p) => `<p class="about-desc">${escapeHtml(p)}</p>`).join('');

  pillars.innerHTML = SITE.pillars
    .map(
      (p) => `
    <div class="pillar fade-in">
      <div class="pillar-icon">${ICONS[p.icon] || ''}</div>
      <div class="pillar-info">
        <strong>${escapeHtml(p.title)}</strong>
        <span>${escapeHtml(p.text)}</span>
      </div>
    </div>`
    )
    .join('');

  metrics.innerHTML = SITE.metrics
    .map(
      (m, i) => `
    <div class="metric fade-in" data-delay="${i * 200}">
      <div class="metric-value counter" data-target="${m.value}">0</div>
      <div class="metric-unit">${escapeHtml(m.suffix)}</div>
      <div class="metric-label">${escapeHtml(m.label)}</div>
    </div>`
    )
    .join('');
}

export function renderServices() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;
  grid.innerHTML = SITE.services
    .map(
      (s, i) => `
    <article class="service-card card-3d fade-in" data-delay="${i * 80}" tabindex="0">
      <div class="card-3d-inner">
        <div class="service-icon-wrap"><span class="service-num">${String(i + 1).padStart(2, '0')}</span></div>
        <h3 class="service-title">${escapeHtml(s.title)}</h3>
        <p class="service-desc">${escapeHtml(s.desc)}</p>
        <div class="service-tag ${s.status === 'BETA' ? 'beta' : ''}">${escapeHtml(s.status)}</div>
      </div>
    </article>`
    )
    .join('');
}

export function renderTeam() {
  const grid = document.getElementById('team-grid');
  if (!grid) return;
  grid.innerHTML = SITE.team
    .map((member, i) => {
      const displayName = getDisplayName(member);
      const hasName = Boolean(member.name?.trim());
      const nameBlock = hasName
        ? `<div class="team-role">${escapeHtml(member.role)}</div><h3 class="team-name">${escapeHtml(member.name)}</h3>`
        : `<h3 class="team-name team-name--solo">${escapeHtml(member.role)}</h3>`;
        .map((t) => {
          if (member.link && t === 'SRIPTO') {
            return `<span class="team-tag"><a href="${member.link}" target="_blank" rel="noopener noreferrer">sripto.tech ↗</a></span>`;
          }
          return `<span class="team-tag">${escapeHtml(t)}</span>`;
        })
        .join('');
      return `
    <article class="team-card card-3d fade-in ${member.featured ? 'featured-card' : ''} ${member.id === 'coo' ? 'coo-card' : ''}" data-delay="${i * 100}" data-member="${member.id}" tabindex="0">
      <div class="card-3d-inner">
        <div class="team-card-glow"></div>
        <div class="team-img-wrap">${teamAvatar(member)}<div class="team-img-ring"></div></div>
        <div class="team-info">
          ${nameBlock}
          <p class="team-bio">${escapeHtml(member.bio)}</p>
          <div class="team-tags">${tags}</div>
        </div>
      </div>
    </article>`;
    })
    .join('');
}

export function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = SITE.projects
    .map(
      (p, i) => `
    <article class="project-card card-3d fade-in" data-delay="${i * 120}" tabindex="0">
      <div class="card-3d-inner">
        <div class="project-header">
          <div class="project-num">${p.num}</div>
          <div class="project-status ${p.status === 'BETA' ? 'beta-status' : 'active-status'}">● ${escapeHtml(p.status)}</div>
        </div>
        <h3 class="project-title">${escapeHtml(p.title)}</h3>
        <p class="project-desc">${escapeHtml(p.desc)}</p>
        <div class="project-tech">${p.tags.map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}</div>
        <div class="project-bar"><div class="project-progress ${p.status === 'BETA' ? 'beta-progress' : ''}" style="width:${p.progress}%"></div></div>
        <div class="project-progress-label">Progress: ${p.progress}%</div>
      </div>
    </article>`
    )
    .join('');
}

export function renderSpatialCards() {
  const universe = document.getElementById('spatial-universe');
  if (!universe) return;

  const teamCards = SITE.team
    .map((member) => {
      const img = member.image
        ? `<img class="card-image" src="${member.image}" alt="${escapeHtml(getDisplayName(member))}">`
        : `<div class="card-avatar card-avatar--${member.accent}">${member.initials}</div>`;
      const link = member.link
        ? `<br>Website: <a href="${member.link}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-orange)">${escapeHtml(member.link.replace(/^https?:\/\//, ''))}</a>`
        : '';
      return `
    <div id="card-${member.id}" class="spatial-card" role="dialog" aria-hidden="true">
      ${img}
      <h2 class="card-title">${escapeHtml(member.terminalTitle || member.role)}</h2>
      <h3 class="card-name">${escapeHtml(getDisplayName(member))}</h3>
      <p class="card-desc">${escapeHtml(member.bio)}${link}</p>
    </div>`;
    })
    .join('');

  universe.innerHTML =
    teamCards +
    `
    <div id="card-dashboard" class="spatial-card no-image" role="dialog" aria-hidden="true">
      <h2 class="card-title">INTERFACE</h2>
      <h3 class="card-name">Cyber Defense Dashboard</h3>
      <p class="card-desc">Active Threats: <span style="color:var(--accent-orange)">0 (Secure)</span><br>Network Nodes: Online<br>Security Mode: Maximum</p>
    </div>
    <div id="card-generic" class="spatial-card" role="dialog" aria-hidden="true">
      <h2 class="card-title">Resource</h2>
      <h3 class="card-name">Subject</h3>
      <p class="card-desc">Information related to the command.</p>
    </div>`;
}

export function renderShortcuts() {
  const versionEl = document.getElementById('hero-version');
  if (versionEl) versionEl.textContent = SITE.version;
}
