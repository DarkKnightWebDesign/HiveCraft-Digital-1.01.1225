import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingLayout } from "@/components/marketing/layout";
import { ArrowRight, Search, Palette, Hammer, Rocket, HeartHandshake, CheckCircle2, MessageSquare, Eye } from "lucide-react";

const processSteps = [
  {
    number: "01",
    icon: Search,
    title: "Discover",
    description: "We start by understanding your business, goals, and target audience. Through in-depth consultations, we gather requirements and define project scope.",
    activities: [
      "Initial consultation call",
      "Business goals analysis",
      "Competitor research",
      "Technical requirements gathering",
      "Project scope definition",
    ],
    deliverables: "Project brief & proposal",
    duration: "1-2 weeks",
    approval: false,
  },
  {
    number: "02",
    icon: Palette,
    title: "Design",
    description: "Our design team creates wireframes and visual mockups that align with your brand. We iterate based on your feedback until the design is perfect.",
    activities: [
      "Wireframe creation",
      "UI/UX design",
      "Brand alignment review",
      "Responsive layouts",
      "Design system development",
    ],
    deliverables: "Full design mockups",
    duration: "2-4 weeks",
    approval: true,
  },
  {
    number: "03",
    icon: Hammer,
    title: "Build",
    description: "Development begins with the approved designs. We build using modern technologies, ensuring performance, security, and scalability.",
    activities: [
      "Frontend development",
      "Backend integration",
      "Database setup",
      "Third-party integrations",
      "Quality assurance testing",
    ],
    deliverables: "Staging site preview",
    duration: "4-8 weeks",
    approval: true,
  },
  {
    number: "04",
    icon: Rocket,
    title: "Launch",
    description: "After final testing and your approval, we deploy your site to production. We ensure a smooth launch with monitoring and support.",
    activities: [
      "Final review & testing",
      "Performance optimization",
      "SEO implementation",
      "Domain & hosting setup",
      "Go-live deployment",
    ],
    deliverables: "Live website",
    duration: "1 week",
    approval: true,
  },
  {
    number: "05",
    icon: HeartHandshake,
    title: "Care",
    description: "Our relationship doesn't end at launch. We provide ongoing support, maintenance, and optimization to keep your site performing at its best.",
    activities: [
      "Monthly maintenance",
      "Security updates",
      "Performance monitoring",
      "Content updates",
      "Growth optimization",
    ],
    deliverables: "Monthly reports",
    duration: "Ongoing",
    approval: false,
  },
];

export default function Process() {
  return (
    <MarketingLayout>
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-xs uppercase tracking-wider" data-testid="badge-process">
              Our Process
            </Badge>
            <h1 className="font-heading font-bold text-4xl lg:text-5xl xl:text-6xl mb-6" data-testid="text-process-title">
              A Structured Approach
              <span className="block text-gold-gradient">From Concept to Launch</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-process-description">
              Our proven five-stage process ensures quality, transparency, 
              and your active involvement at every step.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute left-[50%] top-0 bottom-0 w-0.5 bg-border" />
            
            <div className="space-y-24">
              {processSteps.map((step, index) => (
                <div
                  key={step.number}
                  className={`relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}
                  data-testid={`process-step-${index}`}
                >
                  <div className={`${index % 2 === 1 ? "lg:order-2 lg:pl-16" : "lg:pr-16"}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="font-mono text-sm text-primary">{step.number}</span>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      {step.approval && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          Approval Gate
                        </Badge>
                      )}
                    </div>
                    <h2 className="font-heading font-bold text-3xl mb-4">{step.title}</h2>
                    <p className="text-muted-foreground mb-6">{step.description}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Deliverable:</span>
                        <span className="ml-2 font-medium">{step.deliverables}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="ml-2 font-medium">{step.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`${index % 2 === 1 ? "lg:order-1 lg:pr-16" : "lg:pl-16"}`}>
                    <Card className="border-primary/20" data-testid={`card-step-${index}-activities`}>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          Key Activities
                        </h3>
                        <ul className="space-y-3">
                          {step.activities.map((activity, aIndex) => (
                            <li key={aIndex} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="hidden lg:flex absolute left-1/2 top-6 -translate-x-1/2 w-10 h-10 rounded-full bg-card border-2 border-primary items-center justify-center gold-glow z-10">
                    <span className="font-heading font-bold text-sm text-primary">{index + 1}</span>
                  </div>
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
              <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-6" data-testid="text-portal-title">
                Track Progress in Real-Time
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Our client portal keeps you informed at every stage. View progress, 
                review previews, provide feedback, and approve milestones—all in one place.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  { icon: Eye, text: "Preview your site before launch" },
                  { icon: MessageSquare, text: "Direct communication with your team" },
                  { icon: CheckCircle2, text: "Approve designs and milestones" },
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/portal">
                <Button className="gap-2" data-testid="button-portal-access">
                  Access Client Portal
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="relative aspect-video rounded-lg bg-card border border-border overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Eye className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Client Portal Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-6" data-testid="text-process-cta-title">
            Ready to Begin?
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Start your journey with a free consultation. We'll discuss your 
            project and outline the path forward.
          </p>
          <Link href="/contact">
            <Button size="lg" className="gap-2" data-testid="button-process-cta">
              Schedule Your Consultation
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
