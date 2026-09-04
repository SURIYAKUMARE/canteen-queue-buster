// Lunch hour 5-minute time buckets from 11:45 AM to 1:30 PM
export const initialForecastBuckets = [
  { time: '11:45', day1: 6, day2: 5, day3: 4, predicted: 5, actual: 5, isPeak: false },
  { time: '11:50', day1: 9, day2: 7, day3: 8, predicted: 8, actual: 7, isPeak: false },
  { time: '11:55', day1: 14, day2: 12, day3: 11, predicted: 13, actual: 12, isPeak: false },
  { time: '12:00', day1: 22, day2: 24, day3: 20, predicted: 22, actual: 21, isPeak: true, surgeReason: 'Period 4 ends (B.Tech classes)' },
  { time: '12:05', day1: 28, day2: 26, day3: 25, predicted: 27, actual: 26, isPeak: true, surgeReason: 'High demand for Veg Thali' },
  { time: '12:10', day1: 32, day2: 30, day3: 31, predicted: 31, actual: 29, isPeak: true, surgeReason: 'Peak Thali & Dosa rush' },
  { time: '12:15', day1: 35, day2: 34, day3: 33, predicted: 34, actual: 36, isPeak: true, surgeReason: 'Daily Maximum Demand' },
  { time: '12:20', day1: 30, day2: 32, day3: 28, predicted: 30, actual: 31, isPeak: true, surgeReason: 'Sandwich & Quick Bites peak' },
  { time: '12:25', day1: 25, day2: 27, day3: 24, predicted: 25, actual: 23, isPeak: false },
  { time: '12:30', day1: 26, day2: 28, day3: 25, predicted: 26, actual: 27, isPeak: true, surgeReason: 'Management / MBA batch break' },
  { time: '12:35', day1: 23, day2: 22, day3: 21, predicted: 22, actual: 20, isPeak: false },
  { time: '12:40', day1: 18, day2: 19, day3: 17, predicted: 18, actual: 19, isPeak: false },
  { time: '12:45', day1: 16, day2: 15, day3: 14, predicted: 15, actual: 14, isPeak: false },
  { time: '12:50', day1: 12, day2: 13, day3: 11, predicted: 12, actual: 11, isPeak: false },
  { time: '12:55', day1: 10, day2: 9, day3: 10, predicted: 10, actual: 9, isPeak: false },
  { time: '13:00', day1: 14, day2: 15, day3: 12, predicted: 14, actual: 13, isPeak: false, surgeReason: 'Faculty lunch break' },
  { time: '13:05', day1: 11, day2: 10, day3: 9, predicted: 10, actual: 10, isPeak: false },
  { time: '13:10', day1: 8, day2: 7, day3: 8, predicted: 8, actual: 7, isPeak: false },
  { time: '13:15', day1: 6, day2: 5, day3: 6, predicted: 6, actual: 5, isPeak: false },
  { time: '13:20', day1: 4, day2: 4, day3: 3, predicted: 4, actual: 4, isPeak: false }
];

export function computeForecastMetrics(buckets) {
  const totalPredicted = buckets.reduce((acc, b) => acc + b.predicted, 0);
  const totalActual = buckets.reduce((acc, b) => acc + b.actual, 0);
  const peakBucket = buckets.reduce((max, b) => (b.predicted > max.predicted ? b : max), buckets[0]);
  const variance = totalActual - totalPredicted;
  const accuracyPct = Math.round((1 - Math.abs(variance) / totalPredicted) * 100);

  return {
    totalPredicted,
    totalActual,
    peakBucket,
    accuracyPct,
    formulaExplanation: 'Predicted = 0.50 × Day1 + 0.30 × Day2 + 0.20 × Day3 (Weighted 3-Day Moving Average)',
    prepAdvice: `Surge Alert for ${peakBucket.time} (${peakBucket.predicted} predicted orders). Kitchen should prep-batch 20x Veg Thali curry bases and 15x Dosa batter portions 15 mins prior.`
  };
}
