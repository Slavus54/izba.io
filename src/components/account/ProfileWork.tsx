import {useState, useMemo} from 'react';
import {useMutation, gql} from '@apollo/react-hooks'
import {WORK_TYPES, LEVELS} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
//@ts-ignore
import {Datus} from 'datus.js'
import QuantityLabel from '../UI&UX/QuantityLabel' 
import DataPagination from '../UI&UX/DataPagination' 
import ImageLoader from '../UI&UX/ImageLoader' 
import ImageLook from '../UI&UX/ImageLook' 
import CloseIt from '../UI&UX/CloseIt' 
import {AccountPageComponentProps} from '../../types/types'

const ProfileWork = ({profile, context}: AccountPageComponentProps) => {
    const [works, setWorks] = useState<any[]>([])
    const [work, setWork] = useState<any | null>(null)
    const [image, setImage] = useState<string>('')
    const [dateIdx, setDateIdx] = useState(0)
    const datus = new Datus()
    const [state, setState] = useState({
        text: '', 
        category: WORK_TYPES[0], 
        level: LEVELS[0], 
        dateUp: datus.move()
    })

    const centum = new Centum()

    const {text, category, level, dateUp} = state

    const manageProfileWorkM = gql`
        mutation manageProfileWork($account_id: String!, $option: String!, $text: String!, $category: String!, $level: String!, $photo_url: String!, $dateUp: String!, $coll_id: String!) {
            manageProfileWork(account_id: $account_id, option: $option, text: $text, category: $category, level: $level, photo_url: $photo_url, dateUp: $dateUp, coll_id: $coll_id)
        }
    `

    const [manageProfileWork] = useMutation(manageProfileWorkM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageProfileWork)
            window.location.reload()
        }
    })

    useMemo(() => {
        setState({...state, dateUp: datus.move('week', '-', 4 - dateIdx)})
    }, [dateIdx])

    useMemo(() => {
        setImage(work === null ? image : work.photo_url)
    }, [work])

    const onManageWork = (option: string) => {
        manageProfileWork({
            variables: {
                account_id: context.account_id, option, text, category, level, photo_url: image, dateUp, coll_id: work === null ? '' : work.shortid
            }
        })
    }
    
    return (
        <>
            {work === null ? 
                    <>
                        <h1>New Work</h1>
                        <textarea value={text} onChange={e => setState({...state, text: e.target.value})} placeholder='Describe it...' />
                        <h4 className='pale'>Type</h4>
                        <div className='items small'>
                            {WORK_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>
                        <h4 className='pale'>Status</h4>
                        <select value={level} onChange={e => setState({...state, level: e.target.value})}>
                            {LEVELS.map(el => <option value={el}>{el}</option>)}
                        </select>
                        <QuantityLabel min={0} max={4} num={dateIdx} setNum={setDateIdx} part={1} label={`Date: ${dateUp}`} />
                        <ImageLoader setImage={setImage} />
                        <button onClick={() => onManageWork('create')}>Publish</button>
                        <DataPagination initialItems={profile.works} setItems={setWorks} label='List of works:' />
                        <div className='items half'>
                            {works.map(el => 
                                <div onClick={() => setWork(el)} className='item card'>
                                    {centum.shorter(el.text)}
                                    <div className='items small'>
                                        <h5 className='pale'>{el.dateUp}</h5>
                                        <h5 className='pale'><b>{el.likes}</b> likes</h5>
                                    </div> 
                                </div>    
                            )}
                        </div>
                    </>
                :
                    <>
                        <CloseIt onClick={() => setWork(null)} />
                        {work.photo_url !== '' && <ImageLook src={work.photo_url} className='photo_item' alt='work image' />}
                        <h3>{work.text}</h3>

                        <div className='items small'>
                            <h5 className='pale'>Type: {work.category}</h5>
                            <h5 className='pale'>Difficulty: {work.level}</h5>
                        </div>

                        <ImageLoader setImage={setImage} />

                        <div className='items small'>
                            <button onClick={() => onManageWork('delete')}>Delete</button>
                            <button onClick={() => onManageWork('update')}>Update</button>
                        </div>
                    </>
            }
        </> 
    )
}

export default ProfileWork