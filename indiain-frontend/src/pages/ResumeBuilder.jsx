import React, { useState, useEffect } from "react";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { useResume } from "../context/ResumeContext";

export default function ResumeBuilder() {
  const { theme } = useTheme();
  const { resumeText, setResumeText } = useResume();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("tailor");
  const [jobDescription, setJobDescription] = useState("");
  const [rawText, setRawText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [pageLimit, setPageLimit] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [generatedResume, setGeneratedResume] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = React.useRef(null);

  const card = isDark ? "bg-[#1a1d27] border-[#2a2e3d] text-white" : "bg-white border-slate-200 text-slate-800";
  const inputClass = isDark ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-fuchsia-500";
  const headText = isDark ? "text-white" : "text-slate-800";
  const subText = isDark ? "text-slate-400" : "text-slate-500";

  const parseOrText = (data) => {
    try { 
        // Handle potential markdown backticks in response
        let cleaned = (typeof data === 'string') ? data.trim() : JSON.stringify(data);
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.split("```json")[1].split("```")[0].trim();
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.split("```")[1].split("```")[0].trim();
        }
        const parsed = JSON.parse(cleaned);
        
        // Check for server-side AI errors
        if (parsed.error === "AI_GENERATION_FAILED") {
           const details = parsed.details || "";
           if (details.includes("DAILY_QUOTA_REACHED") || details.includes("429")) {
              throw new Error("QUOTA_EXCEEDED");
           }
           if (details.includes("MODEL_OVERLOADED") || details.includes("503")) {
              throw new Error("MODEL_OVERLOADED");
           }
           // Use a prefix to securely identify this as a backend error that we threw
           throw new Error("BACKEND_ERROR:" + (details || "AI_FAILED"));
        }
        
        return parsed; 
    }
    catch (err) { 
        console.error("Failed to parse AI JSON:", data, err);
        // If it's a known error we threw, rethrow it to be handled by the caller's catch block
        if (err.message === "QUOTA_EXCEEDED" || err.message === "MODEL_OVERLOADED" || err.message.startsWith("BACKEND_ERROR:")) {
          throw err;
        }
        // If it's a genuine parsing error of raw content, return a fallback object
        return { fullName: "Parsing Error", summary: "JSON content was malformed.", experience: [] }; 
    }
  };

  const tailorResume = async () => {
    if (!jobDescription.trim()) { setError("Please paste a Job Description first."); return; }
    try {
      setIsLoading(true); setError(null); setGeneratedResume(null);
      const inst = `${instructions}. Please ensure the resume fits strictly within ${pageLimit} page(s).`;
      const res = await API.post("/tailor-resume", { job_description: jobDescription, instructions: inst });
      
      const parsed = parseOrText(res.data.tailored_resume);
      setGeneratedResume(parsed);
    } catch (err) { 
      console.log("Tailor error caught:", err.message);
      if (err.message === "QUOTA_EXCEEDED") {
        setError("AI Quota Limit Reached (Free Tier). Please wait 24 hours or try again later.");
      } else if (err.message === "MODEL_OVERLOADED") {
        setError("AI Model handles too much traffic right now (503). Please wait 30 seconds and try again.");
      } else if (err.message && err.message.startsWith("BACKEND_ERROR:")) {
        setError("AI Error: " + err.message.replace("BACKEND_ERROR:", ""));
      } else {
        setError("Failed to tailor resume: " + (err.message || "Ensure a base resume is uploaded.")); 
      }
    }
    finally { setIsLoading(false); }
  };

  const createResume = async () => {
    if (!rawText.trim() && !selectedFile) { setError("Please provide raw information or upload a LinkedIn PDF."); return; }
    try {
      setIsLoading(true); setError(null); setGeneratedResume(null);
      const formData = new FormData();
      formData.append("raw_text", rawText);
      formData.append("instructions", `${instructions}. Target length: ${pageLimit} page(s).`);
      if (selectedFile) formData.append("file", selectedFile);
      const res = await API.post("/generate-resume-from-scratch", formData, { headers: { "Content-Type": "multipart/form-data" } });
      
      const parsed = parseOrText(res.data.generated_resume);
      setGeneratedResume(parsed);
      setResumeText(res.data.generated_resume); 
    } catch (err) { 
      if (err.message === "QUOTA_EXCEEDED") {
        setError("AI Quota Limit Reached (Free Tier). Please wait 24 hours or try again later.");
      } else if (err.message === "MODEL_OVERLOADED") {
        setError("AI Model handles too much traffic right now (503). Please wait 30 seconds and try again.");
      } else if (err.message && err.message.startsWith("BACKEND_ERROR:")) {
        setError("AI Error: " + err.message.replace("BACKEND_ERROR:", ""));
      } else {
        setError("Failed to generate resume: " + (err.message || "Please try again.")); 
      }
    }
    finally { setIsLoading(false); }
  };

  const updateField = (path, value) => {
    const newData = { ...generatedResume };
    const keys = path.split('.');
    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setGeneratedResume(newData);
  };

  const addItem = (section) => {
    const newData = { ...generatedResume };
    if (section === 'experience') {
      newData.experience = [...(newData.experience || []), { role: "New Role", company: "Company", date: "Present", location: "City, State", bullets: ["New responsibility..."] }];
    } else if (section === 'projects') {
      newData.projects = [...(newData.projects || []), { name: "New Project", tech: "Stack", date: "2024", bullets: ["Project achievement..."] }];
    } else if (section === 'education') {
      newData.education = [...(newData.education || []), { school: "University", degree: "Degree", date: "Year", details: "GPA/Honors" }];
    }
    setGeneratedResume(newData);
  };

  const removeItem = (section, index) => {
    const newData = { ...generatedResume };
    newData[section] = newData[section].filter((_, i) => i !== index);
    setGeneratedResume(newData);
  };

  const updateBullet = (section, itemIndex, bulletIndex, value) => {
    const newData = { ...generatedResume };
    newData[section][itemIndex].bullets[bulletIndex] = value;
    setGeneratedResume(newData);
  };

  const addBullet = (section, itemIndex) => {
    const newData = { ...generatedResume };
    if (!newData[section][itemIndex].bullets) newData[section][itemIndex].bullets = [];
    newData[section][itemIndex].bullets.push("New point...");
    setGeneratedResume(newData);
  };

  const removeBullet = (section, itemIndex, bulletIndex) => {
    const newData = { ...generatedResume };
    newData[section][itemIndex].bullets = newData[section][itemIndex].bullets.filter((_, i) => i !== bulletIndex);
    setGeneratedResume(newData);
  };


  const resumeStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,700;1,400&display=swap');
    
    .resume-container { 
      font-family: 'Spectral', serif; 
      line-height: 1.3; 
      color: #1a202c; 
      background: white;
      padding: 0.75in;
      width: 8.5in;
      margin: 0 auto;
      box-sizing: border-box;
      text-align: left;
    }
    .header { text-align: center; margin-bottom: 12px; }
    .name { font-size: 26px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; color: #000; }
    .contact-info { font-size: 11px; color: #4a5568; margin-bottom: 1px; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
    
    .section-title { 
      font-size: 13px; 
      font-weight: 700; 
      text-transform: uppercase; 
      border-bottom: 1px solid #1a202c; 
      margin-top: 14px; 
      margin-bottom: 6px; 
      letter-spacing: 0.5px;
      color: #111;
    }
    
    .item-header { display: flex; justify-content: space-between; font-weight: 700; font-size: 12px; margin-top: 6px; }
    .item-sub { display: flex; justify-content: space-between; font-style: italic; font-size: 11px; margin-bottom: 4px; }
    
    .bullets { padding-left: 18px; margin: 0; list-style-type: disc; }
    .bullets li { font-size: 11px; margin-bottom: 2px; text-align: justify; }
    
    .summary-text { font-size: 11px; text-align: justify; margin: 0; line-height: 1.4; }
    
    .skills-grid { margin-top: 4px; }
    .skill-line { font-size: 11px; margin-bottom: 2px; }
    .skill-cat { font-weight: 700; display: inline; text-transform: capitalize; }
    
    [contenteditable="true"]:hover { background: rgba(0,0,0,0.02); outline: 1px dashed #cbd5e1; }
    [contenteditable="true"]:focus { background: white; outline: 2px solid #6366f1; }
    
    .edit-btn { 
       display: none; 
       font-size: 10px; 
       padding: 2px 6px; 
       background: #f1f5f9; 
       border: 1px solid #cbd5e1; 
       border-radius: 4px; 
       color: #64748b; 
       cursor: pointer;
       margin-left: 8px;
       vertical-align: middle;
    }
    .edit-mode .edit-btn { display: inline-block; }
    .edit-mode .remove-btn { color: #ef4444; border-color: #fecaca; }
    
    @media print {
      body { margin: 0; padding: 0; }
      .resume-container { padding: 0.75in; width: 8.5in; border: none; shadow: none; margin: 0; }
      .edit-btn { display: none !important; }
      @page { size: letter; margin: 0; }
    }
  `;

  const handlePrint = () => {
    if (!generatedResume) return;
    const printWindow = window.open('', '_blank');
    const content = document.getElementById('resume-preview-area').innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${generatedResume.fullName || 'Resume'} - INDIAIN AI</title>
          <style>${resumeStyles}</style>
        </head>
        <body>
          <div class="resume-container">
            ${content}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
  };

  const ResumeLaTeXView = ({ data }) => {
    if (!data) return null;
    return (
      <div id="resume-preview-area" className={`resume-container shadow-2xl ${isEditing ? 'edit-mode' : ''}`}>
        <style>{resumeStyles}</style>
        
        {/* Header */}
        <header className="header">
            <h1 className="name" contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => updateField('fullName', e.target.innerText)}>
                {data.fullName || "Your Name"}
            </h1>
            <div className="contact-info">
                <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => updateField('contact.phone', e.target.innerText)}>{data.contact?.phone || "Phone"}</span>
                <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => updateField('contact.email', e.target.innerText)}>{data.contact?.email || "Email"}</span>
                <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => updateField('contact.location', e.target.innerText)}>{data.contact?.location || "Location"}</span>
                {data.contact?.linkedin && <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => updateField('contact.linkedin', e.target.innerText)}>LinkedIn</span>}
                {data.contact?.github && <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => updateField('contact.github', e.target.innerText)}>GitHub</span>}
            </div>
        </header>

        {data.summary && (
            <section className="section">
               <h2 className="section-title">Professional Summary</h2>
               <p className="summary-text" contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => updateField('summary', e.target.innerText)}>
                {data.summary}
               </p>
            </section>
        )}

        <section className="section">
            <div className="flex items-center">
                <h2 className="section-title flex-1">Experience</h2>
                {isEditing && <button onClick={() => addItem('experience')} className="edit-btn">+ Add Role</button>}
            </div>
            {data.experience?.map((exp, i) => (
                <div key={i} className="item relative group">
                    <div className="item-header">
                        <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => {
                            const newData = [...data.experience];
                            newData[i].role = e.target.innerText;
                            updateField('experience', newData);
                        }}>{exp.role}</span>
                        <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => {
                            const newData = [...data.experience];
                            newData[i].date = e.target.innerText;
                            updateField('experience', newData);
                        }}>{exp.date}</span>
                    </div>
                    <div className="item-sub">
                        <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => {
                            const newData = [...data.experience];
                            newData[i].company = e.target.innerText;
                            updateField('experience', newData);
                        }}>{exp.company}</span>
                        <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => {
                            const newData = [...data.experience];
                            newData[i].location = e.target.innerText;
                            updateField('experience', newData);
                        }}>{exp.location}</span>
                    </div>
                    <ul className="bullets">
                        {exp.bullets?.map((b, bi) => (
                            <li key={bi} className="relative group">
                                <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => updateBullet('experience', i, bi, e.target.innerText)}>
                                    {b}
                                </span>
                                {isEditing && (
                                    <button onClick={() => removeBullet('experience', i, bi)} className="edit-btn remove-btn">×</button>
                                )}
                            </li>
                        ))}
                        {isEditing && (
                            <button onClick={() => addBullet('experience', i)} className="edit-btn">+ Add Point</button>
                        )}
                    </ul>
                    {isEditing && (
                        <button onClick={() => removeItem('experience', i)} className="edit-btn remove-btn absolute -right-20 top-0">Remove Role</button>
                    )}
                </div>
            ))}
        </section>

        <section className="section">
            <div className="flex items-center">
                <h2 className="section-title flex-1">Projects</h2>
                {isEditing && <button onClick={() => addItem('projects')} className="edit-btn">+ Add Project</button>}
            </div>
            {data.projects?.map((proj, i) => (
                <div key={i} className="item relative group">
                    <div className="item-header">
                        <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => {
                            const newData = [...data.projects];
                            newData[i].name = e.target.innerText;
                            updateField('projects', newData);
                        }}>{proj.name} | {proj.tech}</span>
                        <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => {
                            const newData = [...data.projects];
                            newData[i].date = e.target.innerText;
                            updateField('projects', newData);
                        }}>{proj.date}</span>
                    </div>
                    <ul className="bullets">
                        {proj.bullets?.map((b, bi) => (
                            <li key={bi} className="relative group">
                                <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => updateBullet('projects', i, bi, e.target.innerText)}>
                                    {b}
                                </span>
                                {isEditing && (
                                    <button onClick={() => removeBullet('projects', i, bi)} className="edit-btn remove-btn">×</button>
                                )}
                            </li>
                        ))}
                        {isEditing && (
                            <button onClick={() => addBullet('projects', i)} className="edit-btn">+ Add Point</button>
                        )}
                    </ul>
                    {isEditing && (
                        <button onClick={() => removeItem('projects', i)} className="edit-btn remove-btn absolute -right-20 top-0">Remove Project</button>
                    )}
                </div>
            ))}
        </section>

        <section className="section">
            <div className="flex items-center">
                <h2 className="section-title flex-1">Education</h2>
                {isEditing && <button onClick={() => addItem('education')} className="edit-btn">+ Add Education</button>}
            </div>
            {data.education?.map((edu, i) => (
                <div key={i} className="item relative group">
                    <div className="item-header">
                        <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => {
                            const newData = [...data.education];
                            newData[i].school = e.target.innerText;
                            updateField('education', newData);
                        }}>{edu.school}</span>
                        <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => {
                            const newData = [...data.education];
                            newData[i].date = e.target.innerText;
                            updateField('education', newData);
                        }}>{edu.date}</span>
                    </div>
                    <div className="item-sub">
                        <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => {
                            const newData = [...data.education];
                            newData[i].degree = e.target.innerText;
                            updateField('education', newData);
                        }}>{edu.degree}</span>
                        <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => {
                            const newData = [...data.education];
                            newData[i].details = e.target.innerText;
                            updateField('education', newData);
                        }}>{edu.details}</span>
                    </div>
                    {isEditing && (
                        <button onClick={() => removeItem('education', i)} className="edit-btn remove-btn absolute -right-20 top-0">Remove</button>
                    )}
                </div>
            ))}
        </section>

        {data.skills && (
          <section className="section">
              <h2 className="section-title">Technical Skills</h2>
              <div className="skills-grid">
                  {Object.entries(data.skills).map(([key, val], i) => (
                      <div key={i} className="skill-line">
                          <span className="skill-cat">{key}: </span>
                          <span contentEditable={isEditing} suppressContentEditableWarning onBlur={(e) => {
                              const newData = { ...data.skills, [key]: e.target.innerText };
                              updateField('skills', newData);
                          }}>{val}</span>
                      </div>
                  ))}
              </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <div className={`font-sans min-h-screen transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-3 border ${isDark ? 'bg-fuchsia-900/30 text-fuchsia-300 border-fuchsia-700/50' : 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100'}`}>
            <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />AI Resume Studio (v2.0)
          </div>
          <h1 className={`text-4xl md:text-5xl font-black tracking-tight ${headText}`}>Resume Studio</h1>
          <p className={`mt-2 font-medium ${subText}`}>Generate high-end LaTeX formatted resumes for top-tier roles.</p>
        </div>
        {/* Tab Switcher */}
        <div className={`flex p-1 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-100'}`}>
          {["tailor","create"].map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setGeneratedResume(null); setError(null); }}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === tab ? (isDark ? 'bg-white/10 text-white shadow' : 'bg-white text-fuchsia-600 shadow') : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700')}`}>
              {tab === "tailor" ? "Tailor Global" : "Create New"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className={`mb-6 p-4 rounded-2xl border text-sm font-bold ${isDark ? 'bg-red-900/20 border-red-700/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {error}
        </div>
      )}

      {!generatedResume && !isLoading && (
        <div className={`backdrop-blur-xl border rounded-[2rem] p-8 ${card}`}>
          <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex-1 min-w-[200px] space-y-4">
                  <label className={`block text-sm font-bold ${subText}`}>Page Target</label>
                  <div className="flex gap-2">
                     {[1, 2, 3].map(n => (
                         <button key={n} onClick={() => setPageLimit(n)} 
                                 className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${pageLimit === n ? 'bg-indigo-600 border-indigo-600 text-white' : (isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-white border-slate-200 text-slate-600')}`}>
                             {n} Page{n > 1 ? 's' : ''}
                         </button>
                     ))}
                  </div>
              </div>
          </div>

          {activeTab === "tailor" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <label className={`block text-sm font-bold ${subText}`}>Job Description Target</label>
                {resumeText && <span className="text-xs font-bold text-emerald-500">✓ Using session resume</span>}
              </div>
              <textarea
                value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                rows={8}
                className={`w-full p-4 rounded-xl border outline-none focus:ring-2 focus:ring-fuchsia-500/20 transition-all resize-none ${inputClass}`}
                placeholder="Paste the job requirements to tailor your uploaded resume..."
              />
              <button onClick={tailorResume} className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white rounded-xl font-black text-base shadow-lg hover:-translate-y-0.5 transition-all uppercase tracking-widest">
                Tailor with AI LaTeX Format
              </button>
            </div>
          )}
          {activeTab === "create" && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${subText}`}>Raw / LinkedIn Data</label>
                  <textarea value={rawText} onChange={e => setRawText(e.target.value)} rows={8} className={`w-full p-4 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none ${inputClass}`} placeholder="Paste profile info, notes, or raw text..." />
                  <div className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                      <span className={`text-sm font-medium ${subText} truncate max-w-[150px]`}>{selectedFile ? selectedFile.name : "LinkedIn Export (.pdf)"}</span>
                    </div>
                    <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={e => setSelectedFile(e.target.files[0])} />
                    <button onClick={() => fileInputRef.current?.click()} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isDark ? 'bg-indigo-700/50 text-indigo-300 hover:bg-indigo-700' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>{selectedFile ? "Change" : "Browse"}</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${subText}`}>Style & Focus Instructions</label>
                  <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={10} className={`w-full p-4 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none ${inputClass}`} placeholder="e.g. Focus on Backend Engineering, emphasize Distributed Systems..." />
                </div>
              </div>
              <button onClick={createResume} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black text-base shadow-lg hover:-translate-y-0.5 transition-all uppercase tracking-widest">
                Generate Professional LaTeX Resume
              </button>
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className={`backdrop-blur-xl border rounded-[2rem] p-16 flex flex-col items-center justify-center ${card}`}>
          <div className="w-14 h-14 border-4 border-fuchsia-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className={`font-bold ${subText}`}>{activeTab === 'tailor' ? 'Compiling LaTeX experience...' : 'Formatting MAANG-standard structure...'}</p>
        </div>
      )}

      {generatedResume && !isLoading && (
        <div className="space-y-8 pb-20">
          <div className={`backdrop-blur-xl border rounded-[2rem] p-6 sticky top-24 z-10 shadow-xl ${card}`}>
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"/></svg>
                   </div>
                   <div>
                      <p className="font-black text-lg">Format compiled successfully</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{pageLimit} Page LaTeX Structure</p>
                   </div>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => setIsEditing(!isEditing)} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${isEditing ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : (isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}`}>
                      {isEditing ? '✓ Done Editing' : '✎ Live Edit'}
                   </button>
                   {!isEditing && (
                     <button onClick={() => setGeneratedResume(null)} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Edit Config</button>
                   )}
                   <button onClick={handlePrint} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5 transition-all uppercase tracking-widest">Download Professional PDF</button>
                </div>
             </div>
          </div>
          
          <div className="flex justify-center p-4 bg-slate-100/50 dark:bg-black/20 rounded-[3rem] border border-dashed border-slate-300 dark:border-white/10">
              <ResumeLaTeXView data={generatedResume} />
          </div>
        </div>
      )}
    </div>
  );
}
