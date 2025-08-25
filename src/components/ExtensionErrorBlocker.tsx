'use client';

import { useEffect } from 'react';

export default function ExtensionErrorBlocker() {
  useEffect(() => {
    // Função que silencia TODOS os tipos de erro de extensão
    const blockExtensionErrors = () => {
      // Lista de padrões para detectar erros de extensão
      const extensionPatterns = [
        'chrome-extension://',
        'moz-extension://',
        'safari-extension://',
        'ERR_FILE_NOT_FOUND',
        'net::ERR_FILE_NOT_FOUND',
        'Failed to load resource',
        'The resource',
        'was preloaded using link preload',
        'but not used within a few seconds',
        'completion_list.html',
        'utils.js',
        'extensionState.js'
      ];

      // Função para verificar se é erro de extensão
      const isExtensionError = (message: string): boolean => {
        return extensionPatterns.some(pattern => 
          message.toLowerCase().includes(pattern.toLowerCase())
        );
      };

      // Interceptar e bloquear completamente os métodos de console
      const originalError = console.error;
      const originalWarn = console.warn;
      
      console.error = (...args) => {
        const message = args.join(' ');
        if (!isExtensionError(message)) {
          originalError.apply(console, args);
        }
      };
      
      console.warn = (...args) => {
        const message = args.join(' ');
        if (!isExtensionError(message)) {
          originalWarn.apply(console, args);
        }
      };

      // Bloquear eventos de erro globais
      window.addEventListener('error', (e) => {
        if (
          isExtensionError(e.message || '') ||
          isExtensionError(e.filename || '')
        ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      }, true);

      // Bloquear promise rejections
      window.addEventListener('unhandledrejection', (e) => {
        const reason = String(e.reason || '');
        if (isExtensionError(reason)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }, true);

      console.log('🚫 Bloqueador de erros de extensão ativado');
    };

    // Executar imediatamente
    blockExtensionErrors();

    // Também executar após um pequeno delay para garantir
    const timeout = setTimeout(blockExtensionErrors, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return null;
}
