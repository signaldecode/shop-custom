/**
 * 적립금 관리 API composable
 * GET /users/points          - 적립금 잔액 조회
 * GET /users/points/history  - 적립금 내역 조회
 */

// 더미 데이터
const DUMMY_BALANCE = 15000;

const DUMMY_HISTORY = [
  {
    id: 1,
    createdAt: "2025-02-01T10:30:00",
    description: "상품 구매 적립 (주문번호: ORD20250201001)",
    amount: 3000,
    status: "EARNED",
  },
  {
    id: 2,
    createdAt: "2025-01-28T14:20:00",
    description: "적립금 사용 (주문번호: ORD20250128002)",
    amount: -5000,
    status: "USED",
  },
  {
    id: 3,
    createdAt: "2025-01-15T09:00:00",
    description: "회원가입 축하 적립금",
    amount: 10000,
    status: "EARNED",
  },
  {
    id: 4,
    createdAt: "2025-01-10T16:45:00",
    description: "리뷰 작성 적립",
    amount: 500,
    status: "EARNED",
  },
  {
    id: 5,
    createdAt: "2024-12-25T12:00:00",
    description: "크리스마스 이벤트 적립금",
    amount: 5000,
    status: "EARNED",
  },
  {
    id: 6,
    createdAt: "2024-12-20T11:30:00",
    description: "주문 취소로 인한 적립금 취소",
    amount: -1500,
    status: "CANCELLED",
  },
  {
    id: 7,
    createdAt: "2024-11-30T23:59:59",
    description: "유효기간 만료 소멸",
    amount: -2000,
    status: "EXPIRED",
  },
];

export const usePoints = () => {
  const { get } = useApi();

  const balance = ref(0);
  const history = ref([]);
  const pending = ref(false);
  const error = ref(null);

  /**
   * 적립금 잔액 조회
   */
  const fetchBalance = async () => {
    pending.value = true
    error.value = null

    // TODO: API 연동 시 주석 해제
    // try {
    //   const response = await get('/users/points')
    //   balance.value = response.data?.balance ?? response.balance ?? response ?? 0
    //   return balance.value
    // } catch (e) {
    //   balance.value = DUMMY_BALANCE
    //   console.error('Failed to fetch points balance, using dummy data:', e)
    //   return balance.value
    // } finally {
    //   pending.value = false
    // }

    // 더미 데이터 사용
    balance.value = DUMMY_BALANCE
    pending.value = false
    return balance.value
  }

  /**
   * 적립금 내역 조회
   * @param {object} params - 조회 파라미터
   * @param {string} params.period - 기간 필터 (all, 1month, 3months, 6months, 1year)
   */
  const fetchHistory = async (params = {}) => {
    pending.value = true
    error.value = null

    // TODO: API 연동 시 주석 해제
    // try {
    //   const queryParams = {}
    //
    //   // 기간 필터 적용
    //   if (params.period && params.period !== 'all') {
    //     const now = new Date()
    //     let startDate = new Date()
    //
    //     switch (params.period) {
    //       case '1month':
    //         startDate.setMonth(now.getMonth() - 1)
    //         break
    //       case '3months':
    //         startDate.setMonth(now.getMonth() - 3)
    //         break
    //       case '6months':
    //         startDate.setMonth(now.getMonth() - 6)
    //         break
    //       case '1year':
    //         startDate.setFullYear(now.getFullYear() - 1)
    //         break
    //     }
    //
    //     queryParams.startDate = startDate.toISOString().split('T')[0]
    //     queryParams.endDate = now.toISOString().split('T')[0]
    //   }
    //
    //   const response = await get('/users/points/history', queryParams)
    //   history.value = response.data || response || []
    //   return history.value
    // } catch (e) {
    //   history.value = DUMMY_HISTORY
    //   console.error('Failed to fetch points history, using dummy data:', e)
    //   return history.value
    // } finally {
    //   pending.value = false
    // }

    // 더미 데이터 사용
    history.value = DUMMY_HISTORY
    pending.value = false
    return history.value
  }

  /**
   * 날짜 포맷
   */
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  /**
   * 적립금 내역 변환
   */
  const transformHistory = (item) => ({
    id: item.id,
    date: formatDate(item.createdAt || item.date),
    description: item.description || item.reason || "-",
    amount: item.amount || 0,
    amountText: `${item.amount > 0 ? "+" : ""}${Number(item.amount).toLocaleString()}P`,
    status: item.status || item.type || "EARNED",
    isPositive: item.amount > 0,
  });

  /**
   * 변환된 적립금 내역
   */
  const transformedHistory = computed(() => {
    return history.value.map(transformHistory);
  });

  return {
    // 상태
    balance,
    history,
    transformedHistory,
    pending,
    error,
    // 메서드
    fetchBalance,
    fetchHistory,
    transformHistory,
  };
};
