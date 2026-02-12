/**
 * 가로 스와이프 Composable
 * - 수평 스와이프 시 수직 스크롤 방지 (preventDefault)
 * - 대각선 터치도 안정적으로 처리 (각도 판별)
 * - 적은 움직임에서는 아무 동작도 하지 않음 (threshold)
 *
 * @param {object} options
 * @param {Function} options.onSwipeLeft  - 왼쪽 스와이프 콜백 (다음)
 * @param {Function} options.onSwipeRight - 오른쪽 스와이프 콜백 (이전)
 * @param {number}   options.threshold    - 스와이프 인식 최소 거리 (기본 40px)
 * @param {number}   options.angleLimit   - 수평 판별 최대 각도 (기본 30도)
 */
export const useSwipe = (options = {}) => {
  const {
    onSwipeLeft = () => {},
    onSwipeRight = () => {},
    threshold = 40,
    angleLimit = 30
  } = options

  let startX = 0
  let startY = 0
  let isTracking = false
  let direction = null // 'horizontal' | 'vertical' | null

  // 방향 판별 최소 이동 거리
  const directionLockDistance = 10

  const onTouchStart = (e) => {
    const touch = e.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    isTracking = true
    direction = null
  }

  const onTouchMove = (e) => {
    if (!isTracking) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    // 방향 미정 상태에서 최소 이동 이후 방향 결정
    if (!direction) {
      if (absX < directionLockDistance && absY < directionLockDistance) return

      const angle = Math.atan2(absY, absX) * (180 / Math.PI)
      direction = angle <= angleLimit ? 'horizontal' : 'vertical'
    }

    // 수평 스와이프로 판별되면 수직 스크롤 차단
    if (direction === 'horizontal') {
      e.preventDefault()
    }
  }

  const onTouchEnd = (e) => {
    if (!isTracking) return
    isTracking = false

    if (direction !== 'horizontal') {
      direction = null
      return
    }

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - startX

    if (Math.abs(deltaX) >= threshold) {
      if (deltaX < 0) {
        onSwipeLeft()
      } else {
        onSwipeRight()
      }
    }

    direction = null
  }

  /**
   * 템플릿에서 바인딩용 이벤트 객체
   * v-on="swipeEvents" 또는 개별 @touchstart 등으로 사용
   */
  const swipeEvents = {
    touchstart: onTouchStart,
    touchmove: onTouchMove,
    touchend: onTouchEnd
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    swipeEvents
  }
}
