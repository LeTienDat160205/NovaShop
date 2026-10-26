import { useState } from 'react'
import { Alert, Button, Image } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { WrapperContainerLeft, WrapperContainerRight, WrapperTextLight } from './style'
import InputForm from '../../components/InputForm/InputForm'
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import imageLogo from "../../assets/images/logo-login.png"
import { registerUser } from '../../services/AuthService';

const SignUpPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setIsSubmitting(true)
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password })
      navigate('/sign-in', { state: { message: 'Tạo tài khoản thành công. Hãy đăng nhập.' } })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể kết nối máy chủ. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNavigateSignIn = () => {
    navigate('/sign-in')
  }

  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.53)', minHeight: '100vh', boxSizing: 'border-box', padding: '24px 16px'}}>
      <div style={{width: '100%', maxWidth: '800px', minHeight: '485px', height: 'auto', borderRadius: '6px', backgroundColor: '#fff', display: 'flex', position: 'relative', overflow: 'hidden'}}>
      <Button type="text" shape="circle" aria-label="Về trang chủ" title="Về trang chủ" icon={<CloseOutlined />} onClick={() => navigate('/')} style={{position: 'absolute', top: 12, right: 12, zIndex: 1, color: '#263547', background: 'rgba(255, 255, 255, 0.9)'}} />
      <WrapperContainerLeft>
        <h1>Xin chào</h1>
        <p>Đăng nhập hoặc tạo tài khoản</p>
        <form onSubmit={handleSubmit}>
        <InputForm style={{marginBottom: '10px'}} placeholder="Họ và tên" name="name" autoComplete="name" value={form.name} onChange={handleChange} required />
        <InputForm style={{marginBottom: '10px'}} placeholder="Nhập email" type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} required />
        <InputForm style={{marginBottom: '10px'}} placeholder="Nhập mật khẩu" type="password" name="password" autoComplete="new-password" value={form.password} onChange={handleChange} minLength={8} required />
        <InputForm placeholder="Xác nhận mật khẩu" type="password" name="confirmPassword" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} required />
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
            textButton={'Đăng ký'}
            styleTextButton={{color: '#fff', fontSize: '15px', fontWeight: '700'}}
        ></ButtonComponent>
        </form>


        <p>
          Bạn đã có tài khoản?{' '}
          <WrapperTextLight
            onClick={handleNavigateSignIn}
            style={{ cursor: 'pointer' }}
          >
            Đăng nhập
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

export default SignUpPage