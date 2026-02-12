<script setup>
import mypageData from '~/data/mypage.json'

definePageMeta({
  layout: 'mypage'
})

useHead({ title: mypageData.pages.addresses.seo.title })
useSeoMeta({
  title: mypageData.pages.addresses.seo.title,
  description: mypageData.pages.addresses.seo.description
})
</script>

<template>
  <div>
    <MyPageAddresses />
  </div>
</template>
