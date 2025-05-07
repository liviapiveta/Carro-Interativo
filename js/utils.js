/**
 * js/utils.js
 * Funções utilitárias gerais.
 */

/**
 * Gera um UUID v4 (identificador único universal).
 * @returns {string} Um UUID v4.
 */
export function uuidv4() {
    // Crypto API é mais segura e padrão
    if (crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback (menos ideal, mas funciona em ambientes sem crypto.randomUUID)
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4)).toString(16)
    );
  }
  
  /**
   * Reproduz um som pelo ID do elemento de áudio.
   * @param {string} soundId - O ID do elemento <audio>.
   */
  export function playSound(soundId) {
      const sound = document.getElementById(soundId);
      if (sound && sound instanceof HTMLAudioElement) {
          sound.currentTime = 0; // Reinicia para tocar do início
          sound.play().catch(error => {
              // Erros comuns: interação do usuário necessária, formato não suportado
              if (error.name === 'NotAllowedError') {
                  console.warn("Reprodução de áudio bloqueada pelo navegador. Interação do usuário necessária.");
                  // Considerar mostrar uma mensagem na UI pedindo interação
              } else {
                  console.warn(`Erro ao tocar som "${soundId}":`, error);
              }
          });
      } else {
          console.warn("Elemento de áudio não encontrado ou inválido:", soundId);
      }
  }
  
  /**
   * Converte uma data string dd/mm/yyyy para um objeto Date (meia-noite UTC).
   * @param {string} dateString - Data no formato "dd/mm/yyyy".
   * @returns {Date|null} Objeto Date (UTC) ou null se inválido.
   */
  export function parsePtBrDate(dateString) {
      if (!dateString) return null;
      const parts = dateString.split('/');
      if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10); // 1-based month
          const year = parseInt(parts[2], 10);
  
          // Validação básica dos números
          if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31 || year < 1000 || year > 9999) {
               return null;
           }
  
          // Usa o construtor Date com UTC para evitar problemas de fuso
          const date = new Date(Date.UTC(year, month - 1, day)); // month é 0-based em Date
  
          // Verifica se a data criada é válida e corresponde às partes (evita datas inválidas como 31/02)
          // Compara usando métodos UTC
          if (date && date.getUTCDate() === day && date.getUTCMonth() === month - 1 && date.getUTCFullYear() === year) {
              return date;
          }
      }
      console.warn("Formato de data inválido para parsePtBrDate:", dateString);
      return null;
  }