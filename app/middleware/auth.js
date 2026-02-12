export default defineNuxtRouteMiddleware(async () => {
  // SSR에서는 스킵 (쿠키 전달 문제로 클라이언트에서만 체크)
  if (import.meta.server) return;

  // localStorage에 로그인 플래그 없으면 API 호출 없이 바로 리다이렉트
  const hasLoginFlag = localStorage.getItem("isLoggedIn") === "true";
  if (!hasLoginFlag) {
    return navigateTo("/login");
  }

  const authStore = useAuthStore();
  await authStore.ensureUser();

  if (!authStore.isLoggedIn) {
    // 쿠키 만료 등으로 실패 시 플래그 제거
    localStorage.removeItem("isLoggedIn");
    return navigateTo("/login");
  }
});
