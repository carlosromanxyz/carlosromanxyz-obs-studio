/**
 * Accordion Manager
 */

function toggleAccordion(section) {
  const content = document.getElementById(`${section}-content`)
  const chevron = document.getElementById(`${section}-chevron`)

  if (content.classList.contains('hidden')) {
    content.classList.remove('hidden')
    chevron.style.transform = 'rotate(180deg)'
  } else {
    content.classList.add('hidden')
    chevron.style.transform = 'rotate(0deg)'
  }
}
