import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {ARCHITECTURE_STYLES, VIEW_CONFIG, token} from '../../env/env'
import towns from '../../env/towns.json'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import ImageLoader from '../UI&UX/ImageLoader'
import MapPicker from '../UI&UX/MapPicker'
import FormPagination from '../UI&UX/FormPagination'

const Register = () => {
    const {change_context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [image, setImage] = useState<string>('')
    const [idx, setIdx] = useState<number>(0)
    const [state, setState] = useState({
        username: '', 
        security_code: '', 
        telegram_tag: '',
        architecture: ARCHITECTURE_STYLES[0],
        region: towns[0].title, 
        cords: towns[0].cords
    })

    const centum = new Centum()

    const {username, security_code, telegram_tag, architecture, region, cords} = state

    const registerM = gql`
        mutation register($username: String!, $security_code: String!, $telegram_tag: String!, $architecture: String!, $region: String!, $cords: ICord!, $main_photo: String!) {
            register(username: $username, security_code: $security_code, telegram_tag: $telegram_tag, architecture: $architecture, region: $region, cords: $cords, main_photo: $main_photo) {
                account_id
                username
            }
        }
    `

    const [register] = useMutation(registerM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.register)
            change_context('update', data.register, 1)
        }
    })

    useMemo(() => {
        if (region !== '') {
            let result = towns.find(el => centum.search(el.title, region, 50)) 
    
            if (result !== undefined) {
                setState({...state, region: result.title, cords: result.cords})
            }           
        }
    }, [region])

    useMemo(() => {
        setView({...view, latitude: cords.lat, longitude: cords.long, zoom: 17})
    }, [cords])

    const onCreate = () => {
        register({
            variables: {
                username, security_code, telegram_tag, architecture, region, cords, main_photo: image
            }
        })
    }

    return (
        <div className='main'>          
            <FormPagination label='Create an Account' num={idx} setNum={setIdx} items={[
                    <>
                        <h3 className='pale'>Name and Security Code</h3>
                        <input value={username} onChange={e => setState({...state, username: e.target.value})} placeholder='Your fullname' type='text' />
                        <input value={security_code} onChange={e => setState({...state, security_code: e.target.value})} placeholder='Security code' type='text' />
                    </>,
                    <>
                        <h3 className='pale'>Telegram, Style and Photo</h3>
                        <input value={telegram_tag} onChange={e => setState({...state, telegram_tag: e.target.value})} placeholder='Telegram tag' type='text' />
                        <select value={architecture} onChange={e => setState({...state, architecture: e.target.value})}>
                            {ARCHITECTURE_STYLES.map(el => <option value={el}>{el}</option>)}
                        </select>
                        <ImageLoader setImage={setImage} />
                    </>,
                    <>
                        <input value={region} onChange={e => setState({...state, region: e.target.value})} placeholder='Nearest town' type='text' />
                        <ReactMapGL onClick={e => setState({...state, cords: centum.mapboxCords(e)})} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token} className='map'>
                            <Marker latitude={cords.lat} longitude={cords.long}>
                                <MapPicker type='picker' />
                            </Marker>
                        </ReactMapGL>  
                    </>
                ]} 
            />

            <button onClick={onCreate}>Start</button>
        </div>
    )
}

export default Register