
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;

    // Security check: only allow alphanumeric and .json (en.json, tr.json)
    if (!/^[a-z]+\.json$/.test(filename)) {
        return new NextResponse("Invalid filename", { status: 400 });
    }

    // Hardcoded absolute path to avoid cwd issues and ensure reliability
    const translationsDir = "/srv/tengra/translations/velora";

    const filePath = path.join(translationsDir, filename);

    try {
        if (!fs.existsSync(filePath)) {
            return new NextResponse("Translation file not found", { status: 404 });
        }
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return new NextResponse(fileContents, {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error("Translation load error:", e);
        return new NextResponse("Server Error", { status: 500 });
    }
}
