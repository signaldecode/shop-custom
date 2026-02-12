<script setup>
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

// 쇼핑몰 정보 (API에서 가져온 데이터)
const {
  shopName,
  logoUrl,
  businessInfo,
  customerServiceInfo,
  privacyInfo,
  copyrightText,
  snsInfo
} = useShopInfo()

// SNS 타입 정의 (IconSocial에서 지원하는 타입만)
const snsTypes = [
  { type: 'youtube', label: 'YouTube' },
  { type: 'instagram', label: 'Instagram' },
  { type: 'x', label: 'X' }
]

// IconSocial에서 지원하는 타입
const supportedSnsTypes = ['youtube', 'instagram', 'x']

// SNS 링크 (API 우선, 없으면 props fallback) - 지원되는 타입만 필터링
const socialLinks = computed(() => {
  const info = snsInfo.value
  if (!info) {
    const fallback = props.data.social || []
    return fallback.filter(s => supportedSnsTypes.includes(s.type))
  }

  // 객체 형태: { youtube: 'url', instagram: 'url' }
  if (typeof info === 'object' && !Array.isArray(info)) {
    return snsTypes
      .filter(sns => info[sns.type] && supportedSnsTypes.includes(sns.type))
      .map(sns => ({
        type: sns.type,
        href: info[sns.type],
        label: sns.label
      }))
  }

  // 배열 형태: [{ type: 'youtube', url: '...' }]
  if (Array.isArray(info) && info.length) {
    return info
      .filter(sns => supportedSnsTypes.includes(sns.type))
      .map(sns => ({
        type: sns.type,
        href: sns.url || sns.href || '#',
        label: sns.label || sns.type
      }))
  }

  const fallback = props.data.social || []
  return fallback.filter(s => supportedSnsTypes.includes(s.type))
})

// 회사명 (API 우선, 없으면 props fallback)
const companyName = computed(() => businessInfo.value?.businessName || props.data.companyInfo?.name || '')
const ceoName = computed(() => businessInfo.value?.ceoName || props.data.companyInfo?.ceo || '')
const businessNumber = computed(() => businessInfo.value?.businessNumber || props.data.companyInfo?.businessNumber || '')
const companyAddress = computed(() => {
  const info = businessInfo.value
  if (info?.address) {
    return `${info.address} ${info.addressDetail || ''}`.trim()
  }
  return ''
})

// 연락처 (API 우선)
const csPhone = computed(() => customerServiceInfo.value?.phone || props.data.contact?.phone || '')
const csEmail = computed(() => businessInfo.value?.email || customerServiceInfo.value?.email || props.data.contact?.email || '')
const csHours = computed(() => customerServiceInfo.value?.hours || '')

// 전화 링크용 번호 (하이픈 제거)
const phoneHref = computed(() => {
  if (!csPhone.value) return ''
  return `tel:${csPhone.value.replace(/-/g, '')}`
})

// 로고 (API 우선)
const logoSrc = computed(() => logoUrl.value || props.data.logo?.src || '')

// 저작권 (API 우선)
const copyright = computed(() => copyrightText.value || props.data.copyright || '')

// 개인정보관리책임자
const privacyOfficer = computed(() => privacyInfo.value?.officer || '')
const privacyEmail = computed(() => privacyInfo.value?.email || '')

// 모바일 사업자 정보 토글
const isInfoOpen = ref(false)
const toggleInfo = () => {
  isInfoOpen.value = !isInfoOpen.value
}
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__top">
        <div class="footer__left">
          <div class="footer__logo">
            <img
              :src="logoSrc"
              :alt="data.logo.alt"
              class="footer__logo-image"
            />
            <span class="footer__logo-text">{{ shopName || data.logo.text }}</span>
          </div>

          <nav class="footer__nav" aria-label="푸터 내비게이션">
            <ul class="footer__nav-list">
              <li
                v-for="link in data.nav"
                :key="link.href"
                class="footer__nav-item"
              >
                <NuxtLink :to="link.href" class="footer__nav-link">
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </nav>

          <div class="footer__info">
            <p class="footer__info-line footer__info-line--primary">
              <span>{{ companyName }}</span>
              <span>{{ data.companyInfo.ceoLabel }} {{ ceoName }}</span>
              <span>{{ data.companyInfo.businessNumberLabel }} {{ businessNumber }}</span>
              <span v-if="companyAddress">{{ companyAddress }}</span>
            </p>

            <!-- 모바일 토글 버튼 -->
            <button
              type="button"
              class="footer__info-toggle"
              :aria-expanded="isInfoOpen"
              @click="toggleInfo"
            >
              {{ data.infoToggleLabel }}
              <IconArrow direction="down" size="sm" />
            </button>

            <!-- 토글 영역 (모바일에서만 접힘) -->
            <div :class="['footer__info-detail', { 'footer__info-detail--open': isInfoOpen }]">
              <p v-if="csPhone || csEmail || csHours" class="footer__info-line">
                <span v-if="csPhone">
                  {{ data.contact.phoneLabel }}:
                  <a :href="phoneHref" class="footer__phone-link">{{ csPhone }}</a>
                </span>
                <span v-if="csEmail">{{ data.contact.emailLabel }}: {{ csEmail }}</span>
                <span v-if="csHours">{{ data.contact.hoursLabel }}: {{ csHours }}</span>
              </p>
              <p v-if="privacyOfficer || privacyEmail" class="footer__info-line">
                <span v-if="privacyOfficer">{{ data.privacy?.officerLabel }}: {{ privacyOfficer }}</span>
                <span v-if="privacyEmail">{{ data.privacy?.emailLabel }}: {{ privacyEmail }}</span>
              </p>
            </div>
          </div>
        </div>

        <div v-if="socialLinks.length" class="footer__social">
          <a
            v-for="social in socialLinks"
            :key="social.type"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            class="footer__social-link"
            :aria-label="social.label"
          >
            <IconSocial :type="social.type" />
          </a>
        </div>
      </div>

      <p class="footer__copyright">{{ copyright }}</p>
    </div>
  </footer>
</template>
