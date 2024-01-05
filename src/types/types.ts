export interface AccountPageComponentProps {
    profile: any,
    context: any
}

export type AccountPageComponentType = {
    title: string
    icon: string
    component: any
}

export type CollectionPropsType = {
    params: {
        id: string
    }
}

export type NavigatorWrapperPropsType = {
    children: any
    isRedirect: boolean
    id?: string
    url?: string
}

export type ImageLookProps = {
    src: any
    className: string
    min?: number
    max?: number
    onClick?: any
    alt?: string
}

export type BrowserImageProps = {
    url: string,
    alt?: string
}

export type CloseProps = {
    onClick: any
}

export type DataPaginationProps = {
    initialItems: any[]
    setItems: any
    label?: string
}

export type FormPaginationProps = {
    label: string
    num: number
    setNum: any
    items: any[]
}

export type ImageLoaderProps = {
    setImage: any
    label?: string
}

export type QuantityProps = {
    num: number
    setNum: any
    part?: number
    min?: number
    max?: number
    label?:string
}

export type InformationPopupProps = {
    text: string
}