import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingLayout } from "@/components/marketing/layout";
import { ArrowRight, Monitor, ShoppingCart, Code2, Globe, CheckCircle2, Zap, Shield, Users } from "lucide-react";

const services = [
  {
    icon: Globe,
    title: "Managed Websites",
    description: "Professionally maintained websites with ongoing support, updates, and performance optimization.",
    href: "/services#managed",
  },
  {
    icon: Monitor,
    title: "Custom Websites",
    description: "Bespoke web solutions designed and built from the ground up to match your unique vision.",
    href: "/services#custom",
  },
  {
    icon: ShoppingCart,
    title: "Online Stores",
    description: "E-commerce platforms built for conversion, with seamless payment and inventory management.",
    href: "/services#stores",
  },
  {
    icon: Code2,
    title: "Web Applications",
    description: "Complex web apps with custom functionality, integrations, and scalable architecture.",
    href: "/services#apps",
  },
];

const processSteps = [
  { name: "Discover", description: "Understanding your goals and requirements" },
  { name: "Design", description: "Crafting the visual experience" },
  { name: "Build", description: "Developing with precision" },
  { name: "Launch", description: "Going live with confidence" },
  { name: "Care", description: "Ongoing support and growth" },
];

const stats = [
  { value: "50+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "24/7", label: "Support Available" },
  { value: "5yr", label: "Industry Experience" },
];

export default function Home() {
  return (
    <MarketingLayout>
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32 text-center">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 text-xs uppercase tracking-wider" data-testid="badge-hero">
            Web Design & Development
          </Badge>
          
          <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl mb-6 leading-tight" data-testid="text-hero-title">
            Precision-Built Digital Systems
            <span className="block text-gold-gradient mt-2">Running in Sync</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10" data-testid="text-hero-description">
            We craft high-performance websites and web applications with structure, 
            collaboration, and purpose. Your vision, expertly executed.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="gap-2" data-testid="button-hero-cta">
                Start a Project
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/portfolio">
              <Button size="lg" variant="outline" data-testid="button-hero-secondary">
                View Our Work
              </Button>
            </Link>
          </div>
          
          <div className="mt-16 flex items-center justify-center gap-8 flex-wrap">
            {stats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-${index}`}>
                <div className="font-heading font-bold text-2xl lg:text-3xl text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-card/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-4" data-testid="text-services-title">
              What We Build
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive digital solutions tailored to your business needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Link key={index} href={service.href}>
                <Card className="h-full hover-elevate cursor-pointer group" data-testid={`card-service-${index}`}>
                  <CardContent className="p-6">
                    <div className="w-14 h-16 honeycomb-icon mb-4 group-hover:bg-primary/20 transition-colors">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-4" data-testid="text-process-title">
              Our Process
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A structured approach ensuring quality at every stage
            </p>
          </div>
          
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="relative text-center" data-testid={`process-step-${index}`}>
                  <div className="relative z-10 w-16 h-[72px] mx-auto honeycomb-step mb-4">
                    <span className="font-heading font-bold text-primary text-lg">{index + 1}</span>
                  </div>
                  <h3 className="font-heading font-semibold mb-2">{step.name}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-card/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-6" data-testid="text-why-title">
                Why Choose HiveCraft?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                We combine technical expertise with creative vision to deliver 
                digital solutions that drive real business results.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: Zap, text: "Fast, performance-optimized solutions" },
                  { icon: Shield, text: "Secure and reliable infrastructure" },
                  { icon: Users, text: "Dedicated project team support" },
                  { icon: CheckCircle2, text: "Transparent process with approvals" },
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3" data-testid={`feature-${index}`}>
                    <div className="w-10 h-12 honeycomb-icon">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="w-64 h-72 honeycomb-stat flex items-center justify-center gold-glow">
                <div className="text-center">
                  <div className="font-heading font-bold text-6xl text-primary mb-2">98%</div>
                  <div className="text-muted-foreground text-sm">Client Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-6" data-testid="text-cta-title">
            Ready to Start Your Project?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
            Let's discuss how we can bring your vision to life with our 
            precision-built digital solutions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="gap-2" data-testid="button-cta-contact">
                Get in Touch
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" data-testid="button-cta-pricing">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
