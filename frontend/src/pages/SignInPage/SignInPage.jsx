import React from 'react'
import { useNavigate } from 'react-router-dom' // 1. Import useNavigate
import { WrapperContainerLeft, WrapperContainerRight, WrapperTextLight } from './style'
import InputForm from '../../components/InputForm/InputForm'
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import imageLogo from "../../assets/images/logo-login.png"
import { Image } from 'antd';

const SignInPage = () => {
  const navigate = useNavigate() // 2. Khai báo hook navigate

  const handleNavigateSignUp = () => {
    navigate('/sign-up') 
  }

  const handleNavigateForgotPassword = () => {
    navigate('/forgot-password') 
  }

  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.53)', height: '100vh'}}>
      <div style={{width: '800px', height: '445px', borderRadius: '6px', backgroundColor: '#fff', display: 'flex'}}>
      <WrapperContainerLeft>
        <h1>Xin chào</h1>
        <p>Đăng nhập hoặc tạo tài khoản</p>
        <InputForm style={{marginBottom: '10px'}} placeholder="abc@gmail.com"/>
        <InputForm placeholder="password"/>
        <ButtonComponent 
            bordered={false}
            size={40}
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