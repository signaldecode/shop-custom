<script setup>
import mainData from '~/data/main.json'

useHead({ title: '상품 목록' })
useSeoMeta({
  title: '상품 목록',
  description: '다양한 상품을 만나보세요.'
})
</script>

<template>
  <div class="page-products">
    <main class="products-page">
      <h1 class="products-page__title">상품 목록</h1>
      <p class="products-page__description">준비 중입니다.</p>
    </main>

    <Footer :data="mainData.footer" />
  </div>
</template>
