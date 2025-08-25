'use client';

import { useEffect } from 'react';

export default function GlobalErrorFilter() {
  useEffect(() => {
    console.log('🛡️ GlobalErrorFilter inicializando...');
    
    // Função para detectar erros de extensão mais robusta
    const isExtensionRelated = (input: unknown): boolean => {
      const str = String(input || '');
      return (
        str.includes('chrome-extension://') ||
        str.includes('moz-extension://') ||
        str.includes('safari-extension://') ||
        str.includes('ERR_FILE_NOT_FOUND') ||
        str.includes('net::ERR_FILE_NOT_FOUND') ||
        str.includes('Failed to load resource') ||
        str.includes('The resource') ||
        str.includes('was preloaded using link preload') ||
        str.includes('but not used within a few seconds') ||
        str.includes('Please make sure it has an appropriate') ||
        str.includes('preloaded intentionally') ||
        str.includes('completion_list.html') ||
        str.includes('utils.js') ||
        str.includes('extensionState.js') ||
        str.includes('/extension/') ||
        str.includes('/extensions/') ||
        /chrome-extension:\/\/[a-z]+/i.test(str)
      );
    };

    // Backup dos métodos originais
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;
    
    // Contador de erros suprimidos para debug
    let suppressedCount = 0;
    
    // Sobrescrever console.error de forma mais agressiva
    console.error = function(...args: unknown[]) {
      const allArgs = args.map(arg => String(arg)).join(' ');
      
      if (isExtensionRelated(allArgs)) {
        suppressedCount++;
        if (suppressedCount <= 5) { // Mostrar apenas as primeiras 5 supressões
          console.log(`🔇 Erro de extensão suprimido #${suppressedCount}`);
        }
        return;
      }
      
      originalError.apply(console, ['🚨 APP ERROR:', ...args]);
    };

    // Sobrescrever console.warn
    console.warn = function(...args: unknown[]) {
      const allArgs = args.map(arg => String(arg)).join(' ');
      
      if (isExtensionRelated(allArgs)) {
        return;
      }
      
      originalWarn.apply(console, ['⚠️ APP WARNING:', ...args]);
    };

    // Sobrescrever console.log para filtrar logs de extensão
    console.log = function(...args: unknown[]) {
      const allArgs = args.map(arg => String(arg)).join(' ');
      
      if (isExtensionRelated(allArgs)) {
        return;
      }
      
      originalLog.apply(console, args);
    };

    // Handler de erro global mais agressivo
    const errorHandler = (event: ErrorEvent) => {
      if (
        isExtensionRelated(event.filename) ||
        isExtensionRelated(event.message) ||
        isExtensionRelated(event.error?.stack)
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Handler de rejection
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      if (isExtensionRelated(event.reason)) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Registrar listeners com todas as opções de captura
    window.addEventListener('error', errorHandler, {
      capture: true,
      passive: false
    });
    
    window.addEventListener('unhandledrejection', rejectionHandler, {
      capture: true,
      passive: false
    });

    console.log('🛡️ GlobalErrorFilter ativo - Extensões serão silenciadas');

    // Cleanup
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
      console.log('🛡️ GlobalErrorFilter desativado');
    };
  }, []);

  return null;
}
