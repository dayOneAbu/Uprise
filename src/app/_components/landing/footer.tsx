"use client";

import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="text-foreground font-semibold mb-4">For Candidates</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-foreground transition-colors">Find Internships</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Skill Tests</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Success Stories</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Resources</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-semibold mb-4">For Employers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-foreground transition-colors">Post a Job</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Find Talent</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Enterprise Solutions</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-foreground transition-colors">Help & Support</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Success Stories</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Reviews</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Press</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
             <span className="text-sm">© 2024 MeritMatch Global Inc.</span>
             <Link href="#" className="text-sm hover:text-foreground transition-colors">Terms of Service</Link>
             <Link href="#" className="text-sm hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
          
          <div className="flex gap-4">
             <Link href="#" className="hover:text-foreground transition-colors"><Facebook size={20} /></Link>
             <Link href="#" className="hover:text-foreground transition-colors"><Twitter size={20} /></Link>
             <Link href="#" className="hover:text-foreground transition-colors"><Linkedin size={20} /></Link>
             <Link href="#" className="hover:text-foreground transition-colors"><Instagram size={20} /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
