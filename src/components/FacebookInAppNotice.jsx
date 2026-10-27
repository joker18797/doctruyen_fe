'use client';

import { useState, useEffect } from 'react';

export default function FacebookInAppNotice() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = window.location.href;
    setCurrentUrl(url);

    // Kiểm tra xem người dùng đã chọn tiếp tục đọc trên FB (trong vòng 24h hoặc trong phiên này) chưa
    const dismissedUntil = localStorage.getItem('dismiss_fb_modal_until');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }
    const isDismissedSession = sessionStorage.getItem('dismiss_fb_modal') === 'true';
    if (isDismissedSession) return;

    const ua = (window.navigator?.userAgent || '').toLowerCase();
    const android = /android/i.test(ua);
    const ios = /iphone|ipad|ipod/i.test(ua);
    setIsAndroid(android);
    setIsIOS(ios);

    // Cho phép kiểm tra nhanh qua param ?fb_test=1 hoặc hash #fb_test
    const params = new URLSearchParams(window.location.search);
    const isTest = params.get('fb_test') === '1' || window.location.hash.includes('fb_test');

    // Nhận diện Facebook in-app browser & Messenger / Instagram
    const isFb =
      ua.includes('fban') ||
      ua.includes('fbav') ||
      ua.includes('fb_iab') ||
      ua.includes('fb4a') ||
      ua.includes('fbios') ||
      ua.includes('messenger') ||
      ua.includes('instagram');

    if (isFb || isTest) {
      setIsOpen(true);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleOpenBrowser = () => {
    if (!currentUrl) return;
    const cleanUrl = currentUrl.replace(/^https?:\/\//i, '');

    if (isAndroid) {
      // 1. Thử mở Chrome package trực tiếp qua Android intent
      window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;

      // 2. Fallback sau 1s nếu Chrome không phản hồi: thử intent VIEW mặc định của Android
      setTimeout(() => {
        window.location.href = `intent://${cleanUrl}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
      }, 1000);
    } else if (isIOS) {
      // Trên iOS, thử mở Chrome nếu máy có cài đặt
      window.location.href = `googlechromes://${cleanUrl}`;

      // Nếu không mở được, hướng dẫn user bấm 3 chấm để mở Safari
      setTimeout(() => {
        alert("Vui lòng bấm nút ••• ở góc trên bên phải và chọn 'Mở trong trình duyệt ngoài' (hoặc Safari)");
      }, 1200);
    } else {
      window.open(currentUrl, '_blank');
    }
  };

  const handleCopy = async () => {
    if (!currentUrl) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = currentUrl;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Không thể sao chép liên kết:', err);
    }
  };

  const handleDismiss = () => {
    // Ghi nhớ trong 24 giờ để người dùng đọc truyện thoải mái mà không bị popup lại
    try {
      localStorage.setItem('dismiss_fb_modal_until', (Date.now() + 24 * 60 * 60 * 1000).toString());
      sessionStorage.setItem('dismiss_fb_modal', 'true');
    } catch {
      // Bỏ qua nếu chế độ ẩn danh chặn storage
    }
    document.body.style.overflow = '';
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleDismiss}
      className="fixed inset-0 z-[999999] bg-[#0d1527]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 overflow-y-auto cursor-pointer"
    >
      {/* Mũi tên chỉ vào nút 3 chấm góc trên bên phải của Facebook App */}
      <div className="fixed top-2 right-3 sm:top-4 sm:right-6 flex flex-col items-end pointer-events-none z-50">
        <div className="flex items-center gap-1.5 mb-1 bg-red-600/90 text-white text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg shadow-red-500/40 animate-pulse">
          <span>Bấm vào đây</span>
          <span>↗</span>
        </div>
        <svg
          className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 -rotate-12 animate-bounce drop-shadow-[0_4px_8px_rgba(239,68,68,0.5)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
          />
        </svg>
      </div>

      {/* Thẻ Modal chính */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[390px] bg-white rounded-3xl p-6 sm:p-7 shadow-2xl text-center border border-slate-100 my-auto cursor-default animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Nút đóng ở góc card */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 active:bg-slate-200 transition"
          title="Đóng và tiếp tục đọc trên Facebook"
          aria-label="Đóng"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tiêu đề */}
        <h2 className="text-[22px] sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight mt-1 mb-2.5">
          Bạn đang đọc trong Facebook
        </h2>

        {/* Mô tả */}
        <p className="text-slate-600 text-sm leading-relaxed mb-5">
          Trình duyệt trong Facebook không hỗ trợ đọc truyện.
          <br />
          Vui lòng mở bằng Safari/Chrome/Web Browser để tiếp tục đọc.
        </p>

        {/* Nút Mở bằng Chrome / Trình duyệt ngoài */}
        <button
          type="button"
          onClick={handleOpenBrowser}
          className="w-full py-3.5 px-4 bg-[#3897f0] hover:bg-[#2884df] active:scale-[0.99] text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-150 flex items-center justify-center gap-2"
        >
          <span>{isIOS ? 'Mở bằng Safari / Chrome' : 'Mở bằng Chrome'}</span>
        </button>

        {/* Khung hướng dẫn mở bằng trình duyệt */}
        <div className="mt-4 p-4 rounded-2xl border-2 border-[#38bdf8] bg-[#f0f9ff] text-left">
          <div className="font-bold text-[#0284c7] text-[15px] mb-2">
            Cách mở bằng trình duyệt:
          </div>
          <ol className="text-[#0369a1] text-[13.5px] leading-relaxed space-y-1.5">
            <li className="flex items-start gap-1.5">
              <span className="font-bold">1.</span>
              <span>
                Bấm nút <span className="font-extrabold text-[#0284c7]">•••</span> ở góc trên bên phải
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold">2.</span>
              <span>
                Chọn <span className="font-semibold text-[#0284c7]">“Mở trong trình duyệt ngoài”</span> hoặc{' '}
                <span className="font-semibold text-[#0284c7]">“Mở bằng Safari/Chrome/Web Browser”</span>
              </span>
            </li>
          </ol>
        </div>

        {/* Phân cách: hoặc */}
        <div className="my-3 text-center text-slate-400 text-sm font-medium">
          hoặc
        </div>

        {/* Sao chép liên kết */}
        <div className="text-left">
          <label className="block text-slate-700 font-semibold text-sm mb-1.5">
            Sao chép liên kết:
          </label>
          <input
            type="text"
            readOnly
            value={currentUrl}
            onClick={(e) => e.target.select()}
            className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-600 select-all focus:outline-none focus:border-sky-400 font-mono truncate"
          />
        </div>

        {/* Nút sao chép */}
        <button
          type="button"
          onClick={handleCopy}
          className={`w-full mt-2.5 py-2.5 px-4 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 ${
            copied
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'bg-[#f1f5f9] hover:bg-[#e2e8f0] active:bg-[#cbd5e1] text-slate-700'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span>Đã sao chép liên kết!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                />
              </svg>
              <span>Sao chép</span>
            </>
          )}
        </button>

        {/* Nút tiếp tục đọc trên FB nếu người dùng không muốn mở ngoài */}
        <div className="mt-3.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-2.5 px-3 rounded-xl text-[13px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition flex items-center justify-center gap-1.5"
          >
            <span>Tiếp tục đọc trên Facebook</span>
            <span className="text-xs text-slate-400">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
