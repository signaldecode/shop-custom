<script setup>
import mypageData from '~/data/mypage.json'

const props = defineProps({
  reviews: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['detail', 'update:currentPage', 'edit', 'delete'])

const labels = mypageData.pages.reviews.labels
const emptyText = mypageData.pages.reviews.empty

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <div class="mypage-reviews">
    <h2 class="mypage-reviews__title">{{ mypageData.pages.reviews.title }}</h2>

    <!-- 로딩 -->
    <div v-if="loading" class="mypage-reviews__loading">
      <BaseSpinner />
    </div>

    <!-- 빈 상태 -->
    <BaseEmpty v-else-if="!reviews.length" :message="emptyText" />

    <!-- 리뷰 리스트 -->
    <ul v-else class="mypage-reviews__list">
      <li
        v-for="review in reviews"
        :key="review.id"
        class="mypage-reviews__item"
      >
        <div class="mypage-reviews__card">
          <!-- 리뷰 콘텐츠 (클릭 시 리뷰 모달) -->
          <button
            type="button"
            class="mypage-reviews__content-btn"
            @click="emit('detail', review)"
          >
            <!-- 리뷰 이미지 (있으면 상단에 크게) -->
            <div v-if="review.images?.length" class="mypage-reviews__images">
              <NuxtImg
                v-for="(img, idx) in review.images.slice(0, 3)"
                :key="idx"
                :src="img"
                alt=""
                class="mypage-reviews__image"
                loading="lazy"
              />
              <span v-if="review.images.length > 3" class="mypage-reviews__image-more">
                +{{ review.images.length - 3 }}
              </span>
            </div>

            <!-- 리뷰 내용 -->
            <div class="mypage-reviews__content">
              <div class="mypage-reviews__meta">
                <div class="mypage-reviews__rating">
                  <div class="mypage-reviews__stars">
                    <IconStar
                      v-for="i in 5"
                      :key="i"
                      size="sm"
                      :active="i <= (review.rating || 0)"
                    />
                  </div>
                  <span class="mypage-reviews__date">{{ formatDate(review.createdAt) }}</span>
                </div>
                <div class="mypage-reviews__badges">
                  <span v-if="review.isBest" class="mypage-reviews__badge mypage-reviews__badge--best">
                    {{ labels.best }}
                  </span>
                  <span v-if="review.isVerifiedPurchase" class="mypage-reviews__badge mypage-reviews__badge--verified">
                    {{ labels.verified }}
                  </span>
                </div>
              </div>
              <p v-if="review.title" class="mypage-reviews__review-title">{{ review.title }}</p>
              <p class="mypage-reviews__text">{{ review.content }}</p>

              <!-- 도움이 됨 -->
              <div v-if="review.helpfulCount > 0" class="mypage-reviews__helpful">
                <IconThumbUp size="sm" />
                <span>{{ labels.helpful }} {{ review.helpfulCount }}</span>
              </div>

              <!-- 관리자 답변 -->
              <div v-if="review.adminReply" class="mypage-reviews__admin-reply">
                <span class="mypage-reviews__admin-reply-label">{{ labels.adminReply }}</span>
                <p class="mypage-reviews__admin-reply-text">{{ review.adminReply }}</p>
              </div>
            </div>
          </button>

          <!-- 상품 정보 (클릭 시 상품 상세) -->
          <NuxtLink
            :to="review.productId ? `/products/${review.productId}` : ''"
            class="mypage-reviews__product"
          >
            <div class="mypage-reviews__thumb">
              <NuxtImg :src="review.productThumbnailUrl" :alt="review.productName" loading="lazy" />
            </div>
            <div class="mypage-reviews__product-info">
              <p class="mypage-reviews__product-name">{{ review.productName }}</p>
              <p v-if="review.categoryName" class="mypage-reviews__product-option">
                {{ review.categoryName }}
              </p>
            </div>
          </NuxtLink>
        </div>
        <div class="mypage-reviews__actions">
          <button
            type="button"
            class="mypage-reviews__edit-btn"
            @click="emit('edit', review)"
          >
            {{ labels.edit }}
          </button>
          <button
            type="button"
            class="mypage-reviews__delete-btn"
            @click="emit('delete', review)"
          >
            {{ labels.delete }}
          </button>
        </div>
      </li>
    </ul>

    <!-- 페이지네이션 -->
    <BasePagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      @update:current-page="emit('update:currentPage', $event)"
    />
  </div>
</template>
