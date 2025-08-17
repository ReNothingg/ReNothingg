document.addEventListener('DOMContentLoaded', function() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
    }

    if (!isTouchDevice) {
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorOutline = document.querySelector('.cursor-dot-outline');
        
        window.addEventListener('mousemove', function (e) {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: 'forwards' });
        });

        const hoverables = document.querySelectorAll('a, button, .interactive-card, .repo-card, .news-list li');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hovered'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hovered'));
        });

        const magneticElements = document.querySelectorAll('.magnetic-link, .magnetic-element');
        const magneticStrength = 0.4;
        magneticElements.forEach(elem => {
            elem.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                this.style.transform = `translate(${x * magneticStrength}px, ${y * magneticStrength}px) scale(1.1)`;
                this.style.transition = 'transform 0.1s linear';
            });
            elem.addEventListener('mouseleave', function() {
                this.style.transform = 'translate(0,0) scale(1)';
                this.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
            });
        });
    }

    const header = document.getElementById('main-header');
    const stickyTitleElement = document.getElementById('sticky-section-title');
    const sections = Array.from(document.querySelectorAll('main section[data-section-title]'));
    const navLinks = document.querySelectorAll('#main-nav a');
    let headerHeight = header.offsetHeight;

    function handleHeaderAndNav() {
        const scrollY = window.scrollY;

        if (scrollY > window.innerHeight * 0.8) {
            header.classList.add('is-visible');
        } else {
            header.classList.remove('is-visible');
        }

        let newActiveSectionId = null;
        let newActiveSectionTitle = "";

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 50;
            if (scrollY >= sectionTop) {
                newActiveSectionTitle = section.getAttribute('data-section-title');
                newActiveSectionId = section.id;
            }
        });
        
        if (stickyTitleElement && stickyTitleElement.textContent !== newActiveSectionTitle) {
            stickyTitleElement.textContent = newActiveSectionTitle;
            stickyTitleElement.classList.toggle('visible', !!newActiveSectionTitle);
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            if (newActiveSectionId && linkHref === `#${newActiveSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    const heroTitle = document.querySelector('.hero-title');
    const heroBg = document.querySelector('.hero-background');
    const horizontalSection = document.querySelector('#projects');
    const horizontalTrack = document.querySelector('.horizontal-scroll-track');

    function handleScrollEffects() {
        const scrollY = window.scrollY;

        if (heroTitle && heroBg) {
            heroTitle.style.transform = `translateY(${scrollY * 0.3}px)`;
            heroBg.style.transform = `scale(1.1) translateY(${scrollY * 0.4}px)`;
        }

        if (horizontalSection && horizontalTrack && window.innerWidth > 992) {
            const sectionTop = horizontalSection.offsetTop;
            const sectionHeight = horizontalSection.offsetHeight;
            const trackWidth = horizontalTrack.scrollWidth;
            const windowWidth = window.innerWidth;

            if (scrollY >= sectionTop && scrollY <= sectionTop + sectionHeight - window.innerHeight) {
                let progress = (scrollY - sectionTop) / (sectionHeight - window.innerHeight);
                let move = progress * (trackWidth - windowWidth);
                horizontalTrack.style.transform = `translateX(-${move}px)`;
            }
        }
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseFloat(entry.target.dataset.animationDelay || 0) * 1000;
                setTimeout(() => entry.target.classList.add('is-visible'), delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    const githubUsername = "ReNothingg";
    const reposContainer = document.getElementById('github-repos-container');
    async function fetchGitHubRepos() {
        if (!reposContainer) return;
        reposContainer.innerHTML = '<p>Загрузка репозиториев...</p>';
        try {
            const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=pushed&direction=desc&per_page=7`);
            if (!response.ok) throw new Error('Network response was not ok');
            const repos = await response.json();
            reposContainer.innerHTML = '';
            repos.forEach((repo, index) => {
                const repoCard = document.createElement('a');
                repoCard.className = 'repo-card animate-on-scroll fade-in-up';
                if (index === 0) repoCard.classList.add('bento-item-large');
                if (index === 3) repoCard.classList.add('bento-item-wide');

                repoCard.href = repo.html_url;
                repoCard.target = '_blank';
                repoCard.rel = 'noopener noreferrer';
                repoCard.innerHTML = `
                    <div class="repo-card-glow"></div>
                    <div class="repo-card-content">
                        <h4>${repo.name}</h4>
                        <p class="repo-description">${repo.description || '<i>Описание отсутствует.</i>'}</p>
                        <div class="repo-meta">
                            ${repo.language ? `<span><span class="repo-lang-color" style="background-color: #fff"></span> ${repo.language}</span>` : ''}
                            <span>★ ${repo.stargazers_count}</span>
                            <span>⑂ ${repo.forks_count}</span>
                        </div>
                    </div>
                `;
                reposContainer.appendChild(repoCard);
                observer.observe(repoCard);
            });
        } catch (error) {
            reposContainer.innerHTML = '<p>Не удалось загрузить репозитории.</p>';
            console.error('GitHub fetch error:', error);
        }
    }
    if (reposContainer) fetchGitHubRepos();

    const subtitle = document.querySelector('.animated-subtitle');
    if (subtitle) {
        const text = subtitle.textContent;
        subtitle.innerHTML = '';
        text.split(' ').forEach(word => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word';
            wordSpan.innerHTML = `${word.split('').map(char => `<span>${char}</span>`).join('')} `;
            subtitle.appendChild(wordSpan);
        });
    }

    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.body.classList.toggle('nav-open');
            header.classList.toggle('nav-open');
        });
        document.querySelectorAll('#main-nav a').forEach(link => {
            link.addEventListener('click', () => {
                document.body.classList.remove('nav-open');
                header.classList.remove('nav-open');
            });
        });
    }

    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            const shouldBeVisible = window.scrollY > 300;
            scrollToTopBtn.style.opacity = shouldBeVisible ? "1" : "0";
            scrollToTopBtn.style.pointerEvents = shouldBeVisible ? "auto" : "none";
        }, { passive: true });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    const techCards = document.querySelectorAll('.tech-card');
    techCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            document.body.classList.add('cursor-hovered');
        });
        
        card.addEventListener('mouseleave', function() {
            document.body.classList.remove('cursor-hovered');
        });
        
        card.addEventListener('click', function() {
            const techName = this.querySelector('.tech-name').textContent;
            console.log(`Clicked on: ${techName}`);
        });
    });

    window.addEventListener('scroll', () => {
        handleHeaderAndNav();
        handleScrollEffects();
    }, { passive: true });

    handleHeaderAndNav();
});