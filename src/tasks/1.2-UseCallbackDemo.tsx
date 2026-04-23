/**
 * 🔹 1.2 useCallback — Оптимизация обработчиков
 *
 * ПРОБЛЕМА БЕЗ useCallback:
 * Каждый раз, когда родительский компонент ре-рендерится (например, меняется счётчик),
 * функции-обработчики создаются ЗАНОВО. Новая функция !== старая функция (по ссылке),
 * поэтому React.memo в дочернем компоненте думает, что props изменились → ре-рендер.
 *
 * КАК useCallback РЕШАЕТ ЭТО:
 * useCallback(fn, [deps]) возвращает ОДНУ И ТУ ЖЕ ссылку на функцию,
 * пока не изменятся зависимости из [deps]. React.memo видит ту же ссылку → ре-рендера нет.
 *
 * ПОСМОТРИ В CONSOLE:
 * - Без useCallback: "Child ре-рендер" появляется при каждом клике на любой кнопке
 * - С useCallback: "Child ре-рендер" появляется только при клике кнопок ЭТОГО дочернего
 */

import { useState, useCallback, memo } from 'react'

// ─── Дочерний компонент БЕЗ мемоизации ───────────────────────────────────────
// Этот компонент ре-рендерится при каждом ре-рендере родителя
// (потому что без React.memo React всегда перерисовывает дочерние компоненты)
function ChildWithoutMemo({ label, onIncrement }: { label: string; onIncrement: () => void }) {
  console.log(`[ChildWithoutMemo] "${label}" ре-рендер`)
  return (
    <div style={{ padding: '0.5rem', background: '#fff3cd', borderRadius: 6, marginBottom: 8 }}>
      <span style={{ fontSize: '0.85rem' }}>{label} (без memo)</span>
      <button onClick={onIncrement} style={{ marginLeft: 8 }}>+1</button>
    </div>
  )
}

// ─── Дочерний компонент С мемоизацией ────────────────────────────────────────
// memo() — компонент ре-рендерится только если изменились его props.
// НО: если onIncrement каждый раз новая функция (без useCallback в родителе),
// memo не поможет — props.onIncrement всё равно "изменился".
const ChildWithMemo = memo(function ChildWithMemo({
  label,
  onIncrement,
}: {
  label: string
  onIncrement: () => void
}) {
  console.log(`[ChildWithMemo] "${label}" ре-рендер`)
  return (
    <div style={{ padding: '0.5rem', background: '#d1fae5', borderRadius: 6, marginBottom: 8 }}>
      <span style={{ fontSize: '0.85rem' }}>{label} (с memo)</span>
      <button onClick={onIncrement} style={{ marginLeft: 8 }}>+1</button>
    </div>
  )
})

export default function UseCallbackDemo() {
  const [countA, setCountA] = useState(0)
  const [countB, setCountB] = useState(0)
  const [unrelated, setUnrelated] = useState(0)

  // ❌ БЕЗ useCallback — новая функция при каждом ре-рендере родителя.
  // Даже React.memo не спасёт — ссылка на onIncrement всегда новая.
  const incrementA_noCallback = () => setCountA(c => c + 1)

  // ✅ С useCallback — функция пересоздаётся только если изменился countB.
  // При изменении countA или unrelated — та же ссылка → ChildWithMemo не ре-рендерится.
  const incrementB_withCallback = useCallback(() => {
    setCountB(c => c + 1)
  }, []) // [] — функция никогда не пересоздаётся (зависимостей нет, используем функциональный апдейт)

  return (
    <div>
      <h2>1.2 — useCallback</h2>
      <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#555' }}>
        Открой DevTools → Console и нажимай кнопки. Следи за ре-рендерами.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ background: '#f8f9fa', padding: '0.75rem', borderRadius: 8, minWidth: 160 }}>
          <strong>Счётчик A: {countA}</strong>
          <br />
          <small style={{ color: '#888' }}>обработчик без useCallback</small>
        </div>
        <div style={{ background: '#f8f9fa', padding: '0.75rem', borderRadius: 8, minWidth: 160 }}>
          <strong>Счётчик B: {countB}</strong>
          <br />
          <small style={{ color: '#888' }}>обработчик с useCallback</small>
        </div>
      </div>

      {/* Кнопка, меняющая несвязанное состояние — провоцирует ре-рендер родителя */}
      <button
        onClick={() => setUnrelated(c => c + 1)}
        style={{ marginBottom: '1rem', background: '#e9ecef' }}
      >
        Несвязанное состояние: {unrelated}
      </button>
      <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
        ↑ Эта кнопка ре-рендерит родителя, но не должна затрагивать дочерние компоненты
      </p>

      {/* Дочерний БЕЗ memo — ре-рендерится всегда */}
      <ChildWithoutMemo label="Счётчик A" onIncrement={incrementA_noCallback} />

      {/* Дочерний С memo + обработчик БЕЗ useCallback — memo не поможет */}
      <ChildWithMemo label="Счётчик A (memo, но без useCallback)" onIncrement={incrementA_noCallback} />

      {/* Дочерний С memo + обработчик С useCallback — ре-рендерится только при нужном изменении */}
      <ChildWithMemo label="Счётчик B (memo + useCallback)" onIncrement={incrementB_withCallback} />

      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0f4ff', borderRadius: 8, fontSize: '0.85rem' }}>
        <strong>Вывод:</strong> React.memo + useCallback вместе дают настоящую оптимизацию.
        Одного React.memo недостаточно, если колбэки пересоздаются без useCallback.
      </div>
    </div>
  )
}
