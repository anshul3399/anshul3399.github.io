# Copilot Instructions for anshul3399.github.io

## Project Overview

This is a personal portfolio site built with vanilla JavaScript, using a modular structure and dynamic content loading from `config.json`.  
The site is fully responsive, supports dark/light themes, and is configured entirely via JSON (no code changes required for content updates).

## Architecture & Key Files

- **`index.html`**: Main HTML entry point. All sections (about, skills, projects, experience, GitHub projects, footer) are present as `<section>` elements.
- **`config.json`**: Central configuration for all site content. Contains sections for features, header, social links, about, projects, experience, skills, GitHub username, and footer.
- **`js/`**: Contains modular managers for each section:
  - `main.js`: App entry point, initializes managers and loads config.
  - `config-manager.js`: Loads and parses `config.json`.
  - `section-manager.js`: Renders all main sections from config.
  - `header-manager.js`, `footer-manager.js`, `theme-manager.js`, `loading-manager.js`, `seo-manager.js`, `github-projects-manager.js`: Specialized logic for each area.
- **`css/`**: Modular CSS files for each section and theme.

## Developer Workflows

- **Content Update**: Edit `config.json` to change site content. No code changes required for new projects, skills, or experience.
- **README Auto-Generation**:  
  - GitHub Actions workflow `.github/workflows/update-readme.yml` runs `update-readme.js` to regenerate `README.md` from `config.json`.
  - To trigger manually, use the workflow dispatch in GitHub Actions.
- **No Build Step**: The site runs directly in the browser. No bundling or transpilation required.
- **Testing**: No automated tests are present; manual browser testing is standard.

## Project-Specific Patterns

- **Section Rendering**: All content sections are rendered dynamically from `config.json` using the appropriate manager in `js/`.
- **Featured Projects Filtering**:  
  - Projects have a `domain` array (e.g., `["Development", "Automation"]`).
  - UI chips allow filtering featured projects by domain.
- **SEO & Social Links**:  
  - SEO meta tags and social links are updated dynamically from config.
- **GitHub Projects**:  
  - The "Projects on GitHub" section fetches repositories with the "featured" topic from the configured GitHub username.

## Conventions

- **No Frameworks**: All code is vanilla JS, modularized by feature.
- **Config-Driven**: All content and most behaviors are controlled via `config.json`.
- **Accessibility**: ARIA attributes and semantic HTML are used throughout.
- **Responsive Design**: CSS is mobile-first and modular.

## Examples

- To add a new featured project, update the `projects.items` array in `config.json`:
  ```json
  {
    "name": "New Project",
    "date": "2025-08-13",
    "description": ["Description line 1", "Description line 2"],
    "picture": "assets/projects/new_project.png",
    "link": { "url": "https://example.com", "title": "View Project" },
    "domain": ["Development", "Automation"]
  }
  ```
- To add a new skill category:
  ```json
  {
    "name": "Cloud Platforms",
    "items": ["AWS", "Azure", "GCP"]
  }
  ```

## Key Integration Points

- **GitHub API**: Used for fetching featured repositories.
- **README Generation**: Automated via GitHub Actions and Node.js script.

