import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {PROJECT_TYPES, ARCHITECTURE_STYLES, VIEW_CONFIG, token} from '../../env/env'
import towns from '../../env/towns.json'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import Loading from '../UI&UX/Loading'
import DataPagination from '../UI&UX/DataPagination'
import MapPicker from '../UI&UX/MapPicker'
import NavigatorWrapper from '../router/NavigatorWrapper'

const Projects = () => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [title, setTitle] = useState<string>('')
    const [category, setCategory] = useState<string>(PROJECT_TYPES[0])
    const [architecture, setArchitecture] = useState<string>(ARCHITECTURE_STYLES[0])
    const [region, setRegion] = useState<string>(towns[0].title)
    const [cords, setCords] = useState<any>(towns[0].cords)
    const [projects, setProjects] = useState<any[] | null>(null)
    const [filtered, setFiltered] = useState<any[]>([])

    const centum = new Centum()

    const getProjectsM = gql`
        mutation getProjects($username: String!) {
            getProjects(username: $username) {
                shortid
                account_id
                username
                title
                category
                architecture
                century
                region
                cords {
                    lat
                    long
                }
                card_number
                total
                papers {
                    shortid
                    title
                    category
                    status
                    photo_url
                    likes
                }
                questions {
                    shortid
                    name
                    text
                    format
                    level
                    answer
                    accepted
                }
                events {
                    shortid
                    title
                    dateUp
                    time
                }
            }
        }
    `

    const [getProjects] = useMutation(getProjectsM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getProjects)
            setProjects(data.getProjects)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getProjects({
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
        if (projects !== null) {
            let result = projects.filter(el => el.category === category && el.region === region)
        
            if (title !== '') {
                result = result.filter(el => centum.search(el.title, title, 50))
            }

            result = result.filter(el => el.architecture === architecture)

            setFiltered(result)
        }
    }, [projects, title, category, architecture, region])
    
    return (
        <>
            <h1>Search of best Projects</h1>
            <div className='items small'>
                <div className='item'>
                    <h4 className='pale'>Title</h4>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Title of project' type='text' />
                </div>
                <div className='item'>
                    <h4 className='pale'>Region</h4>
                    <input value={region} onChange={e => setRegion(e.target.value)} placeholder='Nearest town' type='text' />
                </div>
            </div>
          
            <h4 className='pale'>Type and Style</h4>
            <div className='items small'>
                {PROJECT_TYPES.map(el => <div onClick={() => setCategory(el)} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
            </div>
            <select value={architecture} onChange={e => setArchitecture(e.target.value)}>
                {ARCHITECTURE_STYLES.map(el => <option value={el}>{el}</option>)}
            </select>
          
            <DataPagination initialItems={filtered} setItems={setFiltered} />
            {projects !== null && 
                <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token} className='map'>
                    <Marker latitude={cords.lat} longitude={cords.long}>
                        <MapPicker type='picker' />
                    </Marker>
                    {filtered.map(el => 
                        <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                            <NavigatorWrapper id='' isRedirect={false} url={`/project/${el.shortid}`}>
                                <b>{centum.shorter(el.title)}</b>
                            </NavigatorWrapper>
                        </Marker>
                    )}
                </ReactMapGL>   
            }

            {projects === null && <Loading />}
        </>
    )
}

export default Projects