"use client";

import Link from "next/link";
import { Button } from "~/app/_components/ui/button";

interface NavbarProps {
  session: {
    user: {
      email: string;
      role?: string;
    };
  } | null;
}

export const Navbar: React.FC<NavbarProps> = ({ session }) => {
  const role = session?.user.role;

  return (
    <nav className="flex items-center justify-between p-4 md:p-6 bg-white sticky top-0 z-50 border-b border-slate-200">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-bold text-blue-900 tracking-tight flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">M</div>
            MeritMatch
        </Link>
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <Link href="/employer/auth/login" className="hover:text-blue-600">Find Talent</Link>
            <Link href="/candidate/auth/login" className="hover:text-blue-600">Find Internships</Link>
            <Link href="/#why-meritmatch" className="hover:text-blue-600">Why MeritMatch</Link>
            <Link href="/#enterprise" className="hover:text-blue-600">Enterprise</Link>
        </div>
      </div>
      
      <div className="flex gap-4 items-center">
        {session ? (
            <div className="flex gap-4 items-center">
                <span className="text-sm font-medium text-gray-600 hidden md:block">
                    {session.user.email}
                </span>
                
                {role === "EMPLOYER" && (
                    <Button variant="outline" asChild className="hidden md:flex">
                        <Link href="/employer/jobs">Dashboard</Link>
                    </Button>
                )}
                {role === "CANDIDATE" && (
                     <Button variant="outline" asChild className="hidden md:flex">
                        <Link href="/candidate">Dashboard</Link>
                    </Button>
                )}

                <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" asChild>
                     <Link href="/api/auth/signout">Sign Out</Link>
                </Button>
            </div>
        ) : (
            <>
                <Button variant="ghost" className="text-slate-600 font-semibold" asChild>
                     <Link href="/candidate/auth/login">Log In</Link>
                </Button>
                <Button className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-6" asChild>
                     <Link href="/candidate/auth/login">Sign Up</Link>
                </Button>
            </>
        )}
      </div>
    </nav>
  );
}
