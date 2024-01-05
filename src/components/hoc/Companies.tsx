import {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {COMPANY_TYPES, VIEW_CONFIG, token} from '../../env/env'
import towns from '../../env/towns.json'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import Loading from '../UI&UX/Loading'
import DataPagination from '../UI&UX/DataPagination'
import MapPicker from '../UI&UX/MapPicker'
import NavigatorWrapper from '../router/NavigatorWrapper'

const Companies = () => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [title, setTitle] = useState<string>('')
    const [category, setCategory] = useState<string>(COMPANY_TYPES[0])
    const [region, setRegion] = useState<string>(towns[0].title)
    const [cords, setCords] = useState<any>(towns[0].cords)
    const [companies, setCompanies] = useState<any[] | null>(null)
    const [filtered, setFiltered] = useState<any[]>([])

    const centum = new Centum()

    const getCompaniesM = gql`
        mutation getCompanies($username: String!) {
            getCompanies(username: $username) {
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

    const [getCompanies] = useMutation(getCompaniesM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getCompanies)
            setCompanies(data.getCompanies)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getCompanies({
                variables: {
                    username: context.username
                }
            })
        }
    }, [context.account_id])

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

    useMemo(() => {
        if (companies !== null) {
            let result = companies.filter(el => el.region === region)
        
            if (title !== '') {
                result = result.filter(el => centum.search(el.title, title, 50))
            }

            result = result.filter(el => el.category === category)

            setFiltered(result)
        }
    }, [companies, title, category, region])
    
    return (
        <>
            <h1>Find your Company</h1>
            <div className='items small'>
                <div className='item'>
                    <h4 className='pale'>Title</h4>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Title of company' type='text' />
                </div>
                <div className='item'>
                    <h4 className='pale'>Region</h4>
                    <input value={region} onChange={e => setRegion(e.target.value)} placeholder='Nearest town' type='text' />
                </div>
            </div>
          
            <h4 className='pale'>Field</h4>
            <div className='items small'>
                {COMPANY_TYPES.map(el => <div onClick={() => setCategory(el)} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
            </div>
    
            <DataPagination initialItems={filtered} setItems={setFiltered} />
            {companies !== null && 
                <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token} className='map'>
                    <Marker latitude={cords.lat} longitude={cords.long}>
                        <MapPicker type='picker' />
                    </Marker>
                    {filtered.map(el => 
                        <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                            <NavigatorWrapper id='' isRedirect={false} url={`/company/${el.shortid}`}>
                                <b>{centum.shorter(el.title)}</b>
                            </NavigatorWrapper>
                        </Marker>
                    )}
                </ReactMapGL>   
            }

            {companies === null && <Loading />}
        </>
    )
}

export default Companies