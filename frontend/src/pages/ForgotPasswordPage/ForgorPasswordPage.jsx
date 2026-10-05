import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WrapperContainerLeft, WrapperContainerRight, WrapperTextLight } from './style'
import InputForm from '../../components/InputForm/InputForm'
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent"
import imageLogo from "../../assets/images/logo-login.png"
import { Image } from 'antd'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleOnChangeEmail = (value) => {
    setEmail(value)
  }

  const handleNavigateSignIn = () => {
    navigate('/sign-in')
  }

  const handleSendEmail = () => {
    // Xử lý gửi email lấy lại mật khẩu ở đây
    console.log('Gửi email khôi phục tới:', email)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.53)', height: '100vh' }}>
      <div style={{ width: '800px', height: '445px', borderRadius: '6px', backgroundColor: '#fff', display: 'flex' }}>
        <WrapperContainerLeft>
          <h1>Khôi phục mật khẩu</h1>
          <p>Nhập địa chỉ email của bạn để lấy lại mật khẩu</p>
          
          <InputForm 
            style={{ marginBottom: '10px' }} 
            placeholder="abc@gmail.com"
            value={email}
            onChange={handleOnChangeEmail}
          />

          <ButtonComponent 
            bordered={false}
            size={40}
            onClick={handleSendEmail}
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

          <p>
            Quay lại{' '}
            <WrapperTextLight 
              onClick={handleNavigateSignIn} 
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