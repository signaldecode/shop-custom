<script setup>
const props = defineProps({
  logo: {
    type: Object,
    required: true
  },
  nav: {
    type: Array,
    required: true
  },
  navAriaLabel: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'light',
    validator: (v) => ['light', 'dark'].includes(v)
  }
})

const emit = defineEmits(['menuClick', 'searchClick', 'userClick', 'cartClick'])

const router = useRouter()
const authStore = useAuthStore()
const { post } = useApi()
const cart = useCart()
const { logoUrl, shopName, isLoaded: shopInfoLoaded } = useShopInfo()

// 로고 이미지 (API 로딩 완료 후에만 표시, fallback 없음)
const logoSrc = computed(() => logoUrl.value || '')

// 로고 텍스트 (이미지 없을 때 표시)
const logoText = computed(() => shopName.value || '')

const isScrolled = ref(false)
const isSearchOpen = ref(false)
const isUserMenuOpen = ref(false)
const isMobileNavOpen = ref(false)
const searchQuery = ref('')
const searchInputRef = ref(null)
const userMenuRef = ref(null)

// dark variant, 스크롤, 검색창 열림 시 흰색 배경
const showDarkStyle = computed(() => {
  return props.variant === 'dark' || isScrolled.value || isSearchOpen.value || isMobileNavOpen.value
})

let scrollTicking = false
const handleScroll = () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      isScrolled.value = window.scrollY > 50
      scrollTicking = false
    })
    scrollTicking = true
  }
}

