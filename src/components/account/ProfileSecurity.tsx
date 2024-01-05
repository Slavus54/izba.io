import {useState, useMemo} from 'react';
import {useMutation, gql} from '@apollo/react-hooks'
import {CODE_ATTEMPTS} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {AccountPageComponentProps} from '../../types/types'

const ProfileSecurity = ({profile, context}: AccountPageComponentProps) => {
    const [flag, setFlag] = useState(false)
    const [attempts, setAttempts] = useState<number>(CODE_ATTEMPTS)
    const [percent, setPercent] = useState(50)
    const [state, setState] = useState({
        security_code: ''
    })

    const centum = new Centum()

    const {security_code} = state

    const updateProfileSecurityCodeM = gql`
        mutation updateProfileSecurityCode($account_id: String!, $security_code: String!) {
            updateProfileSecurityCode(account_id: $account_id, security_code: $security_code)
        }
    `

    const [updateProfileSecurityCode] = useMutation(updateProfileSecurityCodeM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateProfileSecurityCode)
            window.location.reload()
        }
    })

    useMemo(() => {
        if (flag) {
            setState({...state, security_code: centum.password(percent / 10)})
        }
    }, [flag, percent])

    useMemo(() => {
        if (attempts === 0) {
            window.location.reload()
        }
    }, [attempts])

    const onUpdate = async () => {
        if (flag) {
            updateProfileSecurityCode({
                variables: {
                    account_id: context.account_id, security_code
                }
            })
        } else if (profile.security_code === security_code) {
            setFlag(true)
        } else {
            setAttempts(attempts > 0 ? attempts - 1 : 0)
        }
    }
    
    return (
        <>
            <h1>Security</h1>

            <input value={security_code} onChange={e => setState({...state, security_code: e.target.value})} placeholder='Security code' type='text' />
            {flag ? 
                    <>
                        <h4>Secure: {percent}%</h4>
                        <input value={percent} onChange={e => setPercent(parseInt(e.target.value))} type='range' step={1} />
                    </>
                :
                    <h4 className='pale'>{attempts} attempts to enter code</h4>                                   
            }
        
            <button onClick={onUpdate}>{flag ? 'Update' : 'Check'}</button>
        </> 
    )
}

export default ProfileSecurity