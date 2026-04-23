/**
 * 🔹 2.3 Альтернативный вариант — Formik + Yup
 *
 * FORMIK vs REACT HOOK FORM:
 * Formik — управляемые (controlled) инпуты: значения хранятся в state через Formik.
 * RHF — неуправляемые: значения в DOM, минимум ре-рендеров.
 * → RHF быстрее на больших формах, Formik проще концептуально.
 *
 * YUP vs ZOD:
 * Yup — старый стандарт, много проектов на нём. API на промисах.
 * Zod — современный, лучшая TypeScript-интеграция, синхронный.
 * → Для новых проектов предпочтительнее Zod, но Yup всё ещё очень популярен.
 *
 * КАК РАБОТАЕТ FORMIK:
 * useFormik() возвращает объект formik со всем необходимым:
 * - formik.values    — текущие значения полей
 * - formik.errors    — ошибки валидации
 * - formik.touched   — поля, которые были в фокусе
 * - formik.handleChange / handleBlur — обработчики для полей
 * - formik.isSubmitting — идёт ли запрос
 */

import { useRef } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'

// ─── Yup-схема ────────────────────────────────────────────────────────────────
// Yup-схема похожа на Zod, но с другим API.
// .required() — поле обязательно (аналог .min(1) в Zod)
// .oneOf([yup.ref('password')]) — кросс-полевая валидация (аналог .refine() в Zod)
const schema = yup.object({
  firstName: yup.string()
    .min(2, 'Минимум 2 символа')
    .required('Имя обязательно'),
  lastName: yup.string()
    .min(2, 'Минимум 2 символа')
    .required('Фамилия обязательна'),
  email: yup.string()
    .email('Некорректный email')
    .required('Email обязателен'),
  password: yup.string()
    .min(8, 'Минимум 8 символов')
    .matches(/[A-Z]/, 'Нужна хотя бы одна заглавная буква')
    .matches(/[0-9]/, 'Нужна хотя бы одна цифра')
    .required('Пароль обязателен'),
  confirmPassword: yup.string()
    // yup.ref('password') — ссылка на поле password в той же схеме
    .oneOf([yup.ref('password')], 'Пароли не совпадают')
    .required('Подтвердите пароль'),
  role: yup.string()
    .required('Выберите роль'),
  agree: yup.boolean()
    .oneOf([true], 'Необходимо принять условия')
    .required(),
})

// Тип значений формы — выводим из схемы Yup
// (менее удобно чем z.infer<> в Zod, нужен отдельный интерфейс)
interface FormValues {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  role: string
  agree: boolean
}

// Симуляция API-запроса
async function fakeApi(values: FormValues): Promise<void> {
  await new Promise(r => setTimeout(r, 1000))
  if (values.email.includes('taken@')) {
    throw new Error('EMAIL_TAKEN')
  }
}

