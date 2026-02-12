<script setup>
import mypageData from '~/data/mypage.json'
import uiData from '~/data/ui.json'

const common = uiData.common

const pageData = mypageData.pages.coupons
const modalLabels = pageData.modal.labels

const {
  availableCoupons,
  usedCoupons,
  expiredCoupons,
  couponCounts,
  pending,
  fetchCoupons
} = useCoupons()

// 현재 탭
const currentTab = ref('available')
const tabs = [
  { id: 'available', label: pageData.tabs.available },
  { id: 'used', label: pageData.tabs.used },
  { id: 'expired', label: pageData.tabs.expired }
]

// 현재 탭의 쿠폰 목록
const currentCoupons = computed(() => {
  switch (currentTab.value) {
    case 'used':
      return usedCoupons.value
    case 'expired':
      return expiredCoupons.value
    default:
      return availableCoupons.value
  }
})

// 탭별 카운트
const getTabCount = (tabId) => {
  return couponCounts.value[tabId] || 0
}

// 상세 모달
const showDetailModal = ref(false)
const selectedCoupon = ref(null)

const openDetail = (coupon) => {
  selectedCoupon.value = coupon
  showDetailModal.value = true
}

const closeDetail = () => {
  showDetailModal.value = false
  selectedCoupon.value = null
}

