import type { Page } from '../../types'
import Logo from '../../components/Logo'
import { ArrowLeftIcon } from '../../components/Icons'

interface TermsPageProps {
  navigate: (page: Page) => void
}

export default function TermsPage({
  navigate,
}: TermsPageProps) {
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
              Terms of Service
            </h1>

            <p className="text-sm text-navy-500 mt-2">
              Please read these basic terms before using
              CivicConnect.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-7 text-sm text-navy-700 leading-relaxed">

            <section>
              <h2 className="text-base font-bold text-navy-900 mb-2">
                1. Using CivicConnect
              </h2>

              <p>
                CivicConnect is a platform for reporting
                and tracking local civic issues such as
                damaged roads, garbage problems, water
                issues, and other public concerns.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-navy-900 mb-2">
                2. Provide Accurate Information
              </h2>

              <p>
                Users should provide correct and relevant
                information when creating an account or
                submitting a complaint. Complaint details
                and uploaded photos should relate to the
                reported issue.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-navy-900 mb-2">
                3. Appropriate Content
              </h2>

              <p>
                CivicConnect should not be used to submit
                abusive, false, misleading, harmful, or
                unrelated content. Users are responsible
                for the information they submit.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-navy-900 mb-2">
                4. Complaint Processing
              </h2>

              <p>
                Submitted complaints may be reviewed,
                verified, assigned to an appropriate
                department or officer, updated, resolved,
                or closed as part of the platform workflow.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-navy-900 mb-2">
                5. Account Responsibility
              </h2>

              <p>
                Users are responsible for keeping their
                login credentials private and for activity
                carried out through their account.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-navy-900 mb-2">
                6. Changes
              </h2>

              <p>
                CivicConnect may update its features or
                these terms as the project evolves.
              </p>
            </section>

          </div>

          {/* Footer note */}
          <div className="mt-10 pt-6 border-t border-navy-100">
            <p className="text-xs text-navy-400">
              These terms describe the intended use of
              CivicConnect as a project platform.
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