'use client'

import { useState } from 'react'

const BANK = {
  bin: '970415', // VietinBank
  bankName: 'VietinBank',
  accountNo: '101870612288',
  accountName: 'LUU THI KHANH HOA',
  memo: 'Ung ho matcha latte',
}

const qrUrl = `https://img.vietqr.io/image/${BANK.bin}-${BANK.accountNo}-compact.png?addInfo=${encodeURIComponent(
  BANK.memo
)}&accountName=${encodeURIComponent(BANK.accountName)}`

export default function DonateBox() {
  const [copied, setCopied] = useState(false)

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(BANK.accountNo)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setCopied(false)
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-green-100 dark:border-green-900 bg-gradient-to-br from-green-50 to-pink-50 dark:from-gray-900 dark:to-gray-900 p-5 text-center">
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
        🍵 Lời cảm ơn từ tụi mình
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl mx-auto">
        Cảm ơn các cậu đã đồng hành cùng truyện đến tận chương cuối! Nếu các cậu yêu thích truyện
        của tụi mình, có thể mời tụi mình một ly matcha latte để có thêm động lực ra truyện mới nha ❤️
      </p>

      <img
        src={qrUrl}
        alt={`QR ủng hộ ${BANK.bankName} - ${BANK.accountName}`}
        loading="lazy"
        className="w-[260px] md:w-[300px] max-w-full h-auto mx-auto my-4 rounded-lg bg-white p-2"
      />

      <div className="text-sm text-gray-700 dark:text-gray-200 space-y-1">
        <p className="font-semibold">{BANK.accountName}</p>
        <p>
          {BANK.bankName} · STK: <span className="font-mono">{BANK.accountNo}</span>
          <button
            type="button"
            onClick={copyAccount}
            className="ml-2 text-xs px-2 py-0.5 rounded bg-green-600 text-white hover:bg-green-700"
          >
            {copied ? 'Đã chép' : 'Sao chép'}
          </button>
        </p>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        Ủng hộ hoàn toàn tự nguyện — truyện vẫn miễn phí cho tất cả mọi người.
      </p>
    </div>
  )
}
