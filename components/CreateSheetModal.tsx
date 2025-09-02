'use client';

import { useState } from 'react';

interface CreateSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (sheetName: string) => void;
}

export default function CreateSheetModal({ isOpen, onClose, onCreate }: CreateSheetModalProps) {
  const [sheetName, setSheetName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sheetName.trim()) {
      onCreate(sheetName.trim());
      setSheetName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-base font-semibold leading-6 text-gray-600">
                Create New Assessment Sheet
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Enter a name for your new assessment sheet. You can add questions, CLOs, and students after creation.
                </p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-5 sm:mt-4">
            <div className="mb-4">
              <label htmlFor="sheetName" className="block text-sm font-medium text-gray-600 mb-2">
                Sheet Name
              </label>
                                                           <input
                  type="text"
                  id="sheetName"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="e.g., Quiz 1, Assignment 1, Project"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white !bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ backgroundColor: 'white', background: 'white' }}
                  required
                  autoFocus
                />
            </div>
            
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
              >
                Create Sheet
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
