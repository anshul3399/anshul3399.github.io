// Carousel Manager
export class CarouselManager {
    constructor(container, images, options = {}) {
        this.container = container;
        this.images = images;
        this.options = {
            orientation: 'landscape', // default
            autoplay: true,
            autoplayInterval: 1000,
            ...options
        };

        this.currentIndex = 0;
        this.autoplayTimer = null;
        this.init();
    }

    init() {
        this.container.innerHTML = ''; // Clear existing content
        this.container.className = `project-carousel carousel-${this.options.orientation}`;

        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'carousel-container';
        this.carouselContainer = carouselContainer;

        this.images.forEach(image => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            const img = document.createElement('img');
            img.src = image;
            img.loading = 'lazy';
            slide.appendChild(img);
            carouselContainer.appendChild(slide);
        });

        this.container.appendChild(carouselContainer);

        if (this.images.length > 1) {
            this.createArrows();
            this.createDots();
            this.updateCarousel();
            if (this.options.autoplay) {
                this.startAutoplay();
            }
        }
    }

    createArrows() {
        const prevButton = document.createElement('button');
        prevButton.className = 'carousel-arrow carousel-prev';
        prevButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
        prevButton.addEventListener('click', () => this.prevSlide());

        const nextButton = document.createElement('button');
        nextButton.className = 'carousel-arrow carousel-next';
        nextButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
        nextButton.addEventListener('click', () => this.nextSlide());

        this.container.appendChild(prevButton);
        this.container.appendChild(nextButton);
    }

    createDots() {
        const nav = document.createElement('div');
        nav.className = 'carousel-nav';
        this.dots = [];

        this.images.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'carousel-dot';
            dot.addEventListener('click', () => this.goToSlide(index));
            nav.appendChild(dot);
            this.dots.push(dot);
        });

        this.container.appendChild(nav);
    }

    prevSlide() {
        this.stopAutoplay();
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateCarousel();
    }

    nextSlide() {
        this.stopAutoplay();
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateCarousel();
    }

    goToSlide(index) {
        this.stopAutoplay();
        this.currentIndex = index;
        this.updateCarousel();
    }

    updateCarousel() {
        const offset = -100 * this.currentIndex;
        this.carouselContainer.style.transform = `translateX(${offset}%)`;

        if (this.dots) {
            this.dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentIndex);
            });
        }
    }

    startAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
        }
        this.autoplayTimer = setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
            this.updateCarousel();
        }, this.options.autoplayInterval);
    }

    stopAutoplay() {
        clearInterval(this.autoplayTimer);
    }
}