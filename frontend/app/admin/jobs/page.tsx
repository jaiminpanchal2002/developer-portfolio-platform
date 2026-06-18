"use client";

import { useEffect, useState } from "react";
import { getJobs } from "@/services/jobService";
import {
  generateCoverLetter,
  generateRecruiterEmail
} from "@/services/aiService";
import Swal from "sweetalert2";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Mail,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  Languages,
} from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("in");
  const [keyword, setKeyword] = useState("Developer");
  const [remote, setRemote] = useState(false);

  const [selectedCoverLetter, setSelectedCoverLetter] = useState<number | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [generatingLetter, setGeneratingLetter] = useState(false);

  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [emailLang, setEmailLang] = useState<Record<number, string>>({});

  const [expandedRoadmap, setExpandedRoadmap] = useState<number | null>(null);

  useEffect(() => {
    loadJobs();
  }, [country]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await getJobs(country, keyword, remote);
      setJobs(data);
    } catch (error) {
      console.error("Failed to load jobs:", error);
      Swal.fire({
        title: "Error!",
        text: "Could not fetch recommendations. Ensure backend is running.",
        icon: "error",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  const handleCoverLetter = async (job: any, index: number) => {
    setGeneratingLetter(true);
    setSelectedCoverLetter(index);
    setCoverLetter("");
    try {
      const result = await generateCoverLetter(
        job.company || "Company",
        job.title,
        job.description || ""
      );
      setCoverLetter(result);
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingLetter(false);
    }
  };

  const handleRecruiterEmail = async (job: any, index: number) => {
    setGeneratingEmail(true);
    setSelectedEmail(index);
    setEmail("");
    try {
      const lang = emailLang[index] || "English";
      const result = await generateRecruiterEmail(
        job.company || "Company",
        job.title,
        lang
      );
      setEmail(result);
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingEmail(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      title: "Copied!",
      text: "Content copied to clipboard.",
      icon: "success",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      background: "#0f172a",
      color: "#ffffff",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-cyan-400";
    if (score >= 40) return "text-yellow-400";
    return "text-rose-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-cyan-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-rose-500";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          AI Job Recommendations
        </h1>
        <p className="text-slate-400 mt-2">
          Find matching vacancies worldwide and customize applications instantly
        </p>
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearch} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search keywords (e.g. Java, React, Spring)..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
          />

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
          >
            <option value="in">🇮🇳 India</option>
            <option value="us">🇺🇸 USA</option>
            <option value="gb">🇬🇧 United Kingdom</option>
            <option value="ca">🇨🇦 Canada</option>
            <option value="de">🇩🇪 Germany</option>
            <option value="au">🇦🇺 Australia</option>
          </select>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-bold hover:scale-105 transition-all cursor-pointer"
          >
            Find Jobs
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remote-check"
            checked={remote}
            onChange={(e) => setRemote(e.target.checked)}
            className="rounded border-slate-800 text-cyan-500 focus:ring-cyan-500 bg-slate-950"
          />
          <label htmlFor="remote-check" className="text-sm text-slate-400 select-none cursor-pointer">
            Limit search to remote positions
          </label>
        </div>
      </form>

      {/* Recommended Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-3xl text-slate-500">
          <Briefcase size={48} className="text-slate-700 mb-4" />
          <h4 className="font-semibold text-lg">No Vacancies Found</h4>
          <p className="text-sm text-slate-650 mt-1">Try adjusting your keyword filter or switching target countries.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 transition-all"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white leading-tight">
                    {job.title}
                  </h2>
                  <p className="text-cyan-400 font-semibold mt-1">
                    {job.company}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-3 text-slate-400 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin size={16} className="text-slate-500" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={16} className="text-slate-500" />
                      {job.salary}
                    </span>
                    {job.createdAt && (
                      <span className="flex items-center gap-1 text-xs bg-slate-950 px-2 py-0.5 rounded border border-white/5 font-mono">
                        <Calendar size={12} className="text-slate-500" />
                        {job.createdAt} ({job.source || "Adzuna"})
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Score Display */}
                <div className="flex flex-col items-end shrink-0 bg-slate-950/50 border border-slate-800/80 p-4 rounded-2xl text-right">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Profile Match</span>
                  <span className={`text-3xl font-extrabold mt-1 ${getScoreColor(job.matchScore)}`}>
                    {job.matchScore}%
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-350 text-sm leading-relaxed mt-4">
                {job.description}
              </p>

              {/* Score Progress Bar */}
              <div className="mt-5">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(job.matchScore)}`}
                    style={{ width: `${job.matchScore}%` }}
                  />
                </div>
                {job.recommendation && (
                  <p className="text-xs text-slate-400 mt-2 font-medium">
                    💡 <span className="text-slate-300">{job.recommendation}</span>
                  </p>
                )}
              </div>

              {/* Matched / Missing Skills lists */}
              <div className="grid sm:grid-cols-2 gap-6 mt-6 border-t border-slate-850 pt-5">
                {/* Matched */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                    <CheckCircle size={16} />
                    Matched Stack
                  </h4>
                  {job.matchedSkills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {job.matchedSkills.map((s: string, i: number) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 text-xs">No direct matches.</span>
                  )}
                </div>

                {/* Missing */}
                <div>
                  <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5 mb-2">
                    <AlertTriangle size={16} />
                    Missing Skills
                  </h4>
                  {job.missingSkills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {job.missingSkills.map((s: string, i: number) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 text-xs">Full stack overlap!</span>
                  )}
                </div>
              </div>

              {/* Learning Roadmap Collapsible */}
              {job.missingSkills?.length > 0 && job.roadmap && (
                <div className="mt-5 border-t border-slate-850 pt-4">
                  <button
                    onClick={() => setExpandedRoadmap(expandedRoadmap === index ? null : index)}
                    className="flex items-center gap-1 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    {expandedRoadmap === index ? (
                      <>
                        Hide Learning Roadmap <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        View Learning Roadmap <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                  
                  {expandedRoadmap === index && (
                    <div className="mt-3 bg-slate-950/60 border border-slate-850 rounded-2xl p-5 text-sm text-slate-300 leading-relaxed font-mono whitespace-pre-line animate-in fade-in slide-in-from-top-2 duration-200">
                      {job.roadmap}
                    </div>
                  )}
                </div>
              )}

              {/* Actions Section */}
              <div className="mt-6 flex flex-wrap gap-4 items-center border-t border-slate-850 pt-5">
                <a
                  href={job.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-cyan-500 text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer text-sm"
                >
                  Apply <ExternalLink size={16} />
                </a>

                {/* local language selector for email outreach */}
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <Languages size={16} className="text-slate-500" />
                  <select
                    value={emailLang[index] || "English"}
                    onChange={(e) => setEmailLang({ ...emailLang, [index]: e.target.value })}
                    className="bg-transparent border-none text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="German">German</option>
                    <option value="French">French</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Italian">Italian</option>
                  </select>
                </div>

                <button
                  onClick={() => handleRecruiterEmail(job, index)}
                  className="px-5 py-3 rounded-xl border border-cyan-500/30 text-cyan-400 hover:border-cyan-500 text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail size={16} />
                  Generate Email
                </button>

                <button
                  onClick={() => handleCoverLetter(job, index)}
                  className="px-5 py-3 rounded-xl border border-purple-500/30 text-purple-400 hover:border-purple-500 text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText size={16} />
                  Cover Letter
                </button>
              </div>

              {/* Generated Text Outputs */}
              {selectedEmail === index && (
                <div className="mt-6 bg-slate-950/80 border border-cyan-500/20 rounded-2xl p-5 relative">
                  <h4 className="font-bold text-cyan-400 mb-3 flex items-center gap-2">
                    <Mail size={18} />
                    Recruiter Outreach Email ({emailLang[index] || "English"})
                  </h4>
                  {generatingEmail ? (
                    <div className="text-slate-400 text-sm animate-pulse">Drafting message...</div>
                  ) : (
                    <>
                      <pre className="whitespace-pre-wrap text-slate-350 text-sm leading-relaxed font-sans bg-slate-900/40 p-4 border border-slate-850 rounded-xl">
                        {email}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(email)}
                        className="mt-3 px-4 py-2 bg-slate-800 text-white hover:bg-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                      >
                        Copy Outreach
                      </button>
                    </>
                  )}
                </div>
              )}

              {selectedCoverLetter === index && (
                <div className="mt-6 bg-slate-950/80 border border-purple-500/20 rounded-2xl p-5 relative">
                  <h4 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                    <FileText size={18} />
                    Personalized Cover Letter
                  </h4>
                  {generatingLetter ? (
                    <div className="text-slate-400 text-sm animate-pulse">Drafting letter...</div>
                  ) : (
                    <>
                      <pre className="whitespace-pre-wrap text-slate-350 text-sm leading-relaxed font-sans bg-slate-900/40 p-4 border border-slate-850 rounded-xl">
                        {coverLetter}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(coverLetter)}
                        className="mt-3 px-4 py-2 bg-slate-800 text-white hover:bg-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                      >
                        Copy Letter
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}