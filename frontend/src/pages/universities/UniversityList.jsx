import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Globe, Building, BookOpen, GraduationCap,
  ArrowRight, Star, MapPin, Clock, Calendar, CheckCircle2,
  ChevronRight, ExternalLink, Info, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import externalSearchService from '../../services/externalSearchService';
import { useToast } from '../../components/ui/toast';

const UniversityList = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  // States for data
  const [countries, setCountries] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [levels, setLevels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [programs, setPrograms] = useState([]);

  // States for filters
  const [filters, setFilters] = useState({
    country: '',
    university_id: '',
    level: '',
    course_category_id: '',
    search: ''
  });

  // States for loading
  const [loading, setLoading] = useState({
    initial: true,
    universities: false,
    levels: false,
    categories: false,
    programs: false
  });

  // Initial Load - Countries
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(prev => ({ ...prev, initial: true }));
        const countriesResp = await externalSearchService.getCountries();
        setCountries(countriesResp.data || countriesResp || []);
      } catch (err) {
        showError('Failed to load initial search data');
      } finally {
        setLoading(prev => ({ ...prev, initial: false }));
      }
    };
    fetchInitialData();
  }, []);

  // Load Universities when country changes
  useEffect(() => {
    if (!filters.country) {
      setUniversities([]);
      return;
    }
    const fetchUnivs = async () => {
      try {
        setLoading(prev => ({ ...prev, universities: true }));
        // External API expects 'website' parameter for country code
        const univsResp = await externalSearchService.getUniversities({ website: filters.country });
        setUniversities(univsResp.data || univsResp || []);
        // Reset dependent filters
        setFilters(prev => ({ ...prev, university_id: '', level: '', course_category_id: '' }));
      } catch (err) {
        showError('Failed to load universities');
      } finally {
        setLoading(prev => ({ ...prev, universities: false }));
      }
    };
    fetchUnivs();
  }, [filters.country]);

  // Load Levels when university changes
  useEffect(() => {
    if (!filters.university_id) {
      setLevels([]);
      return;
    }
    const fetchLevels = async () => {
      try {
        setLoading(prev => ({ ...prev, levels: true }));
        const levelsResp = await externalSearchService.getLevels(filters.university_id);
        setLevels(levelsResp.data || levelsResp || []);
      } catch (err) {
        showError('Failed to load levels');
      } finally {
        setLoading(prev => ({ ...prev, levels: false }));
      }
    };
    fetchLevels();
  }, [filters.university_id]);

  // Load Categories when level changes
  useEffect(() => {
    if (!filters.level || !filters.university_id) {
      setCategories([]);
      return;
    }
    const fetchCats = async () => {
      try {
        setLoading(prev => ({ ...prev, categories: true }));
        const catsResp = await externalSearchService.getCategories(filters.university_id, filters.level);
        setCategories(catsResp.data || catsResp || []);
      } catch (err) {
        showError('Failed to load categories');
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    };
    fetchCats();
  }, [filters.level, filters.university_id]);

  // Load Programs when filters change
  useEffect(() => {
    const fetchProgs = async () => {
      try {
        setLoading(prev => ({ ...prev, programs: true }));
        const params = {
          university_id: filters.university_id,
          level: filters.level,
          course_category_id: filters.course_category_id,
          search: filters.search
        };
        const progsResp = await externalSearchService.getPrograms(params);
        setPrograms(progsResp.data || progsResp || []);
      } catch (err) {
        showError('Failed to load programs');
      } finally {
        setLoading(prev => ({ ...prev, programs: false }));
      }
    };

    // Debounce search
    const timeout = setTimeout(() => {
      fetchProgs();
    }, 500);
    return () => clearTimeout(timeout);
  }, [filters.university_id, filters.level, filters.course_category_id, filters.search]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleEnroll = (program) => {
    success(`Application started for ${program.name || 'this program'}`);
    // Typically navigate to application form with program ID
    // navigate('/applications/create', { state: { program } });
  };

  if (loading.initial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="mt-4 text-indigo-600 font-bold animate-pulse">Initializing Global Search API...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center">
              Search & Apply <span className="ml-3 px-3 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-full uppercase tracking-widest font-black">Global Access</span>
            </h1>
            <p className="text-gray-500 font-medium mt-2">Browse programs and enroll students in universities worldwide.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 px-6">
              <div className="text-right">
                <div className="text-[10px] font-black uppercase text-gray-400">Your Access</div>
                <div className="text-sm font-bold text-indigo-600">{countries.length} Countries Permitted</div>
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Dashboard */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/20 border border-gray-100 p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-30"></div>

          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Advanced Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {/* Country Filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center">
                <Globe className="w-3 h-3 mr-1.5" /> Country
              </label>
              <select
                name="country"
                value={filters.country}
                onChange={handleFilterChange}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl p-4 text-sm font-bold text-gray-700 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Select Country</option>
                {countries.map(c => (
                  <option key={c.website || c.name} value={c.website || c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* University Filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center">
                <Building className="w-3 h-3 mr-1.5" /> University
              </label>
              <div className="relative">
                <select
                  name="university_id"
                  value={filters.university_id}
                  onChange={handleFilterChange}
                  disabled={!filters.country || loading.universities}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl p-4 text-sm font-bold text-gray-700 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Universities</option>
                  {universities.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                {loading.universities && <Loader2 className="absolute right-4 top-4 w-4 h-4 animate-spin text-indigo-400" />}
              </div>
            </div>

            {/* Level Filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center">
                <GraduationCap className="w-3 h-3 mr-1.5" /> Study Level
              </label>
              <div className="relative">
                <select
                  name="level"
                  value={filters.level}
                  onChange={handleFilterChange}
                  disabled={!filters.university_id || loading.levels}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl p-4 text-sm font-bold text-gray-700 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Any Level</option>
                  {levels.map(l => (
                    <option key={l.id || l.level} value={l.level || l}>{l.name || l}</option>
                  ))}
                </select>
                {loading.levels && <Loader2 className="absolute right-4 top-4 w-4 h-4 animate-spin text-indigo-400" />}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center">
                <BookOpen className="w-3 h-3 mr-1.5" /> Category
              </label>
              <div className="relative">
                <select
                  name="course_category_id"
                  value={filters.course_category_id}
                  onChange={handleFilterChange}
                  disabled={!filters.level || loading.categories}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl p-4 text-sm font-bold text-gray-700 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {loading.categories && <Loader2 className="absolute right-4 top-4 w-4 h-4 animate-spin text-indigo-400" />}
              </div>
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center">
                <Search className="w-3 h-3 mr-1.5" /> Keyword Search
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search programs..."
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl py-4 pl-11 pr-4 text-sm font-bold text-gray-700 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        <div>
          <div className="flex items-center justify-between mb-8 px-4">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Available Programs</h3>
              <span className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-xs font-black text-indigo-600 shadow-sm">
                {programs.length} Results
              </span>
            </div>
            {loading.programs && <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />}
          </div>

          {programs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs.map((program) => (
                <div key={program.id} className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 overflow-hidden flex flex-col">
                  {/* Program Header */}
                  <div className="p-8 pb-0 flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-4 bg-indigo-50 rounded-[1.5rem] group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        <GraduationCap className="w-8 h-8" />
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black uppercase text-gray-400">Duration</div>
                        <div className="text-sm font-black text-gray-900 flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-indigo-400" /> {program.duration || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <h4 className="text-xl font-black text-gray-900 leading-tight mb-4 line-clamp-2">
                      {program.name}
                    </h4>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm font-bold text-gray-500">
                        <Building className="w-4 h-4 mr-2 text-indigo-600" /> {program.university_name || 'Global University'}
                      </div>
                      <div className="flex items-center text-xs font-semibold text-gray-400">
                        <MapPin className="w-3.5 h-3.5 mr-2" /> {program.city || 'Multilingual Campus'}, {program.country}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-100 italic">
                        {program.level}
                      </span>
                      {program.category_name && (
                        <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-green-100">
                          {program.category_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Program Footer */}
                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase text-gray-400">Application Status</div>
                      <div className="text-xs font-bold text-green-600 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Open for Intake
                      </div>
                    </div>
                    <button
                      onClick={() => handleEnroll(program)}
                      className="p-3 bg-white rounded-2xl shadow-sm border border-transparent hover:border-indigo-600 hover:text-indigo-600 transition-all font-black text-sm flex items-center group-hover:bg-indigo-600 group-hover:text-white group-hover:px-6"
                    >
                      Inroll Now <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-gray-100">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-2">No Programs Found</h3>
              <p className="text-gray-500 font-medium max-w-md mx-auto">Try adjusting your filters or search terms to explore more global opportunities.</p>
              <button
                onClick={() => setFilters({ country: '', university_id: '', level: '', course_category_id: '', search: '' })}
                className="mt-8 px-8 py-3 bg-indigo-50 text-indigo-600 font-black rounded-2xl hover:bg-indigo-100 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Footer Insight */}
        <div className="bg-indigo-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="p-6 bg-white/10 rounded-[2rem] border border-white/10">
              <Info className="w-12 h-12 text-indigo-200" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-3xl font-black mb-3">Partner Institution Support</h3>
              <p className="text-indigo-100 font-medium leading-relaxed max-w-2xl">
                Need help with specific university requirements or documents? Our support team is available 24/7 to assist with your global applications.
              </p>
            </div>
            <button className="px-10 py-5 bg-white text-indigo-900 rounded-[1.5rem] font-bold shadow-xl hover:scale-105 transition-transform">
              Contact Support
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UniversityList;