// 쿠폰 코드 복사
const codeCopied = ref(false)
const copyCode = async () => {
  if (!selectedCoupon.value?.code) return

  try {
    await navigator.clipboard.writeText(selectedCoupon.value.code)
    codeCopied.value = true
    setTimeout(() => {
      codeCopied.value = false
    }, 2000)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}

// 상태 뱃지 클래스
const getStatusClass = (status) => {
  const statusLower = status?.toLowerCase() || 'available'
  return `--${statusLower}`
}

// 상태 텍스트
const getStatusText = (status) => {
  return pageData.status[status] || status
}

// 중복 할인 텍스트
const getStackableText = (allowPromotionOverlap) => {
  return allowPromotionOverlap
    ? pageData.modal.stackableOptions['true']
    : pageData.modal.stackableOptions['false']
}

// 사용 조건 요약
const getConditionSummary = (coupon) => {
  if (coupon.minOrderText) {
    return `${coupon.minOrderText} ${pageData.list.minOrder}`
  }
  return '-'
}

// 해당 상품 보러가기
const goToProducts = () => {
  if (selectedCoupon.value?.targetUrl) {
    navigateTo(selectedCoupon.value.targetUrl)
    closeDetail()
  }
}

onMounted(() => {
  fetchCoupons()
})
</script>

<template>
  <section class="mypage-coupons" :aria-label="pageData.title">
    <header class="mypage-coupons__header">
      <h2 class="mypage-coupons__title">{{ pageData.title }}</h2>
    </header>

    <!-- 탭 -->
    <div class="mypage-coupons__tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="mypage-coupons__tab"
        :class="{ 'mypage-coupons__tab--active': currentTab === tab.id }"
        role="tab"
        :aria-selected="currentTab === tab.id"
        @click="currentTab = tab.id"
      >
        {{ tab.label }}
        <span class="mypage-coupons__tab-count">({{ getTabCount(tab.id) }})</span>
      </button>
    </div>

    <!-- 로딩 -->
    <div v-if="pending" class="mypage-coupons__loading">
      <BaseSpinner size="medium" />
    </div>

    <!-- 쿠폰 리스트 -->
    <div v-else-if="currentCoupons.length > 0" class="mypage-coupons__list">
      <article
        v-for="coupon in currentCoupons"
        :key="coupon.id"
        class="mypage-coupons__card"
        :class="{ 'mypage-coupons__card--disabled': coupon.status !== 'AVAILABLE' }"
        @click="openDetail(coupon)"
      >
        <!-- 할인 영역 -->
        <div class="mypage-coupons__card-discount">
          <span class="mypage-coupons__discount-value">{{ coupon.discountText }}</span>
          <span class="mypage-coupons__discount-type">
            {{ common.discount }}
          </span>
        </div>

        <!-- 정보 영역 -->
        <div class="mypage-coupons__card-content">
          <div class="mypage-coupons__card-header">
            <h3 class="mypage-coupons__card-name">{{ coupon.name }}</h3>
            <span
              class="mypage-coupons__card-badge"
              :class="`mypage-coupons__card-badge${getStatusClass(coupon.status)}`"
            >
              {{ getStatusText(coupon.status) }}
            </span>
          </div>

          <!-- 설명 -->
          <p v-if="coupon.description" class="mypage-coupons__card-desc">
            {{ coupon.description }}
          </p>

          <!-- 쿠폰/할인 타입 -->
          <div class="mypage-coupons__card-types">
            <span class="mypage-coupons__card-type">{{ coupon.couponTypeText }}</span>
          </div>

          <!-- 조건 정보 -->
          <div class="mypage-coupons__card-conditions">
            <span v-if="coupon.minOrderAmount > 0" class="mypage-coupons__card-condition">
              {{ pageData.list.minOrderLabel || '최소주문' }} {{ coupon.minOrderText }}
            </span>
            <span v-if="coupon.maxDiscountAmount > 0" class="mypage-coupons__card-condition">
              {{ coupon.maxDiscountText }}
            </span>
          </div>

          <div class="mypage-coupons__card-footer">
            <span
              class="mypage-coupons__card-expiry"
              :class="{ 'mypage-coupons__card-expiry--soon': coupon.isExpiringSoon }"
            >
              <template v-if="coupon.dDay && coupon.status === 'AVAILABLE'">
                {{ coupon.dDay }}
              </template>
              <template v-else>
                {{ coupon.endDateText }}{{ pageData.list.validUntil }}
              </template>
            </span>
          </div>
        </div>
      </article>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="mypage-coupons__empty">
      <p class="mypage-coupons__empty-title">{{ pageData.empty.title }}</p>
      <p class="mypage-coupons__empty-desc">{{ pageData.empty.description }}</p>
    </div>

    <!-- 쿠폰 상세 모달 -->
    <BaseModal
      v-model="showDetailModal"
      :title="pageData.modal.title"
      size="medium"
      @close="closeDetail"
    >
      <div v-if="selectedCoupon" class="coupon-detail">
        <!-- 헤더 -->
        <div class="coupon-detail__header">
          <div class="coupon-detail__discount">
            <span class="coupon-detail__discount-value">{{ selectedCoupon.discountText }}</span>
            <span class="coupon-detail__discount-type">{{ common.discount }}</span>
          </div>
          <div class="coupon-detail__info">
            <h3 class="coupon-detail__name">{{ selectedCoupon.name }}</h3>
            <span
              class="coupon-detail__badge"
              :class="`coupon-detail__badge${getStatusClass(selectedCoupon.status)}`"
            >
              {{ getStatusText(selectedCoupon.status) }}
            </span>
          </div>
        </div>

        <!-- 쿠폰 설명 -->
        <div v-if="selectedCoupon.description" class="coupon-detail__description">
          {{ selectedCoupon.description }}
        </div>

        <!-- 쿠폰 정보 -->
        <div class="coupon-detail__section">
          <h4 class="coupon-detail__section-title">{{ modalLabels.usageConditions }}</h4>

          <div class="coupon-detail__row">
            <span class="coupon-detail__label">{{ modalLabels.couponType }}</span>
            <span class="coupon-detail__value">{{ selectedCoupon.couponTypeText }}</span>
          </div>

          <div class="coupon-detail__row">
            <span class="coupon-detail__label">{{ modalLabels.minOrderAmount }}</span>
            <span class="coupon-detail__value">
              {{ selectedCoupon.minOrderAmount > 0 ? selectedCoupon.minOrderText + ' 이상' : '제한 없음' }}
            </span>
          </div>

          <div class="coupon-detail__row">
            <span class="coupon-detail__label">{{ modalLabels.maxDiscountAmount }}</span>
            <span class="coupon-detail__value">
              {{ selectedCoupon.maxDiscountAmount > 0 ? selectedCoupon.maxDiscountText : '제한 없음' }}
            </span>
          </div>

          <div class="coupon-detail__row">
            <span class="coupon-detail__label">{{ modalLabels.stackable }}</span>
            <span class="coupon-detail__value">{{ getStackableText(selectedCoupon.allowPromotionOverlap) }}</span>
          </div>

          <div class="coupon-detail__row">
            <span class="coupon-detail__label">{{ modalLabels.target }}</span>
            <span class="coupon-detail__value">{{ selectedCoupon.target }}</span>
          </div>
        </div>

        <!-- 기간 정보 -->
        <div class="coupon-detail__section">
          <h4 class="coupon-detail__section-title">{{ modalLabels.validPeriod }}</h4>

          <div class="coupon-detail__row">
            <span class="coupon-detail__label">{{ modalLabels.downloadedAt }}</span>
            <span class="coupon-detail__value">{{ selectedCoupon.downloadedAtText }}</span>
          </div>

          <div class="coupon-detail__row">
            <span class="coupon-detail__label">{{ modalLabels.expiredAt }}</span>
            <span class="coupon-detail__value">{{ selectedCoupon.expiredAtText }}</span>
          </div>

          <div v-if="selectedCoupon.usedAtText" class="coupon-detail__row">
            <span class="coupon-detail__label">{{ modalLabels.usedAt }}</span>
            <span class="coupon-detail__value">{{ selectedCoupon.usedAtText }}</span>
          </div>
        </div>

        <!-- 유의사항 -->
        <div v-if="selectedCoupon.notice" class="coupon-detail__section">
          <h4 class="coupon-detail__section-title">{{ modalLabels.notice }}</h4>
          <p class="coupon-detail__notice">{{ selectedCoupon.notice }}</p>
        </div>

        <!-- 액션 버튼 -->
        <div v-if="selectedCoupon.status === 'AVAILABLE'" class="coupon-detail__actions">
          <BaseButton
            :label="modalLabels.viewProducts"
            variant="bg"
            color="green"
            size="big"
            full-width
            @click="goToProducts"
          />
        </div>
      </div>
    </BaseModal>
  </section>
</template>
