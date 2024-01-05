import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {CRITERIONS, PERIODS, VIEW_CONFIG, token} from '../../env/env'
import towns from '../../env/towns.json'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import Loading from '../UI&UX/Loading'
import CloseIt from '../UI&UX/CloseIt'
import ImageLoader from '../UI&UX/ImageLoader'
import ImageLook from '../UI&UX/ImageLook'
import DataPagination from '../UI&UX/DataPagination'
import MapPicker from '../UI&UX/MapPicker'
import NavigatorWrapper from '../router/NavigatorWrapper'
import {CollectionPropsType} from '../../types/types'

const Tool: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [region, setRegion] = useState<string>(towns[0].title)
    const [cords, setCords] = useState<any>(towns[0].cords)
    const [image, setImage] = useState<string>('')
    const [reviews, setReviews] = useState<any[]>([])
    const [offers, setOffers] = useState<any[]>([])
    const [review, setReview] = useState<any | null>(null)
    const [offer, setOffer] = useState<any | null>(null)
    const [tool, setTool] = useState<any | null>(null)
    const [state, setState] = useState<any>({
        text: '',
        criterion: CRITERIONS[0],
        period: PERIODS[0],
        rating: 50,
        marketplace: '',
        cost: 10,
        url: ''
    })

    const {text, criterion, period, rating, marketplace, cost, url} = state

    const centum = new Centum()

    const getToolM = gql`
        mutation getTool($username: String!, $shortid: String!) {
            getTool(username: $username, shortid: $shortid) {
                shortid
                account_id
                username
                title
                description
                category
                format
                electric
                url
                main_photo
                reviews {
                    shortid
                    name
                    text
                    criterion
                    period
                    rating
                }
                offers {
                    shortid
                    name
                    marketplace
                    cost
                    cords {
                        lat
                        long
                    }
                    likes
                }
            }
        }
    `

    const updateToolInfoM = gql`
        mutation updateToolInfo($username: String!, $id: String!, $url: String!, $main_photo: String!) {
            updateToolInfo(username: $username, id: $id, url: $url, main_photo: $main_photo) 
        }
    `

    const makeToolReviewM = gql`
        mutation makeToolReview($username: String!, $id: String!, $text: String!, $criterion: String!, $period: String!, $rating: Float!) {
            makeToolReview(username: $username, id: $id, text: $text, criterion: $criterion, period: $period, rating: $rating) 
        }
    `

    const manageToolOfferM = gql`
        mutation manageToolOffer($username: String!, $id: String!, $option: String!, $marketplace: String!, $cost: Float!, $cords: ICord!, $coll_id: String!)  {
            manageToolOffer(username: $username, id: $id, option: $option, marketplace: $marketplace, cost: $cost, cords: $cords, coll_id: $coll_id) 
        }
    `

    const [manageToolOffer] = useMutation(manageToolOfferM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageToolOffer)
            window.location.reload()
        }
    })

    const [makeToolReview] = useMutation(makeToolReviewM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.makeToolReview)
            window.location.reload()
        }
    })

    const [updateToolInfo] = useMutation(updateToolInfoM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateToolInfo)
            window.location.reload()
        }
    })

    const [getTool] = useMutation(getToolM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getTool)
            setTool(data.getTool)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getTool({
                variables: {
                    username: context.username, shortid: params.id
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (tool !== null) {
            setImage(tool.main_photo)
            setState({...state, url: tool.url})
        }
    }, [tool])

    useMemo(() => {
        if (region !== '') {
            let result = towns.find(el => centum.search(el.title, region, 50)) 
    
            if (result !== undefined) {
                setRegion(result.title)
                setCords(result.cords)
            }           
        }
    }, [region])

    useMemo(() => {
        setView({...view, latitude: cords.lat, longitude: cords.long, zoom: 17})
    }, [cords])
    
    const onManageOffer = (option: string) => {
        manageToolOffer({
            variables: {
                username: context.username, id: params.id, option, marketplace, cost, cords, coll_id: offer === null ? '' : offer.shortid  
            }
        })
    }

    const onUpdateInfo = () => {
        updateToolInfo({
            variables: {
                username: context.username, id: params.id, url, main_photo: image
            }
        })
    }

    const onMakeReview = () => {
        makeToolReview({
            variables: {
                username: context.username, id: params.id, text, criterion, period, rating
            }
        })
    }

    return (
        <>
            {tool !== null && 
                <>
                    <h1>{tool.title}</h1>

                    {image !== '' && <ImageLook src={image} className='photo_item' alt='image' />}

                    <h3 className='pale'>Cheapest Offer</h3>
                    <input value={url} onChange={e => setState({...state, url: e.target.value})} placeholder='URL of tool' type='text' />
                    <ImageLoader setImage={setImage} />
                    <button onClick={onUpdateInfo}>Update</button>

                    <h2>New Offer</h2>
                    <div className='items small'>
                        <div className='item'>
                            <h3 className='pale'>Marketplace</h3>
                            <input value={marketplace} onChange={e => setState({...state, marketplace: e.target.value})} placeholder='Title of market' type='text' />
                        </div>
                        <div className='item'>
                            <h3 className='pale'>Cost</h3>
                            <input value={cost} onChange={e => setState({...state, cost: parseInt(e.target.value)})} placeholder='Cost of market' type='text' />
                        </div>
                    </div>

                    <h4 className='pale'>Where it sell?</h4>
                    <input value={region} onChange={e => setRegion(e.target.value)} placeholder='Nearest town' type='text' />
                    {isNaN(cost) ? 
                            <button onClick={() => setState({...state, cost: 10})}>Reset</button>
                        :
                            <button onClick={() => onManageOffer('create')}>Create</button>
                    }
                    <DataPagination initialItems={tool.offers} setItems={setOffers} label={`Offers's Map:`} />
                    <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token} className='map'>
                        <Marker latitude={cords.lat} longitude={cords.long}>
                            <MapPicker type='picker' />
                        </Marker>
                        {offers.map(el => 
                            <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                                <b onClick={() => setOffer(el)}>{centum.shorter(el.marketplace, 2)}</b>
                            </Marker>
                        )}
                    </ReactMapGL> 

                    {offer !== null &&
                        <>
                            <CloseIt onClick={() => setOffer(null)} />

                            <h2>{offer.marketplace}</h2>

                            <div className='items small'>
                                <h4 className='pale'>Cost: <b>{offer.cost}€</b></h4>
                                <h4 className='pale'><b>{offer.likes}</b> likes</h4>
                            </div>
                          
                            {context.username === offer.name ? 
                                    <button onClick={() => onManageOffer('delete')}>Delete</button>
                                :
                                    <button onClick={() => onManageOffer('like')}>Like</button>
                            }
                        </>
                    } 

                    <DataPagination initialItems={tool.reviews} setItems={setReviews} label='List of Reviews:' />
                    <div className='items half'>
                        {reviews.map(el => 
                            <div onClick={() => setReview(el)} className='item card'>
                                {centum.shorter(el.text)}
                            </div>    
                        )}
                    </div>
                    
                    {review !== null &&
                        <>
                            <CloseIt onClick={() => setReview(null)} />
                            
                            <p>Text: {review.text}</p>

                            <div className='items small'>
                                <h4 className='pale'>Time: {review.period}</h4>
                                <h4 className='pale'>Rating: {review.rating}%</h4>
                            </div>
                        </>
                    }

                    <h2>Make Review</h2>
                    <textarea value={text} onChange={e => setState({...state, text: e.target.value})} placeholder='Describe it...' />
                    <h3 className='pale'>Criterion</h3>
                    <div className='items small'>
                        {CRITERIONS.map(el => <div onClick={() => setState({...state, criterion: el})} className={el === criterion ? 'item label active' : 'item label'}>{el}</div>)}
                    </div>
                    <h3 className='pale'>Period</h3>
                    <select value={period} onChange={e => setState({...state, period: e.target.value})}>
                        {PERIODS.map(el => <option value={el}>{el}</option>)}
                    </select>
                    <p>Rating: {rating}%</p>
                    <input value={rating} onChange={e => setState({...state, rating: parseInt(e.target.value)})} type='range' step={1} />
                    <button onClick={onMakeReview}>Publish</button>
                </>  
            }

            {tool === null && <Loading />}
        </>
    )
}

export default Tool