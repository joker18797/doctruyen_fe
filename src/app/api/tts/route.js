import { NextResponse } from 'next/server';

// LRU Cache đơn giản cho TTS trong bộ nhớ (tối đa 500 câu)
const ttsCache = new Map();
const MAX_TTS_CACHE_ITEMS = 500;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text');

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const cleanText = text.trim().slice(0, 200);
    const cacheKey = cleanText.toLowerCase();

    // 1. Kiểm tra cache
    if (ttsCache.has(cacheKey)) {
      const cachedBuffer = ttsCache.get(cacheKey);
      return new NextResponse(cachedBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=604800, immutable',
          'X-Cache': 'HIT',
        },
      });
    }

    // 2. Fetch từ Google Translate TTS
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      cleanText
    )}&tl=vi&client=tw-ob`;

    const response = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch audio from TTS provider' },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    // 3. Lưu vào cache
    if (ttsCache.size >= MAX_TTS_CACHE_ITEMS) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, arrayBuffer);

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=604800, immutable',
        'X-Cache': 'MISS',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || 'TTS Error' },
      { status: 500 }
    );
  }
}

