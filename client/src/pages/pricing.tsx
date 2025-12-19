import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingLayout } from "@/components/marketing/layout";
import { ArrowRight, Check, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const pricingTiers = [
  {
    name: "Launch",
    description: "Perfect for startups and small businesses getting online",
    monthlyPrice: 199,
    setupFee: 2500,
    popular: false,
    features: [
      { text: "5-page responsive website", included: true },
      { text: "Custom design", included: true },
      { text: "Mobile optimization", included: true },
      { text: "Basic SEO setup", included: true },
      { text: "Contact form", included: true },
      { text: "SSL certificate", included: true },
      { text: "Monthly maintenance", included: true },
      { text: "Email support", included: true },
      { text: "CMS access", included: false },
      { text: "E-commerce features", included: false },
      { text: "Custom integrations", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Growth",
    description: "For growing businesses needing more features and flexibility",
    monthlyPrice: 399,
    setupFee: 5000,
    popular: true,
    features: [
      { text: "Up to 15 pages", included: true },
      { text: "Custom design", included: true },
      { text: "Mobile optimization", included: true },
      { text: "Advanced SEO", included: true },
      { text: "Contact & booking forms", included: true },
      { text: "SSL certificate", included: true },
      { text: "Monthly maintenance", included: true },
      { text: "Priority email & chat support", included: true },
      { text: "CMS access", included: true },
      { text: "Blog integration", included: true },
      { text: "Analytics dashboard", included: true },
      { text: "2 third-party integrations", included: true },
    ],
  },
  {
    name: "Scale",
    description: "Enterprise solutions for maximum performance and customization",
    monthlyPrice: 799,
    setupFee: 10000,
    popular: false,
    features: [
      { text: "Unlimited pages", included: true },
      { text: "Premium custom design", included: true },
      { text: "Mobile optimization", included: true },
      { text: "Enterprise SEO", included: true },
      { text: "Advanced forms & automation", included: true },
      { text: "SSL certificate", included: true },
      { text: "Weekly maintenance", included: true },
      { text: "24/7 priority support", included: true },
      { text: "Full CMS access", included: true },
      { text: "E-commerce ready", included: true },
      { text: "Custom integrations", included: true },
      { text: "Dedicated account manager", included: true },
    ],
  },
];

const faqs = [
  {
    question: "What's included in the setup fee?",
    answer: "The setup fee covers initial design, development, content migration, and launch. It's a one-time cost that ensures your site is built to the highest standards.",
  },
  {
    question: "Can I switch plans later?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. We'll prorate any differences and ensure a smooth transition.",
  },
  {
    question: "What if I need custom features?",
    answer: "We offer custom development services for unique requirements. Contact us to discuss your specific needs and get a tailored quote.",
  },
  {
    question: "Is there a minimum contract period?",
    answer: "Our managed plans are month-to-month with no long-term commitment required. You can cancel with 30 days notice.",
  },
];

export default function Pricing() {
  return (
    <MarketingLayout>
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-xs uppercase tracking-wider" data-testid="badge-pricing">
              Pricing
            </Badge>
            <h1 className="font-heading font-bold text-4xl lg:text-5xl xl:text-6xl mb-6" data-testid="text-pricing-title">
              Transparent Pricing
              <span className="block text-gold-gradient">for Every Stage</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-pricing-description">
              Choose the plan that fits your business. All plans include our 
              signature quality and dedicated support.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card
                key={tier.name}
                className={`relative ${tier.popular ? "border-primary gold-glow" : ""}`}
                data-testid={`card-pricing-${tier.name.toLowerCase()}`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="font-heading text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="font-heading font-bold text-4xl text-primary">
                        ${tier.monthlyPrice}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      + ${tier.setupFee.toLocaleString()} setup fee
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, fIndex) => (
                      <li
                        key={fIndex}
                        className={`flex items-start gap-2 text-sm ${
                          !feature.included ? "text-muted-foreground" : ""
                        }`}
                      >
                        <Check
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            feature.included ? "text-primary" : "text-muted-foreground/30"
                          }`}
                        />
                        <span className={!feature.included ? "line-through" : ""}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact">
                    <Button
                      className="w-full gap-2"
                      variant={tier.popular ? "default" : "outline"}
                      data-testid={`button-pricing-${tier.name.toLowerCase()}`}
                    >
                      Get Started
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-card/50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-4" data-testid="text-faq-title">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Have questions? We've got answers.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} data-testid={`card-faq-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-6" data-testid="text-pricing-cta-title">
            Need a Custom Solution?
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Have unique requirements? Let's discuss a tailored package 
            that fits your specific needs.
          </p>
          <Link href="/contact">
            <Button size="lg" className="gap-2" data-testid="button-pricing-cta">
              Request Custom Quote
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
