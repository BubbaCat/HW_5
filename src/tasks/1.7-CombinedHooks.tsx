/**
 * 🔹 1.7 Бонус — Комбинирование хуков
 *
 * Небольшое приложение со списком пользователей и фильтрацией.
 * Все хуки применены по назначению:
 *
 * - useReducer  → управление состоянием списка (добавить/удалить/переключить)
 * - useMemo     → фильтрация списка (дорогая операция не выполняется лишний раз)
 * - useCallback → стабильные колбэки для дочерних компонентов (оптимизация с memo)
 * - useContext  → передача темы/фильтра вглубь дерева без prop drilling
 *
 * PROP DRILLING — антипаттерн, когда props передаются через несколько уровней компонентов
 * только чтобы добраться до нужного. useContext решает это.
 */

import {
  createContext, useContext, useReducer, useMemo, useCallback,
  useState, memo, ReactNode
} from 'react'

// ─── Типы ────────────────────────────────────────────────────────────────────

interface User {
  id: number
  name: string
  role: 'student' | 'teacher'
  active: boolean
}

type UserAction =
  | { type: 'ADD_USER'; name: string; role: User['role'] }
  | { type: 'TOGGLE_USER'; id: number }
  | { type: 'DELETE_USER'; id: number }

interface UserState {
  users: User[]
  nextId: number
}

// ─── Контекст фильтра ─────────────────────────────────────────────────────────
// Передаём фильтр через контекст — дочерние компоненты могут его использовать
// без передачи через props (нет prop drilling).
interface FilterContextType {
  filter: string
  setFilter: (f: string) => void
}
const FilterContext = createContext<FilterContextType>(null as any)

function useFilter() {
  return useContext(FilterContext)
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, { id: state.nextId, name: action.name, role: action.role, active: true }],
        nextId: state.nextId + 1,
      }
    case 'TOGGLE_USER':
      return {
        ...state,
        users: state.users.map(u => u.id === action.id ? { ...u, active: !u.active } : u),
      }
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(u => u.id !== action.id),
      }
    default:
      return state
  }
}

const initialState: UserState = {
  users: [
    { id: 1, name: 'Анна Иванова', role: 'student', active: true },
    { id: 2, name: 'Пётр Смирнов', role: 'teacher', active: true },
    { id: 3, name: 'Мария Козлова', role: 'student', active: false },
  ],
  nextId: 4,
}

// ─── Дочерний компонент: карточка пользователя ───────────────────────────────
// memo — не ре-рендерится если user/onToggle/onDelete не изменились
const UserCard = memo(function UserCard({
  user,
  onToggle,
  onDelete,
}: {
  user: User
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}) {
  // Читаем фильтр из контекста прямо здесь — без props!
  const { filter } = useFilter()

  return (
    <div
      style={{
        padding: '0.6rem 0.75rem',
        borderRadius: 8,
        marginBottom: 6,
        background: user.active ? '#f0fdf4' : '#f8f9fa',
        border: `1px solid ${user.active ? '#86efac' : '#e0e0e0'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <span
        style={{
          flex: 1,
          textDecoration: user.active ? 'none' : 'line-through',
          color: user.active ? '#1a1a1a' : '#999',
        }}
      >
        {user.name}
      </span>
      <span
        style={{
          fontSize: '0.75rem',
          padding: '2px 6px',
          borderRadius: 4,
          background: user.role === 'teacher' ? '#ede9fe' : '#dbeafe',
          color: user.role === 'teacher' ? '#7c3aed' : '#1d4ed8',
        }}
      >
        {user.role === 'teacher' ? 'преподаватель' : 'студент'}
      </span>
      {/* Фильтр виден здесь благодаря useContext — без передачи через props */}
      {filter && (
        <span style={{ fontSize: '0.7rem', color: '#888' }}>
          фильтр: {filter}
        </span>
      )}
      <button onClick={() => onToggle(user.id)} style={{ fontSize: '0.8rem' }}>
        {user.active ? 'Деактивировать' : 'Активировать'}
      </button>
      <button
        onClick={() => onDelete(user.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
      >
        ✕
      </button>
    </div>
  )
})

// ─── Форма добавления пользователя ───────────────────────────────────────────
function AddUserForm({ onAdd }: { onAdd: (name: string, role: User['role']) => void }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState<User['role']>('student')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name.trim(), role)
    setName('')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Имя пользователя"
        style={{ flex: 1, minWidth: 150, padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid #ccc' }}
      />
      <select
        value={role}
        onChange={e => setRole(e.target.value as User['role'])}
        style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid #ccc' }}
      >
        <option value="student">Студент</option>
        <option value="teacher">Преподаватель</option>
      </select>
      <button type="submit">Добавить</button>
    </form>
  )
}

// ─── Корневой компонент задания ───────────────────────────────────────────────
export default function CombinedHooks() {
  const [state, dispatch] = useReducer(userReducer, initialState)
  // filter — состояние фильтра поиска
  const [filter, setFilter] = useState('')

  // useCallback — стабильные колбэки для UserCard (работают вместе с memo)
  const handleToggle = useCallback((id: number) => {
    dispatch({ type: 'TOGGLE_USER', id })
  }, []) // dispatch стабилен, зависимостей нет

  const handleDelete = useCallback((id: number) => {
    dispatch({ type: 'DELETE_USER', id })
  }, [])

  const handleAdd = useCallback((name: string, role: User['role']) => {
    dispatch({ type: 'ADD_USER', name, role })
  }, [])

  // useMemo — фильтрация не пересчитывается если state.users и filter не изменились
  const filteredUsers = useMemo(() => {
    console.log('[useMemo] фильтрация пользователей')
    const q = filter.toLowerCase()
    return state.users.filter(u =>
      u.name.toLowerCase().includes(q) || u.role.includes(q)
    )
  }, [state.users, filter])

  const stats = useMemo(() => ({
    total: state.users.length,
    active: state.users.filter(u => u.active).length,
    filtered: filteredUsers.length,
  }), [state.users, filteredUsers])

  return (
    // FilterContext.Provider — передаём фильтр всему поддереву
    // Любой дочерний компонент может прочитать его через useFilter()
    <FilterContext.Provider value={{ filter, setFilter }}>
      <div>
        <h2>1.7 — Комбинирование хуков</h2>
        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
          Всего: {stats.total} | Активных: {stats.active} | Показано: {stats.filtered}
        </p>

        <AddUserForm onAdd={handleAdd} />

        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Поиск по имени или роли..."
          style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid #ccc', marginBottom: '1rem', boxSizing: 'border-box' }}
        />

        {filteredUsers.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}

        {filteredUsers.length === 0 && (
          <p style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>
            Никого не найдено
          </p>
        )}

        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0f4ff', borderRadius: 8, fontSize: '0.82rem' }}>
          <strong>Хуки в этом компоненте:</strong>
          <ul style={{ marginTop: 6, paddingLeft: '1.2rem' }}>
            <li><code>useReducer</code> — управление списком пользователей (ADD/TOGGLE/DELETE)</li>
            <li><code>useMemo</code> — фильтрация и статистика без лишних вычислений</li>
            <li><code>useCallback</code> — стабильные обработчики для UserCard (работает с memo)</li>
            <li><code>useContext</code> — фильтр доступен в UserCard без prop drilling</li>
          </ul>
        </div>
      </div>
    </FilterContext.Provider>
  )
}
