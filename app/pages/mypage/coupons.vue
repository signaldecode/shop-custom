<script setup>
import mypageData from '~/data/mypage.json'

definePageMeta({
  layout: 'mypage'
})

useHead({ title: mypageData.pages.coupons.seo.title })
useSeoMeta({
  title: mypageData.pages.coupons.seo.title,
  description: mypageData.pages.coupons.seo.description
})
</script>

<template>
  <div>
    <MyPageCoupons />
  </div>
</template>
