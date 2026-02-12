<script setup>
import mypageData from "~/data/mypage.json";
import { IconCoin } from "~/components/ui/icons";

const gradeData = mypageData.pages.grade;
const authStore = useAuthStore();

// 더미 데이터 ( 추후 API 연동 )
const pointsBalance = computed(() => authStore.user?.point?.currentPoint ?? 0);
const expectedPoints = ref(0);
const expiringPoints = ref(0);
const currentGrade = computed(() => authStore.user?.grade?.name ?? "STANDARD");
const currentGradeId = computed(() => authStore.user?.grade?.id ?? "F");
const lastMonthSpent = ref(60000); // 더미
const progressAmount = ref(10000000); // 더미
const progressPercent = computed(() =>
  Math.min(
    (progressAmount.value / gradeData.currentGrade.maxAmount) * 100,
    100,
  ),
);
</script>
<template>
  <section class="mypage-grade">
    <h2 class="mypage-grade__title">{{ gradeData.title }}</h2>

    <!-- 상단 영역: 적립금 요약 + 현재 등급 -->
    <div class="mypage-grade__top">
      <!-- 좌측: 적립금 요약 -->
      <div class="mypage-grade__summary">
        <div class="mypage-grade__summary-header">
          <span class="mypage-grade__summary-label">
            {{ gradeData.summary.pointsLabel }}
            <IconQuestion size="sm" decorative />
          </span>
        </div>
        <div class="mypage-grade__summary-balance">
          <IconCoin size="xl" decorative />
          <span class="mypage-grade__summary-amount">
            {{ pointsBalance.toLocaleString()
            }}{{ gradeData.summary.pointUnit }}
          </span>
        </div>
        <div class="mypage-grade__summary-row">
          <span class="mypage-grade__summary-label">{{
            gradeData.summary.expectedLabel
          }}</span>
          <span class="mypage-grade__summary-value"
            >{{ expectedPoints }}{{ gradeData.summary.unit }}</span
          >
        </div>
        <div class="mypage-grade__summary-row">
          <span class="mypage-grade__summary-label">{{
            gradeData.summary.expiringLabel
          }}</span>
          <span class="mypage-grade__summary-value"
            >{{ expiringPoints }}{{ gradeData.summary.unit }}</span
          >
        </div>
      </div>

      <!-- 우측: 현재 등급 -->
      <div class="mypage-grade__current">
        <div class="mypage-grade__current-header">
          <div class="mypage-grade__current-icon">
            <IconRibbon size="xl" decorative />
          </div>
          <div class="mypage-grade__current-info">
            <span class="mypage-grade__current-name">{{ currentGrade }}</span>
            <p class="mypage-grade__current-text">
              {{ gradeData.currentGrade.prefix
              }}<span class="mypage-grade__current-highlight"
                >{{ lastMonthSpent.toLocaleString()
                }}{{ gradeData.currentGrade.unit }}</span
              >{{ gradeData.currentGrade.suffix }}
            </p>
          </div>
        </div>
        <div class="mypage-grade__progress">
          <p class="mypage-grade__progress-text">
            {{ gradeData.currentGrade.progressMessage }}
          </p>
          <div class="mypage-grade__progress-bar">
            <div
              class="mypage-grade__progress-fill"
              :style="{ width: progressPercent + '%' }"
            />
          </div>
          <div class="mypage-grade__progress-labels">
            <span>{{ gradeData.currentGrade.minLabel }}</span>
            <span>{{ gradeData.currentGrade.maxLabel }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단: 혜택 테이블 -->
    <div class="mypage-grade__benefits">
      <h3 class="mypage-grade__benefits-title">
        {{ gradeData.benefitsTable.title }}
      </h3>
      <table class="mypage-grade__table">
        <thead>
          <tr>
            <th>{{ gradeData.benefitsTable.gradeHeader }}</th>
            <th v-for="grade in gradeData.benefitsTable.grades" :key="grade.id">
              <span
                class="mypage-grade__table-badge"
                :class="[
                  `mypage-grade__table-badge--${grade.color}`,
                  {
                    'mypage-grade__table-badge--active':
                      grade.id === currentGradeId,
                  },
                ]"
              >
                {{ grade.id }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in gradeData.benefitsTable.rows"
            :key="row.id"
            :class="{ 'mypage-grade__table-row--highlight': row.highlight }"
          >
            <td>{{ row.label }}</td>
            <td
              v-for="(value, idx) in row.values"
              :key="idx"
              :class="{ 'mypage-grade__table-cell--highlight': row.highlight }"
            >
              {{ value }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 안내문 -->
    <p class="mypage-grade__notice">{{ gradeData.notice }}</p>
  </section>
</template>
