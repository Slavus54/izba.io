import React, {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
import {ROLES} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import Loading from '../UI&UX/Loading'
import CloseIt from '../UI&UX/CloseIt'
import ImageLoader from '../UI&UX/ImageLoader'
import ImageLook from '../UI&UX/ImageLook'
import DataPagination from '../UI&UX/DataPagination'
import NavigatorWrapper from '../router/NavigatorWrapper'
import {CollectionPropsType} from '../../types/types'

const Event: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [results, setResults] = useState<any[]>([])
    const [result, setResult] = useState<any | null>(null)
    const [members, setMembers] = useState<any[]>([])
    const [personality, setPersonality] = useState<any | null>(null)
    const [step, setStep] = useState<any | null>(null)
    const [event, setEvent] = useState<any | null>(null)
    const [image, setImage] = useState<string>('')
    const [state, setState] = useState<any>({
        role: ROLES[0],
        text: '',
        rate: 50
    })

    const {role, text, rate} = state

    const centum = new Centum()

    const getEventM = gql`
        mutation getEvent($username: String!, $shortid: String!) {
            getEvent(username: $username, shortid: $shortid) {
                shortid
                project_id
                username
                title
                category
                level
                steps {
                    id
                    text
                    role
                    priority
                }
                volume
                dateUp
                time
                done
                members {
                    username
                    telegram_tag
                    role
                }
                results {
                    shortid
                    name
                    text
                    rate
                    photo_url
                    likes
                }
            }
        }
    ` 
    
    const makeEventDoneM = gql`
        mutation makeEventDone($username: String!, $id: String!, $project_id: String!) {
            makeEventDone(username: $username, id: $id, project_id: $project_id) 
        }
    `

    const manageEventStatusM = gql`
        mutation manageEventStatus($username: String!, $id: String!, $option: String!, $role: String!) {
            manageEventStatus(username: $username, id: $id, option: $option, role: $role)
        }
    `

    const manageEventResultM = gql`
        mutation manageEventResult($username: String!, $id: String!, $option: String!, $text: String!, $rate: Float!, $photo_url: String!, $coll_id: String!) {
            manageEventResult(username: $username, id: $id, option: $option, text: $text, rate: $rate, photo_url: $photo_url, coll_id: $coll_id)
        }
    `

    const [manageEventResult] = useMutation(manageEventResultM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageEventStatus)
            window.location.reload()
        }
    })

    const [manageEventStatus] = useMutation(manageEventStatusM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageEventStatus)
            window.location.reload()
        }
    })

    const [makeEventDone] = useMutation(makeEventDoneM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.makeEventDone)
            window.location.reload()
        }
    })

    const [getEvent] = useMutation(getEventM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getEvent)
            setEvent(data.getEvent)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getEvent({
                variables: {
                    username: context.username, shortid: params.id
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (event !== null) {
            let member = event.members.find((el: any) => centum.search(el.username, context.username, 100))

            if (member !== undefined) {
                setPersonality(member)
            }
        }
    }, [event])

    useMemo(() => {
        if (personality !== null) {
            setState({...state, role: personality.role})
        }
    }, [personality])

    const onViewMember = (tag: string) => {
        centum.telegramLink(tag)
    }

    const onMakeDone = () => {
        makeEventDone({
            variables: {
                username: context.username, id: params.id, project_id: event.project_id
            }
        })
    }

    const onManageStatus = (option: string) => {
        manageEventStatus({
            variables: {
                username: context.username, id: params.id, option, role
            }
        })
    }
 
    const onManageResult = (option: string) => {
        manageEventResult({
            variables: {
                username: context.username, id: params.id, option, text, rate, photo_url: image, coll_id: result === null ? '' : result.shortid
            }
        })
    }

    return (
        <>
            {event !== null && !event.done && personality === null && 
                <>
                    <h1>Welcome to Event!</h1>
                    <select value={role} onChange={e => setState({...state, role: e.target.value})}>
                        {ROLES.map(el => <option value={el}>{el}</option>)}
                    </select>
                    <button onClick={() => onManageStatus('join')}>Join</button>
                </>   
            }

            {event !== null && !event.done && personality !== null && 
                <>
                    <h1>{event.title}</h1>

                    <div className='items small'>
                        <h4 className='pale'>Date: {event.dateUp}</h4>
                        <h4 className='pale'>Start in {event.time}</h4>
                        <h4 className='pale'>Budget: {event.volume}€</h4>
                    </div>
                   
                    {event.username === context.username && <button onClick={onMakeDone}>Finish</button>}

                    <h2>My Role</h2>
                    <select value={role} onChange={e => setState({...state, role: e.target.value})}>
                        {ROLES.map(el => <option value={el}>{el}</option>)}
                    </select>
                    <button onClick={() => onManageStatus('update')}>Update</button>

                    <div className='items small'>
                        <button onClick={() => onManageStatus('exit')} className='light-btn'>Exit</button>

                        <NavigatorWrapper id='' isRedirect={false} url={`/project/${event.project_id}`}>
                            <button className='light-btn'>Project</button>
                        </NavigatorWrapper>
                    </div>

                    <h2>Steps</h2>
                    <div className='items half'>
                        {event.steps.map((el: any) => 
                            <div onClick={() => setStep(el)} className='item card'>
                                {centum.shorter(el.text)}

                                <div className='items small'>
                                    <h5 className='pale'>Priority: {el.priority}%</h5>
                                    <h5 className='pale'>Role: {el.role}</h5>
                                </div>   
                            </div>    
                        )}
                    </div>

                    {step !== null &&
                        <>
                            <CloseIt onClick={() => setStep(null)} />

                            <p>{step.text}</p>
                        </>
                    }

                    <DataPagination initialItems={event.results} setItems={setResults} label={`Members's Results:`} />
                    <div className='items half'>
                        {results.map(el => 
                            <div onClick={() => setResult(el)} className='item card'>
                                {centum.shorter(el.text)}
                            </div>    
                        )}
                    </div>

                    {result !== null &&
                        <>
                            <CloseIt onClick={() => setResult(null)} />
                            {result.photo_url !== '' && <ImageLook src={result.photo_url} className='photo_item' alt='result photo' />}
                            <h2>{result.text}</h2>
                            
                            <div className='items small'>
                                <h4 className='pale'>Rating: {result.rate}%</h4>
                                <h4 className='pale'><b>{result.likes}</b> likes</h4>
                            </div>

                            {result.name === context.username ? 
                                    <button onClick={() => onManageResult('delete')}>Delete</button>
                                :
                                    <button onClick={() => onManageResult('like')}>Like</button>
                            }
                        </>
                    }

                    <h2>New Result</h2>
                    <textarea value={text} onChange={e => setState({...state, text: e.target.value})} placeholder='Describe it..' />
                    <p>Event's Rating: {rate}%</p>
                    <input value={rate} onChange={e => setState({...state, rate: parseInt(e.target.value)})} type='range' step={1} />
                    <ImageLoader setImage={setImage} />
                    <button onClick={() => onManageResult('create')}>Publish</button>

                    <DataPagination initialItems={event.members} setItems={setMembers} label='List of Members:' />
                    <div className='items half'>
                        {members.map(el => 
                            <div onClick={() => onViewMember(el.telegram_tag)} className='item card'>
                                {el.username}
                            </div>  
                        )}
                    </div>
                </>   
            }

            {event !== null && event.done && <h2>Event is over!</h2>}

            {event === null && <Loading />}
        </>
    )
}

export default Event