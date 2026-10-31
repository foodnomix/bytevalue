export const INR = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

export const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const MONTH_NAMES_FULL = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export const PLATFORM_COLOR = {
  swiggy: '#F97316',
  zomato: '#E23744',
} as const

export function formatReportNo(n: number): string {
  return `Report ${String(n).padStart(2, '0')}`
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start || !end) return ''
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const sMonth = s.getMonth() + 1
  const eMonth = e.getMonth() + 1
  const sDay = s.getDate()
  const eDay = e.getDate()
  const sYear = s.getFullYear()
  const eYear = e.getFullYear()
  const lastDay = new Date(eYear, eMonth, 0).getDate()

  if (sDay === 1 && eDay === lastDay && sMonth === eMonth && sYear === eYear) {
    return `${MONTH_NAMES_FULL[sMonth]} ${sYear}`
  }

  const sName = MONTH_NAMES[sMonth]
  const eName = MONTH_NAMES[eMonth]

  if (sMonth === eMonth && sYear === eYear) {
    return `${sDay}-${eDay} ${sName} ${sYear}`
  }

  return `${sDay} ${sName} - ${eDay} ${eName} ${eYear}`
}
