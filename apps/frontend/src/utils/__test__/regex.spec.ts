import { describe, expect, it } from 'vitest'
import { isValidEmail, isValidPassword } from '../regex'

describe('验证', () => {
  it('邮箱格式正确', () => {
    expect(isValidEmail('zhangsan@qq.com')).toBe(true)
  })

  it('密码格式正确', () => {
    expect(isValidPassword('123456')).toBe(true)
  })
})
