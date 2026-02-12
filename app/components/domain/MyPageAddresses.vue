<script setup>
import mypageData from '~/data/mypage.json'

const pageData = mypageData.pages.addresses
const labels = pageData.labels

const { transformedAddresses, pending, error, fetchAddresses, addAddress, updateAddress, setDefaultAddress, deleteAddress } = useAddress()
const { success: toastSuccess, error: toastError } = useToast()

onMounted(() => {
  fetchAddresses()
})

// 모달 상태
const showModal = ref(false)
const editTarget = ref(null)

// 배송지 추가 모달 열기
const openAddModal = () => {
  editTarget.value = null
  showModal.value = true
}

// 배송지 수정 모달 열기
const openEditModal = (addr) => {
  editTarget.value = addr
  showModal.value = true
}

// 모달 저장 처리
const handleSaved = async ({ id, isEdit, payload }) => {
  try {
    if (isEdit) {
      await updateAddress(id, payload)
      toastSuccess(labels.editSuccess)
    } else {
      await addAddress(payload)
      toastSuccess(labels.addSuccess)
    }
  } catch (e) {
    toastError(isEdit ? labels.editError : labels.addError)
  }
}

// 기본 배송지 설정
const handleSetDefault = async (addressId) => {
  try {
    await setDefaultAddress(addressId)
    toastSuccess(labels.setDefaultSuccess)
  } catch (e) {
    toastError(labels.setDefaultError)
  }
}

// 배송지 삭제
const handleDelete = async (addressId) => {
  if (!confirm(labels.deleteConfirm)) return
  try {
    await deleteAddress(addressId)
    toastSuccess(labels.deleteSuccess)
  } catch (e) {
    toastError(labels.deleteError)
  }
}

// 주소 포맷팅
const formatAddress = (addr) => {
  return `${addr.address} ${addr.addressDetail || ''}`.trim()
}
</script>

<template>
  <section class="mypage-addresses" :aria-label="pageData.title">
    <header class="mypage-addresses__header">
      <h2 class="mypage-addresses__title">{{ pageData.title }}</h2>
      <BaseButton
        :label="labels.addButton"
        type="button"
        variant="bg"
        color="green"
        size="small"
        @click="openAddModal"
      />
    </header>

    <!-- 로딩 -->
    <div v-if="pending" class="mypage-addresses__loading">
      <BaseSpinner size="large" :label="pageData.loading" />
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="mypage-addresses__error">
      {{ error }}
    </div>

    <!-- 빈 상태 -->
    <BaseEmpty
      v-else-if="transformedAddresses.length === 0"
      :message="pageData.empty"
      icon="list"
    />

    <!-- 배송지 목록 -->
    <ul v-else class="mypage-addresses__list">
      <li
        v-for="addr in transformedAddresses"
        :key="addr.id"
        class="mypage-addresses__item"
      >
        <div class="mypage-addresses__info">
          <div class="mypage-addresses__name-wrap">
            <span class="mypage-addresses__name">{{ addr.name }}</span>
            <BaseBadge
              v-if="addr.isDefault"
              :label="labels.defaultBadge"
              variant="primary"
              size="sm"
            />
          </div>
          <p class="mypage-addresses__recipient">
            {{ addr.recipient }} · {{ addr.phone }}
          </p>
          <p class="mypage-addresses__address">
            [{{ addr.zipcode }}] {{ formatAddress(addr) }}
          </p>
        </div>
        <div class="mypage-addresses__actions">
          <BaseButton
            v-if="!addr.isDefault"
            :label="labels.setDefault"
            type="button"
            variant="line"
            color="black"
            size="small"
            @click="handleSetDefault(addr.id)"
          />
          <BaseButton
            :label="labels.editButton"
            type="button"
            variant="line"
            color="black"
            size="small"
            @click="openEditModal(addr)"
          />
          <BaseButton
            :label="labels.delete"
            type="button"
            variant="ghost"
            color="black"
            size="small"
            @click="handleDelete(addr.id)"
          />
        </div>
      </li>
    </ul>

    <!-- 등록/수정 모달 -->
    <AddressFormModal
      v-model="showModal"
      :address="editTarget"
      @saved="handleSaved"
    />
  </section>
</template>
