document.addEventListener('DOMContentLoaded', function() {
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    function escapeHtml(unsafe) {
        if (unsafe === null || typeof unsafe === 'undefined') return '';
        return unsafe.toString()
             .replace(/&/g, "&")
             .replace(/</g, "<")
             .replace(/>/g, ">")
             .replace(/"/g, "\"")
             .replace(/'/g, "'");
    }

    const header = document.querySelector('header');
    const stickyTitleElement = document.getElementById('sticky-section-title');
    const sections = Array.from(document.querySelectorAll('main section[data-section-title]'));
    const navLinks = document.querySelectorAll('header nav ul li a');
    let headerHeight = 0;
    let currentStickyTitle = "";

    function calculateHeaderHeight() {
        if (header) headerHeight = header.offsetHeight;
    }

    function updateStickyHeaderAndNav() {
        if (!header) return;
        const scrollPosition = window.scrollY;
        let newActiveSectionId = null;
        let newActiveSectionTitle = "";

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 60;
            const sectionBottom = sectionTop + section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                newActiveSectionTitle = section.getAttribute('data-section-title');
                newActiveSectionId = section.id;
            }
        });
        
        if (sections.length > 0 && scrollPosition < sections[0].offsetTop - headerHeight - 60) {
            newActiveSectionTitle = "";
            newActiveSectionId = null;
        }


        if (stickyTitleElement && newActiveSectionTitle !== currentStickyTitle) {
            stickyTitleElement.classList.remove('visible');
            currentStickyTitle = newActiveSectionTitle;
            setTimeout(() => {
                stickyTitleElement.textContent = currentStickyTitle;
                if (currentStickyTitle) stickyTitleElement.classList.add('visible');
            }, currentStickyTitle === "" || stickyTitleElement.textContent === "" ? 0 : 200);
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (newActiveSectionId && link.getAttribute('href') === `#${newActiveSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    let observer;

    function observeAnimatedElements() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        if (observer) {
            observer.disconnect();
        }
        if (!animatedElements.length) {
            return;
        }
        observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseFloat(entry.target.dataset.animationDelay || entry.target.style.transitionDelay) * 1000 || 0;
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, delay);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    observeAnimatedElements();


    if (header && sections.length > 0) {
        calculateHeaderHeight();
        window.addEventListener('resize', calculateHeaderHeight);
        window.addEventListener('scroll', updateStickyHeaderAndNav, { passive: true });
        updateStickyHeaderAndNav();
    }

    const githubUsername = "ReNothingg";
    const reposContainer = document.getElementById('github-repos-container');
    const viewAllGithubLink = document.getElementById('view-all-github-link');
    const CACHE_KEY_REPOS = `github_repos_data_${githubUsername}`;
    const CACHE_KEY_TIMESTAMP = `github_repos_timestamp_${githubUsername}`;
    const CACHE_DURATION_MS = 4 * 60 * 60 * 1000;

    if (viewAllGithubLink && githubUsername && githubUsername !== "ВАШ_GITHUB_USERNAME") {
        viewAllGithubLink.href = `https://github.com/${githubUsername}?tab=repositories`;
    } else if (viewAllGithubLink) {
        viewAllGithubLink.style.display = 'none';
    }
    
    function renderSkeletons(count = 9) {
        if (!reposContainer) return;
        reposContainer.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const skeletonCard = document.createElement('div');
            skeletonCard.classList.add('repo-card', 'skeleton', 'animate-on-scroll', 'fade-in-up');
            skeletonCard.innerHTML = `
                <div class="repo-card-content">
                    <h4></h4>
                    <p></p><p></p><p></p>
                </div>
                <div class="repo-meta">
                    <span></span><span></span><span></span>
                </div>
            `;
            reposContainer.appendChild(skeletonCard);
        }
        observeAnimatedElements();
    }

    function renderRepos(repos) {
        if (!reposContainer) return;
        reposContainer.innerHTML = '';
        if (repos.length === 0) {
            reposContainer.innerHTML = '<p class="animate-on-scroll fade-in">Публичные репозитории отсутствуют.</p>';
            observeAnimatedElements();
            return;
        }

        repos.forEach((repo, index) => {
            const repoCard = document.createElement('a');
            repoCard.classList.add('repo-card', 'animate-on-scroll', 'fade-in-up');
            repoCard.style.transitionDelay = `${index * 0.06}s`;
            repoCard.href = repo.html_url;
            repoCard.target = "_blank";
            repoCard.setAttribute('aria-label', `Репозиторий ${escapeHtml(repo.name)}`);

            repoCard.innerHTML = `
                <div class="repo-card-content">
                    <h4>${escapeHtml(repo.name)}</h4>
                    <p class="repo-description">${repo.description ? escapeHtml(repo.description.substring(0, 100)) + (repo.description.length > 100 ? '...' : '') : '<i>Описание отсутствует.</i>'}</p>
                </div>
                <div class="repo-meta">
                    ${repo.language ? `<span class="repo-language"><span class="language-color-dot" style="background-color: ${getLanguageColor(repo.language)};"></span> ${escapeHtml(repo.language)}</span>` : '<span class="repo-language"></span>'}
                    <span class="repo-stars">${repo.stargazers_count}</span>
                    <span class="repo-forks">Forks: ${repo.forks_count}</span>
                </div>
            `;
            reposContainer.appendChild(repoCard);
        });
        observeAnimatedElements();
    }
    
    function getLanguageColor(language) {
        const colors = {
            "JavaScript": "#f1e05a", "HTML": "#e34c26", "CSS": "#563d7c",
            "Python": "#3572A5", "Java": "#b07219", "TypeScript": "#3178c6",
            "Shell": "#89e051", "C#": "#178600", "C++": "#f34b7d", "PHP": "#4F5D95",
            "Ruby": "#701516", "Go": "#00ADD8", "Swift": "#F05138", "Kotlin": "#A97BFF",
            "Rust": "#dea584", "Lua": "#000080", "Dart": "#00B4AB",
        };
        return colors[language] || '#dddddd';
    }

    function renderError(message) {
        if (reposContainer) {
            reposContainer.innerHTML = `<p class="error-text animate-on-scroll fade-in">${escapeHtml(message)}</p>`;
            observeAnimatedElements();
        }
    }

    async function fetchGitHubRepos() {
        if (!githubUsername || githubUsername === "ВАШ_GITHUB_USERNAME") { 
            renderError('GitHub username не указан.');
            return;
        }
        renderSkeletons();
        const cachedTimestamp = localStorage.getItem(CACHE_KEY_TIMESTAMP);
        const cachedReposData = localStorage.getItem(CACHE_KEY_REPOS);
        if (cachedTimestamp && cachedReposData && (Date.now() - parseInt(cachedTimestamp) < CACHE_DURATION_MS)) {
            console.log('Загрузка репозиториев из кеша.');
            try {
                renderRepos(JSON.parse(cachedReposData));
            } catch(e) {
                console.error("Ошибка парсинга кешированных данных:", e);
                localStorage.removeItem(CACHE_KEY_REPOS);
                localStorage.removeItem(CACHE_KEY_TIMESTAMP);
                await fetchFreshGitHubRepos();
            }
            return;
        }
        console.log('Загрузка свежих данных репозиториев с GitHub API.');
        await fetchFreshGitHubRepos();
    }

    async function fetchFreshGitHubRepos() {
        const apiUrl = `https://api.github.com/users/${githubUsername}/repos?sort=pushed&direction=desc&per_page=9`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                let errorMsg = `Ошибка API: ${response.status}`;
                if (response.status === 403) errorMsg += " (Лимит запросов)";
                else if (response.status === 404) errorMsg += " (Пользователь не найден)";
                throw new Error(errorMsg);
            }
            const repos = await response.json();
            localStorage.setItem(CACHE_KEY_REPOS, JSON.stringify(repos));
            localStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now().toString());
            renderRepos(repos);
        } catch (error) {
            console.error("Ошибка загрузки GitHub репозиториев:", error);
            renderError(`Не удалось загрузить репозитории. (${escapeHtml(error.message)})`);
        }
    }

    if (reposContainer) {
        fetchGitHubRepos();
    }

    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (document.body.scrollTop > 350 || document.documentElement.scrollTop > 350) {
                scrollToTopBtn.style.display = "block";
                setTimeout(() => scrollToTopBtn.style.opacity = "0.85", 10);
            } else {
                scrollToTopBtn.style.opacity = "0";
                setTimeout(() => scrollToTopBtn.style.display = "none", 400);
            }
        }, { passive: true });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const heroCanvasElement = document.getElementById('hero-canvas');
    if (heroCanvasElement && heroCanvasElement instanceof HTMLCanvasElement) {
        const heroCanvas = heroCanvasElement;
        const ctx = heroCanvas.getContext('2d');
        let particlesArray;

        function resizeCanvas() {
            heroCanvas.width = heroCanvas.offsetWidth;
            heroCanvas.height = heroCanvas.offsetHeight;
        }
        
        const mouse = { x: null, y: null, radius: 0 };

        function updateMouseRadius() {
            mouse.radius = (heroCanvas.height / 120) * (heroCanvas.width / 120);
            if (mouse.radius < 60) mouse.radius = 60;
            if (mouse.radius > 250) mouse.radius = 250;
        }

        heroCanvas.addEventListener('mousemove', event => {
            mouse.x = event.offsetX;
            mouse.y = event.offsetY;
        });
        heroCanvas.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x; this.y = y;
                this.baseX = this.x; this.baseY = this.y;
                this.directionX = directionX; this.directionY = directionY;
                this.size = size; this.color = color;
                this.density = (Math.random() * 35) + 12;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            update() {
                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance === 0) distance = 0.1; 
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let maxDistance = mouse.radius;
                    let force = (maxDistance - distance) / maxDistance; 
                    if (force < 0) force = 0;
                    let moveX = forceDirectionX * force * this.density * 0.5;
                    let moveY = forceDirectionY * force * this.density * 0.5;
                    if (distance < mouse.radius) {
                        this.x -= moveX;
                        this.y -= moveY;
                    } else {
                        if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 25;
                        if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 25;
                    }
                } else {
                    if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 25;
                    if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 25;
                }
                if (Math.abs(this.x - this.baseX) > 1 || Math.abs(this.y - this.baseY) > 1) {
                     this.x += this.directionX * 0.06;
                     this.y += this.directionY * 0.06;
                }
                if (this.x + this.size > heroCanvas.width || this.x - this.size < 0) {
                    this.directionX = -this.directionX;
                    if (this.x + this.size > heroCanvas.width) this.x = heroCanvas.width - this.size;
                    if (this.x - this.size < 0) this.x = this.size;
                }
                if (this.y + this.size > heroCanvas.height || this.y - this.size < 0) {
                    this.directionY = -this.directionY;
                    if (this.y + this.size > heroCanvas.height) this.y = heroCanvas.height - this.size;
                    if (this.y - this.size < 0) this.y = this.size;
                }
                this.draw();
            }
        }

        function initParticles() {
            particlesArray = [];
            let numberOfParticles = (heroCanvas.height * heroCanvas.width) / 14000;
            if (numberOfParticles > 180) numberOfParticles = 180;
            if (numberOfParticles < 35) numberOfParticles = 35;
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 0.6;
                let x = (Math.random() * ((heroCanvas.width - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((heroCanvas.height - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * 0.25) - 0.125;
                let directionY = (Math.random() * 0.25) - 0.125;
                let color = 'rgba(220,220,220,0.6)';
                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        function animateParticles() {
            requestAnimationFrame(animateParticles);
            ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
        }
        
        resizeCanvas();
        updateMouseRadius();
        initParticles();
        animateParticles();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                resizeCanvas(); 
                updateMouseRadius();
                initParticles();
            }, 300);
        });
    } else if (heroCanvasElement) {
        console.warn("Элемент с id 'hero-canvas' найден, но это не <canvas>. Анимация частиц не будет отображена.");
    }
});