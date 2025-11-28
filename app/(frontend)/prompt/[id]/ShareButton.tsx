'use client';

import { useState, useEffect, useRef } from 'react';
import { incrementShareCount } from '@/app/actions/prompts';
import { useToast } from '@/components/ui/Toast';
import QRCode from 'qrcode';

/**
 * 分享按钮组件
 */

interface ShareButtonProps {
  promptId: string;
  title: string;
}

export default function ShareButton({ promptId, title }: ShareButtonProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // 检测是否为移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  // 点击外部关闭面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowPanel(false);
        setShowQRCode(false);
      }
    };

    if (showPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPanel]);

  // 增加分享量统计
  const trackShare = () => {
    incrementShareCount(promptId).then(result => {
      if (!result.success) {
        console.error('Failed to increment share count:', result.error);
      } else {
        console.log('Share count incremented successfully');
      }
    }).catch(err => console.error('Failed to increment share count:', err));
  };

  // 移动端：使用原生分享
  const handleMobileShare = async () => {
    try {
      const url = window.location.href;
      
      if (navigator.share) {
        await navigator.share({
          title: title,
          url: url,
        });
        showToast('success', '分享成功！');
        trackShare();
      } else {
        // 降级：复制链接
        await navigator.clipboard.writeText(url);
        showToast('success', '链接已复制到剪贴板！');
        trackShare();
      }
    } catch (error) {
      // 用户取消分享不显示错误
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to share:', error);
        showToast('error', '分享失败，请重试');
      }
    }
  };

  // PC端：显示/隐藏分享面板
  const handlePCShare = () => {
    setShowPanel(!showPanel);
    setShowQRCode(false);
  };

  // 复制链接
  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      showToast('success', '链接已复制到剪贴板！');
      trackShare();
      setShowPanel(false);
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast('error', '复制失败，请重试');
    }
  };

  // 生成二维码
  const handleGenerateQRCode = async () => {
    try {
      const url = window.location.href;
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(qrDataUrl);
      setShowQRCode(true);
      trackShare();
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      showToast('error', '生成二维码失败');
    }
  };

  const handleShare = isMobile ? handleMobileShare : handlePCShare;

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={handleShare}
        className="px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5 bg-gray-200 text-gray-700 hover:bg-gray-300"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        分享
      </button>

      {/* PC端分享面板 */}
      {!isMobile && showPanel && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[200px]">
          {!showQRCode ? (
            <div className="py-2">
              <button
                onClick={handleCopyLink}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                复制链接
              </button>
              <button
                onClick={handleGenerateQRCode}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                生成二维码
              </button>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900">扫码分享</span>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <img src={qrCodeUrl} alt="QR Code" className="w-full" />
              <p className="text-xs text-gray-500 text-center mt-2">使用微信扫码分享</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

