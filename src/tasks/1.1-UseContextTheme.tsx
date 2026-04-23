/**
 * 🔹 1.1 useContext — Тёмная/светлая тема
 *
 * КАК ЭТО РАБОТАЕТ:
 * 1. createContext() создаёт «канал» для данных, который пронизывает всё дерево компонентов.
 * 2. <ThemeContext.Provider value={...}> «транслирует» данные вниз по дереву.
 * 3. useContext(ThemeContext) «подписывает» любой дочерний компонент на эти данные.
 * 4. При изменении value в Provider — все подписчики автоматически ре-рендерятся.
 *
 * ЗАЧЕМ localStorage?
 * Браузер очищает состояние React при перезагрузке страницы.
 * localStorage — постоянное хранилище браузера. Мы читаем тему при инициализации
 * (через функцию-инициализатор в useState) и сохраняем при каждом изменении.
 */

import { createContext, useContext, useState, ReactNode } from 'react'

// Тип темы — только два допустимых значения
type Theme = 'light' | 'dark'

// Тип контекста — тема + функция переключения
interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

// Создаём контекст. null as any — временный дефолт;
// реальное значение всегда приходит из Provider ниже.
const ThemeContext = createContext<ThemeContextType>(null as any)

// Кастомный хук для удобного использования контекста в дочерних компонентах.
// Это лучше чем писать useContext(ThemeContext) каждый раз — DRY + читаемость.
function useTheme() {
  return useContext(ThemeContext)
}

// Провайдер — компонент-обёртка, который «поставляет» данные всем дочерним.
// children: ReactNode — принимает любое JSX-содержимое внутри <ThemeProvider>...</ThemeProvider>
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Функция-инициализатор: вызывается ОДИН РАЗ при монтировании компонента.
    // Читаем сохранённую тему из localStorage.
    // Если там ничего нет — используем 'light' как дефолт.
    const saved = localStorage.getItem('theme')
    return (saved === 'dark' || saved === 'light') ? saved : 'light'
  })

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      // Сохраняем новую тему в localStorage сразу при переключении
      localStorage.setItem('theme', next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Дочерний компонент — использует контекст через useTheme()
// Не получает никаких props — данные идут через контекст!
function ThemedCard() {
  const { theme, toggleTheme } = useTheme()

  // Стили зависят от темы — компонент сам знает, как себя отображать
  const styles: React.CSSProperties = {
    background: theme === 'dark' ? '#1a1a2e' : '#ffffff',
    color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a',
    border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
    borderRadius: 8,
    padding: '1rem',
    marginTop: '1rem',
  }

  return (
    <div style={styles}>
      <p>Текущая тема: <strong>{theme}</strong></p>
      <p style={{ fontSize: '0.85rem', marginTop: 8, opacity: 0.7 }}>
        Тема сохранена в localStorage — попробуй перезагрузить страницу!
      </p>
      <button onClick={toggleTheme} style={{ marginTop: '0.75rem' }}>
        Переключить на {theme === 'light' ? 'тёмную' : 'светлую'}
      </button>
    </div>
  )
}

// Корневой компонент задания — оборачивает всё в Provider
export default function UseContextTheme() {
  return (
    // Всё что внутри Provider — имеет доступ к ThemeContext
    <ThemeProvider>
      <h2>1.1 — useContext: Тема</h2>
      <ThemedCard />
      {/* Можно добавить ещё компонентов — все получат тему без передачи через props */}
    </ThemeProvider>
  )
}
