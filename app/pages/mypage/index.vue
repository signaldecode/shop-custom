<script setup>
import mypageData from '~/data/mypage.json'

definePageMeta({
  layout: 'mypage'
})

useHead({ title: mypageData.pages.dashboard.seo.title })
useSeoMeta({
  title: mypageData.pages.dashboard.seo.title,
  description: mypageData.pages.dashboard.seo.description
})

const handleSelectOrder = (order) => {
  // orderId가 있으면 orderId로, 없으면 orderNumber로 조회
  if (order.id) {
    navigateTo(`/mypage/orders/${order.id}`)
  } else if (order.orderNumber || order.orderNo) {
    navigateTo(`/mypage/orders/${order.orderNumber || order.orderNo}?type=number`)
  }
}
</script>

<template>
  <MyPageDashboard
    @go-orders="navigateTo('/mypage/orders')"
    @select-order="handleSelectOrder"
  />
</template>
