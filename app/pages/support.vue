<script setup>
import supportData from '~/data/support.json'

const router = useRouter()
const authStore = useAuthStore()

// shop-info에서 고객센터 정보 가져오기
const {
  shopName,
  businessInfo,
  customerServiceInfo,
  privacyInfo,
  snsInfo,
  seoInfo
} = useShopInfo()

// SEO
useHead({ title: () => supportData.seo.title })
useSeoMeta({
  title: () => supportData.seo.title,
  description: supportData.seo.description
})

// 상점 정보
const businessName = computed(() => businessInfo.value?.businessName || shopName.value || '')
const businessNumber = computed(() => businessInfo.value?.businessNumber || '')
const address = computed(() => {
  const info = businessInfo.value
  if (info?.address) {
    return `${info.address} ${info.addressDetail || ''}`.trim()
  }
  return ''
})

// 전화번호
const phone = computed(() => customerServiceInfo.value?.phone || '')
const phoneHref = computed(() => {
  if (!phone.value) return ''
  return `tel:${phone.value.replace(/-/g, '')}`
})

// 이메일
const email = computed(() => customerServiceInfo.value?.email || businessInfo.value?.email || '')
const emailHref = computed(() => {
  if (!email.value) return ''
  return `mailto:${email.value}`
})

// 영업시간
const operatingHours = computed(() => customerServiceInfo.value?.hours || '')

// 개인정보관리책임자
const privacyOfficer = computed(() => privacyInfo.value?.officer || '')
const privacyEmail = computed(() => privacyInfo.value?.email || '')
const privacyEmailHref = computed(() => {
  if (!privacyEmail.value) return ''
  return `mailto:${privacyEmail.value}`
})

// SNS 타입 정의
const snsTypes = [
  { type: 'youtube', label: 'YouTube' },
  { type: 'instagram', label: 'Instagram' },
  { type: 'facebook', label: 'Facebook' },
  { type: 'kakao', label: 'Kakao' },
  { type: 'blog', label: 'Blog' }
]

// SNS 링크 (API: snsInfo.youtube, snsInfo.facebook 등)
const socialLinks = computed(() => {
  const info = snsInfo.value
  if (!info) return []

  // 객체 형태: { youtube: 'url', instagram: 'url' }
  if (typeof info === 'object' && !Array.isArray(info)) {
    return snsTypes
      .filter(sns => info[sns.type])
      .map(sns => ({
        type: sns.type,
        href: info[sns.type],
        label: sns.label
      }))
  }

  // 배열 형태: [{ type: 'youtube', url: '...' }]
  if (Array.isArray(info) && info.length) {
    return info.map(sns => ({
      type: sns.type,
      href: sns.url || sns.href || '#',
      label: sns.label || sns.type
    }))
  }

  return []
})

// SNS 아이콘 path
const getSnsIcon = (type) => {
  const icons = {
    youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
    facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    kakao: 'M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3zm5.519 5.442l-2.171 4.886h1.471l.537-1.27h2.318l.537 1.27h1.471l-2.171-4.886h-1.992zm-9.616 0l-1.506 2.722-1.506-2.722h-1.61l2.316 4.886h1.6l2.316-4.886h-1.61zm5.172 0v4.886h1.326v-4.886h-1.326zm7.143 1.44l.665 1.574h-1.33l.665-1.574z',
    blog: 'M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-8v-2h8v2zm0-4h-8v-2h8v2zm0-4h-8V7h8v2z',
    x: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
  }
  return icons[type] || icons.blog
}

// 빠른 링크 아이콘 매핑
const getLinkIcon = (icon) => {
  const icons = {
    qna: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z',
    order: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z'
  }
  return icons[icon] || icons.qna
}

// 로그인이 필요한 링크인지 확인
const requiresAuth = (href) => {
  return href.startsWith('/mypage')
}

// 링크 클릭 핸들러
const handleLinkClick = (event, link) => {
  if (requiresAuth(link.href) && !authStore.isLoggedIn) {
    event.preventDefault()
    router.push(`/login?redirect=${encodeURIComponent(link.href)}`)
  }
}
</script>

