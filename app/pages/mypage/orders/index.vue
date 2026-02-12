<script setup>
import mypageData from '~/data/mypage.json'

definePageMeta({
  layout: 'mypage'
})

useHead({ title: mypageData.pages.orders.seo.title })
useSeoMeta({
  title: mypageData.pages.orders.seo.title,
  description: mypageData.pages.orders.seo.description
})

const router = useRouter()

const handleSelectOrder = (order) => {
  if (order.id) {
    router.push(`/mypage/orders/${order.id}`)
  } else if (order.orderNumber) {
    router.push(`/mypage/orders/${order.orderNumber}?type=number`)
  }
}
</script>

<template>
  <MyPageOrders
    :title="mypageData.pages.orders.title"
    :subtitle="mypageData.pages.orders.subtitle"
    :labels="{
      loading: mypageData.pages.orders.loading,
      empty: mypageData.pages.orders.empty
    }"
    @select-order="handleSelectOrder"
  />
</template>
