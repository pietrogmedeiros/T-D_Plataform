'use client';

import { useEffect } from 'react';

export default function ErrorSuppressor() {
  useEffect(() => {
    // Configurar supressão global de erros irrelevantes
    const originalConsoleError = window.console.error;
    const originalConsoleWarn = window.console.warn;

    // Lista de padrões de erro para suprimir
    const suppressPatterns = [
      /chrome-extension:\/\//,
      /moz-extension:\/\//,
      /safari-extension:\/\//,
      /ERR_FILE_NOT_FOUND/,
      /net::ERR_FILE_NOT_FOUND/,
      /Failed to load resource/,
      /The resource.*was preloaded using link preload/,
      /DevTools/,
      /Manifest V2/,
      /extension/i,
      /preload/,
      /completion_list\.html/,
      /utils\.js/,
      /extensionState\.js/
    ];

    window.console.error = function(...args) {
      const message = args.join(' ');
      
      // Verificar se a mensagem deve ser suprimida
      const shouldSuppress = suppressPatterns.some(pattern => 
        pattern.test(message)
      );
      
      if (!shouldSuppress) {
        originalConsoleError.apply(console, args);
      }
    };

    window.console.warn = function(...args) {
      const message = args.join(' ');
      
      // Verificar se a mensagem deve ser suprimida
      const shouldSuppress = suppressPatterns.some(pattern => 
        pattern.test(message)
      );
      
      if (!shouldSuppress) {
        originalConsoleWarn.apply(console, args);
      }
    };

    // Suprimir promise rejections de extensões
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason || '');
      
      if (
        reason.includes('chrome-extension') ||
        reason.includes('moz-extension') ||
        reason.includes('ERR_FILE_NOT_FOUND') ||
        reason.includes('Failed to fetch')
      ) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup na desmontagem
    return () => {
      window.console.error = originalConsoleError;
      window.console.warn = originalConsoleWarn;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
