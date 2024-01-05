import {useState} from 'react'
//@ts-ignore
import Centum from 'centum.js'
import components from '../../env/components.json'
import NavigatorWrapper from '../router/NavigatorWrapper'
import DataPagination from '../UI&UX/DataPagination'
import {AccountPageComponentProps} from '../../types/types'

const ProfileComponents = ({profile, context}: AccountPageComponentProps) => {
    const [items, setItems] = useState<any[]>([])

    const centum = new Centum()

    return (
        <>
            <h1>What I can?</h1>   

            <h3 className='pale tag'>create new components</h3>
            <div className='items small'>
                {components.map(el => 
                    <div className='item label'>
                        <NavigatorWrapper id='' isRedirect={false} url={`/create-${el.path}/${context.account_id}`}>
                            <h4>{el.title}</h4>
                        </NavigatorWrapper>   
                    </div>     
                )}
            </div>

            <DataPagination initialItems={profile.account_components} setItems={setItems} label='List of components:' />
            <div className='items half'>
                {items.map(el =>
                    <div className='item card'>
                        <NavigatorWrapper id='' isRedirect={false} url={`/${el.path}/${el.shortid}`}>
                            {centum.shorter(el.title, 2)}
                            <h5 className='pale'>{el.path}</h5>
                        </NavigatorWrapper>    
                    </div>
                )}
            </div>
        </> 
    )
}

export default ProfileComponents