// Carousel Manager
export class CarouselManager {
    constructor(carouselElement) {
        this.carousel = carouselElement;
        this.container = carouselElement.querySelector('.carousel-container');
        this.slides = Array.from(this.container.querySelectorAll('.carousel-slide'));
        this.dots = Array.from(carouselElement.querySelectorAll('.carousel-dot'));
        this.prevButton = carouselElement.querySelector('.carousel-prev');
        this.nextButton = carouselElement.querySelector('.carousel-next');
        
        this.currentIndex = 0;
        this.slidesCount = this.slides.length;
        
        this.initializeCarousel();
    }
    
    initializeCarousel() {
        // Add event listeners
        this.prevButton.addEventListener('click', () => this.prevSlide());
        this.nextButton.addEventListener('click', () => this.nextSlide());
        
        // Add dot click handlers
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Add touch support
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, { passive: true });
        
        // Initial update
        this.updateCarousel();
    }
    
    handleSwipe(startX, endX) {
        const diff = startX - endX;
        const threshold = 50; // minimum distance for swipe
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }
    
    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.slidesCount) % this.slidesCount;
        this.updateCarousel();
    }
    
    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.slidesCount;
        this.updateCarousel();
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
    }
    
    updateCarousel() {
        // Update slides
        const offset = -100 * this.currentIndex;
        this.container.style.transform = `translateX(${offset}%)`;
        
        // Update dots
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
        
        // Update button states (optional for infinite scroll)
        this.prevButton.classList.toggle('disabled', this.currentIndex === 0);
        this.nextButton.classList.toggle('disabled', this.currentIndex === this.slidesCount - 1);
    }
}
