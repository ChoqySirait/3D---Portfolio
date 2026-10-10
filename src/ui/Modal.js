import { portfolioData } from '../data.js';

/**
 * Kelas ModalUI
 * Mengelola pop-up jendela interaktif dan modul Recruiter 2D Resume Mode.
 */
export default class ModalUI {
  constructor() {
    this.overlay = document.getElementById('modal-overlay');
    this.titleElement = document.getElementById('modal-title');
    this.bodyElement = document.getElementById('modal-body');
    this.closeButton = document.getElementById('modal-close-btn');

    this.bindEvents();
  }

  bindEvents() {
    // Tombol silang untuk menutup
    this.closeButton.addEventListener('click', () => this.close());

    // Klik di latar belakang gelap luar untuk langsung menutup
    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) {
        this.close();
      }
    });

    // Tekan tombol ESC keyboard
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !this.overlay.classList.contains('hidden')) {
        this.close();
      }
    });
  }

  open(sectionKey) {
    this.bodyElement.innerHTML = '';

    if (sectionKey === 'about') {
      this.renderAbout();
    } else if (sectionKey === 'skills') {
      this.renderSkills();
    } else if (sectionKey === 'projects') {
      this.renderProjects();
    } else if (sectionKey === 'contact') {
      this.renderContact();
    } else if (sectionKey === 'resume') {
      this.renderFullResume();
    }

    this.overlay.classList.remove('hidden');
  }

  close() {
    this.overlay.classList.add('hidden');
  }

  renderAbout() {
    const data = portfolioData.about;
    this.titleElement.textContent = data.title;

    const badgesHtml = data.badges
      .map((b) => `<span class="badge">${b}</span>`)
      .join('');

    this.bodyElement.innerHTML = `
      <div class="modal-section">
        <p class="role-badge">${data.role}</p>
        <p class="description-text">${data.description}</p>
        <div class="badge-container">${badgesHtml}</div>
      </div>
    `;
  }

  renderSkills() {
    const data = portfolioData.skills;
    this.titleElement.textContent = data.title;

    let categoriesHtml = '';
    data.categories.forEach((cat) => {
      const itemsHtml = cat.items
        .map((item) => `<li class="skill-item">${item}</li>`)
        .join('');

      categoriesHtml += `
        <div class="skill-category">
          <h4 class="category-name">${cat.name}</h4>
          <ul class="skill-list">${itemsHtml}</ul>
        </div>
      `;
    });

    this.bodyElement.innerHTML = `<div class="skills-grid">${categoriesHtml}</div>`;
  }

  renderProjects() {
    const data = portfolioData.projects;
    this.titleElement.textContent = data.title;

    const cardsHtml = data.list
      .map((proj) => {
        const tagsHtml = proj.tags
          .map((t) => `<span class="project-tag">${t}</span>`)
          .join('');

        const linkBtn = proj.url !== '#'
          ? `<a href="${proj.url}" target="_blank" rel="noopener noreferrer" class="project-link-btn">View on ${proj.linkType} &rarr;</a>`
          : `<span class="project-link-disabled">Ongoing Architecture</span>`;

        return `
          <div class="project-card">
            <div class="project-card-header">
              <span class="project-category-tag">${proj.category}</span>
              <h3 class="project-card-title">${proj.title}</h3>
            </div>
            <p class="project-desc">${proj.description}</p>
            <p class="project-impact"><strong>Key Impact:</strong> ${proj.impact}</p>
            <div class="project-tags-row">${tagsHtml}</div>
            <div class="project-footer">${linkBtn}</div>
          </div>
        `;
      })
      .join('');

    this.bodyElement.innerHTML = `<div class="projects-grid">${cardsHtml}</div>`;
  }

  renderContact() {
    const profile = portfolioData.profile;
    this.titleElement.textContent = "Connect & Collaborate";

    this.bodyElement.innerHTML = `
      <div class="modal-section contact-center">
        <p class="contact-status">${profile.status}</p>
        <div class="contact-actions">
          <a href="${profile.github}" target="_blank" rel="noopener noreferrer" class="contact-btn github-btn">
            GitHub Profile
          </a>
          <a href="${profile.linkedin}" target="_blank" rel="noopener noreferrer" class="contact-btn linkedin-btn">
            LinkedIn Profile
          </a>
        </div>
      </div>
    `;
  }

  renderFullResume() {
    // 2D Recruiter One-Page Mode
    const profile = portfolioData.profile;
    const about = portfolioData.about;
    const skills = portfolioData.skills;
    const projects = portfolioData.projects;

    this.titleElement.textContent = "Executive Portfolio Summary (2D View)";

    let skillsHtml = '';
    skills.categories.forEach((c) => {
      skillsHtml += `<strong>${c.name}:</strong> ${c.items.join(', ')}<br>`;
    });

    let projectsHtml = '';
    projects.list.forEach((p) => {
      projectsHtml += `
        <div style="margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.06);">
          <h4 style="color: #38bdf8;">${p.title} <span style="font-size:0.75rem; color:#94a3b8;">(${p.category})</span></h4>
          <p style="font-size:0.86rem; color:#cbd5e1; margin:4px 0;">${p.description}</p>
          <p style="font-size:0.82rem; color:#4ade80;"><strong>Impact:</strong> ${p.impact}</p>
        </div>
      `;
    });

    this.bodyElement.innerHTML = `
      <div class="modal-section" style="gap: 20px;">
        <div>
          <h3 style="color:#f8fafc; font-size:1.3rem;">${profile.name} (${profile.brand})</h3>
          <p style="color:#38bdf8; font-weight:600;">${profile.headline}</p>
          <p style="color:#94a3b8; font-size:0.85rem; margin-top:4px;">${profile.status}</p>
        </div>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1);" />
        <div>
          <h4 style="color:#f8fafc; margin-bottom:6px;">About</h4>
          <p style="font-size:0.9rem; color:#cbd5e1; line-height:1.6;">${about.description}</p>
        </div>
        <div>
          <h4 style="color:#f8fafc; margin-bottom:6px;">Tech Stack Overview</h4>
          <div style="font-size:0.86rem; color:#cbd5e1; line-height:1.8;">${skillsHtml}</div>
        </div>
        <div>
          <h4 style="color:#f8fafc; margin-bottom:10px;">Key Engineering Projects</h4>
          ${projectsHtml}
        </div>
        <div style="display:flex; gap:12px; margin-top:10px;">
          <a href="${profile.github}" target="_blank" rel="noopener noreferrer" class="contact-btn github-btn" style="padding:8px 18px; font-size:0.82rem;">GitHub</a>
          <a href="${profile.linkedin}" target="_blank" rel="noopener noreferrer" class="contact-btn linkedin-btn" style="padding:8px 18px; font-size:0.82rem;">LinkedIn</a>
        </div>
      </div>
    `;
  }
}