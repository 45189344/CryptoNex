import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { AnalyzeWallet } from './pages/AnalyzeWallet';
import { WalletOverview } from './pages/WalletOverview';
import { TransactionsView } from './pages/TransactionsView';
import { GraphView } from './pages/GraphView';
import { VaspAttributionView } from './pages/VaspAttributionView';
import { EvidenceView } from './pages/EvidenceView';
import { InvestigationsView } from './pages/InvestigationsView';
import { RiskAlertsView } from './pages/RiskAlertsView';
import { AuditTrailView } from './pages/AuditTrailView';
import { VaspRegistryView } from './pages/VaspRegistryView';
import { SettingsView } from './pages/SettingsView';
import { NodeDetailModal } from './components/NodeDetailModal';
import { ReportModal } from './components/ReportModal';
import { EvidencePackageModal } from './components/EvidencePackageModal';
import { AuthoritySubmissionModal } from './components/AuthoritySubmissionModal';

export const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'analyze':
        return <AnalyzeWallet />;
      case 'overview':
        return <WalletOverview />;
      case 'transactions':
        return <TransactionsView />;
      case 'graph':
        return <GraphView />;
      case 'attribution':
        return <VaspAttributionView />;
      case 'evidence':
        return <EvidenceView />;
      case 'risk-alerts':
        return <RiskAlertsView />;
      case 'investigations':
        return <InvestigationsView />;
      case 'audit-trail':
        return <AuditTrailView />;
      case 'vasp-registry':
        return <VaspRegistryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderActiveTab()}
        </main>
      </div>

      {/* Global Modals */}
      <NodeDetailModal />
      <ReportModal />
      <EvidencePackageModal />
      <AuthoritySubmissionModal />
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
