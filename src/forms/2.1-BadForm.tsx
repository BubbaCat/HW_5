/**
 * 🔹 2.1 «Плохая» форма — антипаттерны
 *
 * ВНИМАНИЕ: этот компонент написан намеренно плохо для демонстрации проблем.
 * Каждый антипаттерн задокументирован в комментарии. Не копируй этот подход!
 *
 * Смотри счётчик ре-рендеров в правом верхнем углу — он растёт при каждом нажатии клавиши.
 * В задании 2.2 (React Hook Form) счётчик почти не меняется!
 */

import { useState, useRef } from 'react'

export default function BadForm() {
  // ❌ АНТИПАТТЕРН #1: useState на каждое поле отдельно.
  // Каждое изменение любого поля вызывает ре-рендер ВСЕГО компонента.
  // При 8 полях и активном пользователе — сотни лишних ре-рендеров.
  // ✅ Решение: React Hook Form хранит значения в DOM (через ref), не в state.
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('')
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ✅ useRef для счётчика ре-рендеров (правильное применение useRef!)
  // useRef не вызывает ре-рендер при изменении — идеально для счётчика
  const renderCount = useRef(0)
  renderCount.current += 1 // увеличивается при каждом рендере

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    // ❌ АНТИПАТТЕРН #2: ручная валидация разбросана по handleSubmit.
    // Нет единого места для правил. Нет reusability. Нет типизации.
    // ✅ Решение: декларативная схема Zod — все правила в одном месте.

    if (!firstName.trim()) newErrors.firstName = 'Имя обязательно'
    if (!lastName.trim()) newErrors.lastName = 'Фамилия обязательна'

    // ❌ АНТИПАТТЕРН #3: валидация email через .includes('@').
    // 'notanemail@' — пройдёт эту проверку. 'user@domain' тоже.
    // ✅ Решение: z.string().email() использует настоящий RFC-совместимый regex.
    if (!email.includes('@')) {
      newErrors.email = 'Введите корректный email'
    }

    // ❌ АНТИПАТТЕРН #4: проверка паролей в handleSubmit, не «по месту».
    // Пользователь узнаёт об ошибке только ПОСЛЕ попытки сабмита.
    // ✅ Решение: .refine() в Zod-схеме + mode: 'onTouched' в RHF — ошибка сразу.
    if (password.length < 8) newErrors.password = 'Минимум 8 символов'
    if (password !== confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают'
    if (!role) newErrors.role = 'Выберите роль'
    if (!agree) newErrors.agree = 'Примите условия'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Имитируем запрос к серверу
    const fakeServerRequest = async () => {
      await new Promise(r => setTimeout(r, 800))
      // Сервер вернул ошибку (email занят)
      if (email.includes('taken@')) {
        // ❌ АНТИПАТТЕРН #5: alert() для серверных ошибок.
        // Блокирует UI, нет стилизации, ошибка не привязана к полю.
        // ✅ Решение: setError('email', {...}) в React Hook Form — ошибка inline под полем.
        alert('Этот email уже занят!')
        return
      }
      alert('Регистрация успешна!')
    }

    // ❌ АНТИПАТТЕРН #6: кнопка Submit не блокируется во время отправки.
    // Пользователь может нажать несколько раз — несколько запросов.
    // ✅ Решение: isSubmitting из useForm() + disabled={isSubmitting}.
    fakeServerRequest()
  }

  // Стили для инпутов с ошибкой
  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '0.4rem 0.6rem',
    borderRadius: 6,
    border: `1px solid ${errors[field] ? '#ef4444' : '#ccc'}`,
    marginTop: 4,
    boxSizing: 'border-box',
    // ❌ АНТИПАТТЕРН #7: нет aria-invalid и aria-describedby.
    // Скринридеры не понимают что поле содержит ошибку.
    // ✅ Решение: aria-invalid={!!errors.email} aria-describedby="email-error"
  })

  return (
    <div style={{ position: 'relative' }}>
      {/* Счётчик ре-рендеров */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: '#ef4444',
          color: '#fff',
          borderRadius: 6,
          padding: '2px 8px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
        }}
      >
        Ре-рендеры: {renderCount.current}
      </div>

      <h2>2.1 — «Плохая» форма (антипаттерны)</h2>
      <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
        Нажимай клавиши и смотри как растёт счётчик ре-рендеров →
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <label htmlFor="firstName" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Имя</label>
            <input id="firstName" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle('firstName')} />
            {errors.firstName && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.firstName}</span>}
          </div>
          <div>
            <label htmlFor="lastName" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Фамилия</label>
            <input id="lastName" type="text" value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle('lastName')} />
            {errors.lastName && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.lastName}</span>}
          </div>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Email</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle('email')} />
          {errors.email && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.email}</span>}
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="password" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Пароль</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle('password')} />
          {errors.password && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.password}</span>}
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="confirmPassword" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Подтверждение пароля</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle('confirmPassword')} />
          {errors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.confirmPassword}</span>}
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="role" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Роль</label>
          <select id="role" value={role} onChange={e => setRole(e.target.value)} style={{ ...inputStyle('role'), background: '#fff' }}>
            <option value="">Выберите роль</option>
            <option value="student">Студент</option>
            <option value="teacher">Преподаватель</option>
          </select>
          {errors.role && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.role}</span>}
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input id="agree" type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
          <label htmlFor="agree" style={{ fontSize: '0.85rem' }}>Принимаю условия</label>
          {errors.agree && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.agree}</span>}
        </div>

        {/* ❌ Кнопка не блокируется — можно нажать несколько раз */}
        <button type="submit">Зарегистрироваться</button>
      </form>

      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef2f2', borderRadius: 8, fontSize: '0.82rem', border: '1px solid #fecaca' }}>
        <strong>Антипаттерны в этой форме:</strong>
        <ol style={{ marginTop: 6, paddingLeft: '1.2rem' }}>
          <li>useState на каждое поле → ре-рендер при каждом символе</li>
          <li>Валидация разбросана по handleSubmit, не декларативная</li>
          <li>Email через .includes('@') — не настоящая валидация</li>
          <li>Проверка паролей только при сабмите</li>
          <li>alert() для серверных ошибок — блокирует UI</li>
          <li>Кнопка не блокируется при отправке</li>
          <li>Нет aria-invalid / aria-describedby</li>
        </ol>
      </div>
    </div>
  )
}
