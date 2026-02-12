/**
 * Toast 알림 composable
 * 전역에서 토스트 메시지를 표시하기 위한 상태 관리
 */

const toasts = ref([])
let toastId = 0

export const useToast = () => {
  /**
   * 토스트 메시지 표시
   * @param {string} message - 표시할 메시지
   * @param {object} options - 옵션
   * @param {string} options.type - 타입 (info, success, error, warning)
   * @param {number} options.duration - 표시 시간 (ms), 기본 3000ms
   * @param {object} options.link - 링크 정보 { text, href }
   */
  const show = (message, options = {}) => {
    const { type = 'info', duration = 3000, link = null } = options

    const id = ++toastId
    const toast = {
      id,
      message,
      type,
      link,
      visible: true
    }

    toasts.value.push(toast)

    // 자동 제거
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  /**
   * 토스트 제거
   * @param {number} id - 토스트 ID
   */
  const remove = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * 모든 토스트 제거
   */
  const clear = () => {
    toasts.value = []
  }

  // 단축 메서드
  const info = (message, options = {}) => show(message, { type: 'info', ...options })
  const success = (message, options = {}) => show(message, { type: 'success', ...options })
  const error = (message, options = {}) => show(message, { type: 'error', ...options })
  const warning = (message, options = {}) => show(message, { type: 'warning', ...options })

  return {
    toasts: readonly(toasts),
    show,
    remove,
    clear,
    info,
    success,
    error,
    warning
  }
}
