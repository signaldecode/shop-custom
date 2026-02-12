/**
 * 주문 완료 페이지 접근 제어
 * orderId 또는 orderNumber가 없으면 메인으로 리다이렉트
 */
export default defineNuxtRouteMiddleware((to) => {
  const orderId = to.query.orderId
  const orderNumber = to.query.orderNumber
  const hasValidId = orderId && orderId !== 'null' && orderId !== 'undefined'
  const hasValidNumber = orderNumber && orderNumber !== 'null' && orderNumber !== 'undefined'

  if (!hasValidId && !hasValidNumber) {
    return navigateTo('/', { replace: true })
  }
})
