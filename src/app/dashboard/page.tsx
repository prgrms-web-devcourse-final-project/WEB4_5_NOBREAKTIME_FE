import DashboardLayout from '../dashboardLayout'
import DashboardIcon from '@/components/icon/dashboardIcon'

function Dashboard() {
    return (
        <DashboardLayout title="Dashboard" icon={<DashboardIcon />}>
            <div>대시보드</div>
        </DashboardLayout>
    )
}

export default Dashboard
