import React from 'react'
import HeaderCompoment from '../HeaderCompoment/HeaderCompoment'

const DefaultCompoment = ({ children })  => {
    return (
        <div>
            <HeaderCompoment/>
            {children}
        </div>
    )
}

export default DefaultCompoment 
