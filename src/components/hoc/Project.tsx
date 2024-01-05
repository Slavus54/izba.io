import React, {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
import {PAPER_TYPES, PAPER_STATUSES, QUESTION_TYPES, LEVELS} from '../../env/env'
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

const Project: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [papers, setPapers] = useState<any[]>([])
    const [paper, setPaper] = useState<any | null>(null)
    const [question, setQuestion] = useState<any | null>(null)
    const [project, setProject] = useState<any | null>(null)
    const [image, setImage] = useState<string>('')
    const [state, setState] = useState<any>({
        title: '',
        category: PAPER_TYPES[0],
        status: PAPER_STATUSES[0],
        text: '',
        format: QUESTION_TYPES[0],
        level: LEVELS[0],
        answer: '',
        total: 0
    })

    const {title, category, status, text, format, level, answer, total} = state

    const centum = new Centum()

    const getProjectM = gql`
        mutation getProject($username: String!, $shortid: String!) {
            getProject(username: $username, shortid: $shortid) {
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

    const manageProjectPaperM = gql`
        mutation manageProjectPaper($username: String!, $id: String!, $option: String!, $title: String!, $category: String!, $status: String!, $photo_url: String!, $coll_id: String!) {
            manageProjectPaper(username: $username, id: $id, option: $option, title: $title, category: $category, status: $status, photo_url: $photo_url, coll_id: $coll_id)
        }
    `

    const manageProjectQuestionM = gql`
        mutation manageProjectQuestion($username: String!, $id: String!, $option: String!, $text: String!, $format: String!, $level: String!, $coll_id: String!, $answer: String!) {
            manageProjectQuestion(username: $username, id: $id, option: $option, text: $text, format: $format, level: $level, coll_id: $coll_id, answer: $answer)
        }
    `

    const updateProjectBudgetM = gql`
        mutation updateProjectBudget($username: String!, $id: String!, $total: Float!) {
            updateProjectBudget(username: $username, id: $id, total: $total)
        }
    `

    const [updateProjectBudget] = useMutation(updateProjectBudgetM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateProjectBudget)
            window.location.reload()
        }
    })

    const [manageProjectQuestion] = useMutation(manageProjectQuestionM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageProjectQuestion)
            window.location.reload()
        }
    })

    const [manageProjectPaper] = useMutation(manageProjectPaperM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageProjectPaper)
            window.location.reload()
        }
    })

    const [getProject] = useMutation(getProjectM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getProject)
            setProject(data.getProject)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getProject({
                variables: {
                    username: context.username, shortid: params.id
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (project !== null) {
            setState({...state, total: project.total})
        }
    }, [project])

    useMemo(() => {
        if (paper !== null) {
            setState({...state, status: paper.status})
            setImage(paper.photo_url)
        } else {
            setState({...state, status: PAPER_STATUSES[0]})
            setImage('')
        }
    }, [paper])

    const onGenQuestion = () => {
        let result = centum.random(project.questions)?.value

        if (result !== undefined) {
            setQuestion(result)
        }
    }

    const onUpdateBudget = () => {
        updateProjectBudget({
            variables: {
                username: context.username, id: params.id, total
            }
        })
    }

    const onManagePaper = (option: string) => {
        manageProjectPaper({
            variables: {
                username: context.username, id: params.id, option, title, category, status, photo_url: image, coll_id: paper === null ? '' : paper.shortid
            }
        })
    }

    const onManageQuestion = (option: string) => {
        manageProjectQuestion({
            variables: {
                username: context.username, id: params.id, option, text, format, level, coll_id: question === null ? '' : question.shortid, answer
            }
        })
    }

    return (
        <>
            {project !== null && 
                <>
                    <h1>{project.title}</h1>

                    <div className='items small'>
                        <h4 className='pale'>Card: {project.card_number}</h4>
                        <h4 className='pale'>Budget: {project.total}€</h4>
                    </div>

                    {project.events.length !== 0 &&
                        <>
                            <h2>Events</h2>
                            <div className='items half'>
                                {project.events.map((el: any) => 
                                    <div className='item card'>
                                        <NavigatorWrapper id='' isRedirect={false} url={`/event/${el.shortid}`}>
                                            {centum.shorter(el.title)}
                                        </NavigatorWrapper>
                                    </div>
                                )}
                            </div>
                        </>
                    }

                    <DataPagination initialItems={project.papers} setItems={setPapers} label={`Project's Documents:`} />
                    <div className='items half'>
                        {papers.map(el => 
                            <div onClick={() => setPaper(el)} className='item card'>
                                {centum.shorter(el.title)}
                            </div>    
                        )}
                    </div>

                    {paper !== null &&
                        <>
                            <CloseIt onClick={() => setPaper(null)} />
                            {paper.photo_url !== '' && <ImageLook src={paper.photo_url} className='photo_item' alt='paper photo' />}
                            <h2>{paper.title}</h2>

                            <div className='items small'>
                                <h4 className='pale'>Type: {paper.category}</h4>
                                <h4 className='pale'><b>{paper.likes}</b> likes</h4>
                            </div>
                        </>
                    }

                    {paper !== null && context.account_id === project.account_id &&
                        <>
                            <select value={status} onChange={e => setState({...state, status: e.target.value})}>
                                {PAPER_STATUSES.map(el => <option value={el}>{el}</option>)}
                            </select>
                            <ImageLoader setImage={setImage} />

                            <div className='items small'>
                                <button onClick={() => onManagePaper('delete')}>Delete</button>
                                <button onClick={() => onManagePaper('update')}>Update</button>
                            </div>
                        </>
                    }

                    {paper !== null && context.account_id !== project.account_id && <button onClick={() => onManagePaper('like')}>Like</button>}

                    {question === null ? 
                            <>
                                <h2>Guess Question</h2>
                                <button onClick={onGenQuestion} className='light-btn'>Generate</button>
                            </>
                        :
                            <>
                                <CloseIt onClick={() => setQuestion(null)} />
                                <h2>{question.text}</h2>
                                
                                <div className='items small'>
                                    <h4 className='pale'>Type: {question.format}</h4>
                                    <h4 className='pale'>Difficulty: {question.level}</h4>
                                </div>

                                {question.accepted && <h3>Answer: {question.answer}</h3>}

                                {!question.accepted && context.account_id === project.account_id &&
                                    <>
                                        <h3>Give your answer</h3>
                                        <textarea value={answer} onChange={e => setState({...state, answer: e.target.value})} placeholder='Text...' />
                                        <button onClick={() => onManageQuestion('answer')}>Answer</button>
                                    </>
                                }

                                {context.username === question.name && <button onClick={() => onManageQuestion('delete')}>Delete</button>}
                            </>
                    }                   
                </>   
            }

            {project !== null && context.account_id === project.account_id &&
                <>
                    <h2>New Budget</h2>
                    <input value={total} onChange={e => setState({...state, total: parseInt(e.target.value)})} placeholder='Volume in euro' type='text' />
                    {isNaN(total) ? <button onClick={() => setState({...state, total: project.total})}>Reset</button> : <button onClick={onUpdateBudget}>Update</button>}

                    <h2>New Event</h2>
                    <NavigatorWrapper id='' isRedirect={false} url={`/create-event/${project.shortid}`}>
                        <button>+</button>
                    </NavigatorWrapper>

                    <h2>New Paper</h2>
                    <input value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Title of paper' type='text' />
                    <h4 className='pale'>Type</h4>
                    <div className='items small'>
                        {PAPER_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                    </div>
                    <select value={status} onChange={e => setState({...state, status: e.target.value})}>
                        {PAPER_STATUSES.map(el => <option value={el}>{el}</option>)}
                    </select>
                    <ImageLoader setImage={setImage} />
                    <button onClick={() => onManagePaper('create')}>+</button>                   
                </>   
            }

            {project !== null && context.account_id !== project.account_id &&
                <>
                    <h2>Make Question</h2>
                    <textarea value={text} onChange={e => setState({...state, text: e.target.value})} placeholder='Text of question...' />
                    <div className='items small'>
                        <div className='item'>
                            <h4 className='pale'>Type</h4>
                            <select value={format} onChange={e => setState({...state, format: e.target.value})}>
                                {QUESTION_TYPES.map(el => <option value={el}>{el}</option>)}
                            </select>
                        </div>
                        <div className='item'>
                            <h4 className='pale'>Difficulty</h4>
                            <select value={level} onChange={e => setState({...state, level: e.target.value})}>
                                {LEVELS.map(el => <option value={el}>{el}</option>)}
                            </select>
                        </div>
                    </div>
                    <button onClick={() => onManageQuestion('create')}>Publish</button>

                    <NavigatorWrapper id='' isRedirect={false} url={`/profile/${project.account_id}`}>
                        <button className='light-btn'>Author</button>
                    </NavigatorWrapper>
                </>   
            }

            {project === null && <Loading />}
        </>
    )
}

export default Project