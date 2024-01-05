import React, {useState, useContext} from 'react';
import {useMutation, gql} from '@apollo/react-hooks';
import {Context} from '../../context/WebProvider'

const Login = () => {
    const {change_context} = useContext(Context)
    const [state, setState] = useState({
        security_code: ''
    })

    const {security_code} = state

    const loginM = gql`
        mutation login($security_code: String!) {
            login(security_code: $security_code) {
                account_id
                username
            }
        }
    `

    const [login] = useMutation(loginM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.login)
            change_context('update', data.login, 3)
        }
    })

    const onLogin = () => {
        login({
            variables: {
                security_code
            }
        })
    }

    return (
        <div className='main'>
            <h1>Welcome back!</h1>
            <input value={security_code} onChange={e => setState({...state, security_code: e.target.value})} placeholder='Security code' type='text' />           

            <button onClick={onLogin}>Login</button>
        </div>
    )
}

export default Login