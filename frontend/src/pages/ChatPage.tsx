import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ChatPanel } from '../components/chat/ChatPanel';

export function ChatPage() {
  return (
    <DashboardLayout>
      <div className="h-full">
        <ChatPanel />
      </div>
    </DashboardLayout>
  );
}
