import {useState} from 'react';
import {useMutation, gql} from '@apollo/react-hooks';
import ProfilePhoto from '../../assets/profile_photo.jpg'
import {ARCHITECTURE_STYLES} from '../../env/env'
import ImageLoader from '../UI&UX/ImageLoader'
import ImageLook from '../UI&UX/ImageLook'
import {AccountPageComponentProps} from '../../types/types'

const PersonalProfileInfo = ({profile, context}: AccountPageComponentProps) => {
    const [image, setImage] = useState(profile.main_photo === '' ? ProfilePhoto : profile.main_photo)
    const [architecture, setArchitecture] = useState<string>(profile.architecture)

    const updateProfilePersonalInfoM = gql`
        mutation updateProfilePersonalInfo($account_id: String!, $architecture: String!, $main_photo: String!) {
            updateProfilePersonalInfo(account_id: $account_id, architecture: $architecture, main_photo: $main_photo) 
        }
    `

    const [updateProfilePersonalInfo] = useMutation(updateProfilePersonalInfoM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateProfilePersonalInfo)
            window.location.reload()
        }
    })

    const onUpdate = () => {
        updateProfilePersonalInfo({
            variables: {
                account_id: context.account_id, architecture, main_photo: image
            }
        })
    }
 
    return (
        <>
            <h1>Account</h1>
            <ImageLook src={image} className='photo_item' alt='account photo' />
            <h4 className='pale'>{profile.username}</h4>
            <select value={architecture} onChange={e => setArchitecture(e.target.value)}>
                {ARCHITECTURE_STYLES.map(el => <option value={el}>{el}</option>)}
            </select>
            <ImageLoader setImage={setImage} />
 
            <button onClick={onUpdate}>Update</button>
        </> 
    )
}

export default PersonalProfileInfo