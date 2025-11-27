'use client';

/**
 * 全局错误边界（根级别）
 * 捕获整个应用的错误，包括 layout 中的错误
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">系统错误</h1>
              <p className="text-gray-600 mb-6">
                抱歉，系统遇到了一个严重错误。请刷新页面重试。
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 mb-4">错误代码: {error.digest}</p>
              )}
            </div>

            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
