'use client';

interface Sheet {
  _id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  totalPossibleMarks?: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface SidebarProps {
  sheets: Sheet[];
  currentSheetId: string | null;
  onSheetSelect: (sheetId: string) => void;
  onCreateSheet: () => void;
}

export default function Sidebar({ sheets, currentSheetId, onSheetSelect, onCreateSheet }: SidebarProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-600 mb-2">Assessment Manager</h1>
        <p className="text-gray-600 text-sm">Manage your assessment sheets</p>
      </div>

      {/* Create New Sheet Button */}
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={onCreateSheet}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Sheet
        </button>
      </div>

      {/* Sheets List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
            Assessment Sheets
          </h2>
          
          {sheets.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-600">No sheets yet</h3>
              <p className="mt-1 text-sm text-gray-600">Get started by creating your first assessment sheet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sheets.map((sheet) => (
                <button
                  key={sheet._id}
                  onClick={() => onSheetSelect(sheet._id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                    currentSheetId === sheet._id
                      ? 'bg-blue-50 border border-blue-200 text-blue-900'
                      : 'text-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium truncate ${
                          currentSheetId === sheet._id ? 'text-blue-900' : 'text-gray-600'
                        }`}>
                          {sheet.name}
                        </h3>
                        {getStatusBadge(sheet.status)}
                      </div>
                      <p className={`text-xs ${
                        currentSheetId === sheet._id ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        Updated {formatDate(sheet.updatedAt)}
                      </p>
                      <p className={`text-xs ${
                        currentSheetId === sheet._id ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        By {sheet.teacherName}
                      </p>
                    </div>
                    {currentSheetId === sheet._id && (
                      <div className="ml-2 flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-center text-xs text-gray-600">
          <p>Assessment Management System</p>
          <p className="mt-1">Built with Next.js & MongoDB</p>
        </div>
      </div>
    </div>
  );
}

