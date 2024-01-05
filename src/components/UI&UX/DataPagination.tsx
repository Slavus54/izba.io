import React, {useState ,useMemo} from 'react'
import {PAGINATION_LIMIT} from '../../env/env'
import {DataPaginationProps} from '../../types/types'

const DataPagination: React.FC<DataPaginationProps> = ({initialItems = [], setItems, label = ''}) => {
    const [maxPage, setMaxPage] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)

    useMemo(() => {
        let max = Math.ceil(initialItems.length / PAGINATION_LIMIT)

        setMaxPage(max)

        if (currentPage > max) {
            setCurrentPage(max)
        }
    }, [initialItems])

    useMemo(() => {
        let result = initialItems.slice((currentPage - 1) * PAGINATION_LIMIT, currentPage * PAGINATION_LIMIT)
        
        setItems(result)
    }, [currentPage])

    return (
        <>
            <div className='items small'>
                <img onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} src='https://img.icons8.com/ios/50/left--v1.png' className='icon' alt='prev' />
                <h2>{label} {currentPage}/{maxPage === 0 ? 1 : maxPage}</h2>
                <img onClick={() => currentPage < maxPage && setCurrentPage(currentPage + 1)} src='https://img.icons8.com/ios/50/right--v1.png' className='icon' alt='next' />
            </div>
        </>
    )
}

export default DataPagination