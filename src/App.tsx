import { useState } from 'react'

// Часть 1 — Хуки
import UseContextTheme   from './tasks/1.1-UseContextTheme'
import UseCallbackDemo   from './tasks/1.2-UseCallbackDemo'
import UseMemoDemo       from './tasks/1.3-UseMemoDemo'
import UseRefDemo        from './tasks/1.4-UseRefDemo'
import UseReducerTodo    from './tasks/1.5-UseReducerTodo'
import ReactMemoDemo     from './tasks/1.6-ReactMemoDemo'
import CombinedHooks     from './tasks/1.7-CombinedHooks'

// Часть 2 — Формы
import BadForm           from './forms/2.1-BadForm'
import GoodFormRHF       from './forms/2.2-GoodFormRHF'
import GoodFormFormik    from './forms/2.3-GoodFormFormik'

const TASKS = [
  { id: '1.1', label: '1.1 useContext',    component: <UseContextTheme /> },
  { id: '1.2', label: '1.2 useCallback',   component: <UseCallbackDemo /> },
  { id: '1.3', label: '1.3 useMemo',       component: <UseMemoDemo /> },
  { id: '1.4', label: '1.4 useRef',        component: <UseRefDemo /> },
  { id: '1.5', label: '1.5 useReducer',    component: <UseReducerTodo /> },
  { id: '1.6', label: '1.6 React.memo',    component: <ReactMemoDemo /> },
  { id: '1.7', label: '1.7 Бонус',         component: <CombinedHooks /> },
  { id: '2.1', label: '2.1 Bad Form',      component: <BadForm /> },
  { id: '2.2', label: '2.2 RHF + Zod',     component: <GoodFormRHF /> },
  { id: '2.3', label: '2.3 Formik + Yup',  component: <GoodFormFormik /> },
]

export default function App() {
  const [active, setActive] = useState('1.1')
  const task = TASKS.find(t => t.id === active)

  return (
    <div>
      <h1>ДЗ #3 — React Хуки + Формы</h1>
      <nav>
        {TASKS.map(t => (
          <button
            key={t.id}
            className={active === t.id ? 'active' : ''}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div className="task-card">{task?.component}</div>
    </div>
  )
}
