import React from 'react'
import HeaderCompoment from '../HeaderComponent/HeaderComponent'

const DefaultCompoment = ({ children })  => {
    return (
        <div>
            <HeaderCompoment/>
            {children}
        </div>
    )
}

export default DefaultCompoment 
