import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
//@ts-ignore
import Centum from 'centum.js'
import {PROJECT_TYPES, ARCHITECTURE_STYLES, CENTURES, VIEW_CONFIG, token} from '../../env/env'
import towns from '../../env/towns.json'
import {Context} from '../../context/WebProvider'
import MapPicker from '../UI&UX/MapPicker'
import FormPagination from '../UI&UX/FormPagination'
import {CollectionPropsType} from '../../types/types'

const CreateProject: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [idx, setIdx] = useState<number>(0)
    const [state, setState] = useState<any>({
        title: '', 
        category: PROJECT_TYPES[0], 
        architecture: ARCHITECTURE_STYLES[0], 
        century: CENTURES[0],
        region: towns[0].title, 
        cords: towns[0].cords,
        card_number: '', 
        total: 100
    })

    const centum = new Centum()

    const {title, category, architecture, century, region, cords, card_number, total} = state

    const createProjectM = gql`
        mutation createProject($username: String!, $id: String!, $title: String!, $category: String!, $architecture: String!, $century: String!, $region: String!, $cords: ICord!, $card_number: String!, $total: Float!) {
            createProject(username: $username, id: $id, title: $title, category: $category, architecture: $architecture, century: $century, region: $region, cords: $cords, card_number: $card_number, total: $total) 
        }
    `

    const [createProject] = useMutation(createProjectM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.createProject)
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

    const onCreate = () => {
        createProject({
            variables: {
                username: context.username, id: params.id, title, category, architecture, century, region, cords, card_number: centum.validateCard(card_number), total
            }
        })
    }

    return (
        <div className='main'>          
            <FormPagination label='New Project' num={idx} setNum={setIdx} items={[
                    <>
                        <input value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Title of project' type='text' />
                        <h4 className='pale'>Type</h4>
                        <div className='items small'>
                            {PROJECT_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>
                    </>,
                    <>
                        <h4 className='pale'>Style and Century</h4>
                        <div className='items small'>
                            <select value={architecture} onChange={e => setState({...state, architecture: e.target.value})}>
                                {ARCHITECTURE_STYLES.map(el => <option value={el}>{el}</option>)}
                            </select>
                            <select value={century} onChange={e => setState({...state, century: e.target.value})}>
                                {CENTURES.map(el => <option value={el}>{el}</option>)}
                            </select>
                        </div>
                    </>,
                    <>  
                        <h4 className='pale'>
                            Card and Budget (€) <br />
                            {centum.validateCard(card_number)}
                        </h4>
                       
                        <div className='items small'>
                            <input value={card_number} onChange={e => setState({...state, card_number: e.target.value})} placeholder='Card for donates' type='text' />
                            <input value={total} onChange={e => setState({...state, total: parseInt(e.target.value)})} placeholder='Volume in euro' type='text' />
                        </div>
                        
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

            {isNaN(total) ? <button onClick={() => setState({...state, total: 100})}>Reset</button> : <button onClick={onCreate}>Create</button>}
        </div>
    )
}

export default CreateProject