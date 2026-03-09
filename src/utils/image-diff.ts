import sharp from 'sharp';

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export async function getChangedBoundingBox(
    buffer1: Buffer,
    buffer2: Buffer,
    threshold: number = 30
): Promise<BoundingBox | null> {
    const { data: data1, info: info1 } = await sharp(buffer1)
        .raw()
        .ensureAlpha()
        .toBuffer({ resolveWithObject: true });

    const { data: data2, info: info2 } = await sharp(buffer2)
        .raw()
        .ensureAlpha()
        .toBuffer({ resolveWithObject: true });

    if (info1.width !== info2.width || info1.height !== info2.height) {
        throw new Error('Images must have the same dimensions for diffing');
    }

    let minX = info1.width;
    let minY = info1.height;
    let maxX = -1;
    let maxY = -1;

    let changedPixels = 0;

    for (let i = 0; i < data1.length; i += 4) {
        const rDiff = Math.abs(data1[i] - data2[i]);
        const gDiff = Math.abs(data1[i + 1] - data2[i + 1]);
        const bDiff = Math.abs(data1[i + 2] - data2[i + 2]);

        const diff = rDiff + gDiff + bDiff;

        if (diff > threshold) {
            const pixelIndex = i / 4;
            const x = pixelIndex % info1.width;
            const y = Math.floor(pixelIndex / info1.width);

            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;

            changedPixels++;
        }
    }

    if (changedPixels === 0) {
        return null;
    }

    // Add padding (10 pixels)
    const padding = 10;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(info1.width - 1, maxX + padding);
    maxY = Math.min(info1.height - 1, maxY + padding);

    return {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
    };
}
