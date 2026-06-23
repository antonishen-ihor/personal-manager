import { Circle, Clock, CheckCircle, XmarkCircle, Coins, Cash } from 'iconoir-react'
import { STATUS, STATUS_ORDER, PAYMENT, PAYMENT_ORDER } from '../lib/status.js'

const STATUS_ICON = { not_started: Circle, in_progress: Clock, done: CheckCircle }
const PAYMENT_ICON = { unpaid: XmarkCircle, advance: Coins, paid: Cash }

// Кругла кнопка-іконка статусу: клік перемикає на наступний.
function Chip({ value, order, dict, icons, prefix, onChange }) {
  const key = dict[value] ? value : order[0]
  const Icon = icons[key]
  function next() {
    const i = order.indexOf(key)
    onChange(order[(i + 1) % order.length])
  }
  return (
    <button
      type="button"
      className={`icon-status ${prefix}-${dict[key].cls}`}
      onClick={next}
      title={dict[key].label}
      aria-label={dict[key].label}
    >
      <Icon width={18} height={18} />
    </button>
  )
}

export function StatusIcon({ value, onChange }) {
  return <Chip value={value} order={STATUS_ORDER} dict={STATUS} icons={STATUS_ICON} prefix="st" onChange={onChange} />
}

export function PaymentIcon({ value, onChange }) {
  return <Chip value={value} order={PAYMENT_ORDER} dict={PAYMENT} icons={PAYMENT_ICON} prefix="pp" onChange={onChange} />
}
