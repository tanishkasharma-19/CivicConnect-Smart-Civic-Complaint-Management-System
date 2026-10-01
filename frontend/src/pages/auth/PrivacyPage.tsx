import type { Page } from '../../types'
import Logo from '../../components/Logo'
import { ArrowLeftIcon } from '../../components/Icons'

interface PrivacyPageProps {
  navigate: (page: Page) => void
}

export default function PrivacyPage({
  navigate,
}: PrivacyPageProps) {
  return (
    <div className="min-h-[100dvh] bg-navy-50 px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-3xl mx-auto">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-navy-200/60 shadow-sm p-5 sm:p-8 lg:p-10">

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">
              CivicConnect
            </p>

            <h1
              className="text-2xl sm:text-3xl font-bold text-navy-900"
              style={{
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Privacy Policy
            </h1>

            <p className="text-sm text-navy-500 mt-2">
              This page explains the information used by
              CivicConnect while you use the platform.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-7 text-sm text-navy-700 leading-relaxed">

            <section>
              <h2 className="text-base font-bold text-navy-900 mb-2">
                1. Information We Collect
              </h2>

              <p>
                When you create an account, CivicConnect
                may collect basic information such as your
                name and email address.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-navy-900 mb-2">
                2. Complaint Information
              </h2>

              <p>
                A complaint may include a title,
                description, category, address, location
                coordinates, uploaded photos, status
                information, and community activity such
                as upvotes.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-navy-900 mb-2">
                3. Location Information
              </h2>

              <p>
                When you allow location access in your
                browser, CivicConnect can use the latitude
                and longitude provided by your device to
                associate the complaint with its location.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-navy-900 mb-2">
                4. How Information Is Used
              </h2>

              <p>
                Information is used to create and manage
                complaints, show complaint progress,
                support officer and department workflows,
                and provide relevant platform notifications.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-navy-900 mb-2">
                5. Photo Storage
              </h2>

              <p>
                Complaint photographs are uploaded through
                the application backend to the configured
                cloud image storage service. The application
                keeps the image reference so the photo can
                be displayed later.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-navy-900 mb-2">
                6. Account Security
              </h2>

              <p>
                Protected features require authentication.
                Users should keep their passwords confidential
                and use their own account.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-navy-900 mb-2">
                7. Updates
              </h2>

              <p>
                This privacy policy may be updated as
                CivicConnect features and data-handling
                practices evolve.
              </p>
            </section>

          </div>

          {/* Footer note */}
          <div className="mt-10 pt-6 border-t border-navy-100">
            <p className="text-xs text-navy-400">
              This policy describes the intended information
              handling for the CivicConnect project.
            </p>
          </div>

        </div>

        {/* Back */}
        <button
          onClick={() => navigate('register')}
          className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700 transition-colors mx-auto mt-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to registration
        </button>

      </div>
    </div>
  )
}