<script setup>
import mypageData from '~/data/mypage.json'

definePageMeta({
  layout: 'mypage'
})

useHead({ title: mypageData.pages.points.seo.title })
useSeoMeta({
  title: mypageData.pages.points.seo.title,
  description: mypageData.pages.points.seo.description
})
</script>

<template>
  <div>
    <MyPagePoints />
  </div>
</template>
