/** The backend accepts passwords of 8..72 bytes (bcrypt limit). */
export const isPasswordLengthValid = (password: string): boolean => {
  const bytes = new TextEncoder().encode(password).length
  return bytes >= 8 && bytes <= 72
}

export const isEmailLike = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
