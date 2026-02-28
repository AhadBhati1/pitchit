'use client'

import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Nav() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getSession();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="nav">
      <div className="nav__inner">
        <Link className="nav__logo" href="/" aria-label="Groundfloor home">
          <div className="nav__logo-mark" aria-hidden="true">
            GF
          </div>
          Groundfloor
        </Link>
        <div className="nav__links">
          <Link className="nav__link active" href="/">
            Feed
          </Link>
          <Link className="nav__link" href="/submit">
            Submit
          </Link>
          {user && (
            <Link className="nav__link" href={`/profile/${user.id}`}>
              Profile
            </Link>
          )}
        </div>
        <div className="nav__actions">
          {!user ? (
            <>
              <span className="hide-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '12px' }}>Guest Mode</span>
              <Link href="/login" className="btn btn--ghost btn--sm">
                Sign in
              </Link>
            </>
          ) : (
            <button onClick={handleSignOut} className="btn btn--ghost btn--sm">
              Sign out
            </button>
          )}
          <Link href="/submit" className="btn btn--primary btn--sm hide-mobile">
            Launch a pitch
          </Link>
        </div>
      </div>

      {/* Premium Bottom Nav for Mobile */}
      <div className="bottom-nav">
        <Link href="/" className="bottom-nav__item active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          <span>Feed</span>
        </Link>
        <Link href="/submit" className="bottom-nav__item--center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </Link>
        <Link href={user ? `/profile/${user.id}` : "/login"} className="bottom-nav__item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <span>Profile</span>
        </Link>
      </div>

      <style jsx>{`
        @media (max-width: 600px) {
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
