document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const stickyTitle = document.getElementById('pageStickyTitle');
    const heroSection = document.getElementById('hero');
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('section[id]');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    function handleScroll() {
        const heroHeight = heroSection ? heroSection.offsetHeight : 0;
        if (window.scrollY > heroHeight / 2) {
            stickyTitle.classList.add('visible');
        } else {
            stickyTitle.classList.remove('visible');
        }

        if (window.scrollY > 300) {
            scrollToTopBtn.style.display = 'block';
            setTimeout(() => scrollToTopBtn.style.opacity = '0.8', 10);
        } else {
            scrollToTopBtn.style.opacity = '0';
            setTimeout(() => scrollToTopBtn.style.display = 'none', 300);
        }

        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - header.offsetHeight - 50) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentSection) {
                link.classList.add('active');
            }
        });
        if (!currentSection && heroSection) {
             const homeLink = document.querySelector('nav ul li a[href="#hero"]');
             if (homeLink) homeLink.classList.add('active');
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.hash !== "") {
                e.preventDefault();
                const hash = this.hash;
                const targetElement = document.querySelector(hash);
                if (targetElement) {
                    const headerOffset = header.offsetHeight;
                    const elementPosition = targetElement.offsetTop;
                    const offsetPosition = elementPosition - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.animationDelay) || 0;
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    };

    const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);
    animatedElements.forEach(el => scrollObserver.observe(el));


    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray;

        function setCanvasSize() {
            canvas.width = window.innerWidth;
            canvas.height = heroSection.offsetHeight;
        }

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            update() {
                if (this.x > canvas.width || this.x < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.directionY = -this.directionY;
                }
                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        function initParticles() {
            particlesArray = [];
            const numberOfParticles = (canvas.height * canvas.width) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                const size = (Math.random() * 2) + 0.5;
                const x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                const y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                const directionX = (Math.random() * .4) - .2;
                const directionY = (Math.random() * .4) - .2;
                const color = 'rgba(200,200,200,0.3)';
                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        function animateParticles() {
            requestAnimationFrame(animateParticles);
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
        }
        
        if (heroSection && canvas) {
            setCanvasSize();
            initParticles();
            animateParticles();
    
            window.addEventListener('resize', () => {
                setCanvasSize();
                initParticles();
            });
        }
    }
});