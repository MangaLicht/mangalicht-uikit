import type { Meta, StoryObj } from '@storybook/react'
import { ExpandableCard } from './index'
import { Button } from '../Button'
import { Block } from '../Block'
import { BookmarkIcon } from '../../icons/Bookmark'
// @ts-ignore: allow importing global SCSS in Storybook preview
import styles from './ExpandableCard.stories.module.scss'

const meta = {
	title: 'Components/ExpandableCard',
	component: ExpandableCard,
	parameters: {
		layout: 'centered'
	}
} satisfies Meta<typeof ExpandableCard>

export default meta

type Story = StoryObj<typeof meta>

const ActionSection = () => (
	<div className={styles.actionSection}>
		{/* Cover */}
		<ExpandableCard.ExpandableElenent
			initialClassName={styles.coverInitial}
			expandedClassName={styles.coverExpanded}
		>
			<div className={styles.cover}>
				<span>Обложка</span>
			</div>
		</ExpandableCard.ExpandableElenent>
		{/* Action Buttons */}
		<ExpandableCard.ExpandableElenent
			initialClassName={styles.readButtonInitial}
			expandedClassName={styles.readButtonExpanded}
		>
			<div className={styles.actionSection}>
				<Button variant='highlight' labelText='Начать читать' />
				<div className={styles.otherActionsSection}>
					<Button variant='default' labelText='К тайтлу' />
					<Button
						variant='default'
						iconStart={<BookmarkIcon />}
						aria-label='Добавить в закладки'
					/>
				</div>
			</div>
		</ExpandableCard.ExpandableElenent>
	</div>
)

export const Reference: Story = {
	render: () => (
		<div className={styles.story}>
			<ExpandableCard
				width={162}
				height={313}
				expandedWidth={612}
				expandedHeight={532}
				showDelay={700}
				animationDuration={360}
			>
				{/* Action Section */}
				<ExpandableCard.ExpandableElenent
					initialClassName={styles.actionSectionInitial}
					expandedClassName={styles.actionSectionExpanded}
				>
					<ActionSection />
				</ExpandableCard.ExpandableElenent>
				{/* Title */}
				<ExpandableCard.ExpandableElenent
					initialClassName={styles.titleInitial}
					expandedClassName={styles.titleExpanded}
				>
					Поколение Нова
				</ExpandableCard.ExpandableElenent>
				{/* Description */}
				<ExpandableCard.ExpandableElenent
					initialClassName={styles.descriptionInitial}
					expandedClassName={styles.descriptionExpanded}
				>
					<Block variant='outlined' classNames={styles.description}>
						<p className={styles.descriptionText}>
							==description field here==
						</p>

						<p className={styles.descriptionText}>
							Здесь располагается длинное описание тайтла. Блок
							намеренно содержит достаточно текста, чтобы показать
							вертикальную прокрутку внутри карточки.
						</p>

						<p className={styles.descriptionText}>
							Дополнительный текст нужен для проверки поведения
							scrollbar при переполнении содержимого.
						</p>

						<p className={styles.descriptionText}>
							Еще один абзац описания тайтла, который находится
							ниже видимой области.
						</p>

						<p className={styles.descriptionText}>
							Конец демонстрационного описания.
						</p>
					</Block>
				</ExpandableCard.ExpandableElenent>

				<ExpandableCard.ExpandableElenent
					initialClassName={styles.tagsInitial}
					expandedClassName={styles.tagsExpanded}
				>
					<div className={styles.tags}>
						<span className={styles.tag}>Постапокалипсис</span>
						<span className={styles.tag}>Повседневность</span>
						<span className={styles.tag}>Драма</span>
						<span className={styles.tag}>+ ещё</span>
					</div>
				</ExpandableCard.ExpandableElenent>
			</ExpandableCard>
		</div>
	)
}
