import { portfolioData } from '../data.js';

/**
 * Kelas ModalUI
 * Mengelola pop-up jendela kaca modern (Glassmorphic Window) untuk menampilkan
 * detail proyek, daftar keahlian, dan informasi biodata secara interaktif.
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
    // Tombol silang untuk menutup modal
    this.closeButton.addEventListener('click', () => this.close());

    // Klik pada latar gelap luar untuk menutup modal
    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) {
        this.close();
      }
    });

    // Tekan tombol ESC pada keyboard untuk keluar
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
          : `<span class="project-link-disabled">Ongoing Development</span>`;

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
    this.titleElement.textContent = "Get In Touch";

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
}