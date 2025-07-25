document.addEventListener('DOMContentLoaded', () => {
    const hobbiesData = {
        'knitting': {
            title: 'Вязание',
            description: 'Учусь вязанию. Это помогает мне расслабиться и сосредоточиться на процессе создания. Я экспериментирую с различными узорами и техниками, и это приносит мне удовольствие.',
            timeline: [
                { img: 'https://images.unsplash.com/photo-1595015486923-b924757c6b97?q=80&w=600', caption: '2024: Мой первый шарф. Неровный, но свой.' },
                { img: 'https://images.unsplash.com/photo-1602484742401-20423c727572?q=80&w=600', caption: '2024: Осваиваю круговое вязание на примере шапки.' }
            ],
            audioTracks: []
        },
        'music': {
            title: 'Музыка и FL Studio',
            description: 'Изучаю создание музыки в FL Studio. Изучал с целью написания музыки для игр. Я экспериментирую с различными жанрами и техниками, и это приносит мне радость. И смех.',
            timeline: [
                { img: 'https://images.unsplash.com/photo-1619983081593-e2235bf58758?q=80&w=600', caption: '2023: Первые шаги. Разобрался с интерфейсом и секвенсором.' },
                { img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600', caption: '2024: Эксперименты с синтезаторами и написание первой мелодии.' }
            ],
            audioTracks: [
                { src: 'music1.mp3', title: 'Первый набросок' },
                { src: 'music2.ogg', title: 'Мелодия для главного меню' }
            ]
        },
        'video': {
            title: 'Видеомонтаж',
            description: 'Изучаю основы видеомонтажа. Хочу научиться создавать качественные видео для своих проектов. Экспериментирую с различными стилями и техниками. Вообще я начал его изучать для создания всякх водосов в SynvexAI, но потом понял, что это может пригодиться и в других проектах. Потом пошел на юьюб и вот.',
            timeline: [
                { img: 'https://images.unsplash.com/photo-1619983081593-e2235bf58758?q=80&w=600', caption: '2023: Первые шаги. Разобрался с интерфейсом и секвенсором.' },
                { img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600', caption: '2024: Эксперименты с синтезаторами и написание первой мелодии.' }
            ],
            audioTracks: []
        }
    };

    const modal = document.getElementById('hobbyModal');
    if (!modal) return;

    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    
    const audioSection = document.getElementById('modal-audio-section');
    const audioContainer = document.getElementById('modal-audio-container');

    const timelineSection = document.getElementById('modal-timeline-section');
    const timelineContainer = document.getElementById('modal-timeline');
    
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const hobbyCards = document.querySelectorAll('.hobby-card');

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function populateModal(hobbyId) {
        const data = hobbiesData[hobbyId];
        if (!data) return;

        modalTitle.textContent = data.title;
        modalDescription.textContent = data.description;
        
        audioContainer.innerHTML = '';
        timelineContainer.innerHTML = '';

        if (data.audioTracks && data.audioTracks.length > 0) {
            audioSection.style.display = 'block';
            data.audioTracks.forEach(track => {
                const player = document.createElement('div');
                player.className = 'audio-player';

                const audio = new Audio(track.src);

                player.innerHTML = `
                    <button class="play-pause-btn"><i class="fas fa-play"></i></button>
                    <div class="audio-info">
                        <div class="audio-title">${track.title}</div>
                        <div class="progress-container">
                            <div class="progress-bar"></div>
                        </div>
                    </div>
                    <div class="time-display">00:00 / 00:00</div>
                `;
                audioContainer.appendChild(player);

                const playBtn = player.querySelector('.play-pause-btn');
                const playIcon = playBtn.querySelector('i');
                const progressBar = player.querySelector('.progress-bar');
                const progressContainer = player.querySelector('.progress-container');
                const timeDisplay = player.querySelector('.time-display');

                playBtn.addEventListener('click', () => {
                    if (audio.paused) {
                        audio.play();
                        playIcon.className = 'fas fa-pause';
                    } else {
                        audio.pause();
                        playIcon.className = 'fas fa-play';
                    }
                });

                audio.addEventListener('timeupdate', () => {
                    const progressPercent = (audio.currentTime / audio.duration) * 100;
                    progressBar.style.width = `${progressPercent}%`;
                    timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration || 0)}`;
                });

                audio.addEventListener('ended', () => {
                    playIcon.className = 'fas fa-play';
                    progressBar.style.width = '0%';
                });

                progressContainer.addEventListener('click', (e) => {
                    const width = progressContainer.clientWidth;
                    const clickX = e.offsetX;
                    audio.currentTime = (clickX / width) * audio.duration;
                });
            });
        } else {
            audioSection.style.display = 'none';
        }

        if (data.timeline && data.timeline.length > 0) {
            timelineSection.style.display = 'block';
            data.timeline.forEach(item => {
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                timelineItem.innerHTML = `
                    <img src="${item.img}" alt="${item.caption}">
                    <p>${item.caption}</p>
                `;
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
    }

    hobbyCards.forEach(card => {
        card.addEventListener('click', () => {
            const hobbyId = card.dataset.hobbyId;
            populateModal(hobbyId);
            openModal();
        });
    });

    modalCloseBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('modal-open')) {
            closeModal();
        }
    });
});