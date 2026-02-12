/**
 * Banner Composable
 * 배너 관련 API 호출
 */
export const useBanner = () => {
  const { useApiData } = useApi()

  /**
   * API 응답을 SectionHero 컴포넌트 형식으로 변환
   */
  const transformToSlides = (banners) => {
    if (!banners || !Array.isArray(banners)) return []
    return banners.map(banner => ({
      image: banner.imageUrl,
      imageAlt: banner.name,
      title: banner.name,
      linkUrl: banner.linkUrl,
      linkTarget: banner.linkTarget
    }))
  }

  /**
   * Hero 배너 조회
   */
  const getHeroBanners = async () => {
    const { data, error } = await useApiData('hero-banners', '/banners', { position: 'hero' })
    const slides = computed(() => transformToSlides(data.value?.data))
    return { slides, error }
  }

  /**
   * 메인 상단 배너 조회
   */
  const getMainTopBanners = async () => {
    const { data, error } = await useApiData('main-top-banners', '/banners', { position: 'main_top' })
    const slides = computed(() => transformToSlides(data.value?.data))
    return { slides, error }
  }

  return {
    getHeroBanners,
    getMainTopBanners
  }
}
