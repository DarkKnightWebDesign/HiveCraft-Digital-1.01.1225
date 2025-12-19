import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingLayout } from "@/components/marketing/layout";
import { ArrowRight, Globe, Monitor, ShoppingCart, Code2, Check } from "lucide-react";

const services = [
  {
    id: "managed",
    icon: Globe,
    title: "Managed Websites",
    tagline: "Hive Sites",
    description: "Professionally designed and continuously maintained websites that grow with your business. We handle everything from hosting to updates.",
    features: [
      "Custom responsive design",
      "Monthly maintenance & updates",
      "24/7 uptime monitoring",
      "SSL & security management",
      "Performance optimization",
      "Content updates included",
      "SEO best practices",
      "Analytics dashboard",
    ],
    idealFor: "Small to medium businesses wanting a hassle-free web presence",
    startingPrice: "From $199/month",
  },
  {
    id: "custom",
    icon: Monitor,
    title: "Custom Websites",
    tagline: "Hive Custom",
    description: "Bespoke website solutions designed from scratch to perfectly match your brand identity and specific business requirements.",
    features: [
      "Fully custom design & development",
      "Brand-aligned UI/UX",
      "Advanced animations & interactions",
      "CMS integration",
      "Third-party integrations",
      "Mobile-first approach",
      "Accessibility compliance",
      "Training & documentation",
    ],
    idealFor: "Businesses needing unique, brand-specific web experiences",
    startingPrice: "From $5,000",
  },
  {
    id: "stores",
    icon: ShoppingCart,
    title: "Online Stores",
    tagline: "Hive Commerce",
    description: "E-commerce platforms built for conversion, with seamless shopping experiences, secure payments, and inventory management.",
    features: [
      "Product catalog management",
      "Secure payment processing",
      "Inventory tracking",
      "Order management system",
      "Customer accounts",
      "Shipping integrations",
      "Multi-currency support",
      "Sales analytics",
    ],
    idealFor: "Retailers and brands selling products online",
    startingPrice: "From $8,000",
  },
  {
    id: "apps",
    icon: Code2,
    title: "Web Applications",
    tagline: "Hive Apps",
    description: "Complex web applications with custom functionality, user authentication, data management, and scalable architecture.",
    features: [
      "Custom application development",
      "User authentication & roles",
      "Database design & management",
      "API development",
      "Real-time features",
      "Cloud infrastructure",
      "Automated testing",
      "Ongoing maintenance",
    ],
    idealFor: "Businesses needing custom software solutions",
    startingPrice: "From $15,000",
  },
];

export default function Services() {
  return (
    <MarketingLayout>
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-xs uppercase tracking-wider" data-testid="badge-services">
              Our Services
            </Badge>
            <h1 className="font-heading font-bold text-4xl lg:text-5xl xl:text-6xl mb-6" data-testid="text-services-title">
              Digital Solutions
              <span className="block text-gold-gradient">Built for Growth</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-services-description">
              From managed websites to complex web applications, we deliver 
              precision-built solutions that drive results.
            </p>
          </div>

          <div className="space-y-24">
            {services.map((service, index) => (
              <div
                key={service.id}
                id={service.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
                data-testid={`service-section-${service.id}`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                      {service.tagline}
                    </Badge>
                  </div>
                  <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-4">
                    {service.title}
                  </h2>
                  <p className="text-muted-foreground text-lg mb-6">
                    {service.description}
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    <span className="font-medium text-foreground">Ideal for:</span> {service.idealFor}
                  </p>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="font-heading font-bold text-2xl text-primary">
                      {service.startingPrice}
                    </span>
                  </div>
                  <Link href="/contact">
                    <Button className="gap-2" data-testid={`button-${service.id}-cta`}>
                      Get Started
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <Card className="border-primary/20" data-testid={`card-${service.id}-features`}>
                    <CardHeader>
                      <CardTitle className="text-lg">What's Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {service.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-card/50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-6" data-testid="text-services-cta-title">
            Not Sure Which Service Fits?
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Book a free consultation and we'll help you find the perfect solution 
            for your business needs.
          </p>
          <Link href="/contact">
            <Button size="lg" className="gap-2" data-testid="button-services-consultation">
              Schedule Consultation
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
