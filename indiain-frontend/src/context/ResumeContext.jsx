import React, { createContext, useState, useContext } from 'react';

const ResumeContext = createContext();

export function ResumeProvider({ children }) {
  // Initialize from sessionStorage so resume persists on page navigation within same tab
  const [resumeText, setResumeTextState] = useState(
    () => sessionStorage.getItem('indiain_resume_text') || ''
  );
  const [resumeFileName, setResumeFileNameState] = useState(
    () => sessionStorage.getItem('indiain_resume_filename') || ''
  );

  const setResumeText = (text) => {
    setResumeTextState(text);
    if (text) {
      sessionStorage.setItem('indiain_resume_text', text);
    } else {
      sessionStorage.removeItem('indiain_resume_text');
    }
  };

  const setResumeFileName = (name) => {
    setResumeFileNameState(name);
    if (name) {
      sessionStorage.setItem('indiain_resume_filename', name);
    } else {
      sessionStorage.removeItem('indiain_resume_filename');
    }
  };

  const clearResume = () => {
    setResumeTextState('');
    setResumeFileNameState('');
    sessionStorage.removeItem('indiain_resume_text');
    sessionStorage.removeItem('indiain_resume_filename');
  };

  return (
    <ResumeContext.Provider value={{ resumeText, resumeFileName, setResumeText, setResumeFileName, clearResume }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  return useContext(ResumeContext);
}
