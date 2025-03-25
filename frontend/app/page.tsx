"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X, Mic, Video, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RainbowButton } from "@/components/ui/rainbow-button";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-slate-900/90 backdrop-blur-md shadow-lg border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"
            >
              PersonaCraft
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-white/90 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/pricing"
                className="text-white/90 hover:text-white transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/"
                className="text-white/90 hover:text-white transition-colors"
              >
                About
              </Link>
              <Link
                href="/"
                className="text-white/90 hover:text-white transition-colors"
              >
                Contact Us
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4"
            >
              <div className="flex flex-col space-y-4">
                <Link
                  href="/"
                  className="text-white/90 hover:text-white transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  className="text-white/90 hover:text-white transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/about"
                  className="text-white/90 hover:text-white transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-white/90 hover:text-white transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact Us
                </Link>
                <div className="flex flex-col space-y-2 pt-2">
                  <Button
                    variant="ghost"
                    className="justify-center text-white hover:bg-white/10"
                  >
                    Login
                  </Button>
                  <Button className="justify-center bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white">
                    Sign Up
                  </Button>
                </div>
              </div>
            </motion.nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200 bg-clip-text text-transparent drop-shadow-sm">
              Enhance Your Soft Skills using AI
            </h1>
            <p className="text-lg md:text-xl text-blue-100/90 mb-8 leading-relaxed">
              Enhance your communication skills, overcome anxiety, and present
              with confidence using our AI-powered analysis and feedback.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative inline-block group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-200 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-500/20 animate-shimmer"></div>
              <Link href="/dashboard/speech">
                <Button className="relative bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-blue-500/50 transition-all duration-200 hover:-translate-y-0.5">
                  <span className="relative z-10 flex items-center font-medium">
                    Get Started
                    <ChevronRight
                      className="ml-2 group-hover:translate-x-1 transition-transform duration-200"
                      size={20}
                    />
                  </span>
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/0 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase mb-2 block">
              Our Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Features Available
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto rounded-full"></div>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          >
            {/* Feature Card 1 */}
            <motion.div variants={item}>
              <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50 overflow-hidden group hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-400 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Mic size={24} className="text-white" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl text-white">
                    AI Speech & Presentation Analysis
                  </CardTitle>
                  <CardDescription className="text-blue-100/70">
                    Get real-time feedback on your speech patterns, pacing, and
                    delivery
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ul className="space-y-2 text-blue-100/80">
                    <li className="flex items-start">
                      <ChevronRight
                        size={18}
                        className="text-cyan-400 mr-2 mt-0.5"
                      />
                      <span>
                        Analyze speech patterns and identify areas for
                        improvement
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight
                        size={18}
                        className="text-cyan-400 mr-2 mt-0.5"
                      />
                      <span>
                        Receive personalized tips to enhance your presentation
                        skills
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight
                        size={18}
                        className="text-cyan-400 mr-2 mt-0.5"
                      />
                      <span>
                        Track your progress over time with detailed metrics
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature Card 2 */}
            <motion.div variants={item}>
              <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50 overflow-hidden group hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-400 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Video size={24} className="text-white" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl text-white">
                    AI Interview Analysis
                  </CardTitle>
                  <CardDescription className="text-blue-100/70">
                    Practice interviews and receive AI-powered feedback to
                    improve
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ul className="space-y-2 text-blue-100/80">
                    <li className="flex items-start">
                      <ChevronRight
                        size={18}
                        className="text-cyan-400 mr-2 mt-0.5"
                      />
                      <span>
                        Simulate real interview scenarios with AI interviewers
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight
                        size={18}
                        className="text-cyan-400 mr-2 mt-0.5"
                      />
                      <span>
                        Get feedback on your responses, body language, and
                        confidence
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight
                        size={18}
                        className="text-cyan-400 mr-2 mt-0.5"
                      />
                      <span>
                        Learn industry-specific interview techniques and
                        strategies
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-blue-900/30 to-slate-900/50"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Ready to Boost Your Confidence?
            </h2>
            <p className="text-lg text-blue-100/80 mb-8">
              Join thousands of professionals who have transformed their
              communication skills with our AI-powered platform.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/dashboard/speech">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white text-lg px-8 py-6 rounded-full">
                  Start Free Trial
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950/80 backdrop-blur-sm py-12 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link
                href="/"
                className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"
              >
                PersonaCraft
              </Link>
              <p className="mt-4 text-blue-100/60 text-sm">
                Empowering individuals to communicate with confidence through
                AI-powered analysis and feedback.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-blue-100/60 hover:text-blue-300 transition-colors text-sm"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-blue-100/60 hover:text-blue-300 transition-colors text-sm"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-blue-100/60 hover:text-blue-300 transition-colors text-sm"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-blue-100/60 hover:text-blue-300 transition-colors text-sm"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Features</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-blue-100/60 hover:text-blue-300 transition-colors text-sm"
                  >
                    Speech Analysis
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-blue-100/60 hover:text-blue-300 transition-colors text-sm"
                  >
                    Interview Preparation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-blue-100/60 hover:text-blue-300 transition-colors text-sm"
                  >
                    Presentation Coaching
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-blue-100/60 hover:text-blue-300 transition-colors text-sm"
                  >
                    Progress Tracking
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-blue-100/60 hover:text-blue-300 transition-colors text-sm"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-blue-100/60 hover:text-blue-300 transition-colors text-sm"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-blue-100/60 hover:text-blue-300 transition-colors text-sm"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p className="text-blue-100/60 text-sm">
              © {new Date().getFullYear()} PersonaCraft. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
