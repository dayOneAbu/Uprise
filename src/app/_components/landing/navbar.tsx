"use client";

import Link from "next/link";
import { Button } from "~/app/_components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { authClient } from "~/lib/auth-client";

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
  const { setTheme, theme } = useTheme();

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="flex items-center justify-between p-4 md:p-6 bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">U</div>
            Uprise
        </Link>
        <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/employer/auth/login" className="hover:text-foreground transition-colors">Find Talent</Link>
            <Link href="/candidate/auth/login" className="hover:text-foreground transition-colors">Find Internships</Link>
            <Link href="/#why-uprise" className="hover:text-foreground transition-colors">Why Uprise</Link>
            
        </div>
      </div>
      
      <div className="flex gap-4 items-center">
        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {session ? (
            <div className="flex gap-4 items-center">
                <span className="text-sm font-medium text-muted-foreground hidden md:block">
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

                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
            </div>
        ) : (
            <>
                <Button variant="ghost" className="font-semibold" asChild>
                     <Link href="/candidate/auth/login">Log In</Link>
                </Button>
                <Button className="rounded-full px-6" asChild>
                     <Link href="/candidate/auth/login">Sign Up</Link>
                </Button>
            </>
        )}
      </div>
    </nav>
  );
}
