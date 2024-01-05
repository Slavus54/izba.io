import {Route} from 'wouter'
import routes from '../../env/routes.json'
import RouterItem from './RouterItem'
import Home from '../hoc/Home'
import Register from '../hoc/Register'
import Login from '../hoc/Login'
import CreateProject from '../hoc/CreateProject'
import Projects from '../hoc/Projects'
import Project from '../hoc/Project'
import CreateEvent from '../hoc/CreateEvent'
import Event from '../hoc/Event'
import CreateCompany from '../hoc/CreateCompany'
import Companies from '../hoc/Companies'
import Company from '../hoc/Company'
import CreateTool from '../hoc/CreateTool'
import Tools from '../hoc/Tools'
import Tool from '../hoc/Tool'
import Profiles from '../hoc/Profiles'
import Profile from '../hoc/Profile'

type Props = {
    account_id: string
}

const Router = ({account_id}: Props) => {

    return (
        <>
            <div className='navbar'>
                {routes.filter(el => account_id.length === 0 ? el.access_value < 1 : el.access_value > -1).map(el => <RouterItem title={el.title} url={el.url} />)}
            </div>
     
            <Route component={Home} path='/' /> 
            <Route component={Register} path='/register' />    
            <Route component={Login} path='/login' />  
            <Route component={CreateProject} path='/create-project/:id' />  
            <Route component={Projects} path='/projects' />  
            <Route component={Project} path='/project/:id' />  
            <Route component={CreateEvent} path='/create-event/:id' />  
            <Route component={Event} path='/event/:id' /> 
            <Route component={CreateCompany} path='/create-company/:id' />  
            <Route component={Companies} path='/companies' />  
            <Route component={Company} path='/company/:id' />  
            <Route component={CreateTool} path='/create-tool/:id' />  
            <Route component={Tools} path='/tools' />  
            <Route component={Tool} path='/tool/:id' />  
            <Route component={Profiles} path='/profiles' />  
            <Route component={Profile} path='/profile/:id' />  
        </>
    )
}

export default Router