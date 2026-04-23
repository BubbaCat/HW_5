/**
 * 🔹 2.2 «Хорошая» форма — React Hook Form + Zod
 *
 * КАК РАБОТАЕТ REACT HOOK FORM (RHF):
 * RHF использует «неуправляемые» (uncontrolled) инпуты — данные хранятся в DOM, не в state.
 * Это значит: ввод символа НЕ вызывает ре-рендер компонента!
 * register() возвращает ref + обработчики, которые вешаются прямо на input.
 *
 * КАК РАБОТАЕТ ZOD:
 * Схема описывает форму данных и правила валидации декларативно.
 * zodResolver «переводит» ошибки Zod в формат, который понимает RHF.
 *
 * ПОТОК ДАННЫХ:
 * 1. Пользователь вводит → данные в DOM (не в state)
 * 2. Blur/Submit → RHF собирает данные → передаёт в Zod
 * 3. Zod валидирует → ошибки попадают в formState.errors
 * 4. Компонент ре-рендерится ТОЛЬКО если изменились errors или isSubmitting
 */

import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// ─── Zod-схема ────────────────────────────────────────────────────────────────
// Декларативное описание всех правил валидации в одном месте.
// Легко тестировать отдельно от компонента!
const schema = z.object({
  firstName: z.string()
    .min(1, 'Имя обязательно')          // .min(1) = не пустая строка
    .min(2, 'Минимум 2 символа'),        // второй .min(2) = проверка длины
  lastName: z.string()
    .min(1, 'Фамилия обязательна')
    .min(2, 'Минимум 2 символа'),
  email: z.string()
    .min(1, 'Email обязателен')
    .email('Некорректный email'),         // .email() — RFC-совместимая валидация
  password: z.string()
    .min(1, 'Пароль обязателен')
    .min(8, 'Минимум 8 символов')
    .regex(/[A-Z]/, 'Нужна хотя бы одна заглавная буква')
    .regex(/[0-9]/, 'Нужна хотя бы одна цифра'),
  confirmPassword: z.string()
    .min(1, 'Подтвердите пароль'),
  role: z.string()
    .min(1, 'Выберите роль'),
  agree: z.boolean()
    .refine(v => v === true, 'Необходимо принять условия'),
  // .refine() — произвольная проверка. Принимает функцию-предикат.
  // Если функция вернёт false → Zod использует сообщение из второго аргумента.
})
// Кросс-полевая валидация: пароли должны совпадать.
// .refine() на уровне объекта (не поля) получает весь объект данных.
// path: ['confirmPassword'] — куда «положить» ошибку
.refine(
  data => data.password === data.confirmPassword,
  { message: 'Пароли не совпадают', path: ['confirmPassword'] }
)

// z.infer<typeof schema> — TypeScript тип, автоматически выведенный из схемы.
// Не нужно писать интерфейс вручную — Zod делает это за нас!
type FormData = z.infer<typeof schema>

// Симуляция запроса к серверу
async function fakeApi(data: FormData): Promise<void> {
  await new Promise(r => setTimeout(r, 1000))
  // Сервер возвращает ошибку если email уже занят
  if (data.email.includes('taken@')) {
    throw new Error('EMAIL_TAKEN')
  }
}

