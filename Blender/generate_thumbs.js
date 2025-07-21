const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');

const renderDir = path.join(__dirname, 'render');
const thumbsDir = path.join(renderDir, 'thumbs');

const THUMB_WIDTH = 400;

const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
const videoExtensions = ['.mkv', '.mp4', '.webm', '.ogv'];

if (!fs.existsSync(thumbsDir)) {
    fs.mkdirSync(thumbsDir, { recursive: true });
    console.log(`Папка ${thumbsDir} создана.`);
}

fs.readdir(renderDir, (err, files) => {
    if (err) {
        return console.error('Не удалось прочитать папку render:', err);
    }

    console.log(`Найдено ${files.length} файлов. Начинаю обработку...`);

    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const inputPath = path.join(renderDir, file);

        if (imageExtensions.includes(ext)) {
            const outputPath = path.join(thumbsDir, file);
            sharp(inputPath)
                .resize(THUMB_WIDTH)
                .toFile(outputPath)
                .then(() => console.log(`Создано превью для изображения: ${file}`))
                .catch(err => console.error(`Ошибка при обработке ${file}:`, err));
        }

        if (videoExtensions.includes(ext)) {
            const outputFileName = `${file}.jpg`;
            const outputPath = path.join(thumbsDir, outputFileName);

            ffmpeg(inputPath)
                .on('end', () => console.log(`Создано превью для видео: ${outputFileName}`))
                .on('error', (err) => console.error(`Ошибка при обработке видео ${file}:`, err.message))
                .screenshots({
                    count: 1,
                    timemarks: ['5%'],
                    filename: outputFileName,
                    folder: thumbsDir,
                    size: `${THUMB_WIDTH}x?`
                });
        }
    });
});