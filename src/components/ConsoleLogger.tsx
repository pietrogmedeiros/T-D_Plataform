'use client';

import { useEffect } from 'react';

export default function ConsoleLogger() {
  useEffect(() => {
    // Interceptar erros do console para filtrar erros irrelevantes
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;
    
    console.error = (...args) => {
      // Filtrar erros irrelevantes do Chrome Extensions e outros
      const message = args[0]?.toString() || '';
      if (
        message.includes('chrome-extension://') ||
        message.includes('ERR_FILE_NOT_FOUND') ||
        message.includes('net::ERR_FILE_NOT_FOUND') ||
        message.includes('Failed to load resource') ||
        message.includes('The resource') ||
        message.includes('was preloaded using link preload') ||
        message.includes('DevTools') ||
        message.includes('Manifest V2') ||
        message.includes('extension') ||
        message.includes('moz-extension') ||
        message.includes('safari-extension')
      ) {
        // Não mostrar esses erros no console
        return;
      }
      // Mostrar apenas erros relevantes da aplicação
      originalError.apply(console, ['🚨', ...args]);
    };
    
    console.warn = (...args) => {
      // Filtrar warnings irrelevantes
      const message = args[0]?.toString() || '';
      if (
        message.includes('chrome-extension://') ||
        message.includes('DevTools') ||
        message.includes('Manifest V2') ||
        message.includes('extension') ||
        message.includes('was preloaded using link preload') ||
        message.includes('The resource')
      ) {
        // Não mostrar esses warnings
        return;
      }
      // Mostrar apenas warnings relevantes
      originalWarn.apply(console, ['⚠️', ...args]);
    };

    // Filtrar também logs muito verbosos
    console.log = (...args) => {
      const message = args[0]?.toString() || '';
      if (
        message.includes('chrome-extension://') ||
        message.includes('DevTools') ||
        message.includes('extension')
      ) {
        return;
      }
      originalLog.apply(console, args);
    };

    // Interceptar eventos de erro globais
    const handleError = (event: ErrorEvent) => {
      if (
        event.filename?.includes('chrome-extension') ||
        event.filename?.includes('extension') ||
        event.message?.includes('chrome-extension') ||
        event.message?.includes('extension')
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || '';
      if (
        reason.includes('chrome-extension') ||
        reason.includes('extension') ||
        reason.includes('ERR_FILE_NOT_FOUND')
      ) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
