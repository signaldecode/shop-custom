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
  defaultActiveItemId: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:active-item-id", "select"]);

const openGroupId = ref(
  props.defaultOpenGroupId || (props.groups?.[0]?.id ?? ""),
);
const localActiveItemId = ref(props.activeItemId || props.defaultActiveItemId);

watch(
  () => props.activeItemId,
  (val) => {
    if (typeof val === "string") localActiveItemId.value = val;
  },
);

const toggleGroup = (groupId) => {
  openGroupId.value = openGroupId.value === groupId ? "" : groupId;
};

const selectItem = (item) => {
  localActiveItemId.value = item.id;
  emit("update:active-item-id", item.id);
  emit("select", item);
};

const isOpen = (groupId) => openGroupId.value === groupId;
const isActive = (itemId) => localActiveItemId.value === itemId;
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
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            class="mypage-side-tabs__item-btn"
            :class="{ 'mypage-side-tabs__item-btn--active': isActive(item.id) }"
            @click="selectItem(item)"
          >
            {{ item.label }}
          </button>
        </div>
      </section>
    </div>
  </nav>
</template>
