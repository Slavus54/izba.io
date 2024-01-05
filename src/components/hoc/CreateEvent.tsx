import React, {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
//@ts-ignore
import Centum from 'centum.js'
//@ts-ignore
import {Datus} from 'datus.js'
//@ts-ignore
import shortid from 'shortid'
import {WORK_TYPES, LEVELS, TIME_BORDERS, ROLES, PAGINATION_LIMIT} from '../../env/env'
import {Context} from '../../context/WebProvider'
import QuantityLabel from '../UI&UX/QuantityLabel'
import FormPagination from '../UI&UX/FormPagination'
import {CollectionPropsType} from '../../types/types'

const CreateEvent: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [idx, setIdx] = useState<number>(0)
    const [dateIdx, setDateIdx] = useState<number>(0)
    const [timer, setTimer] = useState<number>(TIME_BORDERS[0])
    const [step, setStep] = useState<any>({
        id: shortid.generate().toString(),
        text: '',
        role: ROLES[0],
        priority: 50
    })
    const datus = new Datus()
    const [state, setState] = useState<any>({
        title: '', 
        category: WORK_TYPES[0], 
        level: LEVELS[0], 
        steps: [], 
        volume: 100, 
        dateUp: datus.move(), 
        time: ''
    })

    const centum = new Centum()

    const {title, category, level, steps, volume, dateUp, time} = state
    const {id, text, role, priority} = step

    const createEventM = gql`
        mutation createEvent($username: String!, $id: String!, $title: String!, $category: String!, $level: String!, $steps: [StepInp]!, $volume: Float!, $dateUp: String!, $time: String!) {
            createEvent(username: $username, id: $id, title: $title, category: $category, level: $level, steps: $steps, volume: $volume, dateUp: $dateUp, time: $time) 
        }
    `

    const [createEvent] = useMutation(createEventM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.createProject)
            window.location.reload()
        }
    })

    useMemo(() => {
        setState({...state, dateUp: datus.move('day', '+', dateIdx)})
    }, [dateIdx]
    )
    useMemo(() => {
        setState({...state, time: centum.time(timer)})
    }, [timer])

    const onStep = () => {
        if (steps.length < PAGINATION_LIMIT) {
            setState({...state, steps: [...steps, step]})
        }
       
        setStep({
            id: shortid.generate().toString(),
            text: '',
            role: ROLES[0],
            priority: 50
        })
    }

    const onCreate = () => {
        createEvent({
            variables: {
                username: context.username, id: params.id, title, category, level, steps, volume, dateUp, time
            }
        })
    }

    return (
        <div className='main'>          
            <FormPagination label='New Event' num={idx} setNum={setIdx} items={[
                    <>
                        <div className='items small'>
                            <div className='item'>
                                <h4 className='pale'>Title</h4>
                                <input value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Title of event' type='text' />
                            </div>

                            <div className='item'>
                                <h4 className='pale'>Volume (€)</h4>
                                <input value={volume} onChange={e => setState({...state, volume: parseInt(e.target.value)})} placeholder='Cost of event' type='text' />
                            </div>
                        </div>
                      
                        <h4 className='pale'>Type</h4>
                        <div className='items small'>
                            {WORK_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>
                       
                    </>,
                    <>
                        <h4 className='pale'>Difficulty and Date</h4>
                        <select value={level} onChange={e => setState({...state, level: e.target.value})}>
                            {LEVELS.map(el => <option value={el}>{el}</option>)}
                        </select>
                        <QuantityLabel min={0} max={10} num={dateIdx} setNum={setDateIdx} part={1} label={`Date: ${dateUp}`} /> 
                    </>,
                    <>  
                        <h4 className='pale'>Steps ({steps.length}/{PAGINATION_LIMIT})</h4>
                        <textarea value={text} onChange={e => setStep({...step, text: e.target.value})} placeholder='Describe it...' />
                        <select value={role} onChange={e => setStep({...step, role: e.target.value})}>
                            {ROLES.map(el => <option value={el}>{el}</option>)}
                        </select>
                        <p>Priority: {priority}%</p>
                        <input value={priority} onChange={e => setStep({...step, priority: parseInt(e.target.value)})} type='range' step={1} />
                        <button onClick={onStep}>+</button>
                        
                        <QuantityLabel min={TIME_BORDERS[0]} max={TIME_BORDERS[1]} num={timer} setNum={setTimer} part={30} label={`Start in ${time}`} />                           
                    </>
                ]} 
            />

            {isNaN(volume) ? <button onClick={() => setState({...state, volume: 100})}>Reset</button> : <button onClick={onCreate}>Create</button>}
        </div>
    )
}

export default CreateEvent