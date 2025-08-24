// Footer Manager Module
export class FooterManager {
    updateFooterSection(config) {
        if (!config.footer) return;

        const footer = document.querySelector('.footer');
        if (!footer) return;

        // Update footer tagline
        this.updateFooterTagline(config.footer);

        // Update footer social links
        if (config.footer.show_social_links) {
            this.updateFooterSocialLinks(config);
        }

        // Update footer bottom content
        this.updateFooterBottom(config.footer);
    }

    updateFooterTagline(footerConfig) {
        const taglineElement = document.querySelector('.footer-tagline');
        if (taglineElement && footerConfig.tagline) {
            taglineElement.textContent = footerConfig.tagline;
        }
    }

    updateFooterSocialLinks(config) {
        const footerSocial = document.querySelector('.footer-social');
        if (!footerSocial) return;

        // Clear existing social links
        footerSocial.innerHTML = '';

        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();

        // Use main social_links array (same as header)
        const socialLinks = config.social_links;
        
        if (socialLinks && Array.isArray(socialLinks)) {
            socialLinks.forEach(social => {
                const socialLink = this.createSocialLink(social);
                if (socialLink) {
                    fragment.appendChild(socialLink);
                }
            });
        }

        // Add Source Code link only in footer
        if (config.github_username) {
            const sourceCodeLink = this.createSocialLink({
                name: 'Source Code',
                url: `https://github.com/${config.github_username}/${config.github_username}.github.io`,
                icon: 'code'
            });
            if (sourceCodeLink) {
                fragment.appendChild(sourceCodeLink);
            }
        }

        // Fallback: Add GitHub link if no social_links array exists but github_username is present
        if ((!socialLinks || socialLinks.length === 0) && config.github_username) {
            const githubLink = this.createSocialLink({
                name: 'GitHub',
                url: `https://github.com/${config.github_username}`,
                icon: 'github'
            });
            if (githubLink) {
                fragment.appendChild(githubLink);
            }
        }

        footerSocial.appendChild(fragment);
    }

    createSocialLink(social) {
        const iconTemplate = document.querySelector(`#${social.icon}-icon`);
        if (!iconTemplate) return null;

        const link = document.createElement('a');
        link.href = social.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', `${social.name} Profile`);

        const icon = iconTemplate.content.cloneNode(true);
        link.appendChild(icon);

        return link;
    }

    updateFooterBottom(footerConfig) {
        // Update "built with" text
        const builtWithElement = document.querySelector('.footer-built-with');
        if (builtWithElement) {
            if (footerConfig.show_built_with && footerConfig.built_with_text) {
                builtWithElement.textContent = footerConfig.built_with_text;
                builtWithElement.style.display = 'block';
            } else {
                builtWithElement.style.display = 'none';
            }
        }

        // Update attributions
        this.updateAttributions(footerConfig);
    }

    updateAttributions(footerConfig) {
        const attributionsElement = document.querySelector('.footer-attributions');
        if (!attributionsElement || !footerConfig.attributions) return;

        attributionsElement.innerHTML = ''; // Clear existing attributions

        const toggleButton = document.createElement('button');
        toggleButton.classList.add('attributions-toggle');
        toggleButton.innerHTML = `
            <span class="attributions-title">Attribution(s)</span>
            <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        `;

        const content = document.createElement('div');
        content.classList.add('attributions-content');

        footerConfig.attributions.forEach((attr, index) => {
            const link = document.createElement('a');
            link.href = attr.url;
            link.textContent = attr.name;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            content.appendChild(link);

            if (index < footerConfig.attributions.length - 1) {
                const separator = document.createTextNode(', ');
                content.appendChild(separator);
            }
        });

        const disclaimer = document.createElement('p');
        disclaimer.classList.add('disclaimer-text');
        disclaimer.textContent = "Disclaimer: All product names, logos, and brands are property of their respective owners. All company, product, and service names used in this website are for identification purposes only. Use of these names, logos, and brands does not imply endorsement.";
        content.appendChild(disclaimer);

        attributionsElement.appendChild(toggleButton);
        attributionsElement.appendChild(content);

        toggleButton.addEventListener('click', () => {
            content.classList.toggle('show');
            toggleButton.querySelector('.chevron-icon').classList.toggle('rotated');
        });
    }
}