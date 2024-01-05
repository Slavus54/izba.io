import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {HOUSE_TYPES, ARCHITECTURE_STYLES, COUPON_CLIENT_INSTRUCTION, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import Loading from '../UI&UX/Loading'
import CloseIt from '../UI&UX/CloseIt'
import ImageLoader from '../UI&UX/ImageLoader'
import ImageLook from '../UI&UX/ImageLook'
import DataPagination from '../UI&UX/DataPagination'
import MapPicker from '../UI&UX/MapPicker'
import InformationPopup from '../UI&UX/InformationPopup'
import {CollectionPropsType} from '../../types/types'

const Company: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [cords, setCords] = useState<any>({lat: 0, long: 0})
    const [image, setImage] = useState<string>('')
    const [cost, setCost] = useState<number>(0)
    const [distance, setDistance] = useState<number>(0)
    const [houses, setHouses] = useState<any[]>([])
    const [house, setHouse] = useState<any | null>(null)
    const [coupon, setCoupon] = useState<any | null>(null)
    const [company, setCompany] = useState<any | null>(null)
    const [state, setState] = useState<any>({
        title: '',
        category: HOUSE_TYPES[0],
        architecture: ARCHITECTURE_STYLES[0],
        base: 0
    })

    const {title, category, architecture, base} = state

    const centum = new Centum()

    const getCompanyM = gql`
        mutation getCompany($username: String!, $shortid: String!) {
            getCompany(username: $username, shortid: $shortid) {
                shortid
                account_id
                username
                title
                category
                format
                base
                coupons {
                    id
                    architecture
                    percent
                }
                region
                cords {
                    lat
                    long
                }
                houses {
                    shortid
                    title
                    category
                    architecture
                    photo_url
                    cords {
                        lat
                        long
                    }
                    likes
                }
            }
        }
    `

    const updateCompanyBaseM = gql`
        mutation updateCompanyBase($username: String!, $id: String!, $base: Float!) {
            updateCompanyBase(username: $username, id: $id, base: $base) 
        }
    `

    const manageCompanyHouseM = gql`
        mutation manageCompanyHouse($username: String!, $id: String!, $option: String!, $title: String!, $category: String!, $architecture: String!, $photo_url: String!, $cords: ICord!, $coll_id: String!) {
            manageCompanyHouse(username: $username, id: $id, option: $option, title: $title, category: $category, architecture: $architecture, photo_url: $photo_url, cords: $cords, coll_id: $coll_id) 
        }
    `

    const [manageCompanyHouse] = useMutation(manageCompanyHouseM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageCompanyHouse)
            window.location.reload()
        }
    })

    const [updateCompanyBase] = useMutation(updateCompanyBaseM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateCompanyBase)
            window.location.reload()
        }
    })

    const [getCompany] = useMutation(getCompanyM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getCompany)
            setCompany(data.getCompany)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getCompany({
                variables: {
                    username: context.username, shortid: params.id
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (company !== null) {
            setState({...state, base: company.base})  
            setCords({lat: company.cords.lat, long: company.cords.long})    
        }
    }, [company])

    useMemo(() => {
        setView({...view, latitude: cords.lat, longitude: cords.long, zoom: 17})
    }, [cords])

    useMemo(() => {
        if (coupon !== null) {
            setCost(centum.part(coupon.percent, company.base, 1))
        }
    }, [coupon])

    useMemo(() => {
        if (company !== null && house !== null) {
            let {lat, long} = company.cords

            setDistance(centum.haversine([lat, long, house.cords.lat, house.cords.long], 1))
        }
    }, [house])
    
    const onManageHouse = (option: string) => {
        manageCompanyHouse({
            variables: {
                username: context.username, id: params.id, option, title, category, architecture, photo_url: image, cords, coll_id: house === null ? '' : house.shortid
            }
        })
    }

    const onUpdateBase = () => {
        updateCompanyBase({
            variables: {
                username: context.username, id: params.id, base
            }
        })
    }

    return (
        <>
            {company !== null && 
                <>
                    <h1>{company.title}</h1>

                    <h2>Charity Coupons</h2>
                    <InformationPopup text={COUPON_CLIENT_INSTRUCTION} />
                    <div className='items half'>
                        {company.coupons.map((el: any) => 
                            <div onClick={() => setCoupon(el)} className='item card'>
                                <h5 className='pale'>Style: {el.architecture}</h5>
                                <h5 className='pale'><b>{el.percent}%</b></h5>
                            </div>    
                        )}
                    </div>

                    {coupon !== null &&
                        <>
                            <CloseIt onClick={() => setCoupon(null)} />
                            <h2>ID - {coupon.id}</h2>

                            <div className='items small'>
                                <h4 className='pale'>Architecture: {coupon.architecture}</h4>
                                <h4 className='pale'>Cost: {cost}€</h4>
                            </div>
                        </>
                    }

                    {context.username === company.username &&
                        <>
                            <h2>Cheapest Product's Cost (€)</h2>
                            <input value={base} onChange={e => setState({...state, base: parseInt(e.target.value)})} placeholder='Volume in euro' type='text' />
                            {isNaN(base) ? 
                                    <button onClick={() => setState({...state, base: company.base})}>Reset</button> 
                                : 
                                    <button onClick={onUpdateBase}>Update</button>
                            }

                            <h2>New House</h2>
                            <input value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Title of house' type='text' />
                            <select value={category} onChange={e => setState({...state, category: e.target.value})}>
                                {HOUSE_TYPES.map(el => <option value={el}>{el}</option>)}
                            </select>
                            <ImageLoader setImage={setImage} />
                            <button onClick={() => onManageHouse('create')}>Create</button>
                        </>
                    }

                    <DataPagination initialItems={company.houses} setItems={setHouses} />
                    <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token} className='map'>
                        <Marker latitude={company.cords.lat} longitude={company.cords.long}>
                            <MapPicker type='home' />
                        </Marker>
                        <Marker latitude={cords.lat} longitude={cords.long}>
                            <MapPicker type='picker' />
                        </Marker>
                        {houses.map(el => 
                            <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                                <b onClick={() => setHouse(el)}>{centum.shorter(el.title)}</b>
                            </Marker>
                        )}
                    </ReactMapGL>  

                    {house !== null &&
                        <>
                            <CloseIt onClick={() => setHouse(null)} />
                            {house.photo_url !== '' && <ImageLook src={house.photo_url} className='photo_item' alt='house photo' />}
                            <h2>{house.title}</h2>

                            <div className='items small'>
                                <h4 className='pale'>Type: {house.category}</h4>
                                <h4 className='pale'>Distance: {distance}m</h4>
                                <h4 className='pale'><b>{house.likes}</b> likes</h4>
                            </div>

                            {context.username === company.username ? 
                                    <button onClick={() => onManageHouse('delete')}>Delete</button>
                                :
                                    <button onClick={() => onManageHouse('like')}>Like</button>
                            }
                        </>
                    }
                </>
            }

            {company === null && <Loading />}
        </>
    )
}

export default Company