import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from 'antd'
import { WrapperContainerLeft, WrapperContainerRight, WrapperTextLight } from './style'
import InputForm from '../../components/InputForm/InputForm'
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent"
import imageLogo from "../../assets/images/logo-login.png"
import { Image } from 'antd'
import { requestPasswordReset } from '../../services/AuthService'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSendEmail = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)
    try {
      const result = await requestPasswordReset(email)
      setMessage(result.message)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.53)', height: '100vh' }}>
      <div style={{ width: '800px', height: '445px', borderRadius: '6px', backgroundColor: '#fff', display: 'flex' }}>
        <WrapperContainerLeft>
          <h1>Khôi phục mật khẩu</h1>
          <p>Nhập địa chỉ email của bạn để lấy lại mật khẩu</p>
          <form onSubmit={handleSendEmail}>
            <InputForm
              style={{ marginBottom: '10px' }}
              placeholder="abc@gmail.com"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            {message && <Alert message={message} type="success" showIcon />}
            {error && <Alert message={error} type="error" showIcon />}
            <ButtonComponent
              bordered={false}
              size={40}
              htmlType="submit"
              loading={isSubmitting}
              styleButton={{
                backgroundColor: 'rgb(255, 57, 69)',
                height: '48px',
                width: '100%',
                border: 'none',
                borderRadius: '4px',
                margin: '26px 0 10px'
              }}
              textButton={'Gửi yêu cầu'}
              styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}
            />
          </form>

          <p>
            Quay lại{' '}
            <WrapperTextLight
              onClick={() => navigate('/sign-in')}
              style={{ cursor: 'pointer' }}
            >
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

export default ForgotPasswordPage