import { forwardRef } from 'react'

export interface ImageSource {
	srcSet: string
	media?: string
	type?: string
}

export interface ImageProps extends Omit<
	React.ImgHTMLAttributes<HTMLImageElement>,
	'className'
> {
	classNames?: string
	sources?: ImageSource[]
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
	({ src, alt, width, height, sources, classNames, ...rest }, ref) => {
		return (
			<picture>
				{/* Рендерим список источников, если они переданы */}
				{sources?.map((source, index) => (
					<source
						key={index}
						srcSet={source.srcSet}
						media={source.media}
						type={source.type}
					/>
				))}
				{/* Дефолтный fallback-вариант */}
				<img
					ref={ref}
					src={src}
					alt={alt}
					width={width}
					height={height}
					className={classNames}
					{...rest}
				/>
			</picture>
		)
	}
)

Image.displayName = 'Image'
