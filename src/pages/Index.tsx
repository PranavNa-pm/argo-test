import { useCallback } from 'react';
import { ArgoProvider, useArgo } from '@/context/ArgoContext';
import { LeftPanel } from '@/components/argo/LeftPanel';
import { CenterPanel } from '@/components/argo/CenterPanel';
import { RightPanel, FilesPanel } from '@/components/argo/RightPanel';

function ArgoLayout() {
  const { activeArtifactId, rightPanelView, sidebarCollapsed, activeFilesSpaceId } = useArgo();
  const showRightPanel = (rightPanelView === 'artifact' && activeArtifactId) || (rightPanelView === 'files' && activeFilesSpaceId);
  const effectiveWidth = sidebarCollapsed ? 52 : 260;

  return (
    <div className="flex h-screen w-full overflow-hidden overflow-x-hidden bg-background">
      <div style={{ width: effectiveWidth, minWidth: effectiveWidth }} className="transition-[width,min-width] duration-200">
        <LeftPanel />
      </div>
      
      <div className="flex-1 min-w-0 flex">
        <CenterPanel />
        {showRightPanel && rightPanelView === 'artifact' && <RightPanel />}
        {showRightPanel && rightPanelView === 'files' && <FilesPanel />}
      </div>
    </div>
  );
}

const Index = () => (
  <ArgoProvider>
    <ArgoLayout />
  </ArgoProvider>
);

export default Index;
