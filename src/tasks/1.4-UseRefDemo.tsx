/**
 * 🔹 1.4 useRef — Фокус и предыдущее значение
 *
 * useRef — это «коробка» с одним полем .current, которая:
 * 1. СОХРАНЯЕТ значение между ре-рендерами (в отличие от обычных переменных)
 * 2. НЕ вызывает ре-рендер при изменении .current (в отличие от useState)
 *
 * ДВА ОСНОВНЫХ ПРИМЕНЕНИЯ:
 *
 * А) Доступ к DOM-элементу:
 *    const ref = useRef<HTMLInputElement>(null)
 *    <input ref={ref} />
 *    ref.current — это теперь сам DOM-элемент input, со всеми его методами (.focus(), .value и т.д.)
 *
 * Б) «Мутабельная переменная», которая не вызывает ре-рендер:
 *    Отличный способ хранить предыдущие значения, ID таймеров, флаги и т.д.
 *    useEffect сравнивает предыдущее и текущее значение — для этого нужен useRef.
 */

import { useState, useRef, useEffect } from 'react'

export default function UseRefDemo() {
  const [text, setText] = useState('')

  // Реф для доступа к DOM-элементу input.
  // <HTMLInputElement> — TypeScript тип. null — начальное значение до монтирования.
  const inputRef = useRef<HTMLInputElement>(null)

  // Реф для хранения предыдущего значения text.
  // useRef<string>('') — начальное значение пустая строка.
  // Изменение prevTextRef.current НЕ вызывает ре-рендер — это важно!
  const prevTextRef = useRef<string>('')

  // useEffect — запускается ПОСЛЕ каждого рендера.
  // Здесь мы сохраняем текущее значение как «предыдущее» для следующего рендера.
  // Порядок событий:
  //   1. Пользователь вводит символ → setState → ре-рендер
  //   2. JSX рендерится с новым text
  //   3. useEffect запускается: сохраняем text в prevTextRef.current
  //   4. prevTextRef.current теперь хранит "старое" значение до следующего изменения
  useEffect(() => {
    prevTextRef.current = text
  })
  // ВНИМАНИЕ: здесь НЕТ второго аргумента [] — эффект запускается при каждом рендере.
  // Это намеренно — нам нужно обновлять превью после КАЖДОГО изменения.

  const handleFocusClick = () => {
    // inputRef.current — это HTMLInputElement.
    // .focus() — стандартный метод DOM, переводит фокус клавиатуры на этот элемент.
    // ?. — опциональная цепочка, на случай если реф ещё не прикреплён (при монтировании)
    inputRef.current?.focus()
  }

  return (
    <div>
      <h2>1.4 — useRef</h2>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
        {/* ref={inputRef} — «привязывает» DOM-элемент к рефу.
            После монтирования inputRef.current === этот <input> */}
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Введи текст..."
          style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid #ccc', flex: 1 }}
        />
        <button onClick={handleFocusClick}>
          Фокус на поле
        </button>
      </div>

      <div style={{ background: '#f8f9fa', padding: '0.75rem', borderRadius: 8, fontSize: '0.9rem' }}>
        <div>
          <strong>Текущее значение:</strong>{' '}
          <span style={{ color: '#6c63ff' }}>{text || <em style={{ color: '#999' }}>пусто</em>}</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <strong>Предыдущее значение:</strong>{' '}
          <span style={{ color: '#888' }}>
            {prevTextRef.current || <em style={{ color: '#999' }}>пусто</em>}
          </span>
        </div>
      </div>

      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0f4ff', borderRadius: 8, fontSize: '0.85rem' }}>
        <p>
          <strong>Почему не useState для prevText?</strong><br />
          Если бы мы сохраняли предыдущее значение через setState — это вызывало бы ещё один
          ре-рендер. useRef позволяет обновить значение «тихо», без рендера.
        </p>
        <p style={{ marginTop: 8 }}>
          <strong>Почему не обычная переменная?</strong><br />
          Обычные переменные внутри компонента создаются заново при каждом ре-рендере.
          useRef сохраняет значение между рендерами.
        </p>
      </div>
    </div>
  )
}
