"use client";

import { useState, useRef } from "react";
import { 
  Plus, BookOpen, Users, Video, X, Settings, Loader2, 
  Trash2, Edit, Save, FileText, Play, CheckCircle, ArrowRight,
  Paperclip, Download, XCircle as XCircleIcon,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { coursesApi } from "@/lib/api";

export default function CoursesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [activeBuilderTab, setActiveBuilderTab] = useState<"info" | "lessons" | "enrollments">("lessons");
  const [editingLesson, setEditingLesson] = useState<any | null>(null); // For nested lesson editor
  const [enrollmentSearch, setEnrollmentSearch] = useState("");
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState("ALL");
  
  const queryClient = useQueryClient();

  // Create course form state
  const [createFormData, setCreateFormData] = useState({
    title: "",
    category: "Compliance",
    description: ""
  });

  // Course info edit form state
  const [editCourseData, setEditCourseData] = useState({
    title: "",
    category: "",
    description: "",
    isActive: true
  });

  const [customCategory, setCustomCategory] = useState("");
  const [editCustomCategory, setEditCustomCategory] = useState("");

  // Lesson form state
  const [lessonFormData, setLessonFormData] = useState({
    title: "",
    videoUrl: "",
    content: "",
    order: 1
  });
  const [lessonReadingFile, setLessonReadingFile] = useState<File | null>(null);
  const [clearReadingFile, setClearReadingFile] = useState(false);
  const readingFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getAll()
  });

  const defaultCategories = ["Compliance", "Clinical Skills", "Safety", "Onboarding"];
  const uniqueCategories = Array.from(new Set([
    ...defaultCategories,
    ...(courses || []).map((c: any) => c.category).filter(Boolean)
  ]));

  // Fetch specific course details (including lessons) when selected
  const { data: courseDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['admin-course-details', selectedCourse?.id],
    queryFn: () => coursesApi.getOne(selectedCourse.id),
    enabled: !!selectedCourse?.id
  });

  // Fetch enrollments for selected course
  const { data: enrollments = [], isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['admin-course-enrollments', selectedCourse?.id],
    queryFn: () => coursesApi.getEnrollments(selectedCourse.id),
    enabled: !!selectedCourse?.id && activeBuilderTab === "enrollments"
  });

  // Mutations
  const createCourseMutation = useMutation({
    mutationFn: (data: any) => coursesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsCreateModalOpen(false);
      setCreateFormData({ title: "", category: "Compliance", description: "" });
      setCustomCategory("");
    }
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => coursesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-course-details', selectedCourse?.id] });
      setEditCustomCategory("");
      alert("Course updated successfully!");
    }
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setSelectedCourse(null);
    }
  });

  // Lesson Mutations
  const createLessonMutation = useMutation({
    mutationFn: (data: any) => coursesApi.createLesson(selectedCourse.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course-details', selectedCourse?.id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setEditingLesson(null);
    }
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => coursesApi.updateLesson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course-details', selectedCourse?.id] });
      setEditingLesson(null);
    }
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id: string) => coursesApi.deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course-details', selectedCourse?.id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    }
  });

  const handleCreateCourse = () => {
    const finalCategory = createFormData.category === "__NEW__" ? customCategory : createFormData.category;
    createCourseMutation.mutate({
      ...createFormData,
      category: finalCategory || "Compliance"
    });
  };

  const handleOpenCourseBuilder = (course: any) => {
    setSelectedCourse(course);
    setEditCourseData({
      title: course.title,
      category: course.category,
      description: course.description || "",
      isActive: course.isActive !== false
    });
    setEditCustomCategory("");
    setActiveBuilderTab("lessons");
    setEditingLesson(null);
  };

  const handleSaveCourseInfo = () => {
    const finalCategory = editCourseData.category === "__NEW__" ? editCustomCategory : editCourseData.category;
    updateCourseMutation.mutate({
      id: selectedCourse.id,
      data: {
        ...editCourseData,
        category: finalCategory || "Compliance"
      }
    });
  };

  const handleDeleteCourse = () => {
    if (confirm("Are you sure you want to delete this course and all associated lessons/quizzes? This action is irreversible.")) {
      deleteCourseMutation.mutate(selectedCourse.id);
    }
  };

  const handleOpenAddLesson = () => {
    const nextOrder = (courseDetails?.lessons?.length || 0) + 1;
    setEditingLesson({ id: "new" });
    setLessonFormData({
      title: "",
      videoUrl: "",
      content: "",
      order: nextOrder
    });
    setLessonReadingFile(null);
    setClearReadingFile(false);
  };

  const handleOpenEditLesson = (lesson: any) => {
    setEditingLesson(lesson);
    setLessonFormData({
      title: lesson.title,
      videoUrl: lesson.videoUrl || "",
      content: lesson.content || "",
      order: lesson.order || 1
    });
    setLessonReadingFile(null);
    setClearReadingFile(false);
  };

  const handleSaveLesson = () => {
    const payload = {
      ...lessonFormData,
      readingFile: lessonReadingFile,
      clearReadingFile,
    };
    if (editingLesson.id === "new") {
      createLessonMutation.mutate(payload);
    } else {
      updateLessonMutation.mutate({
        id: editingLesson.id,
        data: payload
      });
    }
  };

  const handleDeleteLesson = (lessonId: string, title: string) => {
    if (confirm(`Are you sure you want to delete the topic "${title}"?`)) {
      deleteLessonMutation.mutate(lessonId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">LMS Courses Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage training courses, lessons, readings, and certificates.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/95 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Course Shell
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 min-h-[300px]">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-card border rounded-2xl">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold">No training courses found</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">Create a new course catalog to assign and track professional training modules.</p>
          </div>
        ) : courses.map((course: any) => (
          <div key={course.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow group relative">
            <button 
              onClick={() => handleOpenCourseBuilder(course)}
              className="absolute top-3 right-3 p-2 bg-background/80 hover:bg-background rounded-lg border shadow-sm opacity-0 group-hover:opacity-100 transition-all z-20"
              title="Manage Lessons & Settings"
            >
              <Settings className="w-4 h-4 text-foreground" />
            </button>
            <div className="h-32 bg-muted/30 border-b flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/15" />
              <BookOpen className="w-10 h-10 text-primary opacity-40 relative z-10 animate-pulse" />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 
                  onClick={() => handleOpenCourseBuilder(course)}
                  className="font-bold text-base mb-2 group-hover:text-primary transition-colors cursor-pointer line-clamp-1"
                >
                  {course.title}
                </h3>
                <p className="text-xs text-muted-foreground/80 font-medium mb-3">{course.category}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                  {course.description || "No description provided. Click Settings to complete the course content setup."}
                </p>
              </div>
              <div className="pt-4 flex items-center justify-between text-xs text-muted-foreground border-t">
                <span className="flex items-center gap-1 font-semibold"><Video className="w-3.5 h-3.5" /> {course._count?.lessons || 0} Topics</span>
                <span className="flex items-center gap-1 font-semibold"><Users className="w-3.5 h-3.5" /> {course._count?.enrollments || 0} Enrolled</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Shell Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-card">
              <h2 className="text-xl font-bold">Create Training Course</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Course Title</label>
                <input 
                  type="text" 
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({...createFormData, title: e.target.value})}
                  className="w-full border rounded-xl px-3.5 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium" 
                  placeholder="e.g. OSHA Bloodborne Pathogens Training" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Category</label>
                <select 
                  value={createFormData.category}
                  onChange={(e) => setCreateFormData({...createFormData, category: e.target.value})}
                  className="w-full border rounded-xl px-3.5 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                >
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__NEW__">+ Create Custom Category...</option>
                </select>
                
                {createFormData.category === "__NEW__" && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1.5 pt-1.5"
                  >
                    <label className="text-xs font-bold text-primary flex items-center gap-1">
                      <Plus className="w-3 h-3" /> New Category Name
                    </label>
                    <input 
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full border border-primary/50 rounded-xl px-3.5 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-semibold placeholder:font-normal placeholder:text-muted-foreground/60" 
                      placeholder="e.g. Continuing Education, Pediatric Care" 
                    />
                  </motion.div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Brief Description</label>
                <textarea 
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                  className="w-full border rounded-xl px-3.5 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium resize-none" 
                  rows={3}
                  placeholder="Provide an overview of what the candidate will learn in this module..." 
                />
              </div>
            </div>
            <div className="p-6 border-t bg-muted/10 flex justify-end gap-3">
              <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2.5 border rounded-xl text-sm font-semibold hover:bg-muted transition-colors">Cancel</button>
              <button 
                onClick={handleCreateCourse} 
                disabled={createCourseMutation.isPending || !createFormData.title}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/95 transition-colors disabled:opacity-50"
              >
                {createCourseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create Course Shell
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Course Settings & Lesson Builder Slider/Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-end">
          <div className="bg-card w-full max-w-4xl h-full shadow-2xl border-l flex flex-col overflow-hidden animate-slide-in">
            {/* Header */}
            <div className="p-6 border-b shrink-0 flex justify-between items-center bg-card">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {selectedCourse.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Manage details and curriculum structure for this course module</p>
              </div>
              <button 
                onClick={() => setSelectedCourse(null)} 
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 border-b shrink-0 flex bg-muted/10">
              <button 
                onClick={() => { setActiveBuilderTab("lessons"); setEditingLesson(null); }}
                className={`py-3.5 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
                  activeBuilderTab === "lessons" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Video className="w-4 h-4" />
                Curriculum Topics ({courseDetails?.lessons?.length || 0})
              </button>
              <button 
                onClick={() => { setActiveBuilderTab("info"); setEditingLesson(null); }}
                className={`py-3.5 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
                  activeBuilderTab === "info" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Settings className="w-4 h-4" />
                Course Info & Settings
              </button>
              <button 
                onClick={() => { setActiveBuilderTab("enrollments"); setEditingLesson(null); }}
                className={`py-3.5 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
                  activeBuilderTab === "enrollments" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="w-4 h-4" />
                Enrollments & Progress ({enrollments?.length || 0})
              </button>
            </div>

            {/* Scrollable Content View */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingDetails ? (
                <div className="h-90 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : activeBuilderTab === "info" ? (
                /* Edit Course Info form */
                <div className="space-y-6 max-w-xl">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Course Title</label>
                    <input 
                      type="text" 
                      value={editCourseData.title}
                      onChange={(e) => setEditCourseData({...editCourseData, title: e.target.value})}
                      className="w-full border rounded-xl px-3.5 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Category</label>
                    <select 
                      value={editCourseData.category}
                      onChange={(e) => setEditCourseData({...editCourseData, category: e.target.value})}
                      className="w-full border rounded-xl px-3.5 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-semibold"
                    >
                      {uniqueCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__NEW__">+ Create Custom Category...</option>
                    </select>

                    {editCourseData.category === "__NEW__" && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-1.5 pt-1.5"
                      >
                        <label className="text-xs font-bold text-primary flex items-center gap-1">
                          <Plus className="w-3 h-3" /> New Category Name
                        </label>
                        <input 
                          type="text"
                          required
                          value={editCustomCategory}
                          onChange={(e) => setEditCustomCategory(e.target.value)}
                          className="w-full border border-primary/50 rounded-xl px-3.5 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-semibold placeholder:font-normal placeholder:text-muted-foreground/60" 
                          placeholder="e.g. Continuing Education, Pediatric Care" 
                        />
                      </motion.div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Course Description</label>
                    <textarea 
                      value={editCourseData.description}
                      onChange={(e) => setEditCourseData({...editCourseData, description: e.target.value})}
                      className="w-full border rounded-xl px-3.5 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm leading-relaxed resize-none"
                      rows={5}
                    />
                  </div>

                  <div className="pt-4 border-t flex justify-between items-center gap-4">
                    <button 
                      onClick={handleDeleteCourse}
                      className="flex items-center gap-1.5 text-xs text-destructive hover:bg-destructive/10 px-4 py-2.5 rounded-xl border border-destructive/20 font-bold transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Course Module
                    </button>
                    <button 
                      onClick={handleSaveCourseInfo}
                      disabled={updateCourseMutation.isPending}
                      className="flex items-center gap-1.5 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/95 transition-all shadow-sm disabled:opacity-50"
                    >
                      {updateCourseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Course Details
                    </button>
                  </div>
                </div>
              ) : activeBuilderTab === "enrollments" ? (
                /* Enrollments & Progress View */
                <div className="space-y-6">
                  {isLoadingEnrollments ? (
                    <div className="py-20 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-card border rounded-2xl p-4 shadow-sm flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Enrolled</p>
                            <h4 className="text-lg font-bold text-foreground mt-0.5">{enrollments.length}</h4>
                          </div>
                        </div>

                        <div className="bg-card border rounded-2xl p-4 shadow-sm flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Completed</p>
                            <h4 className="text-lg font-bold text-foreground mt-0.5">
                              {enrollments.filter((e: any) => e.status === "COMPLETED").length}
                            </h4>
                          </div>
                        </div>

                        <div className="bg-card border rounded-2xl p-4 shadow-sm flex items-center gap-4">
                          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 font-bold">
                            <Loader2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">In Progress</p>
                            <h4 className="text-lg font-bold text-foreground mt-0.5">
                              {enrollments.filter((e: any) => e.status === "IN_PROGRESS").length}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* Filters */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                          <input 
                            type="text"
                            value={enrollmentSearch}
                            onChange={(e) => setEnrollmentSearch(e.target.value)}
                            placeholder="Search candidates by name or email..."
                            className="w-full border rounded-xl pl-10 pr-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                          />
                          <svg className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <select 
                          value={enrollmentStatusFilter}
                          onChange={(e) => setEnrollmentStatusFilter(e.target.value)}
                          className="border rounded-xl px-4 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                        >
                          <option value="ALL">All Statuses</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>

                      {/* List */}
                      {enrollments.filter((e: any) => {
                        const fullName = `${e.user?.firstName || ''} ${e.user?.lastName || ''}`.toLowerCase();
                        const email = (e.user?.email || '').toLowerCase();
                        const searchMatches = fullName.includes(enrollmentSearch.toLowerCase()) || email.includes(enrollmentSearch.toLowerCase());
                        const statusMatches = enrollmentStatusFilter === "ALL" || e.status === enrollmentStatusFilter;
                        return searchMatches && statusMatches;
                      }).length === 0 ? (
                        <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/10">
                          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                          <h4 className="font-bold text-sm text-muted-foreground">No candidate enrollments match the filter settings</h4>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {enrollments
                            .filter((e: any) => {
                              const fullName = `${e.user?.firstName || ''} ${e.user?.lastName || ''}`.toLowerCase();
                              const email = (e.user?.email || '').toLowerCase();
                              const searchMatches = fullName.includes(enrollmentSearch.toLowerCase()) || email.includes(enrollmentSearch.toLowerCase());
                              const statusMatches = enrollmentStatusFilter === "ALL" || e.status === enrollmentStatusFilter;
                              return searchMatches && statusMatches;
                            })
                            .map((enrollment: any) => {
                              const lessonsList = enrollment.course?.lessons || [];
                              const totalLessonsCount = lessonsList.length;

                              let completedIds: string[] = [];
                              try {
                                completedIds = Array.isArray(enrollment.completedLessons)
                                  ? enrollment.completedLessons
                                  : JSON.parse(enrollment.completedLessons || "[]");
                              } catch(err) {
                                completedIds = [];
                              }

                              const completedLessonsInCourse = lessonsList.filter((l: any) => completedIds.includes(l.id));
                              const lastCompleted = completedLessonsInCourse.reduce((max: any, current: any) => {
                                return (!max || current.order > max.order) ? current : max;
                              }, null);

                              const currentStandingText = lastCompleted 
                                ? `Completed: ${lastCompleted.title} (Topic ${lastCompleted.order} of ${totalLessonsCount})` 
                                : totalLessonsCount > 0 ? "Just enrolled (not started yet)" : "No lessons in course shell";

                              const initial = `${enrollment.user?.firstName?.[0] || ''}${enrollment.user?.lastName?.[0] || ''}`.toUpperCase();

                              return (
                                <div key={enrollment.id} className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
                                  {/* Candidate profile & contact */}
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-primary-foreground font-bold shadow-md shrink-0">
                                      {initial || <Users className="w-5 h-5" />}
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-base text-foreground leading-none">
                                        {enrollment.user?.firstName} {enrollment.user?.lastName}
                                      </h4>
                                      <p className="text-xs text-muted-foreground mt-1">{enrollment.user?.email}</p>
                                      {enrollment.user?.phone && (
                                        <p className="text-[11px] text-muted-foreground/80 font-medium mt-0.5">{enrollment.user?.phone}</p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Progress bar and Standing */}
                                  <div className="flex-1 max-w-md w-full space-y-2">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                      <span className="text-muted-foreground">Course Completion</span>
                                      <span className="text-primary">{enrollment.progress}%</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden border border-muted-foreground/10">
                                      <div 
                                        className="bg-primary h-full rounded-full transition-all duration-500" 
                                        style={{ width: `${enrollment.progress}%` }}
                                      />
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground/80 truncate">
                                      {currentStandingText}
                                    </p>
                                  </div>

                                  {/* Status capsule, date and actions */}
                                  <div className="flex flex-row md:flex-col items-end gap-3 justify-between w-full md:w-auto shrink-0 border-t md:border-none pt-3 md:pt-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-muted-foreground font-semibold">
                                        Enrolled: {new Date(enrollment.createdAt).toLocaleDateString()}
                                      </span>
                                      {enrollment.status === "COMPLETED" ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20">
                                          <CheckCircle className="w-3.5 h-3.5" />
                                          COMPLETED
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full border border-amber-500/20">
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          IN PROGRESS
                                        </span>
                                      )}
                                    </div>

                                    {enrollment.status === "COMPLETED" && enrollment.certificate && (
                                      <a
                                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${enrollment.certificate.certificateUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover bg-primary/10 hover:bg-primary/20 px-3.5 py-2 rounded-xl transition-all border border-primary/20"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                        Print Premium Certificate
                                      </a>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : editingLesson ? (
                /* Detailed Lesson Form Editor (Inline Nested Drawer style) */
                <div className="space-y-6 max-w-2xl bg-muted/20 border rounded-2xl p-6 shadow-inner relative">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      {editingLesson.id === "new" ? "New Curriculum Topic" : "Edit Topic Settings"}
                    </h3>
                    <button 
                      onClick={() => setEditingLesson(null)} 
                      className="p-1 hover:bg-muted border rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-sm font-semibold">Topic Title</label>
                        <input 
                          type="text" 
                          value={lessonFormData.title}
                          onChange={(e) => setLessonFormData({...lessonFormData, title: e.target.value})}
                          placeholder="e.g. Intro to HIPAA Regulations"
                          className="w-full border rounded-xl px-3.5 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold">Sequence Order</label>
                        <input 
                          type="number" 
                          value={lessonFormData.order}
                          onChange={(e) => setLessonFormData({...lessonFormData, order: parseInt(e.target.value) || 1})}
                          className="w-full border rounded-xl px-3.5 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-primary" />
                        Video Attachment / YouTube URL
                        <span className="text-[10px] font-normal text-muted-foreground">(Optional - standard YouTube link or direct MP4 link)</span>
                      </label>
                      <input 
                        type="text" 
                        value={lessonFormData.videoUrl}
                        onChange={(e) => setLessonFormData({...lessonFormData, videoUrl: e.target.value})}
                        placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        className="w-full border rounded-xl px-3.5 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-primary" />
                        Readings Content
                        <span className="text-[10px] font-normal text-muted-foreground">(Inline text content. Use below for an uploaded document.)</span>
                      </label>
                      <textarea 
                        value={lessonFormData.content}
                        onChange={(e) => setLessonFormData({...lessonFormData, content: e.target.value})}
                        placeholder="Write or paste the clinical procedures, safety checklists, or study guide documents for this topic..."
                        className="w-full border rounded-xl p-4 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm leading-relaxed"
                        rows={6}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold flex items-center gap-1.5">
                        <Paperclip className="w-4 h-4 text-primary" />
                        Reading Material Document
                        <span className="text-[10px] font-normal text-muted-foreground">(Optional — PDF, DOCX uploaded as downloadable file)</span>
                      </label>

                      {/* Show existing file if editing an existing lesson */}
                      {editingLesson.id !== "new" && editingLesson.readingFileUrl && !clearReadingFile && !lessonReadingFile && (
                        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-xs font-semibold text-foreground truncate flex-1">
                            {editingLesson.readingFilename || "Attached document"}
                          </span>
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${editingLesson.readingFileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline shrink-0"
                          >
                            <Download className="w-3 h-3" /> View
                          </a>
                          <button
                            type="button"
                            onClick={() => setClearReadingFile(true)}
                            className="text-destructive hover:text-destructive/80 shrink-0"
                            title="Remove attachment"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Show picked file name if a new file was selected */}
                      {lessonReadingFile && (
                        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-xs font-semibold text-emerald-800 truncate flex-1">
                            {lessonReadingFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => { setLessonReadingFile(null); if (readingFileInputRef.current) readingFileInputRef.current.value = ""; }}
                            className="text-destructive hover:text-destructive/80 shrink-0"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* File picker — shown when no file is picked and no existing (or existing was cleared) */}
                      {!lessonReadingFile && (clearReadingFile || editingLesson.id === "new" || !editingLesson.readingFileUrl) && (
                        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                          <input
                            ref={readingFileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setLessonReadingFile(file);
                              setClearReadingFile(false);
                            }}
                          />
                          <Paperclip className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-semibold text-muted-foreground">Click to attach PDF or DOCX reading material</span>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-end gap-3 bg-card px-4 py-3 rounded-xl border shadow-sm">
                    <button 
                      onClick={() => setEditingLesson(null)} 
                      className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveLesson}
                      disabled={createLessonMutation.isPending || updateLessonMutation.isPending || !lessonFormData.title}
                      className="flex items-center gap-1.5 bg-primary text-primary-foreground px-5 py-2 rounded-xl text-xs font-semibold hover:bg-primary/95 transition-all shadow-sm disabled:opacity-50"
                    >
                      {createLessonMutation.isPending || updateLessonMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Save Topic
                    </button>
                  </div>
                </div>
              ) : (
                /* List of Lessons inside Curriculum builder */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-foreground">Course Outline</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Below are the modules applicants must complete to finish the course and generate a certificate.</p>
                    </div>
                    <button 
                      onClick={handleOpenAddLesson}
                      className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-primary/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Topic
                    </button>
                  </div>

                  {courseDetails?.lessons?.length === 0 ? (
                    <div className="border border-dashed rounded-2xl py-14 text-center bg-muted/10">
                      <Video className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3 opacity-55 animate-bounce" />
                      <p className="font-semibold text-muted-foreground text-sm">Curriculum is empty</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">This course doesn't have any lessons. Click Add Topic above to create video lectures or reading pages.</p>
                    </div>
                  ) : (
                    <div className="divide-y border rounded-2xl bg-card overflow-hidden">
                      {courseDetails?.lessons?.map((lesson: any, index: number) => (
                        <div 
                          key={lesson.id} 
                          className="flex items-center justify-between gap-4 p-5 hover:bg-muted/15 transition-all"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 border text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                              {lesson.order || (index + 1)}
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                                {lesson.title}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground/90 font-medium">
                                {lesson.videoUrl ? (
                                  <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-semibold text-[10px]">
                                    <Video className="w-3.5 h-3.5" /> Video Lecture
                                  </span>
                                ) : null}
                                {lesson.content ? (
                                  <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-semibold text-[10px]">
                                    <FileText className="w-3.5 h-3.5" /> Readings Document
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleOpenEditLesson(lesson)}
                              className="p-2 hover:bg-muted border rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                              title="Edit Topic"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                              className="p-2 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl text-destructive transition-colors"
                              title="Delete Topic"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
