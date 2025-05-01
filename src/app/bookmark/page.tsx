import DashboardLayout from '../dashboardLayout'
import BookmarkIcon from '@/components/icon/bookmarkIcon'

function Bookmark() {
    return (
        <DashboardLayout title="Bookmark" icon={<BookmarkIcon />}>
            <div>북마크</div>
        </DashboardLayout>
    )
}

export default Bookmark
