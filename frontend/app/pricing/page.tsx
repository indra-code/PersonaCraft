"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const pricingPlans = [
    {
      name: "Basic",
      description: "Perfect for individuals getting started",
      price: billingCycle === "monthly" ? 9.99 : 99.99,
      features: [
        "5 speech analysis sessions per month",
        "Basic feedback on presentations",
        "Limited interview preparation",
        "Email support",
      ],
      cta: "Get Started",
      popular: false,
      color: "from-blue-500 to-cyan-400",
      url: "/dashboard/speech",
    },
    {
      name: "Pro",
      description: "Ideal for professionals and job seekers",
      price: billingCycle === "monthly" ? 19.99 : 199.99,
      features: [
        "Unlimited speech analysis sessions",
        "Advanced presentation feedback",
        "Comprehensive interview preparation",
        "Progress tracking and analytics",
        "Priority email support",
        "Access to premium templates",
      ],
      cta: "Upgrade to Pro",
      popular: true,
      color: "from-indigo-500 to-purple-500",
      url: "/dashboard/speech",
    },
    {
      name: "Enterprise",
      description: "For teams and organizations",
      price: billingCycle === "monthly" ? 49.99 : 499.99,
      features: [
        "Everything in Pro plan",
        "Team management dashboard",
        "Custom AI training for your industry",
        "Advanced analytics and reporting",
        "Dedicated account manager",
        "API access for integrations",
        "24/7 priority support",
      ],
      cta: "Contact Sales",
      popular: false,
      color: "from-purple-500 to-pink-500",
      url: "/contact",
    },
  ];

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
      {/* Header Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-lg text-blue-100/80 mb-8">
            Select the perfect plan to enhance your communication skills and
            boost your confidence
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span
              className={`text-sm font-medium ${
                billingCycle === "monthly" ? "text-white" : "text-blue-100/60"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingCycle(
                  billingCycle === "monthly" ? "yearly" : "monthly"
                )
              }
              className="relative inline-flex h-6 w-12 items-center rounded-full bg-blue-900/50 border border-blue-700/50 transition-colors focus:outline-none"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                  billingCycle === "yearly" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                billingCycle === "yearly" ? "text-white" : "text-blue-100/60"
              }`}
            >
              Yearly
              <span className="ml-1.5 inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-2 py-0.5 text-xs font-medium text-white">
                Save 20%
              </span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {pricingPlans.map((plan) => (
            <motion.div key={plan.name} variants={item} className="flex">
              <Card
                className={`bg-slate-800/40 backdrop-blur-sm border-slate-700/50 overflow-hidden group hover:border-${
                  plan.color.split(" ")[0]
                }/50 transition-all duration-300 hover:shadow-lg hover:shadow-${
                  plan.color.split(" ")[0]
                }/10 ${
                  plan.popular
                    ? "relative border-indigo-500/50 ring-2 ring-indigo-500/20"
                    : ""
                } flex flex-col w-full`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-xl md:text-2xl text-white">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-blue-100/70">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 flex-grow">
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      ${plan.price}
                    </span>
                    <span className="text-blue-100/70 ml-2">
                      /{billingCycle === "monthly" ? "month" : "year"}
                    </span>
                  </div>
                  <ul className="space-y-3 text-blue-100/80">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check
                          size={18}
                          className="text-cyan-400 mr-2 mt-0.5 shrink-0"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="relative z-10 mt-auto">
                  <Link href={plan.url} className="w-full">
                    <Button
                      className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white`}
                    >
                      <span className="flex items-center">
                        {plan.cta}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </span>
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto rounded-full"></div>
        </motion.div>

        <div className="max-w-3xl mx-auto grid gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6"
          >
            <h3 className="text-xl font-medium text-white mb-2">
              Can I switch plans later?
            </h3>
            <p className="text-blue-100/70">
              Yes, you can upgrade or downgrade your plan at any time. Changes
              to your subscription will be prorated.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6"
          >
            <h3 className="text-xl font-medium text-white mb-2">
              Is there a free trial?
            </h3>
            <p className="text-blue-100/70">
              We offer a 7-day free trial on all plans. No credit card required
              to start your trial.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6"
          >
            <h3 className="text-xl font-medium text-white mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-blue-100/70">
              We accept all major credit cards, PayPal, and bank transfers for
              Enterprise plans.
            </p>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 md:p-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Still have questions?
          </h2>
          <p className="text-lg text-blue-100/80 mb-8">
            Our team is here to help you find the perfect plan for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-slate-900 hover:bg-blue-100">
              Contact Sales
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              View Documentation
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;
