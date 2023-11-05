import { Link } from '@remix-run/react'
import { useRef } from 'react'
import { useTheme } from '#app/root.tsx'
import staticCategories from '#content/docs/categories.ts'
import { SearchBar } from './search-bar.tsx'
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogClose,
} from './ui/dialog.tsx'
import { Icon } from './ui/icon.tsx'

const CategoryLinks = ({
	categories,
	onClick,
}: {
	categories: typeof staticCategories
	onClick?: () => void
}) => {
	return (
		<>
			{Object.entries(categories).map(([category, subcategories]) => {
				return (
					<div key={category} className="pb-4">
						<h4 className="text-1xl py-2">{category.split('.')[0]}</h4>
						<div className="flex flex-col">
							{subcategories.map(subcategory => {
								return (
									<div
										className=" border-l border-l-gray-300 p-0.5 pl-2 font-thin hover:border-l-gray-500 hover:font-semibold"
										key={subcategory}
									>
										<Link
											to={`/topic/${subcategory.split('.')[0]}`}
											onClick={onClick}
										>
											<h5 className="text-lg">{subcategory.split('.')[0]}</h5>
										</Link>
									</div>
								)
							})}
						</div>
					</div>
				)
			})}
		</>
	)
}

export default function Menu() {
	const theme = useTheme()
	const closeButtonRef = useRef<HTMLButtonElement>(null)
	const closeDialog = () => {
		closeButtonRef.current?.click()
	}
	return (
		<nav className="relative">
			<div className="sticky bottom-0 top-0 hidden h-[100vh] w-48 md:flex lg:w-64">
				<div className="flex h-full flex-col items-center border-r pr-2 pt-2">
					<Link to="/">
						<Icon
							name={theme === 'dark' ? `epic-stack` : 'epic-stack-light'}
							className="h-32 w-32"
						/>
					</Link>
					<div className="w-full px-2 pt-2">
						<SearchBar status="idle" />
					</div>
					<div className="flex flex-col gap-2 overflow-scroll p-2">
						<Link
							to="/topic/getting-started"
							className={`mt-2 rounded-sm border md:text-base ${
								theme === 'light'
									? 'border-[#6A23FF] bg-[#6A23FF]'
									: 'border-[#D6C5FF] bg-[#D6C5FF]'
							} py-2 text-center font-semibold text-primary-foreground ${
								theme === 'light'
									? 'hover:border-[#6923ffd8] hover:bg-[#6923ffd8]'
									: 'hover:border-[#e0d3ff] hover:bg-[#e0d3ff]'
							}`}
						>
							Getting Started
						</Link>
						<Link
							to="/decision/"
							className={` my-2 rounded-sm border ${
								theme === 'light'
									? 'border-[#6A23FF] text-[#6A23FF]'
									: 'border-[#D6C5FF] text-[#D6C5FF]'
							} py-2 text-center font-semibold text-primary-foreground ${
								theme === 'light'
									? 'hover:border-[#6923ffd8] hover:text-[#6923ffd8]'
									: 'hover:border-[#e0d3ff] hover:text-[#e0d3ff] '
							}`}
						>
							Decisions
						</Link>
						<h3 className="py-2 text-2xl font-semibold">Topics</h3>
						<div className="flex flex-col gap-1">
							<CategoryLinks categories={staticCategories} />
						</div>
					</div>
				</div>
			</div>
			<div className="absolute left-0 right-0 top-0 flex w-[100vw] justify-between p-4 md:hidden">
				<Dialog>
					<DialogTrigger asChild>
						<button aria-label="nav menu expand">
							<Icon size="xl" name="hamburger-menu" />
						</button>
					</DialogTrigger>
					<DialogContent
						className={'max-h-[90vh] overflow-y-scroll lg:max-w-screen-lg'}
					>
						<div className="flex h-full flex-col p-2">
							<Icon
								name={theme === 'dark' ? `epic-stack` : 'epic-stack-light'}
								className="h-100 w-100"
							/>
							<div className="flex flex-col gap-2 overflow-scroll py-2">
								<Link
									to="/topic/getting-started"
									className={` my-2 rounded-sm ${
										theme === 'light' ? 'bg-[#6A23FF]' : 'bg-[#D6C5FF]'
									} py-2 text-center text-2xl font-semibold text-primary-foreground ${
										theme === 'light'
											? 'hover:bg-[#6923ffd8]'
											: 'hover:bg-[#e0d3ff]'
									}`}
								>
									Getting Started
								</Link>
								<h3 className="py-2 text-2xl font-semibold">Topics</h3>
								<div className="flex flex-col gap-2">
									<CategoryLinks
										categories={staticCategories}
										onClick={closeDialog}
									/>
								</div>
							</div>
						</div>
					</DialogContent>
					<DialogClose id="dialog-close" asChild>
						<button ref={closeButtonRef} className="hidden">
							Close
						</button>
					</DialogClose>
				</Dialog>
				<SearchBar autoSubmit status="idle" />
			</div>
		</nav>
	)
}
