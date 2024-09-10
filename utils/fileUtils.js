const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');
const path = require('path');
const os = require('os');
const fs = require('fs');
const sizeOf = require('image-size');

ffmpeg.setFfprobePath(ffprobeStatic.path);

async function extractResolution(file) {
    const ext = path.extname(file.originalname).toLowerCase();

    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff'].includes(ext)) {
        const dimensions = sizeOf(file.buffer);
        return `${dimensions.width}x${dimensions.height}`;
    } else if (['.mp4', '.avi', '.mov', '.wmv', '.mkv', '.webm', '.flv', '.mpeg', '.3gp'].includes(ext)) {
        return new Promise((resolve, reject) => {
            const tempDir = os.tmpdir();
            const tempPath = path.join(tempDir, file.originalname);

            fs.writeFileSync(tempPath, file.buffer);

            // Usando ffprobe para obter a resolução do vídeo
            ffmpeg.ffprobe(tempPath, (err, metadata) => {
                if (err) return reject(err);
                const videoStream = metadata.streams.find(stream => stream.width && stream.height);
                if (videoStream) {
                    resolve(`${videoStream.width}x${videoStream.height}`);
                } else {
                    resolve(null);
                }
                fs.unlinkSync(tempPath);
            });
        });
    }
    return null;
}

module.exports = { extractResolution };
