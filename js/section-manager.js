import { CarouselManager } from './carousel-manager.js';

// Section Manager Module
export class SectionManager {
    constructor(configManager) {
        this.configManager = configManager;
        // counters for stable unique ids
        this.projectCounter = 0;
        this.experienceCounter = 0;

        // handle incoming hashes and history navigation
        window.addEventListener('hashchange', () => this._handleHashChange());
        window.addEventListener('popstate', () => this._handleHashChange());
    }

    // Toggle section visibility based on feature flags
    toggleSection(sectionClass, isEnabled) {
        const section = document.querySelector(`.${sectionClass}`);
        if (section) {
            if (isEnabled) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        }
    }

    // Update page content from config with feature flags
    updatePageContent(config) {
        // Ensure features object exists with defaults
        const features = {
            about: true,
            projects: true,
            experience: true,
            skills: true,
            github_projects: true,
            ...config.features
        };
        
        // Handle sections based on feature flags
        this.toggleSection('about', features.about);
        this.toggleSection('projects', features.projects);
        this.toggleSection('experience', features.experience);
        this.toggleSection('skills', features.skills);
        this.toggleSection('projects-on-github', features.github_projects);
        
        // Update sections that are enabled and have content
        if (features.about) {
            this.updateAboutSection(config);
        }
        
        if (features.projects) {
            this.updateProjectsSection(config);
        }
        
        if (features.experience) {
            this.updateExperienceSection(config);
        }
        
        if (features.skills) {
            this.updateSkillsSection(config);
        }
        
        // Update "Projects on GitHub" section title from config if available
        if (features.github_projects && config.github_projects?.title) {
            const githubProjectsTitle = document.querySelector('.projects-on-github h2');
            if (githubProjectsTitle) {
                githubProjectsTitle.textContent = config.github_projects.title;
                if (!githubProjectsTitle.dataset.permalinkAttached) {
                    const gitSection = document.querySelector('.projects-on-github');
                    const sectionId = `section-${this._slugify(githubProjectsTitle.textContent)}`;
                    if (gitSection) gitSection.id = sectionId;
                    githubProjectsTitle.style.cursor = 'pointer';
                    githubProjectsTitle.addEventListener('click', (e) => {
                        e.preventDefault();
                        const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
                        this._copyToClipboard(url).then(() => this._showCopyToast('Link copied to clipboard'))
                            .catch(() => this._showCopyToast('Link copied'));
                        history.pushState(null, '', `#${sectionId}`);
                        this._openBlockById(sectionId);
                    });
                    githubProjectsTitle.dataset.permalinkAttached = 'true';
                }
            }
        }

        // handle any hash navigation after rendering
        // delay slightly to allow DOM paint
        setTimeout(() => this._handleHashChange(), 40);
    }

    // Update about section
    updateAboutSection(config) {
        const aboutSection = document.querySelector('.about');
        if (config.about?.paragraphs?.length) {
            aboutSection.innerHTML = config.about.paragraphs.map(p => `<p>${p}</p>`).join('');
        } else {
            aboutSection.innerHTML = '<p>Welcome to my portfolio!</p>';
        }
    }

