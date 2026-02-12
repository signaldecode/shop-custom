<script setup>
import mainData from '~/data/main.json'
import noticesData from '~/data/notices.json'

const route = useRoute()
const noticeId = computed(() => route.params.id)

// API 연동
const { notice, pending, error, fetchNotice } = useNotices()

// SEO
useHead({ title: () => notice.value?.title
  ? `${notice.value.title} | ${noticesData.seo.title}`
  : noticesData.seo.title })
useSeoMeta({
  title: () => notice.value?.title
    ? `${notice.value.title} | ${noticesData.seo.title}`
    : noticesData.seo.title,
  description: () => notice.value?.content?.slice(0, 160) || noticesData.seo.description
})

// 공지사항 상세 조회
const loadNotice = async () => {
  try {
    await fetchNotice(noticeId.value)
  } catch (e) {
    console.error('Failed to load notice:', e)
  }
}

// 목록으로 돌아가기
const goBack = () => {
  navigateTo('/notice')
}

// 초기 로드
onMounted(() => {
  if (noticeId.value) {
    loadNotice()
  }
})

// ID 변경 시 재로드
watch(noticeId, (newId) => {
  if (newId) {
    loadNotice()
  }
})

const labels = noticesData.detail
</script>

<template>
  <div class="page-notice-detail">
    <main class="notice-detail-page">
      <div class="notice-detail-page__inner">
        <!-- 로딩 -->
        <div v-if="pending" class="notice-detail-page__loading">
          <BaseSpinner />
        </div>

        <!-- 에러 -->
        <BaseEmpty v-else-if="error || !notice" :message="error || noticesData.empty.message" />

        <!-- 상세 내용 -->
        <article v-else class="notice-detail">
          <header class="notice-detail__header">
            <div class="notice-detail__badges">
              <span
                v-if="notice.isPinned"
                class="notice-detail__badge notice-detail__badge--pinned"
              >
                {{ noticesData.list.pinnedLabel }}
              </span>
              <span class="notice-detail__badge notice-detail__badge--type">
                {{ notice.typeDescription }}
              </span>
            </div>
            <h1 class="notice-detail__title">{{ notice.title }}</h1>
            <div class="notice-detail__meta">
              <span class="notice-detail__date">{{ notice.date }}</span>
              <span class="notice-detail__views">
                {{ labels.viewCountLabel }} {{ notice.viewCount }}{{ labels.viewCountSuffix }}
              </span>
            </div>
          </header>

          <div class="notice-detail__content" v-html="notice.content" />

          <footer class="notice-detail__footer">
            <BaseButton
              :label="labels.backButton"
              variant="line"
              color="black"
              @click="goBack"
            />
          </footer>
        </article>
      </div>
    </main>

    <Footer :data="mainData.footer" />
  </div>
</template>
