// Shared form checks used by Register, Forgot Password, Report and Officer pages

// text@domain.tld  (a plain "abc@gmail" is NOT accepted)
export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())

// Indian mobile number: exactly 10 digits, starting with 6, 7, 8 or 9
export const isValidPhone = (value: string): boolean =>
  /^[6-9]\d{9}$/.test(value)

export const MAX_IMAGE_MB = 5

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Returns an error message, or '' when the image is fine
export function validateImageFile(file: File): string {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPG, PNG or WebP images are allowed.'
  }

  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
    return `This image is ${sizeMb} MB. The maximum allowed size is ${MAX_IMAGE_MB} MB.`
  }

  return ''
}
