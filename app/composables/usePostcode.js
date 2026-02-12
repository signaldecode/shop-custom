import addressData from '~/data/address.json'

/**
 * Postcode Composable
 * 다음(카카오) 우편번호 검색 API (embed 방식)
 */
export const usePostcode = () => {
  const isLoaded = ref(false)
  const isLoading = ref(false)

  /**
   * 다음 주소 API 스크립트 로드
   */
  const loadScript = () => {
    return new Promise((resolve, reject) => {
      if (window.daum?.Postcode) {
        isLoaded.value = true
        resolve()
        return
      }

      if (isLoading.value) {
        const checkLoaded = setInterval(() => {
          if (window.daum?.Postcode) {
            clearInterval(checkLoaded)
            isLoaded.value = true
            resolve()
          }
        }, 100)
        return
      }

      isLoading.value = true

      const script = document.createElement('script')
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
      script.async = true

      script.onload = () => {
        isLoaded.value = true
        isLoading.value = false
        resolve()
      }

      script.onerror = () => {
        isLoading.value = false
        reject(new Error('Failed to load Daum Postcode script'))
      }

      document.head.appendChild(script)
    })
  }

  /**
   * 오버레이 생성
   */
  const createOverlay = () => {
    const overlay = document.createElement('div')
    overlay.className = 'postcode-overlay'

    const wrap = document.createElement('div')
    wrap.className = 'postcode-overlay__wrap'

    const header = document.createElement('div')
    header.className = 'postcode-overlay__header'

    const title = document.createElement('span')
    title.className = 'postcode-overlay__title'
    title.textContent = addressData.postcode.title

    const closeBtn = document.createElement('button')
    closeBtn.className = 'postcode-overlay__close'
    closeBtn.type = 'button'
    closeBtn.setAttribute('aria-label', addressData.ariaLabels.closePostcode)
    closeBtn.innerHTML = '&times;'

    header.appendChild(title)
    header.appendChild(closeBtn)

    const container = document.createElement('div')
    container.className = 'postcode-overlay__container'

    wrap.appendChild(header)
    wrap.appendChild(container)
    overlay.appendChild(wrap)
    document.body.appendChild(overlay)

    requestAnimationFrame(() => {
      overlay.classList.add('postcode-overlay--active')
    })

    return { overlay, container, closeBtn }
  }

  /**
   * 오버레이 제거
   */
  const removeOverlay = (overlay) => {
    overlay.classList.remove('postcode-overlay--active')
    overlay.addEventListener('transitionend', () => {
      overlay.remove()
    }, { once: true })

    setTimeout(() => {
      if (overlay.parentNode) overlay.remove()
    }, 300)
  }

  /**
   * 주소 검색 열기 (embed 방식)
   * @param {Function} onComplete - 주소 선택 완료 콜백
   * @returns {Promise<Object>} - { zonecode, address, buildingName }
   */
  const openPostcode = async (onComplete) => {
    await loadScript()

    return new Promise((resolve) => {
      const { overlay, container, closeBtn } = createOverlay()

      const cleanup = () => removeOverlay(overlay)

      closeBtn.addEventListener('click', cleanup)
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cleanup()
      })

      new window.daum.Postcode({
        oncomplete: (data) => {
          const result = {
            zonecode: data.zonecode,
            address: data.roadAddress || data.jibunAddress,
            buildingName: data.buildingName || ''
          }

          if (onComplete) {
            onComplete(result)
          }

          cleanup()
          resolve(result)
        },
        width: '100%',
        height: '100%'
      }).embed(container)
    })
  }

  return {
    isLoaded: readonly(isLoaded),
    openPostcode
  }
}
