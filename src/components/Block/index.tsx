import { forwardRef } from 'react'
import type { JSX, ReactElement, ReactNode } from 'react'
import { validateChildren } from '@shared/utils/validateChildren'
import { Button } from '@/components/Button'
import styles from './Block.module.scss'

export interface IBlockProps extends IUIKitProps {
    variant: BlockVariant
    title?: string
    titleStyle?: TitleStyle
    titleChildren?: ReactNode | ReactElement
    width?: number
    height?: number
    className?: string
    children?: ReactNode | ReactElement
}

export type BlockVariant = 'default' | 'outlined'
export type TitleStyle = 1 | 2 | 3 | 4 | 5 | 6

const VARIANT_TO_CLASS: Record<BlockVariant, string> = {
    default: styles.default,
    outlined: styles.outlined
}

export const Block = forwardRef<HTMLDivElement, IBlockProps>((
    {
        variant,
        title,
        titleStyle = 2,
        titleChildren,
        width,
        height,
        className,
        classNames, 
        children,
        ...rest
    },
    ref,
) => {

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
        <div ref={ref} className={styles.blockWrapper} style={{width: widthWrapper, height: heightWrapper}} {...rest}>
            { title && 
                <span className={styles.titleWrapper}>
                    {variantTitle[titleStyle]}
                    {validTitleChildren}
                </span>
            }
            <div className={[styles.block, VARIANT_TO_CLASS[variant], className, classNames].filter(Boolean).join(' ')}>
                {children}
            </div>
        </div>
    )
})

Block.displayName = 'Block'