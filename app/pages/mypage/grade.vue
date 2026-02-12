<script setup>
import mypageData from "~/data/mypage.json";

definePageMeta({
  layout: "mypage"
});

useHead({
  title: mypageData.pages.grade.seo.title,
});
useSeoMeta({
  title: mypageData.pages.grade.seo.title,
  description: mypageData.pages.grade.seo.description,
});
</script>
<template>
  <MyPageGrade />
</template>
