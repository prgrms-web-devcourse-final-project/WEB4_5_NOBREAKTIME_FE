import DashboardLayout from '../dashboardLayout'
import GrammarIcon from '@/components/icon/grammarIcon'

function Grammar() {
    return (
        <DashboardLayout title="Grammar Learning" icon={<GrammarIcon />}>
            <div>문법</div>
        </DashboardLayout>
    )
}

export default Grammar
