'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Sheet {
  _id: string;
  name: string;
  questions: string[];
  clos: string[];
  plos: string[];
  students: Student[];
  createdAt: string;
  updatedAt: string;
}

interface Student {
  _id?: string;
  rollNumber: string;
  name: string;
  marks: { [key: string]: number };
  totalMarks: number;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      const response = await fetch('/api/sheets');
      if (!response.ok) {
        throw new Error('Failed to fetch assessment sheets');
      }
      const data = await response.json();
      setSheets(data);
      
      // Find student data in sheets
      if (user?.rollNumber) {
        for (const sheet of data) {
          const foundStudent = sheet.students.find((student: Student) => 
            student.rollNumber === user.rollNumber
          );
          if (foundStudent) {
            setStudentData(foundStudent);
            break;
          }
        }
      }
    } catch (error) {
      setError('Failed to fetch assessment sheets');
    } finally {
      setLoading(false);
    }
  };

  const getStudentMarks = (sheet: Sheet) => {
    if (!user?.rollNumber) return null;
    return sheet.students.find((student: Student) => student.rollNumber === user.rollNumber);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-gray-500">View your assessment results and progress</p>
          {user?.rollNumber && (
            <p className="text-sm text-blue-600 mt-1">Roll Number: {user.rollNumber}</p>
          )}
        </div>

        {/* Quick Stats */}
        {studentData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">Total Marks</h3>
              <p className="text-3xl font-bold text-blue-600">{studentData.totalMarks.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">Assessment Sheets</h3>
              <p className="text-3xl font-bold text-green-600">{sheets.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">Department</h3>
              <p className="text-3xl font-bold text-purple-600">{user?.department || 'N/A'}</p>
            </div>
          </div>
        )}

        {/* Assessment Sheets */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Assessment Results</h2>
            <p className="text-sm text-gray-600 mt-1">Click on any assessment to view detailed results</p>
          </div>
          
          {sheets.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No assessment sheets found. Please contact your faculty.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLOs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PLOs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Marks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sheets.map((sheet) => {
                    const studentMarks = getStudentMarks(sheet);
                    return (
                      <tr key={sheet._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{sheet.name}</div>
                            <div className="text-sm text-gray-500">
                              Created: {new Date(sheet.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sheet.questions.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sheet.clos.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sheet.plos.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {studentMarks ? (
                            <span className="text-lg font-semibold text-blue-600">
                              {studentMarks.totalMarks.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">Not enrolled</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {studentMarks && (
                            <button
                              onClick={() => setSelectedSheet(sheet)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md text-sm"
                            >
                              View Details
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Results Modal */}
        {selectedSheet && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedSheet(null)}></div>
              
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      Assessment Results: {selectedSheet.name}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Detailed breakdown of your performance in this assessment
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-4">
                  {studentData && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300 rounded-lg">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-600">Assessment Item</th>
                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-600">Your Marks</th>
                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-600">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSheet.questions.map((question, index) => (
                            <tr key={`question_${index}`} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2 font-medium">Q{index + 1}: {question}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">
                                {studentData.marks[question] || 'Not graded'}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center">
                                {studentData.marks[question] ? (
                                  <span className="text-green-600 text-sm">✓ Graded</span>
                                ) : (
                                  <span className="text-yellow-600 text-sm">Pending</span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {selectedSheet.clos.map((clo, index) => (
                            <tr key={`clo_${index}`} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2 font-medium">CLO{index + 1}: {clo}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">
                                {studentData.marks[clo] || 'Not graded'}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center">
                                {studentData.marks[clo] ? (
                                  <span className="text-green-600 text-sm">✓ Graded</span>
                                ) : (
                                  <span className="text-yellow-600 text-sm">Pending</span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {selectedSheet.plos.map((plo, index) => (
                            <tr key={`plo_${index}`} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2 font-medium">PLO{index + 1}: {plo}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">
                                {studentData.marks[plo] || 'Not graded'}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center">
                                {studentData.marks[plo] ? (
                                  <span className="text-green-600 text-sm">✓ Graded</span>
                                ) : (
                                  <span className="text-yellow-600 text-sm">Pending</span>
                                )}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-blue-50 font-semibold">
                            <td className="border border-gray-300 px-4 py-2">Total Marks</td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-blue-600">
                              {studentData.totalMarks.toFixed(2)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              <span className="text-blue-600 text-sm">Final Score</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                      onClick={() => setSelectedSheet(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





