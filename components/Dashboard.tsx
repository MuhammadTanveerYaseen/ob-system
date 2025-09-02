'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import AssessmentSheet from './AssessmentSheet';
import CreateSheetModal from './CreateSheetModal';
import ConfirmationDialog from './ConfirmationDialog';

interface Student {
  _id?: string;
  rollNumber: string;
  name: string;
  marks: { [key: string]: number };
  totalMarks: number;
}

interface Sheet {
  _id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  questions: string[];
  clos: string[];
  plos: string[];
  students: Student[];
  totalPossibleMarks?: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [currentSheet, setCurrentSheet] = useState<Sheet | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sheets on component mount
  useEffect(() => {
    console.log('Dashboard useEffect - token:', token);
    console.log('Dashboard useEffect - user:', user);
    if (token) {
      fetchSheets();
    } else {
      console.log('No token available, cannot fetch sheets');
    }
  }, [token]);

  const fetchSheets = async () => {
    try {
      console.log('Fetching sheets with token:', token);
      setLoading(true);
      const response = await fetch('/api/sheets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Sheets response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sheets response error:', errorText);
        throw new Error('Failed to fetch sheets');
      }
      const data = await response.json();
      console.log('Sheets data:', data);
      setSheets(data);
      
      // Set first sheet as current if available
      if (data.length > 0 && !currentSheet) {
        setCurrentSheet(data[0]);
      }
    } catch (err) {
      console.error('Fetch sheets error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createSheet = async (sheetName: string) => {
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: sheetName,
          questions: [],
          clos: [],
          plos: [],
          students: []
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create sheet');
      }

      const newSheet = await response.json();
      setSheets(prev => [newSheet, ...prev]);
      setCurrentSheet(newSheet);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sheet');
    }
  };

  const updateSheet = async (updatedSheet: Sheet) => {
    try {
      const response = await fetch(`/api/sheets/${updatedSheet._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedSheet),
      });

      if (!response.ok) {
        throw new Error('Failed to update sheet');
      }

      const savedSheet = await response.json();
      setSheets(prev => prev.map(sheet => 
        sheet._id === savedSheet._id ? savedSheet : sheet
      ));
      setCurrentSheet(savedSheet);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sheet');
    }
  };

  const deleteSheet = async () => {
    if (!currentSheet) return;

    try {
      const response = await fetch(`/api/sheets/${currentSheet._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete sheet');
      }

      setSheets(prev => prev.filter(sheet => sheet._id !== currentSheet._id));
      
      // Set another sheet as current or null if no sheets left
      const remainingSheets = sheets.filter(sheet => sheet._id !== currentSheet._id);
      setCurrentSheet(remainingSheets.length > 0 ? remainingSheets[0] : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sheet');
    }
  };

  const selectSheet = (sheetId: string) => {
    const sheet = sheets.find(s => s._id === sheetId);
    if (sheet) {
      setCurrentSheet(sheet);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment sheets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSheets}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-600">Faculty Dashboard</h1>
            <p className="text-gray-600 mt-1">University of Southern Punjab - Assessment Management</p>
            <p className="text-gray-600 mt-1">Welcome back, {user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-gray-600">Manage your assessment sheets and student progress</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Sheets: <span className="font-semibold">{sheets.length}</span></p>
            <p className="text-sm text-gray-600">Department: <span className="font-semibold">{user?.department || 'Not specified'}</span></p>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          sheets={sheets}
          currentSheetId={currentSheet?._id || null}
          onSheetSelect={selectSheet}
          onCreateSheet={() => setShowCreateModal(true)}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {currentSheet ? (
            <div className="h-full overflow-y-auto p-6">
              <AssessmentSheet
                sheet={currentSheet}
                onUpdate={updateSheet}
                onDelete={() => setShowDeleteDialog(true)}
                userRole={user?.role}
                userId={user?.id}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-600">No sheet selected</h3>
                <p className="mt-2 text-gray-600">Select a sheet from the sidebar or create a new one to get started.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Your First Sheet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Sheet Modal */}
      <CreateSheetModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createSheet}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          setShowDeleteDialog(false);
          deleteSheet();
        }}
        title="Delete Assessment Sheet"
        message={`Are you sure you want to delete "${currentSheet?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
