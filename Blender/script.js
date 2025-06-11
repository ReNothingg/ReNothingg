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


    if (imageFiles.length === 0) {
        const message = document.createElement('p');
        message.textContent = 'В папке "render" пока нет изображений, или список imageFiles в script.js пуст.';
        message.style.textAlign = 'center';
        message.style.fontSize = '1.2rem';
        galleryContainer.appendChild(message);
        return;
    }

    imageFiles.forEach((fileName, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.classList.add('gallery-item');
        galleryItem.style.animationDelay = `${index * 0.1}s`;

        const img = document.createElement('img');
        img.src = `${renderFolderPath}${fileName}`;
        img.alt = `Рендер: ${fileName}`;
        
        img.onerror = () => {
            img.alt = `Не удалось загрузить: ${fileName}`;
            img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%25%22%20height%3D%22100%25%22%20viewBox%3D%220%200%20160%2090%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23222%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Inter%2Csans-serif%22%20font-size%3D%2210%22%20fill%3D%22%23bbb%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EОшибка%20загрузки%3C%2Ftext%3E%3C%2Fsvg%3E';
        };

        const fileNamePara = document.createElement('p');
        fileNamePara.classList.add('filename');
        fileNamePara.textContent = fileName;

        galleryItem.appendChild(img);
        galleryItem.appendChild(fileNamePara);
        galleryContainer.appendChild(galleryItem);
    });
});