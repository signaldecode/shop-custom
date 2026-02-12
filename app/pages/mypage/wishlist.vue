<script setup>
import mypageData from '~/data/mypage.json'

definePageMeta({
  layout: 'mypage'
})

useHead({ title: mypageData.pages.wishlist.seo.title })
useSeoMeta({
  title: mypageData.pages.wishlist.seo.title,
  description: mypageData.pages.wishlist.seo.description
})

const wishlistLabels = mypageData.pages.wishlist
</script>

<template>
  <div>
    <MyPageWishlist :labels="wishlistLabels" />
  </div>
</template>
