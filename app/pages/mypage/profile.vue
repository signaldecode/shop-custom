<script setup>
import mypageData from '~/data/mypage.json'

definePageMeta({
  layout: 'mypage'
})

useHead({ title: mypageData.pages.profile.seo.title })
useSeoMeta({
  title: mypageData.pages.profile.seo.title,
  description: mypageData.pages.profile.seo.description
})
</script>

<template>
  <div>
    <MyPageProfileEdit />
  </div>
</template>