export default function GoodFormFormik() {
  const renderCount = useRef(0)
  renderCount.current += 1

  // useFormik — основной хук Formik
  const formik = useFormik<FormValues>({
    // initialValues — начальные значения ВСЕХ полей (обязательно!)
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      agree: false,
    },
    // validationSchema — Yup-схема. Formik вызывает её автоматически.
    validationSchema: schema,
    // validateOnBlur: true (дефолт) — валидировать при потере фокуса
    // validateOnChange: false — не валидировать при каждом символе (улучшает UX)
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values, { setFieldError, resetForm }) => {
      // values — валидированные данные
      // setFieldError — для серверных ошибок (аналог setError в RHF)
      // resetForm — сбросить форму
      try {
        await fakeApi(values)
        resetForm()
        alert('Регистрация успешна!')
      } catch {
        // Серверная ошибка — кладём в поле, не в alert()
        setFieldError('email', 'Этот email уже занят')
      }
    },
  })

  // Вспомогательная функция: показывать ли ошибку поля?
  // В Formik ошибка показывается только если поле было «тронуто» (touched)
  const showError = (field: keyof FormValues) =>
    !!(formik.touched[field] && formik.errors[field])

  const inputStyle = (field: keyof FormValues): React.CSSProperties => ({
    width: '100%',
    padding: '0.4rem 0.6rem',
    borderRadius: 6,
    border: `1px solid ${showError(field) ? '#ef4444' : '#ccc'}`,
    marginTop: 4,
    boxSizing: 'border-box',
  })

  return (
    <div style={{ position: 'relative' }}>
      {/* Счётчик ре-рендеров — Formik использует controlled инпуты,
          поэтому ре-рендеров больше чем в RHF, но меньше чем в BadForm */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: '#f59e0b',
          color: '#fff',
          borderRadius: 6,
          padding: '2px 8px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
        }}
      >
        Ре-рендеры: {renderCount.current}
      </div>

      <h2>2.3 — Formik + Yup</h2>
      <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
        Controlled инпуты → больше ре-рендеров чем в RHF, но меньше чем в BadForm
      </p>

      {/* formik.handleSubmit — обёртка Formik вокруг нашего onSubmit */}
      <form onSubmit={formik.handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <label htmlFor="firstName" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Имя</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              // value + onChange + onBlur — стандартный паттерн Formik
              // В отличие от RHF, здесь явно управляемый инпут через state Formik
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={showError('firstName')}
              style={inputStyle('firstName')}
            />
            {showError('firstName') && (
              <span role="alert" style={{ color: '#ef4444', fontSize: '0.8rem' }}>
                {formik.errors.firstName}
              </span>
            )}
          </div>
          <div>
            <label htmlFor="lastName" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Фамилия</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={showError('lastName')}
              style={inputStyle('lastName')}
            />
            {showError('lastName') && (
              <span role="alert" style={{ color: '#ef4444', fontSize: '0.8rem' }}>
                {formik.errors.lastName}
              </span>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={showError('email')}
            style={inputStyle('email')}
          />
          {showError('email') && (
            <span role="alert" style={{ color: '#ef4444', fontSize: '0.8rem' }}>
              {formik.errors.email}
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
            name="password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={showError('password')}
            style={inputStyle('password')}
          />
          {showError('password') && (
            <span role="alert" style={{ color: '#ef4444', fontSize: '0.8rem' }}>
              {formik.errors.password}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="confirmPassword" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Подтверждение пароля</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={showError('confirmPassword')}
            style={inputStyle('confirmPassword')}
          />
          {showError('confirmPassword') && (
            <span role="alert" style={{ color: '#ef4444', fontSize: '0.8rem' }}>
              {formik.errors.confirmPassword}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="role" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Роль</label>
          <select
            id="role"
            name="role"
            value={formik.values.role}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={showError('role')}
            style={{ ...inputStyle('role'), background: '#fff' }}
          >
            <option value="">Выберите роль</option>
            <option value="student">Студент</option>
            <option value="teacher">Преподаватель</option>
          </select>
          {showError('role') && (
            <span role="alert" style={{ color: '#ef4444', fontSize: '0.8rem' }}>
              {formik.errors.role}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            id="agree"
            name="agree"
            type="checkbox"
            checked={formik.values.agree}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <label htmlFor="agree" style={{ fontSize: '0.85rem' }}>Принимаю условия</label>
          {showError('agree') && (
            <span role="alert" style={{ color: '#ef4444', fontSize: '0.8rem' }}>
              {formik.errors.agree as string}
            </span>
          )}
        </div>

        {/* formik.isSubmitting — аналог isSubmitting в RHF */}
        <button type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? 'Отправляем...' : 'Зарегистрироваться'}
        </button>
      </form>

      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fefce8', borderRadius: 8, fontSize: '0.82rem', border: '1px solid #fde68a' }}>
        <strong>Formik vs React Hook Form:</strong>
        <ul style={{ marginTop: 6, paddingLeft: '1.2rem' }}>
          <li><strong>Formik:</strong> controlled инпуты, проще концептуально, больше ре-рендеров</li>
          <li><strong>RHF:</strong> uncontrolled инпуты (через ref), минимум ре-рендеров, лучше производительность</li>
          <li><strong>Yup:</strong> зрелый, много примеров, работает на промисах</li>
          <li><strong>Zod:</strong> лучшая TS-интеграция, синхронный, более современный</li>
          <li>Для новых проектов: <strong>RHF + Zod</strong> — современный стандарт</li>
        </ul>
      </div>
    </div>
  )
}
