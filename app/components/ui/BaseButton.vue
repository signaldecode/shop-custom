<script setup>
const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'button',
    validator: (v) => ['button', 'submit', 'reset'].includes(v)
  },
  variant: {
    type: String,
    default: 'line',
    validator: (v) => ['line', 'bg', 'outline', 'primary', 'ghost'].includes(v)
  },
  color: {
    type: String,
    default: 'black',
    validator: (v) => ['white', 'black', 'green', 'light'].includes(v)
  },
  size: {
    type: String,
    default: 'big',
    validator: (v) => ['small', 'big', 'sm', 'md', 'lg'].includes(v)
  },
  full: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  href: {
    type: String,
    default: null
  },
  to: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['click'])

const componentTag = computed(() => {
  if (props.to) return resolveComponent('NuxtLink')
  if (props.href) return 'a'
  return 'button'
})

const componentAttrs = computed(() => {
  if (props.to) {
    return { to: props.to }
  }
  if (props.href) {
    return { href: props.href }
  }
  return { type: props.type, disabled: props.disabled }
})

const buttonClasses = computed(() => [
  'base-button',
  `base-button--style-${props.variant}`,
  `base-button--color-${props.color}`,
  `base-button--size-${props.size}`,
  { 'base-button--full': props.full }
])

const handleClick = (e) => {
  if (!props.disabled) {
    emit('click', e)
  }
}
</script>

<template>
  <component
    :is="componentTag"
    :class="buttonClasses"
    v-bind="componentAttrs"
    @click="handleClick"
  >
    <slot>{{ label }}</slot>
  </component>
</template>
