import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {ARCHITECTURE_STYLES, VIEW_CONFIG, token} from '../../env/env'
import towns from '../../env/towns.json'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import Loading from '../UI&UX/Loading'
import DataPagination from '../UI&UX/DataPagination'
import MapPicker from '../UI&UX/MapPicker'
import NavigatorWrapper from '../router/NavigatorWrapper'

const Profiles = () => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [username, setUsername] = useState<string>('')
    const [region, setRegion] = useState<string>(towns[0].title)
    const [cords, setCords] = useState<any>(towns[0].cords)
    const [architecture, setArchitecture] = useState<string>(ARCHITECTURE_STYLES[0])
    const [profiles, setProfiles] = useState<any[] | null>(null)
    const [filtered, setFiltered] = useState<any[]>([])

    const centum = new Centum()

    const getProfilesM = gql`
        mutation getProfiles($username: String!) {
            getProfiles(username: $username) {
                account_id
                username
                architecture
                region
                cords {
                    lat
                    long
                }
            }
        }
    `

    const [getProfiles] = useMutation(getProfilesM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getProfiles)
            setProfiles(data.getProfiles)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getProfiles({
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
        if (profiles !== null) {
            let result = profiles.filter(el => el.region === region)
        
            if (username !== '') {
                result = result.filter(el => centum.search(el.username, username, 50))
            }

            result = result.filter(el => el.architecture === architecture)

            setFiltered(result)
        }
    }, [profiles, username, architecture, region])
    
    return (
        <>
            <h1>Find a Person</h1>
            <div className='items small'>
                <div className='item'>
                    <h4 className='pale'>Name</h4>
                    <input value={username} onChange={e => setUsername(e.target.value)} placeholder='Name of user' type='text' />
                </div>
                <div className='item'>
                    <h4 className='pale'>Region</h4>
                    <input value={region} onChange={e => setRegion(e.target.value)} placeholder='Nearest town' type='text' />
                </div>
            </div>
          
            <h4 className='pale'>Style</h4>
            <select value={architecture} onChange={e => setArchitecture(e.target.value)}>
                {ARCHITECTURE_STYLES.map(el => <option value={el}>{el}</option>)}
            </select>
                    
            <DataPagination initialItems={filtered} setItems={setFiltered} />
            {profiles !== null && 
                <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token} className='map'>
                    <Marker latitude={cords.lat} longitude={cords.long}>
                        <MapPicker type='picker' />
                    </Marker>
                    {filtered.map(el => 
                        <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                            <NavigatorWrapper id={el.account_id} isRedirect={true} url=''>
                                <b>{el.username}</b>
                            </NavigatorWrapper>
                        </Marker>
                    )}
                </ReactMapGL>   
            }

            {profiles === null && <Loading />}
        </>
    )
}

export default Profiles