    // Update projects section dynamically
    updateProjectsSection(config) {
        const projectsSection = document.querySelector('.projects');
        const titleElement = projectsSection.querySelector('h2');
        
        if (titleElement) {
            titleElement.textContent = this.configManager.getSectionTitle('projects');
            if (!titleElement.dataset.permalinkAttached) {
                const sectionId = `section-${this._slugify(titleElement.textContent)}`;
                projectsSection.id = sectionId;
                titleElement.style.cursor = 'pointer';
                titleElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
                    this._copyToClipboard(url).then(() => this._showCopyToast('Link copied to clipboard'))
                        .catch(() => this._showCopyToast('Link copied'));
                    history.pushState(null, '', `#${sectionId}`);
                    this._openBlockById(sectionId);
                });
                titleElement.dataset.permalinkAttached = 'true';
            }
        }
        
        // --- Domain Chips ---
        const domainChipsContainer = projectsSection.querySelector('.project-domain-chips');
        const domains = ["Development", "Digital Enablement for Local Businesses","Data Engineering", "Scripting", "Automation"];
        
        // If not already rendered
        if (domainChipsContainer && domainChipsContainer.childElementCount === 0) {
            const filterLabel = document.createElement('h4');
            filterLabel.className = 'filter-label';
            filterLabel.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle;"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>Filter by category:`;
            domainChipsContainer.appendChild(filterLabel);

            const chipWrapper = document.createElement('div');
            chipWrapper.className = 'chip-wrapper';

            domains.forEach(domain => {
                const chip = document.createElement('button');
                chip.className = 'project-domain-chip';
                chip.textContent = domain;
                chip.setAttribute('type', 'button');
                chip.setAttribute('aria-pressed', 'false');
                chip.addEventListener('click', () => {
                    chip.classList.toggle('selected');
                    chip.setAttribute('aria-pressed', chip.classList.contains('selected'));
                    this.filterProjectsByDomain(config, domains.filter(d => {
                        const c = Array.from(chipWrapper.children).find(x => x.textContent === d);
                        return c && c.classList.contains('selected');
                    }));
                });
                chipWrapper.appendChild(chip);
            });
            domainChipsContainer.appendChild(chipWrapper);
        }

        // Clear existing project items
        const existingProjectItems = projectsSection.querySelectorAll('.project-item');
        existingProjectItems.forEach(item => item.remove());
        
        // Create document fragment and render all projects (default state)
        const fragment = document.createDocumentFragment();
        this.renderProjects(config.projects?.items || [], fragment);
        projectsSection.appendChild(fragment);
    }

    // Filter and render projects by selected domain(s)
    filterProjectsByDomain(config, selectedDomains) {
        const projectsSection = document.querySelector('.projects');
        const existingProjectItems = projectsSection.querySelectorAll('.project-item, .no-results-card');
        existingProjectItems.forEach(item => item.remove());
        
        const fragment = document.createDocumentFragment();
        let filtered = (config.projects?.items || []);
        
        if (selectedDomains.length > 0) {
            filtered = filtered.filter(project => {
                // If project.domain matches any selected domain
                if (Array.isArray(project.domain)) {
                    return project.domain.some(d => selectedDomains.includes(d));
                }
                return selectedDomains.includes(project.domain);
            });
        }
        
        this.renderProjects(filtered, fragment);
        projectsSection.appendChild(fragment);
    }

    // Render projects helper
    renderProjects(projects, fragment) {
        if (projects.length) {
            projects.forEach(project => {
                const projectItem = this.createProjectItem(project);
                fragment.appendChild(projectItem);
            });
        } else {
            // Show placeholder for empty projects
            const emptyState = document.createElement('div');
            emptyState.className = 'no-results-card';
            emptyState.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-info">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <h3>No Projects Found</h3>
                <p>Adjust your filters or clear them to see more projects.</p>
            `;
            fragment.appendChild(emptyState);
        }
    }

    // Create individual project item
    createProjectItem(project) {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';

        // assign stable unique id
        const id = `project-${this._slugify(project.name)}-${++this.projectCounter}`;
        projectItem.id = id;
        
        const descriptionHtml = Array.isArray(project.description) 
            ? project.description.map(desc => `<li>${desc}</li>`).join('')
            : `<li>${project.description}</li>`;
            
        projectItem.innerHTML = `
            <div class="project-top">
                <div class="project-content">
                    <div class="project-info">
                        <div class="project-header">
                            <div>
                                <h3 class="project-title">${project.name}</h3>
                                ${project.date ? `<div class="project-date">${project.date}</div>` : ''}
                            </div>
                        </div>
                        <ul class="project-description">
                            ${descriptionHtml}
                        </ul>
                    </div>
                    <div class="project-actions">
                        ${project.link ? `
                            <a href="${typeof project.link === 'object' ? project.link.url : project.link}" 
                               target="_blank" rel="noopener noreferrer" 
                               aria-label="View ${project.name} project"
                               class="project-link">
                                ${typeof project.link === 'object' ? (project.link.title || 'View Project') : 'View Project'}
                            </a>
                        ` : ''}
                        ${project.images && project.images.length > 0 ? `
                            <button class="carousel-toggle" aria-label="Show project images" aria-expanded="false">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
            ${project.images && project.images.length > 0 ? '<div class="project-carousel-wrapper" style="display: none;"></div>' : ''}
        `;

        // Make the title act as a permalink/copy trigger: copy URL, set hash, open and scroll
        const titleEl = projectItem.querySelector('.project-title');
        if (titleEl) {
            titleEl.style.cursor = 'pointer';
                titleEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = `${window.location.origin}${window.location.pathname}#${id}`;
                this._copyToClipboard(url).then(() => this._showCopyToast('Link copied to clipboard'))
                    .catch(() => this._showCopyToast('Link copied'));
                // update URL without causing immediate browser jump
                history.pushState(null, '', `#${id}`);
                const toggle = projectItem.querySelector('.carousel-toggle');
                const wrapper = projectItem.querySelector('.project-carousel-wrapper');
                if (wrapper && toggle && toggle.getAttribute('aria-expanded') !== 'true') {
                    toggle.click();
                }
                this._scrollToElement(titleEl);
            });
        }

        // Setup carousel if images exist
        if (project.images && project.images.length > 0) {
            const carouselWrapper = projectItem.querySelector('.project-carousel-wrapper');
            new CarouselManager(carouselWrapper, project.images, { orientation: project.orientation || 'landscape' });

            const toggleBtn = projectItem.querySelector('.carousel-toggle');
            toggleBtn.addEventListener('click', () => {
                const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
                toggleBtn.setAttribute('aria-expanded', !isExpanded);
                carouselWrapper.style.display = isExpanded ? 'none' : 'block';
                projectItem.classList.toggle('is-expanded');
                toggleBtn.classList.toggle('active');
            });
        }

        return projectItem;
    }

    // Update experience section dynamically
    updateExperienceSection(config) {
        const experienceSection = document.querySelector('.experience');
        const titleElement = experienceSection.querySelector('h2');
        
        if (titleElement) {
            titleElement.textContent = this.configManager.getSectionTitle('experience');
            if (!titleElement.dataset.permalinkAttached) {
                const sectionId = `section-${this._slugify(titleElement.textContent)}`;
                experienceSection.id = sectionId;
                titleElement.style.cursor = 'pointer';
                titleElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
                    this._copyToClipboard(url).then(() => this._showCopyToast('Link copied to clipboard'))
                        .catch(() => this._showCopyToast('Link copied'));
                    history.pushState(null, '', `#${sectionId}`);
                    this._openBlockById(sectionId);
                });
                titleElement.dataset.permalinkAttached = 'true';
            }
        }
        
        // Clear existing experience items
        const existingItems = experienceSection.querySelectorAll('.experience-item');
        existingItems.forEach(item => item.remove());
        
        // Create document fragment
        const fragment = document.createDocumentFragment();
        
        // Add all experience items to fragment
        if (config.experience?.jobs?.length) {
            config.experience.jobs.forEach(job => {
                const experienceItem = this.createExperienceItem(job);
                fragment.appendChild(experienceItem);
            });
        } else {
            // Show placeholder for empty experience
            const emptyState = document.createElement('div');
            emptyState.className = 'experience-item';
            emptyState.innerHTML = `
                <div class="experience-content">
                    <h3>Your Experience Will Appear Here</h3>
                    <p class="date">Ready to showcase your career</p>
                    <ul>
                        <li>Add your work experience to the config.json file</li>
                        <li>Include company logos and job descriptions</li>
                        <li>Highlight your achievements and responsibilities</li>
                    </ul>
                </div>
            `;
            fragment.appendChild(emptyState);
        }
        
        // Append all experience items at once
        experienceSection.appendChild(fragment);
    }

    // Create individual experience item
    createExperienceItem(job) {
        const experienceItem = document.createElement('div');
        experienceItem.className = 'experience-item';

        // assign stable unique id
        const id = `experience-${this._slugify(job.company + '-' + job.role)}-${++this.experienceCounter}`;
        experienceItem.id = id;

        const responsibilitiesHtml = Array.isArray(job.responsibilities)
            ? job.responsibilities.map(resp => `<li>${resp}</li>`).join('')
            : `<li>${job.responsibilities}</li>`;

        let logoHtml = '';
        if (job.logo || job.logo_dark) {
            logoHtml = `
                <div class="company-logo">
                    ${job.logo ? `<img src="${job.logo}" alt="${job.company} logo" class="light-mode-logo" loading="lazy">` : ''}
                    ${job.logo_dark ? `<img src="${job.logo_dark}" alt="${job.company} logo" class="dark-mode-logo" loading="lazy">` : ''}
                </div>
            `;
        }

        experienceItem.innerHTML = `
            <div class="experience-header">
                <div class="experience-header-content">
                    <h3>${job.company} | ${job.role}</h3>
                    ${job.date ? `<p class="date">${job.date}</p>` : ''}
                </div>
                ${logoHtml}
                <div class="accordion-toggle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </div>
            <div class="experience-content">
                <ul>
                    ${responsibilitiesHtml}
                </ul>
            </div>
        `;

        // Make the title act as a permalink/copy trigger: copy URL, set hash, expand and scroll
        const header = experienceItem.querySelector('.experience-header');
        const headerContent = experienceItem.querySelector('.experience-header-content');
        const titleElExp = experienceItem.querySelector('.experience-header-content h3');
        if (titleElExp) {
            titleElExp.style.cursor = 'pointer';
            titleElExp.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = `${window.location.origin}${window.location.pathname}#${id}`;
                this._copyToClipboard(url).then(() => this._showCopyToast('Link copied to clipboard'))
                    .catch(() => this._showCopyToast('Link copied'));
                history.pushState(null, '', `#${id}`);
                if (!experienceItem.classList.contains('expanded')) {
                    this.toggleExperienceAccordion(experienceItem);
                }
                this._scrollToElement(titleElExp);
            });
        }

        // Add click event listener for accordion functionality (title click handled separately)
        const headerClickable = experienceItem.querySelector('.experience-header');
        headerClickable.addEventListener('click', (ev) => {
            // if the click was inside the title we already handled it
            if (ev.target.closest('.experience-header-content h3')) return;
            this.toggleExperienceAccordion(experienceItem);
        });

        return experienceItem;
    }

    // Toggle experience accordion
    toggleExperienceAccordion(experienceItem) {
        const content = experienceItem.querySelector('.experience-content');
        if (!content) {
            experienceItem.classList.toggle('expanded');
            return;
        }

        const isExpanded = experienceItem.classList.contains('expanded');

        if (isExpanded) {
            // collapse: animate from current height to 0
            const currentHeight = content.scrollHeight;
            content.style.maxHeight = currentHeight + 'px';
            // force a repaint so the starting maxHeight is applied
            // then set to 0 to trigger transition
            requestAnimationFrame(() => {
                content.style.transition = 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                content.style.maxHeight = '0';
                content.style.padding = '0';
            });

            experienceItem.classList.remove('expanded');

            // cleanup after transition
            const onTransitionEnd = (e) => {
                if (e.propertyName === 'max-height') {
                    content.style.maxHeight = '';
                    content.removeEventListener('transitionend', onTransitionEnd);
                }
            };
            content.addEventListener('transitionend', onTransitionEnd);
        } else {
            // expand: set padding first so content has space, then set maxHeight to scrollHeight
            content.style.padding = '0 1.5rem 1.5rem';
            // ensure display/overflow are correct
            content.style.overflow = 'hidden';
            // measure height after padding applied
            const targetHeight = content.scrollHeight;
            content.style.maxHeight = '0';
            // force repaint
            requestAnimationFrame(() => {
                content.style.transition = 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                content.style.maxHeight = targetHeight + 'px';
            });

            experienceItem.classList.add('expanded');

            // after expansion, clear maxHeight so content can grow naturally
            const onTransitionEnd = (e) => {
                if (e.propertyName === 'max-height') {
                    content.style.maxHeight = 'none';
                    content.style.overflow = '';
                    content.removeEventListener('transitionend', onTransitionEnd);
                }
            };
            content.addEventListener('transitionend', onTransitionEnd);

            // Fallback: if transitionend doesn't fire (rare), ensure we clear maxHeight after 600ms
            const fallbackTimer = setTimeout(() => {
                if (experienceItem.classList.contains('expanded')) {
                    content.style.maxHeight = 'none';
                    content.style.overflow = '';
                }
            }, 600);

            // If images inside content load after expansion, they can change height — handle that
            const imgs = Array.from(content.querySelectorAll('img'));
            const onImgLoad = () => {
                if (experienceItem.classList.contains('expanded')) {
                    // ensure fully expanded
                    content.style.maxHeight = 'none';
                    content.style.overflow = '';
                }
            };
            imgs.forEach(img => {
                if (img.complete) return; // already loaded
                img.addEventListener('load', onImgLoad);
                img.addEventListener('error', onImgLoad);
            });

            // cleanup helper to remove listeners and timer when collapsing
            const cleanupAfter = () => {
                clearTimeout(fallbackTimer);
                imgs.forEach(img => {
                    img.removeEventListener('load', onImgLoad);
                    img.removeEventListener('error', onImgLoad);
                });
            };
            // attach cleanup when transition ends
            content.addEventListener('transitionend', cleanupAfter, { once: true });
        }
    }

    // Toggle project accordion
    toggleProjectAccordion(projectItem) {
        projectItem.classList.toggle('expanded');
    }

    // simple slug helper for ids
    _slugify(text) {
        return (text || '')
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')           // spaces to hyphens
            .replace(/[^\w\-]+/g, '')       // remove invalid chars
            .replace(/\-\-+/g, '-')         // collapse dashes
            .replace(/^-+/, '')              // trim start dash
            .replace(/-+$/, '');             // trim end dash
    }

    // copy text to clipboard (returns Promise)
    _copyToClipboard(text) {
        if (!text) return Promise.reject(new Error('No text'));
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise((resolve, reject) => {
            // fallback for older browsers
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.setAttribute('readonly', '');
                ta.style.position = 'absolute';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                const ok = document.execCommand('copy');
                ta.remove();
                ok ? resolve() : reject(new Error('execCommand failed'));
            } catch (err) {
                reject(err);
            }
        });
    }

    // show a small temporary toast to indicate copy success
    _showCopyToast(message = 'Copied') {
        try {
            const existing = document.querySelector('.copy-toast');
            if (existing) {
                existing.remove();
            }
            const toast = document.createElement('div');
            toast.className = 'copy-toast';
            // include a subtle link icon and the message text
            toast.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07l-1.41 1.41"></path>
                    <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.1a5 5 0 0 0 7.07 7.07l1.41-1.41"></path>
                </svg>
                <span class="copy-toast-text">${message}</span>
            `;
            // accessibility
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
            // trigger show (CSS handles animation)
            requestAnimationFrame(() => toast.classList.add('show'));
            setTimeout(() => {
                toast.classList.remove('show');
                // allow animation to finish then remove
                setTimeout(() => toast.remove(), 300);
            }, 1800);
        } catch (e) {
            // swallow errors — non-critical
            console.warn('Toast failed', e);
        }
    }

    // Open a block by id: expand if needed and scroll into view
    _openBlockById(id) {
        if (!id) return;
        const el = document.getElementById(id);
        if (!el) return;

        // if it's a project: trigger carousel toggle if exists
        if (el.classList.contains('project-item')) {
            const toggle = el.querySelector('.carousel-toggle');
            const wrapper = el.querySelector('.project-carousel-wrapper');
            if (wrapper && toggle && toggle.getAttribute('aria-expanded') !== 'true') {
                // open using existing handler
                toggle.click();
            }
        }

        // if it's experience, expand accordion
        if (el.classList.contains('experience-item')) {
            if (!el.classList.contains('expanded')) {
                this.toggleExperienceAccordion(el);
            }
        }

        // scroll into view using header-aware helper
        // If this is a section anchor (section-...), scroll to its H2 heading when available
        let target = el;
        try {
            if (el.id && el.id.startsWith('section-')) {
                const heading = el.querySelector('h2');
                if (heading) target = heading;
            } else {
                // for project/experience items prefer the inner title if present
                const innerTitle = el.querySelector('h3') || el.querySelector('.project-title');
                if (innerTitle) target = innerTitle;
            }
        } catch (err) {
            target = el;
        }

        // special-case: for section anchors (section-...), position heading at the very top
        try {
            if (el.id && el.id.startsWith('section-')) {
                const heading = el.querySelector('h2') || el;
                const top = heading.getBoundingClientRect().top + window.pageYOffset;
                this._smoothScrollTo(top, 1200);
                return;
            }
        } catch (e) {
            // ignore and fallback to default
        }

        // small delay to let layout settle after expanding content
        setTimeout(() => this._scrollToElement(target), 60);
    }

    // Smooth-scroll an element into view accounting for a fixed header
    _scrollToElement(el, extraOffset = 12) {
        if (!el) return;
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 0;
        const top = el.getBoundingClientRect().top + window.pageYOffset - (headerHeight + extraOffset);
        this._smoothScrollTo(top, 1200);
    }

    // Smooth-scroll helper with easing (duration in ms)
    _smoothScrollTo(targetY, duration = 1200) {
        const startY = window.pageYOffset;
        const distance = targetY - startY;
        const startTime = performance.now();

        const easeInOutCubic = (t) => t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeInOutCubic(progress);
            window.scrollTo(0, Math.round(startY + distance * eased));
            if (elapsed < duration) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }

    // Handle URL hash on load / change
    _handleHashChange() {
        const hash = (window.location.hash || '').replace('#', '');
        if (!hash) return;
        // open block after small delay to ensure DOM rendered
        setTimeout(() => this._openBlockById(hash), 40);
    }

    // Update skills section dynamically
    updateSkillsSection(config) {
        const skillsSection = document.querySelector('.skills');
        const titleElement = skillsSection.querySelector('h2');
        
        if (titleElement) {
            titleElement.textContent = this.configManager.getSectionTitle('skills');
            if (!titleElement.dataset.permalinkAttached) {
                const sectionId = `section-${this._slugify(titleElement.textContent)}`;
                skillsSection.id = sectionId;
                titleElement.style.cursor = 'pointer';
                titleElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
                    this._copyToClipboard(url).then(() => this._showCopyToast('Link copied to clipboard'))
                        .catch(() => this._showCopyToast('Link copied'));
                    history.pushState(null, '', `#${sectionId}`);
                    this._openBlockById(sectionId);
                });
                titleElement.dataset.permalinkAttached = 'true';
            }
        }
        
        const skillsGrid = skillsSection.querySelector('.skills-grid');
        const fragment = document.createDocumentFragment();
        
        // Clear existing skills
        skillsGrid.innerHTML = '';
        
        // Create skill categories
        if (config.skills?.categories?.length) {
            config.skills.categories.forEach(category => {
                const categoryDiv = this.createSkillCategory(category);
                fragment.appendChild(categoryDiv);
            });
        } else {
            // Show placeholder for empty skills
            const emptyState = document.createElement('div');
            emptyState.className = 'skill-category';
            emptyState.innerHTML = `
                <h3>Your Skills Will Appear Here</h3>
                <ul>
                    <li>Add your technical skills to the config.json file</li>
                    <li>Organize them into categories</li>
                    <li>Include certifications with links</li>
                    <li>Showcase your expertise</li>
                </ul>
            `;
            fragment.appendChild(emptyState);
        }
        
        // Append all skill categories at once
        skillsGrid.appendChild(fragment);
    }

    // Create individual skill category
    createSkillCategory(category) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'skill-category';

        const title = document.createElement('h3');
        title.textContent = category.name;
        categoryDiv.appendChild(title);

        const list = document.createElement('ul');
        list.className = 'skills-list';

        if (Array.isArray(category.items)) {
            category.items.forEach(item => {
                const listItem = document.createElement('li');
                if (typeof item === 'object') {
                    if (item.name && item.logo && !item.url) { // Language or Tool
                        listItem.innerHTML = `<img src="${item.logo}" alt="${item.name} logo" loading="lazy"><span>${item.name}</span>`;
                    } else if (item.name && item.url) { // Certification
                        listItem.className = 'certification-item';
                        const link = document.createElement('a');
                        link.href = item.url;
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.innerHTML = `
                            ${item.logo ? `<img src="${item.logo}" alt="${item.name} logo" loading="lazy">` : `
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            `}
                            <span>${item.name}</span>
                        `;
                        link.addEventListener('click', (e) => {
                            e.preventDefault();
                            window.open(item.url, '_blank');
                        });
                        listItem.appendChild(link);
                    } else if (item.name) { // Just a name
                        listItem.innerHTML = `<span>${item.name}</span>`;
                    }
                } else { // Simple string item
                    listItem.innerHTML = `<span>${item}</span>`;
                }
                list.appendChild(listItem);
            });
        } else {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span>${category.items}</span>`;
            list.appendChild(listItem);
        }

        categoryDiv.appendChild(list);
        return categoryDiv;
    }
}
