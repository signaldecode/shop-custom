<script setup>
import uiData from '~/data/ui.json'

const common = uiData.common

const props = defineProps({
  labels: {
    type: Object,
    required: true
  }
})

const { items, pending, fetchWishlist, removeFromWishlist, clearWishlist } = useWishlist()
const { success, error: showError } = useToast()

// 페이지네이션
const currentPage = ref(1)
const pageSize = 10

const totalPages = computed(() => Math.ceil(items.value.length / pageSize) || 1)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return items.value.slice(start, end)
})

// 위시리스트 조회
onMounted(() => {
  fetchWishlist()
})

// 개별 삭제
const handleDelete = async (item) => {
  try {
    await removeFromWishlist(item.id)
    success(props.labels.messages.deleteSuccess)
  } catch (e) {
    showError(props.labels.messages.deleteError)
  }
}

// 선택 삭제
const handleDeleteSelected = async () => {
  if (selectedIds.value.length === 0) return

  try {
    // 전체 선택된 경우 clearWishlist 사용
    if (selectedIds.value.length === items.value.length) {
      await clearWishlist()
    } else {
      await removeFromWishlist(selectedIds.value)
    }
    selectedIds.value = []
    success(props.labels.messages.deleteSuccess)
  } catch (e) {
    showError(props.labels.messages.deleteError)
  }
}

// 가격 포맷
const formatPrice = (price) => {
  return price?.toLocaleString() || '0'
}

// 체크박스 선택 상태
const selectedIds = ref([])

const isAllSelected = computed(() => {
  if (paginatedItems.value.length === 0) return false
  return paginatedItems.value.every(item => selectedIds.value.includes(item.id))
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // 현재 페이지 아이템만 해제
    const currentIds = paginatedItems.value.map(item => item.id)
    selectedIds.value = selectedIds.value.filter(id => !currentIds.includes(id))
  } else {
    // 현재 페이지 아이템 모두 선택
    const currentIds = paginatedItems.value.map(item => item.id)
    selectedIds.value = [...new Set([...selectedIds.value, ...currentIds])]
  }
}

const toggleSelect = (itemId) => {
  const index = selectedIds.value.indexOf(itemId)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(itemId)
  }
}

const isSelected = (itemId) => selectedIds.value.includes(itemId)
</script>

<template>
  <section class="mypage-wishlist" :aria-label="labels.title">
    <header class="mypage-wishlist__header">
      <h2 class="mypage-wishlist__title">{{ labels.title }}</h2>
    </header>

    <!-- 전체선택 + 선택제품삭제 -->
    <div v-if="items.length > 0" class="mypage-wishlist__toolbar">
      <BaseCheckbox
        :model-value="isAllSelected"
        :label="labels.table.selectAll"
        @update:model-value="toggleSelectAll"
      />
      <button
        v-if="selectedIds.length > 0"
        type="button"
        class="mypage-wishlist__delete-selected-btn"
        @click="handleDeleteSelected"
      >
        {{ labels.buttons.deleteSelected }}
      </button>
    </div>

    <!-- 리스트 -->
    <div class="mypage-wishlist__list">
      <div v-if="pending" class="mypage-wishlist__loading">
        <BaseSpinner />
      </div>

      <BaseEmpty
        v-else-if="items.length === 0"
        :message="labels.empty"
        icon="list"
      />

      <div
        v-for="item in paginatedItems"
        v-else
        :key="item.id"
        class="mypage-wishlist__row"
      >
        <!-- 체크박스 -->
        <div class="mypage-wishlist__col mypage-wishlist__col--checkbox">
          <BaseCheckbox
            :model-value="isSelected(item.id)"
            @update:model-value="toggleSelect(item.id)"
          />
        </div>

        <!-- 상품 정보 -->
        <div class="mypage-wishlist__col mypage-wishlist__col--product">
          <NuxtLink :to="`/products/${item.productId}`" class="mypage-wishlist__product-link">
            <img
              :src="item.imageUrl"
              :alt="item.productName"
              class="mypage-wishlist__product-image"
            />
            <div class="mypage-wishlist__product-info">
              <p class="mypage-wishlist__product-name">{{ item.productName }}</p>
              <p class="mypage-wishlist__product-code">#{{ item.productId }}</p>
              <p class="mypage-wishlist__product-price-inline">
                {{ formatPrice(item.salePrice || item.regularPrice) }}{{ labels.unit.currency }} {{ labels.unit.quantity }}
              </p>
            </div>
          </NuxtLink>
          <!-- 모바일용 X 버튼 -->
          <button
            type="button"
            class="mypage-wishlist__delete-btn mypage-wishlist__delete-btn--mobile"
            :aria-label="common.delete"
            @click="handleDelete(item)"
          >
            <IconClose size="sm" />
          </button>
        </div>

        <!-- 가격 -->
        <div class="mypage-wishlist__col mypage-wishlist__col--price">
          <span class="mypage-wishlist__price">
            {{ formatPrice(item.salePrice || item.regularPrice) }}{{ labels.unit.currency }}
          </span>
        </div>

        <!-- 수량 -->
        <div class="mypage-wishlist__col mypage-wishlist__col--quantity">
          {{ labels.unit.quantity }}
        </div>

        <!-- 삭제 버튼 (데스크탑) -->
        <div class="mypage-wishlist__col mypage-wishlist__col--delete">
          <button
            type="button"
            class="mypage-wishlist__delete-btn mypage-wishlist__delete-btn--desktop"
            :aria-label="common.delete"
            @click="handleDelete(item)"
          >
            <IconClose size="sm" />
          </button>
        </div>
      </div>
    </div>

    <!-- 페이지네이션 -->
    <BasePagination
      v-if="totalPages > 1"
      v-model:current-page="currentPage"
      :total-pages="totalPages"
      class="mypage-wishlist__pagination"
    />
  </section>
</template>
