const UserError = require('./errors/UserError')

const _capitalize = string => {
  if (typeof string !== 'string') return ''
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const _getUsername = name => {
  const [firstName, lastName] = name.split('.')
  const username = `${_capitalize(firstName)} ${_capitalize(lastName)}`
  return username
}

const _isStudent = domain => {
  if (domain.includes('aluno')) return true
  else return false
}

const validateEmail = email => {
  const [, domain] = email ? email.split('@') : [null, null]
  if (!domain.includes('faculdadeimpacta.com.br')) throw new UserError('not authorized', 403)
}

const validateCourse = courses => courses.some(course => course.name.includes('Oficina de Projeto de Empresa') && course.section.includes('TODOS'))

const handleEmail = email => {
  const [name, domain] = email.split('@')
  const username = _getUsername(name)
  const isStudent = _isStudent(domain)
  return {
    username,
    isStudent
  }
}

const getOpeCourse = (courses) => {
  let course = null
  courses.forEach(c => {
    const title = c.name.toLowerCase()
    if (title === 'oficina de projeto de empresa 2') {
      course = {
        id: c.id,
        section: c.section
      }
    } else if (!course && title === 'oficina de projeto de empresa 1') {
      course = {
        id: c.id,
        section: c.section
      }
    }
  })
  return course
}

module.exports = {
  handleEmail, validateEmail, validateCourse, getOpeCourse
}
