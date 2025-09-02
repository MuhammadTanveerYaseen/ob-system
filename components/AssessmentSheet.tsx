'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  submittedAt?: string;
  approvedAt?: string;
  approvedByName?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface AssessmentSheetProps {
  sheet: Sheet;
  onUpdate: (updatedSheet: Sheet) => void;
  onDelete: () => void;
  userRole?: string;
  userId?: string;
}

export default function AssessmentSheet({ sheet, onUpdate, onDelete, userRole, userId }: AssessmentSheetProps) {
  const { token } = useAuth();
  const [localSheet, setLocalSheet] = useState<Sheet>(sheet);
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newCLO, setNewCLO] = useState('');
  const [newPLO, setNewPLO] = useState('');
  const [newStudent, setNewStudent] = useState({ rollNumber: '', name: '' });
  const [studentAccess, setStudentAccess] = useState({ rollNumber: '', name: '' });
  const [showStudentView, setShowStudentView] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLocalSheet(sheet);
  }, [sheet]);

  // Recalculate totals for all students when sheet changes
  useEffect(() => {
    if (localSheet.students.length > 0) {
      const updatedSheet = { ...localSheet };
      updatedSheet.students = updatedSheet.students.map(student => ({
        ...student,
        totalMarks: calculateTotalMarks(student.marks)
      }));
      
      if (JSON.stringify(updatedSheet) !== JSON.stringify(localSheet)) {
        setLocalSheet(updatedSheet);
        onUpdate(updatedSheet);
      }
    }
  }, [localSheet.questions, localSheet.clos, localSheet.plos]);

  // Calculate initial totals when component mounts
  useEffect(() => {
    if (localSheet.students.length > 0) {
      recalculateAllTotals();
    }
  }, []);

  const calculateTotalMarks = (marks: { [key: string]: number }): number => {
    let total = 0;
    
    // Add marks for questions
    localSheet.questions.forEach(question => {
      total += marks[question] || 0;
    });
    
    // Add marks for CLOs
    localSheet.clos.forEach(clo => {
      total += marks[clo] || 0;
    });
    
    // Add marks for PLOS
    localSheet.plos.forEach(plo => {
      total += marks[plo] || 0;
    });
    
    return total;
  };

  const recalculateAllTotals = () => {
    const updatedSheet = { ...localSheet };
    updatedSheet.students = updatedSheet.students.map(student => ({
      ...student,
      totalMarks: calculateTotalMarks(student.marks)
    }));
    setLocalSheet(updatedSheet);
    onUpdate(updatedSheet);
  };

  const handleCellEdit = (rowIndex: number, colKey: string, value: string) => {
    const updatedSheet = { ...localSheet };
    
    if (colKey === 'rollNumber' || colKey === 'name') {
      updatedSheet.students[rowIndex] = {
        ...updatedSheet.students[rowIndex],
        [colKey]: value
      };
         } else {
       const student = updatedSheet.students[rowIndex];
       const marks = { ...student.marks };
       marks[colKey] = parseFloat(value) || 0;
       updatedSheet.students[rowIndex] = {
         ...student,
         marks
       };
     }
    
    setLocalSheet(updatedSheet);
    onUpdate(updatedSheet);
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      const updatedSheet = {
        ...localSheet,
        questions: [...localSheet.questions, newQuestion.trim()]
      };
      setLocalSheet(updatedSheet);
      onUpdate(updatedSheet);
      setNewQuestion('');
    }
  };

  const removeQuestion = (index: number) => {
    const updatedSheet = {
      ...localSheet,
      questions: localSheet.questions.filter((_, i) => i !== index)
    };
    
         // Remove marks for this question from all students
     updatedSheet.students = updatedSheet.students.map(student => {
       const marks = { ...student.marks };
       const questionKey = `question_${index}`;
       delete marks[questionKey];
       return { ...student, marks };
     });
    
    setLocalSheet(updatedSheet);
    onUpdate(updatedSheet);
  };

  const addCLO = () => {
    if (newCLO.trim()) {
      const updatedSheet = {
        ...localSheet,
        clos: [...localSheet.clos, newCLO.trim()]
      };
      setLocalSheet(updatedSheet);
      onUpdate(updatedSheet);
      setNewCLO('');
    }
  };

  const removeCLO = (index: number) => {
    const updatedSheet = {
      ...localSheet,
      clos: localSheet.clos.filter((_, i) => i !== index)
    };
    
         // Remove marks for this CLO from all students
     updatedSheet.students = updatedSheet.students.map(student => {
       const marks = { ...student.marks };
       const cloKey = `clo_${index}`;
       delete marks[cloKey];
       return { ...student, marks };
     });
    
    setLocalSheet(updatedSheet);
    onUpdate(updatedSheet);
  };

  const addPLO = () => {
    if (newPLO.trim()) {
      const updatedSheet = {
        ...localSheet,
        plos: [...localSheet.plos, newPLO.trim()]
      };
      setLocalSheet(updatedSheet);
      onUpdate(updatedSheet);
      setNewPLO('');
    }
  };

  const removePLO = (index: number) => {
    const updatedSheet = {
      ...localSheet,
      plos: localSheet.plos.filter((_, i) => i !== index)
    };
    
         // Remove marks for this PLO from all students
     updatedSheet.students = updatedSheet.students.map(student => {
       const marks = { ...student.marks };
       const ploKey = `plo_${index}`;
       delete marks[ploKey];
       return { ...student, marks };
     });
    
    setLocalSheet(updatedSheet);
    onUpdate(updatedSheet);
  };

  const addStudent = () => {
    if (newStudent.rollNumber.trim() && newStudent.name.trim()) {
      const updatedSheet = {
        ...localSheet,
                 students: [...localSheet.students, {
           rollNumber: newStudent.rollNumber.trim(),
           name: newStudent.name.trim(),
           marks: {},
           totalMarks: 0
         }]
      };
      setLocalSheet(updatedSheet);
      onUpdate(updatedSheet);
      setNewStudent({ rollNumber: '', name: '' });
    }
  };

  const removeStudent = (index: number) => {
    const updatedSheet = {
      ...localSheet,
      students: localSheet.students.filter((_, i) => i !== index)
    };
    setLocalSheet(updatedSheet);
    onUpdate(updatedSheet);
  };

  const exportToExcel = () => {
    // Create CSV content
    const headers = ['Roll Number', 'Student Name', ...localSheet.questions, ...localSheet.clos, 'Total Marks'];
    const csvContent = [
      headers.join(','),
      ...localSheet.students.map(student => {
        const row = [
          student.rollNumber,
          student.name,
                     ...localSheet.questions.map(q => student.marks[q] || ''),
           ...localSheet.clos.map(clo => student.marks[clo] || ''),
          student.totalMarks
        ];
        return row.join(',');
      })
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${localSheet.name}_assessment.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Approval' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleSubmitForApproval = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/sheets/${localSheet._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const updatedSheet = await response.json();
        setLocalSheet(updatedSheet);
        onUpdate(updatedSheet);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit for approval');
      }
    } catch (error) {
      alert('Failed to submit for approval');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/sheets/${localSheet._id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (response.ok) {
        const updatedSheet = await response.json();
        setLocalSheet(updatedSheet);
        onUpdate(updatedSheet);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to approve sheet');
      }
    } catch (error) {
      alert('Failed to approve sheet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/sheets/${localSheet._id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ 
          action: 'reject',
          rejectionReason: rejectionReason.trim()
        }),
      });

      if (response.ok) {
        const updatedSheet = await response.json();
        setLocalSheet(updatedSheet);
        onUpdate(updatedSheet);
        setShowRejectDialog(false);
        setRejectionReason('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to reject sheet');
      }
    } catch (error) {
      alert('Failed to reject sheet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEdit = localSheet.status === 'draft' || localSheet.status === 'rejected';
  const isOwner = userRole === 'faculty' && userId === localSheet.teacherId;
  const isHOD = userRole === 'hod';
  const canApprove = isHOD && localSheet.status === 'pending_approval';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{localSheet.name}</h1>
          <p className="text-gray-600">Assessment Sheet</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-700">Total Marks:</span>
            {canEdit ? (
              <input
                type="number"
                min="0"
                step="1"
                value={localSheet.totalPossibleMarks ?? 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value || '0', 10);
                  const updated = { ...localSheet, totalPossibleMarks: isNaN(value) ? 0 : value };
                  setLocalSheet(updated);
                  onUpdate(updated);
                }}
                className="w-28 px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <span className="text-gray-900 font-medium">{localSheet.totalPossibleMarks ?? 0}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {getStatusBadge(localSheet.status)}
            {localSheet.status === 'pending_approval' && (
              <span className="text-sm text-gray-500">
                Submitted on {new Date(localSheet.submittedAt!).toLocaleDateString()}
              </span>
            )}
            {localSheet.status === 'approved' && (
              <span className="text-sm text-gray-500">
                Approved by {localSheet.approvedByName} on {new Date(localSheet.approvedAt!).toLocaleDateString()}
              </span>
            )}
            {localSheet.status === 'rejected' && localSheet.rejectionReason && (
              <span className="text-sm text-red-600">
                Rejected: {localSheet.rejectionReason}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {/* Approval workflow buttons */}
          {isOwner && localSheet.status === 'draft' && (
            <button
              onClick={handleSubmitForApproval}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          )}
          
          {canApprove && (
            <>
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {isSubmitting ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => setShowRejectDialog(true)}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Reject
              </button>
            </>
          )}
          
          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Export to CSV
          </button>
          
          {isOwner && canEdit && (
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Delete Sheet
            </button>
          )}
        </div>
      </div>

      {/* Add Questions and CLOs */}
      {canEdit && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Add Questions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Add Questions</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Enter question text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white !bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: 'white', background: 'white' }}
              />
              <button
                onClick={addQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Add CLOs */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Add CLOs</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCLO}
                onChange={(e) => setNewCLO(e.target.value)}
                placeholder="Enter CLO text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white !bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: 'white', background: 'white' }}
              />
              <button
                onClick={addCLO}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add PLOS */}
      {canEdit && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3">Add PLOS</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPLO}
              onChange={(e) => setNewPLO(e.target.value)}
              placeholder="Enter PLO text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white !bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: 'white', background: 'white' }}
            />
            <button
              onClick={addPLO}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Add Student */}
      {canEdit && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3">Add Student</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={newStudent.rollNumber}
              onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
              placeholder="Roll Number"
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white !bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: 'white', background: 'white' }}
            />
            <input
              type="text"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              placeholder="Student Name"
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white !bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: 'white', background: 'white' }}
            />
            <button
              onClick={addStudent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Student
            </button>
          </div>
        </div>
      )}

      {/* Assessment Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg assessment-table">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Roll Number</th>
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Student Name</th>
              {localSheet.questions.map((question, index) => (
                <th key={`question_${index}`} className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  <div className="flex items-center justify-between">
                    <span className="truncate max-w-32" title={question}>
                      Q{index + 1}: {question}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => removeQuestion(index)}
                        className="ml-2 text-red-600 hover:text-red-800 text-sm"
                        title="Remove question"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {localSheet.clos.map((clo, index) => (
                <th key={`clo_${index}`} className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  <div className="flex items-center justify-between">
                    <span className="truncate max-w-32" title={clo}>
                      CLO{index + 1}: {clo}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => removeCLO(index)}
                        className="ml-2 text-red-600 hover:text-red-800 text-sm"
                        title="Remove CLO"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {localSheet.plos.map((plo, index) => (
                <th key={`plo_${index}`} className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  <div className="flex items-center justify-between">
                    <span className="truncate max-w-32" title={plo}>
                      PLO{index + 1}: {plo}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => removePLO(index)}
                        className="ml-2 text-red-600 hover:text-red-800 text-sm"
                        title="Remove PLO"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold bg-blue-100">Obtained</th>
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold bg-blue-100">Total</th>
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {localSheet.students.map((student, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  {canEdit ? (
                    <input
                      type="text"
                      value={student.rollNumber}
                      onChange={(e) => handleCellEdit(rowIndex, 'rollNumber', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white !bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ backgroundColor: 'white', background: 'white' }}
                    />
                  ) : (
                    <span className="px-2 py-1 text-gray-900">{student.rollNumber}</span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {canEdit ? (
                    <input
                      type="text"
                      value={student.name}
                      onChange={(e) => handleCellEdit(rowIndex, 'name', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white !bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ backgroundColor: 'white', background: 'white' }}
                    />
                  ) : (
                    <span className="px-2 py-1 text-gray-900">{student.name}</span>
                  )}
                </td>
                {localSheet.questions.map((question, qIndex) => (
                  <td key={`question_${qIndex}`} className="border border-gray-300 px-4 py-2">
                    {canEdit ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={student.marks[question] || ''}
                        onChange={(e) => handleCellEdit(rowIndex, question, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded bg-white !bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ backgroundColor: 'white', background: 'white' }}
                      />
                    ) : (
                      <span className="px-2 py-1 text-gray-900">{student.marks[question] || '0'}</span>
                    )}
                  </td>
                ))}
                {localSheet.clos.map((clo, cIndex) => (
                  <td key={`clo_${cIndex}`} className="border border-gray-300 px-4 py-2">
                    {canEdit ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={student.marks[clo] || ''}
                        onChange={(e) => handleCellEdit(rowIndex, clo, e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded bg-white !bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ backgroundColor: 'white', background: 'white' }}
                      />
                    ) : (
                      <span className="px-2 py-1 text-gray-900">{student.marks[clo] || '0'}</span>
                    )}
                  </td>
                ))}
                {localSheet.plos.map((plo, pIndex) => (
                  <td key={`plo_${pIndex}`} className="border border-gray-300 px-4 py-2">
                    {canEdit ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={student.marks[plo] || ''}
                        onChange={(e) => handleCellEdit(rowIndex, plo, e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded bg-white !bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ backgroundColor: 'white', background: 'white' }}
                      />
                    ) : (
                      <span className="px-2 py-1 text-gray-900">{student.marks[plo] || '0'}</span>
                    )}
                  </td>
                ))}
                <td className="border border-gray-300 px-4 py-2 bg-blue-50 font-semibold text-center text-gray-900">
                  {student.totalMarks.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2 bg-blue-50 font-semibold text-center text-gray-900">
                  {localSheet.totalPossibleMarks ?? 0}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {canEdit && (
                    <button
                      onClick={() => removeStudent(rowIndex)}
                      className="text-red-600 hover:text-red-800 font-medium"
                      title="Remove student"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          setShowDeleteDialog(false);
          onDelete();
        }}
        title="Delete Assessment Sheet"
        message={`Are you sure you want to delete "${localSheet.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Rejection Dialog */}
      <ConfirmationDialog
        isOpen={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onConfirm={handleReject}
        title="Reject Assessment Sheet"
        message={
          <div>
            <p className="mb-4">Please provide a reason for rejecting this assessment sheet:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
            />
          </div>
        }
        confirmText="Reject"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
