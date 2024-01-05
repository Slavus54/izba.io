import React from 'react'
import NavigatorWrapper from '../router/NavigatorWrapper'
import CollagePhoto from '../../assets/collage.jpg'
import {WELCOME_LINK} from '../../env/env'

const Welcome: React.FC = () => {
    
    const onView = (): void => {
        window.open(WELCOME_LINK)
    }

    return (
        <>          
            <h1>Izba.IO</h1>
            <p className='pale'>Platform for citizens, who admire wooden architecture</p>
            <img onClick={onView} src={CollagePhoto} className='collage_item' alt='collage' />
            <NavigatorWrapper isRedirect={false} url='/register'>
                <button>Start</button>
            </NavigatorWrapper>
        </>
    )
}

export default Welcome