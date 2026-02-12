<script setup>
import mypageData from "~/data/mypage.json";
import { validate as validateField, formatPhoneNumber } from "~/utils/validators";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  // null이면 등록, 객체면 수정
  address: {
    type: Object,
    default: () => null,
  },
});

const emit = defineEmits(["update:modelValue", "saved"]);

const modalData = mypageData.pages.addresses.modal;
const fields = modalData.fields;

const isEdit = computed(() => !!props.address);
const modalTitle = computed(() =>
  isEdit.value ? modalData.editTitle : modalData.addTitle,
);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// 폼 데이터
const form = ref({
  label: "",
  recipientName: "",
  recipientPhone: "",
  postalCode: "",
  address1: "",
  address2: "",
  isDefault: false,
});

const submitting = ref(false);
const validationError = ref("");

// 모달 열릴 때 폼 초기화
watch(isOpen, (open) => {
  if (open) {
    validationError.value = "";
    if (isEdit.value && props.address) {
      form.value = {
        label: props.address.name || "",
        recipientName: props.address.recipient || "",
        recipientPhone: props.address.phone || "",
        postalCode: props.address.zipcode || "",
        address1: props.address.address || "",
        address2: props.address.addressDetail || "",
        isDefault: props.address.isDefault || false,
      };
    } else {
      form.value = {
        label: "",
        recipientName: "",
        recipientPhone: "",
        postalCode: "",
        address1: "",
        address2: "",
        isDefault: false,
      };
    }
  }
});

// 유효성 검사
const validateForm = () => {
  if (
    !form.value.recipientName ||
    !form.value.recipientPhone ||
    !form.value.postalCode ||
    !form.value.address1
  ) {
    validationError.value = modalData.validation.required;
    return false;
  }
  if (!validateField("phone", form.value.recipientPhone)) {
    validationError.value = modalData.validation.phoneInvalid;
    return false;
  }
  validationError.value = "";
  return true;
};

// 저장
const handleSubmit = async () => {
  if (!validateForm()) return;
  submitting.value = true;
  try {
    const payload = { ...form.value };
    emit("saved", {
      id: isEdit.value ? props.address.id : null,
      isEdit: isEdit.value,
      payload,
    });
    isOpen.value = false;
  } finally {
    submitting.value = false;
  }
};

// 휴대폰 입력 핸들러 (자동 하이픈)
const handlePhoneInput = (e) => {
  const value = e.target.value;
  form.value.recipientPhone = formatPhoneNumber(value);
};

// 주소 검색 결과 반영
const handleZipUpdate = (val) => {
  form.value.postalCode = val;
};
const handleAddressUpdate = (val) => {
  form.value.address1 = val;
};
const handleDetailUpdate = (val) => {
  form.value.address2 = val;
};
</script>

<template>
  <BaseModal v-model="isOpen" :title="modalTitle" size="medium">
    <div class="address-form-modal">
      <!-- <div class="address-form-modal__field">
        <BaseInput
          v-model="form.label"
          :label="fields.label"
          :placeholder="fields.labelPlaceholder"
          name="address-label"
        />
      </div> -->

      <div class="address-form-modal__field">
        <BaseInput
          v-model="form.recipientName"
          :label="fields.recipientName"
          :placeholder="fields.recipientNamePlaceholder"
          :required="true"
          name="recipient-name"
          autocomplete="name"
        />
      </div>

      <div class="address-form-modal__field">
        <BaseInput
          :model-value="form.recipientPhone"
          :label="fields.recipientPhone"
          :placeholder="fields.recipientPhonePlaceholder"
          :required="true"
          type="tel"
          name="recipient-phone"
          autocomplete="tel"
          maxlength="13"
          @input="handlePhoneInput"
        />
      </div>

      <div class="address-form-modal__field">
        <label class="address-form-modal__label">{{ fields.address }}</label>
        <AddressInput
          :zip="form.postalCode"
          :address="form.address1"
          :detail="form.address2"
          :required="true"
          @update:zip="handleZipUpdate"
          @update:address="handleAddressUpdate"
          @update:detail="handleDetailUpdate"
        />
      </div>

      <div class="address-form-modal__field">
        <BaseCheckbox
          v-model="form.isDefault"
          :label="fields.isDefault"
          name="is-default"
        />
      </div>

      <p v-if="validationError" class="address-form-modal__error">
        {{ validationError }}
      </p>

      <div class="address-form-modal__buttons">
        <BaseButton
          :label="modalData.buttons.cancel"
          type="button"
          variant="line"
          color="black"
          size="big"
          @click="isOpen = false"
        />
        <BaseButton
          :label="modalData.buttons.submit"
          type="button"
          variant="bg"
          color="green"
          size="big"
          :disabled="submitting"
          @click="handleSubmit"
        />
      </div>
    </div>
  </BaseModal>
</template>
