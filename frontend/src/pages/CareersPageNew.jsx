import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, MapPin, Clock, Award } from 'lucide-react';
import { jobsApi } from '../api/endpoints.js';

export const CareersPageNew = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await jobsApi.getAll();
        setJobs(response.data.data || []);
        console.log('Fetched jobs:', response.data.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-blue-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Career</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
            Career
          </h1>
        </div>
      </section>

      {/* Career Content Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-400">
                Build Your Career
              </h2>
              
              <p className="text-xl md:text-2xl text-white font-semibold mb-8">
                We are always on the lookout for Amazing people to join us!
              </p>
              
              <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
                <p>
                  We consider our employees as our most valuable assets. Therefore, we provide a work-life balance and ample growth opportunities to those who join our organisation.
                </p>
                
                <p>
                  If you are devoted to your profession and willing to be honest, diligent, and discreet, then you are the candidate we seek. Resumes should be sent to{' '}
                  <a 
                    href="mailto:hr@unisysinfotech.com" 
                    className="text-blue-400 hover:text-blue-300 underline transition-colors duration-300"
                  >
                    hr@unisysinfotech.com
                  </a>
                </p>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl shadow-blue-500/20">
                <img 
                  src="/unisysinfotechcontact.png" 
                  alt="UNISYS INFOTECH Contact"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section id="positions" className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Open Positions
            </h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              Explore our current job openings and find the perfect role for you
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
              <p className="text-slate-400 mt-4">Loading job openings...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No open positions at the moment. Please check back later!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="p-8 rounded-2xl bg-gradient-to-br from-[#1a2942]/50 to-[#0f1d35]/50 border border-blue-900/30 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.type}
                        </span>
                        {job.experience && (
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            {job.experience}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      to="/contact"
                      state={{ jobTitle: job.title, jobId: job._id }}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap"
                    >
                      Apply Now
                    </Link>
                  </div>
                  <p className="text-slate-300">{job.description}</p>
                  {job.requirements && job.requirements.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-white font-semibold mb-2">Requirements:</h4>
                      <ul className="list-disc list-inside text-slate-300 space-y-1">
                        {job.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 to-blue-500/10 border border-blue-500/30">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Don't See a Perfect Fit?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              We're always interested in meeting talented people. Send us your resume and let's talk about future opportunities.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300"
            >
              Get in Touch
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
