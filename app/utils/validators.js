/**
 * Validators
 * 폼 입력값 검증 유틸리티
 */

// 정규식 패턴 모음
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  phone: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, // 하이픈 있거나 없거나 모두 허용
  phoneMid: /^[0-9]{3,4}$/,
  phoneLast: /^[0-9]{4}$/,
  name: /^[가-힣a-zA-Z]{2,20}$/,
};

// 에러 메시지 모음
const messages = {
  email: "이메일 형식이 올바르지 않습니다.",
  password: "비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.",
  passwordConfirm: "비밀번호가 일치하지 않습니다.",
  phone: "휴대폰 번호 형식이 올바르지 않습니다.",
  phoneMid: "중간번호는 3~4자리 숫자여야 합니다.",
  phoneLast: "끝번호는 4자리 숫자여야 합니다.",
  name: "이름은 2~20자의 한글 또는 영문이어야 합니다.",
  required: "필수 입력 항목입니다.",
};

/**
 * 단일 필드 검증
 * @param {string} type - 검증 타입 (email, password, phone, name)
 * @param {string} value - 검증할 값
 * @returns {boolean}
 */
export const validate = (type, value) => {
  if (!value) return false;
  const pattern = patterns[type];
  if (!pattern) return true;
  return pattern.test(value);
};

/**
 * 필수값 검증
 * @param {string} value - 검증할 값
 * @returns {boolean}
 */
export const validateRequired = (value) => {
  return (
    value !== null && value !== undefined && value.toString().trim() !== ""
  );
};

/**
 * 비밀번호 확인 검증
 * @param {string} password - 비밀번호
 * @param {string} confirm - 비밀번호 확인
 * @returns {boolean}
 */
export const validatePasswordConfirm = (password, confirm) => {
  return password === confirm;
};

/**
 * 에러 메시지 반환 검증
 * @param {string} type - 검증 타입
 * @param {string} value - 검증할 값
 * @returns {{ valid: boolean, message: string }}
 */
export const validateWithMessage = (type, value) => {
  if (!validateRequired(value)) {
    return { valid: false, message: messages.required };
  }

  const isValid = validate(type, value);
  return {
    valid: isValid,
    message: isValid ? "" : messages[type] || "",
  };
};

/**
 * 폼 전체 검증
 * @param {Object} form - 폼 데이터
 * @param {Object} rules - 검증 규칙 { fieldName: 'type' }
 * @returns {{ valid: boolean, errors: Object }}
 */
export const validateForm = (form, rules) => {
  const errors = {};
  let valid = true;

  for (const [field, type] of Object.entries(rules)) {
    const result = validateWithMessage(type, form[field]);
    if (!result.valid) {
      valid = false;
      errors[field] = result.message;
    }
  }

  return { valid, errors };
};

/**
 * 휴대폰 번호 포맷팅 (자동 하이픈)
 * @param {string} value - 입력값
 * @returns {string} - 포맷팅된 번호 (010-1234-5678)
 */
export const formatPhoneNumber = (value) => {
  if (!value) return '';
  const numbers = value.replace(/[^0-9]/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};
