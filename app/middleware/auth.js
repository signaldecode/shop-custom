export default defineNuxtRouteMiddleware(async () => {
  // SSR에서는 스킵 (auth.server.js에서 처리)
  if (import.meta.server) return;

  const authStore = useAuthStore();

  // SSR에서 이미 로그인 확인됐으면 스킵
  if (authStore.isLoggedIn) return;

  // localStorage에 로그인 플래그 없으면 API 호출 없이 바로 리다이렉트
  const hasLoginFlag = localStorage.getItem("isLoggedIn") === "true";
  if (!hasLoginFlag) {
    return navigateTo("/login");
  }

  // 플래그는 있는데 store에 user 없으면 확인 (SPA 네비게이션 등)
  await authStore.ensureUser();

  if (!authStore.isLoggedIn) {
    localStorage.removeItem("isLoggedIn");
    return navigateTo("/login");
  }
});
