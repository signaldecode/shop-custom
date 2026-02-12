<script setup>
import uiData from '~/data/ui.json'

const mypageLabels = uiData.mypage

const props = defineProps({
  title: {
    type: String,
    default: '나의 주문내역'
  },
  subtitle: {
    type: String,
    default: '(최근1달내역)'
  },
  labels: {
    type: Object,
    default: () => ({
      loading: '주문 내역을 불러오는 중...',
      empty: '주문 내역이 없습니다.'
    })
  }
})

const emit = defineEmits(['select-order'])

const { getOrders, transformOrderList, pending } = useOrder()

// 주문 목록 상태
const orders = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 20

// 주문 목록 조회
const fetchOrders = async () => {
  try {
    const response = await getOrders({
      page: currentPage.value - 1,
      size: pageSize,
      sort: 'createdAt,DESC'
    })

    const content = response?.content || []
    orders.value = content.map(transformOrderList)
    totalPages.value = response?.totalPages || Math.ceil((response?.total_elements || 0) / pageSize) || 1
  } catch (e) {
    console.warn('Failed to fetch orders:', e)
    orders.value = []
  }
}

// 페이지 변경 시 다시 조회
watch(currentPage, () => {
  fetchOrders()
})

// 초기 로드
onMounted(() => {
  fetchOrders()
})

const handleSelectOrder = (item) => {
  emit('select-order', item)
}
</script>

<template>
  <section class="mypage-orders" :aria-label="mypageLabels.orders">
    <header class="mypage-orders__header">
      <div class="mypage-orders__title-wrap">
        <h2 class="mypage-orders__title">{{ title }}</h2>
        <p class="mypage-orders__subtitle">{{ subtitle }}</p>
      </div>
    </header>

    <div class="mypage-orders__list">
      <div class="mypage-orders__table">
        <div v-if="pending" class="mypage-orders__loading">
          <BaseSpinner />
        </div>
        <BaseEmpty
          v-else-if="orders.length === 0"
          :message="labels.empty"
          icon="list"
        />
        <MyPageOrderRow
          v-for="item in orders"
          v-else
          :key="item.orderNo"
          :order="item.product"
          :order-no="item.orderNo"
          :order-date="item.orderedAt"
          clickable
          @select="handleSelectOrder(item)"
        />
      </div>
    </div>

    <BasePagination
      v-model:current-page="currentPage"
      :total-pages="totalPages"
      class="mypage-orders__pagination"
    />
  </section>
</template>

