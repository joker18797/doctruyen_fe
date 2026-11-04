'use client';

import React, { useState, useEffect, useRef } from 'react';

// Lightweight embedded SVG icons to avoid external package dependencies
function HeadphonesIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function PlayIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

function PauseIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function SkipBackIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="19 20 9 12 19 4 19 20" fill="currentColor" />
      <line x1="5" y1="19" x2="5" y2="5" />
    </svg>
  );
}

function SkipForwardIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  );
}

function SettingsIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function CloseIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function AudioNovelReader({
  content = '',
  title = '',
  onNextChapter,
  onClose,
  fontSize = 20,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  const [rate, setRate] = useState(1.0);
  const [engine, setEngine] = useState('google'); // 'google' | 'browser'
  const [browserVoices, setBrowserVoices] = useState([]);
  const [selectedBrowserVoice, setSelectedBrowserVoice] = useState('');
  const [autoNext, setAutoNext] = useState(true);
  const [paragraphs, setParagraphs] = useState([]);
  const [allSentences, setAllSentences] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  const audioRef = useRef(null);
  const nextAudioPreloadRef = useRef(null);
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;

  const currentIdxRef = useRef(currentSentenceIndex);
  currentIdxRef.current = currentSentenceIndex;

  // Tạo URL cho audio TTS (ưu tiên backend URL nếu có, fallback local route)
  const buildAudioUrl = (text) => {
    const backendBase = process.env.NEXT_PUBLIC_URL_API;
    const path = `/api/tts?text=${encodeURIComponent(text)}`;
    if (backendBase) {
      return `${backendBase}${path}`;
    }
    return path;
  };

  // 1. Phân tách nội dung truyện thành các đoạn và từng câu ngắn
  useEffect(() => {
    if (!content) return;

    let rawParagraphs = [];

    if (typeof window !== 'undefined') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;

      const pElements = tempDiv.querySelectorAll('p');
      if (pElements.length > 0) {
        pElements.forEach((p) => {
          const text = p.textContent?.trim();
          if (text) rawParagraphs.push(text);
        });
      } else {
        const lines = (tempDiv.innerText || tempDiv.textContent || '').split(/\n+/);
        lines.forEach((l) => {
          const text = l.trim();
          if (text) rawParagraphs.push(text);
        });
      }
    } else {
      rawParagraphs = content.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    }

    let globalSentenceId = 0;
    const structuredParagraphs = [];
    const flatSentences = [];

    rawParagraphs.forEach((paraText, pIdx) => {
      // Tách câu theo dấu câu
      const rawSentences = paraText
        .split(/(?<=[.!?…;:])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const paraSentences = [];

      rawSentences.forEach((sentenceText) => {
        // Nếu câu quá dài (> 160 ký tự), chia tiếp theo dấu phẩy để giọng đọc trôi chảy
        if (sentenceText.length > 160) {
          const subSentences = sentenceText.split(/(?<=[,])\s+/);
          subSentences.forEach((sub) => {
            if (sub.trim().length > 0) {
              const item = {
                id: globalSentenceId++,
                text: sub.trim(),
                paragraphIndex: pIdx,
              };
              paraSentences.push(item);
              flatSentences.push(item);
            }
          });
        } else {
          const item = {
            id: globalSentenceId++,
            text: sentenceText,
            paragraphIndex: pIdx,
          };
          paraSentences.push(item);
          flatSentences.push(item);
        }
      });

      if (paraSentences.length > 0) {
        structuredParagraphs.push(paraSentences);
      }
    });

    setParagraphs(structuredParagraphs);
    setAllSentences(flatSentences);
  }, [content]);

  // 2. Khởi tạo và quét giọng đọc tiếng Việt của trình duyệt (nếu có)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const avail = window.speechSynthesis.getVoices();
        const viVoices = avail.filter(
          (v) => v.lang.toLowerCase().includes('vi') || v.lang.toLowerCase().includes('vn')
        );
        if (viVoices.length > 0) {
          setBrowserVoices(viVoices);
          setSelectedBrowserVoice(viVoices[0].voiceURI);
        }
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      stopAllAudio();
    };
  }, []);

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // 3. Hàm phát câu theo chỉ số index
  const playSentence = (index) => {
    if (index < 0 || index >= allSentences.length) {
      setIsPlaying(false);
      setCurrentSentenceIndex(-1);
      stopAllAudio();
      if (autoNext && onNextChapter && index >= allSentences.length) {
        onNextChapter();
      }
      return;
    }

    stopAllAudio();
    setCurrentSentenceIndex(index);

    const sentenceItem = allSentences[index];

    // Cuộn màn hình tự động bám theo câu đang đọc
    setTimeout(() => {
      const element = document.getElementById(`audio-sentence-${sentenceItem.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 40);

    // CHẾ ĐỘ 1: Dùng Google TTS Tiếng Việt Chuẩn (Khuyên Dùng, 100% tự nhiên)
    if (engine === 'google') {
      const audioUrl = buildAudioUrl(sentenceItem.text);
      const audio = new Audio(audioUrl);
      audio.playbackRate = rate;
      audioRef.current = audio;

      audio.onended = () => {
        if (isPlayingRef.current) {
          playSentence(index + 1);
        }
      };

      audio.onerror = () => {
        // Nếu dùng backend URL bị lỗi mạng thì thử fallback relative path /api/tts
        const fallbackUrl = `/api/tts?text=${encodeURIComponent(sentenceItem.text)}`;
        if (audioUrl !== fallbackUrl) {
          const fallbackAudio = new Audio(fallbackUrl);
          fallbackAudio.playbackRate = rate;
          fallbackAudio.onended = () => {
            if (isPlayingRef.current) playSentence(index + 1);
          };
          fallbackAudio.onerror = () => {
            if (isPlayingRef.current) setTimeout(() => playSentence(index + 1), 300);
          };
          fallbackAudio.play().catch(() => {});
          audioRef.current = fallbackAudio;
          return;
        }

        // Tự động nhảy câu kế tiếp sau 300ms nếu vẫn lỗi
        if (isPlayingRef.current) {
          setTimeout(() => playSentence(index + 1), 300);
        }
      };

      audio.play().catch(() => {
        setIsPlaying(false);
      });

      // Preload trước câu kế tiếp để chuyển câu không bị ngắt quãng
      if (index + 1 < allSentences.length) {
        const nextUrl = buildAudioUrl(allSentences[index + 1].text);
        const preloadAudio = new Audio();
        preloadAudio.src = nextUrl;
        nextAudioPreloadRef.current = preloadAudio;
      }
    } else {
      // CHẾ ĐỘ 2: Dùng SpeechSynthesis của Trình Duyệt
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(sentenceItem.text);
        utterance.lang = 'vi-VN';
        utterance.rate = rate;

        if (selectedBrowserVoice) {
          const v = browserVoices.find((x) => x.voiceURI === selectedBrowserVoice);
          if (v) utterance.voice = v;
        }

        utterance.onend = () => {
          if (isPlayingRef.current) {
            playSentence(index + 1);
          }
        };

        utterance.onerror = () => {
          if (isPlayingRef.current) {
            playSentence(index + 1);
          }
        };

        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopAllAudio();
    } else {
      setIsPlaying(true);
      const nextIdx = currentSentenceIndex >= 0 ? currentSentenceIndex : 0;
      playSentence(nextIdx);
    }
  };

  // Click vào câu bất kỳ trong văn bản để đọc từ câu đó
  const handleSentenceClick = (idx) => {
    setIsPlaying(true);
    playSentence(idx);
  };

  // Tua lùi 1 câu
  const handlePrev = () => {
    const prevIdx = Math.max(0, currentSentenceIndex - 1);
    setIsPlaying(true);
    playSentence(prevIdx);
  };

  // Tua tới 1 câu
  const handleNext = () => {
    const nextIdx = Math.min(allSentences.length - 1, currentSentenceIndex + 1);
    setIsPlaying(true);
    playSentence(nextIdx);
  };

  // Đổi tốc độ đọc
  const handleRateChange = (newRate) => {
    setRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
    if (isPlaying && currentSentenceIndex >= 0 && engine === 'browser') {
      playSentence(currentSentenceIndex);
    }
  };

  return (
    <div className="relative">
      {/* THANH ĐIỀU KHIỂN AUDIO PLAYER NỔI (STICKY FLOATING AUDIO BAR) */}
      <div
        className="sticky top-20 z-40 mb-6 rounded-2xl p-3 md:p-4 shadow-xl border backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 border-gray-200/80 dark:border-gray-700/80 text-gray-800 dark:text-gray-100 transition-all duration-300"
        style={{
          boxShadow: isPlaying
            ? '0 10px 30px -5px rgba(59, 130, 246, 0.25), 0 0 20px rgba(16, 185, 129, 0.15)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Cụm Trạng thái phát & Nguồn giọng đọc */}
          <div className="flex items-center gap-3 min-w-[210px]">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-md transition-all duration-300 ${
                isPlaying
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/40 animate-pulse'
                  : 'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-500/30'
              }`}
            >
              <HeadphonesIcon className="w-5 h-5 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {isPlaying ? 'Đang Đọc Truyện' : 'Tạm Dừng'}
                </span>
                <span
                  className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full font-bold border ${
                    engine === 'google'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                      : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700'
                  }`}
                >
                  {engine === 'google' ? 'GOOGLE TIẾNG VIỆT CHUẨN' : 'GIỌNG TRÌNH DUYỆT'}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Câu {currentSentenceIndex >= 0 ? currentSentenceIndex + 1 : 0} / {allSentences.length}
                {isPlaying && ' • Click câu bất kỳ để nhảy'}
              </div>
            </div>
          </div>

          {/* Cụm Nút Play / Pause / Tua Câu */}
          <div className="flex items-center gap-2 sm:gap-3 mx-auto sm:mx-0">
            <button
              onClick={handlePrev}
              type="button"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors shadow-sm"
              title="Câu trước"
            >
              <SkipBackIcon className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              type="button"
              className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/40 transform hover:scale-105 active:scale-95 transition-all duration-200"
              title={isPlaying ? 'Tạm dừng đọc' : 'Bắt đầu nghe đọc'}
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5 text-white" />
              ) : (
                <PlayIcon className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={handleNext}
              type="button"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors shadow-sm"
              title="Câu tiếp theo"
            >
              <SkipForwardIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Tốc độ đọc & Cài đặt nguồn giọng & Nút tắt */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bộ chọn tốc độ */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/60 p-1 rounded-full">
              {[0.8, 1.0, 1.25, 1.5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRateChange(r)}
                  className={`px-2 py-0.5 text-xs font-bold rounded-full transition-colors ${
                    rate === r
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {r}x
                </button>
              ))}
            </div>

            {/* Menu Nguồn Giọng */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors shadow-sm"
                title="Chọn nguồn giọng đọc"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>Nguồn Giọng</span>
              </button>

              {showSettings && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3 z-50 animate-fade-in-up">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    CHỌN NGUỒN GIỌNG ĐỌC
                  </div>

                  {/* Nguồn 1: Google TTS */}
                  <label
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors mb-1.5 border ${
                      engine === 'google'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tts_engine"
                      checked={engine === 'google'}
                      onChange={() => {
                        setEngine('google');
                        setShowSettings(false);
                        if (isPlaying && currentSentenceIndex >= 0) {
                          playSentence(currentSentenceIndex);
                        }
                      }}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Google Tiếng Việt Chuẩn (Khuyên dùng)
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        100% tiếng Việt tự nhiên, chuẩn âm chuẩn nhịp, không bị méo tiếng.
                      </div>
                    </div>
                  </label>

                  {/* Nguồn 2: Giọng Trình Duyệt */}
                  {browserVoices.length > 0 && (
                    <label
                      className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors border ${
                        engine === 'browser'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700'
                          : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tts_engine"
                        checked={engine === 'browser'}
                        onChange={() => {
                          setEngine('browser');
                          setShowSettings(false);
                          if (isPlaying && currentSentenceIndex >= 0) {
                            playSentence(currentSentenceIndex);
                          }
                        }}
                        className="mt-0.5 text-indigo-600"
                      />
                      <div>
                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          Giọng Trình Duyệt ({browserVoices[0]?.name?.split('-')[0] || 'Default'})
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          Giọng tích hợp sẵn trên thiết bị (Edge Natural, Chrome TTS...).
                        </div>
                      </div>
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* Nút đóng / tắt chế độ audio nếu có callback onClose */}
            {onClose && (
              <button
                type="button"
                onClick={() => {
                  stopAllAudio();
                  setIsPlaying(false);
                  onClose();
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-rose-100 dark:bg-gray-700 dark:hover:bg-rose-950/50 text-gray-500 hover:text-rose-600 dark:text-gray-300 dark:hover:text-rose-400 transition-colors"
                title="Tắt chế độ đọc tự động"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VĂN BẢN TRUYỆN VỚI HIỆU ỨNG NHẢY DÒNG TỰ ĐỘNG & HIGHLIGHT SÁNG KARAOKE */}
      <div
        className="reader-content select-text leading-loose transition-all duration-200"
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="text-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h2>
          <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-full px-3 py-1 inline-block">
            💡 Mẹo: Nhấp chuột vào bất kỳ câu nào để giọng đọc nhảy tới câu đó ngay lập tức
          </div>
        </div>

        <div className="audio-karaoke-content space-y-4">
          {paragraphs.map((paraSentences, pIdx) => (
            <p key={pIdx} className="indent-6 leading-relaxed text-gray-800 dark:text-gray-200">
              {paraSentences.map((s) => {
                const isCurrent = currentSentenceIndex === s.id;
                return (
                  <span
                    key={s.id}
                    id={`audio-sentence-${s.id}`}
                    onClick={() => handleSentenceClick(s.id)}
                    className={`karaoke-sentence ${isCurrent ? 'karaoke-active' : ''}`}
                    title="Click để nghe từ câu này"
                  >
                    {s.text}{' '}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

