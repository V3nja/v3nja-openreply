import { EMAIL_PROVIDER_ID, signIn } from "@/lib/auth";
import { getCampaignTemplate } from "@/lib/templates/campaign-templates";
import Link from "next/link";

export const metadata = {
  title: "Login - V3NJA WRLD OpenReply",
  description: "Sign in to manage V3NJA Instagram comment-to-DM automation campaigns.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    checkEmail?: string;
    callbackUrl?: string;
    template?: string;
  }>;
}) {
  const params = await searchParams;
  const checkEmail = params.checkEmail === "1";
  const selectedTemplate = getCampaignTemplate(params.template);
  const templateCallbackUrl = selectedTemplate
    ? `/campaigns/new?template=${selectedTemplate.slug}`
    : null;
  const callbackUrl = params.callbackUrl ?? templateCallbackUrl ?? "/dashboard";

  async function sendMagicLink(formData: FormData) {
    "use server";
    await signIn(EMAIL_PROVIDER_ID, {
      email: String(formData.get("email") ?? ""),
      redirectTo: callbackUrl,
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-md">
        {/* V3NJA Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-red-500 text-white font-black text-2xl shadow-lg shadow-orange-500/20 mb-4">
            V3
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            V3NJA <span className="text-orange-500">WRLD</span>
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed mt-1">
            Instagram Comment & Story DM Automation Engine
          </p>
        </div>

        {/* Quick Launch Panel */}
        <div className="rounded-xl border border-orange-500/30 bg-orange-950/20 p-5 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-400 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Artist Workspace Ready
          </div>
          <p className="text-xs text-zinc-300 mb-4">
            Campaigns loaded: <strong>NJALA</strong>, <strong>WAYULOMI</strong>, <strong>ZANGA</strong>, <strong>MOTO</strong>, <strong>MERCH</strong>
          </p>
          <a
            href="/api/auth/dev-login"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:from-orange-600 hover:to-amber-600"
          >
            🔥 Enter V3NJA WRLD Dashboard
          </a>
        </div>

        {/* Alternative Email Login */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">
            Or sign in with custom account email:
          </h2>

          {selectedTemplate && !checkEmail && (
            <div className="mb-5 border border-orange-500/20 bg-orange-500/10 p-3 rounded text-xs text-orange-300">
              Template selected: <strong>{selectedTemplate.title}</strong>
            </div>
          )}

          {checkEmail ? (
            <div className="text-center py-4">
              <h2 className="text-base font-semibold mb-2 text-white">Check your email</h2>
              <p className="text-xs text-zinc-400">
                We sent you a secure sign-in link. Open it on this device to continue.
              </p>
            </div>
          ) : (
            <form action={sendMagicLink} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="v3nja@wrld.music"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800/80 border border-zinc-700 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all"
              >
                Send Magic Link
              </button>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-zinc-800 text-center">
            <Link
              href="/comment-link-automation"
              className="text-xs text-zinc-500 hover:text-orange-400 transition-colors"
            >
              Learn how Comment-to-DM works with Meta APIs →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
