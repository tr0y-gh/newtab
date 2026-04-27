const days = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
}
const months = {
  0: 'January',
  1: 'February',
  2: 'Mars',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'December',
}
function formatDate (date) {
  let m = '' + (1 + date.getMonth())
  let d = '' + date.getDate()
  if (m.length === 1) m = 0+m
  if (d.length === 1) d = 0+d
  const day = days[date.getDay()].substr(0, 3)
  const month = months[date.getMonth()].substr(0, 3)
  return `${day} ${month} ${d}`
}
function formatTime (date) {
  let h = '' + date.getHours()
  let m = '' + date.getMinutes()
  if (h.length === 1) h = 0+h
  if (m.length === 1) m = 0+m
  return `${h}:${m}`
}
function format(str, ...args) {
  return str.replace(/%s/g, () => args.shift())
}

const history = JSON.parse(window.localStorage.getItem('history')) || []

document.addEventListener('alpine:init', () => {
  Alpine.data('datetime', () => ({
    current_date: new Date(),
    init () {
      setInterval(() => this.current_date = new Date(), 5000)
    },
    get date () {
      return formatDate(this.current_date)
    },
    get time () {
      return formatTime(this.current_date)
    },
  }))

  Alpine.data('inputsearch', () => ({
    search: '',
    index: -1,
    history,
    get historyFiltered () {
      return this.history.filter(item => {
        const { content } = item
        const match = content.toLowerCase().search(this.search)
        return match !== -1
      })
    },
    onKeydown (e) {
      const { key, ctrlKey, shiftKey } = e
      if (key === 'ArrowDown' || ctrlKey && key === 'j' || !shiftKey && key === 'Tab') {
        e.preventDefault()
        if (this.index === this.historyFiltered.length - 1) {
          this.index = 0
        } else {
          this.index += 1
        }
      }
      if (key === 'ArrowUp' || ctrlKey && key === 'k' || shiftKey && key === 'Tab') {
        e.preventDefault()
        if (this.index === 0) {
          this.index = this.historyFiltered.length - 1
        } else {
          this.index -= 1
        }
      }
    },
    onSubmit () {
      let content
      if (this.index > -1) {
        content = this.historyFiltered[this.index].content
      } else {
        content = this.search
      }

      const url = format('https://duckduckgo.com/?q=%s', content)
      const index = this.history.findIndex(i => i.content === content)
      if (index > -1) {
        this.history[index].count += 1
        this.history[index].created = Date.now()
      } else {
        const item = { content, count: 1, created: Date.now() }
        this.history = [ item, ...this.history ]
      }

      this.search = ''
      window.localStorage.setItem('history', JSON.stringify(this.history))
      window.location.href = encodeURI(url)
    },
  }))
})
