<script setup>
import mainData from '~/data/main.json'

// shop-info에서 SEO 정보 가져오기
const { seoInfo, shopName } = useShopInfo()

// SEO (API 우선, JSON fallback)
useHead({ title: () => seoInfo.value?.title || shopName.value || mainData.seo.title })
useSeoMeta({
  title: () => seoInfo.value?.title || shopName.value || mainData.seo.title,
  description: () => seoInfo.value?.description || '',
  ogTitle: () => seoInfo.value?.title || shopName.value || mainData.seo.title,
  ogDescription: () => seoInfo.value?.description || '',
  ogImage: () => seoInfo.value?.ogImage || mainData.seo.ogImage
})

// 메인 페이지 API 데이터
const {
  heroBanners,
  slideBanners: apiSlideBanners,
  halfBanners: apiHalfBanners,
  fullBanners: apiFullBanners,
  bannerPending,
  pending: mainPending,
  categories,
  bestProducts: apiBestProducts,
  recommendProducts: apiRecommendProducts
} = useMain()

// 배너 로딩 상태
const showBannerLoading = computed(() => bannerPending.value)

// Hero 슬라이드 (API only)
const heroSlides = computed(() => heroBanners.value || [])

// 카테고리 (API 또는 JSON 폴백)
const categoryItems = computed(() =>
  categories.value?.length ? categories.value : mainData.categories.items
)

// Best 상품 (API 로딩 중이면 빈 배열, 완료 후 API 데이터 또는 JSON 폴백)
const bestProducts = computed(() => {
  if (mainPending.value) return []
  return apiBestProducts.value?.length ? apiBestProducts.value : mainData.bestItems.products
})

// 추천 상품 (API 로딩 중이면 빈 배열, 완료 후 API 데이터 또는 JSON 폴백)
const mdPickProducts = computed(() => {
  if (mainPending.value) return []
  return apiRecommendProducts.value?.length ? apiRecommendProducts.value : mainData.mdPick.products
})

// 카테고리별 상품 폴백 (API 실패 시)
const fallbackCategoryProducts = computed(() => {
  const combined = [...(apiBestProducts.value || []), ...(apiRecommendProducts.value || [])]
  return combined.length ? combined : mainData.categoryItems.products
})

// 슬라이드 배너 (API only)
const slideBanners = computed(() => apiSlideBanners.value || [])

// Half 배너 (API only)
const halfBanners = computed(() => apiHalfBanners.value || [])

// Full 배너 (API only)
const fullBanner = computed(() => apiFullBanners.value?.[0] || null)

// 팝업
const { centerPopups, floatingPopups, fetchPopups, dismissPopup } = usePopup()

onMounted(() => {
  fetchPopups()
})
</script>

<template>
  <div class="page-main">
    <!-- Hero 배너 (클라이언트 전용 - 배너 API가 server: false) -->
    <ClientOnly>
      <div v-if="showBannerLoading" class="page-main__loading">
        <BaseSpinner />
      </div>
      <div v-else class="page-main__hero-wrap">
        <SectionHero
          v-if="heroSlides.length"
          :data="mainData.hero"
          :slides="heroSlides"
        />
      </div>
      <template #fallback>
        <div class="page-main__loading">
          <BaseSpinner />
        </div>
      </template>
    </ClientOnly>

    <main>
        <SectionCategories
          :data="mainData.categories"
          :categories="categoryItems"
        />

        <SectionBestItems
          :data="mainData.bestItems"
          :products="bestProducts"
          :loading="mainPending"
        />

        <SectionMdPick
          :data="mainData.mdPick"
          :products="mdPickProducts"
          :loading="mainPending"
        />

        <!-- Full 배너 (클라이언트 전용) -->
        <ClientOnly>
          <BannerFull v-if="fullBanner" :banner="fullBanner" />
        </ClientOnly>

        <SectionCategoryItems
          :data="mainData.categoryItems"
          :categories="categories"
          :fallback-products="fallbackCategoryProducts"
        />

        <!-- Slide 배너 (클라이언트 전용) -->
        <ClientOnly>
          <BannerSlide
            v-if="slideBanners.length"
            :banners="slideBanners"
            :auto-play="true"
            :interval="5000"
          />
        </ClientOnly>

        <!-- Half 배너 (클라이언트 전용) -->
        <ClientOnly>
          <SectionHalfBanners
            v-if="halfBanners.length"
            :banners="halfBanners"
            :button-label="mainData.banners.halfLabels.buttonLabel"
          />
        </ClientOnly>

        <!-- <SectionInstagram
          :data="mainData.instagram"
          :images="mainData.instagram.items"
        /> -->
      </main>

    <PopupCenter
      :popups="centerPopups"
      @dismiss="dismissPopup"
    />
    <PopupFloating
      :popups="floatingPopups"
      @dismiss="dismissPopup"
    />
  </div>
</template>