export default function GoodFormRHF() {
  // useRef для счётчика ре-рендеров — для сравнения с BadForm
  const renderCount = useRef(0)
  renderCount.current += 1

  // useForm — главный хук RHF.
  // resolver: zodResolver(schema) — подключаем Zod для валидации
  // mode: 'onTouched' — показывать ошибки после того как поле потеряло фокус
  const {
    register,       // функция для подключения поля к форме
    handleSubmit,   // обёртка для onSubmit — вызывает валидацию перед вызовом нашего коллбэка
    formState: { errors, isSubmitting }, // errors — объект с ошибками; isSubmitting — идёт ли запрос
    setError,       // программно установить ошибку (для серверных ошибок)
    reset,          // сбросить форму в начальное состояние
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  })

  const onSubmit = async (data: FormData) => {
    // handleSubmit вызывает эту функцию ТОЛЬКО если Zod-валидация прошла успешно.
    // data уже типизирована как FormData — всё безопасно.
    try {
      await fakeApi(data)
      reset() // сбрасываем форму после успешной отправки
      alert('Регистрация успешна! (В реальном приложении — редирект или toast)')
    } catch {
      // Серверная ошибка — кладём её прямо в поле email, не в alert()!
      // setError(fieldName, { message }) — RHF покажет ошибку под нужным полем
      setError('email', { message: 'Этот email уже занят' })
    }
  }

  // Вспомогательная функция для стиля инпута с ошибкой
  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '0.4rem 0.6rem',
    borderRadius: 6,
    border: `1px solid ${hasError ? '#ef4444' : '#ccc'}`,
    marginTop: 4,
    boxSizing: 'border-box',
  })

  return (
    <div style={{ position: 'relative' }}>
      {/* Счётчик ре-рендеров — сравни с BadForm! */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: '#22c55e',
          color: '#fff',
          borderRadius: 6,
          padding: '2px 8px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
        }}
      >
        Ре-рендеры: {renderCount.current}
      </div>

      <h2>2.2 — React Hook Form + Zod</h2>
      <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
        Введи данные — счётчик ре-рендеров почти не растёт!
      </p>

      {/* handleSubmit(onSubmit) — RHF сначала валидирует, потом вызывает onSubmit */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <label htmlFor="firstName" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Имя</label>
            {/* register('firstName') возвращает { name, ref, onChange, onBlur }
                Эти атрибуты подключают поле к RHF без управляемого состояния */}
            <input
              id="firstName"
              type="text"
              style={inputStyle(!!errors.firstName)}
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              {...register('firstName')}
            />
            {errors.firstName && (
              <span id="firstName-error" role="alert" style={{ color: '#ef4444', fontSize: '0.8rem' }}>
                {errors.firstName.message}
              </span>
            )}
          </div>
          <div>
            <label htmlFor="lastName" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Фамилия</label>
            <input
              id="lastName"
              type="text"
              style={inputStyle(!!errors.lastName)}
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              {...register('lastName')}
            />
            {errors.lastName && (
              <span id="lastName-error" role="alert" style={{ color: '#ef4444', fontSize: '0.8rem' }}>
                {errors.lastName.message}
              </span>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Email</label>
          <input
            id="email"
            type="email"
            style={inputStyle(!!errors.email)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <span id="email-error" role="alert" style={{ color: '#ef4444', fontSize: '0.8rem' }}>
              {errors.email.message}
            </span>
          )}
          <small style={{ color: '#888', fontSize: '0.75rem' }}>
            Попробуй: taken@example.com — сервер вернёт ошибку
          </small>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="password" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Пароль</label>
          <input
            id="password"
            type="password"
            style={inputStyle(!!errors.password)}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          {errors.password && (
            <span id="password-error" role="alert" style={{ color: '#ef4444', fontSize: '0.8rem' }}>
              {errors.password.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="confirmPassword" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Подтверждение пароля</label>
          <input
            id="confirmPassword"
            type="password"
            style={inputStyle(!!errors.confirmPassword)}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <span id="confirmPassword-error" role="alert" style={{ color: '#ef4444', fontSize: '0.8rem' }}>
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="role" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Роль</label>
          <select
            id="role"
            style={{ ...inputStyle(!!errors.role), background: '#fff' }}
            aria-invalid={!!errors.role}
            {...register('role')}
          >
            <option value="">Выберите роль</option>
            <option value="student">Студент</option>
            <option value="teacher">Преподаватель</option>
          </select>
          {errors.role && (
            <span role="alert" style={{ color: '#ef4444', fontSize: '0.8rem' }}>
              {errors.role.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            id="agree"
            type="checkbox"
            {...register('agree')}
          />
          <label htmlFor="agree" style={{ fontSize: '0.85rem' }}>Принимаю условия</label>
          {errors.agree && (
            <span role="alert" style={{ color: '#ef4444', fontSize: '0.8rem' }}>
              {(errors.agree as { message?: string }).message}
              {/* TypeScript для boolean полей типизирует ошибку как {},
                  поэтому нужен явный каст. Это особенность RHF + Zod. */}
            </span>
          )}
        </div>

        {/* isSubmitting — true пока выполняется async onSubmit.
            Кнопка заблокирована → нет двойных запросов */}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Отправляем...' : 'Зарегистрироваться'}
        </button>
      </form>

      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: 8, fontSize: '0.82rem', border: '1px solid #86efac' }}>
        <strong>Улучшения по сравнению с BadForm:</strong>
        <ul style={{ marginTop: 6, paddingLeft: '1.2rem' }}>
          <li>Минимум ре-рендеров — данные в DOM, не в state</li>
          <li>Декларативная Zod-схема — все правила в одном месте</li>
          <li>Реальная валидация email (RFC-совместимая)</li>
          <li>Ошибки появляются при потере фокуса (mode: onTouched)</li>
          <li>Серверная ошибка — в поле через setError(), не alert()</li>
          <li>Кнопка заблокирована при отправке (isSubmitting)</li>
          <li>aria-invalid + aria-describedby для доступности</li>
        </ul>
      </div>
    </div>
  )
}
