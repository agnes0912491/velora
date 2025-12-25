import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import ffmpeg from "fluent-ffmpeg";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Velora Algorithm presets
const VELORA_PRESETS = {
    video: { codec: "libx264", crf: "28", preset: "fast", audioCodec: "aac", audioBitrate: "128k" },
    audio: { codec: "aac", bitrate: "128k" },
    image: { quality: 80 }
};

const RESOLUTION_MAP: Record<string, string> = {
    "4k": "3840:2160", "1080p": "1920:1080", "720p": "1280:720", "480p": "854:480", "360p": "640:360"
};

// Formats that need special tools
const HEIF_FORMATS = ['heic', 'heif'];
const RAW_FORMATS = ['cr2', 'nef', 'arw', 'dng', 'orf', 'rw2'];
const IMAGEMAGICK_FORMATS = ['psd', 'eps', 'pdf', 'ai', 'svg'];

async function convertWithImageMagick(inputPath: string, outputPath: string, quality?: number): Promise<void> {
    const q = quality || 85;
    await execAsync(`convert "${inputPath}" -quality ${q} "${outputPath}"`);
}

async function convertWithHeif(inputPath: string, outputPath: string): Promise<void> {
    // heif-convert outputs to jpg/png
    const tempOut = outputPath.replace(/\.[^.]+$/, '.jpg');
    await execAsync(`heif-convert "${inputPath}" "${tempOut}"`);
    // If different format needed, use ImageMagick
    if (tempOut !== outputPath) {
        await execAsync(`convert "${tempOut}" "${outputPath}"`);
        await unlink(tempOut).catch(() => { });
    }
}

async function convertWithDcraw(inputPath: string, outputPath: string): Promise<void> {
    // dcraw outputs PPM, then convert to target
    const ppmPath = inputPath + '.ppm';
    await execAsync(`dcraw -c "${inputPath}" > "${ppmPath}"`);
    await execAsync(`convert "${ppmPath}" "${outputPath}"`);
    await unlink(ppmPath).catch(() => { });
}

export async function POST(request: NextRequest) {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const to = data.get("to") as string;
    const algorithm = data.get("algorithm") as string || "standard";
    const quality = data.get("quality") as string;
    const bitrate = data.get("bitrate") as string;
    const resolution = data.get("resolution") as string;

    if (!file || !to) {
        return NextResponse.json({ error: "Missing file or target format" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempDir = join(tmpdir(), "velora_uploads");
    await mkdir(tempDir, { recursive: true });

    const inputExt = (file.name.split('.').pop() || "dat").toLowerCase();
    const uniqueId = randomUUID();
    const inputPath = join(tempDir, `${uniqueId}.${inputExt}`);
    const outputPath = join(tempDir, `${uniqueId}_output.${to}`);

    const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'gif', 'flv', 'wmv', 'm4v', 'mpeg', 'mpg', '3gp', 'ts'].includes(to);
    const isAudio = ['mp3', 'wav', 'aac', 'flac', 'm4a', 'wma', 'opus'].includes(to);
    const isImage = !isVideo && !isAudio;

    // Determine which tool to use based on input format
    const needsHeif = HEIF_FORMATS.includes(inputExt);
    const needsRaw = RAW_FORMATS.includes(inputExt);
    const needsImageMagick = IMAGEMAGICK_FORMATS.includes(inputExt) || IMAGEMAGICK_FORMATS.includes(to);

    try {
        await writeFile(inputPath, buffer);

        // Use appropriate conversion tool
        if (needsHeif) {
            await convertWithHeif(inputPath, outputPath);
        } else if (needsRaw) {
            await convertWithDcraw(inputPath, outputPath);
        } else if (needsImageMagick && isImage) {
            const q = quality ? parseInt(quality) : (algorithm === 'velora' ? VELORA_PRESETS.image.quality : 85);
            await convertWithImageMagick(inputPath, outputPath, q);
        } else {
            // Use FFmpeg (default)
            await new Promise((resolve, reject) => {
                let cmd = ffmpeg(inputPath);

                if (algorithm === "velora") {
                    if (isVideo) {
                        cmd = cmd.videoCodec(VELORA_PRESETS.video.codec)
                            .outputOptions([`-crf ${VELORA_PRESETS.video.crf}`, `-preset ${VELORA_PRESETS.video.preset}`])
                            .audioCodec(VELORA_PRESETS.video.audioCodec)
                            .audioBitrate(VELORA_PRESETS.video.audioBitrate);
                    } else if (isAudio) {
                        cmd = cmd.audioCodec(VELORA_PRESETS.audio.codec).audioBitrate(VELORA_PRESETS.audio.bitrate);
                    } else if (isImage) {
                        cmd = cmd.outputOptions([`-q:v ${Math.round((100 - VELORA_PRESETS.image.quality) / 3)}`]);
                    }
                } else {
                    if (quality && isImage) {
                        cmd = cmd.outputOptions([`-q:v ${Math.round((100 - parseInt(quality)) / 3)}`]);
                    }
                    if (bitrate && bitrate !== "auto") {
                        if (isVideo) cmd = cmd.videoBitrate(bitrate);
                        else if (isAudio) cmd = cmd.audioBitrate(bitrate);
                    }
                    if (resolution && resolution !== "original" && isVideo) {
                        const scale = RESOLUTION_MAP[resolution];
                        if (scale) cmd = cmd.outputOptions([`-vf scale=${scale}:force_original_aspect_ratio=decrease`]);
                    }
                }

                cmd.output(outputPath).on("end", () => resolve(true)).on("error", (err) => reject(err)).run();
            });
        }

        const outputBuffer = await readFile(outputPath);
        const originalSize = buffer.length;
        const convertedSize = outputBuffer.length;
        const savings = originalSize > 0 ? Math.round((1 - convertedSize / originalSize) * 100) : 0;

        let mimeType = "application/octet-stream";
        if (isVideo) mimeType = `video/${to}`;
        else if (isAudio) mimeType = `audio/${to}`;
        else mimeType = `image/${to}`;

        const safeFilename = `converted_${Date.now()}.${to}`;
        const response = new NextResponse(outputBuffer);
        response.headers.set("Content-Type", mimeType);
        response.headers.set("Content-Disposition", `attachment; filename="${safeFilename}"`);
        response.headers.set("Content-Length", convertedSize.toString());
        response.headers.set("X-Original-Size", originalSize.toString());
        response.headers.set("X-Converted-Size", convertedSize.toString());
        response.headers.set("X-Savings-Percent", savings.toString());
        response.headers.set("X-Algorithm", algorithm);
        response.headers.set("Access-Control-Expose-Headers", "X-Original-Size, X-Converted-Size, X-Savings-Percent, X-Algorithm, Content-Disposition");

        return response;

    } catch (error: any) {
        console.error("Conversion error:", error);
        return NextResponse.json({ error: error.message || "Conversion failed" }, { status: 500 });
    } finally {
        await unlink(inputPath).catch(() => { });
        await unlink(outputPath).catch(() => { });
    }
}
