import each from 'lodash/each' // each function from lodash, for iterating over collections.

// This function is exported and designed to split text content within an HTML element.
// It takes an object with the properties 'element', 'expression' and 'append'.
export function split ({ element, expression = ' ', append = true}) {
  // Trimming the innerHTML of the provided element and splits it into words using the 'splitText' function.
  const words = splitText(element.innerHTML.toString().trim(), expression)

  // Initializing an empty string innerHTML to store the modified HTML content.
  let innerHTML = ''

  // Iterating over each word in the string and the parsing and modifying them based on the 'parseLine' function.
  each(words, line => {
    if (line.indexOf('<br>') > -1) {
      const lines = line.split('<br>')

      each(lines, (line, index) => {
        innerHTML += (index > 0) ? '<br>' + parseLine(line) : parseLine(line)
      })
    } else {
      innerHTML += parseLine(line)
    }
  })


  element.innerHTML = innerHTML

  const spans = element.querySelectorAll('span')

  if (append) {
    each(spans, span => {
      const isSingleLetter = span.textContent.length === 1
      const isNotEmpty = span.innerHTML.trim() !== ''
      const isNotAndCharacter = span.textContent !== '&'
      const isNotDashCharacter = span.textContent !== '-'

      if (isSingleLetter && isNotEmpty && isNotAndCharacter && isNotDashCharacter) {
        span.innerHTML = `${span.textContent}&nbsp;`
      }
    })
  }
  return spans
}

export function calculate (spans) {
  const lines = []
  let words = []

  let position = spans[8].offsetTop

  each(spans, (span, index) => {
    if (span.offsetTop === position) {
      words.push(span)
    }

    if(span.offsetTop !== position) {
      lines.push(words)

      words = []
      words.push(span)
      position = span.offsetTop
    }

    if (index + 1 === spans.length) {
      lines.push(words)
    }
  })

  return lines
}

function splitText (text, expression) {
  const splits = text.split('<br>')

  let words = []

  each(splits, (item, index) => {
    if (index > 0) {
      words.push('<br>')
    }

    words = words.concat(item.split(expression))

    let isLink = false
    let link = ''

    const innerHTML = []

    each(words, word => {
      if (!isLink && (word.includes('<a') || word.includes('<strong'))) {
        link = ''

        isLink = true
      }

      if (isLink) {
        link += ` ${word}`
      }

      if (isLink && (word.includes('/a>') || word.includes('/strong>'))) {
        innerHTML.push(link)

        link = ''
      }

      if (!isLink && link === '') {
        innerHTML.push(word)
      }

      if (isLink && (word.includes('/a>') || word.includes('/strong>'))) {
        isLink = false
      }
    })

    words = innerHTML
  })

  return words
}

// This function is used internally to parse a line of text.
function parseLine (line) {
  // Trims the line.
  line = line.trim()

  // If the line is empty or contains only spaces, it returns the line.
  if (line === '' || line === ' ') {
    return line
  } else {
    // If the line is a line break ('<br>'), it returns a line break.
    // Otherwise, it wraps the line in a '<span>' element and adds a non-breaking space if the line has more than one character.
    return (line ===  '<br>') ? '<br>' : `<span>${line}</span>` + ((line.length > 1) ? ' ' : '')
  }
}
