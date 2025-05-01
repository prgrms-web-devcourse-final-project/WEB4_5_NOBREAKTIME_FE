import DashboardLayout from '../dashboardLayout'
import WordIcon from '@/components/icon/wordIcon'

function Word() {
    return (
        <DashboardLayout title="Word Learning" icon={<WordIcon />}>
            <div>영단어</div>
        </DashboardLayout>
    )
}

export default Word
