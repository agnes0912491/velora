import { NextResponse } from 'next/server';
import { loadTranslations } from '@tengra/language/server';
import config from '@/tl.config';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ locale: string }> }
) {
    const { locale } = await params;

    try {
        const messages = loadTranslations(config, locale);
        return NextResponse.json(messages);
    } catch (error) {
        console.error(`[API] Failed to load translations for ${locale}:`, error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
