/**
 * 소셜 로그인 Composable
 * 네이버/구글/카카오 OAuth 인가 URL 구성 및 콜백 처리
 */
export const useSocialAuth = () => {
  const { get, post } = useApi();

  /**
   * 백엔드에서 OAuth URL 가져오기
   * @param {string} provider - 소셜 제공자 (naver, google, kakao)
   */
  const getOAuthUrl = async (provider) => {
    const res = await get(`/auth/oauth2/${provider}/url`);
    return res.data.url;
  };

  /**
   * URL에서 state 추출하여 저장 (CSRF 검증용)
   */
  const saveStateFromUrl = (url) => {
    const urlObj = new URL(url);
    const state = urlObj.searchParams.get("state");
    if (state) {
      sessionStorage.setItem("oauth_state", state);
    }
  };

  /**
   * 저장된 state 검증
   */
  const verifyState = (state) => {
    const saved = sessionStorage.getItem("oauth_state");
    sessionStorage.removeItem("oauth_state");
    return saved === state;
  };

  /**
   * 로그인 후 리다이렉트 경로 저장
   */
  const setRedirectPath = (path) => {
    if (path) {
      sessionStorage.setItem("oauth_redirect", path);
    }
  };

  /**
   * 로그인 후 리다이렉트 경로 가져오기 (가져온 후 삭제)
   */
  const getRedirectPath = () => {
    const path = sessionStorage.getItem("oauth_redirect");
    sessionStorage.removeItem("oauth_redirect");
    return path || "/";
  };

  /**
   * 네이버 로그인 페이지로 리다이렉트
   */
  const redirectToNaver = async () => {
    const url = await getOAuthUrl("naver");
    saveStateFromUrl(url);
    window.location.href = url;
  };

  /**
   * 네이버 콜백 처리 - 인가코드를 백엔드에 전달
   * @param {string} code - 인가 코드
   * @param {string} state - CSRF state
   */
  const naverLogin = async (code, state) => {
    return await post("/auth/oauth2/naver", { code, state });
  };

  /**
   * 구글 로그인 페이지로 리다이렉트
   */
  const redirectToGoogle = async () => {
    const url = await getOAuthUrl("google");
    saveStateFromUrl(url);
    window.location.href = url;
  };

  /**
   * 구글 콜백 처리 - 인가코드를 백엔드에 전달
   */
  const googleLogin = async (code) => {
    return await post("/auth/oauth2/google", { code });
  };

  /**
   * 구글 계정 연동 - 인가코드 + 계정 정보를 백엔드에 전달
   */
  const googleLink = async (code) => {
    const email = sessionStorage.getItem("oauth_link_email");
    const password = sessionStorage.getItem("oauth_link_password");
    clearLinkCredentials();
    return await post("/auth/oauth2/google/link", { email, password, code });
  };

  /**
   * 구글 계정 연동용 리다이렉트
   */
  const redirectToGoogleLink = async (email, password) => {
    sessionStorage.setItem("oauth_mode", "link");
    sessionStorage.setItem("oauth_provider", "google");
    sessionStorage.setItem("oauth_link_email", email);
    sessionStorage.setItem("oauth_link_password", password);
    await redirectToGoogle();
  };

  /**
   * 네이버 계정 연동용 리다이렉트
   * 비밀번호 확인 후 OAuth 진행, 콜백에서 link API 호출
   */
  const redirectToNaverLink = async (email, password) => {
    sessionStorage.setItem("oauth_mode", "link");
    sessionStorage.setItem("oauth_provider", "naver");
    sessionStorage.setItem("oauth_link_email", email);
    sessionStorage.setItem("oauth_link_password", password);
    await redirectToNaver();
  };

  /**
   * 네이버 계정 연동 - 인가코드 + 계정 정보를 백엔드에 전달
   */
  const naverLink = async (code, state) => {
    const email = sessionStorage.getItem("oauth_link_email");
    const password = sessionStorage.getItem("oauth_link_password");
    clearLinkCredentials();
    return await post("/auth/oauth2/naver/link", {
      email,
      password,
      code,
      state,
    });
  };

  /**
   * 연동용 임시 저장 데이터 정리
   */
  const clearLinkCredentials = () => {
    sessionStorage.removeItem("oauth_mode");
    sessionStorage.removeItem("oauth_provider");
    sessionStorage.removeItem("oauth_link_email");
    sessionStorage.removeItem("oauth_link_password");
  };

  /**
   * 현재 OAuth 모드 확인
   */
  const getOAuthMode = () => {
    return sessionStorage.getItem("oauth_mode") || "login";
  };

  /**
   * 소셜 회원가입 완료 - 임시 토큰 + 약관 동의 내역으로 가입 처리
   * @param {string} signupToken - 백엔드 발급 임시 토큰
   * @param {Array} agreements - [{ policyId, agreed }]
   */
  const socialSignupComplete = async (signupToken, agreements) => {
    return await post("/auth/oauth2/signup", {
      signupToken,
      agreements,
    });
  };

  /**
   * 소셜 계정 연동 (동일 이메일 일반 가입 유저 → 비밀번호 확인 후 연동)
   * @param {string} linkToken - AUTH_013 응답에서 받은 연동 토큰
   * @param {string} provider - 소셜 제공자 (naver, google)
   * @param {string} email - 기존 계정 이메일
   * @param {string} password - 기존 계정 비밀번호
   */
  const linkAccount = async (linkToken, provider, email, password) => {
    return await post(`/auth/oauth2/${provider}/link`, {
      linkToken,
      email,
      password,
    });
  };

  return {
    redirectToNaver,
    redirectToNaverLink,
    verifyState,
    naverLogin,
    naverLink,
    redirectToGoogle,
    redirectToGoogleLink,
    googleLogin,
    googleLink,
    clearLinkCredentials,
    getOAuthMode,
    socialSignupComplete,
    linkAccount,
    setRedirectPath,
    getRedirectPath,
  };
};
