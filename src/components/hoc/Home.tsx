import {useContext} from 'react';
import {createPortal} from 'react-dom'
import {Context} from '../../context/WebProvider'
import Welcome from '../hoc/Welcome'
import Footer from '../account/Footer'
import AccountPage from '../hoc/AccountPage'

const Home = () => {
    const {context} = useContext(Context)
    
    return (
        <>
            {context.account_id === '' ? <Welcome /> : <AccountPage />}  
            {createPortal(<Footer />, document.getElementById('dev')!)}
        </>
    )
}

export default Home