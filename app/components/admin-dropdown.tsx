import { Link, useFetcher } from '@remix-run/react'
import { DatabaseIcon, DatabaseZapIcon, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { type handleDeleteRequest } from '#app/routes/admin+/cache.tsx'
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuGroup,
	DropdownMenuItem,
} from './ui/dropdown-menu.tsx'
import { Icon } from './ui/icon.tsx'

export const AdminDropdown = ({ user }: { user: any }) => {
	const fetcher = useFetcher<typeof handleDeleteRequest>()
	const [open, setOpen] = useState(false)
	const closeDropdown = () => {
		setOpen(false)
	}
	useEffect(() => {
		const data = fetcher.data
		if (data?.message === 'success') {
			//TODO: not sure why I have to type narrow this, message being 'success' should be enough.
			if ('deleted' in data && 'keys' in data && 'message' in data) {
				toast.success(`Deleted ${data.deleted} records from cache`)
			}
		}
	}, [fetcher.data])
	return (
		<div className="absolute right-10 top-10 z-10 flex items-center gap-0">
			<div className="border-r-1 rounded-sm rounded-r-none border p-1 px-3">
				{user.username}
			</div>
			<DropdownMenu open={open} onOpenChange={setOpen}>
				<DropdownMenuTrigger asChild>
					<button className="rounded-sm rounded-l-none border border-l-0 p-1">
						<Icon name="chevron-down" className="h-4 w-4" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56">
					<DropdownMenuLabel>Admin</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem>
							<Link
								className="flex w-full gap-0.5"
								to="/admin/cache"
								onClick={closeDropdown}
							>
								<DatabaseIcon className="mr-2 h-4 w-4" />
								<span>Cache</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem>
							<fetcher.Form action="/admin/cache" method="DELETE">
								<button className="flex h-full w-full gap-0.5">
									<input
										type="hidden"
										name="query"
										value="docs:.*:downloaded"
									/>
									<DatabaseZapIcon className="mr-2 h-4 w-4" />
									<span>Refresh MDX Cache</span>
								</button>
							</fetcher.Form>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						<Link className="flex gap-0.5" to="/logout">
							<LogOut className="mr-2 h-4 w-4" />
							<span>Logout</span>
						</Link>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