const openSearch = () => {
  isSearchOpen.value = true
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

const closeSearch = () => {
  isSearchOpen.value = false
  searchQuery.value = ''
}

// 모바일 내비게이션
const toggleMobileNav = () => {
  isMobileNavOpen.value = !isMobileNavOpen.value
  // 메뉴 열릴 때 body 스크롤 방지
  if (isMobileNavOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileNav = () => {
  isMobileNavOpen.value = false
  document.body.style.overflow = ''
}

const handleUserClick = () => {
  emit('userClick')
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const goToMypage = () => {
  closeUserMenu()
  router.push('/mypage')
}

const handleLogout = async () => {
  try {
    await post('/auth/logout')
  } catch {
    // 로그아웃 API 실패해도 클라이언트에서는 로그아웃 처리
  } finally {
    authStore.logout()
    closeUserMenu()
    router.push('/login')
  }
}

// 외부 클릭 시 유저 메뉴 닫기
const handleClickOutside = (e) => {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    closeUserMenu()
  }
}

const handleCartClick = () => {
  emit('cartClick')
  router.push('/cart')
}

const handleSearchSubmit = (query) => {
  if (query.trim()) {
    router.push({
      path: '/search',
      query: { q: query.trim() }
    })
    closeSearch()
  }
}

// ESC 키로 검색창/모바일 메뉴 닫기
const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    if (isSearchOpen.value) closeSearch()
    if (isMobileNavOpen.value) closeMobileNav()
  }
}

// 라우트 변경 시 모바일 내비 닫기
const route = useRoute()
watch(() => route.fullPath, () => {
  if (isMobileNavOpen.value) {
    closeMobileNav()
  }
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('click', handleClickOutside)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('click', handleClickOutside)
  // 모바일 메뉴 열려있으면 정리
  document.body.style.overflow = ''
})
</script>

<template>
  <header :class="['header', { 'header--scrolled': showDarkStyle }]">
    <div class="header__inner">
      <!-- Left: Menu (mobile) + Logo + Nav -->
      <div class="header__left">
        <button
          type="button"
          class="header__menu-btn"
          :aria-label="logo.menuLabel"
          :aria-expanded="isMobileNavOpen"
          @click="toggleMobileNav"
        >
          <IconMenu v-if="!isMobileNavOpen" size="md" :label="logo.menuLabel" decorative />
          <IconClose v-else size="md" decorative />
        </button>

        <NuxtLink to="/" class="header__logo" @click="closeMobileNav">
          <NuxtImg v-if="logoSrc" :src="logoSrc" :alt="logo.alt" class="header__logo-img" preload />
          <span v-else-if="logoText" class="header__logo-text">{{ logoText }}</span>
        </NuxtLink>

        <nav class="header__nav" :aria-label="navAriaLabel">
          <ul class="header__nav-list">
            <li
              v-for="item in nav"
              :key="item.href"
              class="header__nav-item"
            >
              <NuxtLink :to="item.href" class="header__nav-link">
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Right: Search, User, Cart -->
      <div class="header__actions">
        <!-- Desktop Search (inline expanding) -->
        <div class="header__search-wrapper">
          <Transition name="search-expand">
            <div v-if="isSearchOpen" class="header__search-desktop">
              <BaseSearchInput
                ref="searchInputRef"
                v-model="searchQuery"
                :placeholder="logo.searchPlaceholder"
                :close-label="logo.searchCloseLabel"
                @close="closeSearch"
                @submit="handleSearchSubmit"
              />
            </div>
          </Transition>

          <button
            v-show="!isSearchOpen"
            type="button"
            class="header__action-btn"
            :aria-label="logo.searchLabel"
            @click="openSearch"
          >
            <IconSearch size="md" :label="logo.searchLabel" decorative />
          </button>
        </div>
        <button
          type="button"
          class="header__action-btn"
          :aria-label="logo.cartLabel"
          @click="handleCartClick"
        >
          <IconCart size="md" :count="cart.count.value" decorative />
        </button>
        <!-- 로그인 상태에 따라 다르게 렌더링 (SSR Hydration 방지) -->
        <ClientOnly>
          <!-- 로그인 전: LOGIN 텍스트 -->
          <NuxtLink
            v-if="!authStore.isLoggedIn"
            to="/login"
            class="header__login-link"
          >
            {{ logo.loginLabel }}
          </NuxtLink>

          <!-- 로그인 후: 유저 아이콘 + 드롭다운 -->
          <div v-else ref="userMenuRef" class="header__user-wrapper">
            <button
              type="button"
              class="header__action-btn"
              :aria-label="logo.userLabel"
              :aria-expanded="isUserMenuOpen"
              @click.stop="handleUserClick"
            >
              <IconUser size="md" :label="logo.userLabel" decorative />
            </button>

            <div v-if="isUserMenuOpen" class="header__user-menu">
              <button
                type="button"
                class="header__user-menu-item"
                @click="goToMypage"
              >
                {{ logo.userMenu.mypage }}
              </button>
              <button
                type="button"
                class="header__user-menu-item"
                @click="handleLogout"
              >
                {{ logo.userMenu.logout }}
              </button>
            </div>
          </div>
        </ClientOnly>
       
      </div>
    </div>

    <!-- Mobile Search Popup (full screen) -->
    <Teleport to="body">
      <Transition name="search-popup">
        <div v-if="isSearchOpen" class="header__search-mobile">
          <div class="header__search-mobile-inner">
            <BaseSearchInput
              v-model="searchQuery"
              :placeholder="logo.searchPlaceholder"
              :close-label="logo.searchCloseLabel"
              @close="closeSearch"
              @submit="handleSearchSubmit"
            />
          </div>
          <div class="header__search-mobile-backdrop" @click="closeSearch"></div>
        </div>
      </Transition>
    </Teleport>

    <!-- Mobile Navigation Menu (full screen) -->
    <Teleport to="body">
      <Transition name="mobile-nav">
        <div v-if="isMobileNavOpen" class="mobile-nav">
          <div class="mobile-nav__backdrop" @click="closeMobileNav" />
          <nav class="mobile-nav__content" :aria-label="navAriaLabel">
            <ul class="mobile-nav__list">
              <li v-for="item in nav" :key="item.href" class="mobile-nav__item">
                <NuxtLink
                  :to="item.href"
                  class="mobile-nav__link"
                  @click="closeMobileNav"
                >
                  {{ item.label }}
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>
