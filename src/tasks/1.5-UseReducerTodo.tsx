/**
 * 🔹 1.5 useReducer — Todo List
 *
 * ЗАЧЕМ useReducer, если есть useState?
 * useState хорошо работает с простыми значениями: число, строка, булево.
 * useReducer лучше подходит когда:
 * - Состояние — объект или массив со сложной структурой
 * - Есть несколько типов изменений (экшены), которые описывают ЧТО произошло
 * - Логика изменений сложная или взаимосвязанная
 *
 * КАК РАБОТАЕТ useReducer:
 * 1. dispatch(action) — отправляет «событие» (что случилось)
 * 2. reducer(state, action) — чистая функция, возвращает НОВОЕ состояние
 * 3. React вызывает reducer и перерисовывает компонент с новым state
 *
 * Чистая функция = нет побочных эффектов, нет мутаций, одинаковый input → одинаковый output
 * Поэтому нельзя state.todos.push() — нужно создать новый массив!
 */

import { useReducer, useState } from 'react'

// Тип одной задачи
interface Todo {
  id: number
  text: string
  done: boolean
}

// Все возможные типы экшенов — дискриминированный union.
// Каждый экшен описывает СОБЫТИЕ: что произошло и с какими данными.
type Action =
  | { type: 'ADD_TODO'; text: string }       // Добавить задачу с текстом
  | { type: 'TOGGLE_TODO'; id: number }      // Переключить done у задачи с id
  | { type: 'DELETE_TODO'; id: number }      // Удалить задачу с id

// Тип всего состояния
interface State {
  todos: Todo[]
  nextId: number // автоинкремент ID
}

const initialState: State = {
  todos: [
    { id: 1, text: 'Изучить useReducer', done: false },
    { id: 2, text: 'Сделать Todo List', done: false },
  ],
  nextId: 3,
}

// Reducer — чистая функция: (текущее состояние, экшен) → новое состояние
// switch по action.type — стандартный паттерн
// ВАЖНО: возвращаем НОВЫЕ объекты/массивы, не мутируем state!
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        // ...state — копируем все поля состояния
        ...state,
        // Создаём новый массив с новой задачей в конце
        todos: [...state.todos, { id: state.nextId, text: action.text, done: false }],
        nextId: state.nextId + 1,
      }

    case 'TOGGLE_TODO':
      return {
        ...state,
        // map возвращает новый массив. Находим нужную задачу по id и меняем done.
        todos: state.todos.map(todo =>
          todo.id === action.id
            ? { ...todo, done: !todo.done } // создаём новый объект с инвертированным done
            : todo                          // остальные задачи не трогаем
        ),
      }

    case 'DELETE_TODO':
      return {
        ...state,
        // filter возвращает новый массив без удалённой задачи
        todos: state.todos.filter(todo => todo.id !== action.id),
      }

    default:
      // TypeScript exhaustiveness check — если добавишь новый тип экшена и забудешь его обработать,
      // здесь будет ошибка компиляции
      return state
  }
}

export default function UseReducerTodo() {
  // useReducer возвращает [state, dispatch]
  // dispatch — функция для отправки экшенов в reducer
  const [state, dispatch] = useReducer(reducer, initialState)
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    // dispatch отправляет экшен в reducer → reducer возвращает новое состояние
    dispatch({ type: 'ADD_TODO', text: trimmed })
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  const completedCount = state.todos.filter(t => t.done).length

  return (
    <div>
      <h2>1.5 — useReducer: Todo List</h2>
      <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
        Выполнено: {completedCount} / {state.todos.length}
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Новая задача... (Enter для добавления)"
          style={{ flex: 1, padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button onClick={handleAdd}>Добавить</button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {state.todos.map(todo => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              background: todo.done ? '#f0fdf4' : '#f8f9fa',
              borderRadius: 6,
              marginBottom: 6,
              border: '1px solid',
              borderColor: todo.done ? '#86efac' : '#e0e0e0',
            }}
          >
            <input
              type="checkbox"
              checked={todo.done}
              // dispatch с экшеном TOGGLE_TODO — reducer знает что делать
              onChange={() => dispatch({ type: 'TOGGLE_TODO', id: todo.id })}
              style={{ cursor: 'pointer', width: 16, height: 16 }}
            />
            <span
              style={{
                flex: 1,
                textDecoration: todo.done ? 'line-through' : 'none',
                color: todo.done ? '#888' : '#1a1a1a',
              }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => dispatch({ type: 'DELETE_TODO', id: todo.id })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1rem', padding: '0 4px' }}
              title="Удалить"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {state.todos.length === 0 && (
        <p style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>
          Список пуст — добавьте задачу!
        </p>
      )}

      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0f4ff', borderRadius: 8, fontSize: '0.85rem' }}>
        <strong>Текущий state (для отладки):</strong>
        <pre style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#555', overflowX: 'auto' }}>
          {JSON.stringify(state, null, 2)}
        </pre>
      </div>
    </div>
  )
}
