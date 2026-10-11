import { useState } from 'react'
import { Alert, Button, Image } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { WrapperContainerLeft, WrapperContainerRight, WrapperTextLight } from './style'
import InputForm from '../../components/InputForm/InputForm'
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import imageLogo from "../../assets/images/logo-login.png"
import { loginUser } from '../../services/AuthService';

const SignInPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [success, setSuccess] = useState(location.state?.message || '')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSuccess('')
    setError('')
    setIsSubmitting(true)

    try {
      const result = await loginUser(form)
      localStorage.setItem('novashop_token', result.token)
      localStorage.setItem('novashop_user', JSON.stringify(result.user))
      window.dispatchEvent(new Event('novashop-auth-changed'))
      navigate('/')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể kết nối máy chủ. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNavigateSignUp = () => {
    navigate('/sign-up') 
  }

  const handleNavigateForgotPassword = () => {
    navigate('/forgot-password') 
  }

  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.53)', minHeight: '100vh', boxSizing: 'border-box', padding: '24px 16px'}}>
      <div style={{width: '100%', maxWidth: '800px', minHeight: '445px', height: 'auto', borderRadius: '6px', backgroundColor: '#fff', display: 'flex', position: 'relative', overflow: 'hidden'}}>
      <Button type="text" shape="circle" aria-label="Về trang chủ" title="Về trang chủ" icon={<CloseOutlined />} onClick={() => navigate('/')} style={{position: 'absolute', top: 12, right: 12, zIndex: 1, color: '#263547', background: 'rgba(255, 255, 255, 0.9)'}} />
      <WrapperContainerLeft>
        <h1>Xin chào</h1>
        <p>Đăng nhập hoặc tạo tài khoản</p>
        <form onSubmit={handleSubmit}>
        {success && <Alert message={success} type="success" showIcon style={{ marginBottom: 12 }} />}
        <InputForm style={{marginBottom: '10px'}} placeholder="abc@gmail.com" type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} required />
        <InputForm placeholder="password" type="password" name="password" autoComplete="current-password" value={form.password} onChange={handleChange} required />
        {error && <Alert message={error} type="error" showIcon style={{ marginTop: 12 }} />}
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
            textButton={'Đăng nhập'}
            styleTextButton={{color: '#fff', fontSize: '15px', fontWeight: '700'}}
        ></ButtonComponent>
        </form>
        <p><WrapperTextLight onClick={handleNavigateForgotPassword} 
         style={{ cursor: 'pointer' }}
         > Quên mật khẩu? 
         </WrapperTextLight></p>

        {/* 3. Thêm onClick và cursor pointer */}
        <p>
          Chưa có tài khoản?{' '}
          <WrapperTextLight 
            onClick={handleNavigateSignUp} 
            style={{ cursor: 'pointer' }}
          >
            Tạo tài khoản
          </WrapperTextLight>
        </p>

      </WrapperContainerLeft>
      <WrapperContainerRight>
        <Image src={imageLogo} preview={false} alt="image-logo" height="203px" width="203px"/>
        <h4>Mua sắm tại NovaShop</h4>
      </WrapperContainerRight>
    </div>
    </div>
  )
}

export default SignInPage