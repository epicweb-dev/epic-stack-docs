import { Link } from '@remix-run/react'
import { useTheme } from '#app/root.tsx'
import categories from '#content/docs/categories.ts'
import { SearchBar } from './search-bar.tsx'
import { Dialog, DialogTrigger, DialogContent } from './ui/dialog.tsx'
import { Icon } from './ui/icon.tsx'

export default function Menu() {
	const theme = useTheme()
	return (
		<>
			<div className="hidden md:flex">
				<div className="h-50rem flex h-full flex-col overflow-scroll border-r p-2">
					<Link to="/">
						{theme === 'dark' ? (
							<Icon name="epic-stack" className="h-56 w-56" />
						) : (
							<Icon name="epic-stack-light" className="h-56 w-56" />
						)}
					</Link>
					<div className="flex flex-col gap-2 py-2">
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
						<SearchBar status="idle" />
						<div className="max-h-[50rem] overflow-scroll">
							<h3 className="py-2 text-2xl font-semibold">Topics</h3>
							<div className="flex flex-col gap-2">
								{Object.entries(categories).map(([category, subcategories]) => {
									return (
										<div key={category}>
											<h4 className="text-1xl">{category.split('.')[0]}</h4>
											<div className="flex flex-col gap-0.5">
												{subcategories.map(subcategory => {
													return (
														<div className="ml-2" key={subcategory}>
															<Link to={`/topic/${subcategory.split('.')[0]}`}>
																<h5 className="text-lg font-thin">
																	{subcategory.split('.')[0]}
																</h5>
															</Link>
														</div>
													)
												})}
											</div>
										</div>
									)
								})}
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="absolute left-0 top-0 flex w-full justify-between p-4 md:hidden">
				<Dialog>
					<DialogTrigger asChild>
						<button>
							<Icon size="xl" name="hamburger-menu" />
						</button>
					</DialogTrigger>
					<DialogContent
						className={'max-h-[90vh] overflow-y-scroll lg:max-w-screen-lg'}
					>
						<div className="flex h-full flex-col p-2">
							{theme === 'dark' ? (
								<Icon name="epic-stack" className="h-100 w-100" />
							) : (
								<Icon name="epic-stack-light" className="h-100 w-100" />
							)}
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
									{Object.entries(categories).map(
										([category, subcategories]) => {
											return (
												<div key={category}>
													<h4 className="text-1xl">{category.split('.')[0]}</h4>
													<div className="flex flex-col gap-0.5">
														{subcategories.map(subcategory => {
															return (
																<div className="ml-2" key={subcategory}>
																	<h5 className="text-lg font-thin">
																		{subcategory.split('.')[0]}
																	</h5>
																</div>
															)
														})}
													</div>
												</div>
											)
										},
									)}
								</div>
							</div>
						</div>
					</DialogContent>
				</Dialog>
				<SearchBar autoSubmit status="idle" />
			</div>
		</>
	)
}
