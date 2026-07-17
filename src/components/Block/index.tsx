import React from 'react'
import type { FC, JSX, ReactElement, ReactNode } from 'react'
import { validateChildren } from '@shared/utils/validateChildren'
import { Button } from '@/components/Button'
import styles from './Block.module.scss'

export interface IBlockProps extends IUIKitProps {
    style: BlockStyle
    title?: string
    titleStyle?: TitleStyle
    titleChildren?: ReactNode | ReactElement
    width?: number
    height?: number
    children?: ReactNode | ReactElement
}

export type BlockStyle = 'default' | 'outlined'
export type TitleStyle = 1 | 2 | 3 | 4 | 5 | 6

const STYLE_TO_CLASS: Record<BlockStyle, string> = {
    default: styles.default,
    outlined: styles.outlined
}

export const Block: FC<IBlockProps> = ({
    style,
    title,
    titleStyle = 2,
    titleChildren,
    width,
    height,
    classNames, 
    children
}) => {

    const validTitleChildren = validateChildren({
        children: titleChildren,
        allowedTypes: ['svg', Button], // компоненты разрешенные для перебрасывания в titleChildren
        componentName: 'div'
    })

    const variantTitle: Record<TitleStyle, JSX.Element> = {
        1: <h1 className={styles.title}>{title}</h1>,
        2: <h2 className={styles.title}>{title}</h2>,
        3: <h3 className={styles.title}>{title}</h3>,
        4: <h4 className={styles.title}>{title}</h4>,
        5: <h5 className={styles.title}>{title}</h5>,
        6: <h6 className={styles.title}>{title}</h6>,
    }

    const widthWrapper: string = (width != null && width > 0) ? `${width}px` : '100%'
    const heightWrapper: string = (height != null && height > 0) ? `${height}px` : '100%'

    return (
        <div className={styles.blockWrapper} style={{width: widthWrapper, height: heightWrapper}}>
            { title && 
                <span className={styles.titleWrapper}>
                    {variantTitle[titleStyle]}
                    {validTitleChildren}
                </span>
            }
            <div className={[styles.block, STYLE_TO_CLASS[style], classNames].filter(Boolean).join(' ')}>
                {children}
            </div>
        </div>
    )
}

Block.displayName = 'Block'