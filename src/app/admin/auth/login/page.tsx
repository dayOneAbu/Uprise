"use client";

import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils";

// Custom Button Component
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg";
  }
>(({ className, _variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-9 px-3",
        size === "lg" && "h-11 px-8",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

// Custom Input Component
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

// DotMap Component (Simplified/Abstracted from starter)
// RoutePoint type removed (not used in admin visualization)

const DotMap = () => {
    // ... (Reusing the map logic from the starter for the 'cool' effect, maybe simplified or kept as is)
    // For brevity in this artifact, reusing the logic provided in the prompt's starter code
    // In a real scenario, this might be a separate component import. 
    // I will include the full code to ensure it works as a standalone page component.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // routes removed: not used in this simplified admin dot visualization

  const generateDots = (width: number, height: number) => {
    const dots = [];
    const gap = 12;
    // ... Simplified map generation logic
    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
          if (Math.random() > 0.8) { // Just random stars/nodes for admin abstract feel
             dots.push({ x, y, radius: 1, opacity: Math.random() * 0.5 + 0.1 });
          }
      }
    }
    return dots;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;
    });
    resizeObserver.observe(canvas.parentElement as Element);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const dots = generateDots(dimensions.width, dimensions.height);
    
    let animationId: number;
    const animate = () => {
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);
        dots.forEach(dot => {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${dot.opacity})`;
            ctx.fill();
        });
        animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [dimensions]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default function AdminLoginPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await authClient.signIn.email({
        email,
        password,
        callbackURL: "/admin", // Assuming /admin exists or will be created
    }, {
        onSuccess: () => router.push("/admin"),
        onError: (ctx) => {
            alert(ctx.error.message);
            setIsLoading(false);
        }
    });
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 p-4 font-sans text-slate-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl overflow-hidden rounded-2xl flex bg-[#090b13] shadow-2xl border border-zinc-800"
      >
        {/* Left side - Map Data Viz */}
        <div className="hidden md:block w-1/2 h-[600px] relative overflow-hidden border-r border-[#1f2130]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f1120] to-[#151929]">
            <DotMap />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-6 h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-amber-600 flex items-center justify-center shadow-lg shadow-red-500/20"
              >
                <ShieldCheck className="text-white h-8 w-8" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-500">
                Admin Portal
              </h2>
              <p className="text-sm text-center text-gray-400 max-w-xs">
                Restricted access. Monitoring and management dashboard.
              </p>
            </div>
          </div>
        </div>
        
        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-zinc-900/50">
            <div className="max-w-md mx-auto w-full">
                <h1 className="text-2xl font-bold mb-1 text-white">Authenticate</h1>
                <p className="text-gray-400 mb-8">Enter admin credentials</p>
                
                <form onSubmit={handleSignIn} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-zinc-950 border-zinc-800 text-gray-200 focus:border-red-500/50 transition-colors"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                    <div className="relative">
                    <Input
                        type={isPasswordVisible ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-zinc-950 border-zinc-800 text-gray-200 focus:border-red-500/50 transition-colors pr-10"
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                        {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    </div>
                </div>
                
                <motion.div 
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="pt-4"
                              >
                    <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-semibold py-2 rounded-lg transition-all duration-300 shadow-lg shadow-red-900/20",
                        isLoading && "opacity-70 cursor-not-allowed"
                    )}
                    >
                        {isLoading ? "Verifying..." : (
                            <span className="flex items-center justify-center">
                                Access Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                            </span>
                        )}
                    </Button>
                </motion.div>
                </form>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
