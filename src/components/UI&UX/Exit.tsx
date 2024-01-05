import {useContext} from 'react'
import {EXIT} from '../../env/env'
import ImageLook from '../UI&UX/ImageLook'
import {Context} from '../../context/WebProvider'

const Exit = () => {
    const {change_context, context} = useContext(Context)

    const onExit = () => {
        if (context.account_id === '') {
            window.open('https://www.youtube.com')
        } else {
            change_context('update', null, 1)
        }
    }

    return <ImageLook onClick={onExit} src={EXIT} min={3} max={3} className='icon' alt='exit' />
}

export default Exit