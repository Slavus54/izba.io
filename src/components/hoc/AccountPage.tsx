import {useState, useMemo, useContext} from 'react';
import {useMutation, gql} from '@apollo/react-hooks';
import {Context} from '../../context/WebProvider'
import Loading from '../UI&UX/Loading'
import ImageLook from '../UI&UX/ImageLook'
import Exit from '../UI&UX/Exit'
import components, {default_component} from '../account/index'

const AccountPage = () => {
    const {change_context, context} = useContext(Context)
    const [profile, setProfile] = useState(null)
    const [page, setPage] = useState(default_component)

    const getProfileM = gql`
        mutation getProfile($account_id: String!) {
            getProfile(account_id: $account_id) {
                account_id
                username
                security_code
                telegram_tag
                architecture
                region
                cords {
                    lat
                    long
                }
                main_photo
                works {
                    shortid
                    text
                    category
                    level
                    photo_url
                    dateUp
                    likes
                }
                account_components {
                    shortid
                    title
                    path
                }
            }
        }
    `
    
    const [getProfile] = useMutation(getProfileM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getProfile)

            if (data.getProfile === null) {
                change_context('update', null)
            } else {
                setProfile(data.getProfile)
            }
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getProfile({
                variables: {
                    account_id: context.account_id
                }
            })
        }
    }, [context.account_id])
    
    return (
        <>
            {profile !== null && 
                <>
                    <div className='sidebar'>
                        {components.map((el, key) => <ImageLook onClick={() => setPage(el)} src={el.icon} min={3} max={3} className='icon sidebar__item' alt='icon' key={key} />)}
                    </div>

                    {page !== null && <page.component profile={profile} context={context} />}

                    <Exit />                  
                </>
            }

            {profile === null && <Loading />}
        </>
    )
}

export default AccountPage