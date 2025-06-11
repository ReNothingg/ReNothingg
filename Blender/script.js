document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery-container');
    const renderFolderPath = 'render/';

    const imageFiles = [
        '0001-0100.mkv',
        'FHUMAN.png',
        'Gamepad.png',
        'gribochek.png',
        'hum.png',
        'lololowka.png',
        'NSkirt.png',
        'NWithAmNam.png',
        'smotrashixlo.png',
        'spaceAnim0001-0250.mkv',
        'spasaasasas.png',
        'stan.png',
        'TextMatrialsLight.png',
        'vglitch.png',
        'watermelon.png'
    ];

    const lightbox = document.getElementById('lightbox');
    const lightboxMediaContainer = document.getElementById('lightbox-media-container');
    const lightboxFilename = document.getElementById('lightbox-filename');
    const lightboxResolution = document.getElementById('lightbox-resolution');
    const lightboxFilesize = document.getElementById('lightbox-filesize');
    const lightboxClose = document.querySelector('.lightbox-close');

    if (imageFiles.length === 0) {
        const message = document.createElement('p');
        message.textContent = 'В папке "render" пока нет изображений/видео, или список imageFiles в script.js пуст.';
        message.style.textAlign = 'center';
        message.style.fontSize = '1.2rem';
        galleryContainer.appendChild(message);
        return;
    }

    function getFileExtension(filename) {
        return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function openLightbox(filePath, fileName) {
        lightboxFilename.textContent = `Файл: ${fileName}`;
        lightboxResolution.textContent = 'Разрешение: загрузка...';
        lightboxFilesize.textContent = 'Размер: загрузка...';
        lightboxMediaContainer.innerHTML = '';

        const extension = getFileExtension(fileName);
        let mediaElement;

        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
            mediaElement = document.createElement('img');
            mediaElement.onload = () => {
                lightboxResolution.textContent = `Разрешение: ${mediaElement.naturalWidth} x ${mediaElement.naturalHeight}`;
            };
            mediaElement.onerror = () => {
                lightboxResolution.textContent = 'Разрешение: не удалось загрузить';
                mediaElement.alt = 'Ошибка загрузки изображения';
            };
        } else if (['mp4', 'webm', 'ogv', 'mkv'].includes(extension)) {
            mediaElement = document.createElement('video');
            mediaElement.controls = true;
            mediaElement.autoplay = true;
            mediaElement.loop = true;
            mediaElement.onloadedmetadata = () => {
                lightboxResolution.textContent = `Разрешение: ${mediaElement.videoWidth} x ${mediaElement.videoHeight}`;
            };
            mediaElement.onerror = (e) => {
                lightboxResolution.textContent = 'Разрешение: ошибка';
                const errorText = document.createElement('p');
                errorText.textContent = `Не удалось загрузить видео: ${fileName}.`;
                if (extension === 'mkv') {
                    errorText.textContent += ' Формат .mkv может не поддерживаться вашим браузером. Попробуйте .mp4 или .webm.';
                }
                errorText.style.color = 'var(--light-accent)';
                lightboxMediaContainer.appendChild(errorText);
            };
            if (extension === 'mkv') {
                console.warn(`Файл .mkv (${fileName}): поддержка в HTML5 <video> может быть ограничена. Рекомендуется использовать .mp4 или .webm для лучшей совместимости.`);
            }
        } else {
            lightboxMediaContainer.textContent = 'Неподдерживаемый тип файла.';
            lightboxResolution.textContent = '';
            lightboxFilesize.textContent = '';
            lightbox.classList.add('show');
            document.body.classList.add('lightbox-open');
            return;
        }

        mediaElement.src = filePath;
        lightboxMediaContainer.appendChild(mediaElement);

        fetch(filePath)
            .then(response => {
                if (response.ok) {
                    const contentLength = response.headers.get('content-length');
                    if (contentLength) {
                        lightboxFilesize.textContent = `Размер: ${formatFileSize(parseInt(contentLength, 10))}`;
                    } else {
                        response.blob().then(blob => {
                             lightboxFilesize.textContent = `Размер: ${formatFileSize(blob.size)}`;
                        }).catch(() => {
                            lightboxFilesize.textContent = 'Размер: не удалось определить';
                        });
                    }
                } else {
                    lightboxFilesize.textContent = 'Размер: ошибка загрузки';
                }
            })
            .catch(() => {
                lightboxFilesize.textContent = 'Размер: ошибка сети';
            });


        lightbox.classList.add('show');
        document.body.classList.add('lightbox-open');
    }

    function closeLightbox() {
        lightbox.classList.remove('show');
        document.body.classList.remove('lightbox-open');
        const video = lightboxMediaContainer.querySelector('video');
        if (video) {
            video.pause();
            video.removeAttribute('src');
            video.load();
        }
        lightboxMediaContainer.innerHTML = '';
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && lightbox.classList.contains('show')) {
            closeLightbox();
        }
    });


    imageFiles.forEach((fileName, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.classList.add('gallery-item');
        galleryItem.style.animationDelay = `${index * 0.1}s`;

        const filePath = `${renderFolderPath}${fileName}`;
        const extension = getFileExtension(fileName);
        let thumbMediaElement;

        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
            thumbMediaElement = document.createElement('img');
            thumbMediaElement.alt = `Рендер: ${fileName}`;
        } else if (['mp4', 'webm', 'ogv', 'mkv'].includes(extension)) {
            thumbMediaElement = document.createElement('video');
            thumbMediaElement.muted = true;
            thumbMediaElement.preload = "metadata";
            thumbMediaElement.setAttribute('playsinline', ''); // Для лучшей работы на iOS
        } else {
            const placeholder = document.createElement('div');
            placeholder.textContent = `.${extension}`;
            placeholder.style.display = 'flex';
            placeholder.style.alignItems = 'center';
            placeholder.style.justifyContent = 'center';
            placeholder.style.height = '100%';
            placeholder.style.backgroundColor = 'var(--tertiary-accent)';
            thumbMediaElement = placeholder;
        }
        
        if (thumbMediaElement.tagName === 'IMG' || thumbMediaElement.tagName === 'VIDEO') {
            thumbMediaElement.src = filePath;
            thumbMediaElement.onerror = () => {
                const errorPlaceholder = document.createElement('div');
                errorPlaceholder.style.display = 'flex';
                errorPlaceholder.style.alignItems = 'center';
                errorPlaceholder.style.justifyContent = 'center';
                errorPlaceholder.style.height = '100%';
                errorPlaceholder.style.backgroundColor = 'var(--tertiary-accent)';
                errorPlaceholder.style.color = 'var(--light-accent)';
                errorPlaceholder.style.fontSize = '0.9rem';
                errorPlaceholder.textContent = `Ошибка: .${extension}`;
                
                if (thumbMediaElement.parentNode) {
                    thumbMediaElement.parentNode.replaceChild(errorPlaceholder, thumbMediaElement);
                }
            };
        }

        const fileNamePara = document.createElement('p');
        fileNamePara.classList.add('filename');
        fileNamePara.textContent = fileName;

        galleryItem.appendChild(thumbMediaElement);
        galleryItem.appendChild(fileNamePara);
        galleryContainer.appendChild(galleryItem);

        galleryItem.addEventListener('click', () => {
            openLightbox(filePath, fileName);
        });
    });
});