document.addEventListener('DOMContentLoaded', () => {

    const hobbiesData = {
        'knitting': {
            title: 'Вязание',
            description: 'Учусь вязанию. Это помогает мне расслабиться и сосредоточиться на процессе создания. Я экспериментирую с различными узорами и техниками, и это приносит мне удовольствие.',
            links: [],
            timeline: [
                { type: 'image', src: 'knitting/1.jpg', caption: '2025: Змея. Вот такая получилась.' },
                { type: 'image', src: 'knitting/IMG_20250728_181518_925.jpg', caption: '2025: продолжаю учиться! Получается на весь "браслет" ушло пол часа. А на средние концов ушло 10 минут. Я честно не уверен что сделал правильно, но оно держится что не может не радовать.' },
            ],
            audioTracks: []
        },


        //https://soundcloud.com/oembed?format=json&url=СЮДА_ССЫЛКУ

        'music': {
            title: 'Музыка и FL Studio',
            description: 'Изучаю создание музыки в FL Studio. Изучал с целью написания музыки для игр. Я экспериментирую с различными жанрами и техниками, и это приносит мне радость. И смех.',
            links: [
                { url: 'https://soundcloud.com/renothingg', text: 'SoundCloud', icon: 'fab fa-soundcloud' }
            ],
            timeline: [],
            audioTracks: [
                {
                    title: 'Runner Theme',
                    src: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2111368644&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true',
                },
                {
                    title: 'Gear Theme',
                    src: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2111369292&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true',
                    
                },
                {
                    title: 'Flying Theme',
                    src: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2111369487&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true',
                },
            ]
        },



        'video': {
            title: 'Видеомонтаж',
            description: 'Изучаю основы видеомонтажа. Хочу научиться создавать качественные видео для своих проектов. Экспериментирую с различными стилями и техниками. Вообще я начал его изучать для создания всяких видосов в SynvexAI, но потом понял, что это может пригодиться и в других проектах. Потом пошел на ютуб и вот.',
            links: [
                { url: 'https://www.youtube.com/@ReNothinggg', text: 'Мой YouTube', icon: 'fab fa-youtube' },
            ],
            timeline: [
                { type: 'youtube', videoId: 'ae-6QArWrdI', caption: 'ChessAI' },
                { type: 'youtube', videoId: 'SU5lVPNFXbE', caption: 'AI Learns Geometry Dash' },
                { type: 'youtube', videoId: 'XlHLGmczQa0', caption: 'Floppa RUN - Theme' },
                { type: 'youtube', videoId: 'dChuK_ugc5I', caption: 'Unity за 15 минут: делаем Flappy Bird под Android' },
                { type: 'youtube', videoId: 'biQXemAezUI', caption: '5 Ways to Use AI Right Now #ai #coding #code #gpu #SynvexAI #GPT #funny' },
                { type: 'youtube', videoId: 'uoTeVcbG1gw', caption: 'Unity за 9 минут: Перемещение курсором' },
                { type: 'youtube', videoId: 'EAtrIKG9bVY', caption: 'Floppa RUN — [Randomverse] — Showcase' }
            ],
            audioTracks: []
        }
    };

    const modal = document.getElementById('hobbyModal');
    if (!modal) return;

    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const linksSection = document.getElementById('modal-links-section');
    const linksContainer = document.getElementById('modal-links-container');
    const audioSection = document.getElementById('modal-audio-section');
    const audioContainer = document.getElementById('modal-audio-container');
    const timelineSection = document.getElementById('modal-timeline-section');
    const timelineContainer = document.getElementById('modal-timeline');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const hobbyCards = document.querySelectorAll('.hobby-card');

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function populateModal(hobbyId) {
        const data = hobbiesData[hobbyId];
        if (!data) return;

        modalTitle.textContent = data.title;
        modalDescription.textContent = data.description;
        
        linksContainer.innerHTML = '';
        audioContainer.innerHTML = '';
        timelineContainer.innerHTML = '';

        if (data.links && data.links.length > 0) {
            linksSection.style.display = 'block';
            data.links.forEach(link => {
                const linkBtn = document.createElement('a');
                linkBtn.className = 'modal-link-btn';
                linkBtn.href = link.url;
                linkBtn.target = '_blank';
                linkBtn.rel = 'noopener noreferrer';
                linkBtn.innerHTML = `<i class="${link.icon}"></i> ${link.text}`;
                linksContainer.appendChild(linkBtn);
            });
        } else {
            linksSection.style.display = 'none';
        }

        if (data.audioTracks && data.audioTracks.length > 0) {
            audioSection.style.display = 'block';
            data.audioTracks.forEach(track => {
                const isSoundCloud = track.src.includes('soundcloud.com/player');
                const playerWrapper = document.createElement('div');

                if (isSoundCloud) {
                    playerWrapper.className = 'soundcloud-embed-container';
                    playerWrapper.innerHTML = `
                        <iframe scrolling="no" frameborder="no" allow="autoplay" src="${track.src}"></iframe>
                        <p>${track.title}</p>
                    `;
                } else {
                    playerWrapper.className = 'audio-player';
                    const audio = new Audio(track.src);
                    
                    playerWrapper.innerHTML = `
                        <button class="play-pause-btn"><i class="fas fa-play"></i></button>
                        <div class="audio-info">
                            <div class="audio-title">${track.title}</div>
                            <div class="progress-container">
                                <div class="progress-bar"></div>
                            </div>
                        </div>
                        <div class="time-display">00:00 / 00:00</div>
                    `;
                    
                    const playBtn = playerWrapper.querySelector('.play-pause-btn');
                    const playIcon = playBtn.querySelector('i');
                    const progressBar = playerWrapper.querySelector('.progress-bar');
                    const progressContainer = playerWrapper.querySelector('.progress-container');
                    const timeDisplay = playerWrapper.querySelector('.time-display');

                    playBtn.addEventListener('click', () => {
                        if (audio.paused) audio.play(); else audio.pause();
                    });
                    audio.addEventListener('play', () => playIcon.className = 'fas fa-pause');
                    audio.addEventListener('pause', () => playIcon.className = 'fas fa-play');
                    audio.addEventListener('ended', () => playIcon.className = 'fas fa-play');
                    audio.addEventListener('timeupdate', () => {
                        const progress = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
                        progressBar.style.width = `${progress}%`;
                        timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration || 0)}`;
                    });
                    progressContainer.addEventListener('click', (e) => {
                        if (audio.duration) {
                            audio.currentTime = (e.offsetX / progressContainer.clientWidth) * audio.duration;
                        }
                    });
                }
                audioContainer.appendChild(playerWrapper);
            });
        } else {
            audioSection.style.display = 'none';
        }

        if (data.timeline && data.timeline.length > 0) {
            timelineSection.style.display = 'block';
            data.timeline.forEach(item => {
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                if (item.type === 'youtube') {
                    timelineItem.innerHTML = `<div class="video-embed-container"><iframe src="https://www.youtube.com/embed/${item.videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p>${item.caption}</p>`;
                } else {
                    timelineItem.innerHTML = `<img src="${item.src}" alt="${item.caption}"><p>${item.caption}</p>`;
                }
                timelineContainer.appendChild(timelineItem);
            });
        } else {
            timelineSection.style.display = 'none';
        }
    }

    function openModal() {
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        document.body.classList.remove('modal-open');
        audioContainer.querySelectorAll('audio').forEach(audio => audio.pause());
        timelineContainer.querySelectorAll('iframe').forEach(iframe => iframe.src = iframe.src);
        audioContainer.querySelectorAll('iframe').forEach(iframe => iframe.src = iframe.src);
    }

    hobbyCards.forEach(card => card.addEventListener('click', () => {
        const hobbyId = card.dataset.hobbyId;
        populateModal(hobbyId);
        openModal();
    }));

    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => e.target === modal && closeModal());
    document.addEventListener('keydown', (e) => e.key === 'Escape' && document.body.classList.contains('modal-open') && closeModal());
});
