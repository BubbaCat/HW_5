/**
 * 🔹 1.3 useMemo — Оптимизация вычислений
 *
 * ПРОБЛЕМА БЕЗ useMemo:
 * Если computeSum() дорогой (например, 10 000 чисел), он будет пересчитываться
 * при КАЖДОМ ре-рендере компонента, даже если массив чисел не изменился.
 * Например, при изменении отдельного счётчика рядом.
 *
 * КАК useMemo РЕШАЕТ ЭТО:
 * useMemo(fn, [deps]) — запоминает (мемоизирует) результат функции fn.
 * Пересчёт происходит ТОЛЬКО когда изменяются зависимости [deps].
 * Если зависимости те же — возвращается закэшированный результат.
 *
 * КОГДА ИСПОЛЬЗОВАТЬ useMemo:
 * - Тяжёлые вычисления (сортировка, фильтрация большого массива, рекурсия)
 * - НЕ нужен для простых операций — накладные расходы useMemo > выгода
 */

import { useState, useMemo } from 'react'

// Симулируем «тяжёлое» вычисление — сумма большого массива
// В реальных задачах это может быть: фильтрация/сортировка тысяч элементов,
// парсинг данных, рекурсивный обход дерева и т.д.
function computeSum(numbers: number[]): number {
  console.log('[computeSum] вычисляем сумму... (дорогая операция)')
  // Искусственная задержка для демонстрации (в реальном коде не нужна)
  let sum = 0
  for (const n of numbers) {
    sum += n
  }
  return sum
}

// Генерация массива из N случайных чисел
function generateNumbers(count: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 100) + 1)
}

export default function UseMemoDemo() {
  const [numbers, setNumbers] = useState<number[]>(() => generateNumbers(20))
  // Отдельное состояние, НЕ связанное с массивом чисел
  // При изменении этого состояния — компонент ре-рендерится,
  // но массив numbers не меняется → useMemo не пересчитывает сумму
  const [unrelatedCounter, setUnrelatedCounter] = useState(0)

  // ✅ С useMemo — computeSum вызывается только когда изменяется numbers
  // [numbers] — массив зависимостей. React сравнивает по ссылке (===)
  // При setNumbers(generateNumbers()) создаётся НОВЫЙ массив → новая ссылка → пересчёт
  const sum = useMemo(() => computeSum(numbers), [numbers])

  // ❌ БЕЗ useMemo — для сравнения: пересчитывается при каждом ре-рендере
  // (раскомментируй и сравни количество логов в консоли)
  // const sumWithoutMemo = computeSum(numbers)

  return (
    <div>
      <h2>1.3 — useMemo</h2>
      <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#555' }}>
        Открой Console. Лог «вычисляем сумму» должен появляться только при обновлении массива,
        но НЕ при изменении несвязанного счётчика.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => setNumbers(generateNumbers(20))}>
          🎲 Новый массив (20 чисел)
        </button>
        <button
          onClick={() => setUnrelatedCounter(c => c + 1)}
          style={{ background: '#e9ecef' }}
        >
          Несвязанный счётчик: {unrelatedCounter}
        </button>
      </div>

      <div style={{ background: '#f0f4ff', padding: '0.75rem', borderRadius: 8, marginBottom: '1rem' }}>
        <strong>Сумма (useMemo): {sum}</strong>
        <br />
        <small style={{ color: '#666' }}>Пересчитывается только при новом массиве</small>
      </div>

      {/* Показываем первые 10 чисел чтобы было видно, что массив меняется */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {numbers.slice(0, 10).map((n, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              background: '#6c63ff',
              color: '#fff',
              borderRadius: 4,
              padding: '2px 8px',
              fontSize: '0.85rem',
            }}
          >
            {n}
          </span>
        ))}
        {numbers.length > 10 && (
          <span style={{ fontSize: '0.85rem', color: '#888', alignSelf: 'center' }}>
            ...ещё {numbers.length - 10}
          </span>
        )}
      </div>

      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fff3cd', borderRadius: 8, fontSize: '0.85rem' }}>
        <strong>Правило:</strong> useMemo — для дорогих вычислений. useCallback — для функций.
        Оба принимают один и тот же синтаксис: (fn, [deps]).
      </div>
    </div>
  )
}
