/**
 * 验证邮箱格式
 * @param email 邮箱
 * @returns
 */
export function isValidEmail(email: string) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  return regex.test(email)
}

/**
 * 只允许数字、字母、符号，禁止空格，长度6-16个字符
 * @param password 密码
 * @returns
 */
export function isValidPassword(password: string) {
  const regex = /^[^\s]{6,16}$/
  return regex.test(password)
}
