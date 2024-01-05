import PersonalProfileInfo from './PersonalProfileInfo'
import GeoProfileInfo from './GeoProfileInfo'
import ProfileSecurity from './ProfileSecurity'
import ProfileWork from './ProfileWork'
import ProfileComponents from './ProfileComponents'

import {AccountPageComponentType} from '../../types/types'

const components: AccountPageComponentType[] = [
    {
        title: 'Profile',
        icon: 'https://img.icons8.com/ios/50/edit-user-male.png',
        component: PersonalProfileInfo
    },
    {
        title: 'Location',
        icon: 'https://img.icons8.com/ios/50/marker.png',
        component: GeoProfileInfo
    },
    {
        title: 'Security',
        icon: 'https://img.icons8.com/ios/50/fingerprint--v1.png',
        component: ProfileSecurity
    },
    {
        title: 'Works',
        icon: 'https://img.icons8.com/ios/50/project.png',
        component: ProfileWork
    },
    {
        title: 'Components',
        icon: 'https://img.icons8.com/dotty/80/list.png',
        component: ProfileComponents
    }
]

export const default_component = components[0]

export default components