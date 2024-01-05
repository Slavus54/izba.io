import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
//@ts-ignore
import Centum from 'centum.js'
//@ts-ignore
import shortid from 'shortid'
import {COMPANY_TYPES, COMPANY_FORMATS, ARCHITECTURE_STYLES, PAGINATION_LIMIT, VIEW_CONFIG, token} from '../../env/env'
import towns from '../../env/towns.json'
import {Context} from '../../context/WebProvider'
import MapPicker from '../UI&UX/MapPicker'
import FormPagination from '../UI&UX/FormPagination'
import {CollectionPropsType} from '../../types/types'

const CreateCompany: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [idx, setIdx] = useState<number>(0)
    const [coupon, setCoupon] = useState<any>({
        id: shortid.generate().toString(),
        architecture: ARCHITECTURE_STYLES[0],
        percent: 50
    })
    const [state, setState] = useState<any>({
        title: '', 
        category: COMPANY_TYPES[0], 
        format: COMPANY_FORMATS[0], 
        base: 100, 
        coupons: [],
        region: towns[0].title, 
        cords: towns[0].cords
    })

    const centum = new Centum()

    const {title, category, format, base, coupons, region, cords} = state
    const {id, architecture, percent} = coupon

    const createCompanyM = gql`
        mutation createCompany($username: String!, $id: String!, $title: String!, $category: String!, $format: String!, $base: Float!, $coupons: [CouponInp]!, $region: String!, $cords: ICord!) {
            createCompany(username: $username, id: $id, title: $title, category: $category, format: $format, base: $base, coupons: $coupons, region: $region, cords: $cords)
        }
    `

    const [createCompany] = useMutation(createCompanyM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.createCompany)
            window.location.reload()
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

    const onCoupon = () => {
        if (coupons.length < PAGINATION_LIMIT) {
            setState({...state, coupons: [...coupons, coupon]})
        }

        setCoupon({
            id: shortid.generate().toString(),
            architecture: ARCHITECTURE_STYLES[0],
            percent: 50
        })
    }

    const onCreate = () => {
        createCompany({
            variables: {
                username: context.username, id: params.id, title, category, format, base, coupons, region, cords
            }
        })
    }

    return (
        <div className='main'>          
            <FormPagination label='New Company' num={idx} setNum={setIdx} items={[
                    <>
                        <input value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Title of company' type='text' />
                        <h4 className='pale'>Field and Format</h4>
                        <div className='items small'>
                            {COMPANY_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>
                        <select value={format} onChange={e => setState({...state, format: e.target.value})}>
                            {COMPANY_FORMATS.map(el => <option value={el}>{el}</option>)}
                        </select>
                    </>,
                    <>  
                        <h4 className='pale'>Cheapest Product's Cost (€)</h4>
                        <input value={base} onChange={e => setState({...state, base: parseInt(e.target.value)})} placeholder='Volume in euro' type='text' />
                        <h4 className='pale'>Coupons</h4>
                        <select value={architecture} onChange={e => setCoupon({...coupon, architecture: e.target.value})}>
                            {ARCHITECTURE_STYLES.map(el => <option value={el}>{el}</option>)}
                        </select>
                        <p>{percent}% of cost</p>
                        <input value={percent} onChange={e => setCoupon({...coupon, percent: parseInt(e.target.value)})} type='range' step={1} />
                        <button onClick={onCoupon}>+</button>
                    </>,
                    <>
                        <h4 className='pale'>Where it located?</h4>
                        <input value={region} onChange={e => setState({...state, region: e.target.value})} placeholder='Nearest town' type='text' />
                        <ReactMapGL onClick={e => setState({...state, cords: centum.mapboxCords(e)})} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token} className='map'>
                            <Marker latitude={cords.lat} longitude={cords.long}>
                                <MapPicker type='picker' />
                            </Marker>
                        </ReactMapGL>  
                    </>
                ]} 
            />

            {isNaN(base) ? <button onClick={() => setState({...state, base: 100})}>Reset</button> : <button onClick={onCreate}>Create</button>}
        </div>
    )
}

export default CreateCompany