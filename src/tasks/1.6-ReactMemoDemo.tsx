/**
 * 🔹 1.6 React.memo — Оптимизация рендеринга
 *
 * КАК РАБОТАЕТ React.memo:
 * По умолчанию React перерисовывает ВСЕ дочерние компоненты при ре-рендере родителя.
 * React.memo — HOC (Higher-Order Component): оборачивает компонент и добавляет ему
 * поверхностное сравнение props (shallow comparison).
 * Если props не изменились — компонент НЕ ре-рендерится.
 *
 * ЛОВУШКА: React.memo + колбэки без useCallback
 * Проблема: при каждом ре-рендере родителя создаётся НОВАЯ функция.
 * Даже если логика одна и та же — это новая ссылка в памяти.
 * React.memo сравнивает props по ссылке (===), и видит что функция "изменилась".
 * Решение: обернуть колбэк в useCallback → та же ссылка → memo работает.
 *
 * ОТКРОЙ CONSOLE и наблюдай за ре-рендерами!
 */

import { useState, useCallback, memo } from 'react'

// ─── Компонент БЕЗ React.memo ─────────────────────────────────────────────────
// Всегда ре-рендерится при ре-рендере родителя
function RegularChild({ name, onAction }: { name: string; onAction: () => void }) {
  console.log(`[RegularChild] "${name}" ре-рендер ❌`)
  return (
    <div style={{ padding: '0.5rem 0.75rem', background: '#fee2e2', borderRadius: 6, marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.85rem' }}>
        <strong>{name}</strong> — без React.memo
      </span>
      <button onClick={onAction} style={{ fontSize: '0.8rem' }}>Действие</button>
    </div>
  )
}

// ─── Компонент С React.memo НО БЕЗ useCallback ───────────────────────────────
// memo есть, но onAction — новая функция при каждом рендере родителя
// → shallow comparison видит изменение → ре-рендер всё равно происходит
const MemoChildNoCallback = memo(function MemoChildNoCallback({
  name,
  onAction,
}: {
  name: string
  onAction: () => void
}) {
  console.log(`[MemoChildNoCallback] "${name}" ре-рендер ⚠️ (memo без useCallback)`)
  return (
    <div style={{ padding: '0.5rem 0.75rem', background: '#fef3c7', borderRadius: 6, marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.85rem' }}>
        <strong>{name}</strong> — React.memo (но без useCallback)
      </span>
      <button onClick={onAction} style={{ fontSize: '0.8rem' }}>Действие</button>
    </div>
  )
})

// ─── Компонент С React.memo И useCallback ────────────────────────────────────
// Комбинация даёт настоящую оптимизацию
const MemoChildWithCallback = memo(function MemoChildWithCallback({
  name,
  onAction,
}: {
  name: string
  onAction: () => void
}) {
  console.log(`[MemoChildWithCallback] "${name}" ре-рендер ✅ (memo + useCallback)`)
  return (
    <div style={{ padding: '0.5rem 0.75rem', background: '#d1fae5', borderRadius: 6, marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.85rem' }}>
        <strong>{name}</strong> — React.memo + useCallback
      </span>
      <button onClick={onAction} style={{ fontSize: '0.8rem' }}>Действие</button>
    </div>
  )
})

export default function ReactMemoDemo() {
  // parentCount — состояние, которое меняется при клике на главную кнопку
  const [parentCount, setParentCount] = useState(0)
  // childCount — состояние дочернего действия
  const [childActionCount, setChildActionCount] = useState(0)

  // ❌ Без useCallback — новая функция при каждом ре-рендере родителя
  const handleActionNoCallback = () => {
    setChildActionCount(c => c + 1)
  }

  // ✅ С useCallback — та же ссылка пока не изменятся зависимости
  const handleActionWithCallback = useCallback(() => {
    setChildActionCount(c => c + 1)
  }, []) // [] — функция никогда не пересоздаётся

  return (
    <div>
      <h2>1.6 — React.memo</h2>
      <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#555' }}>
        Открой Console. Нажми «Обновить родителя» и смотри кто ре-рендерится.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => setParentCount(c => c + 1)}>
          Обновить родителя: {parentCount}
        </button>
        <span style={{ fontSize: '0.85rem', color: '#888', alignSelf: 'center' }}>
          Действий дочернего: {childActionCount}
        </span>
      </div>

      <RegularChild name="RegularChild" onAction={handleActionNoCallback} />
      <MemoChildNoCallback name="MemoChild" onAction={handleActionNoCallback} />
      <MemoChildWithCallback name="MemoChild" onAction={handleActionWithCallback} />

      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0f4ff', borderRadius: 8, fontSize: '0.85rem' }}>
        <p><strong>🔴 RegularChild:</strong> ре-рендерится всегда — нет React.memo</p>
        <p style={{ marginTop: 4 }}>
          <strong>🟡 MemoChildNoCallback:</strong> ре-рендерится при обновлении родителя,
          потому что handleActionNoCallback — новая функция каждый раз
        </p>
        <p style={{ marginTop: 4 }}>
          <strong>🟢 MemoChildWithCallback:</strong> НЕ ре-рендерится при обновлении родителя.
          useCallback гарантирует стабильную ссылку → React.memo видит те же props
        </p>
      </div>
    </div>
  )
}
