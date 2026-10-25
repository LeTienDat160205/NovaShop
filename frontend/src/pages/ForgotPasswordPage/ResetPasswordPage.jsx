import { useState } from 'react'
import { Alert, Image } from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { WrapperContainerLeft, WrapperContainerRight, WrapperTextLight } from './style'
import InputForm from '../../components/InputForm/InputForm'
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'
import imageLogo from '../../assets/images/logo-login.png'
import { resetPassword } from '../../services/AuthService'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const token = searchParams.get('token') || ''

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.')
      return
    }
    setIsSubmitting(true)
    try {
      const result = await resetPassword(token, password)
      setSuccess(result.message)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.53)', minHeight: '100vh', padding: 16, boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: 800, minHeight: 445, borderRadius: 6, backgroundColor: '#fff', display: 'flex', overflow: 'hidden' }}>
        <WrapperContainerLeft>
          <h1>Đặt lại mật khẩu</h1>
          <p>Chọn mật khẩu mới cho tài khoản NovaShop</p>
          {!token && <Alert message="Liên kết đặt lại mật khẩu không hợp lệ." type="error" showIcon />}
          <form onSubmit={handleSubmit}>
            <InputForm
              style={{ marginBottom: 10 }}
              placeholder="Mật khẩu mới"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <InputForm
              placeholder="Nhập lại mật khẩu mới"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
            {success && <Alert message={success} type="success" showIcon style={{ marginTop: 12 }} />}
            {error && <Alert message={error} type="error" showIcon style={{ marginTop: 12 }} />}
            <ButtonComponent
              bordered={false}
              size={40}
              htmlType="submit"
              loading={isSubmitting}
              disabled={!token || Boolean(success)}
              styleButton={{
                backgroundColor: 'rgb(255, 57, 69)',
                height: 48,
                width: '100%',
                border: 'none',
                borderRadius: 4,
                margin: '26px 0 10px'
              }}
              textButton="Cập nhật mật khẩu"
              styleTextButton={{ color: '#fff', fontSize: 15, fontWeight: 700 }}
            />
          </form>
          <p>
            Quay lại{' '}
            <WrapperTextLight onClick={() => navigate('/sign-in')} style={{ cursor: 'pointer' }}>
              Đăng nhập
            </WrapperTextLight>
          </p>
        </WrapperContainerLeft>
        <WrapperContainerRight>
          <Image src={imageLogo} preview={false} alt="image-logo" height="203px" width="203px" />
          <h4>Mua sắm tại NovaShop</h4>
        </WrapperContainerRight>
      </div>
    </div>
  )
}

export default ResetPasswordPage
