const { performance } = require('perf_hooks');

const RECOMMENDATIONS = Array.from({ length: 100 }, (_, i) => ({ id: `id_${i}` }));
const completedRecsArray = Array.from({ length: 50 }, (_, i) => `id_${i}`);
const completedRecsSet = new Set(completedRecsArray);

const iterations = 100000;

// Benchmark Array.includes
const startArray = performance.now();
for (let i = 0; i < iterations; i++) {
  RECOMMENDATIONS.forEach(rec => {
    const isCompleted = completedRecsArray.includes(rec.id);
  });
}
const endArray = performance.now();
const timeArray = endArray - startArray;

// Benchmark Set.has
const startSet = performance.now();
for (let i = 0; i < iterations; i++) {
  RECOMMENDATIONS.forEach(rec => {
    const isCompleted = completedRecsSet.has(rec.id);
  });
}
const endSet = performance.now();
const timeSet = endSet - startSet;

console.log(`Array.includes time: ${timeArray.toFixed(4)} ms`);
console.log(`Set.has time: ${timeSet.toFixed(4)} ms`);
console.log(`Improvement: ${((timeArray - timeSet) / timeArray * 100).toFixed(2)}% faster`);
