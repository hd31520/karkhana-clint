export const validateRequired = (value) => {
  return !!value?.toString().trim() || 'This field is required'
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email) || 'Please enter a valid email address'
}

export const validatePhone = (phone) => {
  const re = /^(?:\+88|88)?(01[3-9]\d{8})$/
  return re.test(phone) || 'Please enter a valid Bangladeshi phone number'
}

export const validatePassword = (password) => {
  if (password.length < 6) {
    return 'Password must be at least 6 characters long'
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number'
  }
  return true
}

export const validateConfirmPassword = (password, confirmPassword) => {
  return password === confirmPassword || 'Passwords do not match'
}

export const validateNID = (nid) => {
  const re = /^(\d{10}|\d{13}|\d{17})$/
  return re.test(nid) || 'Please enter a valid NID (10, 13, or 17 digits)'
}

export const validateAmount = (amount) => {
  const num = parseFloat(amount)
  return (!isNaN(num) && num > 0) || 'Please enter a valid amount greater than 0'
}

export const validatePositiveNumber = (value) => {
  const num = parseFloat(value)
  return (!isNaN(num) && num >= 0) || 'Please enter a valid number'
}

export const validateURL = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return 'Please enter a valid URL'
  }
}

export const validateDate = (date) => {
  const d = new Date(date)
  return !isNaN(d.getTime()) || 'Please enter a valid date'
}

export const validateTime = (time) => {
  const re = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return re.test(time) || 'Please enter a valid time (HH:MM)'
}

// Form validation schema builder
export const createValidationSchema = (fields) => {
  return (values) => {
    const errors = {}
    
    Object.keys(fields).forEach((field) => {
      const validators = fields[field]
      const value = values[field]
      
      if (Array.isArray(validators)) {
        for (const validator of validators) {
          const result = validator(value, values)
          if (result !== true) {
            errors[field] = result
            break
          }
        }
      } else if (validators) {
        const result = validators(value, values)
        if (result !== true) {
          errors[field] = result
        }
      }
    })
    
    return errors
  }
}