# Project Overview

This is a personal portfolio website for Anshul Sharma. It is a static website built with HTML, CSS, and vanilla JavaScript. The website is designed to be modern, responsive, and performant.

The key feature of this project is that all the content is dynamically generated from the `config.json` file. This allows for easy updates to the portfolio without needing to modify any of the source code.

## Main Technologies

*   **HTML:** The structure of the website.
*   **CSS:** Styling and layout.
*   **Vanilla JavaScript:** For dynamic content generation and interactivity.
*   **JSON:** For storing the portfolio content.

## Project Structure

*   `index.html`: The main HTML file.
*   `config.json`: Contains all the data for the portfolio, including personal information, projects, experience, and skills.
*   `css/`: Contains all the CSS files for styling the website.
*   `js/`: Contains all the JavaScript files for the website's functionality.
    *   `main.js`: The entry point for the application. It initializes all the other modules.
    *   `config-manager.js`: Loads and manages the `config.json` file.
    *   `seo-manager.js`: Manages the SEO tags.
    *   `theme-manager.js`: Manages the dark/light theme.
    *   `loading-manager.js`: Manages the loading screen.
    *   `section-manager.js`: Manages the different sections of the portfolio.
    *   `header-manager.js`: Manages the header section.
    *   `github-projects-manager.js`: Fetches and displays the projects from GitHub.
    *   `footer-manager.js`: Manages the footer section.
    *   `carousel-manager.js`: Manages the carousels for the projects.
*   `assets/`: Contains all the assets for the website, such as images and logos.

# Building and Running

This is a static website, so there is no build process. To run the website, you can simply open the `index.html` file in your browser.

# Development Conventions

*   The website is configured through the `config.json` file. To add, remove, or modify any content, you should edit this file.
*   The JavaScript code is modular and organized into different managers for each functionality.
*   The CSS is also modular and organized into different files for each component.
*   The website is designed to be mobile-first and responsive across all devices.
*   The website supports both dark and light themes.
*   The website automatically fetches and displays the latest projects from GitHub.
