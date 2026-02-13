<script setup>
import mypageData from '~/data/mypage.json'
import IconCart from '~/components/ui/icons/IconCart.vue'
import IconReview from '~/components/ui/icons/IconReview.vue'
import IconLock from '~/components/ui/icons/IconLock.vue'

const route = useRoute()
const authStore = useAuthStore()

// 로그인 필요 모달 (비로그인 접근 시)
const showLoginModal = ref(false)
const isAuthChecked = ref(false)

// 클라이언트에서 로그인 상태 확인
onMounted(async () => {
  // SSR에서 이미 로그인 확인됐으면 API 호출 스킵
  if (!authStore.isLoggedIn) {
    await authStore.ensureUser()
  }
  isAuthChecked.value = true
  if (!authStore.isLoggedIn) {
    showLoginModal.value = true
  }
})

// 아이콘 매핑
const iconMap = {
  IconCart,
  IconReview,
  IconLock
}

// 현재 경로에서 active item 계산
const activeItemId = computed(() => {
  const path = route.path

  // /mypage/orders/[id] → orders
  if (path.startsWith('/mypage/orders/')) return 'orders'

  // /mypage/orders → orders
  // /mypage/profile → profile
  // /mypage → dashboard
  const segment = path.replace('/mypage', '').replace('/', '') || 'dashboard'
  return segment
})

// groups에 icon 컴포넌트 연결
const groups = computed(() => {
  return mypageData.groups.map(group => ({
    ...group,
    icon: iconMap[group.icon] || null
  }))
})
</script>

<template>
  <div class="page-mypage">
    <main class="mypage-page layout-1420">
      <!-- 인증 확인 중 로딩 -->
      <div v-if="!isAuthChecked" class="mypage-layout mypage-layout--loading">
        <BaseSpinner />
      </div>
      <!-- 비로그인 상태 -->
      <div v-else-if="!authStore.isLoggedIn" class="mypage-layout mypage-layout--empty" />
      <!-- 로그인 상태 -->
      <div v-else class="mypage-layout">
        <aside class="mypage-layout__sidebar">
          <MyPageSideNav
            :active-item-id="activeItemId"
            :title="mypageData.sidebarTitle"
            :groups="groups"
            default-open-group-id="shopping"
          />
        </aside>

        <section class="mypage-layout__content">
          <slot />
        </section>
      </div>
    </main>

    <!-- 로그인 필요 모달 -->
    <LoginRequiredModal
      v-model="showLoginModal"
      feature="마이페이지"
      redirect-path="/mypage"
      go-back-on-cancel
    />
  </div>
</template>
