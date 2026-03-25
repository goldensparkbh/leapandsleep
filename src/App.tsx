import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';

// Public Pages
import { HomePage } from '@/pages/public/HomePage';
import { BlogPage } from '@/pages/public/BlogPage';
import { BlogPostPage } from '@/pages/public/BlogPostPage';
import { ToolsPage } from '@/pages/public/ToolsPage';
import { ToolPage } from '@/pages/public/ToolPage';
import { SectionPage } from '@/pages/public/SectionPage';
import { ComparisonPage } from '@/pages/public/ComparisonPage';
import { StartHerePage } from '@/pages/public/StartHerePage';
import { AboutPage } from '@/pages/public/AboutPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { SearchPage } from '@/pages/public/SearchPage';
import { ResourcesPage } from '@/pages/public/ResourcesPage';
import { NewsletterUnsubscribePage } from '@/pages/public/NewsletterUnsubscribePage';
import { PrivacyPage, TermsPage, AffiliateDisclosurePage, CookiePolicyPage } from '@/pages/public/LegalPages';
import { NotFoundPage } from '@/pages/public/NotFoundPage';

// Admin Pages
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminPosts } from '@/pages/admin/AdminPosts';
import { AdminPostEdit } from '@/pages/admin/AdminPostEdit';
import { AdminTools } from '@/pages/admin/AdminTools';
import { AdminToolEdit } from '@/pages/admin/AdminToolEdit';
import { AdminComparisons } from '@/pages/admin/AdminComparisons';
import { AdminAffiliateLinks } from '@/pages/admin/AdminAffiliateLinks';
import { AdminComments } from '@/pages/admin/AdminComments';
import { AdminCategories } from '@/pages/admin/AdminCategories';
import { AdminLeads } from '@/pages/admin/AdminLeads';
import { AdminMedia } from '@/pages/admin/AdminMedia';
import { AdminSettings } from '@/pages/admin/AdminSettings';
import { AdminLogin } from '@/pages/admin/AdminLogin';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center">
        <p className="text-sm text-[#6D727A]">Checking admin session...</p>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

// Public Layout
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <Navbar />
      <main className="site-content-width">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <PublicLayout>
                    <HomePage />
                  </PublicLayout>
                }
              />
              <Route
                path="/blog"
                element={
                  <PublicLayout>
                    <BlogPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/blog/:slug"
                element={
                  <PublicLayout>
                    <BlogPostPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/tools"
                element={
                  <PublicLayout>
                    <ToolsPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/tools/:slug"
                element={
                  <PublicLayout>
                    <ToolPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/section/:section"
                element={
                  <PublicLayout>
                    <SectionPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/compare/:slug"
                element={
                  <PublicLayout>
                    <ComparisonPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/start-here"
                element={
                  <PublicLayout>
                    <StartHerePage />
                  </PublicLayout>
                }
              />
              <Route
                path="/about"
                element={
                  <PublicLayout>
                    <AboutPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/contact"
                element={
                  <PublicLayout>
                    <ContactPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/search"
                element={
                  <PublicLayout>
                    <SearchPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/resources"
                element={
                  <PublicLayout>
                    <ResourcesPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/unsubscribe"
                element={
                  <PublicLayout>
                    <NewsletterUnsubscribePage />
                  </PublicLayout>
                }
              />
              <Route
                path="/privacy"
                element={
                  <PublicLayout>
                    <PrivacyPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/terms"
                element={
                  <PublicLayout>
                    <TermsPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/affiliate-disclosure"
                element={
                  <PublicLayout>
                    <AffiliateDisclosurePage />
                  </PublicLayout>
                }
              />
              <Route
                path="/cookies"
                element={
                  <PublicLayout>
                    <CookiePolicyPage />
                  </PublicLayout>
                }
              />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="posts" element={<AdminPosts />} />
                <Route path="posts/new" element={<AdminPostEdit />} />
                <Route path="posts/:id" element={<AdminPostEdit />} />
                <Route path="tools" element={<AdminTools />} />
                <Route path="tools/new" element={<AdminToolEdit />} />
                <Route path="tools/:id" element={<AdminToolEdit />} />
                <Route path="comparisons" element={<AdminComparisons />} />
                <Route path="comments" element={<AdminComments />} />
                <Route path="affiliate-links" element={<AdminAffiliateLinks />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="leads" element={<AdminLeads />} />
                <Route path="media" element={<AdminMedia />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* 404 */}
              <Route
                path="/404"
                element={
                  <PublicLayout>
                    <NotFoundPage />
                  </PublicLayout>
                }
              />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
