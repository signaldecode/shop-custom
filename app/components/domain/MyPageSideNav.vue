<script setup>
import uiData from '~/data/ui.json'

const mypageLabels = uiData.mypage

const props = defineProps({
  activeItemId: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  groups: {
    type: Array,
    required: true,
  },
  defaultOpenGroupId: {
    type: String,
    default: "",
  },
});

const openGroupId = ref(
  props.defaultOpenGroupId || (props.groups?.[0]?.id ?? ""),
);

// activeItemId가 변경되면 해당 그룹 자동 오픈
watch(
  () => props.activeItemId,
  (newId) => {
    if (!newId) return;
    const group = props.groups.find((g) =>
      g.items.some((item) => item.id === newId),
    );
    if (group) openGroupId.value = group.id;
  },
  { immediate: true },
);

const toggleGroup = (groupId) => {
  openGroupId.value = openGroupId.value === groupId ? "" : groupId;
};

const isOpen = (groupId) => openGroupId.value === groupId;
const isActive = (itemId) => props.activeItemId === itemId;
const titleText = computed(() => props.title || mypageLabels.title);
</script>

<template>
  <nav class="mypage-side-tabs" :aria-label="mypageLabels.sideMenuAriaLabel">
    <h2 class="mypage-side-tabs__title">{{ titleText }}</h2>

    <div class="mypage-side-tabs__groups">
      <section
        v-for="group in groups"
        :key="group.id"
        class="mypage-side-tabs__group"
      >
        <button
          type="button"
          class="mypage-side-tabs__group-toggle"
          :aria-expanded="isOpen(group.id) ? 'true' : 'false'"
          @click="toggleGroup(group.id)"
        >
          <div class="mypage-side-tabs__group-left">
            <span
              v-if="group.icon"
              class="mypage-side-tabs__group-icon"
              aria-hidden="true"
            >
              <component :is="group.icon" size="md" decorative />
            </span>
            <p class="mypage-side-tabs__group-label">{{ group.label }}</p>
          </div>
          <span
            class="mypage-side-tabs__chevron"
            :class="{ 'mypage-side-tabs__chevron--open': isOpen(group.id) }"
            aria-hidden="true"
          >
            <IconArrow direction="down" size="md" color="default" decorative />
          </span>
        </button>

        <div v-if="isOpen(group.id)" class="mypage-side-tabs__items">
          <template v-for="item in group.items" :key="item.id">
            <NuxtLink
              v-if="!item.disabled"
              :to="item.href"
              class="mypage-side-tabs__item-btn"
              :class="{
                'mypage-side-tabs__item-btn--active': isActive(item.id),
              }"
            >
              {{ item.label }}
            </NuxtLink>
            <span
              v-else
              class="mypage-side-tabs__item-btn mypage-side-tabs__item-btn--disabled"
            >
              {{ item.label }}
            </span>
          </template>
        </div>
      </section>
    </div>
  </nav>
</template>
