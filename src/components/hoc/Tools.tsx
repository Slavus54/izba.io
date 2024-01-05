import {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
import {TOOL_TYPES} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import Loading from '../UI&UX/Loading'
import DataPagination from '../UI&UX/DataPagination'
import NavigatorWrapper from '../router/NavigatorWrapper'

const Tools = () => {
    const {context} = useContext<any>(Context)
    const [title, setTitle] = useState<string>('')
    const [category, setCategory] = useState<string>(TOOL_TYPES[0])
    const [electric, setElectric] = useState<boolean>(false)
    const [tools, setTools] = useState<any[] | null>(null)
    const [filtered, setFiltered] = useState<any[]>([])

    const centum = new Centum()

    const getToolsM = gql`
        mutation getTools($username: String!) {
            getTools(username: $username) {
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

    const [getTools] = useMutation(getToolsM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getTools)
            setTools(data.getTools)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getTools({
                variables: {
                    username: context.username
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (tools !== null) {
            let result = tools.filter(el => el.electric === electric)
        
            if (title !== '') {
                result = result.filter(el => centum.search(el.title, title, 50))
            }

            result = result.filter(el => el.category === category)

            setFiltered(result)
        }
    }, [tools, title, category, electric])
    
    return (
        <>
            <h1>Find your Tool</h1>
            <div className='items small'>
                <div className='item'>
                    <h4 className='pale'>Title</h4>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Title of company' type='text' />
                </div>
                <div className='item'>
                    <h4 className='pale'>Type</h4>
                    <button onClick={() => setElectric(!electric)} className='light-btn'>{electric ? 'Electric' : 'Mechanic'}</button>
                </div>
            </div>
          
            <h4 className='pale'>Category</h4>
            <div className='items small'>
                {TOOL_TYPES.map(el => <div onClick={() => setCategory(el)} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
            </div>
    
            <DataPagination initialItems={filtered} setItems={setFiltered} />
            {tools !== null && 
                <div className='items half'>
                    {filtered.map(el => 
                        <div className='item card'>
                            <NavigatorWrapper id='' isRedirect={false} url={`/tool/${el.shortid}`}>
                                {centum.shorter(el.title)}
                            </NavigatorWrapper>
                        </div>
                    )}
                </div>   
            }

            {tools === null && <Loading />}
        </>
    )
}

export default Tools