<template>
  <LayoutPage
    :title="supportData.header.title"
  >
    <!-- 3 Grid Cards -->
    <div class="support-page__grid">
      <!-- 상점 정보 -->
      <article class="support-card">
        <h2 class="support-card__title">{{ supportData.shopInfo.title }}</h2>
        <dl class="support-card__list">
          <div v-if="businessName" class="support-card__item">
            <dt class="support-card__label">{{ supportData.shopInfo.shopNameLabel }}</dt>
            <dd class="support-card__value">{{ businessName }}</dd>
          </div>
          <div v-if="businessNumber" class="support-card__item">
            <dt class="support-card__label">{{ supportData.shopInfo.businessNumberLabel }}</dt>
            <dd class="support-card__value">{{ businessNumber }}</dd>
          </div>
          <div v-if="address" class="support-card__item">
            <dt class="support-card__label">{{ supportData.shopInfo.addressLabel }}</dt>
            <dd class="support-card__value">{{ address }}</dd>
          </div>
          <div v-if="privacyOfficer" class="support-card__item">
            <dt class="support-card__label">{{ supportData.shopInfo.privacyOfficerLabel }}</dt>
            <dd class="support-card__value">{{ privacyOfficer }}</dd>
          </div>
          <div v-if="privacyEmail" class="support-card__item">
            <dt class="support-card__label">{{ supportData.shopInfo.privacyEmailLabel }}</dt>
            <dd class="support-card__value">
              <a :href="privacyEmailHref" class="support-contact__value--link">{{ privacyEmail }}</a>
            </dd>
          </div>
        </dl>
      </article>

      <!-- 문의하기 -->
      <article class="support-card">
        <h2 class="support-card__title">{{ supportData.contact.title }}</h2>
        <div class="support-card__contacts">
          <div v-if="phone" class="support-contact">
            <span class="support-contact__label">{{ supportData.contact.phone.label }}</span>
            <a :href="phoneHref" class="support-contact__value support-contact__value--link">
              {{ phone }}
            </a>
          </div>
          <div v-if="email" class="support-contact">
            <span class="support-contact__label">{{ supportData.contact.email.label }}</span>
            <a :href="emailHref" class="support-contact__value support-contact__value--link">
              {{ email }}
            </a>
          </div>
          <div v-if="operatingHours" class="support-contact">
            <span class="support-contact__label">{{ supportData.contact.operatingHoursLabel }}</span>
            <span class="support-contact__value">{{ operatingHours }}</span>
          </div>
        </div>
      </article>

      <!-- SNS -->
      <article class="support-card">
        <h2 class="support-card__title">{{ supportData.sns.title }}</h2>
        <p class="support-card__description">{{ supportData.sns.description }}</p>
        <div v-if="socialLinks.length" class="support-card__social">
          <a
            v-for="social in socialLinks"
            :key="social.type"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            class="support-social-link"
            :aria-label="social.label"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path :d="getSnsIcon(social.type)" fill="currentColor"/>
            </svg>
          </a>
        </div>
      </article>
    </div>

    <!-- 바로가기 링크 -->
    <section class="support-page__links">
      <h2 class="support-page__section-title">{{ supportData.links.title }}</h2>
      <div class="support-links">
        <NuxtLink
          v-for="link in supportData.links.items"
          :key="link.href"
          :to="link.href"
          class="support-link"
          @click="handleLinkClick($event, link)"
        >
          <div class="support-link__icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path :d="getLinkIcon(link.icon)" fill="currentColor"/>
            </svg>
          </div>
          <div class="support-link__content">
            <h3 class="support-link__title">{{ link.title }}</h3>
            <p class="support-link__description">{{ link.description }}</p>
          </div>
          <div class="support-link__arrow">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/>
            </svg>
          </div>
        </NuxtLink>
      </div>
    </section>
  </LayoutPage>
</template>
