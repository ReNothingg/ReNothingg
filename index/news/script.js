document.addEventListener('DOMContentLoaded', () => {
    const stickyTitle = document.getElementById('sticky-section-title');
    const header = document.querySelector('header');

    function handleStickyTitle() {
        if (stickyTitle && header) {
            if (window.scrollY > header.offsetHeight / 2) {
                stickyTitle.classList.add('visible');
            } else {
                stickyTitle.classList.remove('visible');
            }
        }
    }
    window.addEventListener('scroll', handleStickyTitle);
    handleStickyTitle(); 

    
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                scrollToTopBtn.style.display = 'block';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.animationDelay || '0s';
                entry.target.style.transitionDelay = delay;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }


    const newsList = document.querySelector('.news-list');
    if (newsList && newsList.children.length > 0) {
        
        const latestNewsItem = newsList.children[0]; 
        const newsTitleElement = latestNewsItem.querySelector('.news-title');
        
        if (newsTitleElement) {
            const newBadge = document.createElement('span');
            newBadge.textContent = '🔥'; 
            newBadge.title = 'Последняя новость';
            newBadge.classList.add('latest-news-badge'); 
            
            
            const titleLink = newsTitleElement.querySelector('a');
            if (titleLink) {
                titleLink.appendChild(newBadge);
            } else {
                newsTitleElement.appendChild(newBadge);
            }
        }
    }

    
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {      
        if (anchor.getAttribute('href') === '#' || anchor.getAttribute('href') === '#0') return; 
        anchor.addEventListener('click', function (e) {
            const hrefAttribute = this.getAttribute('href');
            try {
                const targetElement = document.querySelector(hrefAttribute);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            } catch (error) {
                
                console.warn('Smooth scroll target not found or invalid selector:', hrefAttribute);
            }
        });
    });
});