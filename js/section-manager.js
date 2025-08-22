import { CarouselManager } from './carousel-manager.js';

// Section Manager Module
export class SectionManager {
    constructor(configManager) {
        this.configManager = configManager;
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
            }
        }
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
        const existingProjectItems = projectsSection.querySelectorAll('.project-item');
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
            emptyState.className = 'project-item';
            emptyState.innerHTML = `
                <div class="project-content">
                    <h3>No matching projects found</h3>
                    <p class="date">Try selecting different domains</p>
                    <ul>
                        <li>Projects will appear here when they match the selected domains</li>
                        <li>Clear all domain filters to see all projects</li>
                    </ul>
                </div>
            `;
            fragment.appendChild(emptyState);
        }
    }

    // Create individual project item
    createProjectItem(project) {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        
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
        
        // Add click event listener for accordion functionality
        const header = experienceItem.querySelector('.experience-header');
        header.addEventListener('click', () => {
            this.toggleExperienceAccordion(experienceItem);
        });
        
        return experienceItem;
    }

    // Toggle experience accordion
    toggleExperienceAccordion(experienceItem) {
        experienceItem.classList.toggle('expanded');
    }

    // Toggle project accordion
    toggleProjectAccordion(projectItem) {
        projectItem.classList.toggle('expanded');
    }

    // Update skills section dynamically
    updateSkillsSection(config) {
        const skillsSection = document.querySelector('.skills');
        const titleElement = skillsSection.querySelector('h2');
        
        if (titleElement) {
            titleElement.textContent = this.configManager.getSectionTitle('skills');
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
