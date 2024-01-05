import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import ProfilePhoto from '../../assets/profile_photo.jpg'
//@ts-ignore
import Centum from 'centum.js'
//@ts-ignore
import {Datus, months_titles} from 'datus.js'
import {Context} from '../../context/WebProvider'
import NavigatorWrapper from '../router/NavigatorWrapper'
import Loading from '../UI&UX/Loading'
import ImageLook from '../UI&UX/ImageLook'
import CloseIt from '../UI&UX/CloseIt'
import DataPagination from '../UI&UX/DataPagination'
import {CollectionPropsType} from '../../types/types'

const Profile: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [components, setComponents] = useState<any[]>([])
    const [works, setWorks] = useState<any[]>([])
    const [work, setWork] = useState<any | null>(null)
    const [month, setMonth] = useState<number>(0)
    const [profile, setProfile] = useState<any | null>(null)

    const centum = new Centum()
    const datus = new Datus()

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

    const manageProfileWorkM = gql`
        mutation manageProfileWork($account_id: String!, $option: String!, $text: String!, $category: String!, $level: String!, $photo_url: String!, $dateUp: String!, $coll_id: String!) {
            manageProfileWork(account_id: $account_id, option: $option, text: $text, category: $category, level: $level, photo_url: $photo_url, dateUp: $dateUp, coll_id: $coll_id)
        }
    `

    const [manageProfileWork] = useMutation(manageProfileWorkM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageProfileWork)
            window.location.reload()
        }
    })

    const [getProfile] = useMutation(getProfileM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getProfile)
            setProfile(data.getProfile)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getProfile({
                variables: {
                    account_id: params.id
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (profile !== null) {
            let value = month + 1
            let result = profile.works.filter((el: any) => datus.filter(el.dateUp, 'month', value))
    
            setWorks(result)
        }
    }, [profile, month])
    
    const onLikeWork = () => {
        manageProfileWork({
            variables: {
                account_id: context.account_id, option: 'like', text: '', category: '', level: '', photo_url: '', dateUp: '', coll_id: work.shortid
            }
        })
    }

    return (
        <>
            {profile !== null && context.account_id !== profile.account_id &&
                <>
                    <ImageLook src={profile.main_photo === '' ? ProfilePhoto : profile.main_photo} className='photo_item' alt='account photo' />
                    <h3 className='pale'>{profile.username}</h3>
                    
                    <button onClick={() => centum.telegramLink(profile.telegram_tag)} className='light-btn'>Telegram</button>

                    {work === null ?
                            <>
                                <DataPagination initialItems={profile.works} setItems={setWorks} label='List of works:' />
                                <h4 className='pale'>Filter by month</h4>
                                <div className='items small'>
                                    {months_titles.map((el: string, idx: number) => <div onClick={() => setMonth(idx)} className={idx === month ? 'item label active' : 'item label'}>{el}</div>)}
                                </div>
                                <div className='items half'>
                                    {works.map(el => 
                                        <div onClick={() => setWork(el)} className='item card'>
                                            {centum.shorter(el.text)}
                                            <div className='items small'>
                                                <h5 className='pale'>Type: {el.category}</h5>
                                                <h5 className='pale'><b>{el.likes}</b> likes</h5>
                                            </div> 
                                        </div>    
                                    )}
                                </div>
                            </>
                        :
                            <>
                                <CloseIt onClick={() => setWork(null)} />
                                {work.photo_url !== '' && <ImageLook src={work.photo_url} className='photo_item' alt='work image' />}
                                <h3>{work.text}</h3>

                                <div className='items small'>
                                    <h5 className='pale'>Difficulty: {work.level}</h5>
                                    <h5 className='pale'>Date: {work.dateUp}</h5>
                                </div>

                                <button onClick={onLikeWork}>Like</button>
                            </>
                    }

                    <DataPagination initialItems={profile.account_components} setItems={setComponents} label='List of components:' />
                    <div className='items half'>
                        {components.map(el => 
                            <div className='item label'>
                                <NavigatorWrapper id='' isRedirect={false} url={`/${el.path}/${el.shortid}`}>
                                    {centum.shorter(el.title, 2)}
                                </NavigatorWrapper>    
                            </div>
                        )}
                    </div>
                </>
            }

            {profile === null && <Loading />}
        </>
    )
}

export default Profile