document.addEventListener('DOMContentLoaded', function() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-dot-outline');
    const magneticLinks = document.querySelectorAll('.magnetic-link');
    const magneticStrength = 0.4;

    window.addEventListener('mousemove', function (e) {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: 'forwards' });

        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
    });

    document.body.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorOutline.style.opacity = '0';
    });

    const hoverables = document.querySelectorAll('a, button, .project-card, .repo-card');
    hoverables.forEach(el => {
        el.addEventListener('mouseover', () => document.body.classList.add('cursor-hovered'));
        el.addEventListener('mouseout', () => document.body.classList.remove('cursor-hovered'));
    });

    magneticLinks.forEach(link => {
        link.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            this.style.transform = `translate(${x * magneticStrength}px, ${y * magneticStrength}px)`;
        });
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translate(0,0)';
        });
    });


    const heroTitle = document.querySelector('.hero-title');
    const heroBg = document.querySelector('.hero-background');
    const horizontalSection = document.querySelector('#projects');
    const horizontalTrack = document.querySelector('.horizontal-scroll-track');

    function handleScroll() {
        const scrollY = window.scrollY;

        if (heroTitle && heroBg) {
            heroTitle.style.transform = `translateY(${scrollY * 0.3}px)`;
            heroBg.style.transform = `scale(1.1) translateY(${scrollY * 0.4}px)`;
        }

        if (horizontalSection && horizontalTrack && window.innerWidth > 768) {
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
    
    window.addEventListener('scroll', handleScroll, { passive: true });

    
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    const header = document.querySelector('header');
    const stickyTitleElement = document.getElementById('sticky-section-title');
    const sections = Array.from(document.querySelectorAll('main section[data-section-title]'));
    const navLinks = document.querySelectorAll('header nav ul li a');
    let headerHeight = 100;

    function updateStickyHeaderAndNav() {
        const scrollPosition = window.scrollY;
        let newActiveSectionId = null;
        let newActiveSectionTitle = "";

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 50;
            if (scrollPosition >= sectionTop) {
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
            if (newActiveSectionId && link.getAttribute('href') === `#${newActiveSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => header.classList.toggle('nav-open'));
        document.querySelectorAll('#main-nav a').forEach(link => {
            link.addEventListener('click', () => header.classList.remove('nav-open'));
        });
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

    window.addEventListener('scroll', updateStickyHeaderAndNav, { passive: true });
    updateStickyHeaderAndNav();

    const githubUsername = "ReNothingg";
    const reposContainer = document.getElementById('github-repos-container');
    async function fetchGitHubRepos() {
        if (!reposContainer) return;
        reposContainer.innerHTML = '<p>Загрузка репозиториев...</p>';
        try {
            const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=pushed&direction=desc&per_page=6`);
            if (!response.ok) throw new Error('Network response was not ok');
            const repos = await response.json();
            reposContainer.innerHTML = '';
            repos.forEach(repo => {
                const repoCard = document.createElement('a');
                repoCard.className = 'repo-card';
                repoCard.href = repo.html_url;
                repoCard.target = '_blank';
                repoCard.innerHTML = `
                    <div>
                        <h4>${repo.name}</h4>
                        <p class="repo-description">${repo.description || '<i>Описание отсутствует.</i>'}</p>
                    </div>
                    <div class="repo-meta">
                        ${repo.language ? `<span>${repo.language}</span>` : ''}
                        <span>★ ${repo.stargazers_count}</span>
                        <span>Forks: ${repo.forks_count}</span>
                    </div>
                `;
                reposContainer.appendChild(repoCard);
            });
        } catch (error) {
            reposContainer.innerHTML = '<p>Не удалось загрузить репозитории.</p>';
            console.error('GitHub fetch error:', error);
        }
    }
    if (reposContainer) fetchGitHubRepos();


    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            const shouldBeVisible = window.scrollY > 300;
            scrollToTopBtn.style.display = shouldBeVisible ? "flex" : "none";
            scrollToTopBtn.style.opacity = shouldBeVisible ? "1" : "0";
        }, { passive: true });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});