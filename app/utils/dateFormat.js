/**
 * 날짜/시간 포맷 유틸리티
 */

/**
 * 날짜를 "YYYY년 M월 D일" 형식으로 변환
 * @param {string|Date} dateInput - 날짜 문자열 또는 Date 객체
 * @returns {string} 포맷된 날짜 문자열
 */
export const formatDateKorean = (dateInput) => {
  if (!dateInput) return ''
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}년 ${month}월 ${day}일`
}

/**
 * 날짜/시간을 "YYYY년 M월 D일 HH시 MM분" 형식으로 변환
 * @param {string|Date} dateInput - 날짜 문자열 또는 Date 객체
 * @returns {string} 포맷된 날짜/시간 문자열
 */
export const formatDateTimeKorean = (dateInput) => {
  if (!dateInput) return ''
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`
}

/**
 * 날짜를 "YYYY.MM.DD" 형식으로 변환
 * @param {string|Date} dateInput - 날짜 문자열 또는 Date 객체
 * @returns {string} 포맷된 날짜 문자열
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return ''
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

/**
 * 날짜/시간을 "YYYY.MM.DD HH:mm" 형식으로 변환
 * @param {string|Date} dateInput - 날짜 문자열 또는 Date 객체
 * @returns {string} 포맷된 날짜/시간 문자열
 */
export const formatDateTime = (dateInput) => {
  if (!dateInput) return ''
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}.${month}.${day} ${hours}:${minutes}`
}

/**
 * D-Day 계산
 * @param {string|Date} endDateInput - 종료 날짜
 * @returns {string|null} D-Day 문자열 또는 null
 */
export const getDDay = (endDateInput) => {
  if (!endDateInput) return null
  const now = new Date()
  const endDate = typeof endDateInput === 'string' ? new Date(endDateInput) : endDateInput
  if (isNaN(endDate.getTime())) return null

  const diff = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
  if (diff < 0) return null
  if (diff === 0) return 'D-Day'
  return `D-${diff}`
}
