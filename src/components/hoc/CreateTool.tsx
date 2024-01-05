import React, {useState, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
import {TOOL_TYPES, WORK_TYPES} from '../../env/env'
import {Context} from '../../context/WebProvider'
import FormPagination from '../UI&UX/FormPagination'
import ImageLoader from '../UI&UX/ImageLoader'
import {CollectionPropsType} from '../../types/types'

const CreateTool: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [idx, setIdx] = useState<number>(0)
    const [image, setImage] = useState<string>('')
    const [state, setState] = useState<any>({
        title: '', 
        description: '',
        category: TOOL_TYPES[0], 
        format: WORK_TYPES[0], 
        electric: false,
        url: ''
    })

    const {title, description, category, format, electric, url} = state

    const createToolM = gql`
        mutation createTool($username: String!, $id: String!, $title: String!, $description: String!, $category: String!, $format: String!, $electric: Boolean!, $url: String!, $main_photo: String!) {
            createTool(username: $username, id: $id, title: $title, description: $description, category: $category, format: $format, electric: $electric, url: $url, main_photo: $main_photo)
        }
    `

    const [createTool] = useMutation(createToolM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.createTool)
            window.location.reload()
        }
    })

    const onCreate = () => {
        createTool({
            variables: {
                username: context.username, id: params.id, title, description, category, format, electric, url, main_photo: image
            }
        })
    }

    return (
        <div className='main'>          
            <FormPagination label='New Tool' num={idx} setNum={setIdx} items={[
                    <>
                        <div className='items small'>
                            <div className='item'>
                                <h4 className='pale'>Title</h4>
                                <input value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Title of tool' type='text' />
                            </div>

                            <div className='item'>
                                <h4 className='pale'>Type</h4>
                                <button onClick={() => setState({...state, electric: !electric})} className='light-btn'>{electric ? 'Electric' : 'Mechanic'}</button>
                            </div>
                        </div>
                      
                        <h4 className='pale'>Description</h4>
                        <textarea value={description} onChange={e => setState({...state, description: e.target.value})} placeholder='Describe it...' />
                    </>,
                    <>
                        <h4 className='pale'>Category and Field of Using</h4>
                        <div className='items small'>
                            {TOOL_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>
                        <select value={format} onChange={e => setState({...state, format: e.target.value})}>
                            {WORK_TYPES.map(el => <option value={el}>{el}</option>)}
                        </select>
                    </>,
                    <>  
                        <h4 className='pale'>Cheapest Offer</h4>
                        <input value={url} onChange={e => setState({...state, url: e.target.value})} placeholder='URL of tool' type='text' />
                        <ImageLoader setImage={setImage} />
                    </>
                ]} 
            />

          <button onClick={onCreate}>Create</button>
        </div>
    )
}

export default CreateTool